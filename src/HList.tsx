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
  columnComponentType: ComponentType<RowProps<T>>;
}

export interface State extends AbstractSelectableCollectionState {

}

export default class HList<T> extends AbstractSelectableCollection<Props<T>, State> {
  isIndexOutOfRange(index: number): boolean {
    if (index >= this.props.data.length) return true;
    return super.isIndexOutOfRange(index);
  }

  render() {
    const ColumnComponentType = this.props.columnComponentType;

    return (
      <StyledRoot
        className={this.props.className}
        padding={this.props.padding ?? 12}
        style={this.props.style}
      >
        {this.props.data.map((t, i) => (
          <ColumnComponentType
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
  padding: number;
}>`
  align-items: flex-start;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  overflow: visible;

  > * {
    flex: 0 0 auto;

    &:not(:last-child) {
      margin-right: ${props => props.padding}px;
    }
  }
`;
