import React, { forwardRef, useEffect, useRef, useState, type ComponentType, type ForwardedRef, type HTMLAttributes, type ReactElement } from 'react'
import { Rect, type Point } from 'spase'
import { useDragEffect } from '../hooks/useDragEffect'
import { useTimeout } from '../hooks/useTimeout'
import { Each } from '../operators/Each'
import { asStyleDict, styles } from '../utils'

export type CarouselOrientation = 'horizontal' | 'vertical'

export type CarouselProps<I> = HTMLAttributes<HTMLElement> & {
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

export const Carousel = forwardRef(({
  style,
  autoAdvanceInterval = 0,
  index: externalIndex = 0,
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
  const getItemExposures = () => {
    const viewportElement = viewportRef.current
    if (!viewportElement) return undefined

    const exposures = []

    for (let i = 0; i < viewportElement.children.length; i++) {
      exposures.push(getItemExposureAt(i))
    }

    return exposures
  }

  const getItemExposureAt = (idx: number) => {
    const viewportElement = viewportRef.current
    const child = viewportElement?.children[idx]
    if (!child) return 0

    const intersection = Rect.intersecting(child, viewportElement)
    if (!intersection) return 0

    switch (orientation) {
      case 'horizontal':
        return Math.max(0, Math.min(1, Math.round((intersection.width / viewportElement.clientWidth + Number.EPSILON) * 1000) / 1000))
      case 'vertical':
        return Math.max(0, Math.min(1, Math.round((intersection.height / viewportElement.clientHeight + Number.EPSILON) * 1000) / 1000))
      default:
        throw new Error(`Unsupported orientation '${orientation}'`)
    }
  }

  const handleIndexChange = (newValue: number) => {
    if (setIndex) {
      setIndex(newValue)
    }
    else {
      onIndexChange?.(newValue)
    }
  }

  const handlePointerDown = () => {
    if (!isDragEnabled) return

    setIsDragging(true)
  }

  const handlePointerUp = () => {
    if (!isDragEnabled) return

    setIsDragging(false)
  }

  const autoScrollToCurrentIndex = () => {
    const viewportElement = viewportRef.current
    if (!viewportElement) return

    const top = orientation === 'horizontal' ? 0 : viewportElement.clientHeight * index
    const left = orientation === 'horizontal' ? viewportElement.clientWidth * index : 0

    viewportElement.scrollTo({ top, left, behavior: 'smooth' })

    clearTimeout(autoScrollTimeoutRef.current)
    autoScrollTimeoutRef.current = setTimeout(() => {
      clearTimeout(autoScrollTimeoutRef.current)
      autoScrollTimeoutRef.current = undefined
    }, autoScrollTimeoutMs)
  }

  const tracksIndexChanges = externalIndex === undefined
  const prevIndexRef = useRef<number>()
  const viewportRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = tracksIndexChanges ? useState(0) : [externalIndex]
  const [exposures, setExposures] = tracksItemExposure ? useState<number[] | undefined>(getItemExposures()) : []
  const autoScrollTimeoutRef = useRef<NodeJS.Timeout>()
  const autoScrollTimeoutMs = 1000
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const viewportElement = viewportRef.current
    if (!viewportElement) return

    const scrollHandler = () => {
      if (setExposures) {
        setExposures(getItemExposures())
      }

      if (autoScrollTimeoutRef.current !== undefined) return

      const newIndex = orientation === 'horizontal'
        ? Math.round(viewportElement.scrollLeft / viewportElement.clientWidth)
        : Math.round(viewportElement.scrollTop / viewportElement.clientHeight)

      const clampedIndex = Math.max(0, Math.min(items.length - 1, newIndex))

      if (clampedIndex === index) return

      // Set previous index ref here to avoid the side-effect of handling index
      // changes from prop/state.
      prevIndexRef.current = clampedIndex

      handleIndexChange(clampedIndex)
    }

    viewportElement.addEventListener('scroll', scrollHandler)

    return () => {
      viewportElement.removeEventListener('scroll', scrollHandler)
    }
  }, [index, orientation])

  useEffect(() => {
    const isInitialRender = prevIndexRef.current === undefined
    const isIndexModifiedFromManualScrolling = prevIndexRef.current === index

    if (isIndexModifiedFromManualScrolling) return

    prevIndexRef.current = index

    if (isInitialRender) return

    handleIndexChange(index)
    autoScrollToCurrentIndex()
  }, [index, orientation])

  useEffect(() => {
    if (autoAdvanceInterval <= 0) return

    if (isDragging) {
      onAutoAdvancePause?.()
    }
    else {
      onAutoAdvanceResume?.()
    }
  }, [isDragging])

  if (isDragEnabled && items.length > 1) {
    useDragEffect(viewportRef, {
      onDragMove: (displacement: Point) => {
        switch (orientation) {
          case 'horizontal':
            requestAnimationFrame(() => {
              if (!viewportRef.current) return
              viewportRef.current.scrollLeft += displacement.x * 1.5
            })

            break
          case 'vertical':
            requestAnimationFrame(() => {
              if (!viewportRef.current) return
              viewportRef.current.scrollTop += displacement.y * 1.5
            })

            break
          default:
            throw Error(`Unsupported orientation '${orientation}'`)
        }
      },
    })
  }

  if (autoAdvanceInterval > 0) {
    useTimeout(
      () => handleIndexChange((index + items.length + 1) % items.length),
      isDragging ? 0 : autoAdvanceInterval,
      [isDragging, index, items.length],
    )
  }

  const fixedStyles = getFixedStyles({ isDragging, orientation })

  return (
    <div
      {...props}
      data-component='carousel'
      ref={ref}
      style={styles(style, fixedStyles.root)}
      onPointerDown={() => handlePointerDown()}
      onPointerUp={() => handlePointerUp()}
      onPointerLeave={() => handlePointerUp()}
    >
      <div
        data-child='viewport'
        ref={viewportRef}
        style={styles(fixedStyles.viewport)}
      >
        <Each in={items}>
          {({ style: itemStyle, ...itemProps }, idx) => (
            <div style={styles(fixedStyles.itemContainer)}>
              <ItemComponent
                data-child='item'
                style={styles(itemStyle, fixedStyles.item)}
                exposure={exposures?.[idx]}
                {...itemProps as any}
              />
            </div>
          )}
        </Each>
      </div>
    </div>
  )
}) as <I extends HTMLAttributes<HTMLElement>>(props: CarouselProps<I> & { ref?: ForwardedRef<HTMLDivElement> }) => ReactElement

