import { type ComponentType, type HTMLAttributes, type MouseEvent, type PointerEvent, type Ref, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Point } from 'spase'

import { Each } from '../flows/Each.js'
import { useInterval } from '../hooks/useInterval.js'
import { useLatest } from '../hooks/useLatest.js'
import { useSize } from '../hooks/useSize.js'
import { asComponentDict } from '../utils/asComponentDict.js'
import { asStyleDict } from '../utils/asStyleDict.js'
import { Styled } from '../utils/Styled.js'
import { styles } from '../utils/styles.js'

const RUBBER_BAND_FACTOR = 0.3
const DRAG_THRESHOLD_PX = 5

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
 * @exports Carousel.Viewport Component for the viewport.
 * @exports Carousel.List Component for the list holding all items.
 * @exports Carousel.ItemContainer Component containing each item.
 */
export function Carousel<T extends HTMLAttributes<HTMLElement>>({
  ref,
  autoAdvanceInterval = 0,
  children,
  dragSpeed = 1.0,
  index = 0,
  ItemComponent,
  items = [],
  orientation = 'horizontal',
  shouldTrackExposure = false,
  onAutoAdvancePause,
  onAutoAdvanceResume,
  onIndexChange,
  ...props
}: Carousel.Props<T>) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const dragStartPointRef = useRef<Point.Point>(undefined)
  const dragStartDisplacementRef = useRef(0)
  const wasDraggedRef = useRef(false)

  const autoAdvancePauseHandlerRef = useLatest(onAutoAdvancePause)
  const autoAdvanceResumeHandlerRef = useLatest(onAutoAdvanceResume)
  const indexChangeHandlerRef = useLatest(onIndexChange)

  const [displacement, setDisplacement] = useState(0)
  const [isPointerDown, setIsPointerDown] = useState(false)

  const { height, width } = useSize(viewportRef)
  const axisSize = orientation === 'horizontal' ? width : height
  const minDisplacement = -axisSize * Math.max(0, items.length - 1)

  const displayedDisplacement = isPointerDown
    ? _applyRubberBand(displacement, minDisplacement, 0, RUBBER_BAND_FACTOR)
    : displacement

  const exposures = shouldTrackExposure
    ? _computeItemExposures(displayedDisplacement, axisSize, items.length)
    : undefined

  const fixedStyles = _getFixedStyles({ orientation })

  const components = asComponentDict(children, {
    itemContainer: Carousel.ItemContainer,
    list: Carousel.List,
    viewport: Carousel.Viewport,
  })

  const pointerDownHandler = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary) return
    if (event.button !== 0) return
    if (items.length <= 1) return

    event.currentTarget.setPointerCapture(event.pointerId)

    dragStartPointRef.current = Point.make(event.clientX, event.clientY)
    dragStartDisplacementRef.current = displacement
    wasDraggedRef.current = false

    setIsPointerDown(true)
  }

  const pointerMoveHandler = (event: PointerEvent<HTMLDivElement>) => {
    const start = dragStartPointRef.current
    if (!start) return

    const delta = orientation === 'horizontal'
      ? (event.clientX - start.x) * dragSpeed
      : (event.clientY - start.y) * dragSpeed

    setDisplacement(dragStartDisplacementRef.current + delta)
  }

  const pointerUpHandler = (event: PointerEvent<HTMLDivElement>) => {
    const start = dragStartPointRef.current
    if (!start) return

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    wasDraggedRef.current = Math.abs(dx) > DRAG_THRESHOLD_PX || Math.abs(dy) > DRAG_THRESHOLD_PX

    const newIndex = axisSize > 0
      ? Math.max(0, Math.min(items.length - 1, Math.round(-displacement / axisSize)))
      : 0

    setDisplacement(-axisSize * newIndex)

    dragStartPointRef.current = undefined

    setIsPointerDown(false)

    if (newIndex !== index) {
      indexChangeHandlerRef.current?.(newIndex)
    }
  }

  const clickHandler = (event: MouseEvent) => {
    if (!wasDraggedRef.current) return

    event.stopPropagation()

    wasDraggedRef.current = false
  }

  const autoAdvanceHandler = () => {
    if (items.length <= 1) return

    const nextIndex = (index + 1) % items.length

    indexChangeHandlerRef.current?.(nextIndex)
  }

  useInterval((isPointerDown || autoAdvanceInterval <= 0) ? -1 : autoAdvanceInterval, {
    onInterval: autoAdvanceHandler,
  }, [index])

  useLayoutEffect(() => {
    if (isPointerDown) return
    if (axisSize <= 0) return

    setDisplacement(-axisSize * index)
  }, [index, axisSize, isPointerDown])

  useEffect(() => {
    if (autoAdvanceInterval <= 0) return

    if (isPointerDown) {
      autoAdvancePauseHandlerRef.current?.()
    } else {
      autoAdvanceResumeHandlerRef.current?.()
    }
  }, [isPointerDown, autoAdvanceInterval])

  return (
    <div
      {...props}
      ref={ref}
      role='region'
      onClick={clickHandler}
    >
      <Styled
        ref={viewportRef}
        style={styles(fixedStyles.viewport, {
          cursor: isPointerDown ? 'grabbing' : 'grab',
          touchAction: items.length > 1
            ? (orientation === 'horizontal' ? 'pan-y' : 'pan-x')
            : 'auto',
        })}
        element={components.viewport ?? <Carousel.Viewport/>}
        onPointerCancel={pointerUpHandler}
        onPointerDown={pointerDownHandler}
        onPointerMove={pointerMoveHandler}
        onPointerUp={pointerUpHandler}
      >
        <Styled
          style={{
            ...fixedStyles.list,
            transform: orientation === 'horizontal'
              ? `translateX(${displayedDisplacement}px)`
              : `translateY(${displayedDisplacement}px)`,
            ...isPointerDown ? { transitionProperty: 'none' } : {},
          }}
          element={components.list ?? <Carousel.List style={{ transitionDuration: '300ms', transitionTimingFunction: 'ease-in-out' }}/>}
        >
          <Each in={items}>
            {({ style: itemStyle, ...itemProps }, idx) => (
              <Styled
                style={styles(fixedStyles.itemContainer)}
                element={components.itemContainer ?? <Carousel.ItemContainer/>}
              >
                <ItemComponent
                  style={styles(itemStyle, fixedStyles.item)}
                  aria-hidden={idx !== index}
                  exposure={shouldTrackExposure ? exposures?.[idx] : undefined}
                  {...itemProps as any}
                />
              </Styled>
            )}
          </Each>
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
  export type Props<T> = {
    /**
     * Reference to the root element.
     */
    ref?: Ref<HTMLDivElement>

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
     * Props for each item component
     */
    items?: Omit<T, 'exposure'>[]

    /**
     * Orientation of the carousel.
     */
    orientation?: Orientation

    /**
     * The drag speed multiplier. Higher values result in faster dragging. The
     * default value is `1`.
     */
    dragSpeed?: number

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

    /**
     * The component to render for each item.
     */
    ItemComponent: ComponentType<T>
  } & Omit<HTMLAttributes<HTMLDivElement>, 'onClick' | 'onPointerCancel' | 'onPointerDown' | 'onPointerMove' | 'onPointerUp' | 'role'>

  /**
   * Component for the viewport of a {@link Carousel}.
   */
  export const Viewport = ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
    <div {...props}>{children}</div>
  )

  /**
   * Component for the list holding all items inside a {@link Carousel}.
   */
  export const List = ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
    <div {...props}>{children}</div>
  )

  /**
   * Component containing each item in a {@link Carousel}.
   */
  export const ItemContainer = ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
    <div {...props}>{children}</div>
  )
}

