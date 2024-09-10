import clsx from 'clsx'
import { Accordion, AccordionExpandIcon, AccordionHeader, type AccordionItemProps, type AccordionSection, type AccordionSelection } from 'etudes/components/Accordion'
import { FlatSVG } from 'etudes/components/FlatSVG.js'
import { useState } from 'react'
import $$ExpandIcon from '../assets/svgs/expand-icon.svg?raw'
import { Frame } from '../components/Frame.js'

const AccordionItem = ({ className, item, index, isSelected, onCustomEvent, ...props }: AccordionItemProps<string>) => (
  <button {...props} className={clsx(className, 'ia selected:bg-black selected:text-white flex items-center justify-start border border-black px-3 text-base')}>
    {item}
  </button>
)

type Section = AccordionSection<string>

export function AccordionDemo() {
  const [expandedSectionIndices, setExpandedSectionIndices] = useState<number[]>([])
  const [selection, setSelection] = useState<AccordionSelection>([])

  const sections: Section[] = [{
    items: ['1', '2', '3'],
    label: 'Section 1',
    layout: 'grid',
    numSegments: 3,
    itemLength: 36,
    isSelectionTogglable: true,
  }, {
    items: ['1', '2', '3'],
    itemLength: 36,
    label: 'Section 2',
  }, {
    items: ['1', '2', '3'],
    itemLength: 36,
    label: 'Section 3',
  }]

  return (
    <Frame
      options={[
        ['autoCollapseSections: true', 'autoCollapseSections: false'],
        ['isInverted: false', 'isInverted: true'],
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
      {({ autoCollapseSections, isInverted, orientation, selectionMode }, toast) => (
        <Accordion
          autoCollapseSections={autoCollapseSections === 'true'}
          className='w-44'
          expandedSectionIndices={expandedSectionIndices}
          ItemComponent={AccordionItem}
          orientation={orientation as any}
          sections={sections}
          selection={selection}
          selectionMode={selectionMode as any}
          onDeselectAt={(i, s) => toast(`<${Date.now()}>Deselected Item ${i + 1} at Section ${s + 1}`)}
          onExpandedSectionsChange={setExpandedSectionIndices}
          onSelectAt={(i, s) => toast(`<${Date.now()}>Selected Item ${i + 1} at Section ${s + 1}`)}
          onSelectionChange={setSelection}
        >
          <AccordionHeader className='ia flex h-9 items-center justify-between border border-black px-3 text-base'/>
          <AccordionExpandIcon className='size-3'>
            <FlatSVG
              className={clsx({
                'rotate-90': orientation === 'horizontal' && isInverted === 'true',
                '-rotate-90': orientation === 'horizontal' && isInverted === 'false',
                'rotate-180': orientation === 'vertical' && isInverted === 'true',
              })}
              svg={$$ExpandIcon}
            />
          </AccordionExpandIcon>
        </Accordion>
      )}
    </Frame>
  )
}
