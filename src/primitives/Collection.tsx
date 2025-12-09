import clsx from 'clsx'
import isDeepEqual from 'fast-deep-equal/react'
import { forwardRef, useEffect, type ComponentType, type HTMLAttributes, type ReactElement, type Ref } from 'react'
import { Each } from '../flows/Each.js'
import { Styled } from '../utils/Styled.js'
import { asComponentDict } from '../utils/asComponentDict.js'
import { asStyleDict } from '../utils/asStyleDict.js'
import { styles } from '../utils/styles.js'

const _Collection = /* #__PURE__ */ forwardRef(({
  className,
  children,
  style,
  isSelectionTogglable = false,
  itemLength,
  itemPadding = 0,
  items = [],
  layout = 'list',
  numSegments = 1,
  orientation = 'vertical',
  selection: externalSelection,
  selectionMode = 'none',
  onActivateAt,
  onDeselectAt,
  onCustomEvent,
  onSelectAt,
  onSelectionChange,
  ItemComponent,
  ...props
}, ref) => {
  const selection = _sanitizeSelection(externalSelection ?? [], items)
  const fixedStyles = _getFixedStyles({ itemLength, itemPadding, layout, numSegments, orientation })

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

    let transform: (val: Collection.Selection) => Collection.Selection

    switch (selectionMode) {
      case 'multiple': {
        transform = val => _sortIndices([...val.filter(t => t !== index), index])
        break
      }
      case 'single': {
        transform = _ => [index]
        break
      }
      default:
        return
    }

    const oldValue = selection
    const newValue = transform(selection)

    handleSelectionChange(oldValue, newValue)
  }

  const deselectAt = (index: number) => {
    if (!isSelectedAt(index)) return

    const transform = (val: Collection.Selection) => val.filter(t => t !== index)
    const oldValue = selection
    const newValue = transform(selection)

    handleSelectionChange(oldValue, newValue)
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

  const handleSelectionChange = (oldValue: Collection.Selection | undefined, newValue: Collection.Selection) => {
    if (isDeepEqual(oldValue, newValue)) return

    const deselected = oldValue?.filter(t => newValue.indexOf(t) === -1) ?? []
    const selected = newValue.filter(t => oldValue?.indexOf(t) === -1)

    deselected.forEach(t => onDeselectAt?.(t))
    selected.forEach(t => onSelectAt?.(t))

    onSelectionChange?.(newValue)
  }

  useEffect(() => {
    const oldValue = selection
    let newValue: Collection.Selection

    switch (selectionMode) {
      case 'multiple':
        newValue = selection
        break
      case 'single':
        newValue = selection.slice(-1)
        break
      default:
        newValue = []
        break
    }

    handleSelectionChange(oldValue, newValue)
  }, [selectionMode])

  const components = asComponentDict(children, {
    item: _Item,
  })

  return (
    <div
      {...props}
      ref={ref}
      aria-multiselectable={selectionMode === 'multiple'}
      className={clsx(className)}
      role={layout === 'grid' ? 'grid' : (selectionMode === 'none' ? 'list' : 'listbox')}
      style={styles(style, fixedStyles.root)}
    >
      <Each in={items}>
        {(val, idx) => {
          const role = layout === 'grid' ? 'gridcell' : (selectionMode === 'none' ? 'listitem' : 'option')
          const isSelected = isSelectedAt(idx)
          const itemStyles = styles(fixedStyles.item, {
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
          })

          if (ItemComponent) {
            return (
              <ItemComponent
                aria-selected={isSelected}
                className={clsx({ active: isSelected })}
                index={idx}
                isSelected={isSelectedAt(idx)}
                item={val}
                orientation={orientation}
                role={role}
                style={itemStyles}
                onClick={() => activateAt(idx)}
                onCustomEvent={(name, info) => onCustomEvent?.(idx, name, info)}
              />
            )
          }
          else {
            return (
              <Styled
                aria-selected={isSelected}
                className={clsx({ active: isSelected })}
                element={components.item ?? <_Item/>}
                role={role}
                selectionMode={selectionMode}
                style={itemStyles}
                onActivateAt={onActivateAt}
                onClick={() => activateAt(idx)}
              >
                {`${val}`}
              </Styled>
            )
          }
        }}
      </Each>
    </div>
  )
}) as <T>(props: Readonly<Collection.Props<T> & { ref?: Ref<HTMLDivElement> }>) => ReactElement

const _Item = ({ children, selectionMode, onActivateAt, ...props }: HTMLAttributes<HTMLDivElement | HTMLButtonElement> & Pick<Collection.Props<any>, 'selectionMode' | 'onActivateAt'>) => {
  if (onActivateAt || selectionMode === 'single' || selectionMode === 'multiple') {
    return (<button {...props}>{children}</button>)
  }
  else {
    return (<div {...props}>{children}</div>)
  }
}

