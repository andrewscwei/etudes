import React, { ComponentType, CSSProperties } from 'react';
import styled from 'styled-components';
import AbstractSelectableCollection, { Props as AbstractSelectableCollectionProps } from './AbstractSelectableCollection';

export interface RowProps<T> {
  className?: string;
  style: CSSProperties;
  data: T;
  isSelected?: boolean;
  onClick?: () => void;
}

export interface Props<T> extends AbstractSelectableCollectionProps {
  borderThickness: number;
  data: Array<T>;
  padding?: number;
  rowComponentType: ComponentType<RowProps<T>>;
}

export default class VList<T> extends AbstractSelectableCollection<Props<T>> {
  isIndexOutOfRange(index: number): boolean {
    if (index >= this.props.data.length) return true;
    return super.isIndexOutOfRange(index);
  }

  render() {
    const RowComponentType = this.props.rowComponentType;
    const borderThickness = this.props.borderThickness ?? 0;

    return (
      <StyledRoot
        className={this.props.className}
        padding={this.props.padding ?? 0}
        style={{
          ...this.props.style ?? {},
        }}
      >
        {this.props.data.map((t, i) => (
          <RowComponentType
            key={`row-${i}`}
            data={t}
            isSelected={this.isSelectedAt(i)}
            onClick={() => this.toggleAt(i)}
            style={{
              borderWidth: `${borderThickness}px`,
              marginTop: `${i === 0 ? 0 : -borderThickness}px`,
            }}
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
  flex-direction: column;
  justify-content: flex-start;
  overflow: visible;

  > * {
    flex: 0 0 auto;

    &:not(:last-child) {
      margin-bottom: ${props => props.padding}px;
    }
  }
`;
