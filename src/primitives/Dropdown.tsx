import clsx from 'clsx'
import { type ComponentType, forwardRef, type HTMLAttributes, type ReactElement, type Ref, useEffect, useRef, useState } from 'react'

import { useRect } from '../hooks/useRect.js'
import { asComponentDict } from '../utils/asComponentDict.js'
import { asStyleDict } from '../utils/asStyleDict.js'
import { Styled } from '../utils/Styled.js'
import { styles } from '../utils/styles.js'
import { Collection } from './Collection.js'

const _Dropdown = /* #__PURE__ */ forwardRef((
  {
    className,
    style,
    children,
    collectionPadding = 0,
    ItemComponent,
    itemLength: externalItemLength,
    itemPadding = 0,
    items = [],
    label,
    layout = 'list',
    maxVisibleItems = -1,
    numSegments = 1,
    orientation = 'vertical',
    selection: externalSelection = [],
    selectionMode = 'single',
    ToggleComponent,
    isCollapsed: externalIsCollapsed,
    isInverted = false,
    isSelectionTogglable = false,
    shouldCollapseOnSelect = true,
    onActivateAt,
    onCollapse,
    onDeselectAt,
    onExpand,
    onSelectAt,
    onSelectionChange,
    onToggleCustomEvent,
    ...props
  },
  ref,
) => {
  const bodyRef = useRef<HTMLDivElement>(null)
  const bodyRect = useRect(bodyRef)
  const numItems = items.length
  const numVisibleItems = _getNumVisibleItems(items, maxVisibleItems, numSegments, layout)
  const itemLength = externalItemLength ?? (orientation === 'vertical' ? bodyRect.height : bodyRect.width)
  const menuLength = itemLength * numVisibleItems + itemPadding * (numVisibleItems - 1)

  const selection = _sanitizeSelection(externalSelection, items)
  const [isCollapsed, setIsCollapsed] = useState(externalIsCollapsed ?? true)

  const fixedStyles = _getFixedStyles({ collectionPadding, maxVisibleItems, menuLength, numItems, orientation, isCollapsed, isInverted })

  const components = asComponentDict(children, {
    collapseIcon: _CollapseIcon,
    collection: _Collection,
    expandIcon: _ExpandIcon,
    item: _Item,
    toggle: _Toggle,
  })

  const expand = () => {
    if (!isCollapsed) return

    setIsCollapsed(false)
    onExpand?.()
  }

  const collapse = () => {
    if (isCollapsed) return

    setIsCollapsed(true)
    onCollapse?.()
  }

  const toggleClickHandler = () => {
    if (isCollapsed) {
      expand()
    } else {
      collapse()
    }
  }

  const selectAtHandler = (index: number) => {
    onSelectAt?.(index)

    if (selectionMode === 'single' && shouldCollapseOnSelect) {
      collapse()
    }
  }

  useEffect(() => {
    if (externalIsCollapsed === undefined) return

    setIsCollapsed(externalIsCollapsed)
  }, [externalIsCollapsed])

  useEffect(() => {
    const clickOutsideListener = (event: MouseEvent) => {
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

    window.addEventListener('click', clickOutsideListener)

    return () => {
      window.removeEventListener('click', clickOutsideListener)
    }
  }, [isCollapsed])

  return (
    <div
      {...props}
      className={clsx(className, { collapsed: isCollapsed, expanded: !isCollapsed })}
      ref={ref}
      style={styles(style, fixedStyles.root)}
    >
      <div ref={bodyRef} style={styles(fixedStyles.body)}>
        {ToggleComponent ? (
          <ToggleComponent
            className={clsx({ collapsed: isCollapsed, expanded: !isCollapsed })}
            style={styles(fixedStyles.toggle)}
            aria-expanded={!isCollapsed}
            aria-haspopup='listbox'
            onClick={toggleClickHandler}
            onCustomEvent={(name, info) => onToggleCustomEvent?.(name, info)}
          />
        ) : (
          <Styled
            className={clsx({ collapsed: isCollapsed, expanded: !isCollapsed })}
            style={styles(fixedStyles.toggle)}
            aria-expanded={!isCollapsed}
            aria-haspopup='listbox'
            element={components.toggle ?? <_Toggle/>}
            onClick={toggleClickHandler}
          >
            <span dangerouslySetInnerHTML={{ __html: label?.(selection) ?? (selection.length > 0 ? selection.map(t => items[t]).join(', ') : '') }}/>
            {components.expandIcon && (
              <Styled
                className={clsx({ collapsed: isCollapsed, expanded: !isCollapsed })}
                style={styles(isCollapsed ? fixedStyles.collapseIcon : fixedStyles.expandIcon)}
                element={isCollapsed ? (components.collapseIcon ?? components.expandIcon) : components.expandIcon}
              />
            )}
          </Styled>
        )}
        <Styled
          style={styles(fixedStyles.collection)}
          element={components.collection ?? <_Collection/>}
          ItemComponent={ItemComponent}
          itemLength={itemLength}
          itemPadding={itemPadding}
          items={items}
          layout={layout}
          numSegments={numSegments}
          orientation={orientation}
          selection={selection}
          selectionMode={selectionMode}
          isSelectionTogglable={isSelectionTogglable}
          onActivateAt={onActivateAt}
          onDeselectAt={onDeselectAt}
          onSelectAt={selectAtHandler}
          onSelectionChange={onSelectionChange}
        >
          {!ItemComponent && (components.item ?? <_Item/>)}
        </Styled>
      </div>
    </div>
  )
}) as <T>(props: Readonly<{ ref?: Ref<HTMLDivElement> } & Dropdown.Props<T>>) => ReactElement

const _Collection = Collection

const _Item = Collection.Item

const _Toggle = ({ children, ...props }: Dropdown.ToggleProps) => (
  <button {...props}>{children}</button>
)

const _CollapseIcon = ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <figure {...props} aria-hidden={true}>{children}</figure>
)

