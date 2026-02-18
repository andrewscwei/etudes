import { type ComponentType, type ForwardedRef, forwardRef, type HTMLAttributes, type MouseEvent, type PointerEvent, type ReactElement, type RefObject, useCallback, useLayoutEffect, useRef, useState } from 'react'
import { Point, Rect } from 'spase'

import { Each } from '../flows/Each.js'
import { useDrag } from '../hooks/useDrag.js'
import { useInterval } from '../hooks/useInterval.js'
import { useIsTouchDevice } from '../hooks/useIsTouchDevice.js'
import { useLatest } from '../hooks/useLatest.js'
import { asStyleDict } from '../utils/asStyleDict.js'
import { styles } from '../utils/styles.js'

export namespace Carousel {
  /**
   * Type describing the orientation of {@link Carousel}.
   */
  export type Orientation = 'horizontal' | 'vertical'

  /**
   * Type describing the props of {@link Carousel}.
   */
  export type Props<I> = {
    /**
     * Current item index.
     */
    index?: number

    /**
     * The interval in milliseconds to wait before automatically advancing to
     * the next item (auto loops).
     */
    autoAdvanceInterval?: number

    /**
     * Whether the carousel is draggable.
     */
    isDragEnabled?: boolean

    /**
     * Props for each item component
     */
    items?: Omit<I, 'exposure'>[]

    /**
     * Orientation of the carousel.
     */
    orientation?: Orientation

    /**
     * Whether to track item exposure (0-1, 0 meaning the item is fully scrolled
     * out of view, 1 meaning the item is fully scrolled into view).
     */
    tracksItemExposure?: boolean

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

    /**
     * The component to render for each item.
     */
    ItemComponent: ComponentType<I>
  } & Omit<HTMLAttributes<HTMLDivElement>, 'onClick' | 'onPointerCancel' | 'onPointerDown' | 'onPointerLeave' | 'onPointerUp' | 'role'>
}

/**
 * A carousel component that displays a list of items in a scrollable view.
 *
 * Notable features:
 *   - Supports horizontal and vertical orientations.
 *   - Supports auto-advancing to the next item after a specified interval.
 *   - Supports auto-snapping to each item when scrolling.
 *   - Supports tracking item exposure (0-1) to determine how much of the
 *     current item is visible in the viewport.
 */
