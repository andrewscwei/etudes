import classNames from 'classnames'
import React, { CSSProperties, forwardRef, HTMLAttributes, ReactElement, Ref, useEffect, useState } from 'react'
import Each from './Each'
import usePrevious from './hooks/usePrevious'
import { Orientation } from './types'
import asStyleDict from './utils/asStyleDict'
import cloneStyledElement from './utils/cloneStyledElement'
import styles from './utils/styles'

export type ListItemProps<T> = {
  data: T
  index: number
  isSelected: boolean
  orientation: Orientation
}

export type ListProps<T> = Omit<HTMLAttributes<HTMLOListElement>, 'children'> & {
  /**
   * The children inside this component represents the component for each item
   * in the list. Only 1 child is expected and will be used to generate all
   * items.
   */
  children?: (props: ListItemProps<T>) => JSX.Element

  /**
   * Generically typed data of each item.
   */
  data: T[]

  /**
   * The selected index. Any value below 0 indicates that nothing is
   * selected.
   */
  selectedIndex?: number

  /**
   * React component type to be used to generate items for this list.
   */
  // itemComponentType: ComponentType<ItemComponentProps<T>>

  /**
   * Padding between every item (in pixels).
   */
  itemPadding?: number

  /**
   * Inline style attribute of the root element of the item component.
   */
  itemStyle?: CSSProperties

  /**
   * Indicates whether selections are retained. For example, in the case of a
   * vertical list of clickable rows, being able to retain a selection means
   * when the row is clicked, it becomes and stays selected. Being unable to
   * retain a selection means when the row is clicked, it does not become
   * selected. It is simply clicked and the subsequent event is dispatched.
   */
  isSelectable?: boolean

  /**
   * Indicates whether selections can be toggled. For example, in the case of a
   * vertical list of selectable rows, being able to toggle a row means it gets
   * deselected when selected again. Being unable to toggle the row means it
   * does not get deselected when selected again.
   */
  isTogglable?: boolean

  /**
   * Orientation of the list.
   */
  orientation?: Orientation

  /**
   * Handler invoked when an index is activated.
   */
  onActivate?: (index: number) => void

  /**
   * Handler invoked when an index is deselected.
   */
  onDeselectAt?: (index: number) => void

  /**
   * Handler invoked when an index is selected.
   */
  onSelectAt?: (index: number) => void
}

/**
 * A scrollable list of selectable items. Items are generated based on the
 * provided React component type. The type of data passed to each item is
 * generic. This component supports both horizontal and vertical orientations.
 */
export default forwardRef(({
  children,
  className,
  style,
  data,
  isSelectable,
  isTogglable,
  itemPadding = 0,
  itemStyle,
  orientation = 'vertical',
  selectedIndex: externalSelectedIndex = -1,
  onActivate,
  onDeselectAt,
  onSelectAt,
  ...props
}, ref) => {
  const isIndexOutOfRange = (index: number) => {
    if (index >= data.length) return true
    if (index < 0) return true

    return false
  }

  const isSelectedAt = (index: number) => selectedIndex === index

  const toggleAt = (index: number) => {
    if (isSelectedAt(index)) {
      deselectAt(index)
    }
    else {
      selectAt(index)
    }
  }

  const selectAt = (index: number) => {
    if (isSelectedAt(index)) return
    setSelectedIndex(index)
  }

  const deselectAt = (index: number) => {
    if (!isSelectedAt(index)) return
    setSelectedIndex(-1)
  }

  const onClick = (index: number) => {
    if (isSelectable) {
      if (isTogglable) {
        toggleAt(index)
      }
      else {
        selectAt(index)
      }
    }

    onActivate?.(index)
  }

  const [selectedIndex, setSelectedIndex] = useState(externalSelectedIndex)
  const prevSelectedIndex = usePrevious(selectedIndex)

  useEffect(() => {
    if (externalSelectedIndex === selectedIndex) return
    setSelectedIndex(selectedIndex)
  }, [externalSelectedIndex])

  useEffect(() => {
    if (!isSelectable) return

    if (!isIndexOutOfRange(prevSelectedIndex ?? -1)) onDeselectAt?.(prevSelectedIndex ?? -1)
    if (!isIndexOutOfRange(selectedIndex)) onSelectAt?.(selectedIndex)
  }, [selectedIndex])

  const fixedStyles = asStyleDict({
    root: {
      alignItems: 'flex-start',
      counterReset: 'item-counter',
      display: 'flex',
      flex: '0 0 auto',
      flexDirection: orientation === 'horizontal' ? 'row' : 'column',
      justifyContent: 'flex-start',
      listStyle: 'none',
    },
    item: {
      flex: '0 0 auto',
      counterIncrement: 'item-counter',
    },
  })

  return (
    <ol
      {...props}
      className={classNames(className, orientation)}
      ref={ref}
      style={styles(style, fixedStyles.root)}
    >
      {children && (
        <Each in={data}>
          {(val, idx) => cloneStyledElement(children({
            data: val,
            index: idx,
            isSelected: isSelectedAt(idx),
            orientation,
          }), {
            'className': classNames(orientation, {
              selected: isSelectedAt(idx),
              togglable: isTogglable,
            }),
            'style': styles(fixedStyles.item, {
              pointerEvents: isTogglable !== true && isSelectedAt(idx) ? 'none' : 'auto',
              ...idx >= data.length - 1 ? {} : {
                ...orientation === 'vertical' ? {
                  marginBottom: `${itemPadding}px`,
                } : {
                  marginRight: `${itemPadding}px`,
                },
              },
            }),
            'data-index': idx,
            'onClick': () => onClick(idx),
          })}
        </Each>
      )}
    </ol>
  )
}) as <T>(props: ListProps<T> & { ref?: Ref<HTMLOListElement> }) => ReactElement
