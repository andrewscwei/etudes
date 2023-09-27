import classNames from 'classnames'
import React, { forwardRef, useEffect, useRef, useState, type ComponentType, type HTMLAttributes, type PropsWithChildren, type ReactElement, type Ref } from 'react'
import { Collection, type CollectionItemProps, type CollectionOrientation, type CollectionProps, type CollectionSelection } from './Collection'
import { FlatSVG } from './FlatSVG'
import { useElementRect } from './hooks/useElementRect'
import { usePrevious } from './hooks/usePrevious'
import { asClassNameDict, asStyleDict, cloneStyledElement, styles } from './utils'

/**
 * Base extendable type describing the data provided to each item in
 * {@link Dropdown}.
 */
export type DropdownItemData = {
  label?: string
}

/**
 * Type describing the props of `ToggleComponent` provided to {@link Dropdown}.
 */
export type DropdownToggleProps = HTMLAttributes<HTMLElement> & {
  /**
   * Handler invoked to dispatch a custom event.
   *
   * @param name User-defined name of the custom event.
   * @param info User-defined info of the custom event.
   */
  onCustomEvent?: (name: string, info?: any) => void
}

/**
 * Type describing the props of `ItemComponent` provided to {@link Dropdown}.
 */
export type DropdownItemProps<T extends DropdownItemData = DropdownItemData> = CollectionItemProps<T>

/**
 * Type describing the props of {@link Dropdown}.
 */
export type DropdownProps<T extends DropdownItemData = DropdownItemData> = HTMLAttributes<HTMLDivElement> & CollectionProps<T> & PropsWithChildren<{
  /**
   * SVG markup to use as the collapse icon when a toggle button is
   * automatically generated (when `ToggleComponent` is absent).
   */
  collapseIconSvg?: string

  /**
   * Specifies if the internal collection collapses when an item is selected. This
   * only works if `selectionMode` is `single`.
   */
  collapsesOnSelect?: boolean

  /**
   * Padding (in pixels) between the toggle button and the internal collection.
   */
  collectionPadding?: number

  /**
   * The label to appear on the toggle button.
   *
   * @param selection The current selection.
   */
  label?: (selection: CollectionSelection) => string

  /**
   * SVG markup to use as the expand icon when a toggle button is automatically
   * generated (when `ToggleComponent` is absent).
   */
  expandIconSvg?: string

  /**
   * Specifies if the internal collection is collapsed. If specified, the
   * component will not manage expansion state.
   */
  isCollapsed?: boolean

  /**
   * Indicates if the component is inverted (i.e. "dropup" instead of dropdown).
   */
  isInverted?: boolean

  /**
   * Maximum number of items that are viside when the component expands. When a
   * value greater than or equal to 0 is specified, only that number of items
   * will be visible at a time and a scrollbar will appear to enable scrolling
   * to remaining items. Any value less than 0 indicates that all items will be
   * visible when the component expands.
   */
  maxVisibleItems?: number

  /**
   * Specifies if the component should use default styles.
   */
  useDefaultStyles?: boolean

  /**
   * Handler invoked when the component is collapsed.
   */
  onCollapse?: () => void

  /**
   * Handler invoked when the component is expanded.
   */
  onExpand?: () => void

  /**
   * Handler invoked when the toggle dispatches a custom event.
   *
   * @param eventName User-defined name of the dispatched custom event.
   * @param eventInfo Optional user-defined info of the dispatched custom event.
   */
  onToggleCustomEvent?: (eventName: string, eventInfo?: any) => void

  /**
   * React component type to be used for generating the toggle button inside the
   * component. When absent, one will be generated automatically.
   */
  ToggleComponent?: ComponentType<DropdownToggleProps>
}>

/**
 * A dropdown component that is invertible (i.e. can "dropup" instead) and
 * supports both horizontal and vertical orientations. Provide `items` and
 * `ItemComponent` props to populate.
 *
 * This component automatically determines if it should track selection state
 * and expansion state internally. If the `selection` prop is provided, the
 * component will not initialize the selection state. It will be up to its
 * parent to provide item selection in tandem with the component's
 * `onSelectionChange` handler. Likewise for the omission of the expansion state
 * if `isCollapsed` prop is provided.
 */
