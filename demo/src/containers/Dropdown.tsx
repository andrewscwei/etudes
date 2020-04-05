import $$ExpandIcon from '!!raw-loader!../assets/images/expand-icon.svg';
import { animations, container, selectors } from 'promptu';
import React, { Fragment, PureComponent, SFC } from 'react';
import { hot } from 'react-hot-loader/root';
import styled, { css } from 'styled-components';
import DebugConsole from '../../../src/DebugConsole';
import Dropdown, { ItemComponentProps } from '../../../src/Dropdown';

export interface Props {}

export interface State {
  selectedIndex: number;
}

const Item: SFC<ItemComponentProps<{}>> = ({ data, isSelected, onClick, style }) => (
  <StyledItem isSelected={isSelected ?? false} onClick={() => onClick?.()} style={style}>{data.label}</StyledItem>
);

export default hot(class extends PureComponent<Props, State> {
  state: State = {
    selectedIndex: -1,
  };

  render() {
    return (
      <Fragment>
        <StyledRoot>
          <StyledDropdown
            data={[{
              label: 'foo',
            }, {
              label: 'bar',
            }, {
              label: 'baz',
            }]}
            itemComponentType={Item}
            isInverted={false}
            borderThickness={2}
            maxVisibleItems={-1}
            expandIconSvg={$$ExpandIcon}
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
            onIndexChange={idx => this.setState({ selectedIndex: idx })}
          />
        </StyledRoot>
        <DebugConsole
          title='?: Dropdown'
          message={this.state.selectedIndex > -1 ? `You selected item <strong>#${this.state.selectedIndex + 1}</strong>!` : 'No items selected!'}
          style={{
            transform: 'translate3d(0, 0, 0) rotateX(10deg) rotateY(30deg)',
          }}
        />
      </Fragment>
    );
  }
});

const StyledItem = styled.button<{
  isSelected: boolean;
}>`
  ${container.fvcl}
  ${animations.transition(['background', 'color'], 100)}
  flex: 0 0 auto;
  background: ${props => props.isSelected ? '#2b14d4' : '#fff'};
  color: ${props => props.isSelected ? '#fff' : '#000'};
  border-style: solid;
  padding: 0 10px;
  text-align: left;
  width: 100%;

  ${selectors.hwot} {
    background: #2b14d4;
    color: #fff;
  }
`;

const StyledDropdown = styled(Dropdown)`
  width: 30rem;
  height: 6rem;
  transform: translate3d(0, 0, 0) rotateX(10deg) rotateY(-20deg);
`;

const StyledRoot = styled.div`
  ${container.fhcc}
  padding: 10rem 3rem;
  perspective: 80rem;
  width: 100%;
  height: 100%;
`;
