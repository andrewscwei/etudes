import React, { ComponentType, CSSProperties } from 'react';
import styled from 'styled-components';
import AbstractSelectableCollection, { Props as AbstractSelectableCollectionProps } from './AbstractSelectableCollection';

/**
 * Interface defining the props of the column component type to be provided to
 * the HList. The data type is generic.
 */
export interface ColumnComponentProps<T> {
  /**
   * Class attribute of the root element.
   */
  className?: string;

  /**
   * Inline style attribute of the root element.
   */
  style: CSSProperties;

  /**
   * Data passed to the column component.
   */
  data: T;

  /**
   * Indicates if the column is selected.
   */
  isSelected?: boolean;

  /**
   * Handler invoked when the column is clicked.
   */
  onClick?: () => void;
}

export interface Props<T> extends AbstractSelectableCollectionProps {
  /**
   * Generically typed data of each column.
   */
  data: Array<T>;

  /**
   * Maximum width (in pixels) of this component. If specified, the width will
   * be capped at this value and the component becomes scrollable.
   */
  maxWidth?: number;

  /**
   * Padding between every column (in pixels).
   */
  padding?: number;

  /**
   * Thickness of column borders (in pixels). 0 indicates no borders.
   */
  borderThickness: number;

  /**
   * Color of column borders.
   */
  borderColor?: string;

  /**
   * React component type to be used to generate columns for this component.
   */
  columnComponentType: ComponentType<ColumnComponentProps<T>>;

  /**
   * Class attribute of the root element of the column component.
   */
  columnClassName?: string;

  /**
   * Inline style attribute of the root element of the column component..
   */
  columnStyle?: CSSProperties;

  /**
   * Padding (in pixels) between the columns and the scrollbar. Note that this
   * is unused if there is no scrollbar (i.e. max width is not specified).
   */
  scrollBarPadding?: number;
}

/**
 * A scrollable horizontal list of selectable columns. Columns are generated
 * based on the provided React component type. The type of data passed to each
 * column is generic.
 */
export default class HList<T> extends AbstractSelectableCollection<Props<T>> {
  render() {
    const ColumnComponentType = this.props.columnComponentType;
    const borderColor = this.props.borderColor ?? '#000';
    const borderThickness = this.props.borderThickness ?? 0;
    const maxWidth = this.props.maxWidth ?? -1;
    const scrollBarPadding = maxWidth < 0 ? 0 : (this.props.scrollBarPadding ?? 0);

    return (
      <StyledRoot
        className={this.props.className}
        padding={this.props.padding ?? 0}
        style={{
          ...this.props.style ?? {},
          ...(maxWidth < 0 ? {} : {
            width: `${maxWidth}px`,
            WebkitOverflowScrolling: 'touch',
            overflowX: 'scroll',
            paddingBottom: `${scrollBarPadding}px`,
          }),
        }}
      >
        {this.props.data.map((t, i) => (
          <ColumnComponentType
            className={this.props.columnClassName}
            data={t}
            isSelected={this.isSelectedAt(i)}
            key={`row-${i}`}
            onClick={() => this.toggleAt(i)}
            style={{
              ...this.props.columnStyle ?? {},
              borderWidth: `${borderThickness}px`,
              borderColor,
              counterIncrement: 'item-counter',
              marginLeft: `${i === 0 ? 0 : -borderThickness}px`,
              pointerEvents: this.props.isTogglable !== true && this.isSelectedAt(i) ? 'none' : 'auto',
            }}
          />
        ))}
      </StyledRoot>
    );
  }

  isIndexOutOfRange(index: number): boolean {
    if (index >= this.props.data.length) return true;
    return super.isIndexOutOfRange(index);
  }
}

const StyledRoot = styled.div<{
  padding: number;
}>`
  counter-reset: item-counter;
  list-style: none;
  align-items: flex-start;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  overflow: visible;
  height: 100%;

  > * {
    flex: 0 0 auto;

    &:not(:last-child) {
      margin-right: ${props => props.padding}px;
    }
  }
`;
