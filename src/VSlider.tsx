/**
 * @file A vertical slider component that divides the scroll gutter into two
 *       different elements—one that is above the knob and one that is below the
 *       knob. This allows for individual styling customizations. The width and
 *       height of the root element of this component is taken from the
 *       aggregated rect of both gutter parts. The dimension of knob itself does
 *       not impact that of the root element. In addition to the tranditional
 *       behavior of a scrollbar, this component allows you to provide
 *       breakpoints along the gutter so the knob can automatically snap to them
 *       (if feature is enabled) when dragging ends near the breakpoint
 *       positions. You can also supply a label to each breakpoint and have it
 *       display on the knob when the current position is close to the
 *       breakpoint.
 */

import { Rect } from 'dirty-dom';
import interact from 'interactjs';
import React, { createRef, CSSProperties, PureComponent } from 'react';
import styled, { css } from 'styled-components';
import { ExtendedCSSFunction, ExtendedCSSProps } from './types';

type KnobCSSProps = Readonly<{
  isAtBottom: boolean;
  isAtTop: boolean;
  isDragging: boolean;
  isReleasing: boolean;
}>;

type GutterCSSProps = Readonly<{}>;

type LabelCSSProps = Readonly<{
  knobHeight: number;
}>;

export interface BreakpointDescriptor {
  label?: string;
  position?: number;
}

export interface Props {
  /**
   * Class attribute of the root element.
   * @optional
   */
  className?: string;

  /**
   * Inline style attribute of the root element.
   * @optional
   */
  style: CSSProperties;

  /**
   * An array of breakpoint descriptors. A breakpoint is a point on the gutter
   * where the knob should snap to if dragging stops near that it. You can
   * associate a label with a breakpoint so it can be displayed in the knob.
   * If breakpoints are to be specified, ensure that there are at least two:
   * one for the start of the gutter and one for the end.
   * @optional
   */
  breakpoints?: ReadonlyArray<BreakpointDescriptor>;

  /**
   * The default index. This is ignored if breakpoints are not provided. On the
   * other hand, if breakpoints are provided, the default position will be
   * calculated based on this value, making `defaultPosition` irrelevant.
   * @optional
   */
  defaultIndex?: number;

  /**
   * The default position. This is ignored if `defaultIndex` and breakpoints are
   * provided.
   * @optional
   */
  defaultPosition: number;

  /**
   * Padding between the gutter and the knob in pixels.
   * @optional
   */
  gutterPadding: number;

  /**
   * Height of the knob in pixels.
   * @optional
   */
  knobHeight: number;

  /**
   * Width of the knob in pixels.
   * @optional
   */
  knobWidth: number;

  /**
   * Indicates whether the knob automatically snaps to the nearest breakpoint,
   * if breakpoints are provided.
   * @optional
   */
  autoSnap: boolean;

  /**
   * By default the position is a value from 0 - 1, 0 being the top of the
   * slider and 1 being the bottom. Switching on this flag inverts this
   * behavior, where 0 becomes the bottom of the slider and 1 the top.
   * @optional
   */
  isInverted: boolean;

  /**
   * Indicates if the breakpoint label is visible inside the knob. Note that
   * this is only applicable if breakpoints are provided.
   * @optional
   */
  isLabelVisible: boolean;

  /**
   * Indicates if position/index change events are dispatched when dragging
   * ends. When disabled, aforementioned events are fired repeatedly while
   * dragging.
   * @optional
   */
  onlyDispatchesOnDragEnd: boolean;

  /**
   * Handler invoked when dragging ends.
   * @optional
   */
  onDragEnd?: () => void;

  /**
   * Handler invoked when dragging begins.
   * @optional
   */
  onDragStart?: () => void;

  /**
   * Handler invoked when index changes. This happens simultaneously with
   * `onPositionChange`. Note that this is only invoked if breakpoints are
   * provided, because otherwise there will be no indexes.
   * @optional
   */
  onIndexChange?: (index: number) => void;

  /**
   * Handler invoked when position changes.
   * @optional
   */
  onPositionChange?: (position: number) => void;

  /**
   * Custom CSS provided to the top gutter.
   * @optional
   */
  topGutterCSS: ExtendedCSSFunction<GutterCSSProps>;

  /**
   * Custom CSS provided to the bottom gutter.
   * @optional
   */
  bottomGutterCSS: ExtendedCSSFunction<GutterCSSProps>;

  /**
   * Custom CSS provided to the knob.
   * @optional
   */
  knobCSS: ExtendedCSSFunction<KnobCSSProps>;

  /**
   * Custom CSS provided to the label inside the knob.
   * @optional
   */
  labelCSS: ExtendedCSSFunction<LabelCSSProps>;
}

