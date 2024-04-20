import clsx from 'clsx'
import isDeepEqual from 'fast-deep-equal/react'
import React, { forwardRef, useEffect, useRef, useState, type ComponentType, type HTMLAttributes, type PropsWithChildren, type ReactElement, type Ref } from 'react'
import { Each } from '../operators/Each'
import { asStyleDict, cloneStyledElement, styles } from '../utils'
import { Collection, type CollectionItemProps, type CollectionOrientation, type CollectionProps, type CollectionSelectionMode } from './Collection'
import { FlatSVG } from './FlatSVG'

/**
 * Type describing the current item selection of {@link Accordion}, composed of
 * a dictionary whose key corresponds the section index and value corresponds to
 * an array of selected item indices. If the selection mode of the
 * {@link Accordion} is `single`, only one key will be present and one index in
 * the array value.
 */
export type AccordionSelection = Record<number, number[]>

/**
 * Type describing the data of each section in {@link Accordion}.
 */
export type AccordionSection<T> = Pick<CollectionProps<T>, 'isSelectionTogglable' | 'itemLength' | 'itemPadding' | 'items' | 'layout' | 'numSegments'> & {
  /**
   * Padding (in pixels) between the sectionheader and the internal collection.
   */
  collectionPadding?: number

  /**
   * Label for the section header.
   */
  label: string

  /**
   * Maximum number of visible rows (if section orientation is `vertical`) or
   * columns (if section orientation is `horizontal`). If number of rows exceeds
   * the number of visible, a scrollbar will be put in place.
   */
  maxVisible?: number
}

/**
 * Type describing the props of each `ItemComponent` provided to
 * {@link Accordion}.
 */
export type AccordionItemProps<T> = CollectionItemProps<T>

/**
 * Type describing the props of each `HeaderComponent` provided to
 * {@link Accordion}.
 */
export type AccordionHeaderProps<I, S extends AccordionSection<I> = AccordionSection<I>> = HTMLAttributes<HTMLElement> & PropsWithChildren<{
  /**
   * The index of the corresponding section.
   */
  index: number

  /**
   * Indicates whether the corresponding section is collapsed.
   */
  isCollapsed: boolean

  /**
   * Data provided to the corresponding section.
   */
  section: S

  /**
   * Handler invoked to dispatch a custom event.
   *
   * @param name User-defined name of the custom event.
   * @param info Optional user-defined info of the custom event.
   */
  onCustomEvent?: (name: string, info?: any) => void
}>

/**
 * Type describing the props of {@link Accordion}.
 */
