import React, { ComponentType, createRef, CSSProperties, PureComponent, RefObject } from 'react'
import styled, { css } from 'styled-components'
import List, { ItemComponentProps as ListItemComponentProps } from './List'
import { ExtendedCSSFunction, ExtendedCSSProps, Orientation } from './types'

const debug = process.env.NODE_ENV === 'development' ? require('debug')('etudes:accordion') : () => {}

/**
 * Interface defining the props of the item component type to be provided to the
 * component. The data type is generic.
 */
export type ItemComponentProps<T = Record<string, never>> = ListItemComponentProps<T>

export type SectionHeaderCSSProps = Readonly<{
  borderColor: string
  borderThickness: number
  isCollapsed: boolean
  orientation: Orientation
}>

export type SectionCSSProps = Readonly<{
  isCollapsed: boolean
  orientation: Orientation
}>

export interface SectionProps<T = Record<string, never>> {
  label: string
  items: Array<T>
}

export interface Props<T = Record<string, never>> {
  /**
   * Class attribute to the root element.
   */
  className?: string

  /**
   * Inline style attribute to the element.
   */
  style?: CSSProperties

  /**
   * Data provided to each section.
   */
  data: Array<SectionProps<T>>

  /**
   * Indicates if sections can be toggled, as in, once a section is expanded,
   * it collapses when being selected again.
   */
  isTogglable?: boolean

  /**
   * Index of the section that is selected by default. Any value less than 0
   * indicates that no section is selected by default.
   */
  defaultSelectedSectionIndex?: number

  /**
   * Length (in pixels) of each item. This does not apply to the section hedaer
   * itself. Length refers to the height in vertical orientation and width in
   * horizontal orientation.
   */
  itemLength?: number

  /**
   * Padding (in pixels) between each item.
   */
  itemPadding?: number

  /**
   * Padding (in pixels) between each section.
   */
  sectionPadding?: number

  /**
   * Maximum number of items that are viside when a section expands. When a
   * value greater than or equal to 0 is specified, only that number of items
   * will be visible at a time, and a scrollbar will appear to scroll to
   * remaining items. Any value less than 0 indicates that all items will be
   * visible when a section expands.
   */
  maxVisibleItems?: number

  /**
   * Orientation of the component.
   */
  orientation?: Orientation

  /**
   * Color of the border of every item and the section header itself.
   */
  borderColor?: string

  /**
   * Thickness of the border (in pixels) of every item and the section header
   * itself. 0 indicates no borders.
   */
  borderThickness?: number

  /**
   * SVG markup to be put in the section header as the expand icon.
   */
  expandIconSvg?: string

  /**
   * React component type to be used for generating items inside the component.
   */
  itemComponentType: ComponentType<ItemComponentProps<T>>

  /**
   * Handler invoked when the selected item index of any section changes.
   */
  onItemIndexChange?: (index: number) => void

  /**
   * Handler invoked when the selected section index changes.
   */
  onSectionIndexChange?: (index: number) => void

  /**
   * Additional CSS to be provided to each section element.
   */
  sectionCSS?: ExtendedCSSFunction<SectionCSSProps>

  /**
   * Additional CSS to be provided to each section header element.
   */
  sectionHeaderCSS?: ExtendedCSSFunction<SectionHeaderCSSProps>
}

export interface State {
  /**
   * Current selected section index.
   */
  selectedSectionIndex: number

  /**
   * Current selected item index of the expanded section.
   */
  selectedItemIndex: number
}

export default class Accordion<T = Record<string, never>> extends PureComponent<Props<T>, State> {
  nodeRefs = {
    lists: [] as Array<RefObject<List<T>>>,
  }

  constructor(props: Props<T>) {
    super(props)

    this.state = {
      selectedSectionIndex: props.defaultSelectedSectionIndex ?? -1,
      selectedItemIndex: -1,
    }
  }

  componentDidMount() {
    this.props.onSectionIndexChange?.(this.state.selectedSectionIndex)
    this.props.onItemIndexChange?.(this.state.selectedItemIndex)
  }

