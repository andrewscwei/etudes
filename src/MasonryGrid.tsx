/**
 * @file This is a React component that aligns all of its immediate children in
 *       a masonry grid. Refrain from assigning CSS styles to it via `className`
 *       or `style` property, although they are handled if absolutely necessary.
 *       Customize the grid via its supported properties. The grid can be either
 *       vertical or horizontal orientation.
 */

import { DirtyInfo, DirtyType, EventType, Rect, UpdateDelegate, UpdateDelegator } from 'dirty-dom';
import React, { createRef, CSSProperties, PureComponent, ReactNode } from 'react';
import styled from 'styled-components';

export interface Props {
  areSectionsAligned: boolean;
  children?: ReactNode | Array<ReactNode>;
  className?: string;
  height?: string;
  horizontalSpacing: number;
  isReversed: boolean;
  orientation: 'horizontal' | 'vertical';
  sections: number;
  style: CSSProperties;
  verticalSpacing: number;
  width?: string;
}

class MasonryGrid extends PureComponent<Props> implements UpdateDelegator {
  static defaultProps: Props = {
    areSectionsAligned: false,
    horizontalSpacing: 0,
    isReversed: false,
    orientation: 'vertical',
    sections: 3,
    style: {},
    verticalSpacing: 0,
  };

  static BASE_MODIFIER_CLASS_PREFIX: string = 'base-';

  private nodeRefs = {
    root: createRef<HTMLDivElement>(),
  };

  private maxLength: number = NaN;

  private updateDelegate?: UpdateDelegate = undefined;

  get width(): number {
    return Rect.from(this.nodeRefs.root.current)?.width ?? 0;
  }

