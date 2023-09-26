import classNames from 'classnames'
import React, { forwardRef, useEffect, useState, type ComponentType, type HTMLAttributes, type ReactElement, type Ref } from 'react'
import Each from './Each'
import usePrevious from './hooks/usePrevious'
import asClassNameDict from './utils/asClassNameDict'
import asStyleDict from './utils/asStyleDict'
import styles from './utils/styles'

export type CollectionOrientation = 'horizontal' | 'vertical'

/**
 * Type describing the layout appearance of {@link Collection}:
 *   - `list`: Items will be laid out in a list.
 *   - `grid`: Items will be laid out in a grid.
 */
export type CollectionLayout = 'list' | 'grid'

/**
 *  Type describing the item selection behavior of {@link Collection}:
 *    - `none`: No selection permitted at all.
 *    - `single`: Only one item can be selected at a time (the previously
 *                selected item will be automatically deselected).
 *    - `multiple`: Multiple items can be selected simultaneously.
 */
export type CollectionSelectionMode = 'none' | 'single' | 'multiple'

/**
 * Type describing the current item selection of {@link Collection}, composed of
 * an array of indices of items that are selected. If the selection mode of the
 * {@link Collection} is `single`, only one index is expected in this array.
 */
export type CollectionSelection = number[]

/**
 * Type describing the props of `ItemComponent` provided to {@link Collection}.
 */
export type CollectionItemProps<T> = HTMLAttributes<HTMLElement> & {
  /**
   * The index of the item.
   */
  index: number

  /**
   * Indicates whether the item is selected.
   */
  isSelected: boolean

  /**
   * Data provided to thse item.
   */
  item: T

  /**
   * Orientation of the parent collection.
   */
  orientation: CollectionOrientation

  /**
   * Handler invoked to dispatch a custom event.
   *
   * @param name User-defined name of the custom event.
   * @param info Optional user-defined info of the custom event.
   */
  onCustomEvent?: (name: string, info?: any) => void
}

/**
 * Type describing the props of {@link Collection}.
 */
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
   * Specifies the layout appearance of this component.
   *
   * @see {@link CollectionLayout}
   */
  layout?: CollectionLayout

  /**
   * Specifies the number of columns of this collection if the orientation is
   * `vertical` or number of rows if the orientation is `horizontal`. This
   * property is only used if the layout is set to `grid`.
   */
  numSegments?: number

  /**
   * Orientation of the component.
   *
   * @see {@link CollectionOrientation}
   */
  orientation?: CollectionOrientation

  /**
   * The selected indices. If `selectionMode` is `single`, only only the first
   * value will be used. If specified, the component will not manage selection
   * state.
   *
   * @see {@link CollectionSelection}
   */
  selection?: CollectionSelection

  /**
   * The item selection behavior.
   *
   * @see {@link CollectionSelectionMode}
   */
  selectionMode?: CollectionSelectionMode

  /**
   * Handler invoked when an item is activated (i.e. clicked). The order of
   * handlers invoked when any selection changes take place is:
   *   1. `onActivateAt`
   *   2. `onDeselectAt`
   *   3. `onSelectAt`
   *   4. `onSelectionChange`
   *
   * @param index Item index.
   */
  onActivateAt?: (index: number) => void

  /**
   * Handler invoked when an item is deselected. The order of handlers invoked
   * when any selection changes take place is:
   *   1. `onActivateAt`
   *   2. `onDeselectAt`
   *   3. `onSelectAt`
   *   4. `onSelectionChange`
   *
   * @param index Item index.
   */
  onDeselectAt?: (index: number) => void

  /**
   * Handler invoked when a custom event is dispatched from the item.
   *
   * @param index Index of the item.
   * @param eventName User-defined name of the dispatched custom event.
   * @param eventInfo Optional user-defined info of the dispatched custom event.
   */
  onItemCustomEvent?: (index: number, eventName: string, eventInfo?: any) => void

  /**
   * Handler invoked when an item is selected. The order of handlers invoked
   * when any selection changes take place is:
   *   1. `onActivateAt`
   *   2. `onDeselectAt`
   *   3. `onSelectAt`
   *   4. `onSelectionChange`
   *
   * @param index Item index.
   */
  onSelectAt?: (index: number) => void

  /**
   * Handler invoked when the selected items changed. The order of handlers
   * invoked when any selection changes take place is:
   *   1. `onActivateAt`
   *   2. `onDeselectAt`
   *   3. `onSelectAt`
   *   4. `onSelectionChange`
   *
   * @param selection Indices of selected items.
   */
  onSelectionChange?: (selection: CollectionSelection) => void

  /**
   * Component type for generating items in this collection.
   */
  ItemComponent?: ComponentType<CollectionItemProps<T>>
}

