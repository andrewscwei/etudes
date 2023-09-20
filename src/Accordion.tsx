import classNames from 'classnames'
import isDeepEqual from 'fast-deep-equal/react'
import React, { forwardRef, useEffect, useState, type ComponentType, type HTMLAttributes, type PropsWithChildren, type ReactElement, type Ref } from 'react'
import Each from './Each'
import FlatSVG from './FlatSVG'
import List, { type ListItemProps, type ListOrientation, type ListProps } from './List'
import usePrevious from './hooks/usePrevious'
import asClassNameDict from './utils/asClassNameDict'
import asStyleDict from './utils/asStyleDict'
import cloneStyledElement from './utils/cloneStyledElement'
import styles from './utils/styles'

export type AccordionSectionData<I> = {
  label: string
  items: I[]
}

export type AccordionSelection = Record<number, number[]>

export type AccordionItemProps<T> = ListItemProps<T>

export type AccordionHeaderProps<I, S extends AccordionSectionData<I> = AccordionSectionData<I>> = HTMLAttributes<HTMLElement> & PropsWithChildren<{
  index: number
  isCollapsed: boolean
  sectionData: S
  onCustomEvent?: (name: string, info?: any) => void
}>

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
   * Maximum number of items that are viside per section when a section expands.
   * When a value greater than or equal to 0 is specified, only that number of
   * items will be visible at a time, and a scrollbar will appear to scroll to
   * remaining items. Any value less than 0 indicates that all items will be
   * visible when a section expands.
   */
  maxVisibleItems?: number[]

  /**
   * Padding (in pixels) between each section.
   */
  sectionPadding?: number

  /**
   * Indices of selected items per section.
   */
  selection?: AccordionSelection

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
   * Specifies if the component should use default styles.
   */
  useDefaultStyles?: boolean

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
   * @param sectionIndex Index of the section which the header belongs.
   * @param eventName Name of the dispatched event.
   * @param eventInfo Optional info of the dispatched event.
   */
  onHeaderCustomEvent?: (sectionIndex: number, eventName: string, eventInfo?: any) => void

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
  onSelectionChange?: (selection: AccordionSelection) => void
}>

