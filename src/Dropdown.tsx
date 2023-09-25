import classNames from 'classnames'
import isDeepEqual from 'fast-deep-equal/react'
import React, { forwardRef, useEffect, useRef, useState, type ComponentType, type HTMLAttributes, type PropsWithChildren, type ReactElement, type Ref } from 'react'
import FlatSVG from './FlatSVG'
import List, { type ListItemProps, type ListOrientation, type ListProps, type ListSelection } from './List'
import useElementRect from './hooks/useElementRect'
import usePrevious from './hooks/usePrevious'
import asClassNameDict from './utils/asClassNameDict'
import asStyleDict from './utils/asStyleDict'
import cloneStyledElement from './utils/cloneStyledElement'
import styles from './utils/styles'

export type DropdownItemData = {
  label?: string
}

export type DropdownToggleProps = HTMLAttributes<HTMLElement> & {
  onCustomEvent?: (name: string, info?: any) => void
}

export type DropdownItemProps<T extends DropdownItemData = DropdownItemData> = ListItemProps<T>

export type DropdownProps<T extends DropdownItemData = DropdownItemData> = HTMLAttributes<HTMLDivElement> & ListProps<T> & PropsWithChildren<{
  /**
   * SVG markup to be put in the dropdown button as the collapse icon.
   */
  collapseIconSvg?: string

  /**
   * Specifies if the dropdown should be collapsed upon selection. This only
   * works if `selectionMode` is `single`.
   */
  collapsesOnSelect?: boolean

  /**
   * The label to appear on the dropdown toggle button.
   *
   * @param selection The current selection.
   */
  label?: (selection: ListSelection) => string

  /**
   * SVG markup to be put in the dropdown button as the expand icon.
   */
  expandIconSvg?: string

  /**
   * Indicates if the component is inverted (i.e. "dropup" instead of dropdown).
   * Supports all orientations.
   */
  isInverted?: boolean

  /**
   * Maximum number of items that are viside when the component expands. When a
   * value greater than or equal to 0 is specified, only that number of items
   * will be visible at a time, and a scrollbar will appear to scroll to
   * remaining items. Any value less than 0 indicates that all items will be
   * visible when the component expands.
   */
  maxVisibleItems?: number

  /**
   * Specifies if the component should use default styles.
   */
  useDefaultStyles?: boolean

  /**
   * React component type to be used for generating the toggle element inside
   * the component. When absent, one will be generated automatically.
   */
  toggleComponentType?: ComponentType<DropdownToggleProps>

  /**
   * Handler invoked when the toggle dispatches a custom event.
   *
   * @param eventName Name of the dispatched custom event.
   * @param eventInfo Optional info of the dispatched custom event.
   */
  onToggleCustomEvent?: (eventName: string, eventInfo?: any) => void
}>

/**
 * A dropdown menu component that is invertible (i.e. can "dropup" instead) and
 * supports both horizontal and vertical orientations. Provide data and item
 * component type to this component to automatically generate menu items.
 */
