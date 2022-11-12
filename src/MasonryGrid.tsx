import classNames from 'classnames'
import React, { forwardRef, HTMLAttributes, useEffect, useRef, useState } from 'react'
import { Rect } from 'spase'
import useResizeEffect from './hooks/useResizeEffect'
import { Orientation } from './types'
import asClassNameDict from './utils/asClassNameDict'
import asStyleDict from './utils/asStyleDict'
import useDebug from './utils/useDebug'

const debug = useDebug('masonry')

export type MasonryGridProps = HTMLAttributes<HTMLDivElement> & {
  areSectionsAligned?: boolean
  horizontalSpacing?: number
  isReversed?: boolean
  orientation?: Orientation
  sections?: number
  verticalSpacing?: number
}

const BASE_MODIFIER_CLASS_PREFIX = 'base-'

/**
 * This is a React component that arranges all of its immediate children in a
 * masonry grid. Refrain from assigning CSS styles to it via `className` or
 * `style` property, though they are still handled if absolutely necessary.
 * Customize the grid via its supported properties. The grid can be in either
 * vertical or horizontal orientation. The length of every child element
 * *parallel to the direction of the orientation* is automatically set according
 * to the number of sections specified for the grid. This means that in an
 * horizontally oriented grid, the *width* of each child element is
 * automatically set, whereas in a vertically oriented grid the *height* of each
 * child element is automatically set. Additionally, the *number of sections*
 * corresponds to the maximum the number of child elements present in the
 * direction that is parallel to the orientation of the grid. Hence, in a
 * vertically oriented grid, *number of secitons* refers to the *number of
 * rows*, whereas in a horizontally oriented grid, *number of sections* refers
 * to the *number of columns*.
 */
