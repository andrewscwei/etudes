import clsx from 'clsx'
import { Accordion } from 'etudes'
import { useState } from 'react'
import $$ExpandIcon from '../assets/expand-icon.svg?raw'
import { Frame } from '../components/Frame.js'

type Section = Accordion.SectionProps<string>

export function AccordionDemo() {
  const [expandedSectionIndices, setExpandedSectionIndices] = useState<number[]>([])
  const [selection, setSelection] = useState<Accordion.Selection>([])

  const sections: Section[] = [{
    items: ['1', '2', '3'],
    label: 'A',
    layout: 'grid',
    numSegments: 3,
    itemLength: 36,
    isSelectionTogglable: true,
  }, {
    itemLength: 36,
    items: ['1', '2', '3'],
    label: 'B',
    maxVisible: 2,
  }, {
    items: ['1', '2', '3'],
    itemLength: 36,
    label: 'C',
  }]

  return (
    <Frame
      alignment='start'
      options={[
        ['autoCollapseSections: true', 'autoCollapseSections: false'],
        ['orientation: vertical', 'orientation: horizontal'],
        ['selectionMode: single', 'selectionMode: multiple', 'selectionMode: none'],
      ]}
      title='Accordion'
      usesMaxHeight={true}
      onReset={() => {
        setExpandedSectionIndices([])
        setSelection([])
      }}
    >
      {({ autoCollapseSections, orientation, selectionMode }, toast) => (
        <Accordion
          key={orientation}
          autoCollapseSections={autoCollapseSections === 'true'}
          className={clsx({
            'self-start mx-auto w-44': orientation === 'vertical',
            'h-44': orientation === 'horizontal',
          })}
          expandedSectionIndices={expandedSectionIndices}
          orientation={orientation as any}
          sections={sections}
          selection={selection}
          selectionMode={selectionMode as any}
          onDeselectAt={(i, s) => toast(`<${Date.now()}>Deselected Item ${i + 1} at Section ${s + 1}`)}
          onExpandedSectionsChange={setExpandedSectionIndices}
          onSelectAt={(i, s) => toast(`<${Date.now()}>Selected Item ${i + 1} at Section ${s + 1}`)}
          onSelectionChange={setSelection}
        >
          <Accordion.Header
            className={clsx('ia border-dark flex h-9 items-center justify-between gap-3 border px-3 text-base', {
              'h-9': orientation === 'vertical',
            })}
          />
          <Accordion.ExpandIcon
            className={clsx('flex size-5 items-center justify-center transition-transform', {
              '-rotate-90 [.expanded]:rotate-90': orientation === 'horizontal',
              '[.expanded]:rotate-180': orientation === 'vertical',
            })}
            dangerouslySetInnerHTML={{ __html: $$ExpandIcon }}
          />
          <Accordion.Section
            className={clsx({
              'transition-[height]': orientation === 'vertical',
              'transition-[width]': orientation === 'horizontal',
            })}
          />
          <Accordion.Item className='ia flex items-center justify-start border border-dark px-3 text-base [.active]:bg-dark [.active]:text-light'/>
        </Accordion>
      )}
    </Frame>
  )
}