const Dropdown = forwardRef(({
  children,
  className,
  style,
  collapseIconSvg,
  collapsesOnSelect = true,
  label,
  layout,
  expandIconSvg,
  isInverted = false,
  isSelectionTogglable = false,
  itemComponentType,
  itemLength: externalItemLength,
  itemPadding = 0,
  items,
  maxVisibleItems = -1,
  numSegments,
  orientation = 'vertical',
  selection: externalSelection = [],
  selectionMode = 'single',
  useDefaultStyles = false,
  toggleComponentType: ToggleComponent,
  onActivateAt,
  onDeselectAt,
  onSelectAt,
  onSelectionChange,
  onToggleCustomEvent,
  ...props
}, ref) => {
  const isIndexOutOfRange = (index: number) => {
    if (index >= items.length) return true
    if (index < 0) return true

    return false
  }

  const sanitizedSelection = (selection: ListSelection) => selection.sort().filter(t => !isIndexOutOfRange(t))

  const expand = () => {
    if (isCollapsed) setIsCollapsed(false)
  }

  const collapse = () => {
    if (!isCollapsed) setIsCollapsed(true)
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

  const selectionChangeHandler = (value: ListSelection) => {
    const newValue = value.sort()

    if (isDeepEqual(newValue, selection)) return

    setSelection(newValue)
  }

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

  const bodyRef = useRef<HTMLDivElement>(null)
  const sanitizedExternalSelection = sanitizedSelection(externalSelection)
  const [selection, setSelection] = useState(sanitizedExternalSelection)
  const prevSelection = usePrevious(selection, { sanitizeDependency: JSON.stringify })
  const [isCollapsed, setIsCollapsed] = useState(true)
  const rect = useElementRect(bodyRef)

  useEffect(() => {
    window.addEventListener('click', clickOutsideHandler)

    return () => {
      window.removeEventListener('click', clickOutsideHandler)
    }
  }, [isCollapsed])

  useEffect(() => {
    if (isDeepEqual(sanitizedExternalSelection, selection)) return

    setSelection(sanitizedExternalSelection)
  }, [JSON.stringify(sanitizedExternalSelection)])

  useEffect(() => {
    if (!prevSelection) return

    onSelectionChange?.(selection)
  }, [JSON.stringify(selection)])

  const itemLength = externalItemLength ?? (orientation === 'vertical' ? rect.height : rect.width)
  const numItems = items.length
  const numVisibleItems = maxVisibleItems < 0 ? numItems : Math.min(numItems, maxVisibleItems)
  const menuLength = itemLength * numVisibleItems + itemPadding * (numVisibleItems - 1)

  const fixedClassNames = getFixedClassNames({ isCollapsed, isSelectionTogglable, orientation })
  const fixedStyles = getFixedStyles({ isCollapsed, isInverted, itemPadding, maxVisibleItems, menuLength, numItems, orientation })
  const defaultStyles: Record<string, any> = useDefaultStyles ? getDefaultStyles({}) : {}

  const expandIconComponent = expandIconSvg ? <FlatSVG svg={expandIconSvg} style={defaultStyles.expandIcon}/> : <></>
  const collapseIconComponent = collapseIconSvg ? <FlatSVG svg={collapseIconSvg} style={defaultStyles.collapseIcon}/> : expandIconComponent

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
            {cloneStyledElement(isCollapsed ? expandIconComponent : collapseIconComponent, {
              className: classNames(isCollapsed ? fixedClassNames.expandIcon : fixedClassNames.collapseIcon),
              style: styles(isCollapsed ? fixedStyles.expandIcon : fixedStyles.collapseIcon),
            })}
          </button>
        )}
        <List
          className={fixedClassNames.list}
          style={styles(fixedStyles.list)}
          isSelectionTogglable={isSelectionTogglable}
          itemComponentType={itemComponentType}
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
        />
      </div>
    </div>
  )
}) as <T extends DropdownItemData = DropdownItemData>(props: DropdownProps<T> & { ref?: Ref<HTMLDivElement> }) => ReactElement

Object.defineProperty(Dropdown, 'displayName', { value: 'Dropdown', writable: false })

export default Dropdown

type StylesProps = {
  isCollapsed?: boolean
  isInverted?: boolean
  isSelectionTogglable?: boolean
  itemPadding?: number
  maxVisibleItems?: number
  menuLength?: number
  numItems?: number
  orientation?: ListOrientation
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
    list: classNames({
      togglable: isSelectionTogglable,
      collapsed: isCollapsed,
      expanded: !isCollapsed,
    }),
  })
}

function getFixedStyles({ isCollapsed, isInverted, itemPadding = 0, maxVisibleItems = 0, menuLength, numItems = 0, orientation }: StylesProps) {
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
    list: {
      position: 'absolute',
      ...orientation === 'vertical' ? {
        transition: 'height 100ms ease-out',
        width: '100%',
        height: isCollapsed ? '0px' : `${menuLength}px`,
        overflowY: maxVisibleItems === -1 ? 'hidden' : maxVisibleItems < numItems ? 'scroll' : 'hidden',
        ...isInverted ? {
          marginBottom: `${itemPadding}px`,
          bottom: '100%',
        } : {
          top: '100%',
          marginTop: `${itemPadding}px`,
        },
      } : {
        transition: 'width 100ms ease-out',
        width: isCollapsed ? '0px' : `${menuLength}px`,
        height: '100%',
        overflowX: maxVisibleItems === -1 ? 'hidden' : maxVisibleItems < numItems ? 'scroll' : 'hidden',
        ...isInverted ? {
          marginRight: `${itemPadding}px`,
          right: '100%',
        } : {
          left: '100%',
          marginLeft: `${itemPadding}px`,
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