const _ExpandIcon = ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <figure {...props} aria-hidden={true}>{children}</figure>
)

export namespace Dropdown {
  /**
   * Type describing the orientation of {@link Dropdown}.
   */
  export type Orientation = Collection.Orientation

  /**
   * Type describing the current item selection of {@link Dropdown}, composed of
   * an array of indices of items that are selected. If the selection mode of
   * the {@link Dropdown} is `single`, only one index is expected in this array.
   */
  export type Selection = Collection.Selection

  /**
   * Type describing the props of `ToggleComponent` provided to
   * {@link Dropdown}.
   */
  export type ToggleProps = {
    /**
     * Handler invoked to dispatch a custom event.
     *
     * @param name User-defined name of the custom event.
     * @param info User-defined info of the custom event.
     */
    onCustomEvent?: (name: string, info?: any) => void
  } & HTMLAttributes<HTMLButtonElement>

  /**
   * Type describing the props of `ItemComponent` provided to {@link Dropdown}.
   */
  export type ItemProps<T> = Collection.ItemProps<T>

  /**
   * Type describing the props of {@link Dropdown}.
   */
  export type Props<T> = {
    /**
     * Specifies if the internal collection collapses when an item is selected.
     * This only works if `selectionMode` is `single`.
     */
    shouldCollapseOnSelect?: boolean

    /**
     * Padding (in pixels) between the toggle button and the internal
     * collection.
     */
    collectionPadding?: number

    /**
     * The label to appear on the toggle button.
     *
     * @param selection The current selection.
     */
    label?: (selection: Selection) => string

    /**
     * Specifies if the internal collection is collapsed.
     */
    isCollapsed?: boolean

    /**
     * Indicates if the component is inverted (i.e. "dropup" instead of dropdown).
     */
    isInverted?: boolean

    /**
     * Maximum number of items that are visible when the component expands. When
     * a value greater than or equal to 0 is specified, only that number of
     * items will be visible at a time and a scrollbar will appear to enable
     * scrolling to remaining items. Any value less than 0 indicates that all
     * items will be visible when the component expands.
     */
    maxVisibleItems?: number

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
     * @param eventInfo Optional user-defined info of the dispatched custom
     *                  event.
     */
    onToggleCustomEvent?: (eventName: string, eventInfo?: any) => void

    /**
     * React component type to be used for generating the toggle button inside
     * the component. When absent, one will be generated automatically.
     */
    ToggleComponent?: ComponentType<ToggleProps>
  } & Collection.Props<T> & HTMLAttributes<HTMLDivElement>
}

