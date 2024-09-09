import { Accordion, type AccordionItemProps, type AccordionSection, type AccordionSelection } from 'etudes/components/Accordion'
import { useState, type HTMLAttributes } from 'react'
import $$ExpandIcon from '../assets/svgs/expand-icon.svg?raw'
import { Frame } from '../components/Frame.js'

type Props = HTMLAttributes<HTMLDivElement>

const AccordionItem = ({ item, index, isSelected, onCustomEvent, ...props }: AccordionItemProps<string>) => (
  <button {...props}>
    {item}
  </button>
)

type Section = AccordionSection<string>

export function AccordionDemo({ ...props }: Props) {
  const [expandedSectionIndices, setExpandedSectionIndices] = useState<number[]>([])
  const [selection, setSelection] = useState<AccordionSelection>([])

  const sections: Section[] = [{
    items: ['foo', 'bar', 'baz'],
    label: 'Section 1',
    layout: 'grid',
    numSegments: 3,
    isSelectionTogglable: true,
  }, {
    items: ['foo', 'bar', 'baz'],
    label: 'Section 2',
  }, {
    items: ['foo', 'bar', 'baz'],
    label: 'Section 3',
  }]

  return (
    <Frame {...props} title='Accordion'>
      <Accordion
        autoCollapseSections={false}
        expandedSectionIndices={expandedSectionIndices}
        expandIconSvg={$$ExpandIcon}
        ItemComponent={AccordionItem}
        orientation='vertical'
        sections={sections}
        selection={selection}
        selectionMode='single'
        onExpandedSectionsChange={setExpandedSectionIndices}
        onSelectionChange={setSelection}
      />
    </Frame>
  )
}
