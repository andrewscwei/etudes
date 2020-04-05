import React, { CSSProperties, PureComponent } from 'react';
import styled, { css } from 'styled-components';
import { ExtendedCSSFunction, ExtendedCSSProps } from './types';

type ItemListCSSProps = Readonly<{
  isActive: boolean;
  maxVisibleItems: number;
  numItems: number;
  itemHeight: number;
}>;

type ItemCSSProps = Readonly<{
  height: number;
  isActive: boolean;
}>;

type SectionHeaderCSSProps = Readonly<{
  isActive: boolean;
}>;

type SectionCSSProps = Readonly<{
  isActive: boolean;
}>;

interface SectionProps {
  title: string;
  items: Array<ItemProps>;
}

interface ItemProps {
  title: string;
}

interface Props {
  className?: string;
  style: CSSProperties;
  data: Array<SectionProps>;
  isTogglable: boolean;
  defaultSelectedSectionIndex: number;
  itemHeight: number;
  maxVisibleItems: number;
  expandIconSvg: string;
  onItemIndexChange?: (index: number) => void;
  onSectionIndexChange?: (index: number) => void;
  itemCSS: ExtendedCSSFunction<ItemCSSProps>;
  itemListCSS: ExtendedCSSFunction<ItemListCSSProps>;
  sectionCSS: ExtendedCSSFunction<SectionCSSProps>;
  sectionHeaderCSS: ExtendedCSSFunction<SectionHeaderCSSProps>;
}

interface State {
  selectedSectionIndex: number;
  selectedItemIndex: number;
}

export default class Accordion extends PureComponent<Props, State> {
  static defaultProps: Partial<Props> = {
    style: {},
    isTogglable: true,
    defaultSelectedSectionIndex: 0,
    itemHeight: 50,
    maxVisibleItems: -1,
    itemCSS: () => css``,
    itemListCSS: () => css``,
    sectionCSS: () => css``,
    sectionHeaderCSS: () => css``,
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      selectedSectionIndex: props.defaultSelectedSectionIndex,
      selectedItemIndex: -1,
    };
  }

  componentDidMount() {
    this.props.onSectionIndexChange?.(this.state.selectedSectionIndex);
    this.props.onItemIndexChange?.(this.state.selectedItemIndex);
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevState.selectedSectionIndex !== this.state.selectedSectionIndex) {
      this.props.onSectionIndexChange?.(this.state.selectedSectionIndex);
    }

    if (prevState.selectedItemIndex !== this.state.selectedItemIndex) {
      this.props.onItemIndexChange?.(this.state.selectedItemIndex);
    }
  }

  render() {
    const { className, data, expandIconSvg, maxVisibleItems, onItemIndexChange, itemHeight, style, sectionHeaderCSS, itemListCSS, itemCSS, sectionCSS } = this.props;
    const { selectedItemIndex } = this.state;

    return (
      <StyledRoot
        className={className}
        style={{
          ...style,
          height: 'auto',
        }}
      >
        { data.map((section, i) => (
          <StyledSection
            key={`section=${i}`}
            isActive={this.isSectionSelectedAt(i)}
            extendedCSS={sectionCSS}
          >
            <StyledSectionHeader
              isActive={this.isSectionSelectedAt(i)}
              onClick={() => this.toggleSectionAt(i)}
              extendedCSS={sectionHeaderCSS}
            >
              <label>{section.title}</label>
              {expandIconSvg && <span dangerouslySetInnerHTML={{ __html: expandIconSvg }}/>}
            </StyledSectionHeader>
            <StyledItemList
              isActive={this.isSectionSelectedAt(i)}
              itemHeight={itemHeight}
              numItems={section.items.length}
              maxVisibleItems={maxVisibleItems}
              extendedCSS={itemListCSS}
              style={{
                height: `${this.isSectionSelectedAt(i) ? itemHeight * (maxVisibleItems < 0 ? section.items.length : Math.min(section.items.length, maxVisibleItems)) : 0}px`,
              }}
            >
              <ol>
                {section.items.map((item, j) => (
                  <StyledItem
                    dangerouslySetInnerHTML={{ __html: item.title }}
                    disabled={!onItemIndexChange}
                    height={itemHeight}
                    isActive={selectedItemIndex === j}
                    key={`${i}-${j}`}
                    onClick={() => this.toggleItemAt(j)}
                    extendedCSS={itemCSS}
                  >
                  </StyledItem>
                ))}
              </ol>
            </StyledItemList>
          </StyledSection>
        ))}
      </StyledRoot>
    );
  }

  private isSectionSelectedAt(index: number): boolean {
    return (this.state.selectedSectionIndex === index);
  }

  private toggleSectionAt(index: number) {
    if (this.props.isTogglable && this.isSectionSelectedAt(index)) {
      this.deselectSectionAt(index);
    }
    else {
      this.selectSectionAt(index);
    }
  }

  private selectSectionAt(index: number) {
    if (this.isSectionSelectedAt(index)) return;

    this.setState({
      selectedSectionIndex: index,
      selectedItemIndex: -1,
    });
  }

  private deselectSectionAt(index: number) {
    if (!this.isSectionSelectedAt(index)) return;

    this.setState({
      selectedSectionIndex: -1,
      selectedItemIndex: -1,
    });
  }

  private isItemSelectedAt(index: number): boolean {
    return (this.state.selectedItemIndex === index);
  }

  private toggleItemAt(index: number) {
    if (this.props.isTogglable && this.isItemSelectedAt(index)) {
      this.deselectItemAt(index);
    }
    else {
      this.selectItemAt(index);
    }
  }

  private selectItemAt(index: number) {
    if (this.isItemSelectedAt(index)) return;

    this.setState({
      selectedItemIndex: index,
    });
  }

  private deselectItemAt(index: number) {
    if (!this.isItemSelectedAt(index)) return;

    this.setState({
      selectedItemIndex: -1,
    });
  }
}