export default forwardRef<HTMLDivElement, MasonryGridProps>(({
  areSectionsAligned = false,
  children,
  className,
  horizontalSpacing = 0,
  isReversed = false,
  orientation = 'vertical',
  sections = 3,
  verticalSpacing = 0,
  ...props
}, ref) => {
  const bodyRef = useRef<HTMLDivElement>(null)

  const [minWidth, setMinWidth] = useState(NaN)
  const [minHeight, setMinHeight] = useState(NaN)
  const [maxWidth, setMaxWidth] = useState(NaN)
  const [maxHeight, setMaxHeight] = useState(NaN)

  const getCurrentWidth = () => Rect.from(bodyRef.current)?.width ?? 0

  const getCurrentHeight = () => Rect.from(bodyRef.current)?.height ?? 0

  const repositionChildren = () => {
    const rootNode = bodyRef.current

    if (!rootNode) return

    debug('Repositioning children... OK')

    const nodes = rootNode.children
    const numSections = sections

    if (numSections <= 0) throw new Error('You must specifiy a minimum of 1 section(s) (a.k.a. row(s) for horizontal orientation, column(s) for vertical orientation) for a MasonryGrid instance')

    if (orientation === 'vertical') {
      const sectionHeights: number[] = [...new Array(numSections)].map(() => 0)

      for (let i = 0; i < nodes.length; i++) {
        const child = nodes[i]

        if (!(child instanceof HTMLElement)) continue

        const base = computeBaseFromElement(child, sections)
        const [colIdx, y] = computeNextAvailableSectionAndLengthByBase(sectionHeights, base)

        child.style.position = 'absolute'
        child.style.width = `calc(${100 / numSections * base}% - ${horizontalSpacing * (numSections - 1) / numSections * base}px + ${horizontalSpacing * (base - 1)}px)`
        child.style.height = ''
        child.style.left = `calc(${100 / numSections * colIdx}% - ${horizontalSpacing * (numSections - 1) / numSections * colIdx}px + ${horizontalSpacing * colIdx}px)`
        child.style.top = `${y + (y === 0 ? 0 : verticalSpacing)}px`

        for (let j = 0; j < base; j++) {
          sectionHeights[colIdx + j] = y + (y === 0 ? 0 : verticalSpacing) + (Rect.from(child)?.height ?? 0)
        }

        if (areSectionsAligned && colIdx + base === numSections) {
          const m = computeMaxLength(sectionHeights)

          for (let j = 0; j < numSections; j++) {
            sectionHeights[j] = m
          }
        }
      }

      const w = getCurrentWidth()
      const h = computeMaxLength(sectionHeights, numSections)

      setMinWidth(w)
      setMinHeight(h)

      if (!isNaN(h)) rootNode.style.height = `${h}px`

      if (isReversed) {
        for (let i = 0; i < nodes.length; i++) {
          const child = nodes[i]

          if (!(child instanceof HTMLElement)) continue

          const x = parseFloat(child.style.left)

          child.style.left = `${w - x - parseFloat(child.style.width)}px`
        }
      }
    }
    else {
      const sectionWidths: number[] = [...new Array(numSections)].map(() => 0)

      for (let i = 0; i < nodes.length; i++) {
        const child = nodes[i]

        if (!(child instanceof HTMLElement)) continue

        const base = computeBaseFromElement(child, sections)
        const [rowIdx, x] = computeNextAvailableSectionAndLengthByBase(sectionWidths, base)

        child.style.position = 'absolute'
        child.style.width = ''
        child.style.height = `calc(${100 / numSections * base}% - ${verticalSpacing * (numSections - 1) / numSections * base}px + ${verticalSpacing * (base - 1)}px)`
        child.style.top = `calc(${100 / numSections * rowIdx}% - ${verticalSpacing * (numSections - 1) / numSections * rowIdx}px + ${verticalSpacing * rowIdx}px)`
        child.style.left = `${x + (x === 0 ? 0 : horizontalSpacing)}px`

        for (let j = 0; j < base; j++) {
          sectionWidths[rowIdx + j] = x + (x === 0 ? 0 : horizontalSpacing) + (Rect.from(child)?.width ?? 0)
        }

        if (areSectionsAligned && rowIdx + base === numSections) {
          const m = computeMaxLength(sectionWidths)

          for (let j = 0; j < numSections; j++) {
            sectionWidths[j] = m
          }
        }
      }

      const h = getCurrentHeight()
      const w = computeMaxLength(sectionWidths, numSections)

      setMinHeight(h)
      setMinWidth(w)

      if (!isNaN(w)) rootNode.style.width = `${w}px`

      if (isReversed) {
        for (let i = 0; i < nodes.length; i++) {
          const child = nodes[i]

          if (!(child instanceof HTMLElement)) continue

          const y = parseFloat(child.style.top)

          child.style.top = `${h - y - parseFloat(child.style.height)}px`
        }
      }
    }
  }

  useResizeEffect(bodyRef, {
    onResize: maxSize => {
      const currWidth = getCurrentWidth()
      const currHeight = getCurrentHeight()

      if (minWidth !== currWidth || minHeight !== currHeight || maxSize.width !== maxWidth || maxSize.height !== maxHeight) {
        repositionChildren()
        setMaxWidth(maxSize.width)
        setMaxHeight(maxSize.height)
      }
    },
  }, [areSectionsAligned, horizontalSpacing, isReversed, sections, verticalSpacing])

  useEffect(() => {
    const imageSources = getAllImageSources(bodyRef.current?.innerHTML)

    if (imageSources.length === 0) return repositionChildren()

    const numImages = imageSources.length

    for (let i = 0; i < numImages; i++) {
      const src = imageSources[i]
      const image = new Image()
      image.src = src
      image.onload = () => repositionChildren()
    }
  }, [children])

  const fixedClassNames = asClassNameDict({
    root: classNames(orientation),
  })

  const fixedStyles = asStyleDict({
    body: {
      height: orientation === 'horizontal' ? '100%' : 'auto',
      minHeight: orientation === 'vertical' && !isNaN(minHeight) ? `${minHeight}px` : '',
      minWidth: orientation === 'horizontal' && !isNaN(minWidth) ? `${minWidth}px` : '',
      padding: '0',
      width: orientation === 'horizontal' ? 'auto' : '100%',
    },
  })

  return (
    <div
      {...props}
      ref={ref}
      className={classNames(className, fixedClassNames.root)}
    >
      <div ref={bodyRef} style={fixedStyles.body}>
        {children}
      </div>
    </div>
  )
})