type StylesProps = {
  borderThickness?: number
  orientation?: ListOrientation
}

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
  maxVisibleItems,
  orientation = 'vertical',
  sectionPadding = 0,
  selection: externalSelection = {},
  selectionMode = 'single',
  useDefaultStyles = false,
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

  const sanitizeSelection = (selection: AccordionSelection) => {
    const newValue: AccordionSelection = {}

    for (const sectionIndex in data) {
      if (!Object.prototype.hasOwnProperty.call(data, sectionIndex)) continue

      const indices = [...selection[sectionIndex] ?? []].sort()

      newValue[Number(sectionIndex)] = indices.sort().filter(t => !isItemIndexOutOfRange(t, Number(sectionIndex)))
    }

    return newValue
  }

  const isSectionExpandedAt = (sectionIndex: number) => expandedSectionIndices.indexOf(sectionIndex) >= 0

  const toggleSectionAt = (sectionIndex: number) => {
    if (isSectionExpandedAt(sectionIndex)) {
      setExpandedSectionIndices(prev => prev.filter(t => t !== sectionIndex))
    }
    else if (autoCollapseSections) {
      setExpandedSectionIndices([sectionIndex])
    }
    else {
      setExpandedSectionIndices(prev => [...prev.filter(t => t !== sectionIndex), sectionIndex])
    }
  }

  const selectAt = (itemIndex: number, sectionIndex: number) => {
    switch (selectionMode) {
      case 'multiple':
        setSelection(prev => ({
          ...prev,
          [sectionIndex]: [...(prev[sectionIndex] ?? []).filter(t => t !== itemIndex), itemIndex].sort(),
        }))

        onSelectAt?.(itemIndex, sectionIndex)

        break
      case 'single':
        setSelection({
          [sectionIndex]: [itemIndex],
        })

        onSelectAt?.(itemIndex, sectionIndex)

        break
      default:
        break
    }
  }

  const deselectAt = (itemIndex: number, sectionIndex: number) => {
    setSelection(prev => {
      const newValue = { ...prev }
      newValue[sectionIndex] = prev[sectionIndex].filter(t => t !== itemIndex)

      return newValue
    })

    onDeselectAt?.(itemIndex, sectionIndex)
  }

  const sanitizedExpandedSectionIndices = sanitizeExpandedSectionIndices(externalExpandedSectionIndices)
  const [expandedSectionIndices, setExpandedSectionIndices] = useState(sanitizedExpandedSectionIndices)
  const prevExpandedSectionIndices = usePrevious(expandedSectionIndices)

  const sanitizedExternalSelection = sanitizeSelection(externalSelection)
  const [selection, setSelection] = useState(sanitizedExternalSelection)
  const prevSelection = usePrevious(selection)

  useEffect(() => {
    if (isDeepEqual(sanitizedExpandedSectionIndices, expandedSectionIndices)) return

    setExpandedSectionIndices(sanitizedExpandedSectionIndices)
  }, [JSON.stringify(sanitizedExpandedSectionIndices)])

  useEffect(() => {
    if (!prevExpandedSectionIndices) return

    const collapsed = prevExpandedSectionIndices?.filter(t => expandedSectionIndices.indexOf(t) === -1) ?? []
    const expanded = expandedSectionIndices.filter(t => prevExpandedSectionIndices?.indexOf(t) === -1)

    collapsed.map(t => onCollapseSectionAt?.(t))
    expanded.map(t => onExpandSectionAt?.(t))
  }, [JSON.stringify(expandedSectionIndices)])

  useEffect(() => {
    if (isDeepEqual(sanitizedExternalSelection, selection)) return

    setSelection(sanitizedExternalSelection)
  }, [JSON.stringify(sanitizedExternalSelection)])

  useEffect(() => {
    if (!prevSelection) return

    onSelectionChange?.(selection)
  }, [JSON.stringify(selection)])

  const fixedClassNames = getFixedClassNames({ orientation })
  const fixedStyles = getFixedStyles({ borderThickness, orientation })
  const defaultStyles: Record<string, any> = useDefaultStyles ? getDefaultStyles({ orientation }) : {}

  return (
    <div
      {...props}
      className={classNames(className, fixedClassNames.root)}
      style={styles(style, fixedStyles.root)}
      ref={ref}
    >
      <Each in={data}>
        {(section, sectionIndex) => {
          const maxVisible = maxVisibleItems?.[sectionIndex] ?? -1
          const numItems = section.items.length
          const numVisibleItems = maxVisible < 0 ? numItems : Math.min(numItems, maxVisible)
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
                  sectionData={section}
                  onClick={() => toggleSectionAt(sectionIndex)}
                  onCustomEvent={(name, info) => onHeaderCustomEvent?.(sectionIndex, name, info)}
                />
              ) : (
                <button
                  className={classNames(fixedClassNames.header, { collapsed: isCollapsed, expanded: !isCollapsed })}
                  style={styles(fixedStyles.header, defaultStyles.header)}
                  onClick={() => toggleSectionAt(sectionIndex)}
                >
                  <label style={styles(defaultStyles.headerLabel)} dangerouslySetInnerHTML={{ __html: section.label }}/>
                  {cloneStyledElement(isCollapsed ? expandIconComponent : collapseIconComponent, {
                    className: classNames(isCollapsed ? fixedClassNames.expandIcon : fixedClassNames.collapseIcon),
                    style: styles(isCollapsed ? fixedStyles.expandIcon : fixedStyles.collapseIcon),
                  })}
                </button>
              )}
              <List
                style={styles(fixedStyles.list, defaultStyles.list, orientation === 'vertical' ? {
                  height: isCollapsed ? '0px' : `${menuLength}px`,
                  marginTop: isCollapsed ? '0px' : `${itemPadding - borderThickness}px`,
                  overflowY: maxVisible < 0 ? 'hidden' : maxVisible < numItems ? 'scroll' : 'hidden',
                } : {
                  marginLeft: isCollapsed ? '0px' : `${itemPadding - borderThickness}px`,
                  overflowX: maxVisible < 0 ? 'hidden' : maxVisible < numItems ? 'scroll' : 'hidden',
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
                selectedIndices={selection[sectionIndex] ?? []}
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

function getFixedClassNames({ orientation }: StylesProps) {
  return asClassNameDict({
    root: classNames(orientation),
    header: classNames(orientation),
    expandIcon: classNames(orientation),
    collapseIcon: classNames(orientation),
  })
}

function getFixedStyles({ borderThickness, orientation }: StylesProps) {
  return asStyleDict({
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
    expandIcon: {
      margin: '0',
      padding: '0',
    },
    collapseIcon: {
      margin: '0',
      padding: '0',
    },
    list: {
      ...orientation === 'vertical' ? {
        width: '100%',
        top: '100%',
      } : {
        height: '100%',
        left: '100%',
      },
    },
  })
}

function getDefaultStyles({ orientation }: StylesProps) {
  return asStyleDict({
    list: {
      transitionDuration: '100ms',
      transitionTimingFunction: 'ease-out',
      ...orientation === 'vertical' ? {
        transitionProperty: 'height, margin',
      } : {
        transitionProperty: 'width, margin',
      },
    },
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
}
