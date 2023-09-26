import classNames from 'classnames'
import isDeepEqual from 'fast-deep-equal/react'
import React, { forwardRef, useEffect, useState, type ComponentType, type HTMLAttributes, type ReactElement, type Ref } from 'react'
import Each from './Each'
import usePrevious from './hooks/usePrevious'
import asClassNameDict from './utils/asClassNameDict'
import asStyleDict from './utils/asStyleDict'
import styles from './utils/styles'

export type CollectionOrientation = 'horizontal' | 'vertical'

export type CollectionLayout = 'list' | 'grid'

export type CollectionSelectionMode = 'none' | 'single' | 'multiple'

export type CollectionSelection = number[]

export type CollectionItemProps<T> = HTMLAttributes<HTMLElement> & {
  index: number
  isSelected: boolean
  item: T
  orientation: CollectionOrientation
  onCustomEvent?: (name: string, info?: any) => void
}

export type CollectionProps<T> = HTMLAttributes<HTMLDivElement> & {
  /**
   * Indicates if item selection can be toggled, i.e. they can be deselected if
   * selected again.
   */
  isSelectionTogglable?: boolean

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
   * Generically typed data of each item.
   */
  items: T[]

  /**
   * Specifies the layout of this component.
   */
  layout?: CollectionLayout

  /**
   * This property is only used if the layout is set to `grid`. Specifies the
   * number of columns if orientation is `vertical` or number of rows if
   * orientation is `horizontal`.
   */
  numSegments?: number

  /**
   * Orientation of the component.
   */
  orientation?: CollectionOrientation

  /**
   * The selected indices. If `selectionMode` is `single`, only only the first
   * value will be used.
   */
  selection?: CollectionSelection

  /**
   * Indicates the selection behavior:
   *   - `none`: No selection at all.
   *   - `single`: Only one item can be selected at a time.
   *   - `multiple`: Multiple items can be selected at the same time.
   */
  selectionMode?: CollectionSelectionMode

  /**
   * Handler invoked when an item is activated.
   *
   * @param index Item index.
   */
  onActivateAt?: (index: number) => void

  /**
   * Handler invoked when an item is deselected.
   *
   * @param index Item index.
   */
  onDeselectAt?: (index: number) => void

  /**
   * Handler invoked when a custom event is dispatched from the item.
   *
   * @param index Index of the item.
   * @param eventName Name of the dispatched custom event.
   * @param eventInfo Optional info of the dispatched custom event.
   */
  onItemCustomEvent?: (index: number, eventName: string, eventInfo?: any) => void

  /**
   * Handler invoked when an item is selected.
   *
   * @param index Item index.
   */
  onSelectAt?: (index: number) => void

  /**
   * Handler invoked when the selected items changed.
   *
   * @param selection Indices of selected items.
   */
  onSelectionChange?: (selection: CollectionSelection) => void

  /**
   * React component type to be used to generate items for this collection.
   */
  ItemComponent?: ComponentType<CollectionItemProps<T>>
}

/**
 * A scrollable collection of selectable items. Items are generated based on the
 * provided React component type. The type of data passed to each item is
 * generic. This component supports both horizontal and vertical orientations.
 */
