import { forwardRef, useCallback, useEffect, useRef, useState, type ComponentType, type ForwardedRef, type HTMLAttributes, type MouseEvent, type PointerEvent, type ReactElement, type RefObject } from 'react'
import { Point, Rect } from 'spase'
import { useDrag } from '../hooks/useDrag.js'
import { useInterval } from '../hooks/useInterval.js'
import { Each } from '../operators/Each.js'
import { asStyleDict } from '../utils/asStyleDict.js'
import { styles } from '../utils/styles.js'

/**
 * Type describing the orientation of {@link Carousel}.
 */
export type CarouselOrientation = 'horizontal' | 'vertical'

/**
 * Type describing the props of {@link Carousel}.
 */
export type CarouselProps<I> = Omit<HTMLAttributes<HTMLDivElement>, 'role' | 'onClick' | 'onPointerCancel' | 'onPointerDown' | 'onPointerLeave' | 'onPointerUp'> & {
  /**
   * Current item index.
   */
  index?: number

  /**
   * The interval in milliseconds to wait before automatically advancing to the
   * next item (auto loops).
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
  orientation?: CarouselOrientation

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
export const Carousel = /* #__PURE__ */ forwardRef(({
  autoAdvanceInterval = 0,
  index = 0,
  isDragEnabled = true,
  items = [],
  orientation = 'horizontal',
  tracksItemExposure = false,
  onAutoAdvancePause,
  onAutoAdvanceResume,
  onIndexChange,
  ItemComponent,
  ...props
}, ref) => {
  const prevIndexRef = useRef<number>(undefined)
  const viewportRef = useRef<HTMLDivElement>(null)
  const pointerDownPositionRef = useRef<Point>(undefined)
  const pointerUpPositionRef = useRef<Point>(undefined)
  const autoScrollTimeoutRef = useRef<NodeJS.Timeout>(undefined)
  const autoScrollTimeoutMs = 1000

  const [exposures, setExposures] = useState<number[] | undefined>(_getItemExposures(viewportRef, orientation))
  const [isPointerDown, setIsPointerDown] = useState(false)

  const fixedStyles = _getFixedStyles({ scrollSnapEnabled: !isPointerDown, orientation })
  const shouldAutoAdvance = autoAdvanceInterval > 0

  const indexChangeHandler = useCallback((newValue: number) => {
    onIndexChange?.(newValue)
  }, [onIndexChange])

  const pointerDownHandler = useCallback((event: PointerEvent) => {
    pointerDownPositionRef.current = Point.make(event.clientX, event.clientY)

    setIsPointerDown(true)
  }, [])

  const clickHandler = useCallback((event: MouseEvent) => {
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

  const pointerUpHandler = useCallback((event: PointerEvent) => {
    pointerUpPositionRef.current = Point.make(event.clientX, event.clientY)

    if (!isPointerDown) return

    setIsPointerDown(false)
  }, [isPointerDown])

  const normalizeScrollPosition = useCallback(() => {
    _scrollToIndex(viewportRef, index, orientation)

    clearTimeout(autoScrollTimeoutRef.current)

    autoScrollTimeoutRef.current = setTimeout(() => {
      clearTimeout(autoScrollTimeoutRef.current)
      autoScrollTimeoutRef.current = undefined
    }, autoScrollTimeoutMs)
  }, [viewportRef.current, index, orientation, autoScrollTimeoutMs])

  const intervalHandler = useCallback(() => {
    const nextIndex = (index + items.length + 1) % items.length

    indexChangeHandler(nextIndex)
  }, [isPointerDown, index, items.length, indexChangeHandler])

  const dragMoveHandler = useCallback(({ x, y }: Point) => {
    const viewport = viewportRef.current

    switch (orientation) {
      case 'horizontal':
        requestAnimationFrame(() => {
          if (!viewport) return
          viewport.scrollLeft -= x * 1.5
        })

        break
      case 'vertical':
        requestAnimationFrame(() => {
          if (!viewport) return
          viewport.scrollTop -= y * 1.5
        })

        break
      default:
        console.error(`[etudes::Carousel] Unsupported orientation: ${orientation}`)
    }
  }, [orientation, viewportRef.current])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const isInitialRender = prevIndexRef.current === undefined
    const isIndexModifiedFromManualScrolling = prevIndexRef.current === index

    const scrollHandler = (_: Event) => {
      if (tracksItemExposure) {
        setExposures(_getItemExposures(viewportRef, orientation))
      }

      if (autoScrollTimeoutRef.current !== undefined) return

      const newIndex = orientation === 'horizontal'
        ? Math.round(viewport.scrollLeft / viewport.clientWidth)
        : Math.round(viewport.scrollTop / viewport.clientHeight)

      const clampedIndex = Math.max(0, Math.min(items.length - 1, newIndex))
      if (clampedIndex === index) return

      // Set previous index before emitting index change event to differentiate
      // between index change from scroll vs from prop.
      prevIndexRef.current = clampedIndex

      indexChangeHandler(clampedIndex)
    }

    viewport.addEventListener('scroll', scrollHandler)

    if (tracksItemExposure) {
      setExposures(_getItemExposures(viewportRef, orientation))
    }

    if (!isIndexModifiedFromManualScrolling) {
      prevIndexRef.current = index

      if (!isInitialRender) {
        indexChangeHandler(index)
        normalizeScrollPosition()
      }
    }

    return () => {
      viewport.removeEventListener('scroll', scrollHandler)
    }
  }, [index, orientation, tracksItemExposure])

  useEffect(() => {
    if (!shouldAutoAdvance) return

    if (isPointerDown) {
      onAutoAdvancePause?.()
    }
    else {
      onAutoAdvanceResume?.()
    }
  }, [isPointerDown, shouldAutoAdvance])

  useDrag(viewportRef, {
    isEnabled: isDragEnabled && items.length > 1,
    onDragMove: dragMoveHandler,
  })

  useInterval((isPointerDown || !shouldAutoAdvance) ? -1 : autoAdvanceInterval, {
    onInterval: intervalHandler,
  }, [index])

  return (
    <div
      {...props}
      ref={ref}
      role='region'
      onClick={event => clickHandler(event)}
      onPointerCancel={event => pointerUpHandler(event)}
      onPointerDown={event => pointerDownHandler(event)}
      onPointerLeave={event => pointerUpHandler(event)}
      onPointerUp={event => pointerUpHandler(event)}
    >
      <div ref={viewportRef} style={styles(fixedStyles.viewport)}>
        <Each in={items}>
          {({ style: itemStyle, ...itemProps }, idx) => (
            <div style={styles(fixedStyles.itemContainer)}>
              <ItemComponent
                aria-hidden={idx !== index}
                exposure={tracksItemExposure ? exposures?.[idx] : undefined}
                style={styles(itemStyle, fixedStyles.item)}
                {...itemProps as any}
              />
            </div>
          )}
        </Each>
      </div>
    </div>
  )
}) as <I extends HTMLAttributes<HTMLElement>>(props: Readonly<CarouselProps<I> & { ref?: ForwardedRef<HTMLDivElement> }>) => ReactElement

function _scrollToIndex(ref: RefObject<HTMLDivElement | null>, index: number, orientation: CarouselOrientation) {
  const viewport = ref?.current
  if (!viewport) return

  const top = orientation === 'horizontal' ? 0 : viewport.clientHeight * index
  const left = orientation === 'horizontal' ? viewport.clientWidth * index : 0

  if (viewport.scrollTop === top && viewport.scrollLeft === left) return

  viewport.scrollTo({ top, left, behavior: 'smooth' })
}

function _getItemExposures(ref: RefObject<HTMLDivElement | null>, orientation: CarouselOrientation) {
  const viewport = ref?.current
  if (!viewport) return undefined

  const exposures = []

  for (let i = 0; i < viewport.children.length; i++) {
    exposures.push(_getItemExposureAt(i, ref, orientation))
  }

  return exposures
}

function _getItemExposureAt(idx: number, ref: RefObject<HTMLDivElement | null>, orientation: CarouselOrientation) {
  const viewport = ref?.current
  const child = viewport?.children[idx]
  if (!child) return 0

  const intersection = Rect.intersecting(child, viewport)
  if (!intersection) return 0

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

function _getFixedStyles({ scrollSnapEnabled = false, orientation = 'horizontal' }) {
  return asStyleDict({
    viewport: {
      alignItems: 'center',
      display: 'flex',
      height: '100%',
      userSelect: scrollSnapEnabled ? 'auto' : 'none',
      justifyContent: 'flex-start',
      scrollBehavior: scrollSnapEnabled ? 'smooth' : 'auto',
      scrollSnapStop: scrollSnapEnabled ? 'always' : 'unset',
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
    itemContainer: {
      height: '100%',
      overflow: 'hidden',
      scrollSnapAlign: 'center',
      width: '100%',
      flex: '0 0 auto',
    },
    item: {
      height: '100%',
      width: '100%',
    },
  })
}

if (process.env.NODE_ENV !== 'production') {
  (Carousel as any).displayName = 'Carousel'
}