function _isIndexOutOfRange<T>(index: number, items: T[]) {
  if (isNaN(index)) return true
  if (index >= items.length) return true
  if (index < 0) return true

  return false
}

function _sanitizeSelection<T>(indices: Collection.Selection, items: T[]) {
  return _sortIndices(indices).filter(t => !_isIndexOutOfRange(t, items))
}

function _sortIndices(indices: number[]): number[] {
  return indices.sort((a, b) => a - b)
}

function _getFixedStyles({ itemLength = NaN, itemPadding = 0, layout = 'collection', numSegments = 1, orientation = 'vertical' }) {
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
          gridAutoRows: isNaN(itemLength) ? undefined : `${itemLength}px`,
          gridTemplateColumns: `repeat(${numSegments}, 1fr)`,
          gridAutoFlow: 'row',
        } : {
          gridAutoColumns: isNaN(itemLength) ? undefined : `${itemLength}px`,
          gridTemplateRows: `repeat(${numSegments}, 1fr)`,
          gridAutoFlow: 'column',
        },
      },
    },
    item: {
      counterIncrement: 'item-counter',
      flex: '0 0 auto',
      ...layout === 'list' ? {
        ...orientation === 'vertical' ? {
          width: '100%',
          height: isNaN(itemLength) ? undefined : `${itemLength}px`,
        } : {
          width: isNaN(itemLength) ? undefined : `${itemLength}px`,
          height: '100%',
        },
      } : {},
    },
  })
}

export namespace Collection {
  /**
   * Type describing the layout orientation of items in {@link Collection}.
   */
  export type Orientation = 'horizontal' | 'vertical'

  /**
   * Type describing the layout appearance of {@link Collection}:
   *   - `list`: Items will be laid out in a list.
   *   - `grid`: Items will be laid out in a grid.
   */
  export type Layout = 'list' | 'grid'

  /**
   *  Type describing the item selection behavior of {@link Collection}:
   *    - `none`: No selection permitted at all.
   *    - `single`: Only one item can be selected at a time (the previously
   *                selected item will be automatically deselected).
   *    - `multiple`: Multiple items can be selected simultaneously.
   */
  export type SelectionMode = 'none' | 'single' | 'multiple'

  /**
   * Type describing the current item selection of {@link Collection}, composed
   * of an array of indices of items that are selected. If the selection mode of
   * the {@link Collection} is `single`, only one index is expected in this
   * array.
   */
  export type Selection = number[]

  /**
   * Type describing the props of `ItemComponent` provided to
   * {@link Collection}.
   */
  export type ItemProps<T> = HTMLAttributes<HTMLElement> & {
    /**
     * The index of the item.
     */
    index: number

    /**
     * Indicates whether the item is selected.
     */
    isSelected: boolean

    /**
     * Data provided to the item.
     */
    item: T

    /**
     * Orientation of the parent collection.
     */
    orientation: Orientation

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
  export type Props<T> = HTMLAttributes<HTMLDivElement> & {
    /**
     * Indicates if item selection can be toggled, i.e. they can be deselected
     * if selected again.
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
    items?: T[]

    /**
     * Specifies the layout appearance of this component.
     *
     * @see {@link Layout}
     */
    layout?: Layout

    /**
     * Specifies the number of columns of this collection if the orientation is
     * `vertical` or number of rows if the orientation is `horizontal`. This
     * property is only used if the layout is set to `grid`.
     */
    numSegments?: number

    /**
     * Orientation of the component.
     *
     * @see {@link Orientation}
     */
    orientation?: Orientation

    /**
     * The selected indices. If `selectionMode` is `single`, only only the first
     * value will be used.
     *
     * @see {@link Selection}
     */
    selection?: Selection

    /**
     * The item selection behavior.
     *
     * @see {@link SelectionMode}
     */
    selectionMode?: SelectionMode

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
     * @param eventInfo Optional user-defined info of the dispatched custom
     *                  event.
     */
    onCustomEvent?: (index: number, eventName: string, eventInfo?: any) => void

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
    onSelectionChange?: (selection: Selection) => void

    /**
     * Custom component type for generating items in this collection. If this is
     * provided, the {@link _Item} provided as part of the children will
     * be ignored.
     */
    ItemComponent?: ComponentType<ItemProps<T>>
  }
}

/**
 * A collection of selectable items with generic data. Items are generated based
 * on the provided `ItemComponent`. This component supports different layouts in
 * both horizontal and vertical orientations.
 *
 * @exports Collection.Item Component for each item in the collection.
 */
export const Collection = /* #__PURE__ */ Object.assign(_Collection, {
  /**
   * Component for each item in a {@link Collection}.
   */
  Item: _Item,
})

if (process.env.NODE_ENV === 'development') {
  (_Collection as any).displayName = 'Collection'

  _Item.displayName = 'Collection.Item'
}
