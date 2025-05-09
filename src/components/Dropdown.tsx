import clsx from 'clsx'
import { forwardRef, useEffect, useRef, type ComponentType, type HTMLAttributes, type ReactElement, type Ref } from 'react'
import { useRect } from '../hooks/useRect.js'
import { asComponentDict } from '../utils/asComponentDict.js'
import { asStyleDict } from '../utils/asStyleDict.js'
import { cloneStyledElement } from '../utils/cloneStyledElement.js'
import { styles } from '../utils/styles.js'
import { Collection, type CollectionItemProps, type CollectionOrientation, type CollectionProps, type CollectionSelection } from './Collection.js'

/**
 * Base extendable type describing the data provided to each item in
 * {@link Dropdown}.
 */
export type DropdownItemData = {
  label?: string
}

/**
 * Type describing the orientation of {@link Dropdown}.
 */
export type DropdownOrientation = CollectionOrientation

/**
 * Type describing the current item selection of {@link Dropdown}, composed of
 * an array of indices of items that are selected. If the selection mode of the
 * {@link Dropdown} is `single`, only one index is expected in this array.
 */
export type DropdownSelection = CollectionSelection

/**
 * Type describing the props of `ToggleComponent` provided to {@link Dropdown}.
 */
export type DropdownToggleProps = HTMLAttributes<HTMLButtonElement> & {
  /**
   * Handler invoked to dispatch a custom event.
   *
   * @param name User-defined name of the custom event.
   * @param info User-defined info of the custom event.
   */
  onCustomEvent?: (name: string, info?: any) => void
}

/**
 * Type describing the props of `ItemComponent` provided to {@link Dropdown}.
 */
export type DropdownItemProps<T extends DropdownItemData = DropdownItemData> = CollectionItemProps<T>

/**
 * Type describing the props of {@link Dropdown}.
 */
export type DropdownProps<T extends DropdownItemData = DropdownItemData> = HTMLAttributes<HTMLDivElement> & CollectionProps<T> & {
  /**
   * Specifies if the internal collection collapses when an item is selected.
   * This only works if `selectionMode` is `single`.
   */
  collapsesOnSelect?: boolean

  /**
   * Padding (in pixels) between the toggle button and the internal collection.
   */
  collectionPadding?: number

  /**
   * The label to appear on the toggle button.
   *
   * @param selection The current selection.
   */
  label?: (selection: DropdownSelection) => string

  /**
   * Specifies if the internal collection is collapsed.
   */
  isCollapsed?: boolean

  /**
   * Indicates if the component is inverted (i.e. "dropup" instead of dropdown).
   */
  isInverted?: boolean

  /**
   * Maximum number of items that are visible when the component expands. When a
   * value greater than or equal to 0 is specified, only that number of items
   * will be visible at a time and a scrollbar will appear to enable scrolling
   * to remaining items. Any value less than 0 indicates that all items will be
   * visible when the component expands.
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
   * @param eventInfo Optional user-defined info of the dispatched custom event.
   */
  onToggleCustomEvent?: (eventName: string, eventInfo?: any) => void

  /**
   * React component type to be used for generating the toggle button inside the
   * component. When absent, one will be generated automatically.
   */
  ToggleComponent?: ComponentType<DropdownToggleProps>
}

/**
 * A dropdown component that is invertible (i.e. can "dropup" instead) and
 * supports both horizontal and vertical orientations. Provide `items` and
 * `ItemComponent` props to populate.
 *
 * @exports DropdownToggle Component for the toggle button.
 * @exports DropdownExpandIcon Component for the expand icon.
 * @exports DropdownCollapseIcon Component for the collapse icon.
 */
