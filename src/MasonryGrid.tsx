import { DirtyInfo, DirtyType, EventType, UpdateDelegate } from 'dirty-dom'
import React, { createRef, CSSProperties, PureComponent, ReactNode } from 'react'
import { Rect } from 'spase'
import styled from 'styled-components'
import { Orientation } from './types'

const debug = process.env.NODE_ENV === 'development' ? require('debug')('etudes:masonry-grid') : () => {}

export interface Props {
  className?: string
  style: CSSProperties
  children?: ReactNode | ReactNode[]
  areSectionsAligned: boolean
  isReversed: boolean
  horizontalSpacing: number
  orientation: Orientation
  sections: number
  verticalSpacing: number
  height?: string
  width?: string
}

/**
 * This is a React component that arranges all of its immediate children in a masonry grid. Refrain
 * from assigning CSS styles to it via `className` or `style` property, though they are still
 * handled if absolutely necessary. Customize the grid via its supported properties. The grid can be
 * in either vertical or horizontal orientation. The length of every child element *parallel to the
 * direction of the orientation* is automatically set according to the number of sections specified
 * for the grid. This means that in an horizontally oriented grid, the *width* of each child element
 * is automatically set, whereas in a vertically oriented grid the *height* of each child element is
 * automatically set. Additionally, the *number of sections* corresponds to the maximum the number
 * of child elements present in the direction that is parallel to the orientation of the grid.
 * Hence, in a vertically oriented grid, *number of secitons* refers to the *number of rows*,
 * whereas in a horizontally oriented grid, *number of sections* refers to the *number of columns*.
 */
class MasonryGrid extends PureComponent<Props> {
  static defaultProps: Props = {
    areSectionsAligned: false,
    horizontalSpacing: 0,
    isReversed: false,
    orientation: 'vertical',
    sections: 3,
    style: {},
    verticalSpacing: 0,
  }

  static BASE_MODIFIER_CLASS_PREFIX = 'base-'

  private nodeRefs = {
    root: createRef<HTMLDivElement>(),
  }

  private minWidth = NaN
  private maxWidth = NaN
  private minHeight = NaN
  private maxHeight = NaN

  private updateDelegate?: UpdateDelegate = undefined

  get width(): number {
    return Rect.from(this.nodeRefs.root.current)?.width ?? 0
  }

  get height(): number {
    return Rect.from(this.nodeRefs.root.current)?.height ?? 0
  }

  componentDidMount() {
    this.reconfigureUpdateDelegate()
  }

  componentDidUpdate(prevProps: Props) {
    this.reconfigureUpdateDelegate()
  }

  componentWillUnmount() {
    this.updateDelegate?.deinit()
  }

  render() {
    return (
      <StyledRoot
        ref={this.nodeRefs.root}
        className={this.props.className}
        orientation={this.props.orientation}
        style={{
          ...this.props.style,
          height: this.props.height ?? ((this.props.orientation === 'vertical' && !isNaN(this.minHeight)) ? `${this.minHeight}px` : ''),
          width: this.props.width ?? ((this.props.orientation === 'horizontal' && !isNaN(this.minWidth)) ? `${this.minWidth}px` : ''),
          flex: '0 0 auto',
          padding: '0',
        }}
      >
        {this.props.children}
      </StyledRoot>
    )
  }

  update(info: DirtyInfo) {
    const { [DirtyType.SIZE]: dirtySize } = info

    if (dirtySize) {
      if ((this.minWidth !== this.width) || (this.minHeight !== this.height) || (dirtySize.maxSize.width !== this.maxWidth) || dirtySize.maxSize.height !== this.maxHeight) {
        this.repositionChildren()
        this.maxWidth = dirtySize.maxSize.width
        this.maxHeight = dirtySize.maxSize.height
      }
    }
  }