  componentDidUpdate(prevProps: Props<T>, prevState: State) {
    if (prevState.selectedSectionIndex !== this.state.selectedSectionIndex) {
      debug(`Changing section index to ${this.state.selectedSectionIndex}... OK`)
      this.props.onSectionIndexChange?.(this.state.selectedSectionIndex)
    }

    if (prevState.selectedItemIndex !== this.state.selectedItemIndex) {
      debug(`Changing item index to ${this.state.selectedItemIndex}... OK`)
      this.props.onItemIndexChange?.(this.state.selectedItemIndex)
    }
  }

  render() {
    const borderColor = this.props.borderColor ?? '#000'
    const borderThickness = this.props.borderThickness ?? 0
    const isTogglable = this.props.isTogglable ?? true
    const itemLength = this.props.itemLength ?? 50
    const itemPadding = this.props.itemPadding ?? 0
    const sectionPadding = this.props.sectionPadding ?? 0
    const maxVisibleItems = this.props.maxVisibleItems ?? -1
    const orientation = this.props.orientation ?? 'vertical'

    this.nodeRefs.lists = []

    return (
      <StyledRoot
        className={this.props.className}
        orientation={orientation}
        style={{
          ...this.props.style ?? {},
          ...(orientation === 'vertical' ? {
            height: 'auto',
          } : {
            width: 'auto',
          }),
        }}
      >
        {this.props.data.map((section, i) => {
          const numItems = section.items.length
          const numVisibleItems = maxVisibleItems < 0 ? numItems : Math.min(numItems, maxVisibleItems)
          const menuLength = (itemLength - borderThickness) * numVisibleItems + itemPadding * (numVisibleItems - 1) + borderThickness
          const isCollapsed = !this.isSectionSelectedAt(i)
          const ref = createRef<List<T>>()

          this.nodeRefs.lists.push(ref)

          return (
            <StyledSection
              key={`section-${i}`}
              isCollapsed={isCollapsed}
              orientation={orientation}
              extendedCSS={this.props.sectionCSS ?? (() => css``)}
              style={orientation === 'vertical' ? {
                marginTop: i === 0 ? '0px' : `${sectionPadding - borderThickness}px`,
              } : {
                marginLeft: i === 0 ? '0px' : `${sectionPadding - borderThickness}px`,
              }}
            >
              <StyledSectionHeader
                borderColor={borderColor}
                borderThickness={borderThickness}
                orientation={orientation}
                isCollapsed={isCollapsed}
                onClick={() => this.toggleSectionAt(i) }
                extendedCSS={this.props.sectionHeaderCSS ?? (() => css``)}
              >
                <label>{section.label}</label>
                {this.props.expandIconSvg && <span dangerouslySetInnerHTML={{ __html: this.props.expandIconSvg }}/>}
              </StyledSectionHeader>
              <StyledItemList
                ref={ref as any}
                borderColor={borderColor}
                borderThickness={borderThickness}
                data={section.items}
                defaultSelectedIndex={-1}
                isTogglable={isTogglable}
                itemComponentType={this.props.itemComponentType as any}
                itemPadding={itemPadding}
                onDeselectAt={idx => this.deselectItemAt(idx)}
                onSelectAt={idx => this.selectItemAt(idx)}
                orientation={orientation}
                shouldStaySelected={true}
                itemStyle={orientation === 'vertical' ? {
                  height: `${itemLength}px`,
                } : {
                  width: `${itemLength}px`,
                }}
                style={orientation === 'vertical' ? {
                  height: isCollapsed ? '0px' : `${menuLength}px`,
                  marginTop: isCollapsed ? '0px' : `${itemPadding - borderThickness}px`,
                  overflowY: (maxVisibleItems === -1) ? 'hidden' : (maxVisibleItems < numItems ? 'scroll' : 'hidden'),
                } : {
                  marginLeft: isCollapsed ? '0px' : `${itemPadding - borderThickness}px`,
                  overflowX: (maxVisibleItems === -1) ? 'hidden' : (maxVisibleItems < numItems ? 'scroll' : 'hidden'),
                  width: isCollapsed ? '0px' : `${menuLength}px`,
                }}
              />
            </StyledSection>
          )
        })}
      </StyledRoot>
    )
  }

  private isSectionSelectedAt(index: number): boolean {
    return this.state.selectedSectionIndex === index
  }