interface State {
  isDragging: boolean;
  isReleasing: boolean;
  position: number;
}

export default class VSlider extends PureComponent<Props, State> {
  static defaultProps: Partial<Props> = {
    style: {},
    breakpoints: VSlider.breakpointsFactory(10, (index: number, position: number) => `${index}`),
    defaultPosition: 0,
    gutterPadding: 0,
    knobHeight: 30,
    knobWidth: 30,
    autoSnap: true,
    isInverted: false,
    isLabelVisible: true,
    onlyDispatchesOnDragEnd: false,
    bottomGutterCSS: props => css``,
    knobCSS: props => css``,
    labelCSS: props => css``,
    topGutterCSS: props => css``,
  };

  static breakpointsFactory(length: number, labelIterator?: (index: number, position: number) => string): ReadonlyArray<BreakpointDescriptor> {
    if (length <= 1) throw new Error('`length` value must be greater than or equal to 2');
    if (Math.round(length) !== length) throw new Error('`length` value must be an integer');

    const interval = 1 / (length - 1);

    return Array(length).fill(null).map((v, i) => {
      const pos = interval * i;

      return {
        label: labelIterator?.(i, pos) ?? undefined,
        position: pos,
      };
    });
  }

  nodeRefs = {
    root: createRef<HTMLDivElement>(),
    knob: createRef<HTMLDivElement>(),
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      isDragging: false,
      isReleasing: false,
      position: ((this.props.breakpoints !== undefined) && (this.props.defaultIndex !== undefined)) ? this.getPositionByIndex(this.props.defaultIndex) : this.props.defaultPosition,
    };
  }

  /**
   * Computed rect of the root element.
   */
  get rect(): Rect {
    return Rect.from(this.nodeRefs.root.current) ?? new Rect();
  }

  /**
   * Height of the top gutter in pixels.
   */
  get topGutterHeight(): number {
    const { isInverted, gutterPadding, knobHeight } = this.props;
    const { position } = this.state;
    return Math.max(0, (isInverted ? (1 - position) : position) * this.rect.height - (knobHeight / 2) - gutterPadding);
  }

  /**
   * Height of the bottom gutter in pixels.
   */
  get bottomGutterHeight(): number {
    const { isInverted, gutterPadding, knobHeight } = this.props;
    const { position } = this.state;
    return Math.max(0, (isInverted ? position : (1 - position)) * this.rect.height - (knobHeight / 2) - gutterPadding);
  }

  /**
   * Position of the knob ranging from 0 to 1, inclusive. If for whatever reason
   * the position cannot be computed, NaN is returned.
   */
  get knobPosition(): number {
    const { isInverted } = this.props;
    const { position } = this.state;
    const rootNode = this.nodeRefs.root.current;

    if (!rootNode) return NaN;

    const p = isInverted ? (1 - position) : position;

    return p * this.rect.height;
  }

  /**
   * Gets the index of the breakpoint of which the current position is closest
   * to. If for whatever reason the index cannot be computed (i.e. no
   * breakpoints were provided), -1 is returned.
   */
  get index(): number {
    const { breakpoints } = this.props;
    const { position } = this.state;

    if (!breakpoints) return -1;

    let idx = 0;
    let delta = NaN;

    for (let i = 0, n = breakpoints.length; i < n; i++) {
      const breakpoint = this.getPositionByIndex(i);
      const d = Math.abs(position - breakpoint);

      if (isNaN(delta) || (d < delta)) {
        delta = d;
        idx = i;
      }
    }

    return idx;
  }

  componentDidMount() {
    this.reconfigureInteractivityIfNeeded();

    if (this.props.breakpoints) {
      const index = this.index;

      if (this.props.autoSnap) {
        this.snapToClosestBreakpoint();
        this.props.onPositionChange?.(this.getPositionByIndex(index));
      }
      else {
        this.props.onPositionChange?.(this.state.position);
      }

      this.props.onIndexChange?.(index);
    }
    else {
      this.props.onPositionChange?.(this.state.position);
    }

    this.forceUpdate();
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    this.reconfigureInteractivityIfNeeded();

    if (prevState.position !== this.state.position) {
      if (!this.props.onlyDispatchesOnDragEnd && this.state.isDragging) {
        this.props.onPositionChange?.(this.state.position);
        if (this.props.breakpoints) this.props.onIndexChange?.(this.index);
      }
    }

    if (prevState.isDragging !== this.state.isDragging) {
      if (!this.state.isDragging) {
        this.props.onPositionChange?.(this.state.position);
        if (this.props.breakpoints) this.props.onIndexChange?.(this.index);
        this.props.onDragEnd?.();
      }
      else {
        this.props.onDragStart?.();
      }
    }
  }

  render() {
    const { className, breakpoints, knobHeight, knobWidth, isLabelVisible, isInverted, labelCSS, topGutterCSS, bottomGutterCSS, knobCSS, style } = this.props;
    const { isDragging, isReleasing, position } = this.state;

    return (
      <StyledRoot
        className={className}
        ref={this.nodeRefs.root}
        style={style}
      >
        <StyledGutter
          style={{ top: 0, height: `${this.topGutterHeight}px` }}
          extendedCSS={topGutterCSS}
        />
        <StyledKnob
          isAtBottom={isInverted ? (position === 0) : (position === 1)}
          isAtTop={isInverted ? (position === 1) : (position === 0)}
          isDragging={isDragging}
          isReleasing={isReleasing}
          ref={this.nodeRefs.knob}
          extendedCSS={knobCSS}
          style={{
            height: `${knobHeight}px`,
            margin: `${-knobHeight / 2 + this.knobPosition}px 0 0 ${(this.rect.width - knobWidth) / 2}px`,
            position: 'absolute',
            width: `${knobWidth}px`,
            zIndex: 1,
          }}
        >
          {breakpoints && isLabelVisible && (
            <StyledLabel
              knobHeight={knobHeight}
              extendedCSS={labelCSS}
            >
              {breakpoints[this.index].label ?? ''}
            </StyledLabel>
          )}
        </StyledKnob>
        <StyledGutter
          style={{ bottom: 0, height: `${this.bottomGutterHeight}px` }}
          extendedCSS={bottomGutterCSS}
        />

      </StyledRoot>
    );
  }

  /**
   * Gets the position by breakpoint index. This value ranges between 0 - 1,
   * inclusive.
   *
   * @param index - The breakpoint index.
   *
   * @returns The position. If for whatever reason the position cannot be
   *          determined, NaN is returned.
   */
  private getPositionByIndex(index: number): number {
    const { breakpoints } = this.props;
    if (!breakpoints) return NaN;
    return breakpoints[index].position ?? (index / (breakpoints.length - 1));
  }

  private reconfigureInteractivityIfNeeded() {
    const knobNode = this.nodeRefs.knob.current;

    if (knobNode) {
      if (!interact.isSet(knobNode)) {
        interact(knobNode).draggable({
          inertia: true,
          onstart: () => this.onKnobDragStart(),
          onmove: ({ dy }) => this.onKnobDragMove(dy),
          onend: () => this.onKnobDragStop(),
        });
      }
    }
  }

  private onKnobDragStart() {
    this.setState({
      isDragging: true,
      isReleasing: false,
    });
  }

  private onKnobDragMove(dy: number) {
    const { isInverted } = this.props;
    const { position } = this.state;
    const rect = this.rect;
    const p = isInverted ? (1 - position) : position;
    const y = p * rect.height + dy;
    const t = (Math.max(0, Math.min(1, y / rect.height)));

    this.setState({
      isDragging: true,
      isReleasing: false,
      position: isInverted ? (1 - t) : t,
    });
  }

  private onKnobDragStop() {
    this.setState({
      isDragging: false,
      isReleasing: true,
    });

    this.snapToClosestBreakpoint();
  }

  private snapToClosestBreakpoint() {
    if (!this.props.autoSnap || !this.props.breakpoints) return;

    const position = this.getPositionByIndex(this.index);

    this.setState({
      position,
    });
  }
}

const StyledGutter = styled.div<ExtendedCSSProps<GutterCSSProps>>`
  left: 0;
  right: 0;
  margin: 0 auto;
  position: absolute;
  width: 100%;
  background: #fff;
  ${props => props.extendedCSS(props)}
`;

const StyledLabel = styled.label<LabelCSSProps & ExtendedCSSProps<LabelCSSProps>>`
  font-size: ${props => props.knobHeight * .5}px;
  pointer-events: none;
  user-select: none;
  color: #000;
  ${props => props.extendedCSS(props)}
`;

const StyledKnob = styled.div<KnobCSSProps & ExtendedCSSProps<KnobCSSProps>>`
  align-items: center;
  background: #fff;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  opacity: ${props => props.isDragging ? .6 : 1};
  touch-action: none;
  transition-duration: 100ms;
  transition-property: ${props => props.isReleasing ? 'background, color, opacity, margin, transform' : 'background, color, transform, opacity'};
  will-change: background, color, opacity, margin, transform;
  transition-timing-function: ease-out;
  ${props => props.extendedCSS(props)}
`;

const StyledRoot = styled.div`
  box-sizing: border-box;
  display: block;
  height: 300px;
  position: relative;
  width: 4px;
`;
