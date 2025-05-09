import clsx from 'clsx'
import { Dropdown, DropdownExpandIcon, DropdownToggle, FlatSVG, type DropdownItemProps, type DropdownSelection } from 'etudes'
import { useState } from 'react'
import $$ExpandIcon from '../assets/expand-icon.svg?raw'
import { Frame } from '../components/Frame.js'

const DropdownItem = ({ className, index, isSelected, item, orientation, onCustomEvent, ...props }: DropdownItemProps) => (
  <button {...props} className={clsx(className, 'ia selected:bg-dark selected:text-light border-dark flex items-center justify-start border px-3')}>
    {item.label}
  </button>
)

export function DropdownDemo() {
  const [selection, setSelection] = useState<DropdownSelection>([])
  const [isCollapsed, setIsCollapsed] = useState(true)
  const items = [{ label: '1' }, { label: '2' }]

  return (
    <Frame
      options={[
        ['collapsesOnSelect: true', 'collapsesOnSelect: false'],
        ['isInverted: false', 'isInverted: true'],
        ['isSelectionTogglable: false', 'isSelectionTogglable: true'],
        ['layout: list', 'layout: grid'],
        ['maxVisibleItems: -1', 'maxVisibleItems: 1'],
        ['orientation: vertical', 'orientation: horizontal'],
        ['selectionMode: single', 'selectionMode: multiple', 'selectionMode: none'],
      ]}
      title='Dropdown'
      onReset={() => {
        setSelection([])
        setIsCollapsed(true)
      }}
    >
      {({ collapsesOnSelect, isInverted, isSelectionTogglable, layout, maxVisibleItems, orientation, selectionMode }, toast) => (
        <Dropdown
          className={clsx('relative text-base', {
            'mb-24': orientation === 'vertical' && isInverted === 'false',
            'mt-24': orientation === 'vertical' && isInverted === 'true',
            'h-24 w-32 [&_[role=grid]]:transition-[width] [&_[role=listbox]]:transition-[width]': orientation === 'horizontal',
            'h-9 w-44 [&_[role=grid]]:transition-[height] [&_[role=listbox]]:transition-[height]': orientation === 'vertical',
          })}
          collapsesOnSelect={collapsesOnSelect === 'true'}
          isCollapsed={isCollapsed}
          isInverted={isInverted === 'true'}
          isSelectionTogglable={isSelectionTogglable === 'true'}
          ItemComponent={DropdownItem}
          itemLength={36}
          items={items}
          label={t => {
            if (t.length > 0) return items[t[0]].label

            switch (orientation) {
              case 'horizontal':
                return isInverted === 'true' ? 'Dropleft' : 'Dropright'
              default:
                return isInverted === 'true' ? 'Dropup' : 'Dropdown'
            }
          }}
          layout={layout as any}
          maxVisibleItems={Number(maxVisibleItems)}
          numSegments={2}
          orientation={orientation as any}
          selection={selection}
          selectionMode={selectionMode as any}
          onCollapse={() => setIsCollapsed(true)}
          onExpand={() => setIsCollapsed(false)}
          onSelectAt={t => toast(`Selected Item ${t + 1}`)}
          onSelectionChange={setSelection}
        >
          <DropdownToggle className='ia border-dark flex items-center justify-between border px-3'/>
          <DropdownExpandIcon className='size-3'>
            <FlatSVG
              className={clsx({
                'rotate-90': orientation === 'horizontal' && isInverted === 'true',
                '-rotate-90': orientation === 'horizontal' && isInverted === 'false',
                'rotate-180': orientation === 'vertical' && isInverted === 'true',
              })}
              svg={$$ExpandIcon}
            />
          </DropdownExpandIcon>
        </Dropdown>
      )}
    </Frame>
  )
}
