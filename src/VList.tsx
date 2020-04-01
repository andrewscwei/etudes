import React, { ComponentType, CSSProperties, PureComponent } from 'react';
import styled from 'styled-components';

const debug = process.env.NODE_ENV === 'development' ? require('debug')('etudes:vlist') : () => {};

export interface RowProps<T> {
  data: T;
  isSelected: boolean;
  onClick: () => void;
}

interface Props<T> {
  className?: string;
  data: Array<T>;
  defaultSelectedIndex: number;
  isTogglable: boolean;
  onRowDeselectAt: (index: number) => void;
  onRowSelectAt: (index: number) => void;
  padding: number;
  rowComponentClass: ComponentType<RowProps<T>>;
  scrollbarPadding: number;
  shouldStaySelected: boolean;
  style: CSSProperties;
}

interface State {
  selectedIndex: number;
}

export default class VList<T> extends PureComponent<Props<T>, State> {
  static defaultProps: Partial<Props<any>> = {
    data: [],
    defaultSelectedIndex: -1,
    isTogglable: false,
    onRowDeselectAt: () => {},
    onRowSelectAt: () => {},
    padding: 12,
    scrollbarPadding: 30,
    shouldStaySelected: false,
    style: {},
  };

  constructor(props: Props<T>) {
    super(props);

    this.state = {
      selectedIndex: props.defaultSelectedIndex,
    };
  }

  componentDidMount() {
    if (this.state.selectedIndex > -1) {
      this.props.onRowSelectAt?.(this.state.selectedIndex);
    }
  }

  componentDidUpdate(prevProps: Props<T>, prevState: State) {
    const { shouldStaySelected, onRowSelectAt, onRowDeselectAt } = this.props;
    const { selectedIndex } = this.state;

    if (prevState.selectedIndex !== selectedIndex) {
      debug(`Selected index changed: ${selectedIndex}`);

      if (shouldStaySelected) {
        if (!this.isOutOfRange(prevState.selectedIndex)) onRowDeselectAt?.(prevState.selectedIndex);
        if (!this.isOutOfRange(selectedIndex)) onRowSelectAt?.(selectedIndex);
      }
    }
  }

  isOutOfRange = (idx: number) => {
    if (idx < 0) return true;
    if (idx >= this.props.data.length) return true;
    return false;
  }

  isRowSelectedAt = (idx: number) => {
    return (this.state.selectedIndex === idx);
  }

  toggleRowAt = (idx: number) => {
    if (this.props.isTogglable && this.isRowSelectedAt(idx)) {
      this.deselectRowAt(idx);
    }
    else {
      this.selectRowAt(idx);
    }
  }

  selectRowAt = (idx: number) => {
    if (this.props.shouldStaySelected) {
      if (this.isRowSelectedAt(idx)) return;
      this.setState({ selectedIndex: idx });
    }
    else if (this.props.onRowSelectAt) {
      this.props.onRowSelectAt(idx);
    }
  }

  deselectRowAt = (idx: number) => {
    if (!this.isRowSelectedAt(idx)) return;
    this.setState({ selectedIndex: -1 });
  }

  deselectAllRows = () => {
    this.setState({ selectedIndex: -1 });
  }

  render() {
    const RowComponentClass = this.props.rowComponentClass;

    return (
      <StyledRoot
        className={this.props.className}
        padding={this.props.padding}
        scrollbarPadding={this.props.scrollbarPadding}
        style={this.props.style}
      >
        {this.props.data.map((t, i) => (
          <RowComponentClass
            key={`row-${i}`}
            data={t}
            isSelected={this.isRowSelectedAt(i)}
            onClick={() => this.toggleRowAt(i)}
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