function _applyRubberBand(value: number, min: number, max: number, factor: number) {
  if (value > max) return max + (value - max) * factor
  if (value < min) return min + (value - min) * factor

  return value
}

function _computeItemExposures(displacement: number, axisSize: number, count: number): number[] {
  if (count <= 0) return []
  if (axisSize <= 0) return new Array(count).fill(0)

  const exposures: number[] = []

  for (let i = 0; i < count; i++) {
    const itemStart = i * axisSize + displacement
    const itemEnd = itemStart + axisSize
    const visibleStart = Math.max(0, itemStart)
    const visibleEnd = Math.min(axisSize, itemEnd)
    const visible = Math.max(0, visibleEnd - visibleStart)
    const exposure = Math.max(0, Math.min(1, Math.round((visible / axisSize + Number.EPSILON) * 1000) / 1000))

    exposures.push(exposure)
  }

  return exposures
}

function _getFixedStyles({ orientation = 'horizontal' }) {
  return asStyleDict({
    item: {
      height: '100%',
      width: '100%',
    },
    itemContainer: {
      flex: '0 0 auto',
      height: '100%',
      overflow: 'hidden',
      width: '100%',
    },
    list: {
      alignItems: 'center',
      display: 'flex',
      height: '100%',
      justifyContent: 'flex-start',
      left: '0',
      position: 'absolute',
      top: '0',
      transitionProperty: 'transform',
      userSelect: 'none',
      width: '100%',
      ...orientation === 'horizontal' ? {
        flexDirection: 'row',
      } : {
        flexDirection: 'column',
      },
    },
    viewport: {
      height: '100%',
      overflow: 'hidden',
      position: 'relative',
      width: '100%',
    },
  })
}

if (process.env.NODE_ENV === 'development') {
  Carousel.displayName = 'Carousel'
  Carousel.Viewport.displayName = 'Carousel.Viewport'
  Carousel.List.displayName = 'Carousel.List'
  Carousel.ItemContainer.displayName = 'Carousel.ItemContainer'
}