/**
 * A dropdown component that is invertible (i.e. can "dropup" instead) and
 * supports both horizontal and vertical orientations. Provide `items` and
 * `ItemComponent` props to populate.
 *
 * @exports Dropdown.Collection Component containing the items.
 * @exports Dropdown.Item Component for each item.
 * @exports Dropdown.Toggle Component for the toggle button.
 * @exports Dropdown.CollapseIcon Component for the collapse icon.
 * @exports Dropdown.ExpandIcon Component for the expand icon.
 */
export const Dropdown = /* #__PURE__ */ Object.assign(_Dropdown, {
  /**
   * Component containing the items in a {@link Dropdown}.
   */
  Collection: _Collection,

  /**
   * Component for the collapse icon of a {@link Dropdown}.
   */
  CollapseIcon: _CollapseIcon,

  /**
   * Component for the expand icon of a {@link Dropdown}.
   */
  ExpandIcon: _ExpandIcon,

  /**
   * Component for each item in a {@link Dropdown}.
   */
  Item: _Item,

  /**
   * Component for the toggle button of a {@link Dropdown}.
   */
  Toggle: _Toggle,
})

function _isIndexOutOfRange<T>(index: number, items: T[]) {
  if (isNaN(index)) return true
  if (index >= items.length) return true
  if (index < 0) return true

  return false
}

function _sanitizeSelection<T>(selection: Dropdown.Selection, items: T[]) {
  return _sortIndices(selection).filter(t => !_isIndexOutOfRange(t, items))
}

function _sortIndices(indices: number[]): number[] {
  return indices.sort((a, b) => a - b)
}

function _getNumVisibleItems<T>(items: T[], maxVisible: number, numSegments: number, layout: Collection.Layout) {
  const numItems = items.length

  switch (layout) {
    case 'grid': {
      const numRows = numSegments < 1 ? numItems : Math.ceil(numItems / numSegments)
      return maxVisible < 0 ? numRows : Math.min(numRows, maxVisible)
    }
    default:
      return maxVisible < 0 ? numItems : Math.min(numItems, maxVisible)
  }
}

function _getFixedStyles({ collectionPadding = 0, maxVisibleItems = 0, menuLength = NaN, numItems = 0, orientation = 'vertical', isCollapsed = true, isInverted = false }) {
  return asStyleDict({
    body: {
      height: '100%',
      position: 'relative',
      width: '100%',
    },
    collapseIcon: {
      pointerEvents: 'none',
      zIndex: 1,
    },
    collection: {
      position: 'absolute',
      ...orientation === 'vertical' ? {
        height: isCollapsed ? '0px' : `${menuLength}px`,
        overflowY: maxVisibleItems !== -1 && maxVisibleItems < numItems ? 'scroll' : 'hidden',
        width: '100%',
        ...isInverted ? {
          bottom: '100%',
          marginBottom: `${collectionPadding}px`,
        } : {
          marginTop: `${collectionPadding}px`,
          top: '100%',
        },
      } : {
        height: '100%',
        overflowX: maxVisibleItems !== -1 && maxVisibleItems < numItems ? 'scroll' : 'hidden',
        width: isCollapsed ? '0px' : `${menuLength}px`,
        ...isInverted ? {
          marginRight: `${collectionPadding}px`,
          right: '100%',
        } : {
          left: '100%',
          marginLeft: `${collectionPadding}px`,
        },
      },
    },
    expandIcon: {
      pointerEvents: 'none',
      zIndex: 1,
    },
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
    toggle: {
      height: '100%',
      left: '0',
      margin: '0',
      position: 'absolute',
      top: '0',
      width: '100%',
      zIndex: '1',
    },
  })
}

if (process.env.NODE_ENV === 'development') {
  (_Dropdown as any).displayName = 'Dropdown';

  (_Collection as any).displayName = 'Dropdown.Collection'
  _CollapseIcon.displayName = 'Dropdown.CollapseIcon'
  _ExpandIcon.displayName = 'Dropdown.ExpandIcon'
  _Item.displayName = 'Dropdown.Item'
  _Toggle.displayName = 'Dropdown.Toggle'
}
