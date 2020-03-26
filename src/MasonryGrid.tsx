/**
 * @file This is a React component that aligns all of its immediate children in
 *       a masonry grid. Refrain from assigning CSS styles to it via `className`
 *       or `style` property, although they are handled if absolutely necessary.
 *       Customize the grid via its supported properties. The grid can be either
 *       vertical or horizontal orientation.
 */

import { DirtyInfo, DirtyType, EventType, Rect, UpdateDelegate, UpdateDelegator } from 'dirty-dom';
import React, { createRef, CSSProperties, PureComponent, ReactNode } from 'react';

interface Props {
  children?: ReactNode | Array<ReactNode>;
  className?: string;
  height?: string;
  horizontalSpacing: number;
  isReversed: boolean;
  orientation: 'horizontal' | 'vertical';
  sections: number;
  style?: CSSProperties;
  verticalSpacing: number;
  width?: string;
}

class MasonryGrid extends PureComponent<Props> implements UpdateDelegator {
  static defaultProps: Props = {
    horizontalSpacing: 0,
    isReversed: false,
    orientation: 'vertical',
    sections: 3,
    verticalSpacing: 0,
  };

  static BASE_MODIFIER_CLASS_PREFIX: string = 'mg-';

  private nodeRefs = {
    root: createRef<HTMLDivElement>(),
  };

  private updateDelegate?: UpdateDelegate = undefined;

  private maxHeight: number = NaN;

  private maxWidth: number = NaN;

  get width(): number {
    return Rect.from(this.nodeRefs.root.current)?.width ?? 0;
  }

  get height(): number {
    return Rect.from(this.nodeRefs.root.current)?.height ?? 0;
  }

  private get intrinsicStyle(): CSSProperties {
    return {
      boxSizing: 'border-box',
      display: 'block',
      height: this.props.height ?? (this.props.orientation === 'horizontal' ? '100%' : (isNaN(this.maxHeight) ? 'auto' : this.maxHeight)),
      position: 'relative',
      WebkitBoxSizing: 'border-box',
      width: this.props.width ?? (this.props.orientation === 'horizontal' ? (isNaN(this.maxWidth) ? 'auto' : this.maxWidth) : '100%'),
    };
  }

  componentDidMount() {
    this.reconfigureUpdateDelegate();
  }

  componentDidUpdate(prevProps: Props) {
    this.reconfigureUpdateDelegate();
  }

  componentWillUnmount() {
    this.updateDelegate?.deinit();
  }

  render() {
    return (
      <div ref={this.nodeRefs.root} className={this.props.className} style={{ ...this.intrinsicStyle, ...this.props.style ?? {} }}>
        {this.props.children}
      </div>
    );
  }

  update(info: DirtyInfo) {
    if (info[DirtyType.SIZE]) {
      this.repositionChildren();
    }
  }

  private reconfigureUpdateDelegate() {
    this.updateDelegate?.deinit();

    this.updateDelegate = new UpdateDelegate(this, {
      [EventType.RESIZE]: {
        target: this.nodeRefs.root.current,
      },
    });

    this.updateDelegate?.init();
  }

