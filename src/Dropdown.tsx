import classNames from 'classnames'
import isEqual from 'fast-deep-equal'
import React, { forwardRef, useEffect, useRef, useState, type ComponentType, type HTMLAttributes, type PropsWithChildren, type ReactElement, type Ref } from 'react'
import FlatSVG from './FlatSVG'
import List, { type ListItemProps, type ListProps } from './List'
import useElementRect from './hooks/useElementRect'
import asClassNameDict from './utils/asClassNameDict'
import asStyleDict from './utils/asStyleDict'
import cloneStyledElement from './utils/cloneStyledElement'
import styles from './utils/styles'

export type DropdownData = {
  label?: string
}

export type DropdownToggleProps = HTMLAttributes<HTMLElement> & PropsWithChildren

export type DropdownItemProps<T extends DropdownData = DropdownData> = ListItemProps<T>

export type DropdownProps<T extends DropdownData = DropdownData> = HTMLAttributes<HTMLDivElement> & ListProps<T> & PropsWithChildren<{
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
   * The label to appear on the dropdown button when no items are selected.
   */
  defaultLabel?: string

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
   * React component type to be used for generating the toggle element inside
   * the component. When absent, one will be generated automatically.
   */
  toggleComponentType?: ComponentType<DropdownToggleProps>
}>

/**
 * A dropdown menu component that is invertible (i.e. can "dropup" instead) and
 * supports both horizontal and vertical orientations. Provide data and item
 * component type to this component to automatically generate menu items.
 */
export default forwardRef(({
  children,
  className,
  style,
  borderThickness = 0,
  collapseIconSvg,
  collapsesOnSelect = true,
  data,
  defaultLabel = 'Select',
  expandIconSvg,
  isInverted = false,
  isTogglable = false,
  itemComponentType,
  itemLength: externalItemLength,
  itemPadding = 0,
  maxVisibleItems = -1,
  orientation = 'vertical',
  selectedIndices: externalSelectedIndices = [],
  selectionMode = 'single',
  toggleComponentType: ToggleComponent,
  onActivateAt,
  onDeselectAt,
  onSelectAt,
  onSelectionChange,
  ...props
}, ref) => {
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
  const [selectedIndices, setSelectedIndices] = useState(externalSelectedIndices)
  const [isCollapsed, setIsCollapsed] = useState(true)
  const rect = useElementRect(bodyRef)

  useEffect(() => {
    window.addEventListener('click', clickOutsideHandler)

    return () => {
      window.removeEventListener('click', clickOutsideHandler)
    }
  }, [isCollapsed])

  useEffect(() => {
    if (isEqual(externalSelectedIndices, selectedIndices)) return

    setSelectedIndices(externalSelectedIndices)
  }, [JSON.stringify(externalSelectedIndices)])

  const itemLength = externalItemLength ?? (orientation === 'vertical' ? rect.height : rect.width)
  const numItems = data.length
  const numVisibleItems = maxVisibleItems < 0 ? numItems : Math.min(numItems, maxVisibleItems)
  const menuLength = (itemLength - borderThickness) * numVisibleItems + itemPadding * (numVisibleItems - 1) + borderThickness

  const fixedClassNames = asClassNameDict({
    root: classNames(orientation, {
      togglable: isTogglable,
      collapsed: isCollapsed,
      expanded: !isCollapsed,
    }),
    toggle: classNames(orientation, {
      togglable: isTogglable,
      collapsed: isCollapsed,
      expanded: !isCollapsed,
    }),
    expandIcon: classNames(orientation, {
      togglable: isTogglable,
      collapsed: isCollapsed,
      expanded: !isCollapsed,
    }),
    collapseIcon: classNames(orientation, {
      togglable: isTogglable,
      collapsed: isCollapsed,
      expanded: !isCollapsed,
    }),
    list: classNames({
      togglable: isTogglable,
      collapsed: isCollapsed,
      expanded: !isCollapsed,
    }),
  })

  const fixedStyles = asStyleDict({
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
      borderWidth: `${borderThickness}px`,
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
          marginBottom: `${itemPadding - borderThickness}px`,
          bottom: '100%',
        } : {
          top: '100%',
          marginTop: `${itemPadding - borderThickness}px`,
        },
      } : {
        transition: 'width 100ms ease-out',
        width: isCollapsed ? '0px' : `${menuLength}px`,
        height: '100%',
        overflowX: maxVisibleItems === -1 ? 'hidden' : maxVisibleItems < numItems ? 'scroll' : 'hidden',
        ...isInverted ? {
          marginRight: `${itemPadding - borderThickness}px`,
          right: '100%',
        } : {
          left: '100%',
          marginLeft: `${itemPadding - borderThickness}px`,
        },
      },
    },
  })

  const defaultStyles = asStyleDict({
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
          />
        ) : (
          <button
            className={classNames(fixedClassNames.toggle)}
            style={styles(fixedStyles.toggle, defaultStyles.toggle)}
            onClick={() => toggle()}
          >
            <label style={fixedStyles.toggleLabel} dangerouslySetInnerHTML={{ __html: selectedIndices.length > 0 ? selectedIndices.map(t => data[t].label).join(', ') : defaultLabel ?? '' }}/>
            {cloneStyledElement(isCollapsed ? expandIconComponent : collapseIconComponent, {
              className: classNames(isCollapsed ? fixedClassNames.expandIcon : fixedClassNames.collapseIcon),
              style: styles(isCollapsed ? fixedStyles.expandIcon : fixedStyles.collapseIcon),
            })}
          </button>
        )}
        <List
          className={fixedClassNames.list}
          style={styles(fixedStyles.list)}
          borderThickness={borderThickness}
          data={data}
          isTogglable={isTogglable}
          itemComponentType={itemComponentType}
          itemLength={itemLength}
          itemPadding={itemPadding}
          orientation={orientation}
          selectedIndices={selectedIndices}
          selectionMode={selectionMode}
          onActivateAt={onActivateAt}
          onDeselectAt={onDeselectAt}
          onSelectAt={selectAtHandler}
          onSelectionChange={onSelectionChange}
        />
      </div>
    </div>
  )
}) as <T extends DropdownData = DropdownData>(props: DropdownProps<T> & { ref?: Ref<HTMLDivElement> }) => ReactElement
