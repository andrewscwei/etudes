import classNames from 'classnames'
import isEqual from 'fast-deep-equal'
import React, { forwardRef, useEffect, useState, type ComponentType, type HTMLAttributes, type PropsWithChildren, type ReactElement, type Ref } from 'react'
import Each from './Each'
import FlatSVG from './FlatSVG'
import List, { type ListItemProps, type ListProps } from './List'
import usePrevious from './hooks/usePrevious'
import asClassNameDict from './utils/asClassNameDict'
import asStyleDict from './utils/asStyleDict'
import cloneStyledElement from './utils/cloneStyledElement'
import styles from './utils/styles'

export type AccordionItemProps<T> = ListItemProps<T>

export type AccordionHeaderProps<T> = HTMLAttributes<HTMLElement> & PropsWithChildren<{
  data: AccordionSectionData<T>
  index: number
  isCollapsed: boolean
}>

export type AccordionSectionData<T> = {
  label: string
  items: T[]
}

export type AccordionProps<T> = HTMLAttributes<HTMLDivElement> & Omit<ListProps<T>, 'data' | 'itemComponentType' | 'selectedIndices' | 'onActivateAt' | 'onSelectAt' | 'onDeselectAt'> & PropsWithChildren<{
  /**
   * Specifies if expanded sections should automatically collapse upon expanding
   * another section.
   */
  autoCollapse?: boolean

  /**
   * SVG markup to be put in the section header as the collapse icon.
   */
  collapseIconSvg?: string

  /**
   * Data provided to each section.
   */
  data: AccordionSectionData<T>[]

  /**
   * Indices of sections that are expanded.
   */
  expandedSectionIndices?: number[]

  /**
   * SVG markup to be put in the section header as the expand icon.
   */
  expandIconSvg?: string

  /**
   * React component type to be used for generating headers inside the
   * component. When absent, one will be generated automatically.
   */
  headerComponentType?: ComponentType<AccordionHeaderProps<T>>

  /**
   * React component type to be used for generating items inside the component.
   */
  itemComponentType: ComponentType<AccordionItemProps<T>>

  /**
   * Maximum number of items that are viside when a section expands. When a
   * value greater than or equal to 0 is specified, only that number of items
   * will be visible at a time, and a scrollbar will appear to scroll to
   * remaining items. Any value less than 0 indicates that all items will be
   * visible when a section expands.
   */
  maxVisibleItems?: number

  /**
   * Padding (in pixels) between each section.
   */
  sectionPadding?: number

  /**
   * Indices of selected items per section.
   */
  selectedItemIndices?: Record<number, number[]>

  /**
   * Handler invoked when an item is activated in a section.
   *
   * @param sectionIndex Section index.
   * @param itemIndex Item index.
   */
  onActivateAt?: (sectionIndex: number, itemIndex: number) => void

  /**
   * Handler invoked when a section is collapsed.
   *
   * @param sectionIndex Section index.
   */
  onCollapseSectionAt?: (sectionIndex: number) => void

  /**
   * Handler invoked when an item is deselected in a section.
   *
   * @param sectionIndex Section index.
   * @param itemIndex Item index.
   */
  onDeselectAt?: (sectionIndex: number, itemIndex: number) => void

  /**
   * Handler invoked when a section is expanded.
   *
   * @param sectionIndex Section index.
   */
  onExpandSectionAt?: (sectionIndex: number) => void

  /**
   * Handler invoked when an item is selected in a section.
   *
   * @param sectionIndex Section index.
   * @param itemIndex Item index.
   */
  onSelectAt?: (sectionIndex: number, itemIndex: number) => void

  /**
   * Handler invoked when selected items have changed.
   *
   * @param selectedIndices Dictionary of indices of selected items per section.
   */
  onSelectionChange?: (selectedIndices: Record<number, number[]>) => void
}>

