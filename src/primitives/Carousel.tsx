import { Children, createContext, type HTMLAttributes, type MouseEvent, type Ref, use, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { useInterval } from '../hooks/useInterval.js'
import { useLatest } from '../hooks/useLatest.js'
import { usePrevious } from '../hooks/usePrevious.js'
import { useSize } from '../hooks/useSize.js'
import { asComponentDict } from '../utils/asComponentDict.js'
import { asStyleDict } from '../utils/asStyleDict.js'
import { Styled } from '../utils/Styled.js'
import { styles } from '../utils/styles.js'

type GestureState = 'axis' | 'cross' | 'idle' | 'pending'

type StateSnapshot = {
  dragSpeed: number
  dragStartThreshold: number
  itemCount: number
  maxDisplacement: number
  minDisplacement: number
  orientation: Carousel.Orientation
  overscrollResistance: number
  safeIndex: number
  swipeLiftWindow: number
  swipeVelocityThreshold: number
  viewportLength: number
  shouldTrackExposure: boolean
}

// Per-frame velocity decay of the release spring. Lower = stronger drag, faster
// settle.
const FRICTION = 0.55

// Spring force pulling position toward the target index. Higher = snappier
// snap, more overshoot.
const SPRING_STIFFNESS = 0.05

// Extra velocity damping applied each frame while the spring is past `[min,
// max]`. Lower = less bounce when the spring crosses the edge.
const OVERSHOOT_DAMPING = 0.55

// Position is considered settled (in pixels) when within this distance of the
// target.
const POSITION_EPSILON = 0.5

// Velocity is considered settled (in px/frame) when below this magnitude.
const VELOCITY_EPSILON = 0.02

// Time window (ms) used to compute release velocity. Only pointer samples
// within the last N ms before pointer-up contribute.
const VELOCITY_SAMPLE_WINDOW = 100

// Converts pointer velocity (px/ms) into the per-frame velocity the spring loop
// expects (px/frame at 60fps).
const MS_PER_FRAME = 1000 / 60

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
 * @exports Carousel.Viewport Component for the viewport.
 * @exports Carousel.Content Component for the list holding all items.
 * @exports Carousel.ItemContainer Component containing each item.
 * @exports useCarouselItem Hook for reading the current item's index, exposure,
 *                          and active state from within an item's subtree.
 */
export function Carousel({
  ref,
  autoAdvanceInterval = 0,
  children,
  dragSpeed = 1.0,
  dragStartThreshold = 5,
  index = 0,
  orientation = 'horizontal',
  overscrollResistance = 0.7,
  swipeLiftWindow = 100,
  swipeVelocityThreshold = 0.4,
  shouldTrackExposure = false,
  onAutoAdvancePause,
  onAutoAdvanceResume,
  onIndexChange,
  ...props
}: Carousel.Props) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const positionRef = useRef(0)
  const velocityRef = useRef(0)
  const targetRef = useRef(0)
  const rafRef = useRef(0)
  const samplesRef = useRef<{ p: number; t: number }[]>([])
  const dragStartPositionRef = useRef(0)
  const dragStartAxialRef = useRef(0)
  const dragStartXRef = useRef(0)
  const dragStartYRef = useRef(0)
  const gestureRef = useRef<GestureState>('idle')
  const activePointerIdRef = useRef<number | undefined>(null)
  const dragStartedRef = useRef(false)
  const prevAxisSizeRef = useRef(0)

  const autoAdvancePauseHandlerRef = useLatest(onAutoAdvancePause)
  const autoAdvanceResumeHandlerRef = useLatest(onAutoAdvanceResume)
  const indexChangeHandlerRef = useLatest(onIndexChange)

  const [exposures, setExposures] = useState<number[] | undefined>()

  const [isDragging, setIsDragging] = useState(false)
  const wasDragging = usePrevious(isDragging, isDragging)

  const components = asComponentDict(children, {
    content: Carousel.Content,
    itemContainer: Carousel.ItemContainer,
    viewport: Carousel.Viewport,
  })

  const items = Children.toArray(components.content?.props.children)
  const itemCount = items.length
  const safeIdx = _clampIndex(index, itemCount)

  const { height, width } = useSize(viewportRef)
  const viewportLength = orientation === 'horizontal' ? width : height
  const minDisplacement = -viewportLength * Math.max(0, itemCount - 1)
  const maxDisplacement = 0

  const snapshotRef = useRef<StateSnapshot>(undefined!)
  snapshotRef.current = {
    dragSpeed,
    dragStartThreshold,
    itemCount,
    maxDisplacement,
    minDisplacement,
    orientation,
    overscrollResistance,
    safeIndex: safeIdx,
    swipeLiftWindow,
    swipeVelocityThreshold,
    viewportLength,
    shouldTrackExposure,
  }

  const clickHandler = (event: MouseEvent) => {
    // If click occurs after drag started, prevent all click handlers from
    // firing.
    if (dragStartedRef.current) {
      event.stopPropagation()
      dragStartedRef.current = false
    }
  }

  const autoAdvanceHandler = () => {
    if (itemCount <= 1) return

    const nextIndex = (safeIdx + 1) % itemCount

    indexChangeHandlerRef.current?.(nextIndex)
  }

  const updateExposures = () => {
    const snapshot = snapshotRef.current
    if (!snapshot.shouldTrackExposure) return

    const next = _computeExposures(positionRef.current, snapshot.viewportLength, snapshot.itemCount)

    setExposures(prev => _areExposuresEqual(prev, next) ? prev : next)
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
    const { maxDisplacement: max, minDisplacement: min, orientation: orient } = snapshotRef.current
    const target = targetRef.current

    const force = (target - positionRef.current) * SPRING_STIFFNESS
    velocityRef.current = velocityRef.current * FRICTION + force
    positionRef.current += velocityRef.current

    if (positionRef.current > max || positionRef.current < min) {
      velocityRef.current *= OVERSHOOT_DAMPING
    }

    const isSettled = Math.abs(velocityRef.current) < VELOCITY_EPSILON &&
      Math.abs(target - positionRef.current) < POSITION_EPSILON

    if (isSettled) {
      positionRef.current = target
      velocityRef.current = 0
      rafRef.current = 0
      _applyTransform(contentRef.current, target, orient)
      updateExposures()

      return
    }

    _applyTransform(contentRef.current, positionRef.current, orient)
    updateExposures()
    rafRef.current = requestAnimationFrame(tick)
  }

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const pointerDownHandler = (e: PointerEvent) => {
      const { itemCount: count, orientation: orient } = snapshotRef.current

      if (!e.isPrimary) return
      if (e.button !== 0) return
      if (count <= 1) return
      if (activePointerIdRef.current !== null) return

      activePointerIdRef.current = e.pointerId

      const axial = orient === 'horizontal' ? e.clientX : e.clientY
      dragStartPositionRef.current = positionRef.current
      dragStartAxialRef.current = axial
      dragStartXRef.current = e.clientX
      dragStartYRef.current = e.clientY
      samplesRef.current = [{ p: axial, t: performance.now() }]
      dragStartedRef.current = false
      gestureRef.current = 'pending'
    }

    const pointerMoveHandler = (e: PointerEvent) => {
      if (activePointerIdRef.current !== e.pointerId) return
      if (gestureRef.current === 'idle' || gestureRef.current === 'cross') return

      const {
        dragSpeed: speed,
        dragStartThreshold: threshold,
        maxDisplacement: max,
        minDisplacement: min,
        orientation: orient,
        overscrollResistance: resistance,
      } = snapshotRef.current

      if (gestureRef.current === 'pending') {
        const dx = Math.abs(e.clientX - dragStartXRef.current)
        const dy = Math.abs(e.clientY - dragStartYRef.current)
        const axial = orient === 'horizontal' ? dx : dy
        const cross = orient === 'horizontal' ? dy : dx

        if (Math.max(axial, cross) < threshold) return

        if (axial >= cross) {
          gestureRef.current = 'axis'
          stopTicking()
          viewport.setPointerCapture(e.pointerId)
          setIsDragging(true)
        } else {
          gestureRef.current = 'cross'

          return
        }
      }

      const delta = orient === 'horizontal' ? e.clientX : e.clientY
      const totalDelta = (delta - dragStartAxialRef.current) * speed
      const pos = dragStartPositionRef.current + totalDelta

      positionRef.current = _withResistance(pos, min, max, resistance)
      _applyTransform(contentRef.current, positionRef.current, orient)
      updateExposures()

      if (Math.abs(totalDelta) > threshold) {
        dragStartedRef.current = true
      }

      const now = performance.now()
      const samples = samplesRef.current

      samples.push({ p: delta, t: now })

      while (samples.length > 0 && now - samples[0].t > VELOCITY_SAMPLE_WINDOW) {
        samples.shift()
      }
    }

    const pointerUpHandler = (e: PointerEvent) => {
      if (activePointerIdRef.current !== e.pointerId) return

      if (viewport.hasPointerCapture(e.pointerId)) {
        viewport.releasePointerCapture(e.pointerId)
      }

      activePointerIdRef.current = null

      const wasAxisLocked = gestureRef.current === 'axis'
      gestureRef.current = 'idle'

      if (!wasAxisLocked) {
        samplesRef.current = []

        return
      }

      const {
        dragSpeed: speed,
        itemCount: count,
        safeIndex: currentIndex,
        swipeLiftWindow: liftWindow,
        swipeVelocityThreshold: velocityThreshold,
        viewportLength: size,
      } = snapshotRef.current

      const samples = samplesRef.current
      const now = performance.now()
      let releaseVelocity = 0

      if (samples.length >= 2) {
        const first = samples[0]
        const last = samples[samples.length - 1]
        const span = last.t - first.t

        if (span > 0) releaseVelocity = (last.p - first.p) / span
      }

      const sinceLastSample = samples.length > 0 ? now - samples[samples.length - 1].t : Infinity
      const isSwipe = sinceLastSample <= liftWindow && Math.abs(releaseVelocity) > velocityThreshold

      const proposed = isSwipe
        ? currentIndex + (releaseVelocity < 0 ? 1 : -1)
        : size > 0 ? Math.round(-positionRef.current / size) : currentIndex
      const newIndex = _clampIndex(proposed, count)

      samplesRef.current = []

      targetRef.current = -size * newIndex
      velocityRef.current = releaseVelocity * speed * MS_PER_FRAME
      startTicking()

      setIsDragging(false)

      if (newIndex !== currentIndex) {
        indexChangeHandlerRef.current?.(newIndex)
      }
    }

    viewport.addEventListener('pointerdown', pointerDownHandler, { passive: true })
    viewport.addEventListener('pointermove', pointerMoveHandler, { passive: true })
    viewport.addEventListener('pointerup', pointerUpHandler, { passive: true })
    viewport.addEventListener('pointercancel', pointerUpHandler, { passive: true })

    return () => {
      stopTicking()

      viewport.removeEventListener('pointerdown', pointerDownHandler)
      viewport.removeEventListener('pointermove', pointerMoveHandler)
      viewport.removeEventListener('pointerup', pointerUpHandler)
      viewport.removeEventListener('pointercancel', pointerUpHandler)

      activePointerIdRef.current = null
      gestureRef.current = 'idle'
    }
  }, [])

  useLayoutEffect(() => {
    if (isDragging) return
    if (viewportLength <= 0) return

    const target = -viewportLength * safeIdx
    const isSizeChange = prevAxisSizeRef.current !== viewportLength
    prevAxisSizeRef.current = viewportLength

    targetRef.current = target

    if (isSizeChange) {
      stopTicking()
      positionRef.current = target
      velocityRef.current = 0
      _applyTransform(contentRef.current, target, orientation)
      updateExposures()
    } else if (positionRef.current !== target || velocityRef.current !== 0) {
      startTicking()
    }
  }, [safeIdx, viewportLength, isDragging, orientation, shouldTrackExposure])

  useEffect(() => {
    if (shouldTrackExposure) {
      updateExposures()
    } else {
      setExposures(undefined)
    }
  }, [shouldTrackExposure, viewportLength, itemCount])

  useInterval(autoAdvanceInterval, autoAdvanceHandler, {
    isEnabled: !isDragging,
  }, [safeIdx])

  useEffect(() => {
    if (autoAdvanceInterval <= 0) return
    if (wasDragging === isDragging) return

    if (isDragging) {
      autoAdvancePauseHandlerRef.current?.()
    } else {
      autoAdvanceResumeHandlerRef.current?.()
    }
  }, [isDragging, autoAdvanceInterval])

  return (
    <div
      {...props}
      ref={ref}
      role='region'
      onClick={clickHandler}
    >
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
            const isActive = idx === safeIdx

            return (
              <Carousel.ItemContext
                key={key}
                value={{ exposure, index: idx, isActive }}
              >
                <Styled
                  style={styles(FIXED_STYLES.itemContainer)}
                  aria-hidden={!isActive}
                  element={components.itemContainer ?? <Carousel.ItemContainer/>}
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
     * Minimum pixel distance the pointer must travel between pointer-down and
     * pointer-up for the gesture to be classified as a drag. Movements within
     * this threshold are treated as a click and are allowed to propagate.
     */
    dragStartThreshold?: number

    /**
     * Current item index.
     */
    index?: number

    /**
     * Orientation of the carousel.
     */
    orientation?: Orientation

    /**
     * Resistance applied when the user drags past the first or last item. `0`
     * lets the overshoot track the pointer 1:1 (no resistance); `1` clamps hard
     * at the boundary (max resistance, no overshoot). Values in between produce
     * a rubber-band effect—higher means more resistance.
     */
    overscrollResistance?: number

    /**
     * Whether to track item exposure (0-1, 0 meaning the item is fully scrolled
     * out of view, 1 meaning the item is fully scrolled into view).
     */
    shouldTrackExposure?: boolean

    /**
     * Maximum gap in milliseconds between the last pointer move and the pointer
     * release for the gesture to register as a swipe. If the pointer was held
     * stationary longer than this before release, no swipe is detected and the
     * release falls back to position-based snapping.
     */
    swipeLiftWindow?: number

    /**
     * Minimum axial pointer velocity (in pixels per millisecond) at release for
     * the gesture to register as a swipe. A detected swipe advances the index
     * by one in the swipe direction, regardless of how far the displacement has
     * traveled.
     */
    swipeVelocityThreshold?: number

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
  export const ItemContainer = ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
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

function _applyTransform(element: HTMLElement | null, position: number, orientation: Carousel.Orientation) {
  if (!element) return

  if (orientation === 'horizontal') {
    element.style.transform = `translate3d(${position}px,0,0)`
  } else {
    element.style.transform = `translate3d(0,${position}px,0)`
  }
}

function _clampIndex(index: number, count: number): number {
  if (count <= 0) return 0

  return Math.max(0, Math.min(count - 1, index))
}

function _areExposuresEqual(a?: number[], b?: number[]): boolean {
  if (a === b) return true
  if (!a || !b || a.length !== b.length) return false

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }

  return true
}

function _computeExposures(displacement: number, viewportSize: number, itemCount: number): number[] {
  if (itemCount <= 0) return []
  if (viewportSize <= 0) return new Array(itemCount).fill(0)

  const exposures: number[] = []

  for (let i = 0; i < itemCount; i++) {
    const itemStart = i * viewportSize + displacement
    const itemEnd = itemStart + viewportSize
    const visibleStart = Math.max(0, itemStart)
    const visibleEnd = Math.min(viewportSize, itemEnd)
    const visible = Math.max(0, visibleEnd - visibleStart)
    const exposure = Math.max(0, Math.min(1, Math.round((visible / viewportSize + Number.EPSILON) * 1000) / 1000))

    exposures.push(exposure)
  }

  return exposures
}

function _withResistance(value: number, min: number, max: number, resistance: number): number {
  const factor = 1 - resistance

  if (value > max) return max + (value - max) * factor
  if (value < min) return min + (value - min) * factor

  return value
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
  Carousel.ItemContainer.displayName = 'Carousel.ItemContainer'
}