  private toggleSectionAt(index: number) {
    if ((this.props.isTogglable ?? true) && this.isSectionSelectedAt(index)) {
      this.deselectSectionAt(index)
    }
    else {
      this.selectSectionAt(index)
    }
  }

  private selectSectionAt(index: number) {
    if (this.isSectionSelectedAt(index)) return

    for (const ref of this.nodeRefs.lists) {
      ref.current?.setState({ selectedIndex: -1 })
    }

    this.setState({
      selectedSectionIndex: index,
    })
  }

  private deselectSectionAt(index: number) {
    if (!this.isSectionSelectedAt(index)) return

    for (const ref of this.nodeRefs.lists) {
      ref.current?.setState({ selectedIndex: -1 })
    }

    this.setState({
      selectedSectionIndex: -1,
    })
  }

  private isItemSelectedAt(index: number): boolean {
    return (this.state.selectedItemIndex === index)
  }

  private toggleItemAt(index: number) {
    if ((this.props.isTogglable ?? true) && this.isItemSelectedAt(index)) {
      this.deselectItemAt(index)
    }
    else {
      this.selectItemAt(index)
    }
  }

  private selectItemAt(index: number) {
    if (this.isItemSelectedAt(index)) return

    this.setState({
      selectedItemIndex: index,
    })
  }

  private deselectItemAt(index: number) {
    if (!this.isItemSelectedAt(index)) return

    this.setState({
      selectedItemIndex: -1,
    })
  }
}

const StyledItemList = styled(List)<{
  itemPadding: number
  borderThickness: number
  orientation: Orientation
}>`
  transition-duration: 100ms;
  transition-timing-function: ease-out;

  ${props => props.orientation === 'vertical' ? css`
    width: 100%;
    transition-property: height, margin;
    will-change: height, margin;
    top: 100%;
  ` : css`
    height: 100%;
    transition-property: width, margin;
    will-change: width, margin;
    left: 100%;
  `}
`

const StyledSectionHeader = styled.button<SectionHeaderCSSProps & ExtendedCSSProps<SectionHeaderCSSProps>>`
  align-items: center;
  background: #fff;
  border-color: ${props => props.borderColor};
  border-style: solid;
  border-width: ${props => props.borderThickness};
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 0;
  padding: 0 10px;
  transition-duration: 100ms;
  transition-property: transform, opacity, background, color;
  transition-timing-function: ease-out;
  will-change: transform, opacity, background, color;

  label {
    color: #000;
    transition-duration: 100ms;
    transition-property: color;
    transition-timing-function: ease-out;
    will-change: color;
  }

  span {
    box-sizing: border-box;
    display: block;
    fill: #000;
    height: 15px;
    transform-origin: center;
    transition-duration: 100ms;
    transition-property: transform;
    transition-timing-function: ease-out;
    width: 15px;
    will-change: transform;

    svg {
      width: 100%;
      height: 100%;
      fill: inherit;

      * {
        fill: inherit;
        transition-duration: 100ms;
        transition-property: fill;
        transition-timing-function: ease-out;
      }
    }
  }

  ${props => props.orientation === 'vertical' ? css`
    height: 50px;
    width: 100%;
    ` : css`
    height: 100%;
    width: 50px;
  `}

  ${props => props.extendedCSS(props)}
`

const StyledSection = styled.section<SectionCSSProps & ExtendedCSSProps<SectionCSSProps>>`
  align-items: flex-start;
  box-sizing: border-box;
  display: flex;
  flex: 0 0 auto;
  justify-content: flex-start;
  margin: 0;
  padding: 0;
  position: relative;

  ${props => props.orientation === 'vertical' ? css`
    width: 100%;
    flex-direction: column;
    ` : css`
    height: 100%;
    flex-direction: row;
  `}

  ${props => props.extendedCSS(props)}
`

const StyledRoot = styled.div<{
  orientation: Orientation
}>`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex: 0 0 auto;
  justify-content: flex-start;
  padding: 0;
  position: relative;

  ${props => props.orientation === 'vertical' ? css`
    flex-direction: column;
    ` : css`
    flex-direction: row;
  `}
`