  get height(): number {
    return Rect.from(this.nodeRefs.root.current)?.height ?? 0;
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
      <StyledRoot
        ref={this.nodeRefs.root}
        className={this.props.className}
        orientation={this.props.orientation}
        style={{
          ...this.props.style,
          height: this.props.height ?? ((this.props.orientation === 'vertical' && !isNaN(this.maxLength)) ? `${this.maxLength}px` : ''),
          width: this.props.width ?? ((this.props.orientation === 'horizontal' && !isNaN(this.maxLength)) ? `${this.maxLength}px` : ''),
          flex: '0 0 auto',
        }}
      >
        {this.props.children}
      </StyledRoot>
    );
  }

  update(info: DirtyInfo) {
    if (info[DirtyType.SIZE]) {
      this.repositionChildren();
    }
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

    if (this.props.sections <= 0) throw new Error('You must specifiy a minimum of 1 section(s) (a.k.a. row(s) for horizontal orientation, column(s) for vertical orientation) for a MasonryGrid instance');

    if (this.props.orientation === 'vertical') {
      const rowWidth = Math.max(0, rect.width - pr - pl);
      const colWidth = Math.max(0, (rowWidth - this.props.horizontalSpacing * (this.props.sections - 1)) / this.props.sections);
      const sectionHeights: Array<number> = [...new Array(this.props.sections)].map(() => 0);

      for (let i = 0; i < children.length; i++) {
        const child = children[i];

        if (!(child instanceof HTMLElement)) continue;

        const base = this.computeBaseFromElement(child);
        const [colIdx, y] = this.computeNextAvailableSectionAndLengthByBase(sectionHeights, base);

        child.style.position = 'absolute';
        child.style.width = `${(colWidth * base) + (this.props.horizontalSpacing * (base - 1))}px`;
        child.style.height = '';
        child.style.left = `${pl + colIdx * (colWidth + this.props.horizontalSpacing)}px`;
        child.style.top = `${pt + y + (y === 0 ? 0 : this.props.verticalSpacing)}px`;

        for (let j = 0; j < base; j++) {
          sectionHeights[colIdx + j] = y + (y === 0 ? 0 : this.props.verticalSpacing) + (Rect.from(child)?.height ?? 0);
        }

        if (this.props.areSectionsAligned && ((colIdx + base) === this.props.sections)) {
          const m = this.computeMaxLength(sectionHeights);

          for (let j = 0; j < this.props.sections; j++) {
            sectionHeights[j] = m;
          }
        }
      }

      this.maxLength = this.computeMaxLength(sectionHeights, this.props.sections);
      rootNode.style.height = `${this.maxLength}px`;

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
      const colHeight = Math.max(0, rect.height - pb - pt);
      const rowHeight = Math.max(0, (colHeight - this.props.verticalSpacing * (this.props.sections - 1)) / this.props.sections);
      const sectionWidths: Array<number> = [...new Array(this.props.sections)].map(() => 0);

      for (let i = 0; i < children.length; i++) {
        const child = children[i];

        if (!(child instanceof HTMLElement)) continue;

        const base = this.computeBaseFromElement(child);
        const [rowIdx, x] = this.computeNextAvailableSectionAndLengthByBase(sectionWidths, base);

        child.style.position = 'absolute';
        child.style.width = '';
        child.style.height = `${(rowHeight * base) + (this.props.verticalSpacing * (base - 1))}px`;
        child.style.top = `${pl + rowIdx * (rowHeight + this.props.verticalSpacing)}px`;
        child.style.left = `${pt + x + (x === 0 ? 0 : this.props.horizontalSpacing)}px`;

        for (let j = 0; j < base; j++) {
          sectionWidths[rowIdx + j] = x + (x === 0 ? 0 : this.props.horizontalSpacing) + (Rect.from(child)?.width ?? 0);
        }

        if (this.props.areSectionsAligned && ((rowIdx + base) === this.props.sections)) {
          const m = this.computeMaxLength(sectionWidths);

          for (let j = 0; j < this.props.sections; j++) {
            sectionWidths[j] = m;
          }
        }
      }

      this.maxLength = this.computeMaxLength(sectionWidths, this.props.sections);
      if (!isNaN(this.maxLength)) rootNode.style.width = `${this.maxLength}px`;

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
   * Computes the index and current length of the next available section for a
   * specific base value, based on a provided array of existing section lengths.
   *
   * @param currentSectionLengths - An array of the current section lengths.
   * @param base - The base value of the item to be inserted into the grid, and
   *               to be used to evaluate the next available section.
   *
   * @returns An array consiting of the computed section index and its to-be
   *          length if a new item were to be placed in it.
   */
  private computeNextAvailableSectionAndLengthByBase(currentSectionLengths: Array<number>, base: number): [number, number] {
    if (currentSectionLengths.length !== this.props.sections) throw new Error('Unmatched number of provided section lengths');

    const numSections = currentSectionLengths.length;

    let sectionIdx = NaN;
    let minLength = Infinity;

    for (let i = 0; i < numSections; i++) {
      const length = currentSectionLengths[i];
      const isShorter = length < minLength;
      const isEligibleSection = (i + base) <= numSections;
      let hasRoomInSubsequentSections = true;

      for (let j = 1; j < base; j++) {
        if (currentSectionLengths[i + j] > length) {
          hasRoomInSubsequentSections = false;
        }
      }

      if (isShorter && isEligibleSection && hasRoomInSubsequentSections) {
        sectionIdx = i;
        minLength = length;
      }
    }

    if (isNaN(sectionIdx)) {
      return [0, this.computeMaxLength(currentSectionLengths, base)];
    }
    else {
      return [sectionIdx, minLength];
    }
  }

  /**
   * A helper function that computes the max section length of an array of
   * section lengths. Only the first n = `base` sections are inspected.
   *
   * @param currentSectionLengths - An array of section lengths.
   * @param base - The number representing the first n sections to inspect.
   *               Any non-numerical values will be ignored and return value
   *               will be based on all sections. A `base` value will be clamped
   *               between 1 and the maximum length of the array of section
   *               lengths.
   *
   * @returns The max section length.
   */
  private computeMaxLength(currentSectionLengths: Array<number>, base?: number): number {
    let arr = currentSectionLengths;

    if (base !== undefined && base !== null && !isNaN(base)) {
      arr = arr.slice(0, Math.max(1, Math.min(base, currentSectionLengths.length)));
    }

    return arr.reduce((out, curr, i) => {
      return (curr > out) ? curr : out;
    }, 0);
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

  private reconfigureUpdateDelegate() {
    this.updateDelegate?.deinit();

    this.updateDelegate = new UpdateDelegate(this, {
      [EventType.RESIZE]: {
        target: this.nodeRefs.root.current,
      },
    });

    this.updateDelegate?.init();
  }
}

const StyledRoot = styled.div<{
  orientation: Props['orientation'];
}>`
  box-sizing: border-box;
  display: block;
  height: ${props => props.orientation === 'vertical' ? 'auto' : '100%'};
  position: relative;
  width: ${props => props.orientation === 'horizontal' ? 'auto' : '100%'};
`;

export default MasonryGrid;
