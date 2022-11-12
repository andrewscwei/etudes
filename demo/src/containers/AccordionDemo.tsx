import { animations, container, selectors } from 'promptu'
import React, { useState } from 'react'
import styled from 'styled-components'
import Accordion, { AccordionHeader, AccordionItemProps } from '../../../lib/Accordion'
import DebugConsole from '../../../lib/DebugConsole'
import $$ExpandIcon from '../assets/svgs/expand-icon.svg'

const AccordionItem = ({ data, ...props }: AccordionItemProps<string>) => (
  <StyledAccordionItem {...props}>
    {data}
  </StyledAccordionItem>
)

export default function() {
  const [itemIndex, setItemIndex] = useState(-1)
  const [sectionIndex, setSectionIndex] = useState(-1)

  return (
    <>
      <StyledRoot>
        <StyledAccordion
          orientation='vertical'
          expandIconSvg={$$ExpandIcon}
          itemComponentType={AccordionItem}
          itemLength={50}
          data={[{
            label: 'Section 1',
            items: ['foo', 'bar', 'baz'],
          }, {
            label: 'Section 2',
            items: ['foo', 'bar', 'baz'],
          }, {
            label: 'Section 3',
            items: ['foo', 'bar', 'baz'],
          }]}
          onItemIndexChange={idx => setItemIndex(idx)}
          onSectionIndexChange={idx => setSectionIndex(idx)}
        >
          <AccordionHeader className='header'/>
        </StyledAccordion>
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
  ${container.fvcc}
  ${animations.transition(['transform', 'background', 'color'], 100)}
  background: #fff;
  border-style: solid;
  color: #000;
  cursor: pointer;
  font-size: 16px;
  padding: 20px;
  transform-origin: center;
  transform: translate3d(0, 0, 0) scale(1);
  z-index: 0;

  &.selected {
    background: #ff0054;
    color: #fff;
  }

  ${selectors.hwot} {
    background: #ff0054;
    color: #fff;
  }
`

const StyledAccordion = styled(Accordion<string>)`
  transform: translate3d(0, 0, 0) rotateX(10deg) rotateY(-20deg);
  width: 30rem;

  .header {
    ${container.fhcs}
    ${animations.transition('all', 100)}
    background: #fff;
    cursor: pointer;
    font-size: 16px;
    font-weight: 700;
    height: 50px;
    line-height: 16px;
    padding: 10px;
    text-transform: uppercase;

    ${selectors.hwot} {
      transform: scale(1.2);
      z-index: 1;
      background: #ff0054;
      color: #fff;

      svg * {
        fill: #fff;
      }
    }
  }
`

const StyledRoot = styled.div`
  ${container.fhcc}
  padding: 10rem 3rem;
  perspective: 80rem;
  width: 100%;
  height: 100%;
`
