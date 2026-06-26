import { Children, createContext, type HTMLAttributes, type MouseEvent, type Ref, use, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Point } from 'spase'

import { useInterval } from '../hooks/useInterval.js'
import { useLatest } from '../hooks/useLatest.js'
import { usePrevious } from '../hooks/usePrevious.js'
import { useSize } from '../hooks/useSize.js'
import { asComponentDict } from '../utils/asComponentDict.js'
import { asStyleDict } from '../utils/asStyleDict.js'
import { Styled } from '../utils/Styled.js'
import { styles } from '../utils/styles.js'

// Translation (in px) is considered settled when within this distance of the
// target.
const TRANSLATION_EPSILON = 0.5

// Velocity (in px/frame) is considered settled when below this magnitude.
const VELOCITY_EPSILON = 0.02

// Converts pointer velocity (px/ms) into the per-frame velocity the spring loop
// expects (px/frame at 60fps).
const MS_PER_FRAME = 1000 / 60

/**
 * Minimum distance (in px) the pointer must travel between pointer-down and
 * pointer-up for the gesture to be classified as a drag. Movements within this
 * threshold are treated as a click and are allowed to propagate.
 */
const DRAG_START_THRESHOLD_PX = 5

/**
 * Resistance applied when the user drags past the first or last item. `0`
 * lets the overshoot track the pointer 1:1 (no resistance); `1` clamps hard
 * at the boundary (max resistance, no overshoot). Values in between produce
 * a rubber-band effect—higher means more resistance.
 */
const OVERSCROLL_RESISTANCE = 0.7

// Per-frame velocity decay of the release spring. Lower = stronger drag, faster
// settle.
const SPRING_FRICTION = 0.5

// Extra velocity damping applied each frame while the spring is past `[min,
// max]`. Lower = less bounce when the spring crosses the edge.
const SPRING_OVERSHOOT_DAMPING = 0.9

// Spring force pulling translation toward the target index. Higher = snappier,
// more overshoot.
const SPRING_STIFFNESS = 0.08

/**
 * Maximum time gap in ms between the last pointer move and the pointer release
 * for the gesture to register as a swipe. If the pointer was held stationary
 * longer than this before release, no swipe is detected and the release falls
 * back to translation-based snapping.
 */
const SWIPE_VELOCITY_WINDOW_MS = 100

/**
 * Minimum axial pointer velocity (in px/frame) at release for the gesture to
 * register as a swipe. A detected swipe advances the index by one in the swipe
 * direction, regardless of how far the translation has traveled. Authored as
 * 0.4 px/ms and expressed in px/frame to match the tracker's release velocity.
 */
const SWIPE_VELOCITY_THRESHOLD_PX_FRAME = 0.4 * MS_PER_FRAME

/**
 * A headless carousel component that displays a list of items and lets the user
 * drag (mouse or touch) to switch between them.
 *
 * Notable features:
 *   - Supports horizontal and vertical orientations.
 *   - Supports auto-advancing to the next item after a specified interval.
 *   - Supports tracking item exposure (0-1) to determine how much of the
 *     current item is visible in the viewport.
 *   - Supports rubber-band resistance when dragging past the first or last
 *     item.
 *
 * The root element is rendered with `role='region'`. To meet accessibility
 * requirements for landmark regions, pass `aria-label` (or `aria-labelledby`)
 * so the region has an accessible name.
 *
 * @exports Carousel.Content Component for the list holding all items.
 * @exports Carousel.Item Component containing each item.
 * @exports Carousel.Viewport Component for the viewport.
 * @exports useCarouselItem Hook for reading the current item's index, exposure,
 *                          and active state from within an item's subtree.
 */
