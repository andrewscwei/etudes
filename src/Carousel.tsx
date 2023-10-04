import React, { forwardRef, useEffect, useRef, useState, type ComponentType, type ForwardedRef, type HTMLAttributes, type ReactElement } from 'react'
import { Each } from './Each'
import { asStyleDict, styles } from './utils'

export type CarouselOrientation = 'horizontal' | 'vertical'

export type CarouselProps<I> = HTMLAttributes<HTMLElement> & {
  index?: number
  items?: I[]
  lazy?: boolean
  showsScrollbar?: boolean
  orientation?: CarouselOrientation
  onIndexChange?: (index: number) => void
  ItemComponent: ComponentType<I>
}

export const Carousel = forwardRef(({
  style,
  items = [],
  index: externalIndex = 0,
  lazy = true,
  orientation = 'horizontal',
  showsScrollbar = false,
  onIndexChange,
  ItemComponent,
  ...props
}, ref) => {
  const handleIndexChange = (newValue: number) => {
    if (setIndex) {
      setIndex(newValue)
    }
    else {
      onIndexChange?.(newValue)
    }
  }

  const tracksIndexChanges = externalIndex === undefined
  const [index, setIndex] = tracksIndexChanges ? useState(0) : [externalIndex]
  const prevIndexRef = useRef<number>()
  const isInitialRender = prevIndexRef.current === undefined
  const scrollerRef = useRef<HTMLDivElement>(null)
  const autoScrollTimeoutRef = useRef<NodeJS.Timeout | undefined>()
  const fixedStyles = getFixedStyles({ orientation, showsScrollbar })

  useEffect(() => {
    const scrollerElement = scrollerRef.current

    if (!scrollerElement) return

    const scrollHandler = (event: Event) => {
      if (autoScrollTimeoutRef.current !== undefined) return

      const element = event.currentTarget as HTMLElement
      const newValue = orientation === 'horizontal' ? Math.round(element.scrollLeft / element.clientWidth) : Math.round(element.scrollTop / element.clientHeight)

      if (newValue === index) return

      // Set previous index ref here to avoid the side-effect of handling index
      // changes from prop/state.
      prevIndexRef.current = newValue

      handleIndexChange(newValue)
    }

    scrollerElement.addEventListener('scroll', scrollHandler)

    return () => {
      scrollerElement.removeEventListener('scroll', scrollHandler)
    }
  }, [index, orientation])

  useEffect(() => {
    if (prevIndexRef.current === index) return

    prevIndexRef.current = index

    if (isInitialRender) return

    handleIndexChange(index)

    const scrollerElement = scrollerRef.current

    if (!scrollerElement) return

    const moe = 5
    const delayMs = 50
    const top = orientation === 'horizontal' ? 0 : scrollerElement.clientHeight * index
    const left = orientation === 'horizontal' ? scrollerElement.clientWidth * index : 0

    scrollerElement.scrollTo({ top, left, behavior: 'smooth' })

    clearInterval(autoScrollTimeoutRef.current)
    autoScrollTimeoutRef.current = setInterval(() => {
      if (Math.abs(scrollerElement.scrollTop - top) > moe || Math.abs(scrollerElement.scrollLeft - left) > moe) return

      clearInterval(autoScrollTimeoutRef.current)
      autoScrollTimeoutRef.current = undefined
    }, delayMs)
  }, [index, orientation])

  return (
    <div
      {...props}
      data-component='carousel'
      ref={ref}
      style={styles(style, fixedStyles.root)}
    >
      <div
        data-child='viewport'
        ref={scrollerRef}
        style={styles(fixedStyles.viewport)}
      >
        <Each in={items}>
          {({ style: itemStyle, ...itemProps }) => (
            <div style={styles(fixedStyles.itemContainer)}>
              <ItemComponent
                data-child='item'
                style={styles(itemStyle, fixedStyles.item)}
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

function getFixedStyles({ orientation = 'horizontal', showsScrollbar = false }) {
  return asStyleDict({
    root: {
    },
    item: {
      flex: '0 0 auto',
      height: '100%',
      width: '100%',
    },
    itemContainer: {
      height: '100%',
      overflow: 'hidden',
      scrollSnapAlign: 'start',
      scrollSnapStop: 'always',
      width: '100%',
    },
    viewport: {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      ...showsScrollbar ? {} : {
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      },
      WebkitOverflowScrolling: 'touch',
      ...orientation === 'horizontal' ? {
        flexDirection: 'row',
        overflowX: 'auto',
        overflowY: 'hidden',
        scrollSnapType: 'x mandatory',
      } : {
        flexDirection: 'column',
        overflowX: 'hidden',
        overflowY: 'auto',
        scrollSnapType: 'y mandatory',
      },
    },
  })
}
