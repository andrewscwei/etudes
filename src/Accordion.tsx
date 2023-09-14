import classNames from 'classnames'
import React, { forwardRef, useEffect, useState, type ComponentType, type HTMLAttributes, type PropsWithChildren, type ReactElement, type Ref } from 'react'
import Each from './Each'
import FlatSVG from './FlatSVG'
import List, { type ListItemProps } from './List'
import asClassNameDict from './utils/asClassNameDict'
import asComponentDict from './utils/asComponentDict'
import asStyleDict from './utils/asStyleDict'
import cloneStyledElement from './utils/cloneStyledElement'
import styles from './utils/styles'

type Orientation = 'horizontal' | 'vertical'

export type AccordionItemProps<T> = ListItemProps<T>

export type AccordionSectionData<T> = {
  label: string
  items: T[]
}

export type AccordionProps<T> = HTMLAttributes<HTMLDivElement> & PropsWithChildren<{
  /**
   * Data provided to each section.
   */
  data: AccordionSectionData<T>[]

  /**
   * Indicates if sections can be toggled, as in, once a section is expanded,
   * it collapses when being selected again.
   */
  isTogglable?: boolean

  /**
   * Index of the section that is selected by default. Any value less than 0
   * indicates that no section is selected by default.
   */
  defaultExpandedSectionIndex?: number

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
   * Thickness of the border (in pixels) of every item and the section header
   * itself. 0 indicates no borders.
   */
  borderThickness?: number

  /**
   * SVG markup to be put in the section header as the expand icon.
   */
  expandIconSvg?: string

  /**
   * SVG markup to be put in the section header as the collapse icon.
   */
  collapseIconSvg?: string

  /**
   * React component type to be used for generating items inside the component.
   */
  itemComponentType: ComponentType<AccordionItemProps<T>>

  /**
   * Handler invoked when the selected item index of any section changes.
   */
  onItemIndexChange?: (index: number) => void

  /**
   * Handler invoked when the selected section index changes.
   */
  onSectionIndexChange?: (index: number) => void
}>

