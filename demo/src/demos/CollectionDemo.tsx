import clsx from 'clsx'
import { Collection, CollectionItem, type CollectionLayout, type CollectionOrientation, type CollectionSelection, type CollectionSelectionMode } from 'etudes'
import { useState } from 'react'
import { Frame } from '../components/Frame.js'

export function CollectionDemo() {
  const items = [...new Array(100)].map((_, i) => `${i + 1}`)
  const [collectionSelection, setCollectionSelection] = useState<CollectionSelection>([])

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
      {({ isSelectionTogglable, layout, orientation, selectionMode }, toast) => (
        <Collection
          className={clsx('self-start', {
            'w-full': orientation === 'vertical',
            'h-full': orientation === 'horizontal',
          })}
          isSelectionTogglable={isSelectionTogglable === 'true'}
          itemLength={orientation === 'vertical' ? 40 : 64}
          itemPadding={12}
          items={items}
          layout={layout as CollectionLayout}
          numSegments={3}
          orientation={orientation as CollectionOrientation}
          selection={collectionSelection}
          selectionMode={selectionMode as CollectionSelectionMode}
          onActivateAt={index => { if (selectionMode === 'none') toast(`<${Date.now()}>Activated Item ${index + 1}`) }}
          onDeselectAt={index => toast(`<${Date.now()}>Deselected Item ${index + 1}`)}
          onSelectAt={index => toast(`<${Date.now()}>Selected Item ${index + 1}`)}
          onSelectionChange={(setCollectionSelection)}
        >
          <CollectionItem className='ia flex items-center justify-center border border-dark text-base [.selected]:bg-dark [.selected]:text-light'/>
        </Collection>
      )}
    </Frame>
  )
}
