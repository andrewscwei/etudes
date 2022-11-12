import { animations, container, selectors } from 'promptu'
import React, { useState } from 'react'
import styled from 'styled-components'
import DebugConsole from '../../../lib/DebugConsole'
import Dropdown, { DropdownItemProps } from '../../../lib/Dropdown'
import List, { ListItemProps } from '../../../lib/List'
import $$ExpandIcon from '../assets/svgs/expand-icon.svg'

const DropdownItem = ({ data, ...props }: DropdownItemProps) => (
  <StyledDropdownItem {...props}>
    {data.label}
  </StyledDropdownItem>
)

const ListItem = ({ data, ...props }: ListItemProps<string>) => (
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
          isSelectable={true}
          isTogglable={true}
          itemComponentType={ListItem}
          itemPadding={20}
          orientation={orientation}
          onDeselectAt={idx => setSelectedItemIndex(-1)}
          onSelectAt={idx => setSelectedItemIndex(idx)}
        />
      </StyledRoot>
      <StyledDropdown
        borderThickness={2}
        data={[{ label: 'Vertical' }, { label: 'Horizontal' }]}
        defaultLabel='Select orientation'
        expandIconSvg={$$ExpandIcon}
        isInverted={false}
        itemComponentType={DropdownItem}
        itemPadding={10}
        maxVisibleItems={-1}
        orientation='vertical'
        selectedIndex={selectedOrientationIndex}
        onIndexChange={idx => setSelectedOrientationIndex(idx)}
      >
        {/* <DropdownToggle className='toggle'/> */}
      </StyledDropdown>
      <DebugConsole
        title='?: List+Dropdown'
        message={selectedItemIndex > -1 ? `<strong>[${orientation.toUpperCase()}]</strong> You selected item <strong>#${selectedItemIndex + 1}</strong>!` : 'No item selected!'}
        style={{ transform: 'translate3d(0, 0, 0) rotateX(10deg) rotateY(30deg)' }}
      />
    </>
  )
}

const StyledDropdownItem = styled.button`
  ${container.fvcl}
  ${animations.transition(['background', 'color'], 100)}
  background: #fff;
  border-style: solid;
  color: #000;
  flex: 0 0 auto;
  height: 100%;
  padding: 0 10px;
  text-align: left;
  width: 100%;

  &.selected {
    background: #ff0054;
    color: #fff;
  }

  ${selectors.hwot} {
    background: #ff0054;
    color: #fff;
  }
`

const StyledDropdown = styled(Dropdown)`
  height: 6rem;
  left: 0;
  margin: 3rem;
  position: fixed;
  top: 0;
  transform: translate3d(0, 0, 0) rotateX(10deg) rotateY(20deg);
  width: 30rem;
  z-index: 10;

  .toggle {
    ${container.fhcc}
    background: #fff;
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