export function Carousel({
  ref,
  autoAdvanceInterval = 0,
  children,
  dragSpeed = 1.0,
  index = 0,
  orientation = 'horizontal',
  shouldTrackExposure = false,
  onAutoAdvancePause,
  onAutoAdvanceResume,
  onIndexChange,
  ...props
}: Carousel.Props) {
  const components = asComponentDict(children, {
    content: Carousel.Content,
    item: Carousel.Item,
    viewport: Carousel.Viewport,
  })

  const items = Children.toArray(components.content?.props.children)
  const itemCount = items.length

  const {
    clickHandler,
    contentRef,
    exposures,
    safeIndex,
    viewportRef,
    isDragging,
  } = useGesture({
    dragSpeed,
    index,
    itemCount,
    orientation,
    shouldTrackExposure,
    onIndexChange,
  })

  useAutoAdvance({
    index: safeIndex,
    interval: autoAdvanceInterval,
    itemCount,
    isDragging,
    onIndexChange,
    onPause: onAutoAdvancePause,
    onResume: onAutoAdvanceResume,
  })

  return (
    <div {...props} ref={ref} role='region' onClick={clickHandler}>
      <Styled
        ref={viewportRef}
        style={styles(FIXED_STYLES.viewport, {
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: itemCount > 1 ? (orientation === 'horizontal' ? 'pan-y' : 'pan-x') : 'auto',
        })}
        element={components.viewport ?? <Carousel.Viewport/>}
      >
        <Styled
          ref={contentRef}
          style={{
            ...FIXED_STYLES.content,
            flexDirection: orientation === 'horizontal' ? 'row' : 'column',
          }}
          element={components.content ?? <Carousel.Content/>}
        >
          {items.map((child, idx) => {
            const key = (child as any).key ?? idx
            const exposure = exposures?.[idx]
            const isActive = idx === safeIndex

            return (
              <Carousel.ItemContext
                key={key}
                value={{ exposure, index: idx, isActive }}
              >
                <Styled
                  style={FIXED_STYLES.itemContainer}
                  aria-hidden={!isActive}
                  element={components.item ?? <Carousel.Item/>}
                >
                  {child}
                </Styled>
              </Carousel.ItemContext>
            )
          })}
        </Styled>
      </Styled>
    </div>
  )
}

type GestureState = 'axis' | 'cross' | 'idle' | 'pending'

type PointerState = {
  activeId: number | undefined
  didDrag: boolean
  gesture: GestureState
  startAxial: number
  startPosition: Point.Point
  startTranslation: number
}

type StateSnapshot = {
  dragSpeed: number
  itemCount: number
  maxTranslation: number
  minTranslation: number
  orientation: Carousel.Orientation
  safeIndex: number
  viewportLength: number
  shouldTrackExposure: boolean
}

type UseDragParams = {
  dragSpeed: number
  index: number
  itemCount: number
  orientation: Carousel.Orientation
  shouldTrackExposure: boolean
  onIndexChange?: (index: number) => void
}

