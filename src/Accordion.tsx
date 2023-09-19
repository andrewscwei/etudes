import classNames from 'classnames'
import isDeepEqual from 'fast-deep-equal/react'
import React, { forwardRef, useEffect, useState, type ComponentType, type HTMLAttributes, type PropsWithChildren, type ReactElement, type Ref } from 'react'
import Each from './Each'
import FlatSVG from './FlatSVG'
import List, { type ListItemProps, type ListProps } from './List'
import usePrevious from './hooks/usePrevious'
import asClassNameDict from './utils/asClassNameDict'
import asStyleDict from './utils/asStyleDict'
import cloneStyledElement from './utils/cloneStyledElement'
import styles from './utils/styles'

export type AccordionItemProps<I> = ListItemProps<I>

export type AccordionHeaderProps<I, S extends AccordionSectionData<I> = AccordionSectionData<I>> = HTMLAttributes<HTMLElement> & PropsWithChildren<{
  section: S
  index: number
  isCollapsed: boolean
  onCustomEvent?: (name: string, info?: any) => void
}>

export type AccordionSectionData<I> = {
  label: string
  items: I[]
}

export type AccordionProps<I, S extends AccordionSectionData<I> = AccordionSectionData<I>> = HTMLAttributes<HTMLDivElement> & Omit<ListProps<I>, 'data' | 'itemComponentType' | 'selectedIndices' | 'onActivateAt' | 'onSelectAt' | 'onDeselectAt' | 'onSelectionChange'> & PropsWithChildren<{
  /**
   * Specifies if expanded sections should automatically collapse upon expanding
   * another section.
   */
  autoCollapseSections?: boolean

  /**
   * SVG markup to be put in the section header as the collapse icon.
   */
  collapseIconSvg?: string

  /**
   * Data provided to each section.
   */
  data: S[]

  /**
   * Indices of sections that are expanded.
   */
  expandedSectionIndices?: number[]

  /**
   * SVG markup to be put in the section header as the expand icon.
   */
  expandIconSvg?: string

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
   * React component type to be used for generating headers inside the
   * component. When absent, one will be generated automatically.
   */
  headerComponentType?: ComponentType<AccordionHeaderProps<I, S>>

  /**
   * React component type to be used for generating items inside the component.
   */
  itemComponentType: ComponentType<AccordionItemProps<I>>

  /**
   * Handler invoked when an item is activated in a section.
   *
   * @param itemIndex Item index.
   * @param sectionIndex Section index.
   */
  onActivateAt?: (itemIndex: number, sectionIndex: number) => void

  /**
   * Handler invoked when a section is collapsed.
   *
   * @param sectionIndex Section index.
   */
  onCollapseSectionAt?: (sectionIndex: number) => void

  /**
   * Handler invoked when an item is deselected in a section.
   *
   * @param itemIndex Item index.
   * @param sectionIndex Section index.
   */
  onDeselectAt?: (itemIndex: number, sectionIndex: number) => void

  /**
   * Handler invoked when a section is expanded.
   *
   * @param sectionIndex Section index.
   */
  onExpandSectionAt?: (sectionIndex: number) => void

  /**
   * Handler invoked when a custom event is dispatched from a section header.
   *
   * @param index Index of the section header.
   * @param eventName Name of the dispatched event.
   * @param eventInfo Optional info of the dispatched event.
   */
  onHeaderCustomEvent?: (index: number, eventName: string, eventInfo?: any) => void

  /**
   * Handler invoked when an item is selected in a section.
   *
   * @param itemIndex Item index.
   * @param sectionIndex Section index.
   */
  onSelectAt?: (itemIndex: number, sectionIndex: number) => void

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
  autoCollapseSections = false,
  borderThickness = 0,
  collapseIconSvg,
  data,
  expandedSectionIndices: externalExpandedSectionIndices = [],
  expandIconSvg,
  isSelectionTogglable = false,
  itemLength = 50,
  itemPadding = 0,
  maxVisibleItems = -1,
  orientation = 'vertical',
  sectionPadding = 0,
  selectedItemIndices: externalSelectedItemIndices = {},
  selectionMode = 'single',
  headerComponentType: HeaderComponent,
  itemComponentType,
  onActivateAt,
  onCollapseSectionAt,
  onDeselectAt,
  onExpandSectionAt,
  onHeaderCustomEvent,
  onSelectAt,
  onSelectionChange,
  ...props
}, ref) => {
  const isSectionIndexOutOfRange = (sectionIndex: number) => {
    if (sectionIndex >= data.length) return true
    if (sectionIndex < 0) return true

    return false
  }

  const isItemIndexOutOfRange = (itemIndex: number, sectionIndex: number) => {
    if (isSectionIndexOutOfRange(sectionIndex)) return true

    const items = data[sectionIndex].items

    if (itemIndex >= items.length) return true
    if (itemIndex < 0) return true

    return false
  }

  const sanitizeExpandedSectionIndices = (sectionIndices: number[]) => sectionIndices.sort().filter(t => !isSectionIndexOutOfRange(t))

  const sanitizeSelectedItemIndices = (itemIndices: Record<number, number[]>) => {
    const newValue: Record<number, number[]> = {}

    for (const sectionIndex in itemIndices) {
      if (!Object.prototype.hasOwnProperty.call(itemIndices, sectionIndex)) continue

      const indices = itemIndices[sectionIndex]

      if (!indices || !(indices instanceof Array) || indices.length === 0) continue

      newValue[sectionIndex] = indices.sort().filter(t => !isItemIndexOutOfRange(t, Number(sectionIndex)))
    }

    return newValue
  }

  const isSectionExpandedAt = (sectionIndex: number) => expandedSectionIndices.indexOf(sectionIndex) >= 0

  const toggleSectionAt = (sectionIndex: number) => {
    if (isSectionIndexOutOfRange(sectionIndex)) return

    if (isSectionExpandedAt(sectionIndex)) {
      setExpandedSectionIndices(prev => prev.filter(t => t !== sectionIndex))
    }
    else if (autoCollapseSections) {
      setExpandedSectionIndices([sectionIndex])
    }
    else {
      setExpandedSectionIndices(prev => [...prev.filter(t => t !== sectionIndex), sectionIndex].sort())
    }
  }

  const selectAt = (itemIndex: number, sectionIndex: number) => {
    if (isItemIndexOutOfRange(itemIndex, sectionIndex)) return

    switch (selectionMode) {
      case 'multiple':
        setSelectedItemIndices(prev => ({
          ...prev,
          [sectionIndex]: [...(prev[sectionIndex] ?? []).filter(t => t !== itemIndex), itemIndex].sort(),
        }))

        onSelectAt?.(itemIndex, sectionIndex)

        break
      case 'single':
        setSelectedItemIndices({
          [sectionIndex]: [itemIndex],
        })

        onSelectAt?.(itemIndex, sectionIndex)

        break
      default:
        break
    }
  }

  const deselectAt = (itemIndex: number, sectionIndex: number) => {
    if (isItemIndexOutOfRange(itemIndex, sectionIndex)) return

    setSelectedItemIndices(prev => {
      const { [sectionIndex]: indices, ...rest } = prev
      const newIndices = (indices ?? []).filter(t => t !== itemIndex)

      return newIndices.length > 0 ? { ...rest, [sectionIndex]: newIndices } : { ...rest }
    })

    onDeselectAt?.(itemIndex, sectionIndex)
  }

  const sanitizedExpandedSectionIndices = sanitizeExpandedSectionIndices(externalExpandedSectionIndices)
  const [expandedSectionIndices, setExpandedSectionIndices] = useState(sanitizedExpandedSectionIndices)
  const prevExpandedSectionIndices = usePrevious(expandedSectionIndices)

  const sanitizedExternalSelectedItemIndices = sanitizeSelectedItemIndices(externalSelectedItemIndices)
  const [selectedItemIndices, setSelectedItemIndices] = useState(sanitizedExternalSelectedItemIndices)
  const prevSelectedItemIndices = usePrevious(selectedItemIndices)

  useEffect(() => {
    if (isDeepEqual(sanitizedExpandedSectionIndices, expandedSectionIndices)) return

    setExpandedSectionIndices(sanitizedExpandedSectionIndices)
  }, [JSON.stringify(sanitizedExpandedSectionIndices)])

  useEffect(() => {
    if (isDeepEqual(expandedSectionIndices, sanitizedExpandedSectionIndices)) return

    const collapsed = prevExpandedSectionIndices?.filter(t => expandedSectionIndices.indexOf(t) === -1) ?? []
    const expanded = expandedSectionIndices.filter(t => prevExpandedSectionIndices?.indexOf(t) === -1)

    collapsed.map(t => onCollapseSectionAt?.(t))
    expanded.map(t => onExpandSectionAt?.(t))
  }, [JSON.stringify(expandedSectionIndices)])

  useEffect(() => {
    if (isDeepEqual(sanitizedExternalSelectedItemIndices, selectedItemIndices)) return

    setSelectedItemIndices(sanitizedExternalSelectedItemIndices)
  }, [JSON.stringify(sanitizedExternalSelectedItemIndices)])

  useEffect(() => {
    if (prevSelectedItemIndices === undefined) return

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
        {(section, sectionIndex) => {
          const numItems = section.items.length
          const numVisibleItems = maxVisibleItems < 0 ? numItems : Math.min(numItems, maxVisibleItems)
          const menuLength = (itemLength - borderThickness) * numVisibleItems + itemPadding * (numVisibleItems - 1) + borderThickness
          const isCollapsed = !isSectionExpandedAt(sectionIndex)
          const expandIconComponent = expandIconSvg ? <FlatSVG svg={expandIconSvg} style={defaultStyles.expandIcon}/> : <></>
          const collapseIconComponent = collapseIconSvg ? <FlatSVG svg={collapseIconSvg} style={defaultStyles.collapseIcon}/> : expandIconComponent

          return (
            <div style={styles(fixedStyles.section, orientation === 'vertical' ? {
              marginTop: sectionIndex === 0 ? '0px' : `${sectionPadding - borderThickness}px`,
            } : {
              marginLeft: sectionIndex === 0 ? '0px' : `${sectionPadding - borderThickness}px`,
            })}>
              {HeaderComponent ? (
                <HeaderComponent
                  className={classNames(fixedClassNames.header, { collapsed: isCollapsed, expanded: !isCollapsed })}
                  style={styles(fixedStyles.header)}
                  index={sectionIndex}
                  isCollapsed={isCollapsed}
                  section={section}
                  onClick={() => toggleSectionAt(sectionIndex)}
                  onCustomEvent={(name, info) => onHeaderCustomEvent?.(sectionIndex, name, info)}
                />
              ) : (
                <button
                  className={classNames(fixedClassNames.header, { collapsed: isCollapsed, expanded: !isCollapsed })}
                  style={styles(fixedStyles.header, defaultStyles.header)}
                  onClick={() => toggleSectionAt(sectionIndex)}
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
                isSelectionTogglable={isSelectionTogglable}
                itemComponentType={itemComponentType}
                itemLength={itemLength}
                itemPadding={itemPadding}
                orientation={orientation}
                selectedIndices={selectedItemIndices[sectionIndex] ?? []}
                onActivateAt={itemIndex => onActivateAt?.(itemIndex, sectionIndex)}
                onDeselectAt={itemIndex => deselectAt(itemIndex, sectionIndex)}
                onSelectAt={itemIndex => selectAt(itemIndex, sectionIndex)}
              />
            </div>
          )
        }}
      </Each>
    </div>
  )
}) as <I, S extends AccordionSectionData<I> = AccordionSectionData<I>>(props: AccordionProps<I, S> & { ref?: Ref<HTMLDivElement> }) => ReactElement
