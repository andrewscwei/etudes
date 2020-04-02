import React, { ComponentType } from 'react';
import styled from 'styled-components';
import AbstractSelectableCollection, { Props as AbstractSelectableCollectionProps, State as AbstractSelectableCollectionState } from './AbstractSelectableCollection';

export interface RowProps<T> {
  data: T;
  isSelected?: boolean;
  onClick?: () => void;
}

export interface Props<T> extends AbstractSelectableCollectionProps {
  data: Array<T>;
  padding?: number;
  rowComponentType: ComponentType<RowProps<T>>;
  scrollbarPadding?: number;
}

export interface State extends AbstractSelectableCollectionState {

}

export default class VList<T> extends AbstractSelectableCollection<Props<T>, State> {
  isIndexOutOfRange(index: number): boolean {
    if (index >= this.props.data.length) return true;
    return super.isIndexOutOfRange(index);
  }

  render() {
    const RowComponentType = this.props.rowComponentType;

    return (
      <StyledRoot
        className={this.props.className}
        padding={this.props.padding ?? 12}
        scrollbarPadding={this.props.scrollbarPadding ?? 30}
        style={this.props.style}
      >
        {this.props.data.map((t, i) => (
          <RowComponentType
            key={`row-${i}`}
            data={t}
            isSelected={this.isSelectedAt(i)}
            onClick={() => this.toggleAt(i)}
          />
        ))}
      </StyledRoot>
    );
  }
}

const StyledRoot = styled.div<{
  scrollbarPadding: number;
  padding: number;
}>`
  -webkit-overflow-scrolling: touch;
  align-items: flex-start;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow: visible;
  padding-right: ${props => props.scrollbarPadding}px;

  > * {
    flex: 0 0 auto;

    &:not(:last-child) {
      margin-bottom: ${props => props.padding}px;
    }
  }
`;
