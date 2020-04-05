import { Rect } from 'dirty-dom';
import React, { ComponentType, createRef, PureComponent } from 'react';
import styled, { css, CSSProperties } from 'styled-components';
import { ExtendedCSSFunction, ExtendedCSSProps } from './types';
import VList, { RowComponentProps } from './VList';

type ButtonCSSProps = Readonly<{
  borderColor: string;
  borderThickness: number;
  isActive: boolean;
}>;

/**
 * Type constraint of the data passed to each item in the component.
 */
export type DataProps<T = {}> = T & {
  label?: string;
};

/**
 * Interface defining the props of the item component type to be provided to the
 * component. The data type is generic.
 */
export type ItemComponentProps<T = {}> = RowComponentProps<DataProps<T>>;

export interface Props<T = {}> {
  /**
   * Class attribute to the root element.
   */
  className?: string;

  /**
   * Inline style attribute to the element.
   */
  style?: CSSProperties;

  /**
   * Data of every item in the component. This is used to generate individual
   * dropped down items. Data type is generic.
   */
  data: Array<DataProps<T>>;

  /**
   * Indicates if the component is inverted ("dropup" instead of dropdown).
   */
  isInverted?: boolean;

  /**
   * Indicates if items can be toggled, i.e. they can be deselected if selected
   * again.
   */
  isTogglable?: boolean;

  /**
   * Thickness of the border (in pixels) of every item and the dropdown button
   * itself. 0 indicates no borders.
   */
  borderThickness?: number;

  /**
   * The index of the default selected item.
   */
  defaultSelectedItemIndex?: number;

  /**
   * Height (in pixels) of each item. This does not apply to the dropdown button
   * itself.
   */
  itemHeight?: number;

  /**
   * Maximum number of items that are viside when the component expands. When a
   * value greater than or equal to 0 is specified, only that number of items
   * will be visible at a time, and a scrollbar will appear to scroll to
   * remaining items. Any value less than 0 indicates that all items will be
   * visible when the component expands.
   */
  maxVisibleItems?: number;

  /**
   * Color of the border of every item and the dropdown button itself.
   */
  borderColor?: string;

  /**
   * The label to appear on the dropdown button when no items are selected.
   */
  defaultLabel?: string;

  /**
   * SVG markup to be put in the dropdown button as the expand icon.
   */
  expandIconSvg?: string;

  /**
   * React component type to be used for generating items inside the component.
   */
  itemComponentType: ComponentType<ItemComponentProps<T>>;

  /**
   * Handler invoked whenever the selected index changes.
   */
  onIndexChange?: (index: number) => void;

  /**
   * Additional CSS to be provided to the dropdown button.
   */
  buttonCSS?: ExtendedCSSFunction<ButtonCSSProps>;
}

export interface State {
  /**
   * Index of the currently selected item. Any value less than 0 indicates that
   * no item is selected.
   */
  selectedItemIndex: number;

  /**
   * Indicates if the dropdown menu is collapsed.
   */
  isCollapsed: boolean;
}

/**
 * A dropdown menu component that is invertible (can "dropup" instead). Provide
 * data and item component type to this component to automatically generate
 * dropped down items.
 */
export default class Dropdown<T = {}> extends PureComponent<Props<T>, State> {
  nodeRefs = {
    root: createRef<HTMLDivElement>(),
  };

  constructor(props: Props<T>) {
    super(props);

    this.state = {
      selectedItemIndex: this.props.defaultSelectedItemIndex ?? -1,
      isCollapsed: true,
    };
  }

  componentDidMount() {
    window.addEventListener('click', this.onClickOutside);

    if (this.state.selectedItemIndex > -1) {
      this.props.onIndexChange?.(this.state.selectedItemIndex);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.onClickOutside);
  }

  componentDidUpdate(prevProps: Props<T>, prevState: State) {
    if (prevState.selectedItemIndex !== this.state.selectedItemIndex) {
      this.props.onIndexChange?.(this.state.selectedItemIndex);
    }
  }

