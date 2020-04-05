import $$ExpandIcon from '!!raw-loader!../assets/images/expand-icon.svg';
import { container, selectors } from 'promptu';
import React, { Fragment, PureComponent } from 'react';
import { hot } from 'react-hot-loader/root';
import styled, { css } from 'styled-components';
import Accordion from '../../../src/Accordion';
import DebugConsole from '../../../src/DebugConsole';

export interface Props {}

export interface State {
  itemIndex: number;
  sectionIndex: number;
}

export default hot(class extends PureComponent<Props, State> {
  state: State = {
    itemIndex: -1,
    sectionIndex: -1,
  };

  render() {
    return (
      <Fragment>
        <StyledRoot>
          <Accordion
            itemHeight={50}
            expandIconSvg={$$ExpandIcon}
            data={[{
              title: 'Section 1',
              items: [{
                title: 'foo',
              }, {
                title: 'bar',
              }, {
                title: 'baz',
              }]
            }, {
              title: 'Section 2',
              items: [{
                title: 'foo',
              }, {
                title: 'bar',
              }, {
                title: 'baz',
              }]
            }, {
              title: 'Section 3',
              items: [{
                title: 'foo',
              }, {
                title: 'bar',
              }, {
                title: 'baz',
              }]
            }]}
            itemCSS={props => css`
              ${selectors.hwot} {
                background: #2b14d4;
                color: #fff;
              }

              background: ${props.isActive ? '#2b14d4' : '#fff'};
              color: ${props.isActive ? '#fff' : '#000'};
            `}
            sectionHeaderCSS={props => css`
              label {
                text-transform: uppercase;
                font-weight: 700;
              }

              ${selectors.hwot} {
                transform: scale(1.2);
                z-index: 1;
                background: #2b14d4;

                label {
                  color: #fff;
                }

                svg * {
                  fill: #fff;
                }
              }
            `}
            onSectionIndexChange={idx => this.setState({ sectionIndex: idx })}
            onItemIndexChange={idx => this.setState({ itemIndex: idx })}
            style={{
              transform: 'translate3d(0, 0, 0) rotateX(10deg) rotateY(-20deg)',
              width: '30rem',
            }}
          />
        </StyledRoot>
        <DebugConsole
          title='?: Accordion'
          message={this.state.sectionIndex > -1 ? (this.state.itemIndex > -1 ? `You selected item <strong>#${this.state.itemIndex + 1}</strong> in section <strong>#${this.state.sectionIndex + 1}</strong>!` : `No item seletected in section <strong>#${this.state.sectionIndex + 1}</strong>!`) : 'No section selected!'}
          style={{
            transform: 'translate3d(0, 0, 0) rotateX(10deg) rotateY(30deg)',
          }}
        />
      </Fragment>
    );
  }
});

const StyledRoot = styled.div`
  ${container.fhcc}
  padding: 10rem 3rem;
  perspective: 80rem;
  width: 100%;
  height: 100%;
`;
