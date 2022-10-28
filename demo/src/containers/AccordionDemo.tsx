import $$ExpandIcon from '!!raw-loader!../assets/images/expand-icon.svg'
import { animations, container, selectors } from 'promptu'
import React, { useState } from 'react'
import styled, { css } from 'styled-components'
import Accordion, { ItemComponentProps } from '../../../lib/Accordion'
import DebugConsole from '../../../lib/DebugConsole'
import { Orientation } from '../../../lib/types'

export type State = {
  itemIndex: number
  sectionIndex: number
}

const ItemComponent = ({ data, orientation, isSelected, onClick, style }: ItemComponentProps<string>) => (
  <StyledItem
    isSelected={isSelected ?? false}
    orientation={orientation}
    style={style}
    onClick={() => onClick?.()}
  >
    {data}
  </StyledItem>
)

export default function() {
  const [itemIndex, setItemIndex] = useState(-1)
  const [sectionIndex, setSectionIndex] = useState(-1)

  return (
    <>
      <StyledRoot>
        <Accordion
          orientation='vertical'
          expandIconSvg={$$ExpandIcon}
          itemComponentType={ItemComponent as any}
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
          sectionHeaderCSS={props => css`
            label {
              text-transform: uppercase;
              font-weight: 700;
            }

            ${selectors.hwot} {
              transform: scale(1.2);
              z-index: 1;
              background: #ff0054;

              label {
                color: #fff;
              }

              svg * {
                fill: #fff;
              }
            }
          `}
          onSectionIndexChange={idx => setSectionIndex(idx)}
          onItemIndexChange={idx => setItemIndex(idx)}
          style={{
            transform: 'translate3d(0, 0, 0) rotateX(10deg) rotateY(-20deg)',
            width: '30rem',
          }}
        />
      </StyledRoot>
      <DebugConsole
        title='?: Accordion'
        message={sectionIndex > -1 ? itemIndex > -1 ? `You selected item <strong>#${itemIndex + 1}</strong> in section <strong>#${sectionIndex + 1}</strong>!` : `No item seletected in section <strong>#${sectionIndex + 1}</strong>!` : 'No section selected!'}
        // style={{
        //   transform: 'translate3d(0, 0, 0) rotateX(10deg) rotateY(30deg)',
        // }}
      />
    </>
  )
}

const StyledItem = styled.button<{
  isSelected: boolean
  orientation: Orientation
}>`
  ${container.fvcc}
  ${animations.transition(['transform', 'background', 'color'], 100)}
  background: ${props => props.isSelected ? '#ff0054' : '#fff'};
  color: ${props => props.isSelected ? '#fff' : '#000'};
  font-size: 1.6rem;
  border-style: solid;
  padding: 20px;
  transform-origin: center;
  transform: translate3d(0, 0, 0) scale(1);
  z-index: 0;

  ${props => props.orientation === 'vertical' ? css`
    width: 100%;
  ` : css`
    height: 100%;
  `}

  ${selectors.hwot} {
    background: #ff0054;
    color: #fff;
  }
`

const StyledRoot = styled.div`
  ${container.fhcc}
  padding: 10rem 3rem;
  perspective: 80rem;
  width: 100%;
  height: 100%;
`