const StyledItem = styled.button<ItemCSSProps & ExtendedCSSProps<ItemCSSProps>>`
  background: #fff;
  color: #000;
  height: ${props => props.height}px;
  overflow: hidden;
  padding: 0 10px;
  text-align: left;
  transition-duration: 100ms;
  transition-property: transform, opacity, background, color;
  transition-timing-function: ease-out;
  width: 100%;
  will-change: transform, opacity, background, color;

  &[disabled] {
    pointer-events: none;
  }

  ${props => props.extendedCSS(props)}
`;

const StyledItemList = styled.div<ItemListCSSProps & ExtendedCSSProps<ItemListCSSProps>>`
  -webkit-overflow-scrolling: touch;
  overflow-x: hidden;
  overflow-y: ${props => props.maxVisibleItems < 0 ? 'hidden' : (props.maxVisibleItems < props.numItems ? 'scroll' : 'hidden')};
  transition: height 100ms ease-out;
  width: 100%;
  will-change: height;

  ol {
    counter-reset: item-counter;
    list-style: none;
  }

  ${props => props.extendedCSS(props)}
`;

const StyledSectionHeader = styled.button<SectionHeaderCSSProps & ExtendedCSSProps<SectionHeaderCSSProps>>`
  align-items: center;
  background: #fff;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  height: 50px;
  justify-content: space-between;
  margin: 0;
  padding: 0 10px;
  transition-duration: 100ms;
  transition-property: transform, opacity, background, color;
  transition-timing-function: ease-out;
  width: 100%;
  will-change: transform, opacity, background, color;

  label {
    color: #000;
    transition-duration: 100ms;
    transition-property: color;
    transition-timing-function: ease-out;
    will-change: color;
  }

  span {
    box-sizing: border-box;
    display: block;
    fill: #000;
    height: 15px;
    transform-origin: center;
    transition-duration: 100ms;
    transition-property: transform;
    transition-timing-function: ease-out;
    width: 15px;
    will-change: transform;

    svg {
      width: 100%;
      height: 100%;
      fill: inherit;

      * {
        fill: inherit;
        transition-duration: 100ms;
        transition-property: fill;
        transition-timing-function: ease-out;
      }
    }
  }

  ${props => props.extendedCSS(props)}
`;

const StyledSection = styled.section<SectionCSSProps & ExtendedCSSProps<SectionCSSProps>>`
  box-sizing: border-box;
  display: block;
  margin: 0;
  padding: 0;
  width: 100%;
  ${props => props.extendedCSS(props)}
`;

const StyledRoot = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex: 0 0 auto;
  justify-content: flex-start;
  padding: 0;
  position: relative;
`;