/**
 * Computes the index and current length of the next available section for a
 * specific base value, based on a provided array of existing section lengths.
 *
 * @param currentSectionLengths - An array of the current section lengths.
 * @param base - The base value of the item to be inserted into the grid, and to
 *               be used to evaluate the next available section.
 *
 * @returns An array consiting of the computed section index and its to-be
 *          length if a new item were to be placed in it.
 */
function computeNextAvailableSectionAndLengthByBase(currentSectionLengths: number[], base: number): [number, number] {
  const numSections = currentSectionLengths.length

  let sectionIdx = NaN
  let minLength = Infinity

  for (let i = 0; i < numSections; i++) {
    const length = currentSectionLengths[i]
    const isShorter = length < minLength
    const isEligibleSection = i + base <= numSections
    let hasRoomInSubsequentSections = true

    for (let j = 1; j < base; j++) {
      if (currentSectionLengths[i + j] > length) {
        hasRoomInSubsequentSections = false
      }
    }

    if (isShorter && isEligibleSection && hasRoomInSubsequentSections) {
      sectionIdx = i
      minLength = length
    }
  }

  if (isNaN(sectionIdx)) {
    return [0, computeMaxLength(currentSectionLengths, base)]
  }
  else {
    return [sectionIdx, minLength]
  }
}

/**
 * A helper function that computes the max section length of an array of section
 * lengths. Only the first n = `base` sections are inspected.
 *
 * @param currentSectionLengths - An array of section lengths.
 * @param base - The number representing the first n sections to inspect. Any
 *               non-numerical values will be ignored and return value will be
 *               based on all sections. A `base` value will be clamped between 1
 *               and the maximum length of the array of section lengths.
 *
 * @returns The max section length.
 */
function computeMaxLength(currentSectionLengths: number[], base?: number): number {
  let arr = currentSectionLengths

  if (base !== undefined && base !== null && !isNaN(base)) {
    arr = arr.slice(0, Math.max(1, Math.min(base, currentSectionLengths.length)))
  }

  return arr.reduce((out, curr, i) => curr > out ? curr : out, 0)
}

/**
 * Computes the base value of an element from its classes.
 *
 * @param element - The HTML element.
 * @param numSections - Total number of sections.
 *
 * @returns The computed base value that is clamped between 1 and max number of
 *          sections.
 */
function computeBaseFromElement(element: HTMLElement, numSections: number): number {
  const classList = element.classList

  for (let i = 0; i < classList.length; i++) {
    const c = classList[i]

    if (c.startsWith(BASE_MODIFIER_CLASS_PREFIX)) {
      const base = parseFloat(c.replace(BASE_MODIFIER_CLASS_PREFIX, ''))
      if (!isNaN(base)) return Math.min(Math.max(base, 1), numSections)
    }
  }

  return 1
}

/**
 * Scans an HTML string and returns all the image sources.
 *
 * @param htmlString The HTML string.
 *
 * @returns The image sources.
 */
function getAllImageSources(htmlString?: string): string[] {
  if (!htmlString) return []

  const regexImg = /<img.*?src=("|')(.*?)("|')/g
  const regexSrc = /<img.*?src=("|')(.*?)("|')/
  const imageTags = htmlString.match(regexImg) ?? []

  const out: string[] = []

  for (let i = 0; i < imageTags.length; i++) {
    const tag = imageTags[i]
    const src = tag.match(regexSrc)?.[2]

    if (!src) continue

    out.push(src)
  }

  return out
}