  /**
   * Repositions all the child elements of the grid.
   */
  private repositionChildren() {
    const rootNode = this.nodeRefs.root.current

    if (!rootNode) return

    debug('Repositioning children... OK')

    const children = rootNode.children
    const numSections = this.props.sections

    if (numSections <= 0) throw new Error('You must specifiy a minimum of 1 section(s) (a.k.a. row(s) for horizontal orientation, column(s) for vertical orientation) for a MasonryGrid instance')

    if (this.props.orientation === 'vertical') {
      const sectionHeights: number[] = [...new Array(numSections)].map(() => 0)

      for (let i = 0; i < children.length; i++) {
        const child = children[i]

        if (!(child instanceof HTMLElement)) continue

        const base = this.computeBaseFromElement(child)
        const [colIdx, y] = this.computeNextAvailableSectionAndLengthByBase(sectionHeights, base)

        child.style.position = 'absolute'
        child.style.width = `calc(${100 / numSections * base}% - ${(this.props.horizontalSpacing * (numSections - 1) / numSections) * base}px + ${this.props.horizontalSpacing * (base - 1)}px)`
        child.style.height = ''
        child.style.left = `calc(${100 / numSections * colIdx}% - ${(this.props.horizontalSpacing * (numSections - 1) / numSections) * colIdx}px + ${this.props.horizontalSpacing * colIdx}px)`
        child.style.top = `${y + (y === 0 ? 0 : this.props.verticalSpacing)}px`

        for (let j = 0; j < base; j++) {
          sectionHeights[colIdx + j] = y + (y === 0 ? 0 : this.props.verticalSpacing) + (Rect.from(child)?.height ?? 0)
        }

        if (this.props.areSectionsAligned && ((colIdx + base) === numSections)) {
          const m = this.computeMaxLength(sectionHeights)

          for (let j = 0; j < numSections; j++) {
            sectionHeights[j] = m
          }
        }
      }

      this.minWidth = this.width
      this.minHeight = this.computeMaxLength(sectionHeights, numSections)
      rootNode.style.height = `${this.minHeight}px`

      if (this.props.isReversed) {
        for (let i = 0; i < children.length; i++) {
          const child = children[i]

          if (!(child instanceof HTMLElement)) continue

          const x = parseFloat(child.style.left)

          child.style.left = `${this.width - x - parseFloat(child.style.width)}px`
        }
      }
    }
    else {
      const sectionWidths: number[] = [...new Array(numSections)].map(() => 0)

      for (let i = 0; i < children.length; i++) {
        const child = children[i]

        if (!(child instanceof HTMLElement)) continue

        const base = this.computeBaseFromElement(child)
        const [rowIdx, x] = this.computeNextAvailableSectionAndLengthByBase(sectionWidths, base)

        child.style.position = 'absolute'
        child.style.width = ''
        child.style.height = `calc(${100 / numSections * base}% - ${(this.props.verticalSpacing * (numSections - 1) / numSections) * base}px + ${this.props.verticalSpacing * (base - 1)}px)`
        child.style.top = `calc(${100 / numSections * rowIdx}% - ${(this.props.verticalSpacing * (numSections - 1) / numSections) * rowIdx}px + ${this.props.verticalSpacing * rowIdx}px)`
        child.style.left = `${x + (x === 0 ? 0 : this.props.horizontalSpacing)}px`

        for (let j = 0; j < base; j++) {
          sectionWidths[rowIdx + j] = x + (x === 0 ? 0 : this.props.horizontalSpacing) + (Rect.from(child)?.width ?? 0)
        }

        if (this.props.areSectionsAligned && ((rowIdx + base) === numSections)) {
          const m = this.computeMaxLength(sectionWidths)

          for (let j = 0; j < numSections; j++) {
            sectionWidths[j] = m
          }
        }
      }

      this.minHeight = this.height
      this.minWidth = this.computeMaxLength(sectionWidths, numSections)
      if (!isNaN(this.minWidth)) rootNode.style.width = `${this.minWidth}px`

      if (this.props.isReversed) {
        for (let i = 0; i < children.length; i++) {
          const child = children[i]

          if (!(child instanceof HTMLElement)) continue

          const y = parseFloat(child.style.top)

          child.style.top = `${this.height - y - parseFloat(child.style.height)}px`
        }
      }
    }
  }