export const Dropdown = /* #__PURE__ */ forwardRef(({
  children,
  className,
  style,
  collapsesOnSelect = true,
  collectionPadding = 0,
  isCollapsed = true,
  isInverted = false,
  label,
  layout,
  isSelectionTogglable = false,
  itemLength: externalItemLength,
  itemPadding = 0,
  items,
  maxVisibleItems = -1,
  numSegments,
  orientation = 'vertical',
  selection: externalSelection = [],
  selectionMode = 'single',
  onActivateAt,
  onCollapse,
  onDeselectAt,
  onExpand,
  onSelectAt,
  onSelectionChange,
  onToggleCustomEvent,
  ItemComponent,
  ToggleComponent,
  ...props
}, ref) => {
  const isIndexOutOfRange = (index: number) => {
    if (isNaN(index)) return true
    if (index >= items.length) return true
    if (index < 0) return true

    return false
  }

  const sanitizedSelection = (selection: DropdownSelection) => sortIndices(selection).filter(t => !isIndexOutOfRange(t))

  const expand = () => {
    if (!isCollapsed) return

    onExpand?.()
  }

  const collapse = () => {
    if (isCollapsed) return

    onCollapse?.()
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

  const selectionChangeHandler = (value: DropdownSelection) => {
    onSelectionChange?.(value)
  }

  const selection = sanitizedSelection(externalSelection)
  const bodyRef = useRef<HTMLDivElement>(null)
  const bodyRect = useRect(bodyRef)
  const itemLength = externalItemLength ?? (orientation === 'vertical' ? bodyRect.height : bodyRect.width)
  const numItems = items.length
  const numVisibleItems = maxVisibleItems < 0 ? numItems : Math.min(numItems, maxVisibleItems)
  const menuLength = itemLength * numVisibleItems + itemPadding * (numVisibleItems - 1)

  const fixedStyles = getFixedStyles({ isCollapsed, collectionPadding, isInverted, maxVisibleItems, menuLength, numItems, orientation })

  const components = asComponentDict(children, {
    collapseIcon: DropdownCollapseIcon,
    expandIcon: DropdownExpandIcon,
    toggle: DropdownToggle,
  })

  useEffect(() => {
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

    window.addEventListener('click', clickOutsideHandler)

    return () => {
      window.removeEventListener('click', clickOutsideHandler)
    }
  }, [isCollapsed])

  return (
    <div
      {...props}
      ref={ref}
      className={clsx(className, { collapsed: isCollapsed, expanded: !isCollapsed })}
      style={styles(style, fixedStyles.root)}
    >
      <div ref={bodyRef} style={styles(fixedStyles.body)}>
        {ToggleComponent ? (
          <ToggleComponent
            aria-expanded={!isCollapsed}
            aria-haspopup='listbox'
            style={styles(fixedStyles.toggle)}
            onClick={() => toggle()}
            onCustomEvent={(name, info) => onToggleCustomEvent?.(name, info)}
          />
        ) : (
          cloneStyledElement(
            components.toggle ?? <DropdownToggle/>,
            {
              'aria-haspopup': 'listbox',
              'aria-expanded': !isCollapsed,
              'style': styles(fixedStyles.toggle),
              'onClick': () => toggle(),
            },
            <span dangerouslySetInnerHTML={{ __html: label?.(selection) ?? (selection.length > 0 ? selection.map(t => items[t].label).join(', ') : '') }}/>,
            isCollapsed ? components.collapseIcon ?? components.expandIcon : components.expandIcon,
          )
        )}
        <Collection
          isSelectionTogglable={isSelectionTogglable}
          ItemComponent={ItemComponent}
          itemLength={itemLength}
          itemPadding={itemPadding}
          items={items}
          layout={layout}
          numSegments={numSegments}
          orientation={orientation}
          selection={selection}
          selectionMode={selectionMode}
          style={styles(fixedStyles.collection)}
          onActivateAt={onActivateAt}
          onDeselectAt={onDeselectAt}
          onSelectAt={selectAtHandler}
          onSelectionChange={selectionChangeHandler}
        />
      </div>
    </div>
  )
}) as <T extends DropdownItemData = DropdownItemData>(props: Readonly<DropdownProps<T> & { ref?: Ref<HTMLDivElement> }>) => ReactElement

/**
 * Component for the toggle button of a {@link Dropdown}.
 */
export const DropdownToggle = ({ children, ...props }: HTMLAttributes<HTMLButtonElement> & DropdownToggleProps) => (
  <button {...props}>{children}</button>
)

/**
 * Component for the expand icon of a {@link Dropdown}.
 */
export const DropdownExpandIcon = ({ children, style, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <figure {...props} aria-hidden={true} style={styles(style, { pointerEvents: 'none' })}>{children}</figure>
)

/**
 * Component for the collapse icon of a {@link Dropdown}.
 */
export const DropdownCollapseIcon = ({ children, style, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <figure {...props} aria-hidden={true} style={styles(style, { pointerEvents: 'none' })}>{children}</figure>
)

function sortIndices(indices: number[]): number[] {
  return indices.sort((a, b) => a - b)
}

function getFixedStyles({ isCollapsed = true, isInverted = false, collectionPadding = 0, maxVisibleItems = 0, menuLength = NaN, numItems = 0, orientation = 'vertical' }) {
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
      height: '100%',
      left: '0',
      margin: '0',
      position: 'absolute',
      top: '0',
      width: '100%',
      zIndex: '1',
    },
    collection: {
      position: 'absolute',
      ...orientation === 'vertical' ? {
        width: '100%',
        height: isCollapsed ? '0px' : `${menuLength}px`,
        overflowY: maxVisibleItems !== -1 && maxVisibleItems < numItems ? 'scroll' : 'hidden',
        ...isInverted ? {
          marginBottom: `${collectionPadding}px`,
          bottom: '100%',
        } : {
          top: '100%',
          marginTop: `${collectionPadding}px`,
        },
      } : {
        width: isCollapsed ? '0px' : `${menuLength}px`,
        height: '100%',
        overflowX: maxVisibleItems !== -1 && maxVisibleItems < numItems ? 'scroll' : 'hidden',
        ...isInverted ? {
          marginRight: `${collectionPadding}px`,
          right: '100%',
        } : {
          left: '100%',
          marginLeft: `${collectionPadding}px`,
        },
      },
    },
  })
}

if (process.env.NODE_ENV !== 'production') {
  (Dropdown as any).displayName = 'Dropdown'
  DropdownToggle.displayName = 'DropdownToggle'
  DropdownExpandIcon.displayName = 'DropdownExpandIcon'
  DropdownCollapseIcon.displayName = 'DropdownCollapseIcon'
}