export default forwardRef(({
  children,
  className,
  style,
  borderThickness = 0,
  data,
  defaultExpandedSectionIndex = -1,
  expandIconSvg,
  collapseIconSvg,
  isTogglable = true,
  itemComponentType,
  itemLength = 50,
  itemPadding = 0,
  maxVisibleItems = -1,
  orientation = 'vertical',
  sectionPadding = 0,
  onItemIndexChange,
  onSectionIndexChange,
  ...props
}, ref) => {
  const isSectionSelectedAt = (index: number) => expandedSectionIndex === index

  const toggleSectionAt = (index: number) => {
    if (isTogglable && isSectionSelectedAt(index)) {
      setExpandedSectionIndex(-1)
    }
    else {
      setExpandedSectionIndex(index)
    }
  }

  const [expandedSectionIndex, setExpandedSectionIndex] = useState(defaultExpandedSectionIndex)
  const [selectedSectionIndex, setSelectedSectionIndex] = useState(-1)
  const [selectedItemIndex, setSelectedItemIndex] = useState(-1)

  useEffect(() => {
    onSectionIndexChange?.(expandedSectionIndex)
  }, [expandedSectionIndex])

  useEffect(() => {
    onItemIndexChange?.(selectedItemIndex)
  }, [selectedItemIndex])

  const components = asComponentDict(children, {
    header: AccordionHeader,
    expandIcon: AccordionExpandIcon,
    collapseIcon: AccordionCollapseIcon,
  })

  const fixedClassNames = asClassNameDict({
    root: classNames(orientation),
    header: classNames(orientation),
    expandIcon: classNames(orientation),
    collapseIcon: classNames(orientation),
  })

  const fixedStyles = asStyleDict({
    root: {
      alignItems: 'center',
      boxSizing: 'border-box',
      display: 'flex',
      flex: '0 0 auto',
      justifyContent: 'flex-start',
      padding: '0',
      ...orientation === 'vertical' ? {
        flexDirection: 'column',
        height: 'auto',
      } : {
        flexDirection: 'row',
        width: 'auto',
      },
    },
    section: {
      alignItems: 'flex-start',
      display: 'flex',
      flex: '0 0 auto',
      justifyContent: 'flex-start',
      margin: '0',
      padding: '0',
      ...orientation === 'vertical' ? {
        flexDirection: 'column',
        width: '100%',
      } : {
        flexDirection: 'row',
        height: '100%',
      },
    },
    header: {
      borderWidth: `${borderThickness}px`,
      margin: '0',
      outline: 'none',
      ...orientation === 'vertical' ? {
        width: '100%',
      } : {
        height: '100%',
      },
    },
    headerLabel: {
      color: 'inherit',
      fontFamily: 'inherit',
      fontSize: 'inherit',
      fontWeight: 'inherit',
      letterSpacing: 'inherit',
      lineHeight: 'inherit',
      transition: 'inherit',
    },
    expandIcon: {
      margin: '0',
      padding: '0',
    },
    collapseIcon: {
      margin: '0',
      padding: '0',
    },
    list: {
      transitionDuration: '100ms',
      transitionTimingFunction: 'ease-out',
      ...orientation === 'vertical' ? {
        width: '100%',
        transitionProperty: 'height, margin',
        top: '100%',
      } : {
        height: '100%',
        transitionProperty: 'width, margin',
        left: '100%',
      },
    },
  })

  const defaultStyles = asStyleDict({
    header: {
      alignItems: 'center',
      background: '#fff',
      borderStyle: 'solid',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: '0 10px',
      transitionDuration: '100ms',
      transitionProperty: 'transform, opacity, background, color',
      transitionTimingFunction: 'ease-out',
      ...orientation === 'vertical' ? {
        height: '50px',
      } : {
        width: '50px',
      },
    },
    expandIcon: {
      boxSizing: 'border-box',
      display: 'block',
      fill: '#000',
      height: '15px',
      transformOrigin: 'center',
      transitionDuration: '100ms',
      transitionProperty: 'transform',
      transitionTimingFunction: 'ease-out',
      width: '15px',
    },
    collapseIcon: {
      boxSizing: 'border-box',
      display: 'block',
      fill: '#000',
      height: '15px',
      transformOrigin: 'center',
      transitionDuration: '100ms',
      transitionProperty: 'transform',
      transitionTimingFunction: 'ease-out',
      width: '15px',
    },
  })

  return (
    <div
      {...props}
      className={classNames(className, fixedClassNames.root)}
      style={styles(style, fixedStyles.root)}
    >
      <Each in={data}>
        {(section, sectionIdx) => {
          const numItems = section.items.length
          const numVisibleItems = maxVisibleItems < 0 ? numItems : Math.min(numItems, maxVisibleItems)
          const menuLength = (itemLength - borderThickness) * numVisibleItems + itemPadding * (numVisibleItems - 1) + borderThickness
          const isCollapsed = !isSectionSelectedAt(sectionIdx)
          const headerComponent = components.header ?? <AccordionHeader style={defaultStyles.header}/>
          const expandIconComponent = components.expandIcon ?? (expandIconSvg ? <FlatSVG svg={expandIconSvg} style={defaultStyles.expandIcon}/> : <></>)
          const collapseIconComponent = components.collapseIcon ?? (collapseIconSvg ? <FlatSVG svg={collapseIconSvg} style={defaultStyles.collapseIcon}/> : expandIconComponent)

          return (
            <div style={styles(fixedStyles.section, orientation === 'vertical' ? {
              marginTop: sectionIdx === 0 ? '0px' : `${sectionPadding - borderThickness}px`,
            } : {
              marginLeft: sectionIdx === 0 ? '0px' : `${sectionPadding - borderThickness}px`,
            })}>
              {cloneStyledElement(headerComponent, {
                className: classNames(fixedClassNames.header, {
                  collapsed: isCollapsed,
                  expanded: !isCollapsed,
                }),
                style: styles(fixedStyles.header),
                onClick: () => toggleSectionAt(sectionIdx),
              }, ...[
                <label style={fixedStyles.headerLabel} dangerouslySetInnerHTML={{ __html: section.label }}/>,
                cloneStyledElement(isCollapsed ? expandIconComponent : collapseIconComponent, {
                  className: classNames(isCollapsed ? fixedClassNames.expandIcon : fixedClassNames.collapseIcon),
                  style: styles(isCollapsed ? fixedStyles.expandIcon : fixedStyles.collapseIcon),
                }),
              ])}
              <List
                style={styles(fixedStyles.list, orientation === 'vertical' ? {
                  height: isCollapsed ? '0px' : `${menuLength}px`,
                  marginTop: isCollapsed ? '0px' : `${itemPadding - borderThickness}px`,
                  overflowY: maxVisibleItems === -1 ? 'hidden' : maxVisibleItems < numItems ? 'scroll' : 'hidden',
                } : {
                  marginLeft: isCollapsed ? '0px' : `${itemPadding - borderThickness}px`,
                  overflowX: maxVisibleItems === -1 ? 'hidden' : maxVisibleItems < numItems ? 'scroll' : 'hidden',
                  width: isCollapsed ? '0px' : `${menuLength}px`,
                })}
                borderThickness={borderThickness}
                data={section.items}
                isSelectable={true}
                isTogglable={isTogglable}
                itemComponentType={itemComponentType}
                itemLength={itemLength}
                itemPadding={itemPadding}
                orientation={orientation}
                selectedIndex={selectedSectionIndex === sectionIdx ? selectedItemIndex : -1}
                onDeselectAt={() => {
                  if (selectedSectionIndex !== sectionIdx) return
                  setSelectedSectionIndex(-1)
                  setSelectedItemIndex(-1)
                }}
                onSelectAt={itemIdx => {
                  setSelectedSectionIndex(sectionIdx)
                  setSelectedItemIndex(itemIdx)
                }}
              />
            </div>
          )
        }}
      </Each>
    </div>
  )
}) as <T>(props: AccordionProps<T> & { ref?: Ref<HTMLDivElement> }) => ReactElement

export const AccordionHeader = ({ children, ...props }: HTMLAttributes<HTMLButtonElement> & PropsWithChildren) => <button {...props}>{children}</button>

export const AccordionExpandIcon = ({ children, ...props }: HTMLAttributes<HTMLDivElement> & PropsWithChildren) => <div {...props}>{children}</div>

export const AccordionCollapseIcon = ({ children, ...props }: HTMLAttributes<HTMLDivElement> & PropsWithChildren) => <div {...props}>{children}</div>
