import React, { useState } from 'react'
import styled from 'styled-components'
import { Collection, type CollectionItemProps, type CollectionSelection } from '../../../lib/components/Collection'
import { DebugConsole } from '../../../lib/components/DebugConsole'
import { Dropdown, type DropdownItemProps, type DropdownSelection } from '../../../lib/components/Dropdown'
import $$ExpandIcon from '../assets/svgs/expand-icon.svg'

const DropdownItem = ({ index, isSelected, item, onCustomEvent, ...props }: DropdownItemProps) => (
  <StyledDropdownItem {...props}>
    {item.label}
  </StyledDropdownItem>
)

const CollectionItem = ({ index, isSelected, item, onCustomEvent, ...props }: CollectionItemProps<string>) => (
  <StyledCollectionItem {...props}>
    {item}
  </StyledCollectionItem>
)

const DROPDOWN_ITEMS = [{ label: 'Vertical' }, { label: 'Horizontal' }]
const LIST_ITEMS = [...new Array(60)].map((v, i) => `${i + 1}`)

export function CollectionDemo() {
  const [dropdownSelection, setDropdownSelection] = useState<DropdownSelection>([0])
  const [isDropdownCollapsed, setIsDropdownCollapsed] = useState(true)
  const [collectionSelection, setCollectionSelection] = useState<CollectionSelection>([])
  const orientation = dropdownSelection[0] === 0 ? 'vertical' : 'horizontal'

  return (
    <>
      <StyledRoot className={orientation}>
        <Collection
          isSelectionTogglable={true}
          ItemComponent={CollectionItem}
          itemLength={50}
          itemPadding={10}
          items={LIST_ITEMS}
          layout='grid'
          numSegments={3}
          orientation={orientation}
          selection={collectionSelection}
          selectionMode='single'
          style={orientation === 'horizontal' ? {
            height: '80%',
            minHeight: '400px',
            transform: 'translate3d(0, 0, 0) rotate3d(1, .1, 0, 10deg)',
          } : {
            width: '80%',
            minWidth: '400px',
            transform: 'translate3d(0, 0, 0) rotate3d(1, 1, 0, 10deg)',
          }}
          onSelectionChange={setCollectionSelection}
        />
      </StyledRoot>
      <StyledDropdown
        expandIconSvg={$$ExpandIcon}
        isCollapsed={isDropdownCollapsed}
        isInverted={false}
        ItemComponent={DropdownItem}
        itemLength={50}
        items={DROPDOWN_ITEMS}
        maxVisibleItems={-1}
        orientation='vertical'
        selection={dropdownSelection}
        usesDefaultStyles={true}
        onCollapse={() => setIsDropdownCollapsed(true)}
        onExpand={() => setIsDropdownCollapsed(false)}
        onSelectionChange={setDropdownSelection}
      />
      <DebugConsole
        message={collectionSelection[0] > -1 ? `<strong>[${orientation.toUpperCase()}]</strong> You selected item <strong>#${collectionSelection[0] + 1}</strong>!` : 'No item selected!'}
        style={{ transform: 'translate3d(0, 0, 0) rotateX(10deg) rotateY(30deg)' }}
        title='?: Collection+Dropdown'
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

  button {
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
      color: #fff !important;
      background: #ff0054 !important;

      svg * {
        transform: fill 100ms ease-out;
        fill: #fff;
      }
    }
  }
`

const StyledCollectionItem = styled.button`
  align-items: center;
  border: none;
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

  &.selected {
    background: #ff0054;
    color: #fff;
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