  /**
   * Repositions all the child elements of the grid.
   */
  private repositionChildren() {
    const rootNode = this.nodeRefs.root.current;

    if (!rootNode) return;

    const children = rootNode.children;

    const rect = Rect.from(rootNode) ?? new Rect();
    const computedStyle = window.getComputedStyle(rootNode);
    const pt = parseFloat(computedStyle.getPropertyValue('padding-top'));
    const pr = parseFloat(computedStyle.getPropertyValue('padding-right'));
    const pb = parseFloat(computedStyle.getPropertyValue('padding-bottom'));
    const pl = parseFloat(computedStyle.getPropertyValue('padding-left'));

    if (this.props.sections <= 0) throw new Error('You must specifiy a minimum of 1 section(s) (a.k.a. row(s) for horizontal orientation, columnª for vertical orientation) for a MasonryGrid instance');

    if (this.props.orientation === 'vertical') {
      let rowWidth = rect.width - pr - pl;

      if (rowWidth < 0) {
        // tslint:disable-next-line:no-console
        console.warn('Unexpected computed row width of less than zero, ensure that the width of root element of the MasonryGrid instance can be computed, or check that its paddings are valid');
        rowWidth = 0;
      }

      let colWidth = (rowWidth - this.props.horizontalSpacing * (this.props.sections - 1)) / this.props.sections;

      if (colWidth < 0) {
        // tslint:disable-next-line:no-console
        console.warn('Unexpected computed column width of less than zero, ensure that the `horizontalSpacing` property is valid');
        colWidth = 0;
      }

      const sectionHeights: Array<number> = [...new Array(this.props.sections)].map(() => 0);

      for (let i = 0; i < children.length; i++) {
        const child = children[i];

        if (!(child instanceof HTMLElement)) continue;

        const base = this.computeBaseFromElement(child);
        const [colIdx, y] = this.computeNextAvailableSectionAndLengthByBase(base, sectionHeights);

        child.style.position = 'absolute';
        child.style.width = `${(colWidth * base) + (this.props.horizontalSpacing * (base - 1))}px`;
        child.style.height = '';
        child.style.left = `${pl + colIdx * (colWidth + this.props.horizontalSpacing)}px`;
        child.style.top = `${pt + y + (y === 0 ? 0 : this.props.verticalSpacing)}px`;

        for (let j = 0; j < base; j++) {
          sectionHeights[colIdx + j] = y + (y === 0 ? 0 : this.props.verticalSpacing) + (Rect.from(child)?.height ?? 0);
        }
      }

      this.maxHeight = this.computeMaxLength(this.props.sections, sectionHeights);
      rootNode.style.height = `${this.maxHeight}px`;

      if (this.props.isReversed) {
        for (let i = 0; i < children.length; i++) {
          const child = children[i];

          if (!(child instanceof HTMLElement)) continue;

          const x = parseFloat(child.style.left);

          child.style.left = `${this.width - x - parseFloat(child.style.width)}px`;
        }
      }
    }
    else {
      let colHeight = rect.height - pb - pt;

      if (colHeight < 0) {
        // tslint:disable-next-line:no-console
        console.warn('Unexpected computed column height of less than zero, ensure that the height of root element of the MasonryGrid instance can be computed, or check that its paddings are valid');
        colHeight = 0;
      }

      let rowHeight = (colHeight - this.props.verticalSpacing * (this.props.sections - 1)) / this.props.sections;

      if (rowHeight < 0) {
        // tslint:disable-next-line:no-console
        console.warn('Unexpected computed row height of less than zero, ensure that the `verticalSpacing` property is valid');
        rowHeight = 0;
      }

      const sectionWidths: Array<number> = [...new Array(this.props.sections)].map(() => 0);

      for (let i = 0; i < children.length; i++) {
        const child = children[i];

        if (!(child instanceof HTMLElement)) continue;

        const base = this.computeBaseFromElement(child);
        const [rowIdx, x] = this.computeNextAvailableSectionAndLengthByBase(base, sectionWidths);

        child.style.position = 'absolute';
        child.style.width = '';
        child.style.height = `${(rowHeight * base) + (this.props.verticalSpacing * (base - 1))}px`;
        child.style.top = `${pl + rowIdx * (rowHeight + this.props.verticalSpacing)}px`;
        child.style.left = `${pt + x + (x === 0 ? 0 : this.props.horizontalSpacing)}px`;

        for (let j = 0; j < base; j++) {
          sectionWidths[rowIdx + j] = x + (x === 0 ? 0 : this.props.horizontalSpacing) + (Rect.from(child)?.width ?? 0);
        }
      }

      this.maxWidth = this.computeMaxLength(this.props.sections, sectionWidths);
      if (!isNaN(this.maxWidth)) rootNode.style.width = `${this.maxWidth}px`;

      if (this.props.isReversed) {
        for (let i = 0; i < children.length; i++) {
          const child = children[i];

          if (!(child instanceof HTMLElement)) continue;

          const y = parseFloat(child.style.top);

          child.style.top = `${this.height - y - parseFloat(child.style.height)}px`;
        }
      }
    }
  }

  /**
   * Computes the base value of an element from its classes.
   *
   * @param element - The HTML element.
   *
   * @returns The computed base value that is clamped between 1 and max number
   *          of sections.
   */
  private computeBaseFromElement(element: HTMLElement): number {
    const classList = element.classList;

    for (let i = 0; i < classList.length; i++) {
      const c = classList[i];

      if (c.startsWith(MasonryGrid.BASE_MODIFIER_CLASS_PREFIX)) {
        const base = parseFloat(c.replace(MasonryGrid.BASE_MODIFIER_CLASS_PREFIX, ''));
        if (!isNaN(base)) return Math.min(Math.max(base, 1), this.props.sections);
      }
    }

    return 1;
  }

  /**
   * Computes the index and current length of the next available section for a
   * specific base value, based on a provided array of existing section lengths.
   *
   * @param base - The base value of the item to be inserted into the grid, and
   *               to be used to evaluate the next available section.
   * @param currentSectionLengths - An array of the current section lengths.
   *
   * @returns An array consiting of the computed section index and its to-be
   *          length if a new item were to be placed in it.
   */
  private computeNextAvailableSectionAndLengthByBase(base: number, currentSectionLengths: Array<number>): [number, number] {
    if (currentSectionLengths.length !== this.props.sections) throw new Error('Unmatched number of provided section lengths');

    const numSections = currentSectionLengths.length;

    let sectionIdx = NaN;
    let minLength = Infinity;

    for (let i = 0; i < numSections; i++) {
      const length = currentSectionLengths[i];
      const isShorter = length < minLength;
      const isEligibleColumn = (i + base) <= numSections;
      let hasRoomInSubsequentSections = true;

      for (let j = 1; j < base; j++) {
        if (currentSectionLengths[i + j] > length) {
          hasRoomInSubsequentSections = false;
        }
      }

      if (isShorter && isEligibleColumn && hasRoomInSubsequentSections) {
        sectionIdx = i;
        minLength = length;
      }
    }

    if (isNaN(sectionIdx)) {
      return [0, this.computeMaxLength(base, currentSectionLengths)];
    }
    else {
      return [sectionIdx, minLength];
    }
  }

  /**
   * A helper function that computes the max section length of an array of
   * section lengths. Only the starting `base` sections are inspected.
   *
   * @param base - The base value to compute for
   * @param currentSectionLengths - An array of section lengths.
   *
   * @returns The max section length.
   */
  private computeMaxLength(base: number, currentSectionLengths: Array<number>): number {
    return currentSectionLengths.slice(0, base).reduce((out, curr, i) => {
      return (curr > out) ? curr : out;
    }, 0);
  }
}

export default MasonryGrid;