function useGesture({
  dragSpeed,
  index,
  itemCount,
  orientation,
  shouldTrackExposure,
  onIndexChange,
}: UseDragParams) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const translationRef = useRef(0)
  const velocityRef = useRef(0)
  const targetTranslationRef = useRef(0)
  const rafRef = useRef(0)
  const swipeTrackerRef = useRef(_createSwipeTracker(SWIPE_VELOCITY_WINDOW_MS))
  const pointerRef = useRef<PointerState>({ activeId: undefined, didDrag: false, gesture: 'idle', startAxial: 0, startPosition: Point.zero, startTranslation: 0 })
  const prevViewportLengthRef = useRef(0)
  const indexChangeHandlerRef = useLatest(onIndexChange)

  const [exposures, setExposures] = useState<number[] | undefined>()
  const [isDragging, setIsDragging] = useState(false)

  const { height: vh, width: vw } = useSize(viewportRef)
  const viewportLength = _tangential(vw, vh, orientation)

  const clampedIndex = _clampIndex(index, itemCount)
  const minTranslation = -viewportLength * Math.max(0, itemCount - 1)
  const maxTranslation = 0

  const snapshotRef = useRef<StateSnapshot>(undefined!)
  snapshotRef.current = {
    dragSpeed,
    itemCount,
    maxTranslation,
    minTranslation,
    orientation,
    safeIndex: clampedIndex,
    viewportLength,
    shouldTrackExposure,
  }

  const clickHandler = (event: MouseEvent) => {
    if (!pointerRef.current.didDrag) return

    event.stopPropagation()
    pointerRef.current.didDrag = false
  }

  const updateTransform = () => {
    const content = contentRef.current

    if (content) {
      const translation = translationRef.current
      content.style.transform = snapshotRef.current.orientation === 'horizontal'
        ? `translate3d(${translation}px,0,0)`
        : `translate3d(0,${translation}px,0)`
    }
  }

  const updateExposures = () => {
    const snapshot = snapshotRef.current
    const next = snapshot.shouldTrackExposure
      ? _computeExposures(translationRef.current, snapshot.viewportLength, snapshot.itemCount)
      : undefined

    setExposures(prev => _areExposuresEqual(prev, next) ? prev : next)
  }

  const render = () => {
    updateTransform()
    updateExposures()
  }

  const startTicking = () => {
    if (rafRef.current) return

    rafRef.current = requestAnimationFrame(tick)
  }

  const stopTicking = () => {
    if (!rafRef.current) return

    cancelAnimationFrame(rafRef.current)
    rafRef.current = 0
  }

  const tick = () => {
    const snapshot = snapshotRef.current
    const targetPos = targetTranslationRef.current
    const force = (targetPos - translationRef.current) * SPRING_STIFFNESS
    velocityRef.current = velocityRef.current * SPRING_FRICTION + force
    translationRef.current += velocityRef.current

    if (translationRef.current > snapshot.maxTranslation || translationRef.current < snapshot.minTranslation) {
      velocityRef.current *= SPRING_OVERSHOOT_DAMPING
    }

    const isSettled = Math.abs(velocityRef.current) < VELOCITY_EPSILON && Math.abs(targetPos - translationRef.current) < TRANSLATION_EPSILON

    if (isSettled) {
      translationRef.current = targetPos
      velocityRef.current = 0
      rafRef.current = 0
      render()

      return
    }

    render()
    rafRef.current = requestAnimationFrame(tick)
  }

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const pointerDownHandler = (e: PointerEvent) => {
      const snap = snapshotRef.current

      if (!e.isPrimary || e.button !== 0) return
      if (snap.itemCount <= 1) return
      if (pointerRef.current.activeId !== undefined) return

      const axial = _tangential(e.clientX, e.clientY, snap.orientation)

      pointerRef.current.activeId = e.pointerId
      pointerRef.current.didDrag = false
      pointerRef.current.gesture = 'pending'
      pointerRef.current.startAxial = axial
      pointerRef.current.startPosition = Point.make(e.clientX, e.clientY)
      pointerRef.current.startTranslation = translationRef.current

      swipeTrackerRef.current.reset(axial)
    }

    const pointerMoveHandler = (e: PointerEvent) => {
      if (pointerRef.current.activeId !== e.pointerId) return
      if (pointerRef.current.gesture === 'idle' || pointerRef.current.gesture === 'cross') return

      const snap = snapshotRef.current
      const pointer = pointerRef.current
      const axial = _tangential(e.clientX, e.clientY, snap.orientation)

      if (pointer.gesture === 'pending') {
        const dx = Math.abs(e.clientX - pointer.startPosition.x)
        const dy = Math.abs(e.clientY - pointer.startPosition.y)
        const dAxial = _tangential(dx, dy, snap.orientation)
        const dCross = _normal(dx, dy, snap.orientation)
        const didDrag = Math.max(dAxial, dCross) >= DRAG_START_THRESHOLD_PX
        const isCross = dCross > dAxial

        if (!didDrag) return
        if (isCross) {
          pointer.gesture = 'cross'

          return
        }

        stopTicking()

        velocityRef.current = 0
        pointer.gesture = 'axis'
        pointer.startTranslation = _withoutResistance(translationRef.current, snap.minTranslation, snap.maxTranslation, OVERSCROLL_RESISTANCE)
        pointer.startAxial = axial

        viewport.setPointerCapture(e.pointerId)
        setIsDragging(true)
      }

      const delta = (axial - pointer.startAxial) * snap.dragSpeed
      const translation = pointer.startTranslation + delta

      translationRef.current = _withResistance(translation, snap.minTranslation, snap.maxTranslation, OVERSCROLL_RESISTANCE)

      render()

      if (Math.abs(delta) >= DRAG_START_THRESHOLD_PX) {
        pointer.didDrag = true
      }

      swipeTrackerRef.current.add(axial)
    }

    const pointerUpHandler = (e: PointerEvent) => {
      if (pointerRef.current.activeId !== e.pointerId) return

      if (viewport.hasPointerCapture(e.pointerId)) {
        viewport.releasePointerCapture(e.pointerId)
      }

      pointerRef.current.activeId = undefined

      const wasAxisLocked = pointerRef.current.gesture === 'axis'
      pointerRef.current.gesture = 'idle'

      if (!wasAxisLocked) {
        swipeTrackerRef.current.clear()

        return
      }

      const snap = snapshotRef.current
      const { sinceLast, velocity: swipeVelocity } = swipeTrackerRef.current.release()
      const isSwipe = sinceLast <= SWIPE_VELOCITY_WINDOW_MS && Math.abs(swipeVelocity) > SWIPE_VELOCITY_THRESHOLD_PX_FRAME

      const proposed = isSwipe
        ? snap.safeIndex + (swipeVelocity < 0 ? 1 : -1)
        : snap.viewportLength > 0 ? Math.round(-translationRef.current / snap.viewportLength) : snap.safeIndex

      const newIndex = _clampIndex(proposed, snap.itemCount)

      swipeTrackerRef.current.clear()

      targetTranslationRef.current = -snap.viewportLength * newIndex

      // Only carry release momentum that moves toward the snap target. Momentum
      // pointing away would push the content past the release position before
      // the spring reverses it, producing a visible offset before the snap.
      const seededVelocity = swipeVelocity * snap.dragSpeed
      const toTarget = targetTranslationRef.current - translationRef.current
      velocityRef.current = Math.sign(seededVelocity) === Math.sign(toTarget) ? seededVelocity : 0

      startTicking()

      setIsDragging(false)

      if (newIndex !== snap.safeIndex) {
        indexChangeHandlerRef.current?.(newIndex)
      }
    }

    const dragStartHandler = (e: DragEvent) => {
      e.preventDefault()
    }

    const touchMoveHandler = (e: TouchEvent) => {
      const gesture = pointerRef.current.gesture

      if (gesture === 'pending' || gesture === 'axis') {
        if (e.cancelable) e.preventDefault()
      }
    }

    viewport.addEventListener('dragstart', dragStartHandler)
    viewport.addEventListener('pointerdown', pointerDownHandler, { passive: true })
    viewport.addEventListener('pointermove', pointerMoveHandler, { passive: true })
    viewport.addEventListener('pointerup', pointerUpHandler, { passive: true })
    viewport.addEventListener('pointercancel', pointerUpHandler, { passive: true })
    viewport.addEventListener('touchmove', touchMoveHandler, { passive: false })

    return () => {
      stopTicking()

      viewport.removeEventListener('dragstart', dragStartHandler)
      viewport.removeEventListener('pointerdown', pointerDownHandler)
      viewport.removeEventListener('pointermove', pointerMoveHandler)
      viewport.removeEventListener('pointerup', pointerUpHandler)
      viewport.removeEventListener('pointercancel', pointerUpHandler)
      viewport.removeEventListener('touchmove', touchMoveHandler)

      pointerRef.current.activeId = undefined
      pointerRef.current.gesture = 'idle'
    }
  }, [])

  useLayoutEffect(() => {
    if (isDragging) return
    if (viewportLength <= 0) return

    const targetTranslation = -viewportLength * clampedIndex
    const lengthChanged = prevViewportLengthRef.current !== viewportLength
    const translationChanged = translationRef.current !== targetTranslation
    const hasVelocity = velocityRef.current !== 0

    prevViewportLengthRef.current = viewportLength
    targetTranslationRef.current = targetTranslation

    if (lengthChanged) {
      stopTicking()

      translationRef.current = targetTranslation
      velocityRef.current = 0

      render()
    } else if (translationChanged || hasVelocity) {
      startTicking()
    }
  }, [clampedIndex, viewportLength, isDragging, orientation, shouldTrackExposure])

  useEffect(() => {
    updateExposures()
  }, [viewportLength, itemCount, shouldTrackExposure])

  return {
    clickHandler,
    contentRef,
    exposures,
    safeIndex: clampedIndex,
    viewportRef,
    isDragging,
  }
}

