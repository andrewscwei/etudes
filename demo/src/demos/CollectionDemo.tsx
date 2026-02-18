import clsx from 'clsx'
import { Collection } from 'etudes'
import { useState } from 'react'

import { Frame } from '../components/Frame.js'

export function CollectionDemo() {
  const items = [...new Array(100)].map((_, i) => `${i + 1}`)
  const [collectionSelection, setCollectionSelection] = useState<Collection.Selection>([])

  return (
    <Frame
      alignment='start'
      options={[
        ['isSelectionTogglable: false', 'isSelectionTogglable: true'],
        ['layout: list', 'layout: grid'],
        ['orientation: vertical', 'orientation: horizontal'],
        ['selectionMode: none', 'selectionMode: single', 'selectionMode: multiple'],
      ]}
      title='Collection'
      usesMaxHeight={true}
      onReset={() => setCollectionSelection([])}
    >
      {({ layout, orientation, selectionMode, isSelectionTogglable }, toast) => (
        <Collection
          className={clsx('self-start', {
            'h-full': orientation === 'horizontal',
            'w-full': orientation === 'vertical',
          })}
          itemLength={orientation === 'vertical' ? 40 : 64}
          itemPadding={12}
          items={items}
          layout={layout as Collection.Layout}
          numSegments={3}
          orientation={orientation as Collection.Orientation}
          selection={collectionSelection}
          selectionMode={selectionMode as Collection.SelectionMode}
          isSelectionTogglable={isSelectionTogglable === 'true'}
          onActivateAt={index => { if (selectionMode === 'none') toast(`<${Date.now()}>Activated Item ${index + 1}`) }}
          onDeselectAt={index => toast(`<${Date.now()}>Deselected Item ${index + 1}`)}
          onSelectAt={index => toast(`<${Date.now()}>Selected Item ${index + 1}`)}
          onSelectionChange={(setCollectionSelection)}
        >
          <Collection.Item className='ia flex items-center justify-center border border-dark text-base [.active]:bg-dark [.active]:text-light'/>
        </Collection>
      )}
    </Frame>
  )
}