/**
 * A collection of selectable items with generic data. Items are generated based
 * on the provided `ItemComponent`. This component supports different layouts in
 * both horizontal and vertical orientations.
 *
 * This component automatically determines if it should track selection state
 * internally. If the `selection` prop is provided, the component will not
 * initialize the selection state. It will be up to its parent to provide item
 * selection in tandem with the component's `onSelectionChange` handler.
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
  selection: externalSelection,
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
      case 'multiple': {
        const transform = (val: CollectionSelection) => [...val.filter(t => t !== index), index].sort()

        if (setSelection) {
          setSelection(prev => transform(prev))
        }
        else {
          handleSelectionChange(selection, transform(selection))
        }

        break
      }
      case 'single': {
        const transform = (val: CollectionSelection) => [index]

        if (setSelection) {
          setSelection(prev => transform(prev))
        }
        else {
          handleSelectionChange(selection, transform(selection))
        }

        break
      }
      default:
        break
    }
  }

  const deselectAt = (index: number) => {
    if (!isSelectedAt(index)) return

    const transform = (val: CollectionSelection) => val.filter(t => t !== index)

    if (setSelection) {
      setSelection(prev => transform(prev))
    }
    else {
      handleSelectionChange(selection, transform(selection))
    }
  }

  const activateAt = (index: number) => {
    onActivateAt?.(index)

    if (selectionMode === 'none') return

    if (isSelectionTogglable) {
      toggleAt(index)
    }
    else {
      selectAt(index)
    }
  }

  const handleSelectionChange = (oldSelection: CollectionSelection | undefined, newSelection: CollectionSelection) => {
    const deselected = oldSelection?.filter(t => newSelection.indexOf(t) === -1) ?? []
    const selected = newSelection.filter(t => oldSelection?.indexOf(t) === -1)

    deselected.forEach(t => onDeselectAt?.(t))
    selected.forEach(t => onSelectAt?.(t))

    onSelectionChange?.(newSelection)
  }

  const tracksSelectionChanges = externalSelection === undefined && selectionMode !== 'none'

  const sanitizedExternalSelection = sanitizeSelection(externalSelection ?? [])
  const [selection, setSelection] = tracksSelectionChanges ? useState(sanitizedExternalSelection) : [sanitizedExternalSelection]

  const fixedClassNames = getFixedClassNames({ orientation })
  const fixedStyles = getFixedStyles({ itemLength, itemPadding, layout, numSegments, orientation })

  if (setSelection) {
    const prevSelection = usePrevious(selection, { sanitizeDependency: JSON.stringify })

    useEffect(() => {
      if (!prevSelection) return

      handleSelectionChange(prevSelection, selection)
    }, [JSON.stringify(selection)])
  }
  else {
    const prevSelection = usePrevious(sanitizedExternalSelection, { sanitizeDependency: JSON.stringify })

    useEffect(() => {
      if (!prevSelection) return

      handleSelectionChange(prevSelection, sanitizedExternalSelection)
    }, [JSON.stringify(sanitizedExternalSelection)])
  }

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