export const Dropdown = forwardRef(({
  children,
  className,
  style,
  collapseIconSvg,
  collapsesOnSelect = true,
  collectionPadding = 0,
  expandIconSvg,
  isCollapsed: externalIsCollapsed,
  isInverted = false,
  label,
  layout,
  isSelectionTogglable = false,
  itemLength: externalItemLength,
  itemPadding = 0,
  items,
  maxVisibleItems = -1,
  numSegments,
  orientation = 'vertical',
  selection: externalSelection = [],
  selectionMode = 'single',
  useDefaultStyles = false,
  onActivateAt,
  onCollapse,
  onDeselectAt,
  onExpand,
  onSelectAt,
  onSelectionChange,
  onToggleCustomEvent,
  ItemComponent,
  ToggleComponent,
  ...props
}, ref) => {
  const isIndexOutOfRange = (index: number) => {
    if (isNaN(index)) return true
    if (index >= items.length) return true
    if (index < 0) return true

    return false
  }

  const sanitizedSelection = (selection: CollectionSelection) => selection.sort().filter(t => !isIndexOutOfRange(t))

  const expand = () => {
    if (!isCollapsed) return

    if (setIsCollapsed) {
      setIsCollapsed(false)
    }
    else {
      onExpand?.()
    }
  }

  const collapse = () => {
    if (isCollapsed) return

    if (setIsCollapsed) {
      setIsCollapsed(true)
    }
    else {
      onCollapse?.()
    }
  }

  const toggle = () => {
    if (isCollapsed) {
      expand()
    }
    else {
      collapse()
    }
  }

  const selectAtHandler = (index: number) => {
    onSelectAt?.(index)

    if (selectionMode === 'single' && collapsesOnSelect) collapse()
  }

  const selectionChangeHandler = (value: CollectionSelection) => {
    if (setSelection) {
      setSelection(value)
    }
    else {
      onSelectionChange?.(value)
    }
  }

  const bodyRef = useRef<HTMLDivElement>(null)
  const tracksSelectionChanges = externalSelection === undefined && selectionMode !== 'none'
  const tracksExpansionChanges = externalIsCollapsed === undefined

  const sanitizedExternalSelection = sanitizedSelection(externalSelection)
  const [selection, setSelection] = tracksSelectionChanges ? useState(sanitizedExternalSelection) : [sanitizedExternalSelection]
  const [isCollapsed, setIsCollapsed] = tracksExpansionChanges ? useState(true) : [externalIsCollapsed]

  const itemLength = externalItemLength ?? (orientation === 'vertical' ? useElementRect(bodyRef).height : useElementRect(bodyRef).width)
  const numItems = items.length
  const numVisibleItems = maxVisibleItems < 0 ? numItems : Math.min(numItems, maxVisibleItems)
  const menuLength = itemLength * numVisibleItems + itemPadding * (numVisibleItems - 1)

  const fixedClassNames = getFixedClassNames({ isCollapsed, isSelectionTogglable, orientation })
  const fixedStyles = getFixedStyles({ isCollapsed, isInverted, itemPadding, maxVisibleItems, menuLength, numItems, orientation })
  const defaultStyles: Record<string, any> = useDefaultStyles ? getDefaultStyles({}) : {}

  const ExpandIcon = expandIconSvg ? <FlatSVG svg={expandIconSvg} style={defaultStyles.expandIcon}/> : <></>
  const CollapseIcon = collapseIconSvg ? <FlatSVG svg={collapseIconSvg} style={defaultStyles.collapseIcon}/> : ExpandIcon

  if (setSelection) {
    const prevSelection = usePrevious(selection, { sanitizeDependency: JSON.stringify })

    useEffect(() => {
      if (prevSelection === undefined) return

      onSelectionChange?.(selection)
    }, [JSON.stringify(selection)])
  }

  if (setIsCollapsed) {
    const prevIsCollapsed = usePrevious(isCollapsed)

    useEffect(() => {
      if (prevIsCollapsed === undefined) return

      if (isCollapsed) {
        onCollapse?.()
      }
      else {
        onExpand?.()
      }
    }, [isCollapsed])
  }

  useEffect(() => {
    const clickOutsideHandler = (event: MouseEvent) => {
      if (isCollapsed) return
      if (!(event.target instanceof Node)) return

      let isOutside = true
      let node = event.target

      while (node) {
        if (node === bodyRef.current) {
          isOutside = false
          break
        }

        if (!node.parentNode) break

        node = node.parentNode
      }

      if (!isOutside) return

      collapse()
    }

    window.addEventListener('click', clickOutsideHandler)

    return () => {
      window.removeEventListener('click', clickOutsideHandler)
    }
  }, [isCollapsed])

  return (
    <div
      {...props}
      ref={ref}
      className={classNames(className, fixedClassNames.root)}
      style={styles(style, fixedStyles.root)}
    >
      <div ref={bodyRef} style={styles(fixedStyles.body)}>
        {ToggleComponent ? (
          <ToggleComponent
            className={classNames(fixedClassNames.toggle)}
            style={styles(fixedStyles.toggle)}
            onClick={() => toggle()}
            onCustomEvent={(name, info) => onToggleCustomEvent?.(name, info)}
          />
        ) : (
          <button
            className={classNames(fixedClassNames.toggle)}
            style={styles(fixedStyles.toggle, defaultStyles.toggle)}
            onClick={() => toggle()}
          >
            <label style={fixedStyles.toggleLabel} dangerouslySetInnerHTML={{ __html: label?.(selection) ?? (selection.length > 0 ? selection.map(t => items[t].label).join(', ') : '') }}/>
            {cloneStyledElement(isCollapsed ? ExpandIcon : CollapseIcon, {
              className: classNames(isCollapsed ? fixedClassNames.expandIcon : fixedClassNames.collapseIcon),
              style: styles(isCollapsed ? fixedStyles.expandIcon : fixedStyles.collapseIcon),
            })}
          </button>
        )}
        <Collection
          className={fixedClassNames.collection}
          style={styles(fixedStyles.collection)}
          isSelectionTogglable={isSelectionTogglable}
          itemLength={itemLength}
          itemPadding={itemPadding}
          items={items}
          layout={layout}
          numSegments={numSegments}
          orientation={orientation}
          selection={selection}
          selectionMode={selectionMode}
          onActivateAt={onActivateAt}
          onDeselectAt={onDeselectAt}
          onSelectAt={selectAtHandler}
          onSelectionChange={selectionChangeHandler}
          ItemComponent={ItemComponent}
        />
      </div>
    </div>
  )
}) as <T extends DropdownItemData = DropdownItemData>(props: DropdownProps<T> & { ref?: Ref<HTMLDivElement> }) => ReactElement

