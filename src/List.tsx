import React, { ComponentType, CSSProperties } from 'react';
import styled, { css } from 'styled-components';
import AbstractSelectableCollection, { Props as AbstractSelectableCollectionProps } from './AbstractSelectableCollection';
import { Orientation } from './types';

/**
 * Interface defining the props of the item component type to be provided to the
 * list. The data type is generic.
 */
export interface ItemComponentProps<T = {}> {
  /**
   * Class attribute of the root element.
   */
  className?: string;

  /**
   * Inline style attribute of the root element.
   */
  style: CSSProperties;

  /**
   * Data passed to the item component.
   */
  data: T;

  /**
   * Indicates if the item is selected.
   */
  isSelected?: boolean;

  /**
   * Orientation of the list.
   */
  orientation: Orientation;

  /**
   * Handler invoked when the item is clicked.
   */
  onClick?: () => void;
}

export interface Props<T = {}> extends AbstractSelectableCollectionProps {
  /**
   * Generically typed data of each item.
   */
  data: Array<T>;

  /**
   * Maximum length (in pixels) of this component. The definition of length here
   * is dependent on the orientation of the component. If the orientation is
   * horizontal, length means width. If the orientation is vertical, length
   * means height. If specified, the length will be capped at this value and the
   * component becomes scrollable.
   */
  maxLength?: number;

  /**
   * Padding between every item (in pixels).
   */
  padding?: number;

  /**
   * Thickness of item borders (in pixels). 0 indicates no borders.
   */
  borderThickness?: number;

  /**
   * Orientation of the list.
   */
  orientation?: Orientation;

  /**
   * Color of item borders.
   */
  borderColor?: string;

  /**
   * React component type to be used to generate items for this list.
   */
  itemComponentType: ComponentType<ItemComponentProps<T>>;

  /**
   * Class attribute of the root element of the item component.
   */
  itemClassName?: string;

  /**
   * Inline style attribute of the root element of the item component.
   */
  itemStyle?: CSSProperties;

  /**
   * Padding (in pixels) between the items and the scrollbar. Note that this is
   * unused if there is no scrollbar (i.e. max length is not specified).
   */
  scrollBarPadding?: number;
}

/**
 * A scrollable list of selectable items. Items are generated based on the
 * provided React component type. The type of data passed to each item is
 * generic. This component supports both horizontal and vertical orientations.
 */
export default class List<T = {}> extends AbstractSelectableCollection<Props<T>> {
  render() {
    const ItemComponentType = this.props.itemComponentType;
    const borderColor = this.props.borderColor ?? '#000';
    const borderThickness = this.props.borderThickness ?? 0;
    const maxLength = this.props.maxLength ?? -1;
    const scrollBarPadding = maxLength < 0 ? 0 : (this.props.scrollBarPadding ?? 0);
    const orientation = this.props.orientation ?? 'vertical';

    return (
      <StyledRoot
        className={this.props.className}
        orientation={orientation}
        padding={this.props.padding ?? 0}
        style={{
          ...this.props.style ?? {},
          ...(maxLength < 0 ? {} : (
            orientation === 'vertical' ? {
              height: `${maxLength}px`,
              overflowY: 'scroll',
              paddingRight: `${scrollBarPadding}px`,
              WebkitOverflowScrolling: 'touch',
            } : {
              overflowX: 'scroll',
              paddingBottom: `${scrollBarPadding}px`,
              width: `${maxLength}px`,
              WebkitOverflowScrolling: 'touch',
            }
          )),
        }}
      >
        {this.props.data.map((t, i) => (
          <ItemComponentType
            className={this.props.itemClassName}
            data={t}
            isSelected={this.isSelectedAt(i)}
            key={`item-${i}`}
            onClick={() => this.toggleAt(i)}
            orientation={orientation}
            style={{
              ...this.props.itemStyle ?? {},
              borderColor,
              borderWidth: `${borderThickness}px`,
              counterIncrement: 'item-counter',
              pointerEvents: this.props.isTogglable !== true && this.isSelectedAt(i) ? 'none' : 'auto',
              ...(orientation === 'vertical' ? {
                marginTop: `${i === 0 ? 0 : -borderThickness}px`,
              } : {
                marginLeft: `${i === 0 ? 0 : -borderThickness}px`,
              }),
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
  orientation: Props['orientation'];
}>`
  counter-reset: item-counter;
  list-style: none;
  align-items: flex-start;
  box-sizing: border-box;
  display: flex;
  flex-direction: ${props => props.orientation === 'horizontal' ? 'row' : 'column'};
  flex: 0 0 auto;
  justify-content: flex-start;
  overflow-x: visible;
  overflow-y: visible;
  width: ${props => props.orientation === 'horizontal' ? 'auto' : '100%'};
  height: ${props => props.orientation === 'horizontal' ? '100%' : 'auto'};

  > * {
    flex: 0 0 auto;

    &:not(:last-child) {
      ${props => props.orientation === 'horizontal' ? css`
        margin-right: ${props.padding}px;
      ` : css`
        margin-bottom: ${props.padding}px;
      `}
    }
  }
`;