export type AccordionProps<I, S extends AccordionSection<I> = AccordionSection<I>> = HTMLAttributes<HTMLDivElement> & PropsWithChildren<{
  /**
   * Specifies if expanded sections should automatically collapse upon expanding
   * another section.
   */
  autoCollapseSections?: boolean

  /**
   * SVG markup to use as the collapse icon when a toggle button is
   * automatically generated (when `HeaderComponent` is absent).
   */
  collapseIconSvg?: string

  /**
   * Indices of sections that are expanded. If specified, the component will not
   * manage expansion states.
   */
  expandedSectionIndices?: number[]

  /**
   * SVG markup to use as the expand icon when a toggle button is automatically
   * generated (when `HeaderComponent` is absent).
   */
  expandIconSvg?: string

  /**
   * Orientation of this component.
   *
   * @see {@link CollectionOrientation}
   */
  orientation?: CollectionOrientation

  /**
   * Padding (in pixels) between each section.
   */
  sectionPadding?: number

  /**
   * Data provided to each section.
   */
  sections: S[]

  /**
   * Indices of selected items per section. If specified, the component will not
   * manage selection state.
   *
   * @see {@link AccordionSelection}
   */
  selection?: AccordionSelection

  /**
   * Selection mode of each section.
   *
   * @see {@link CollectionSelectionMode}
   */
  selectionMode?: CollectionSelectionMode

  /**
   * Specifies if the component should use default styles.
   */
  usesDefaultStyles?: boolean

  /**
   * Handler invoked when an item is activated in a section. The order of
   * handlers invoked when any selection changes take place is:
   *   1. `onActivateAt`
   *   2. `onDeselectAt`
   *   3. `onSelectAt`
   *   4. `onSelectionChange`
   *
   * @param itemIndex Item index.
   * @param sectionIndex Section index.
   */
  onActivateAt?: (itemIndex: number, sectionIndex: number) => void

  /**
   * Handler invoked when a section is collapsed. The order of handlers invoked
   * when any section expansion changes take place is:
   *   1. `onCollapseSectionAt`
   *   2. `onExpandSectionAt`
   *
   * @param sectionIndex Section index.
   */
  onCollapseSectionAt?: (sectionIndex: number) => void

  /**
   * Handler invoked when an item is deselected in a section. The order of
   * handlers invoked when any selection changes take place is:
   *   1. `onActivateAt`
   *   2. `onDeselectAt`
   *   3. `onSelectAt`
   *   4. `onSelectionChange`
   *
   * @param itemIndex Item index.
   * @param sectionIndex Section index.
   */
  onDeselectAt?: (itemIndex: number, sectionIndex: number) => void

  /**
   * Handler invoked when the expansion state of any section changes.
   *
   * @param expandedSectionIndices Indices of sections that are expanded.
   */
  onExpandedSectionsChange?: (expandedSectionIndices: number[]) => void

  /**
   * Handler invoked when a section is expanded. The order of handlers invoked
   * when any section expansion changes take place is:
   *   1. `onCollapseSectionAt`
   *   2. `onExpandSectionAt`
   *
   * @param sectionIndex Section index.
   */
  onExpandSectionAt?: (sectionIndex: number) => void

  /**
   * Handler invoked when a custom event is dispatched from a section header.
   *
   * @param sectionIndex Index of the section which the header belongs.
   * @param eventName User-defined name of the dispatched event.
   * @param eventInfo Optional user-defined info of the dispatched event.
   */
  onHeaderCustomEvent?: (sectionIndex: number, eventName: string, eventInfo?: any) => void

  /**
   * Handler invoked when a custom event is dispatched from an item.
   *
   * @param itemIndex Item index.
   * @param sectionIndex Section index.
   * @param eventName User-defined name of the dispatched event.
   * @param eventInfo Optional user-defined info of the dispatched event.
   */
  onItemCustomEvent?: (itemIndex: number, sectionIndex: number, eventName: string, eventInfo?: any) => void

  /**
   * Handler invoked when an item is selected in a section. The order of
   * handlers invoked when any selection changes take place is:
   *   1. `onActivateAt`
   *   2. `onDeselectAt`
   *   3. `onSelectAt`
   *   4. `onSelectionChange`
   *
   * @param itemIndex Item index.
   * @param sectionIndex Section index.
   */
  onSelectAt?: (itemIndex: number, sectionIndex: number) => void

  /**
   * Handler invoked when selected items have changed. The order of handlers
   * invoked when any selection changes take place is:
   *   1. `onActivateAt`
   *   2. `onDeselectAt`
   *   3. `onSelectAt`
   *   4. `onSelectionChange`
   *
   * @param selectedIndices Dictionary of indices of selected items per section.
   */
  onSelectionChange?: (selection: AccordionSelection) => void

  /**
   * Component type for generating section headers inside the component. When
   * absent, one will be generated automatically.
   */
  HeaderComponent?: ComponentType<AccordionHeaderProps<I, S>>

  /**
   * Component type for generating items for each section.
   */
  ItemComponent?: ComponentType<AccordionItemProps<I>>
}>

/**
 * A collection of selectable items laid out in sections in an accordion. Items
 * are generated based on the provided `ItemComponent` while each section header
 * is optionally provided by `HeaderComponent` or generated automatically.
 *
 * This component automatically determines if it should track selection state
 * and expansion states internally. If the `selection` prop is provided, the
 * component will not initialize the selection state. It will be up to its
 * parent to provide item selection in tandem with the component's
 * `onSelectionChange` handler. Likewise for the omission of the expansion
 * states if `expandedSectionIndices` prop is provided.
 */
