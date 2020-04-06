import { Rect } from 'dirty-dom';
import interact from 'interactjs';
import React, { createRef, CSSProperties, PureComponent } from 'react';
import styled, { css } from 'styled-components';
import { ExtendedCSSFunction, ExtendedCSSProps, Orientation, Range } from './types';

type KnobCSSProps = Readonly<{
  radius: number;
  tintColor: string;
  hitboxPadding: number;
  isDragging: boolean;
  isReleasing: boolean;
  isDisabled: boolean;
}>;

type GutterCSSProps = Readonly<{
}>;

type LabelCSSProps = Readonly<{
  knobRadius: number;
  orientation: Orientation;
  isDragging: boolean;
  isReleasing: boolean;
}>;

type HighlightCSSProps = Readonly<{
  tintColor: string;
  isDragging: boolean;
  isReleasing: boolean;
}>;

interface Props {
  className?: string;
  style: CSSProperties;
  defaultRange?: Range;
  areLabelsVisible: boolean;
  decimalPlaces: number;
  hitboxPadding: number;
  knobRadius: number;
  max: number;
  min: number;
  steps: number;
  orientation: Orientation;
  tintColor: string;
  onRangeChange: (range: Range) => void;
  knobCSS: ExtendedCSSFunction<KnobCSSProps>;
  highlightCSS: ExtendedCSSFunction<HighlightCSSProps>;
  labelCSS: ExtendedCSSFunction<LabelCSSProps>;
  gutterCSS: ExtendedCSSFunction;
}

interface State {
  range: Range;
  isDraggingStartingKnob: boolean;
  isReleasingStartingKnob: boolean;
  isDraggingEndingKnob: boolean;
  isReleasingEndingKnob: boolean;
}

export default class RangeSlider extends PureComponent<Props, State> {
  static defaultProps = {
    style: {},
    areLabelsVisible: true,
    decimalPlaces: 2,
    hitboxPadding: 20,
    knobRadius: 10,
    steps: -1,
    tintColor: '#fff',
    orientation: 'vertical',
    onRangeChange: () => {},
    gutterCSS: () => css``,
    highlightCSS: () => css``,
    knobCSS: () => css``,
    labelCSS: () => css``,
  };

