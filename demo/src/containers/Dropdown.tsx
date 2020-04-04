import { container, selectors } from 'promptu';
import React, { Fragment, PureComponent } from 'react';
import { hot } from 'react-hot-loader/root';
import styled, { css } from 'styled-components';
import DebugConsole from '../../../src/DebugConsole';
import Dropdown from '../../../src/Dropdown';
import $$ExpandIcon from '!!raw-loader!../assets/images/expand-icon.svg';

export interface Props {}

export interface State {
  selectedIndex: number;
}

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
              title: 'foo',
              description: 'Description for Foo',
            }, {
              title: 'bar',
              description: 'Description for Bar',
            }, {
              title: 'baz',
              description: 'Description for Baz',
            }]}
            isInverted={false}
            borderThickness={2}
            expandIconSvg={$$ExpandIcon}
            toggleCSS={props => css`
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
            itemCSS={props => css`
              font-size: 1.6rem;
              transition: all .1s ease-out;

              > span {
                font-weight: 700;
                text-transform: uppercase;
              }


              ${selectors.hwot} {
                color: #fff;
                background: #2b14d4;
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