type UseAutoAdvanceParams = {
  index: number
  interval: number
  itemCount: number
  isDragging: boolean
  onIndexChange?: (index: number) => void
  onPause?: () => void
  onResume?: () => void
}

function useAutoAdvance({
  index,
  interval,
  itemCount,
  isDragging,
  onIndexChange,
  onPause,
  onResume,
}: UseAutoAdvanceParams) {
  const indexChangeHandlerRef = useLatest(onIndexChange)
  const pauseHandlerRef = useLatest(onPause)
  const resumeHandlerRef = useLatest(onResume)
  const wasDragging = usePrevious(isDragging, isDragging)

  useEffect(() => {
    if (interval <= 0) return
    if (wasDragging === isDragging) return

    if (isDragging) {
      pauseHandlerRef.current?.()
    } else {
      resumeHandlerRef.current?.()
    }
  }, [isDragging, interval])

  useInterval(interval, () => {
    if (itemCount <= 1) return

    indexChangeHandlerRef.current?.((index + 1) % itemCount)
  }, {
    isEnabled: !isDragging,
  }, [index])
}

export namespace Carousel {
  /**
   * Type describing the orientation of {@link Carousel}.
   */
  export type Orientation = 'horizontal' | 'vertical'

  /**
   * Type describing the props of {@link Carousel}.
   */
  export type Props = {
    /**
     * Reference to the root element.
     */
    ref?: Ref<HTMLDivElement>

    /**
     * The interval in milliseconds to wait before automatically advancing to
     * the next item (auto loops).
     */
    autoAdvanceInterval?: number

    /**
     * The drag speed multiplier. Higher values result in faster dragging. The
     * default value is `1`.
     */
    dragSpeed?: number

    /**
     * Current item index.
     */
    index?: number

    /**
     * Orientation of the carousel.
     */
    orientation?: Orientation

    /**
     * Whether to track item exposure (0-1, 0 meaning the item is fully scrolled
     * out of view, 1 meaning the item is fully scrolled into view).
     */
    shouldTrackExposure?: boolean

    /**
     * Handler invoked when auto advance pauses. This is invoked only when
     * {@link autoAdvanceInterval} is greater than 0.
     */
    onAutoAdvancePause?: () => void

    /**
     * Handler invoked when auto advance resumes. This is invoked only when
     * {@link autoAdvanceInterval} is greater than 0.
     */
    onAutoAdvanceResume?: () => void

    /**
     * Handler invoked when the item index changes.
     *
     * @param index The item index.
     */
    onIndexChange?: (index: number) => void
  } & Omit<HTMLAttributes<HTMLDivElement>, 'onClick' | 'onPointerCancel' | 'onPointerDown' | 'onPointerMove' | 'onPointerUp' | 'role'>