  nodeRefs = {
    root: createRef<HTMLDivElement>(),
    knobA: createRef<HTMLDivElement>(),
    knobB: createRef<HTMLDivElement>(),
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      range: props.defaultRange ?? [props.min, props.max],
      isDraggingStartingKnob: false,
      isReleasingStartingKnob: false,
      isDraggingEndingKnob: false,
      isReleasingEndingKnob: false,
    };
  }

  get rect(): Rect {
    return Rect.from(this.nodeRefs.root.current) ?? new Rect();
  }

  get highlightLength(): number {
    const [valA, valB] = this.state.range;
    const a = this.getDisplacementByValue(valA);
    const b = this.getDisplacementByValue(valB);
    return (b - a);
  }

  get breakpoints(): ReadonlyArray<number> {
    const { min, max, steps } = this.props;
    const breakpoints = [min];

    for (let i = 0; i < steps; i++) {
      breakpoints.push(min + (i + 1) * (max - min) / (1 + steps));
    }

    breakpoints.push(max);

    return breakpoints;
  }

  componentDidMount() {
    this.reconfigureInteractivityIfNeeded();

    if (this.props.steps < 0) {
      this.props.onRangeChange(this.state.range);
    }
    else {
      this.snapToClosestBreakpoint();
    }

    this.forceUpdate();
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (!this.areRangesEqual(prevState.range, this.state.range)) {
      this.props.onRangeChange(this.state.range);
    }

    if (prevProps.orientation !== this.props.orientation) {
      this.forceUpdate();
    }

    this.reconfigureInteractivityIfNeeded();
  }

  render() {
    return (
      <StyledRoot
        className={this.props.className}
        orientation={this.props.orientation}
        ref={this.nodeRefs.root}
        style={this.props.style}
      >
        <StyledGutter
          extendedCSS={this.props.gutterCSS}
        />
        <StyledKnob
          ref={this.nodeRefs.knobA}
          radius={this.props.knobRadius}
          tintColor={this.props.tintColor}
          hitboxPadding={this.props.hitboxPadding}
          isDragging={this.state.isDraggingStartingKnob}
          isReleasing={this.state.isReleasingStartingKnob}
          isDisabled={(this.state.range[1] === this.props.min) && (this.state.range[0] === this.props.min)}
          style={this.props.orientation === 'horizontal' ? {
            marginLeft: `${this.getDisplacementByValue(this.state.range[0])}px`,
          } : {
            marginTop: `${this.getDisplacementByValue(this.state.range[0])}px`,
          }}
          extendedCSS={this.props.knobCSS}
        />
        {this.props.areLabelsVisible && (
          <StyledLabel
            knobRadius={this.props.knobRadius}
            orientation={this.props.orientation}
            isDragging={this.state.isDraggingStartingKnob}
            isReleasing={this.state.isReleasingStartingKnob}
            style={this.props.orientation === 'horizontal' ? {
              transform: `translate3d(calc(-50% + ${this.getDisplacementByValue(this.state.range[0])}px), 0, 0)`,
            } : {
              transform: `translate3d(0, calc(-50% + ${this.getDisplacementByValue(this.state.range[0])}px), 0)`,
            }}
            extendedCSS={this.props.labelCSS}
          >
            {Number(this.state.range[0].toFixed(this.props.decimalPlaces)).toLocaleString()}
          </StyledLabel>
        )}
        <StyledHighlight
          tintColor={this.props.tintColor}
          isDragging={this.state.isDraggingStartingKnob || this.state.isDraggingEndingKnob}
          isReleasing={this.state.isReleasingStartingKnob || this.state.isReleasingEndingKnob}
          style={this.props.orientation === 'horizontal' ? {
            width: `${this.highlightLength}px`,
            transform: `translate3d(${this.getDisplacementByValue(this.state.range[0])}px, 0, 0)`,
          } : {
            height: `${this.highlightLength}px`,
            transform: `translate3d(0, ${this.getDisplacementByValue(this.state.range[0])}px, 0)`,
          }}
          extendedCSS={this.props.highlightCSS}
        />
        <StyledKnob
          ref={this.nodeRefs.knobB}
          radius={this.props.knobRadius}
          tintColor={this.props.tintColor}
          hitboxPadding={this.props.hitboxPadding}
          isDragging={this.state.isDraggingEndingKnob}
          isReleasing={this.state.isReleasingEndingKnob}
          isDisabled={(this.state.range[1] === this.props.max) && (this.state.range[0] === this.props.max)}
          style={this.props.orientation === 'horizontal' ? {
            marginLeft: `${this.getDisplacementByValue(this.state.range[1])}px`,
          } : {
            marginTop: `${this.getDisplacementByValue(this.state.range[1])}px`,
          }}
          extendedCSS={this.props.knobCSS}
        />
        {this.props.areLabelsVisible && (
          <StyledLabel
            knobRadius={this.props.knobRadius}
            orientation={this.props.orientation}
            isDragging={this.state.isDraggingStartingKnob || this.state.isDraggingEndingKnob}
            isReleasing={this.state.isReleasingStartingKnob || this.state.isReleasingEndingKnob}
            style={this.props.orientation === 'horizontal' ? {
              transform: `translate3d(calc(-50% + ${this.getDisplacementByValue(this.state.range[1])}px), 0, 0)`,
            } : {
              transform: `translate3d(0, calc(-50% + ${this.getDisplacementByValue(this.state.range[1])}px), 0)`,
            }}
            extendedCSS={this.props.labelCSS}
          >
            {Number(this.state.range[1].toFixed(this.props.decimalPlaces)).toLocaleString()}
          </StyledLabel>
        )}
      </StyledRoot>
    );
  }

  private reconfigureInteractivityIfNeeded() {
    const knobANode = this.nodeRefs.knobA.current;
    const knobBNode = this.nodeRefs.knobB.current;

    if (knobANode && !interact.isSet(knobANode)) {
      interact(knobANode).draggable({
        inertia: true,
        onstart: () => this.onKnobADragStart(),
        onmove: ({ dx, dy }) => this.onKnobADragMove(this.props.orientation === 'horizontal' ? dx : dy),
        onend: () => this.onKnobADragEnd(),
      });
    }

    if (knobBNode && !interact.isSet(knobBNode)) {
      interact(knobBNode).draggable({
        inertia: true,
        onstart: () => this.onKnobBDragStart(),
        onmove: ({ dx, dy }) => this.onKnobBDragMove(this.props.orientation === 'horizontal' ? dx : dy),
        onend: () => this.onKnobBDragEnd(),
      });
    }
  }

  private snapToClosestBreakpoint() {
    if (this.props.steps < 0) return;

    this.setState({
      range: [this.getClosestSteppedValueOfValue(this.state.range[0]), this.getClosestSteppedValueOfValue(this.state.range[1])],
    });
  }

  private areRangesEqual(range1: Range, range2: Range): boolean {
    if (!range1) return false;
    if (!range2) return false;
    if (range1[0] !== range2[0]) return false;
    if (range1[1] !== range2[1]) return false;
    return true;
  }

  private getPositionByValue(value: number): number {
    const { min, max } = this.props;
    return (value - min) / (max - min);
  }

  private getDisplacementByPosition(position: number): number {
    if (this.props.orientation === 'horizontal') {
      return position * this.rect.width;
    }
    else {
      return position * this.rect.height;
    }
  }

  private getDisplacementByValue(value: number): number {
    const position = this.getPositionByValue(value);
    return this.getDisplacementByPosition(position);
  }

  private getPositionByDisplacement(displacement: number): number {
    if (this.props.orientation === 'horizontal') {
      return displacement / this.rect.width;
    }
    else {
      return displacement / this.rect.height;
    }
  }

  private getValueByPosition(position: number): number {
    const { min, max } = this.props;
    return (position * (max - min)) + min;
  }

  private getClosestSteppedValueOfValue(value: number): number {
    const breakpoints = this.breakpoints;
    const n = breakpoints.length;
    let idx = 0;
    let diff = Infinity;

    for (let i = 0; i < n; i++) {
      const t = breakpoints[i];
      const d = Math.abs(value - t);

      if (d < diff) {
        diff = d;
        idx = i;
      }
    }

    return breakpoints[idx];
  }

  private onKnobADragStart() {
    this.setState({
      isDraggingStartingKnob: true,
      isReleasingStartingKnob: false,
      isDraggingEndingKnob: false,
      isReleasingEndingKnob: false,
    });
  }

  private onKnobADragEnd() {
    this.setState({
      isDraggingStartingKnob: false,
      isReleasingStartingKnob: true,
      isDraggingEndingKnob: false,
      isReleasingEndingKnob: false,
    });

    this.snapToClosestBreakpoint();
  }

  private onKnobADragMove(delta: number) {
    const [valA, valB] = this.state.range;
    const min = this.getDisplacementByValue(this.props.min);
    const max = this.getDisplacementByValue(valB);
    const curr = this.getDisplacementByValue(valA);
    const next = Math.max(min, Math.min(max, curr + delta));
    const nextPos = this.getPositionByDisplacement(next);
    const nextVal = this.getValueByPosition(nextPos);

    this.setState({
      isDraggingStartingKnob: true,
      isReleasingStartingKnob: false,
      isDraggingEndingKnob: false,
      isReleasingEndingKnob: false,
      range: [nextVal, valB],
    });
  }

  private onKnobBDragStart() {
    this.setState({
      isDraggingStartingKnob: false,
      isReleasingStartingKnob: false,
      isDraggingEndingKnob: true,
      isReleasingEndingKnob: false,
    });
  }

  private onKnobBDragEnd() {
    this.setState({
      isDraggingStartingKnob: false,
      isReleasingStartingKnob: false,
      isDraggingEndingKnob: false,
      isReleasingEndingKnob: true,
    });

    this.snapToClosestBreakpoint();
  }

  private onKnobBDragMove(delta: number) {
    const [valA, valB] = this.state.range;
    const min = this.getDisplacementByValue(valA);
    const max = this.getDisplacementByValue(this.props.max);
    const curr = this.getDisplacementByValue(valB);
    const next = Math.max(min, Math.min(max, curr + delta));
    const nextPos = this.getPositionByDisplacement(next);
    const nextVal = this.getValueByPosition(nextPos);

    this.setState({
      isDraggingStartingKnob: false,
      isReleasingStartingKnob: false,
      isDraggingEndingKnob: true,
      isReleasingEndingKnob: false,
      range: [valA, nextVal],
    });
  }
}

