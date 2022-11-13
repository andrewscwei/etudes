import React, { useState } from 'react'
import styled from 'styled-components'
import DebugConsole from '../../../lib/DebugConsole'
import Dropdown, { DropdownItemProps, DropdownToggle } from '../../../lib/Dropdown'
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

export default function ListDemo() {
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
        data={[{ label: 'Vertical' }, { label: 'Horizontal' }]}
        defaultLabel='Select orientation'
        expandIconSvg={$$ExpandIcon}
        isInverted={false}
        itemComponentType={DropdownItem}
        maxVisibleItems={-1}
        orientation='vertical'
        selectedIndex={selectedOrientationIndex}
        onIndexChange={idx => setSelectedOrientationIndex(idx)}
      >
        <DropdownToggle className='toggle'/>
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
  align-items: flex-start;
  background: #fff;
  border: none;
  box-sizing: border-box;
  color: #000;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  flex: 0 0 auto;
  font-size: 16px;
  font-weight: 700;
  height: 100%;
  justify-content: center;
  padding: 0 10px;
  text-align: left;
  text-transform: uppercase;
  transition: all 100ms ease-out;
  width: 100%;

  &.selected {
    background: #ff0054;
    color: #fff;
  }

  &:hover {
    background: #ff0054;
    color: #fff;
  }
`

const StyledDropdown = styled(Dropdown)`
  height: 60px;
  left: 0;
  margin: 30px;
  position: fixed;
  top: 0;
  transform: translate3d(0, 0, 0) rotateX(10deg) rotateY(20deg);
  width: 300px;
  z-index: 10;

  .toggle {
    align-items: center;
    background: #fff;
    border: none;
    box-sizing: border-box;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    font-size: 16px;
    font-weight: 700;
    justify-content: space-between;
    padding: 10px;
    text-transform: uppercase;
    transition: all 100ms ease-out;

    svg * {
      transform: fill 100ms ease-out;
      fill: #000;
    }

    &:hover {
      color: #fff;
      background: #ff0054;

      svg * {
        transform: fill 100ms ease-out;
        fill: #fff;
      }
    }
  }
`

const StyledListItem = styled.button`
  align-items: center;
  background: #fff;
  box-sizing: border-box;
  color: #000;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  font-size: 30px;
  font-weight: 700;
  justify-content: center;
  padding: 20px;
  transform-origin: center;
  transform: translate3d(0, 0, 0) scale(1);
  transition: all 100ms ease-out;
  z-index: 0;

  &:hover {
    background: #ff0054;
    color: #fff;
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
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex-wrap: nowrap;
  height: 100%;
  justify-content: flex-start;
  padding: 100px 30px;
  perspective: 800px;
  width: 100%;

  &.horizontal {
    flex-direction: row;
    overflow-y: hidden;
  }

  &.vertical {
    flex-direction: column;
    overflow-x: hidden;
  }
`