  /**
   * Type describing the value provided by {@link ItemContext} for each item.
   */
  export type ItemContextValue = {
    exposure: number | undefined
    index: number
    isActive: boolean
  }

  /**
   * Context providing the current item's `index`, `exposure`, and `isActive`
   * state to each item in the carousel.
   */
  export const ItemContext = createContext<ItemContextValue | undefined>(undefined)

  /**
   * Component for the viewport of a {@link Carousel}.
   */
  export const Viewport = ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
    <div {...props}>{children}</div>
  )

  /**
   * Component for the list holding all items inside a {@link Carousel}.
   */
  export const Content = ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
    <div {...props}>{children}</div>
  )

  /**
   * Component containing each item in a {@link Carousel}.
   */
  export const Item = ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
    <div {...props}>{children}</div>
  )

  /**
   * Hook for reading the current item's `index`, `exposure`, and `isActive`
   * state from within a {@link Carousel} item's subtree.
   *
   * @throws Error if the hook is called outside of a `Carousel.Content`
   * subtree.
   */
  export function useItem(): ItemContextValue {
    const ctx = use(ItemContext)
    if (!ctx) throw Error('[etudes::Carousel] useItem is called outside of a Carousel.Content subtree')

    return ctx
  }
}

function _areExposuresEqual(a?: number[], b?: number[]): boolean {
  if (a === b) return true
  if (!a || !b || a.length !== b.length) return false

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }

  return true
}