export const Carousel = /* #__PURE__ */ forwardRef((
  {
    autoAdvanceInterval = 0,
    index = 0,
    ItemComponent,
    items = [],
    orientation = 'horizontal',
    tracksItemExposure = false,
    isDragEnabled = true,
    onAutoAdvancePause,
    onAutoAdvanceResume,
    onIndexChange,
    ...props
  },
  ref,
) => {
  const prevIndexRef = useRef<number>(undefined)
  const viewportRef = useRef<HTMLDivElement>(null)
  const pointerDownPositionRef = useRef<Point>(undefined)
  const pointerUpPositionRef = useRef<Point>(undefined)
  const autoScrollTimeoutRef = useRef<NodeJS.Timeout>(undefined)
  const autoScrollTimeoutMs = 1000
  const autoAdvancePauseHandlerRef = useLatest(onAutoAdvancePause)
  const autoAdvanceResumeHandlerRef = useLatest(onAutoAdvanceResume)
  const indexChangeHandlerRef = useLatest(onIndexChange)
  const isDragTickingRef = useRef(false)
  const isScrollTickingRef = useRef(false)
  const isTouchDevice = useIsTouchDevice()

  const [exposures, setExposures] = useState<number[] | undefined>(_getItemExposures(viewportRef, orientation))
  const [isPointerDown, setIsPointerDown] = useState(false)

  const fixedStyles = _getFixedStyles({ orientation, scrollSnapEnabled: isTouchDevice || !isPointerDown })
  const shouldAutoAdvance = autoAdvanceInterval > 0

  const unlockScrollEffect = useCallback(() => {
    if (autoScrollTimeoutRef.current === undefined) return

    clearTimeout(autoScrollTimeoutRef.current)

    autoScrollTimeoutRef.current = undefined
  }, [])

  const lockScrollEffect = useCallback(() => {
    unlockScrollEffect()

    autoScrollTimeoutRef.current = setTimeout(() => {
      clearTimeout(autoScrollTimeoutRef.current)
      autoScrollTimeoutRef.current = undefined
    }, autoScrollTimeoutMs)
  }, [autoScrollTimeoutMs, unlockScrollEffect])

  const normalizeScrollPosition = useCallback(() => {
    _scrollToIndex(viewportRef, index, orientation)

    // Lock scroll effect temporarily to prevent auto-activating intermediate
    // indexes while scrolling.
    lockScrollEffect()
  }, [index, orientation])

  const updateExposures = useCallback(() => {
    setExposures(_getItemExposures(viewportRef, orientation))
  }, [orientation])

  const pointerDownHandler = useCallback((event: PointerEvent) => {
    if (isTouchDevice) return

    pointerDownPositionRef.current = Point.make(event.clientX, event.clientY)

    setIsPointerDown(true)
  }, [isTouchDevice])

  const pointerUpHandler = useCallback((event: PointerEvent) => {
    if (isTouchDevice) return

    pointerUpPositionRef.current = Point.make(event.clientX, event.clientY)

    normalizeScrollPosition()

    setIsPointerDown(false)
  }, [isTouchDevice, normalizeScrollPosition])

  const clickHandler = useCallback((event: MouseEvent) => {
    // Prevent click event from propagating if the pointer was moved enough to
    // be considered a drag.
    const downPosition = pointerDownPositionRef.current
    const upPosition = pointerUpPositionRef.current

    if (!downPosition || !upPosition) return

    const threshold = 5
    const delta = Point.subtract(downPosition, upPosition)

    if (Math.abs(delta.x) > threshold || Math.abs(delta.y) > threshold) {
      event.stopPropagation()
    }

    pointerDownPositionRef.current = undefined
    pointerUpPositionRef.current = undefined
  }, [])

  const intervalHandler = useCallback(() => {
    const nextIndex = (index + items.length + 1) % items.length

    indexChangeHandlerRef.current?.(nextIndex)
  }, [isPointerDown, index, items.length])

  const dragHandler = useCallback(({ x, y }: Point) => {
    const viewport = viewportRef.current
    if (!viewport || isDragTickingRef.current) return

    unlockScrollEffect()

    isDragTickingRef.current = true

    requestAnimationFrame(() => {
      switch (orientation) {
        case 'horizontal':
          viewport.scrollLeft -= x * 1.5
          break
        case 'vertical':
          viewport.scrollTop -= y * 1.5
        default:
          console.error(`[etudes::Carousel] Unsupported orientation: ${orientation}`)
      }

      isDragTickingRef.current = false
    })
  }, [orientation])

  const scrollListener = useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport || isScrollTickingRef.current) return

    isScrollTickingRef.current = true

    requestAnimationFrame(() => {
      if (tracksItemExposure) {
        updateExposures()
      }

      const isAutoScrolling = autoScrollTimeoutRef.current !== undefined

      if (!isAutoScrolling) {
        const newIndex = orientation === 'horizontal'
          ? Math.round(viewport.scrollLeft / viewport.clientWidth)
          : Math.round(viewport.scrollTop / viewport.clientHeight)

        const clampedIndex = Math.max(0, Math.min(items.length - 1, newIndex))

        if (clampedIndex !== index) {
          // Set previous index before emitting index change event to
          // differentiate between index change from scroll vs from prop.
          prevIndexRef.current = clampedIndex

          indexChangeHandlerRef.current?.(clampedIndex)
        }
      }

      isScrollTickingRef.current = false
    })
  }, [items.length, index, orientation, tracksItemExposure, updateExposures])

  useDrag(viewportRef, {
    isEnabled: !isTouchDevice && isDragEnabled && items.length > 1,
    onDragMove: dragHandler,
  })

  useInterval((isPointerDown || !shouldAutoAdvance) ? -1 : autoAdvanceInterval, {
    onInterval: intervalHandler,
  }, [index])

  useLayoutEffect(() => {
    if (!shouldAutoAdvance || isTouchDevice) return

    if (isPointerDown) {
      autoAdvancePauseHandlerRef.current?.()
    } else {
      autoAdvanceResumeHandlerRef.current?.()
    }
  }, [isTouchDevice, isPointerDown, shouldAutoAdvance])

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const isInitialRender = prevIndexRef.current === undefined
    const isIndexModifiedFromManualScrolling = prevIndexRef.current === index

    viewport.addEventListener('scroll', scrollListener)

    if (tracksItemExposure) {
      updateExposures()
    }

    if (!isIndexModifiedFromManualScrolling) {
      prevIndexRef.current = index

      if (!isInitialRender) {
        indexChangeHandlerRef.current?.(index)
        normalizeScrollPosition()
      }
    }

    return () => {
      viewport.removeEventListener('scroll', scrollListener)
    }
  }, [index, tracksItemExposure, normalizeScrollPosition, scrollListener, updateExposures])

  return (
    <div
      {...props}
      ref={ref}
      role='region'
      onClick={clickHandler}
      onPointerCancel={pointerUpHandler}
      onPointerDown={pointerDownHandler}
      onPointerLeave={pointerUpHandler}
      onPointerUp={pointerUpHandler}
    >
      <div ref={viewportRef} style={styles(fixedStyles.viewport)}>
        <Each in={items}>
          {({ style: itemStyle, ...itemProps }, idx) => (
            <div style={styles(fixedStyles.itemContainer)}>
              <ItemComponent
                style={styles(itemStyle, fixedStyles.item)}
                aria-hidden={idx !== index}
                exposure={tracksItemExposure ? exposures?.[idx] : undefined}
                {...itemProps as any}
              />
            </div>
          )}
        </Each>
      </div>
    </div>
  )
}) as <I extends HTMLAttributes<HTMLElement>>(props: Readonly<{ ref?: ForwardedRef<HTMLDivElement> } & Carousel.Props<I>>) => ReactElement

