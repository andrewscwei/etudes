import $$ExpandIcon from '!!raw-loader!../assets/images/expand-icon.svg'
import { animations, container, selectors } from 'promptu'
import React, { Fragment, FunctionComponent, PureComponent } from 'react'
import styled, { css } from 'styled-components'
import DebugConsole from '../../../lib/DebugConsole'
import Dropdown, { ItemComponentProps as DropdownItemComponentProps } from '../../../lib/Dropdown'
import List, { ItemComponentProps as ListItemComponentProps } from '../../../lib/List'
import { Orientation } from '../../../lib/types'

export interface Props {}

export interface State {
  selectedItemIndex: number
  selectedOrientationIndex: number
}

const DropdownItemComponent: FunctionComponent<DropdownItemComponentProps> = ({
  data,
  isSelected,
  onClick,
  style,
}: DropdownItemComponentProps) => (
  <StyledDropdownItem isSelected={isSelected ?? false} onClick={() => onClick?.()} style={style}>{data.label}</StyledDropdownItem>
)

const ListItemComponent: FunctionComponent<ListItemComponentProps<string>> = ({
  data,
  orientation,
  isSelected,
  onClick,
  style,
}: ListItemComponentProps<string>) => (
  <StyledListItem orientation={orientation} isSelected={isSelected ?? false} onClick={() => onClick?.()} style={style}>{data}</StyledListItem>
)

export default class Container extends PureComponent<Props, State> {
  state: State = {
    selectedItemIndex: -1,
    selectedOrientationIndex: 0,
  }

  render() {
    const orientation = this.state.selectedOrientationIndex === 0 ? 'vertical' : 'horizontal'

    return (
      <Fragment>
        <StyledRoot orientation={orientation}>
          <List
            data={[...new Array(60)].map((v, i) => `${i + 1}`)}
            isTogglable={true}
            orientation={orientation}
            onDeselectAt={idx => this.setState({ selectedItemIndex: -1 })}
            onSelectAt={idx => this.setState({ selectedItemIndex: idx })}
            itemComponentType={ListItemComponent}
            shouldStaySelected={true}
            itemPadding={20}
            style={{
              ...(orientation === 'vertical' ? {
                width: '80%',
                minWidth: '400px',
                transform: 'translate3d(0, 0, 0) rotate3d(1, 1, 0, 10deg)',
              } : {
                height: '80%',
                minHeight: '400px',
                transform: 'translate3d(0, 0, 0) rotate3d(1, .1, 0, 10deg)',
              }),
            }}
          />
        </StyledRoot>
        <Dropdown
          borderThickness={2}
          itemPadding={10}
          data={[{ label: 'Vertical' }, { label: 'Horizontal' }]}
          defaultLabel='Select orientation'
          defaultSelectedItemIndex={this.state.selectedOrientationIndex}
          expandIconSvg={$$ExpandIcon}
          isInverted={false}
          itemComponentType={DropdownItemComponent}
          maxVisibleItems={-1}
          onIndexChange={idx => this.setState({ selectedOrientationIndex: idx })}
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
              background: #2b14d4;
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
          message={this.state.selectedItemIndex > -1 ? `<strong>[${orientation.toUpperCase()}]</strong> You selected item <strong>#${this.state.selectedItemIndex + 1}</strong>!` : 'No item selected!'}
          style={{
            transform: 'translate3d(0, 0, 0) rotateX(10deg) rotateY(30deg)',
          }}
        />
      </Fragment>
    )
  }
}

const StyledDropdownItem = styled.button<{
  isSelected: boolean
}>`
  ${container.fvcl}
  ${animations.transition(['background', 'color'], 100)}
  background: ${props => props.isSelected ? '#2b14d4' : '#fff'};
  border-style: solid;
  color: ${props => props.isSelected ? '#fff' : '#000'};
  flex: 0 0 auto;
  height: 100%;
  padding: 0 10px;
  text-align: left;
  width: 100%;

  ${selectors.hwot} {
    background: #2b14d4;
    color: #fff;
  }
`

const StyledListItem = styled.button<{
  isSelected: boolean
  orientation: Orientation
}>`
  ${container.fvcc}
  ${animations.transition('transform', 100)}
  background: ${props => props.isSelected ? '#2b14d4' : '#fff'};
  color: ${props => props.isSelected ? '#fff' : '#000'};
  font-size: 3rem;
  font-weight: 700;
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
    transform: translate3d(0, 0, 0) scale(1.1);
    z-index: 1;
  }
`

const StyledRoot = styled.div<{
  orientation: Orientation
}>`
  padding: 10rem 3rem;
  perspective: 80rem;
  width: 100%;
  height: 100%;

  ${props => props.orientation === 'vertical' ? css`
    ${container.fvtc}
    overflow-x: hidden;
  ` : css`
    ${container.fhcl}
    overflow-y: hidden;
  `}
`
