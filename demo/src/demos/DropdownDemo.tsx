import clsx from 'clsx'
import { Dropdown } from 'etudes'
import { useState } from 'react'

import $$ExpandIcon from '../assets/expand-icon.svg?raw'
import { Frame } from '../components/Frame.js'

export function DropdownDemo() {
  const [selection, setSelection] = useState<Dropdown.Selection>([])
  const [isCollapsed, setIsCollapsed] = useState(true)
  const items = [1, 2]

  return (
    <Frame
      options={[
        ['shouldCollapseOnSelect: true', 'shouldCollapseOnSelect: false'],
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
      {({ shouldCollapseOnSelect, layout, maxVisibleItems, orientation, selectionMode, isInverted, isSelectionTogglable }, toast) => (
        <Dropdown
          className={clsx('relative text-base', {
            'h-24 w-32': orientation === 'horizontal',
            'h-9 w-44': orientation === 'vertical',
            'mb-24': orientation === 'vertical' && isInverted === 'false',
            'mt-24': orientation === 'vertical' && isInverted === 'true',
          })}
          shouldCollapseOnSelect={shouldCollapseOnSelect === 'true'}
          itemLength={36}
          items={items}
          label={t => {
            if (t.length > 0) return `${items[t[0]]}`

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
          isCollapsed={isCollapsed}
          isInverted={isInverted === 'true'}
          isSelectionTogglable={isSelectionTogglable === 'true'}
          onCollapse={() => setIsCollapsed(true)}
          onExpand={() => setIsCollapsed(false)}
          onSelectAt={t => toast(`Selected Item ${t + 1}`)}
          onSelectionChange={setSelection}
        >
          <Dropdown.Toggle className='ia flex items-center justify-between border border-dark px-3'/>
          <Dropdown.ExpandIcon
            className={clsx('flex size-5 items-center justify-center transition-transform', {
              '-rotate-90 [.expanded]:rotate-90': orientation === 'horizontal' && isInverted === 'false',
              '[.expanded]:rotate-180': orientation === 'vertical' && isInverted === 'false',
              'rotate-180 [.expanded]:rotate-0': orientation === 'vertical' && isInverted === 'true',
              'rotate-90 [.expanded]:-rotate-90': orientation === 'horizontal' && isInverted === 'true',
            })}
            dangerouslySetInnerHTML={{ __html: $$ExpandIcon }}
          />
          <Dropdown.Collection
            className={clsx({
              'transition-[height]': orientation === 'vertical',
              'transition-[width]': orientation === 'horizontal',
            })}
          />
          <Dropdown.Item className='ia flex items-center justify-start border border-dark px-3 [.active]:bg-dark [.active]:text-light'/>
        </Dropdown>
      )}
    </Frame>
  )
}
