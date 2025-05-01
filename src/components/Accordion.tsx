import clsx from 'clsx'
import isDeepEqual from 'fast-deep-equal/react'
import { forwardRef, useEffect, useRef, type ComponentType, type HTMLAttributes, type ReactElement, type Ref, type RefObject } from 'react'
import { useMounted } from '../hooks/useMounted.js'
import { useSize } from '../hooks/useSize.js'
import { Each } from '../operators/index.js'
import { asComponentDict, asStyleDict, cloneStyledElement, createKey, styles } from '../utils/index.js'
import { Collection, type CollectionItemProps, type CollectionOrientation, type CollectionProps, type CollectionSelectionMode } from './Collection.js'
import type { DropdownToggleProps } from './Dropdown.js'

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
   * Padding (in pixels) between the section header and the internal collection.
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
export type AccordionHeaderProps<I, S extends AccordionSection<I> = AccordionSection<I>> = HTMLAttributes<HTMLElement> & {
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
}

/**
 * Type describing the props of {@link Accordion}.
 */
export type AccordionProps<I, S extends AccordionSection<I> = AccordionSection<I>> = HTMLAttributes<HTMLDivElement> & {
  /**
   * Specifies if expanded sections should automatically collapse upon expanding
   * another section.
   */
  autoCollapseSections?: boolean

  /**
   * Indices of sections that are expanded. If specified, the component will not
   * manage expansion states.
   */
  expandedSectionIndices?: number[]

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
   * Indices of selected items per section.
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
}

/**
 * A collection of selectable items laid out in sections in an accordion. Items
 * are generated based on the provided `ItemComponent` while each section header
 * is optionally provided by `HeaderComponent` or generated automatically.
 */