  render() {
    const borderColor = this.props.borderColor ?? '#000';
    const borderThickness = this.props.borderThickness ?? 1;
    const itemHeight = this.props.itemHeight ?? Rect.from(this.nodeRefs.root.current)?.height ?? 50;
    const maxVisibleItems = this.props.maxVisibleItems ?? -1;
    const numItems = this.props.data.length;
    const isTogglable = this.props.isTogglable ?? true;

    return (
      <StyledRoot
        className={this.props.className}
        isInverted={this.props.isInverted ?? false}
        ref={this.nodeRefs.root}
        style={this.props.style ?? {}}
      >
        <StyledToggle
          borderColor={borderColor}
          borderThickness={borderThickness}
          extendedCSS={this.props.buttonCSS ?? (() => css``)}
          isActive={!this.state.isCollapsed}
          onClick={() => this.toggle()}
        >
          <label>
            {this.state.selectedItemIndex === -1 ? (this.props.defaultLabel ?? 'Select') : this.props.data[this.state.selectedItemIndex].label}
          </label>
          {this.props.expandIconSvg && <span dangerouslySetInnerHTML={{ __html: this.props.expandIconSvg }}/>}
        </StyledToggle>
        <StyledItemList
          borderColor={borderColor}
          borderThickness={borderThickness}
          data={this.props.data}
          defaultSelectedIndex={this.props.defaultSelectedItemIndex ?? -1}
          isInverted={this.props.isInverted ?? false}
          isTogglable={isTogglable}
          onDeselectAt={idx => this.selectItemAt(-1)}
          onSelectAt={idx => this.selectItemAt(idx)}
          rowComponentType={this.props.itemComponentType as any} // HACK: Generic types cannot be inferred by props, so this is the only way.
          rowStyle={{ height: itemHeight}}
          shouldStaySelected={true}
          style={{
            height: this.state.isCollapsed ? '0px' : `${(itemHeight - borderThickness) * (maxVisibleItems < 0 ? numItems : Math.min(numItems, maxVisibleItems)) + borderThickness}px`,
            overflowY: (maxVisibleItems === -1) ? 'hidden' : (maxVisibleItems < numItems ? 'scroll' : 'hidden'),
          }}
        />
      </StyledRoot>
    );
  }

  /**
   * Indicates if the item at the specified index is selected.
   *
   * @param index - The index of the item.
   *
   * @returns `true` if the item at the specified index is selected, `false`
   *          otherwise.
   */
  isItemSelectedAt(index: number) {
    return (this.state.selectedItemIndex === index);
  }

  /**
   * Selects the item at the specified index.
   *
   * @param index - The index of the item to select.
   */
  selectItemAt(index: number) {
    if (index < 0 || index >= this.props.data.length) throw new Error(`Index ${index} is out of range`);

    this.setState({
      selectedItemIndex: index,
      isCollapsed: true,
    });
  }

  /**
   * Expands the component, revealing its items.
   */
  expand() {
    if (!this.state.isCollapsed) return;
    this.setState({ isCollapsed: false });
  }

  /**
   * Collapses the component, concealing its items.
   */
  collapse() {
    if (this.state.isCollapsed) return;
    this.setState({ isCollapsed: true });
  }

  /**
   * Toggles the visibility of the items.
   */
  toggle() {
    if (this.state.isCollapsed) {
      this.expand();
    }
    else {
      this.collapse();
    }
  }

  /**
   * Handler invoked when click input is detected outside of the root element
   * of the component.
   *
   * @param event - The MouseEvent passed to the handler.
   */
  private onClickOutside = (event: MouseEvent) => {
    if (this.state.isCollapsed) return;
    if (!(event.target instanceof Node)) return;

    let isOutside = true;
    let node = event.target;

    while (node) {
      if (node === this.nodeRefs.root.current) {
        isOutside = false;
        break;
      }

      if (!node.parentNode) break;

      node = node.parentNode;
    }

    if (!isOutside) return;

    this.collapse();
  }
}

const StyledItemList = styled(VList)<{
  isInverted: boolean;
}>`
  position: absolute;
  transition: height .1s linear;
  will-change: height;

  ${props => props.isInverted ? css`
    margin-bottom: ${-props.borderThickness}px;
    bottom: 100%;
  ` : css`
    top: 100%;
    margin-top: ${-props.borderThickness}px;
  `}

  ::-webkit-scrollbar {}
  ::-webkit-scrollbar-track {}
  ::-webkit-scrollbar-thumb {}
  ::-webkit-scrollbar-hover {}
`;

const StyledToggle = styled.button<ButtonCSSProps & ExtendedCSSProps<ButtonCSSProps>>`
  > span {
    height: 15px;
    width: 15px;
  }

  > label {
    font-family: inherit;
    font-size: inherit;
    font-weight: inherit;
    letter-spacing: inherit;
    line-height: inherit;
  }

  ${props => props.extendedCSS(props)}

  align-items: center;
  background: #fff;
  box-sizing: border-box;
  color: #000;
  display: flex;
  flex-direction: row;
  height: 100%;
  justify-content: space-between;
  left: 0;
  margin: 0;
  outline: none;
  padding: 0 10px;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 1;

  ${props => props.borderThickness > 0 && css`
    border: ${props.borderThickness}px solid ${props.borderColor};
  `}

  > span {
    box-sizing: border-box;
    display: block;
    transform-origin: center;

    svg {
      height: 100%;
      width: auto;
    }
  }
`;

const StyledRoot = styled.div<{
  isInverted: boolean;
}>`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex-direction: ${props => props.isInverted ? 'column-reverse' : 'column'};
  height: 50px;
  justify-content: flex-start;
  padding: 0;
  overflow: visible;
  position: relative;
  width: 200px;
`;