export const Accordion = forwardRef(({
  children,
  style,
  autoCollapseSections = false,
  collapseIconSvg,
  expandedSectionIndices: externalExpandedSectionIndices,
  expandIconSvg,
  orientation = 'vertical',
  sectionPadding = 0,
  sections,
  selection: externalSelection,
  selectionMode = 'single',
  usesDefaultStyles = false,
  onActivateAt,
  onCollapseSectionAt,
  onDeselectAt,
  onExpandedSectionsChange,
  onExpandSectionAt,
  onHeaderCustomEvent,
  onItemCustomEvent,
  onSelectAt,
  onSelectionChange,
  HeaderComponent,
  ItemComponent,
  ...props
}, ref) => {
  const isSectionIndexOutOfRange = (sectionIndex: number) => {
    if (sectionIndex >= sections.length) return true
    if (sectionIndex < 0) return true

    return false
  }

  const isItemIndexOutOfRange = (itemIndex: number, sectionIndex: number) => {
    if (isSectionIndexOutOfRange(sectionIndex)) return true

    const items = sections[sectionIndex].items

    if (itemIndex >= items.length) return true
    if (itemIndex < 0) return true

    return false
  }

  const isSelectedAt = (itemIndex: number, sectionIndex: number) => (selection[sectionIndex]?.indexOf(itemIndex) ?? -1) >= 0

  const sanitizeExpandedSectionIndices = (sectionIndices: number[]) => sortIndices(sectionIndices).filter(t => !isSectionIndexOutOfRange(t))

  const sanitizeSelection = (selection: AccordionSelection) => {
    const newValue: AccordionSelection = {}

    for (const sectionIndex in sections) {
      if (!Object.prototype.hasOwnProperty.call(sections, sectionIndex)) continue

      const indices = sortIndices([...selection[sectionIndex] ?? []])

      newValue[Number(sectionIndex)] = sortIndices(indices).filter(t => !isItemIndexOutOfRange(t, Number(sectionIndex)))
    }

    return newValue
  }

  const isSectionExpandedAt = (sectionIndex: number) => expandedSectionIndices.indexOf(sectionIndex) >= 0

  const toggleSectionAt = (sectionIndex: number) => {
    let transform: (val: number[]) => number[]

    if (isSectionExpandedAt(sectionIndex)) {
      transform = val => val.filter(t => t !== sectionIndex)
    }
    else if (autoCollapseSections) {
      transform = val => [sectionIndex]
    }
    else {
      transform = val => [...val.filter(t => t !== sectionIndex), sectionIndex]
    }

    if (setExpandedSectionIndices) {
      setExpandedSectionIndices(prev => transform(prev))
    }
    else {
      handleExpandedSectionsChange(expandedSectionIndices, transform(expandedSectionIndices))
    }
  }

  const handleSelectAt = (itemIndex: number, sectionIndex: number) => {
    if (isSelectedAt(itemIndex, sectionIndex)) return

    let transform: (val: AccordionSelection) => AccordionSelection

    switch (selectionMode) {
      case 'multiple':
        transform = val => ({
          ...val,
          [sectionIndex]: sortIndices([...(val[sectionIndex] ?? []).filter(t => t !== itemIndex), itemIndex]),
        })
        break
      case 'single':
        transform = val => ({
          [sectionIndex]: [itemIndex],
        })
        break
      default:
        return
    }

    if (setSelection) {
      setSelection(prev => transform(prev))
    }
    else {
      const newValue = transform(selection)

      prevSelectionRef.current = newValue
      handleSelectionChange(selection, newValue)
    }
  }

  const handleDeselectAt = (itemIndex: number, sectionIndex: number) => {
    if (!isSelectedAt(itemIndex, sectionIndex)) return

    const transform = (val: AccordionSelection) => ({
      ...val,
      [sectionIndex]: (val[sectionIndex] ?? []).filter(t => t !== itemIndex),
    })

    if (setSelection) {
      setSelection(prev => transform(prev))
    }
    else {
      const newValue = transform(selection)

      prevSelectionRef.current = newValue
      handleSelectionChange(selection, newValue)
    }
  }

  const handleExpandedSectionsChange = (oldValue: number[] | undefined, newValue: number[]) => {
    if (isDeepEqual(oldValue, newValue)) return

    const collapsed = oldValue?.filter(t => newValue.indexOf(t) === -1) ?? []
    const expanded = newValue.filter(t => oldValue?.indexOf(t) === -1)

    collapsed.forEach(t => onCollapseSectionAt?.(t))
    expanded.forEach(t => onExpandSectionAt?.(t))

    onExpandedSectionsChange?.(newValue)
  }

  const handleSelectionChange = (oldValue: AccordionSelection | undefined, newValue: AccordionSelection) => {
    if (isDeepEqual(oldValue, newValue)) return

    const numSections = sections.length

    let allDeselected: number[][] = []
    let allSelected: number[][] = []

    for (let i = 0; i < numSections; i++) {
      const oldSection = oldValue?.[i] ?? []
      const newSection = newValue[i] ?? []
      const deselected = oldSection.filter(t => newSection.indexOf(t) === -1)
      const selected = newSection.filter(t => oldSection?.indexOf(t) === -1)

      allDeselected = [...allDeselected, ...deselected.map(t => [t, i])]
      allSelected = [...allSelected, ...selected.map(t => [t, i])]
    }

    allDeselected.forEach(t => onDeselectAt?.(t[0], t[1]))
    allSelected.forEach(t => onSelectAt?.(t[0], t[1]))

    onSelectionChange?.(newValue)
  }

  const tracksSelectionChanges = externalSelection === undefined && selectionMode !== 'none'
  const tracksExpansionChanges = externalExpandedSectionIndices === undefined

  const sanitizedExternalSelection = sanitizeSelection(externalSelection ?? {})
  const [selection, setSelection] = tracksSelectionChanges ? useState(sanitizedExternalSelection) : [sanitizedExternalSelection]
  const sanitizedExternalExpandedSectionIndices = sanitizeExpandedSectionIndices(externalExpandedSectionIndices ?? [])
  const [expandedSectionIndices, setExpandedSectionIndices] = tracksExpansionChanges ? useState(sanitizedExternalExpandedSectionIndices) : [sanitizedExternalExpandedSectionIndices]

  const fixedStyles = getFixedStyles({ orientation })
  const defaultStyles = usesDefaultStyles ? getDefaultStyles({ orientation }) : undefined

  const prevSelectionRef = useRef<AccordionSelection>()
  const prevSelection = prevSelectionRef.current

  useEffect(() => {
    prevSelectionRef.current = selection

    if (prevSelection === undefined) return

    handleSelectionChange(prevSelection, selection)
  }, [JSON.stringify(selection)])

  return (
    <div {...props} data-component='accordion' style={styles(style, fixedStyles.root)} ref={ref}>
      <Each in={sections}>
        {(section, sectionIndex) => {
          const { collectionPadding = 0, items, itemLength = 50, itemPadding = 0, isSelectionTogglable, layout = 'list', maxVisible = -1, numSegments = 1 } = section
          const allVisible = layout === 'list' ? items.length : Math.ceil(items.length / numSegments)
          const numVisible = maxVisible < 0 ? allVisible : Math.min(allVisible, maxVisible)
          const maxLength = itemLength * numVisible + itemPadding * (numVisible - 1)
          const isCollapsed = !isSectionExpandedAt(sectionIndex)
          const expandIconComponent = expandIconSvg ? <FlatSVG svg={expandIconSvg} style={defaultStyles?.expandIcon}/> : <></>
          const collapseIconComponent = collapseIconSvg ? <FlatSVG svg={collapseIconSvg} style={defaultStyles?.collapseIcon}/> : expandIconComponent

          return (
            <div style={styles(fixedStyles.section, orientation === 'vertical' ? {
              marginTop: sectionIndex === 0 ? '0px' : `${sectionPadding}px`,
            } : {
              marginLeft: sectionIndex === 0 ? '0px' : `${sectionPadding}px`,
            })}>
              {HeaderComponent ? (
                <HeaderComponent
                  data-child='header'
                  className={clsx({ collapsed: isCollapsed, expanded: !isCollapsed })}
                  style={styles(fixedStyles.header)}
                  index={sectionIndex}
                  isCollapsed={isCollapsed}
                  section={section}
                  onClick={() => toggleSectionAt(sectionIndex)}
                  onCustomEvent={(name, info) => onHeaderCustomEvent?.(sectionIndex, name, info)}
                />
              ) : (
                <button
                  data-child='header'
                  className={clsx({ collapsed: isCollapsed, expanded: !isCollapsed })}
                  style={styles(fixedStyles.header, defaultStyles?.header)}
                  onClick={() => toggleSectionAt(sectionIndex)}
                >
                  <span style={styles(defaultStyles?.headerLabel)} dangerouslySetInnerHTML={{ __html: section.label }}/>
                  {cloneStyledElement(isCollapsed ? expandIconComponent : collapseIconComponent, {
                    style: styles(isCollapsed ? fixedStyles.expandIcon : fixedStyles.collapseIcon),
                  })}
                </button>
              )}
              <Collection
                data-child='collection'
                className={clsx({ collapsed: isCollapsed, expanded: !isCollapsed })}
                style={styles(fixedStyles.list, defaultStyles?.collection, orientation === 'vertical' ? {
                  width: '100%',
                  height: isCollapsed ? '0px' : `${maxLength}px`,
                  marginTop: isCollapsed ? '0px' : `${collectionPadding}px`,
                  overflowY: maxVisible < 0 ? 'hidden' : maxVisible < allVisible ? 'scroll' : 'hidden',
                } : {
                  marginLeft: isCollapsed ? '0px' : `${collectionPadding}px`,
                  overflowX: maxVisible < 0 ? 'hidden' : maxVisible < allVisible ? 'scroll' : 'hidden',
                  width: isCollapsed ? '0px' : `${maxLength}px`,
                  height: '100%',
                })}
                selectionMode={selectionMode}
                isSelectionTogglable={isSelectionTogglable}
                itemLength={itemLength}
                itemPadding={itemPadding}
                items={items}
                orientation={orientation}
                layout={layout}
                numSegments={numSegments}
                selection={selection[sectionIndex] ?? []}
                onActivateAt={itemIndex => onActivateAt?.(itemIndex, sectionIndex)}
                onDeselectAt={itemIndex => { handleDeselectAt?.(itemIndex, sectionIndex) }}
                onItemCustomEvent={(itemIndex, name, info) => onItemCustomEvent?.(itemIndex, sectionIndex, name, info)}
                onSelectAt={itemIndex => { handleSelectAt?.(itemIndex, sectionIndex) }}
                ItemComponent={ItemComponent}
              />
            </div>
          )
        }}
      </Each>
    </div>
  )
}) as <I, S extends AccordionSection<I> = AccordionSection<I>>(props: AccordionProps<I, S> & { ref?: Ref<HTMLDivElement> }) => ReactElement

Object.defineProperty(Accordion, 'displayName', { value: 'Accordion', writable: false })

function sortIndices(indices: number[]): number[] {
  return indices.sort((a, b) => a - b)
}

function getFixedStyles({ orientation = 'vertical' }) {
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
    list: {

    },
    header: {
      cursor: 'pointer',
      margin: '0',
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
  })
}

function getDefaultStyles({ orientation = 'vertical' }) {
  return asStyleDict({
    collection: {
      transitionDuration: '100ms',
      transitionTimingFunction: 'ease-out',
      ...orientation === 'vertical' ? {
        transitionProperty: 'height, margin',
      } : {
        transitionProperty: 'width, margin',
      },
    },
    header: {
      border: 'none',
      outline: 'none',
      alignItems: 'center',
      background: '#fff',
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
