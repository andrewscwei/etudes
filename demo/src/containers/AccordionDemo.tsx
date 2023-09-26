import React, { useState } from 'react'
import styled from 'styled-components'
import Accordion, { type AccordionItemProps, type AccordionSection } from '../../../lib/Accordion'
import DebugConsole from '../../../lib/DebugConsole'
import $$ExpandIcon from '../assets/svgs/expand-icon.svg'

const AccordionItem = ({ item, index, isSelected, onCustomEvent, ...props }: AccordionItemProps<string>) => (
  <StyledAccordionItem {...props}>
    {item}
  </StyledAccordionItem>
)

type Section = AccordionSection<string>

export default function AccordionDemo() {
  const [itemIndex, setItemIndex] = useState(-1)
  const [sectionIndex, setSectionIndex] = useState(-1)

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
    <>
      <StyledRoot>
        <StyledAccordion
          autoCollapseSections={false}
          expandIconSvg={$$ExpandIcon}
          orientation='vertical'
          sections={sections}
          selectionMode='single'
          useDefaultStyles={true}
          onSelectAt={(itemIdx, sectionIdx) => {
            setSectionIndex(sectionIdx)
            setItemIndex(itemIdx)
          }}
          ItemComponent={AccordionItem}
        />
      </StyledRoot>
      <DebugConsole
        title='?: Accordion'
        message={sectionIndex > -1 ? itemIndex > -1 ? `You selected item <strong>#${itemIndex + 1}</strong> in section <strong>#${sectionIndex + 1}</strong>!` : `No item seletected in section <strong>#${sectionIndex + 1}</strong>!` : 'No section selected!'}
        style={{ transform: 'translate3d(0, 0, 0) rotateX(10deg) rotateY(30deg)' }}
      />
    </>
  )
}

const StyledAccordionItem = styled.button`
  align-items: flex-start;
  background: #fff;
  border-style: solid;
  box-sizing: border-box;
  color: #000;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  font-size: 16px;
  justify-content: center;
  padding: 10px;
  text-align: left;
  text-transform: uppercase;
  transform-origin: center;
  transform: translate3d(0, 0, 0) scale(1);
  transition: all 100ms ease-out;
  z-index: 0;

  &.selected {
    background: #ff0054;
    color: #fff;
  }

  &:hover {
    background: #ff0054;
    color: #fff;
  }
`

const StyledAccordion = styled(Accordion<string, Section>)`
  transform: translate3d(0, 0, 0) rotateX(10deg) rotateY(-20deg);

  &.vertical {
    width: 300px;
  }

  &.horizontal {
    height: 300px;
  }

  button {
    align-items: center;
    background: #fff;
    box-sizing: border-box;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    font-size: 16px;
    font-weight: 700;
    justify-content: space-between;
    line-height: 16px;
    padding: 10px;
    text-transform: uppercase;
    transition: all 100ms ease-out;

    &:hover {
      background: #ff0054 !important;
      color: #fff;

      svg * {
        fill: #fff;
      }
    }
  }
`

const StyledRoot = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  height: 100%;
  justify-content: center;
  padding: 100px 30px;
  perspective: 800px;
  width: 100%;
`