export const Accordion = /* #__PURE__ */ forwardRef(({
  children,
  style,
  autoCollapseSections = false,
  expandedSectionIndices: externalExpandedSectionIndices,
  orientation = 'vertical',
  sectionPadding = 0,
  sections,
  selection: externalSelection,
  selectionMode = 'single',
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
      if (!Object.hasOwn(sections, sectionIndex)) continue

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
      transform = _ => [sectionIndex]
    }
    else {
      transform = val => [...val.filter(t => t !== sectionIndex), sectionIndex]
    }

    handleExpandedSectionsChange(expandedSectionIndices, transform(expandedSectionIndices))
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
        transform = _ => ({
          [sectionIndex]: [itemIndex],
        })
        break
      default:
        return
    }

    const newValue = transform(selection)

    prevSelectionRef.current = newValue
    handleSelectionChange(selection, newValue)
  }

  const handleDeselectAt = (itemIndex: number, sectionIndex: number) => {
    if (!isSelectedAt(itemIndex, sectionIndex)) return

    const transform = (val: AccordionSelection) => ({
      ...val,
      [sectionIndex]: (val[sectionIndex] ?? []).filter(t => t !== itemIndex),
    })

    const newValue = transform(selection)

    prevSelectionRef.current = newValue
    handleSelectionChange(selection, newValue)
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

  const isMounted = useMounted()
  const selection = sanitizeSelection(externalSelection ?? {})
  const expandedSectionIndices = sanitizeExpandedSectionIndices(externalExpandedSectionIndices ?? [])
  const fixedStyles = getFixedStyles({ orientation })
  const prevSelectionRef = useRef<AccordionSelection>(undefined)
  const prevSelection = prevSelectionRef.current
  const sectionHeaderRefs: RefObject<HTMLDivElement | null>[] = sections.map(() => useRef<HTMLDivElement>(null))
  const sectionHeaderSizes = sectionHeaderRefs.map(t => useSize(t))

  const components = asComponentDict(children, {
    collapseIcon: AccordionCollapseIcon,
    expandIcon: AccordionExpandIcon,
    header: AccordionHeader,
  })

  useEffect(() => {
    prevSelectionRef.current = selection

    if (prevSelection === undefined) return

    handleSelectionChange(prevSelection, selection)
  }, [createKey(selection)])

  return (
    <div {...props} ref={ref} style={styles(style, fixedStyles.root)}>
      <Each in={sections}>
        {(section, sectionIndex) => {
          const { collectionPadding = 0, items, itemLength = 50, itemPadding = 0, isSelectionTogglable, layout = 'list', maxVisible = -1, numSegments = 1 } = section
          const allVisible = layout === 'list' ? items.length : Math.ceil(items.length / numSegments)
          const numVisible = maxVisible < 0 ? allVisible : Math.min(allVisible, maxVisible)
          const maxLength = itemLength * numVisible + itemPadding * (numVisible - 1)
          const isCollapsed = !isSectionExpandedAt(sectionIndex)
          const headerSize = sectionHeaderSizes[sectionIndex]

          return (
            <div
              style={styles(fixedStyles.section, orientation === 'vertical' ? {
                marginTop: sectionIndex === 0 ? '0px' : `${sectionPadding}px`,
                ...headerSize.height > 0 ? {
                  height: isCollapsed ? `${headerSize.height}px` : `${maxLength + headerSize.height + collectionPadding}px`,
                } : {},
              } : {
                marginLeft: sectionIndex === 0 ? '0px' : `${sectionPadding}px`,
                ...headerSize.width > 0 ? {
                  width: isCollapsed ? `${headerSize.width}px` : `${maxLength + headerSize.width + collectionPadding}px`,
                } : {},
              }, {
                visibility: isMounted ? 'visible' : 'hidden',
              })}
            >
              <div
                ref={sectionHeaderRefs[sectionIndex]}
                style={styles(fixedStyles.headerContainer)}
              >
                {HeaderComponent ? (
                  <HeaderComponent
                    aria-expanded={!isCollapsed}
                    className={clsx({ collapsed: isCollapsed, expanded: !isCollapsed })}
                    index={sectionIndex}
                    isCollapsed={isCollapsed}
                    role='button'
                    section={section}
                    style={styles(fixedStyles.header)}
                    onClick={() => toggleSectionAt(sectionIndex)}
                    onCustomEvent={(name, info) => onHeaderCustomEvent?.(sectionIndex, name, info)}
                  />
                ) : (
                  cloneStyledElement(
                    components.header ?? <AccordionHeader/>,
                    {
                      'aria-expanded': !isCollapsed,
                      'className': clsx({ collapsed: isCollapsed, expanded: !isCollapsed }),
                      'style': styles(fixedStyles.header),
                      'role': 'button',
                      'onClick': () => toggleSectionAt(sectionIndex),
                    },
                    <span dangerouslySetInnerHTML={{ __html: section.label }}/>,
                    isCollapsed ? components.collapseIcon ?? components.expandIcon : components.expandIcon,
                  )
                )}
              </div>
              <div
                role='region'
                style={styles({
                  pointerEvents: isCollapsed ? 'none' : 'auto',
                }, orientation === 'vertical' ? {
                  width: '100%',
                  height: `${maxLength}px`,
                  marginTop: `${collectionPadding}px`,
                  overflowY: maxVisible < 0 || maxVisible >= allVisible ? 'hidden' : 'scroll',
                } : {
                  marginLeft: `${collectionPadding}px`,
                  overflowX: maxVisible < 0 || maxVisible >= allVisible ? 'hidden' : 'scroll',
                  width: `${maxLength}px`,
                  height: '100%',
                })}
              >
                <Collection
                  className={clsx({ collapsed: isCollapsed, expanded: !isCollapsed })}
                  isSelectionTogglable={isSelectionTogglable}
                  ItemComponent={ItemComponent}
                  itemLength={itemLength}
                  itemPadding={itemPadding}
                  items={items}
                  layout={layout}
                  numSegments={numSegments}
                  orientation={orientation}
                  selection={selection[sectionIndex] ?? []}
                  selectionMode={selectionMode}
                  style={styles(orientation === 'vertical' ? { width: '100%' } : { height: '100%' })}
                  onActivateAt={itemIndex => onActivateAt?.(itemIndex, sectionIndex)}
                  onCustomEvent={(itemIndex, name, info) => onItemCustomEvent?.(itemIndex, sectionIndex, name, info)}
                  onDeselectAt={itemIndex => handleDeselectAt?.(itemIndex, sectionIndex)}
                  onSelectAt={itemIndex => handleSelectAt?.(itemIndex, sectionIndex)}
                />
              </div>
            </div>
          )
        }}
      </Each>
    </div>
  )
}) as <I, S extends AccordionSection<I> = AccordionSection<I>>(props: Readonly<AccordionProps<I, S> & { ref?: Ref<HTMLDivElement> }>) => ReactElement

export const AccordionHeader = ({ children, ...props }: HTMLAttributes<HTMLButtonElement> & DropdownToggleProps) => (
  <button {...props}>{children}</button>
)

export const AccordionExpandIcon = ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <figure {...props}>{children}</figure>
)

export const AccordionCollapseIcon = ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <figure {...props}>{children}</figure>
)

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
      overflow: 'hidden',
      padding: '0',
      ...orientation === 'vertical' ? {
        flexDirection: 'column',
        width: '100%',
      } : {
        flexDirection: 'row',
        height: '100%',
      },
    },
    headerContainer: {
      flexShrink: '0',
      ...orientation === 'vertical' ? {
        width: '100%',
      } : {
        height: '100%',
      },
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
  })
}

(Accordion as any).displayName = 'Accordion'