Object.defineProperty(Carousel, 'displayName', { value: 'Carousel', writable: false })

function getFixedStyles({ isDragging = false, orientation = 'horizontal' }) {
  return asStyleDict({
    root: {
    },
    viewport: {
      alignItems: 'center',
      display: 'flex',
      height: '100%',
      userSelect: isDragging ? 'none' : 'auto',
      justifyContent: 'flex-start',
      scrollBehavior: isDragging ? 'auto' : 'smooth',
      scrollSnapStop: isDragging ? 'unset' : 'always',
      WebkitOverflowScrolling: 'touch',
      width: '100%',
      ...orientation === 'horizontal' ? {
        flexDirection: 'row',
        overflowX: 'scroll',
        overflowY: 'hidden',
        scrollSnapType: isDragging ? 'none' : 'x mandatory',
      } : {
        flexDirection: 'column',
        overflowX: 'hidden',
        overflowY: 'scroll',
        scrollSnapType: isDragging ? 'none' : 'y mandatory',
      },
    },
    itemContainer: {
      height: '100%',
      overflow: 'hidden',
      scrollSnapAlign: 'start',
      width: '100%',
      scrollBehavior: 'smooth',
    },
    item: {
      flex: '0 0 auto',
      height: '100%',
      width: '100%',
    },
  })
}