export default forwardRef(({
  children,
  className,
  style,
  autoCollapse = false,
  borderThickness = 0,
  collapseIconSvg,
  data,
  expandedSectionIndices: externalExpandedSectionIndices = [],
  expandIconSvg,
  headerComponentType: HeaderComponent,
  isTogglable,
  itemComponentType,
  itemLength = 50,
  itemPadding = 0,
  maxVisibleItems = -1,
  orientation = 'vertical',
  sectionPadding = 0,
  selectedItemIndices: externalSelectedItemIndices = {},
  selectionMode = 'single',
  onActivateAt,
  onCollapseSectionAt,
  onDeselectAt,
  onExpandSectionAt,
  onSelectAt,
  onSelectionChange,
  ...props
}, ref) => {
  const isSectionExpandedAt = (idx: number) => expandedSectionIndices.indexOf(idx) >= 0

  const toggleSectionAt = (idx: number) => {
    if (isSectionExpandedAt(idx)) {
      setExpandedSectionIndices(prev => prev.filter(t => t !== idx))
    }
    else if (autoCollapse) {
      setExpandedSectionIndices([idx])
    }
    else {
      setExpandedSectionIndices(prev => [...prev.filter(t => t !== idx), idx])
    }
  }

  const selectAt = (sectionIdx: number, itemIdx: number) => {
    switch (selectionMode) {
      case 'multiple':
        setSelectedItemIndices(prev => ({
          ...prev,
          [sectionIdx]: [...(prev[sectionIdx] ?? []).filter(t => t !== itemIdx), itemIdx],
        }))

        onSelectAt?.(sectionIdx, itemIdx)

        break
      case 'single':
        setSelectedItemIndices({ [sectionIdx]: [itemIdx] })
        onSelectAt?.(sectionIdx, itemIdx)

        break
      default:
        break
    }
  }

  const deselectAt = (sectionIdx: number, itemIdx: number) => {
    setSelectedItemIndices(prev => ({
      ...prev,
      [sectionIdx]: (prev[sectionIdx] ?? []).filter(t => t !== itemIdx),
    }))

    onDeselectAt?.(sectionIdx, itemIdx)
  }

  const [expandedSectionIndices, setExpandedSectionIndices] = useState(externalExpandedSectionIndices)
  const prevExpandedSectionIndices = usePrevious(expandedSectionIndices)
  const [selectedItemIndices, setSelectedItemIndices] = useState(externalSelectedItemIndices)

  useEffect(() => {
    if (isEqual(externalExpandedSectionIndices, expandedSectionIndices)) return

    setExpandedSectionIndices(externalExpandedSectionIndices)
  }, [JSON.stringify(externalExpandedSectionIndices)])

  useEffect(() => {
    if (isEqual(externalSelectedItemIndices, selectedItemIndices)) return

    setSelectedItemIndices(externalSelectedItemIndices)
  }, [JSON.stringify(externalSelectedItemIndices)])

  useEffect(() => {
    const collapsed = prevExpandedSectionIndices?.filter(t => expandedSectionIndices.indexOf(t) === -1) ?? []
    const expanded = expandedSectionIndices.filter(t => prevExpandedSectionIndices?.indexOf(t) === -1)

    collapsed.map(t => onCollapseSectionAt?.(t))
    expanded.map(t => onExpandSectionAt?.(t))
  }, [JSON.stringify(expandedSectionIndices)])

  useEffect(() => {
    onSelectionChange?.(selectedItemIndices)
  }, [JSON.stringify(selectedItemIndices)])

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
      cursor: 'pointer',
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
      pointerEvents: 'none',
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
          const isCollapsed = !isSectionExpandedAt(sectionIdx)
          const expandIconComponent = expandIconSvg ? <FlatSVG svg={expandIconSvg} style={defaultStyles.expandIcon}/> : <></>
          const collapseIconComponent = collapseIconSvg ? <FlatSVG svg={collapseIconSvg} style={defaultStyles.collapseIcon}/> : expandIconComponent

          return (
            <div style={styles(fixedStyles.section, orientation === 'vertical' ? {
              marginTop: sectionIdx === 0 ? '0px' : `${sectionPadding - borderThickness}px`,
            } : {
              marginLeft: sectionIdx === 0 ? '0px' : `${sectionPadding - borderThickness}px`,
            })}>
              {HeaderComponent ? (
                <HeaderComponent
                  className={classNames(fixedClassNames.header, { collapsed: isCollapsed, expanded: !isCollapsed })}
                  style={styles(fixedStyles.header)}
                  data={section}
                  index={sectionIdx}
                  isCollapsed={isCollapsed}
                  onClick={() => toggleSectionAt(sectionIdx)}
                />
              ) : (
                <button
                  className={classNames(fixedClassNames.header, { collapsed: isCollapsed, expanded: !isCollapsed })}
                  style={styles(fixedStyles.header, defaultStyles.header)}
                  onClick={() => toggleSectionAt(sectionIdx)}
                >
                  <label style={fixedStyles.headerLabel} dangerouslySetInnerHTML={{ __html: section.label }}/>
                  {cloneStyledElement(isCollapsed ? expandIconComponent : collapseIconComponent, {
                    className: classNames(isCollapsed ? fixedClassNames.expandIcon : fixedClassNames.collapseIcon),
                    style: styles(isCollapsed ? fixedStyles.expandIcon : fixedStyles.collapseIcon),
                  })}
                </button>
              )}
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
                selectionMode={selectionMode}
                isTogglable={isTogglable}
                itemComponentType={itemComponentType}
                itemLength={itemLength}
                itemPadding={itemPadding}
                orientation={orientation}
                selectedIndices={selectedItemIndices[sectionIdx] ?? []}
                onActivateAt={itemIdx => onActivateAt?.(sectionIdx, itemIdx)}
                onDeselectAt={itemIdx => deselectAt(sectionIdx, itemIdx)}
                onSelectAt={itemIdx => selectAt(sectionIdx, itemIdx)}
              />
            </div>
          )
        }}
      </Each>
    </div>
  )
}) as <T>(props: AccordionProps<T> & { ref?: Ref<HTMLDivElement> }) => ReactElement