function _scrollToIndex(ref: RefObject<HTMLDivElement | null>, index: number, orientation: Carousel.Orientation) {
  const viewport = ref?.current
  if (!viewport) return

  const top = orientation === 'horizontal' ? 0 : viewport.clientHeight * index
  const left = orientation === 'horizontal' ? viewport.clientWidth * index : 0

  if (viewport.scrollTop === top && viewport.scrollLeft === left) return

  viewport.scrollTo({ behavior: 'smooth', left, top })
}

function _getItemExposures(ref: RefObject<HTMLDivElement | null>, orientation: Carousel.Orientation) {
  const viewport = ref?.current
  if (!viewport) return undefined

  const exposures = []

  for (let i = 0; i < viewport.children.length; i++) {
    exposures.push(_getItemExposureAt(i, ref, orientation))
  }

  return exposures
}

function _getItemExposureAt(idx: number, ref: RefObject<HTMLDivElement | null>, orientation: Carousel.Orientation) {
  const viewport = ref?.current
  const child = viewport?.children[idx]
  if (!child) return 0

  const intersection = Rect.intersecting(child, viewport)

  switch (orientation) {
    case 'horizontal':
      return Math.max(0, Math.min(1, Math.round((intersection.width / viewport.clientWidth + Number.EPSILON) * 1000) / 1000))
    case 'vertical':
      return Math.max(0, Math.min(1, Math.round((intersection.height / viewport.clientHeight + Number.EPSILON) * 1000) / 1000))
    default:
      console.error(`[etudes::Carousel] Unsupported orientation: ${orientation}`)
      return NaN
  }
}

function _getFixedStyles({ orientation = 'horizontal', scrollSnapEnabled = false }) {
  return asStyleDict({
    item: {
      height: '100%',
      width: '100%',
    },
    itemContainer: {
      flex: '0 0 auto',
      height: '100%',
      overflow: 'hidden',
      scrollSnapAlign: 'center',
      width: '100%',
    },
    viewport: {
      alignItems: 'center',
      display: 'flex',
      height: '100%',
      justifyContent: 'flex-start',
      scrollSnapStop: 'always',
      userSelect: scrollSnapEnabled ? 'auto' : 'none',
      WebkitOverflowScrolling: 'touch',
      width: '100%',
      ...orientation === 'horizontal' ? {
        flexDirection: 'row',
        overflowX: 'scroll',
        overflowY: 'hidden',
        scrollSnapType: scrollSnapEnabled ? 'x mandatory' : 'none',
      } : {
        flexDirection: 'column',
        overflowX: 'hidden',
        overflowY: 'scroll',
        scrollSnapType: scrollSnapEnabled ? 'y mandatory' : 'none',
      },
    },
  })
}

if (process.env.NODE_ENV === 'development') {
  (Carousel as any).displayName = 'Carousel'
}
