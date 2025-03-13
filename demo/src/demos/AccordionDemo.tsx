import clsx from 'clsx'
import { Accordion, AccordionExpandIcon, AccordionHeader, FlatSVG, type AccordionItemProps, type AccordionSection, type AccordionSelection } from 'etudes'
import { useState } from 'react'
import $$ExpandIcon from '../assets/expand-icon.svg?raw'
import { Frame } from '../components/Frame.js'

const AccordionItem = ({ className, item, index, isSelected, onCustomEvent, ...props }: AccordionItemProps<string>) => (
  <button {...props} className={clsx(className, 'ia selected:bg-dark selected:text-light border-dark flex items-center justify-start border px-3 text-base')}>
    {item}
  </button>
)

type Section = AccordionSection<string>

export function AccordionDemo() {
  const [expandedSectionIndices, setExpandedSectionIndices] = useState<number[]>([])
  const [selection, setSelection] = useState<AccordionSelection>([])

  const sections: Section[] = [{
    items: ['1', '2', '3'],
    label: 'A',
    layout: 'grid',
    numSegments: 3,
    itemLength: 36,
    isSelectionTogglable: true,
  }, {
    items: ['1', '2', '3'],
    itemLength: 36,
    label: 'B',
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
          className={clsx({
            'self-start mx-auto w-44': orientation === 'vertical',
            'h-44': orientation === 'horizontal',
          })}
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
          <AccordionHeader
            className={clsx('ia border-dark flex h-9 items-center justify-between gap-3 border px-3 text-base', {
              'h-9': orientation === 'vertical',
            })}
          />
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
