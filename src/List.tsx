import classNames from 'classnames'
import isEqual from 'fast-deep-equal'
import React, { forwardRef, useEffect, useState, type ComponentType, type HTMLAttributes, type ReactElement, type Ref } from 'react'
import Each from './Each'
import usePrevious from './hooks/usePrevious'
import asClassNameDict from './utils/asClassNameDict'
import asStyleDict from './utils/asStyleDict'
import styles from './utils/styles'

type Orientation = 'horizontal' | 'vertical'

export type ListItemProps<T> = HTMLAttributes<HTMLElement> & {
  data: T
  index: number
  isSelected: boolean
  orientation: Orientation
}

export type ListProps<T> = HTMLAttributes<HTMLDivElement> & {
  /**
   * Thickness of item borders (in pixels). 0 indicates no borders.
   */
  borderThickness?: number

  /**
   * Generically typed data of each item.
   */
  data: T[]

  /**
   * The selected indices. If `selectionMode` is `single`, only only the first
   * value will be used.
   */
  selectedIndices?: number[]

  /**
   * React component type to be used to generate items for this list.
   */
  itemComponentType?: ComponentType<ListItemProps<T>>

  /**
   * Optional length of each item.
   */
  itemLength?: number

  /**
   * Padding between every item (in pixels).
   */
  itemPadding?: number

  /**
   * Indicates whether selections are retained. For example, in the case of a
   * vertical list of clickable rows, being able to retain a selection means
   * when the row is clicked, it becomes and stays selected. Being unable to
   * retain a selection means when the row is clicked, it does not become
   * selected. It is simply clicked and the subsequent event is dispatched.
   */
  selectionMode?: 'none' | 'single' | 'multiple'

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
  className,
  style,
  borderThickness = 0,
  data,
  selectionMode = 'none',
  isTogglable,
  itemComponentType: ItemComponentType,
  itemLength,
  itemPadding = 0,
  orientation = 'vertical',
  selectedIndices: externalSelectedIndices = [],
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

  const isSelectedAt = (index: number) => selectedIndices.indexOf(index) >= 0

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

    switch (selectionMode) {
      case 'multiple':
        setSelectedIndices(prev => [...prev, index])

        return
      case 'single':
        setSelectedIndices([index])

        return
      default:
        return
    }
  }

  const deselectAt = (index: number) => {
    if (!isSelectedAt(index)) return

    setSelectedIndices(prev => prev.filter(t => t !== index))
  }

  const onClick = (index: number) => {
    if (selectionMode !== 'none') {
      if (isTogglable) {
        toggleAt(index)
      }
      else {
        selectAt(index)
      }
    }

    onActivate?.(index)
  }

  const [selectedIndices, setSelectedIndices] = useState(externalSelectedIndices)
  const prevSelectedIndices = usePrevious(selectedIndices)

  useEffect(() => {
    if (isEqual(externalSelectedIndices, selectedIndices)) return

    setSelectedIndices(externalSelectedIndices)
  }, [JSON.stringify(externalSelectedIndices)])

  useEffect(() => {
    if (selectionMode === 'none') return

    const deselected = prevSelectedIndices?.filter(t => !isIndexOutOfRange(t) && selectedIndices.indexOf(t) === -1) ?? []
    const selected = selectedIndices.filter(t => !isIndexOutOfRange(t) && prevSelectedIndices?.indexOf(t) === -1)

    deselected.map(t => onDeselectAt?.(t))
    selected.map(t => onSelectAt?.(t))
  }, [selectedIndices])

  const fixedClassNames = asClassNameDict({
    root: classNames(orientation, {
      togglable: isTogglable,
    }),
    item: classNames(orientation, {
      togglable: isTogglable,
    }),
  })

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
      borderWidth: `${borderThickness}px`,
      counterIncrement: 'item-counter',
      flex: '0 0 auto',
      ...orientation === 'vertical' ? {
        width: '100%',
      } : {
        height: '100%',
      },
    },
  })

  return (
    <div
      {...props}
      ref={ref}
      className={classNames(className, fixedClassNames.root)}
      style={styles(style, fixedStyles.root)}
    >
      {ItemComponentType && (
        <Each in={data}>
          {(val, idx) => (
            <ItemComponentType
              className={classNames(fixedClassNames.item, {
                selected: isSelectedAt(idx),
              })}
              style={styles(fixedStyles.item, {
                pointerEvents: isTogglable !== true && isSelectedAt(idx) ? 'none' : 'auto',
                ...orientation === 'vertical' ? {
                  height: itemLength !== undefined ? `${itemLength}px` : undefined,
                  marginTop: `${idx === 0 ? 0 : -borderThickness}px`,
                } : {
                  marginLeft: `${idx === 0 ? 0 : -borderThickness}px`,
                  width: itemLength !== undefined ? `${itemLength}px` : undefined,
                },
                ...idx >= data.length - 1 ? {} : {
                  ...orientation === 'vertical' ? {
                    marginBottom: `${itemPadding}px`,
                  } : {
                    marginRight: `${itemPadding}px`,
                  },
                },
              })}
              data-index={idx}
              data={val}
              index={idx}
              isSelected={isSelectedAt(idx)}
              orientation={orientation}
              onClick={() => onClick(idx)}
            />
          )}
        </Each>
      )}
    </div>
  )
}) as <T>(props: ListProps<T> & { ref?: Ref<HTMLDivElement> }) => ReactElement