const StyledHighlight = styled.div<HighlightCSSProps & ExtendedCSSProps<HighlightCSSProps>>`
  top: 0;
  left: 0;
  position: absolute;
  height: 100%;
  width: 100%;
  background: ${props => props.tintColor};
  transition-property: ${props => props.isReleasing ? 'opacity, width, transform' : 'opacity'};
  transition-duration: 100ms;
  transition-timing-function: ease-out;
  will-change: opacity, width, transform;
  ${props => props.extendedCSS(props)}
`;

const StyledLabel = styled.span<LabelCSSProps & ExtendedCSSProps<LabelCSSProps>>`
  background: transparent;
  color: #fff;
  left: ${props => props.orientation === 'horizontal' ? '0' : `${props.knobRadius}px`};
  padding: 10px;
  pointer-events: none;
  position: absolute;
  text-align: center;
  top: ${props => props.orientation === 'horizontal' ? `${props.knobRadius}px` : '0'};
  transition-duration: 100ms;
  transition-property: ${props => props.isReleasing ? 'opacity, transform' : 'opacity'};
  transition-timing-function: ease-out;
  user-select: none;
  will-change: opacity, transform;
  ${props => props.extendedCSS(props)}
`;

const StyledKnob = styled.div<KnobCSSProps & ExtendedCSSProps<KnobCSSProps>>`
  background: transparent;
  box-sizing: border-box;
  display: block;
  height: ${props => (props.radius + props.hitboxPadding) * 2}px;
  left: ${props => -props.radius - props.hitboxPadding}px;
  padding: ${props => props.hitboxPadding}px;
  pointer-events: ${props => props.isDisabled ? 'none' : 'auto'};
  position: absolute;
  top: ${props => -props.radius - props.hitboxPadding}px;
  transition-duration: 100ms;
  transition-property: ${props => props.isReleasing ? 'background, opacity, margin, transform' : 'background, opacity, transform'};
  transition-timing-function: ease-out;
  width: ${props => (props.radius + props.hitboxPadding) * 2}px;
  will-change: opacity, transform, margin, background;
  z-index: 1;

  &::after {
    content: '';
    border-radius: 100%;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    margin: auto;
    position: absolute;
    width: ${props => props.radius * 2}px;
    height: ${props => props.radius * 2}px;
    background: ${props => props.tintColor};
  }

  ${props => props.extendedCSS(props)}
`;

const StyledGutter = styled.div<GutterCSSProps & ExtendedCSSProps<GutterCSSProps>>`
  display: block;
  top: 0;
  left: 0;
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, .2);
  ${props => props.extendedCSS(props)}
`;

const StyledRoot = styled.div<{
  orientation: Orientation;
}>`
  display: flex;
  flex: 0 0 auto;
  height: ${props => props.orientation === 'horizontal' ? '2px' : '300px'};
  position: relative;
  width: ${props => props.orientation === 'horizontal' ? '300px' : '2px'};
`;