const Collection = forwardRef(({
  className,
  style,
  isSelectionTogglable = false,
  itemLength = 50,
  itemPadding = 0,
  items,
  layout = 'list',
  numSegments = 1,
  orientation = 'vertical',
  selection: externalSelection = [],
  selectionMode = 'none',
  onActivateAt,
  onDeselectAt,
  onItemCustomEvent,
  onSelectAt,
  onSelectionChange,
  ItemComponent,
  ...props
}, ref) => {
  const isIndexOutOfRange = (index: number) => {
    if (isNaN(index)) return true
    if (index >= items.length) return true
    if (index < 0) return true

    return false
  }

  const sanitizeSelection = (indices: CollectionSelection) => indices.sort().filter(t => !isIndexOutOfRange(t))

  const isSelectedAt = (index: number) => selection.indexOf(index) >= 0

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
        setSelection(prev => [...prev.filter(t => t !== index), index].sort())

        break
      case 'single':
        setSelection([index])

        break
      default:
        break
    }
  }

  const deselectAt = (index: number) => {
    if (!isSelectedAt(index)) return

    setSelection(prev => prev.filter(t => t !== index))
  }

  const activateAt = (index: number) => {
    if (selectionMode !== 'none') {
      if (isSelectionTogglable) {
        toggleAt(index)
      }
      else {
        selectAt(index)
      }
    }

    onActivateAt?.(index)
  }

  const sanitizedExternalSelection = sanitizeSelection(externalSelection)
  const [selection, setSelection] = useState(sanitizedExternalSelection)
  const prevSelection = usePrevious(selection, { sanitizeDependency: JSON.stringify })
  const fixedClassNames = getFixedClassNames({ orientation })
  const fixedStyles = getFixedStyles({ itemLength, itemPadding, layout, numSegments, orientation })

  useEffect(() => {
    if (isDeepEqual(sanitizedExternalSelection, selection)) return

    setSelection(sanitizedExternalSelection)
  }, [JSON.stringify(sanitizedExternalSelection)])

  useEffect(() => {
    if (selectionMode === 'none') return
    if (!prevSelection) return

    const deselected = prevSelection?.filter(t => selection.indexOf(t) === -1) ?? []
    const selected = selection.filter(t => prevSelection?.indexOf(t) === -1)

    deselected.map(t => onDeselectAt?.(t))
    selected.map(t => onSelectAt?.(t))

    onSelectionChange?.(selection)
  }, [JSON.stringify(selection)])

  return (
    <div
      {...props}
      ref={ref}
      className={classNames(className, fixedClassNames.root)}
      style={styles(style, fixedStyles.root)}
    >
      {ItemComponent && (
        <Each in={items}>
          {(val, idx) => (
            <ItemComponent
              className={classNames(fixedClassNames.item, {
                selected: isSelectedAt(idx),
              })}
              style={styles(fixedStyles.item, {
                pointerEvents: isSelectionTogglable !== true && isSelectedAt(idx) ? 'none' : 'auto',
                ...idx >= items.length - 1 ? {} : {
                  ...layout === 'list' ? {
                    ...orientation === 'vertical' ? {
                      marginBottom: `${itemPadding}px`,
                    } : {
                      marginRight: `${itemPadding}px`,
                    },
                  } : {},
                },
              })}
              data-index={idx}
              index={idx}
              isSelected={isSelectedAt(idx)}
              item={val}
              orientation={orientation}
              onCustomEvent={(name, info) => onItemCustomEvent?.(idx, name, info)}
              onClick={() => activateAt(idx)}
            />
          )}
        </Each>
      )}
    </div>
  )
}) as <T>(props: CollectionProps<T> & { ref?: Ref<HTMLDivElement> }) => ReactElement

Object.defineProperty(Collection, 'displayName', { value: 'Collection', writable: false })

export default Collection

type StylesProps = {
  itemLength?: number
  itemPadding?: number
  layout?: CollectionLayout
  numSegments?: number
  orientation?: CollectionOrientation
}

function getFixedClassNames({ orientation }: StylesProps) {
  return asClassNameDict({
    root: classNames('collection', orientation),
    item: classNames('item', orientation),
  })
}

function getFixedStyles({ itemLength, itemPadding = 0, layout, numSegments = 1, orientation }: StylesProps) {
  return asStyleDict({
    root: {
      counterReset: 'item-counter',
      listStyle: 'none',
      ...layout === 'list' ? {
        alignItems: 'flex-start',
        display: 'flex',
        flex: '0 0 auto',
        flexDirection: orientation === 'horizontal' ? 'row' : 'column',
        justifyContent: 'flex-start',
      } : {
        display: 'grid',
        gap: `${itemPadding}px`,
        ...orientation === 'vertical' ? {
          gridAutoRows: itemLength !== undefined ? `${itemLength}px` : undefined,
          gridTemplateColumns: `repeat(${numSegments}, 1fr)`,
          gridAutoFlow: 'row',
        } : {
          gridAutoColumns: itemLength !== undefined ? `${itemLength}px` : undefined,
          gridTemplateRows: `repeat(${numSegments}, 1fr)`,
          gridAutoFlow: 'column',
        },
      },
    },
    item: {
      border: 'none',
      counterIncrement: 'item-counter',
      flex: '0 0 auto',
      ...layout === 'list' ? {
        ...orientation === 'vertical' ? {
          width: '100%',
          height: itemLength !== undefined ? `${itemLength}px` : undefined,
        } : {
          width: itemLength !== undefined ? `${itemLength}px` : undefined,
          height: '100%',
        },
      } : {},
    },
  })
}
