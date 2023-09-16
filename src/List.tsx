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
   * Optional length (in pixels) of each item. Length refers to the height in
   * vertical orientation and width in horizontal orientation.
   */
  itemLength?: number

  /**
   * Padding between every item (in pixels).
   */
  itemPadding?: number

  /**
   * Indicates the selection behavior:
   *   - `none`: No selection at all.
   *   - `single`: Only one item can be selected at a time.
   *   - `multiple`: Multiple items can be selected at the same time.
   */
  selectionMode?: 'none' | 'single' | 'multiple'

  /**
   * Indicates if items can be toggled, i.e. they can be deselected if selected
   * again.
   */
  isTogglable?: boolean

  /**
   * Orientation of the component.
   */
  orientation?: Orientation

  /**
   * Handler invoked when an item is activated.
   */
  onActivateAt?: (index: number) => void

  /**
   * Handler invoked when an item is deselected.
   */
  onDeselectAt?: (index: number) => void

  /**
   * Handler invoked when an item is selected.
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
  onActivateAt,
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

        break
      case 'single':
        setSelectedIndices([index])

        break
      default:
        break
    }
  }

  const deselectAt = (index: number) => {
    if (!isSelectedAt(index)) return

    setSelectedIndices(prev => prev.filter(t => t !== index))
  }

  const activateAt = (index: number) => {
    if (selectionMode !== 'none') {
      if (isTogglable) {
        toggleAt(index)
      }
      else {
        selectAt(index)
      }
    }

    onActivateAt?.(index)
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
              onClick={() => activateAt(idx)}
            />
          )}
        </Each>
      )}
    </div>
  )
}) as <T>(props: ListProps<T> & { ref?: Ref<HTMLDivElement> }) => ReactElement
