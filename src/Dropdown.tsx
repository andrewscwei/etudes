import { Rect } from 'dirty-dom';
import React, { createRef, PureComponent } from 'react';
import styled, { css, CSSProperties } from 'styled-components';
import { ExtendedCSSFunction, ExtendedCSSProps } from './types';

type ItemCSSProps = Readonly<{
  borderColor: string;
  borderThickness: number;
  height: number;
  isInverted: boolean;
}>;

type ToggleCSSProps = Readonly<{
  borderColor: string;
  borderThickness: number;
  isActive: boolean;
}>;

export type DataProps<T> = T & {
  description: string;
  label?: string;
  title: string;
};

export interface Props<T> {
  className?: string;
  style?: CSSProperties;
  data: Array<DataProps<T>>;
  isInverted?: boolean;
  borderThickness?: number;
  defaultSelectedItemIndex?: number;
  itemHeight?: number;
  maxVisibleItems?: number;
  borderColor?: string;
  defaultLabel?: string;
  expandIconSvg?: string;
  onIndexChange?: (index: number) => void;
  itemCSS?: ExtendedCSSFunction<ItemCSSProps>;
  toggleCSS?: ExtendedCSSFunction<ToggleCSSProps>;
}

export interface State {
  selectedItemIndex: number;
  isMenuHidden: boolean;
}

export default class Dropdown<T> extends PureComponent<Props<T>, State> {
  nodeRefs = {
    root: createRef<HTMLDivElement>(),
  };

  constructor(props: Props<T>) {
    super(props);

    const initialState: State = {
      selectedItemIndex: this.props.defaultSelectedItemIndex ?? -1,
      isMenuHidden: true,
    };

    this.state = initialState as State;
  }

  onClickOutside = (event: any) => {
    if (this.state.isMenuHidden) return;
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

    this.closeMenu();
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

  isItemSelectedAt(index: number) {
    return (this.state.selectedItemIndex === index);
  }

  selectItemAt(index: number) {
    this.setState({
      selectedItemIndex: index,
      isMenuHidden: true,
    });
  }

  openMenu() {
    if (!this.state.isMenuHidden) return;
    this.setState({ isMenuHidden: false });
  }

  closeMenu() {
    if (this.state.isMenuHidden) return;
    this.setState({ isMenuHidden: true });
  }

  toggleMenu() {
    if (this.state.isMenuHidden) {
      this.openMenu();
    }
    else {
      this.closeMenu();
    }
  }

  render() {
    const borderColor = this.props.borderColor ?? '#000';
    const borderThickness = this.props.borderThickness ?? 1;
    const itemHeight = this.props.itemHeight ?? Rect.from(this.nodeRefs.root.current)?.height ?? 50;
    const maxVisibleItems = this.props.maxVisibleItems ?? -1;
    const numItems = this.props.data.length;

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
          extendedCSS={this.props.toggleCSS ?? (() => css``)}
          isActive={!this.state.isMenuHidden}
          onClick={() => this.toggleMenu()}
        >
          <label>
            {this.state.selectedItemIndex === -1 ? (this.props.defaultLabel ?? 'Select') : (this.props.data[this.state.selectedItemIndex].label ?? this.props.data[this.state.selectedItemIndex].title)}
          </label>
          {this.props.expandIconSvg && <span dangerouslySetInnerHTML={{ __html: this.props.expandIconSvg }}/>}
        </StyledToggle>
        <StyledItemList
          borderColor={borderColor}
          borderThickness={borderThickness}
          isInverted={this.props.isInverted ?? false}
          style={{
            height: `${!this.state.isMenuHidden ? itemHeight * (maxVisibleItems === -1 ? numItems : Math.min(numItems, maxVisibleItems)) + borderThickness : 0}px`,
            overflowY: (maxVisibleItems === -1) ? 'hidden' : (maxVisibleItems < numItems ? 'scroll' : 'hidden'),
          }}
        >
          <ol>
            {this.props.data.map((v, i) => (
              <StyledItem
                borderColor={borderColor}
                borderThickness={borderThickness}
                extendedCSS={this.props.itemCSS ?? (() => css``)}
                height={itemHeight}
                isInverted={this.props.isInverted ?? false}
                key={`${i}`}
                onClick={() => this.selectItemAt(i)}
              >
                <span dangerouslySetInnerHTML={{ __html: v.title }}/>
                {v.description && <small dangerouslySetInnerHTML={{ __html: v.description }}/>}
              </StyledItem>
            ))}
          </ol>
        </StyledItemList>
      </StyledRoot>
    );
  }
}

const StyledItem = styled.button<ItemCSSProps & ExtendedCSSProps<ItemCSSProps>>`
  align-items: flex-start;
  background: #fff;
  border-bottom-width: 0;
  border-color: ${props => props.borderColor};
  border-left-width: 0;
  border-right-width: 0;
  border-style: solid;
  border-top-width: 0;
  box-sizing: border-box;
  color: #000;
  counter-increment: item-counter;
  display: flex;
  flex-direction: column;
  flex: 0 0 auto;
  justify-content: center;
  overflow: hidden;
  padding: 0 10px;
  width: 100%;

  span {
    text-align: left;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &[disabled] {
    pointer-events: none;
  }

  &:not(:last-child) {
    border-bottom-width: ${props => props.borderThickness}px;
  }

  ${props => props.isInverted ? css`
    &:last-child {
      height: ${props.height + props.borderThickness}px;
    }
  ` : css`
    &:first-child {
      height: ${props.height + props.borderThickness}px;
    }
  `}

  ${props => props.extendedCSS(props)}
  height: ${props => props.height}px;
`;

const StyledItemList = styled.div<{
  borderColor: string;
  borderThickness: number;
  isInverted: boolean;
}>`
  -webkit-overflow-scrolling: touch;
  border-bottom-width: ${props => props.isInverted ? 0 : props.borderThickness}px;
  border-color: ${props => props.borderColor};
  border-left-width: ${props => props.borderThickness}px;
  border-right-width: ${props => props.borderThickness}px;;
  border-style: solid;
  border-top-width: ${props => props.isInverted ? props.borderThickness : 0}px;
  box-sizing: border-box;
  display: block;
  overflow: visible;
  position: absolute;
  transition: height .1s linear;
  will-change: height;
  width: 100%;

  ${props => props.isInverted ? css`
    margin-bottom: ${-props.borderThickness}px;
    bottom: 100%;
  ` : css`
    top: 100%;
    margin-top: ${-props.borderThickness}px;
  `}

  ol {
    border-color: inherit;
    counter-reset: item-counter;
    list-style: none;
    width: 100%;
  }

  ::-webkit-scrollbar {}
  ::-webkit-scrollbar-track {}
  ::-webkit-scrollbar-thumb {}
  ::-webkit-scrollbar-hover {}
`;

const StyledToggle = styled.button<ToggleCSSProps & ExtendedCSSProps<ToggleCSSProps>>`
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