  /**
   * Computes the index and current length of the next available section for a specific base value,
   * based on a provided array of existing section lengths.
   *
   * @param currentSectionLengths - An array of the current section lengths.
   * @param base - The base value of the item to be inserted into the grid, and to be used to
   *               evaluate the next available section.
   *
   * @returns An array consiting of the computed section index and its to-be length if a new item
   *          were to be placed in it.
   */
  private computeNextAvailableSectionAndLengthByBase(currentSectionLengths: number[], base: number): [number, number] {
    if (currentSectionLengths.length !== this.props.sections) throw new Error('Unmatched number of provided section lengths')

    const numSections = currentSectionLengths.length

    let sectionIdx = NaN
    let minLength = Infinity

    for (let i = 0; i < numSections; i++) {
      const length = currentSectionLengths[i]
      const isShorter = length < minLength
      const isEligibleSection = (i + base) <= numSections
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
      return [0, this.computeMaxLength(currentSectionLengths, base)]
    }
    else {
      return [sectionIdx, minLength]
    }
  }

  /**
   * A helper function that computes the max section length of an array of section lengths. Only the
   * first n = `base` sections are inspected.
   *
   * @param currentSectionLengths - An array of section lengths.
   * @param base - The number representing the first n sections to inspect. Any non-numerical values
   *               will be ignored and return value will be based on all sections. A `base` value
   *               will be clamped between 1 and the maximum length of the array of section lengths.
   *
   * @returns The max section length.
   */
  private computeMaxLength(currentSectionLengths: number[], base?: number): number {
    let arr = currentSectionLengths

    if (base !== undefined && base !== null && !isNaN(base)) {
      arr = arr.slice(0, Math.max(1, Math.min(base, currentSectionLengths.length)))
    }

    return arr.reduce((out, curr, i) => (curr > out) ? curr : out, 0)
  }

  /**
   * Computes the base value of an element from its classes.
   *
   * @param element - The HTML element.
   *
   * @returns The computed base value that is clamped between 1 and max number of sections.
   */
  private computeBaseFromElement(element: HTMLElement): number {
    const classList = element.classList

    for (let i = 0; i < classList.length; i++) {
      const c = classList[i]

      if (c.startsWith(MasonryGrid.BASE_MODIFIER_CLASS_PREFIX)) {
        const base = parseFloat(c.replace(MasonryGrid.BASE_MODIFIER_CLASS_PREFIX, ''))
        if (!isNaN(base)) return Math.min(Math.max(base, 1), this.props.sections)
      }
    }

    return 1
  }

  /**
   * Reinitializes the update delegate. If there are images within the body of the masonry grid, the
   * initialization will be deferred until all images are loaded.
   */
  private reconfigureUpdateDelegate() {
    this.updateDelegate?.deinit()

    this.updateDelegate = new UpdateDelegate(info => this.update(info), {
      [EventType.RESIZE]: true,
    })

    const imageSources = this.getAllImageSources(this.nodeRefs.root.current?.innerHTML)

    if (imageSources.length > 0) {
      let loaded = 0
      const numImages = imageSources.length

      for (let i = 0; i < numImages; i++) {
        const src = imageSources[i]
        const image = new Image()
        image.src = src
        image.onload = () => {
          if (++loaded === numImages) this.updateDelegate?.init()
        }
      }
    }
    else {
      this.updateDelegate?.init()
    }
  }

  /**
   * Scans an HTML string and returns all the image sources.
   *
   * @param htmlString The HTML string.
   *
   * @returns The image sources.
   */
  private getAllImageSources(htmlString?: string): string[] {
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
}

export default MasonryGrid

const StyledRoot = styled.div<{
  orientation: Props['orientation']
}>`
  box-sizing: border-box;
  display: block;
  height: ${props => props.orientation === 'vertical' ? 'auto' : '100%'};
  position: relative;
  width: ${props => props.orientation === 'horizontal' ? 'auto' : '100%'};
`
