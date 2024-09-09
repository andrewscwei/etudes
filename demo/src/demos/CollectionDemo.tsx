import clsx from 'clsx'
import { Collection, type CollectionItemProps, type CollectionLayout, type CollectionSelection, type CollectionSelectionMode } from 'etudes/components/Collection'
import { useState } from 'react'
import { Frame } from '../components/Frame.js'

const CollectionItem = ({ className, index, isSelected, item, onCustomEvent, ...props }: CollectionItemProps<string>) => (
  <button {...props} className={clsx(className, 'ia selected:bg-black selected:text-white border border-black/40 text-sm')}>
    {item}
  </button>
)

export function CollectionDemo() {
  const items = [...new Array(100)].map((v, i) => `${i + 1}`)
  const [collectionSelection, setCollectionSelection] = useState<CollectionSelection>([])

  return (
    <Frame
      alignment='start'
      options={[
        ['isSelectionTogglable=false', 'isSelectionTogglable=true'],
        ['layout=list', 'layout=grid'],
        ['orientation=vertical', 'orientation=horizontal'],
        ['selectionMode=none', 'selectionMode=single', 'selectionMode=multiple'],
      ]}
      title='Collection'
      useMaxHeight={true}
      onReset={() => setCollectionSelection([])}
    >
      {([isSelectionTogglable, layout, orientation, selectionMode], setFeedback) => {
        return (
          <Collection
            className={clsx('self-start', {
              'w-full': orientation === 'orientation=vertical',
              'h-full': orientation === 'orientation=horizontal',
            })}
            isSelectionTogglable={isSelectionTogglable === 'isSelectionTogglable=true'}
            ItemComponent={CollectionItem}
            itemLength={orientation === 'orientation=vertical' ? 40 : 64}
            itemPadding={12}
            items={items}
            layout={layout.match(/layout=(.*)/)?.[1] as CollectionLayout}
            numSegments={3}
            orientation={orientation === 'orientation=vertical' ? 'vertical' : 'horizontal'}
            selection={collectionSelection}
            selectionMode={selectionMode.match(/selectionMode=(.*)/)?.[1] as CollectionSelectionMode}
            onActivateAt={index => { if (selectionMode === 'selectionMode=none') setFeedback(`<${Date.now()}>Activated Item ${index + 1}`) }}
            onDeselectAt={index => setFeedback(`<${Date.now()}>Deselected Item ${index + 1}`)}
            onSelectAt={index => setFeedback(`<${Date.now()}>Selected Item ${index + 1}`)}
            onSelectionChange={(setCollectionSelection)}
          />
        )
      }}
    </Frame>
  )
}
