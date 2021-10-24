import $$ExpandIcon from '!!raw-loader!../assets/images/expand-icon.svg'
import { animations, container, selectors } from 'promptu'
import React, { Fragment, FunctionComponent, PureComponent } from 'react'
import styled, { css } from 'styled-components'
import Accordion, { ItemComponentProps } from '../../../src/Accordion'
import DebugConsole from '../../../src/DebugConsole'
import { Orientation } from '../../../src/types'

export interface Props {}

export interface State {
  itemIndex: number
  sectionIndex: number
}

const ItemComponent: FunctionComponent<ItemComponentProps<string>> = ({
  data,
  orientation,
  isSelected, onClick,
  style,
}: ItemComponentProps<string>) => (
  <StyledItem orientation={orientation} isSelected={isSelected ?? false} onClick={() => onClick?.()} style={style}>{data}</StyledItem>
)

export default class Container extends PureComponent<Props, State> {
  state: State = {
    itemIndex: -1,
    sectionIndex: -1,
  }

  render() {
    return (
      <Fragment>
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
    )
  }
}

const StyledItem = styled.button<{
  isSelected: boolean
  orientation: Orientation
}>`
  ${container.fvcc}
  ${animations.transition(['transform', 'background', 'color'], 100)}
  background: ${props => props.isSelected ? '#2b14d4' : '#fff'};
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
    background: #2b14d4;
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
