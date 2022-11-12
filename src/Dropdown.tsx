import classNames from 'classnames'
import React, { ComponentType, forwardRef, HTMLAttributes, PropsWithChildren, ReactElement, Ref, useEffect, useRef, useState } from 'react'
import FlatSVG from './FlatSVG'
import useElementRect from './hooks/useElementRect'
import List, { ListItemProps } from './List'
import { Orientation } from './types'
import asClassNameDict from './utils/asClassNameDict'
import asComponentDict from './utils/asComponentDict'
import asStyleDict from './utils/asStyleDict'
import cloneStyledElement from './utils/cloneStyledElement'
import styles from './utils/styles'

/**
 * Type constraint of the data passed to each item in the component.
 */
export type DropdownData = {
  label?: string
}

/**
 * Type defining the props of the item component type to be provided to the
 * component. The data type is generic.
 */
export type DropdownItemProps<T extends DropdownData = DropdownData> = ListItemProps<T>

export type DropdownProps<T extends DropdownData = DropdownData> = HTMLAttributes<HTMLDivElement> & PropsWithChildren<{
  /**
   * Data of every item in the component. This is used to generate individual
   * menu items. Data type is generic.
   */
  data: T[]

  /**
   * Indicates if the component is inverted (i.e. "dropup" instead of dropdown).
   * Supports all orientations.
   */
  isInverted?: boolean

  /**
   * Indicates if items can be toggled, i.e. they can be deselected if selected
   * again.
   */
  isTogglable?: boolean

  /**
   * Thickness of the border (in pixels) of every item and the dropdown button
   * itself. 0 indicates no borders.
   */
  borderThickness?: number

  /**
   * The index of the default selected item.
   */
  selectedIndex?: number

  /**
   * Length (in pixels) of each item. This does not apply to the dropdown button
   * itself. Length refers to the height in vertical orientation and width in
   * horizontal orientation.
   */
  itemLength?: number

  /**
   * Padding (in pixels) of each item.
   */
  itemPadding?: number

  /**
   * Maximum number of items that are viside when the component expands. When a
   * value greater than or equal to 0 is specified, only that number of items
   * will be visible at a time, and a scrollbar will appear to scroll to
   * remaining items. Any value less than 0 indicates that all items will be
   * visible when the component expands.
   */
  maxVisibleItems?: number

  /**
   * Orientation of the component.
   */
  orientation?: Orientation

  /**
   * Color of the border of every item and the dropdown button itself.
   */
  borderColor?: string

  /**
   * The label to appear on the dropdown button when no items are selected.
   */
  defaultLabel?: string

  /**
   * SVG markup to be put in the dropdown button as the expand icon.
   */
  expandIconSvg?: string

  /**
   * React component type to be used for generating items inside the component.
   */
  itemComponentType: ComponentType<DropdownItemProps<T>>

  /**
   * Handler invoked whenever the selected index changes.
   */
  onIndexChange?: (index: number) => void
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
  borderColor = '#000',
  borderThickness = 1,
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
  selectedIndex: externalSelectedIndex = -1,
  onIndexChange,
  ...props
}, ref) => {
  const selectItemAt = (index: number) => {
    setSelectedIndex(index)
    setIsCollapsed(true)
  }

  const expand = () => {
    if (!isCollapsed) return
    setIsCollapsed(false)
  }

  const collapse = () => {
    if (isCollapsed) return
    setIsCollapsed(true)
  }

  const toggle = () => {
    if (isCollapsed) {
      expand()
    }
    else {
      collapse()
    }
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
  const [selectedIndex, setSelectedIndex] = useState(externalSelectedIndex)
  const [isCollapsed, setIsCollapsed] = useState(true)
  const rect = useElementRect(bodyRef)

  useEffect(() => {
    window.addEventListener('click', clickOutsideHandler)

    return () => {
      window.removeEventListener('click', clickOutsideHandler)
    }
  }, [isCollapsed])

  useEffect(() => {
    if (externalSelectedIndex === selectedIndex) return
    setSelectedIndex(externalSelectedIndex)
  }, [externalSelectedIndex])

  useEffect(() => {
    onIndexChange?.(selectedIndex)
  }, [selectedIndex])

  const itemLength = externalItemLength ?? (orientation === 'vertical' ? rect.height : rect.width)
  const numItems = data.length
  const numVisibleItems = maxVisibleItems < 0 ? numItems : Math.min(numItems, maxVisibleItems)
  const menuLength = (itemLength - borderThickness) * numVisibleItems + itemPadding * (numVisibleItems - 1) + borderThickness

  const components = asComponentDict(children, {
    toggle: DropdownToggle,
    toggleIcon: DropdownToggleIcon,
  })

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
    toggleIcon: classNames(orientation, {
      togglable: isTogglable,
      collapsed: isCollapsed,
      expanded: !isCollapsed,
    }),
    list: classNames(orientation, {
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
    },
    toggleIcon: {

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
    toggleIcon: {
      height: '15px',
      margin: '0',
      padding: '0',
      width: '15px',
    },
  })

  return (
    <div
      {...props}
      ref={ref}
      className={classNames(className, fixedClassNames.root)}
      style={styles(style, fixedStyles.root)}
    >
      <div ref={bodyRef} style={styles(fixedStyles.body)}>
        {cloneStyledElement(components.toggle ?? <button style={defaultStyles.toggle}/>, {
          className: classNames(fixedClassNames.toggle),
          style: styles(fixedStyles.toggle),
          onClick: () => toggle(),
        }, ...[
          <label style={fixedStyles.toggleLabel} dangerouslySetInnerHTML={{ __html: selectedIndex === -1 ? defaultLabel : data[selectedIndex].label ?? '' }}/>,
          expandIconSvg && cloneStyledElement(components.toggleIcon ?? <FlatSVG svg={expandIconSvg} style={defaultStyles.toggleIcon}/>, {
            className: classNames(fixedClassNames.toggleIcon),
            style: styles(fixedStyles.toggleIcon),
          }),
        ])}
        <List
          className={fixedClassNames.list}
          style={styles(fixedStyles.list)}
          borderThickness={borderThickness}
          data={data}
          isSelectable={true}
          isTogglable={false}
          itemComponentType={itemComponentType}
          itemLength={itemLength}
          itemPadding={itemPadding}
          orientation={orientation}
          selectedIndex={selectedIndex}
          onDeselectAt={idx => selectItemAt(-1)}
          onSelectAt={idx => selectItemAt(idx)}
        />
      </div>
    </div>
  )
}) as <T extends DropdownData = DropdownData>(props: DropdownProps<T> & { ref?: Ref<HTMLDivElement> }) => ReactElement

export const DropdownToggle = ({ ...props }: HTMLAttributes<HTMLButtonElement>) => <button {...props}/>

export const DropdownToggleIcon = ({ ...props }: HTMLAttributes<HTMLDivElement>) => <div {...props}/>
