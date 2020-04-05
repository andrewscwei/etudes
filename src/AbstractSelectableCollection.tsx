import React, { CSSProperties, Fragment, PureComponent } from 'react';

const debug = process.env.NODE_ENV === 'development' ? require('debug')('etudes:asc') : () => {};

export interface Props {
  /**
   * Class attribute of the root element.
   */
  className?: string;

  /**
   * Inline style attribute of the root element.
   */
  style?: CSSProperties;

  /**
   * Indicates whether selections can be toggled. For example, in the case of
   * a vertical list of selectable rows, being able to toggle a row means it
   * gets deselected when selected again. Being unable to toggle the row means
   * it does not get deselected when selected again.
   */
  isTogglable?: boolean;

  /**
   * Indicates whether selections are retained. For example, in the case of
   * a vertical list of clickable rows, being able to retain a selection means
   * when the row is clicked, it becomes and stays selected. Being unable to
   * retain a selection means when the row is clicked, it does not become
   * selected. It is simply clicked and the subsequent event is dispatched.
   */
  shouldStaySelected?: boolean;

  /**
   * The default selected index. Any value below 0 indicates that nothing is
   * selected.
   */
  defaultSelectedIndex?: number;

  /**
   * Handler invoked when an index is deselected.
   */
  onDeselectAt?: (index: number) => void;

  /**
   * Handler invoked when an index is selected.
   */
  onSelectAt?: (index: number) => void;
}

export interface State {
  /**
   * The current selected index. Any value less than 0 indicates that no index
   * is selected.
   */
  selectedIndex?: number;
}

/**
 * An abstract component that mimics and handles index selection in an abstract
 * collection.
 */
export default class AbstractSelectableCollection<P extends Props = Props, S extends State = State> extends PureComponent<P, S> {
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

  render() {
    return <Fragment/>;
  }

  /**
   * Checks if an index is out of range.
   *
   * @param index - The index to check.
   *
   * @returns `true` if the index is out of range, `false` otherwise.
   */
  isIndexOutOfRange(index: number): boolean {
    if (index < 0) return true;
    return false;
  }

  /**
   * Checks if an index is selected.
   *
   * @param index - The index to check.
   *
   * @returns `true` if the index is selected, `false` otherwise.
   */
  isSelectedAt(index: number): boolean {
    return (this.state.selectedIndex === index);
  }

  /**
   * Toggles an index, i.e. reverses its selected state.
   *
   * @param index - The index to toggle.
   */
  toggleAt(index: number) {
    if (this.props.isTogglable === true && this.isSelectedAt(index)) {
      this.deselectAt(index);
    }
    else {
      this.selectAt(index);
    }
  }

  /**
   * Selects an index.
   *
   * @param index - The index to select.
   */
  selectAt(index: number) {
    if (this.props.shouldStaySelected === true) {
      if (this.isSelectedAt(index)) return;
      this.setState({ selectedIndex: index });
    }
    else if (this.props.onSelectAt) {
      this.props.onSelectAt(index);
    }
  }

  /**
   * Deselects an index if it is currently selected.
   *
   * @param index - The index to deselect.
   */
  deselectAt(index: number) {
    if (!this.isSelectedAt(index)) return;
    this.setState({ selectedIndex: -1 });
  }

  /**
   * Deselects the currently selected index.
   */
  deselectCurrent() {
    this.setState({ selectedIndex: -1 });
  }
}
