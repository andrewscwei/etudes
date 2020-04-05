import React, { ComponentType, CSSProperties, SFC } from 'react';
import styled from 'styled-components';
import AbstractSelectableCollection, { Props as AbstractSelectableCollectionProps } from './AbstractSelectableCollection';

/**
 * Interface defining the props of the row component type to be provided to the
 * VList. The data type is generic.
 */
export interface RowComponentProps<T = {}> {
  /**
   * Class attribute of the root element.
   */
  className?: string;

  /**
   * Inline style attribute of the root element.
   */
  style: CSSProperties;

  /**
   * Data passed to the row component.
   */
  data: T;

  /**
   * Indicates if the row is selected.
   */
  isSelected?: boolean;

  /**
   * Handler invoked when the row is clicked..
   */
  onClick?: () => void;
}

export interface Props<T = {}> extends AbstractSelectableCollectionProps {
  /**
   * Generically typed data of each row.
   */
  data: Array<T>;

  /**
   * Maximum height (in pixels) of this component. If specified, the height will
   * be capped at this value and the component becomes scrollable.
   */
  maxHeight?: number;

  /**
   * Padding between every row (in pixels).
   */
  padding?: number;

  /**
   * Thickness of row borders (in pixels). 0 indicates no borders.
   */
  borderThickness: number;

  /**
   * Color of row borders.
   */
  borderColor?: string;

  /**
   * React component type to be used to generate rows for this component.
   */
  rowComponentType: SFC<RowComponentProps<T>>;

  /**
   * Class attribute of the root element of the row component.
   */
  rowClassName?: string;

  /**
   * Inline style attribute of the root element of the row component.
   */
  rowStyle?: CSSProperties;

  /**
   * Padding (in pixels) between the rows and the scrollbar. Note that this is
   * unused if there is no scrollbar (i.e. max height is not specified).
   */
  scrollBarPadding?: number;
}

/**
 * A scrollable vertical list of selectable rows. Rows are generated based on
 * the provided React component type. The type of data passed to each row is
 * generic.
 */
export default class VList<T = {}> extends AbstractSelectableCollection<Props<T>> {
  render() {
    const RowComponentType = this.props.rowComponentType;
    const borderColor = this.props.borderColor ?? '#000';
    const borderThickness = this.props.borderThickness ?? 0;
    const maxHeight = this.props.maxHeight ?? -1;
    const scrollBarPadding = maxHeight < 0 ? 0 : (this.props.scrollBarPadding ?? 0);

    return (
      <StyledRoot
        className={this.props.className}
        padding={this.props.padding ?? 0}
        style={{
          ...this.props.style ?? {},
          ...(maxHeight < 0 ? {} : {
            height: `${maxHeight}px`,
            WebkitOverflowScrolling: 'touch',
            overflowY: 'scroll',
            paddingRight: `${scrollBarPadding}px`,
          }),
        }}
      >
        {this.props.data.map((t, i) => (
          <RowComponentType
            className={this.props.rowClassName}
            data={t}
            isSelected={this.isSelectedAt(i)}
            key={`row-${i}`}
            onClick={() => this.toggleAt(i)}
            style={{
              ...this.props.rowStyle ?? {},
              borderWidth: `${borderThickness}px`,
              borderColor,
              counterIncrement: 'item-counter',
              marginTop: `${i === 0 ? 0 : -borderThickness}px`,
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

const StyledRoot = styled.ol<{
  padding: number;
}>`
  counter-reset: item-counter;
  list-style: none;
  align-items: flex-start;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex: 0 0 auto;
  justify-content: flex-start;
  overflow-x: visible;
  overflow-y: visible;
  width: 100%;

  > * {
    flex: 0 0 auto;

    &:not(:last-child) {
      margin-bottom: ${props => props.padding}px;
    }
  }
`;
