import React, { CSSProperties, Fragment, PureComponent } from 'react';

const debug = process.env.NODE_ENV === 'development' ? require('debug')('etudes:asc') : () => {};

export interface Props {
  className?: string;
  style?: CSSProperties;
  isTogglable?: boolean;
  shouldStaySelected?: boolean;
  defaultSelectedIndex?: number;
  onDeselectAt?: (index: number) => void;
  onSelectAt?: (index: number) => void;
}

export interface State {
  selectedIndex?: number;
}

export default class AbstractSelectableCollection<P extends Props = Props, S extends State = State> extends PureComponent<P, S> {
  constructor(props: P) {
    super(props);

    const initialState: State = {
      selectedIndex: -1,
    };

    this.state = initialState as S;
  }

  componentDidMount() {
    if (this.state.selectedIndex > -1) {
      this.props.onSelectAt?.(this.state.selectedIndex ?? -1);
    }
  }

  componentDidUpdate(prevProps: P, prevState: S) {
    const { shouldStaySelected, onSelectAt, onDeselectAt } = this.props;
    const prevSelectedIndex = prevState.selectedIndex ?? -1;
    const selectedIndex = this.state.selectedIndex ?? -1;

    if (prevState.selectedIndex !== selectedIndex) {
      debug(`Selected index changed: ${selectedIndex}`);

      if (shouldStaySelected === true) {
        if (!this.isIndexOutOfRange(prevSelectedIndex)) onDeselectAt?.(prevSelectedIndex);
        if (!this.isIndexOutOfRange(selectedIndex)) onSelectAt?.(selectedIndex);
      }
    }
  }

  isIndexOutOfRange(index: number): boolean {
    if (index < 0) return true;
    return false;
  }

  isSelectedAt(index: number): boolean {
    return (this.state.selectedIndex === index);
  }

  toggleAt(index: number) {
    if (this.props.isTogglable === true && this.isSelectedAt(index)) {
      this.deselectAt(index);
    }
    else {
      this.selectAt(index);
    }
  }

  selectAt(index: number) {
    if (this.props.shouldStaySelected === true) {
      if (this.isSelectedAt(index)) return;
      this.setState({ selectedIndex: index });
    }
    else if (this.props.onSelectAt) {
      this.props.onSelectAt(index);
    }
  }

  deselectAt(index: number) {
    if (!this.isSelectedAt(index)) return;
    this.setState({ selectedIndex: -1 });
  }

  deselectAll() {
    this.setState({ selectedIndex: -1 });
  }

  render() {
    return <Fragment/>;
  }
}