function _computeExposures(translation: number, viewportLength: number, itemCount: number): number[] {
  if (itemCount <= 0) return []
  if (viewportLength <= 0) return new Array(itemCount).fill(0)

  const exposures: number[] = []

  for (let i = 0; i < itemCount; i++) {
    const itemStart = i * viewportLength + translation
    const itemEnd = itemStart + viewportLength
    const visibleStart = Math.max(0, itemStart)
    const visibleEnd = Math.min(viewportLength, itemEnd)
    const visible = Math.max(0, visibleEnd - visibleStart)
    const exposure = Math.max(0, Math.min(1, Math.round((visible / viewportLength + Number.EPSILON) * 1000) / 1000))

    exposures.push(exposure)
  }

  return exposures
}

function _withResistance(translation: number, min: number, max: number, resistance: number): number {
  const factor = 1 - resistance

  if (translation > max) return max + (translation - max) * factor
  if (translation < min) return min + (translation - min) * factor

  return translation
}

function _withoutResistance(translation: number, min: number, max: number, resistance: number): number {
  const factor = 1 - resistance
  if (factor <= 0) return translation

  if (translation > max) return max + (translation - max) / factor
  if (translation < min) return min + (translation - min) / factor

  return translation
}

function _tangential(x: number, y: number, orientation: Carousel.Orientation): number {
  return orientation === 'horizontal' ? x : y
}

function _normal(x: number, y: number, orientation: Carousel.Orientation): number {
  return orientation === 'horizontal' ? y : x
}

function _clampIndex(index: number, count: number): number {
  if (count <= 0) return 0

  return Math.max(0, Math.min(count - 1, index))
}

type SwipeTracker = {
  add: (position: number) => void
  clear: () => void
  release: () => { sinceLast: number; velocity: number }
  reset: (position: number) => void
}

function _createSwipeTracker(windowMs: number): SwipeTracker {
  let samples: { p: number; t: number }[] = []

  return {
    add: position => {
      const now = performance.now()

      samples.push({ p: position, t: now })

      while (samples.length > 0 && now - samples[0].t > windowMs) {
        samples.shift()
      }
    },
    clear: () => {
      samples = []
    },
    release: () => {
      const now = performance.now()
      let velocity = 0

      if (samples.length >= 2) {
        const first = samples[0]
        const last = samples[samples.length - 1]
        const span = last.t - first.t

        if (span > 0) {
          velocity = (last.p - first.p) / span * MS_PER_FRAME
        }
      }

      const sinceLast = samples.length > 0 ? now - samples[samples.length - 1].t : Infinity

      return { sinceLast, velocity }
    },
    reset: position => {
      samples = [{ p: position, t: performance.now() }]
    },
  }
}

const FIXED_STYLES = asStyleDict({
  content: {
    alignItems: 'center',
    display: 'flex',
    height: '100%',
    justifyContent: 'flex-start',
    left: '0',
    position: 'absolute',
    top: '0',
    userSelect: 'none',
    width: '100%',
  },
  itemContainer: {
    flex: '0 0 auto',
    height: '100%',
    overflow: 'hidden',
    width: '100%',
  },
  viewport: {
    height: '100%',
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
})

if (process.env.NODE_ENV === 'development') {
  Carousel.displayName = 'Carousel'
  Carousel.Viewport.displayName = 'Carousel.Viewport'
  Carousel.Content.displayName = 'Carousel.Content'
  Carousel.Item.displayName = 'Carousel.Item'
}