Object.defineProperty(Dropdown, 'displayName', { value: 'Dropdown', writable: false })

type StylesProps = {
  collectionPadding?: number
  isCollapsed?: boolean
  isInverted?: boolean
  isSelectionTogglable?: boolean
  itemPadding?: number
  maxVisibleItems?: number
  menuLength?: number
  numItems?: number
  orientation?: CollectionOrientation
}

function getFixedClassNames({ isCollapsed, isSelectionTogglable, orientation }: StylesProps) {
  return asClassNameDict({
    root: classNames('dropdown', orientation, {
      togglable: isSelectionTogglable,
      collapsed: isCollapsed,
      expanded: !isCollapsed,
    }),
    toggle: classNames('toggle', orientation, {
      togglable: isSelectionTogglable,
      collapsed: isCollapsed,
      expanded: !isCollapsed,
    }),
    expandIcon: classNames(orientation, {
      togglable: isSelectionTogglable,
      collapsed: isCollapsed,
      expanded: !isCollapsed,
    }),
    collapseIcon: classNames(orientation, {
      togglable: isSelectionTogglable,
      collapsed: isCollapsed,
      expanded: !isCollapsed,
    }),
    collection: classNames({
      togglable: isSelectionTogglable,
      collapsed: isCollapsed,
      expanded: !isCollapsed,
    }),
  })
}

function getFixedStyles({ isCollapsed, isInverted, collectionPadding = 0, maxVisibleItems = 0, menuLength, numItems = 0, orientation }: StylesProps) {
  return asStyleDict({
    root: {
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'flex-start',
      overflow: 'visible',
      ...orientation === 'vertical' ? {
        flexDirection: isInverted ? 'column-reverse' : 'column',
      } : {
        flexDirection: isInverted ? 'row-reverse' : 'row',
      },
    },
    body: {
      height: '100%',
      width: '100%',
    },
    toggle: {
      cursor: 'pointer',
      height: '100%',
      left: '0',
      margin: '0',
      outline: 'none',
      position: 'absolute',
      top: '0',
      width: '100%',
      zIndex: '1',
    },
    toggleLabel: {
      fontFamily: 'inherit',
      fontSize: 'inherit',
      fontWeight: 'inherit',
      letterSpacing: 'inherit',
      lineHeight: 'inherit',
      pointerEvents: 'none',
    },
    expandIcon: {

    },
    collapseIcon: {

    },
    collection: {
      position: 'absolute',
      ...orientation === 'vertical' ? {
        transition: 'height 100ms ease-out',
        width: '100%',
        height: isCollapsed ? '0px' : `${menuLength}px`,
        overflowY: maxVisibleItems === -1 ? 'hidden' : maxVisibleItems < numItems ? 'scroll' : 'hidden',
        ...isInverted ? {
          marginBottom: `${collectionPadding}px`,
          bottom: '100%',
        } : {
          top: '100%',
          marginTop: `${collectionPadding}px`,
        },
      } : {
        transition: 'width 100ms ease-out',
        width: isCollapsed ? '0px' : `${menuLength}px`,
        height: '100%',
        overflowX: maxVisibleItems === -1 ? 'hidden' : maxVisibleItems < numItems ? 'scroll' : 'hidden',
        ...isInverted ? {
          marginRight: `${collectionPadding}px`,
          right: '100%',
        } : {
          left: '100%',
          marginLeft: `${collectionPadding}px`,
        },
      },
    },
  })
}

function getDefaultStyles({ ...props }: StylesProps) {
  return asStyleDict({
    toggle: {
      alignItems: 'center',
      background: '#fff',
      boxSizing: 'border-box',
      color: '#000',
      display: 'flex',
      flexDirection: 'row',
      fontSize: '16px',
      justifyContent: 'space-between',
      margin: '0',
      padding: '0 10px',
    },
    expandIcon: {
      height: '15px',
      margin: '0',
      padding: '0',
      width: '15px',
    },
    collapseIcon: {
      height: '15px',
      margin: '0',
      padding: '0',
      width: '15px',
    },
  })
}
