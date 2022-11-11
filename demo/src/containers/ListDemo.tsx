import { animations, container, selectors } from 'promptu'
import React, { HTMLAttributes, useState } from 'react'
import styled, { css } from 'styled-components'
import DebugConsole from '../../../lib/DebugConsole'
import Dropdown, { ItemComponentProps as DropdownItemComponentProps } from '../../../lib/Dropdown'
import List, { ListItemProps } from '../../../lib/List'
import $$ExpandIcon from '../assets/svgs/expand-icon.svg'

export type State = {
  selectedItemIndex: number
  selectedOrientationIndex: number
}

const DropdownItemComponent = ({ data, isSelected, onClick, style }: DropdownItemComponentProps) => (
  <StyledDropdownItem
    isSelected={isSelected ?? false}
    style={style}
    onClick={() => onClick?.()}
  >
    {data.label}
  </StyledDropdownItem>
)

const ListItem = ({ data, ...props }: ListItemProps<string> & HTMLAttributes<HTMLButtonElement>) => (
  <StyledListItem {...props}>
    {data}
  </StyledListItem>
)

export default function() {
  const [selectedItemIndex, setSelectedItemIndex] = useState(-1)
  const [selectedOrientationIndex, setSelectedOrientationIndex] = useState(0)
  const orientation = selectedOrientationIndex === 0 ? 'vertical' : 'horizontal'

  return (
    <>
      <StyledRoot className={orientation}>
        <StyledList
          data={[...new Array(60)].map((v, i) => `${i + 1}`)}
          isTogglable={true}
          itemPadding={20}
          orientation={orientation}
          isSelectable={true}
          onDeselectAt={idx => setSelectedItemIndex(-1)}
          onSelectAt={idx => setSelectedItemIndex(idx)}
        >
          {({ ...props }) => <ListItem {...props}/>}
        </StyledList>
      </StyledRoot>
      <Dropdown
        borderThickness={2}
        itemPadding={10}
        data={[{ label: 'Vertical' }, { label: 'Horizontal' }]}
        defaultLabel='Select orientation'
        defaultSelectedItemIndex={selectedOrientationIndex}
        expandIconSvg={$$ExpandIcon}
        isInverted={false}
        itemComponentType={DropdownItemComponent}
        maxVisibleItems={-1}
        onIndexChange={idx => setSelectedOrientationIndex(idx)}
        orientation='vertical'
        buttonCSS={props => css`
          font-size: 2rem;
          font-weight: 700;
          text-transform: uppercase;
          transition: all .1s ease-out;

          svg * {
            transform: fill .1s ease-out;
            fill: #000;
          }

          ${selectors.hwot} {
            color: #fff;
            background: #ff0054;
            transform: translate3d(0, 0, 0) scale(1.2);

            svg * {
              transform: fill .1s ease-out;
              fill: #fff;
            }
          }
        `}
        style={{
          height: '6rem',
          left: '0',
          margin: '3rem',
          position: 'fixed',
          top: '0',
          transform: 'translate3d(0, 0, 0) rotateX(10deg) rotateY(20deg)',
          width: '30rem',
          zIndex: 10,
        }}
      />
      <DebugConsole
        title='?: List+Dropdown'
        message={selectedItemIndex > -1 ? `<strong>[${orientation.toUpperCase()}]</strong> You selected item <strong>#${selectedItemIndex + 1}</strong>!` : 'No item selected!'}
        style={{ transform: 'translate3d(0, 0, 0) rotateX(10deg) rotateY(30deg)' }}
      />
    </>
  )
}

const StyledDropdownItem = styled.button<{
  isSelected: boolean
}>`
  ${container.fvcl}
  ${animations.transition(['background', 'color'], 100)}
  background: ${props => props.isSelected ? '#ff0054' : '#fff'};
  border-style: solid;
  color: ${props => props.isSelected ? '#fff' : '#000'};
  flex: 0 0 auto;
  height: 100%;
  padding: 0 10px;
  text-align: left;
  width: 100%;

  ${selectors.hwot} {
    background: #ff0054;
    color: #fff;
  }
`

const StyledListItem = styled.button`
  ${container.fvcc}
  ${animations.transition('transform', 100)}
  background: #fff;
  color: #000;
  font-size: 3rem;
  font-weight: 700;
  padding: 20px;
  transform-origin: center;
  transform: translate3d(0, 0, 0) scale(1);
  z-index: 0;

  ${selectors.hwot} {
    transform: translate3d(0, 0, 0) scale(1.1);
    z-index: 1;
  }

  &.horizontal {
    height: 100%;
  }

  &.vertical {
    width: 100%;
  }

  &.selected {
    background: #ff0054;
    color: #fff;
  }
`

const StyledList = styled(List<string>)`
  &.horizontal {
    height: 80%;
    min-height: 400px;
    transform: translate3d(0, 0, 0) rotate3d(1, .1, 0, 10deg);
  }

  &.vertical {
    width: 80%;
    min-width: 400px;
    transform: translate3d(0, 0, 0) rotate3d(1, 1, 0, 10deg);
  }
`

const StyledRoot = styled.div`
  padding: 10rem 3rem;
  perspective: 80rem;
  width: 100%;
  height: 100%;

  &.horizontal {
    ${container.fhcl}
    overflow-y: hidden;
  }

  &.vertical {
    ${container.fvtc}
    overflow-x: hidden;
  }
`
