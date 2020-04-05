import { Rect } from 'dirty-dom';
import interact from 'interactjs';
import React, { createRef, CSSProperties, PureComponent } from 'react';
import styled, { css } from 'styled-components';
import { ExtendedCSSFunction, ExtendedCSSProps, Range } from './types';

type KnobCSSProps = Readonly<{
  radius: number;
  tintColor: string;
  hitboxPadding: number;
  isDragging: boolean;
  isReleasing: boolean;
  isDisabled: boolean;
}>;

type LabelCSSProps = Readonly<{
  knobRadius: number;
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
  tintColor: string;
  onRangeChange: (range: Range) => void;
  knobCSS: ExtendedCSSFunction<KnobCSSProps>;
  highlightCSS: ExtendedCSSFunction<HighlightCSSProps>;
  labelCSS: ExtendedCSSFunction<LabelCSSProps>;
  gutterCSS: ExtendedCSSFunction;
}

interface State {
  range: Range;
  isDraggingLeftKnob: boolean;
  isReleasingLeftKnob: boolean;
  isDraggingRightKnob: boolean;
  isReleasingRightKnob: boolean;
}

export default class HRangeSlider extends PureComponent<Props, State> {
  static defaultProps = {
    style: {},
    areLabelsVisible: true,
    decimalPlaces: 2,
    hitboxPadding: 20,
    knobRadius: 10,
    steps: -1,
    tintColor: '#fff',
    onRangeChange: () => {},
    gutterCSS: () => css``,
    highlightCSS: () => css``,
    knobCSS: () => css``,
    labelCSS: () => css``,
  };

  nodeRefs = {
    root: createRef<HTMLDivElement>(),
    lknob: createRef<HTMLDivElement>(),
    rknob: createRef<HTMLDivElement>(),
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      range: props.defaultRange ?? [props.min, props.max],
      isDraggingLeftKnob: false,
      isReleasingLeftKnob: false,
      isDraggingRightKnob: false,
      isReleasingRightKnob: false,
    };
  }

  get width(): number {
    return Rect.from(this.nodeRefs.root.current)?.width ?? 0;
  }

  get highlightWidth(): number {
    const [lval, rval] = this.state.range;
    const ldx = this.getDisplacementByValue(lval);
    const rdx = this.getDisplacementByValue(rval);
    return (rdx - ldx);
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
  }

  render() {
    return (
      <StyledRoot
        className={this.props.className}
        ref={this.nodeRefs.root}
        style={this.props.style}
      >
        <StyledGutter extendedCSS={this.props.gutterCSS}/>
        <StyledKnob
          ref={this.nodeRefs.lknob}
          radius={this.props.knobRadius}
          tintColor={this.props.tintColor}
          hitboxPadding={this.props.hitboxPadding}
          isDragging={this.state.isDraggingLeftKnob}
          isReleasing={this.state.isReleasingLeftKnob}
          isDisabled={(this.state.range[1] === this.props.min) && (this.state.range[0] === this.props.min)}
          style={{
            marginLeft: `${this.getDisplacementByValue(this.state.range[0])}px`,
          }}
          extendedCSS={this.props.knobCSS}
        />
        {this.props.areLabelsVisible && (
          <StyledLabel
            knobRadius={this.props.knobRadius}
            isDragging={this.state.isDraggingLeftKnob}
            isReleasing={this.state.isReleasingLeftKnob}
            style={{
              transform: `translate3d(calc(-50% + ${this.getDisplacementByValue(this.state.range[0])}px), 0, 0)`,
            }}
            extendedCSS={this.props.labelCSS}
          >
            {Number(this.state.range[0].toFixed(this.props.decimalPlaces)).toLocaleString()}
          </StyledLabel>
        )}
        <StyledHighlight
          tintColor={this.props.tintColor}
          isDragging={this.state.isDraggingLeftKnob || this.state.isDraggingRightKnob}
          isReleasing={this.state.isReleasingLeftKnob || this.state.isReleasingRightKnob}
          style={{
            width: `${this.highlightWidth}px`,
            transform: `translate3d(${this.getDisplacementByValue(this.state.range[0])}px, 0, 0)`,
          }}
          extendedCSS={this.props.highlightCSS}
        />
        <StyledKnob
          ref={this.nodeRefs.rknob}
          radius={this.props.knobRadius}
          tintColor={this.props.tintColor}
          hitboxPadding={this.props.hitboxPadding}
          isDragging={this.state.isDraggingRightKnob}
          isReleasing={this.state.isReleasingRightKnob}
          isDisabled={(this.state.range[1] === this.props.max) && (this.state.range[0] === this.props.max)}
          style={{
            marginLeft: `${this.getDisplacementByValue(this.state.range[1])}`,
          }}
          extendedCSS={this.props.knobCSS}
        />
        {this.props.areLabelsVisible && (
          <StyledLabel
            knobRadius={this.props.knobRadius}
            isDragging={this.state.isDraggingLeftKnob || this.state.isDraggingRightKnob}
            isReleasing={this.state.isReleasingLeftKnob || this.state.isReleasingRightKnob}
            style={{
              transform: `translate3d(calc(-50% + ${this.getDisplacementByValue(this.state.range[1])}px), 0, 0)`,
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
    const lknobNode = this.nodeRefs.lknob.current;
    const rknobNode = this.nodeRefs.rknob.current;

    if (lknobNode && !interact.isSet(lknobNode)) {
      interact(lknobNode).draggable({
        inertia: true,
        onstart: () => this.onLKnobDragStart(),
        onmove: event => this.onLKnobDragMove(event.dx),
        onend: () => this.onLKnobDragEnd(),
      });
    }

    if (rknobNode && !interact.isSet(rknobNode)) {
      interact(rknobNode).draggable({
        inertia: true,
        onstart: () => this.onRKnobDragStart(),
        onmove: event => this.onRKnobDragMove(event.dx),
        onend: () => this.onRKnobDragEnd(),
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
    return position * this.width;
  }

  private getDisplacementByValue(value: number): number {
    const position = this.getPositionByValue(value);
    return this.getDisplacementByPosition(position);
  }

  private getPositionByDisplacement(displacement: number): number {
    return displacement / this.width;
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

  private onLKnobDragStart() {
    this.setState({
      isDraggingLeftKnob: true,
      isReleasingLeftKnob: false,
      isDraggingRightKnob: false,
      isReleasingRightKnob: false,
    });
  }

  private onLKnobDragEnd() {
    this.setState({
      isDraggingLeftKnob: false,
      isReleasingLeftKnob: true,
      isDraggingRightKnob: false,
      isReleasingRightKnob: false,
    });

    this.snapToClosestBreakpoint();
  }

  private onLKnobDragMove(delta: number) {
    const [lval, rval] = this.state.range;
    const { min } = this.props;
    const minX = this.getDisplacementByValue(min);
    const maxX = this.getDisplacementByValue(rval);
    const currX = this.getDisplacementByValue(lval);
    const newX = Math.max(minX, Math.min(maxX, currX + delta));
    const newPos = this.getPositionByDisplacement(newX);
    const newVal = this.getValueByPosition(newPos);

    this.setState({
      isDraggingLeftKnob: true,
      isReleasingLeftKnob: false,
      isDraggingRightKnob: false,
      isReleasingRightKnob: false,
      range: [newVal, rval],
    });
  }

  private onRKnobDragStart() {
    this.setState({
      isDraggingLeftKnob: false,
      isReleasingLeftKnob: false,
      isDraggingRightKnob: true,
      isReleasingRightKnob: false,
    });
  }

  private onRKnobDragEnd() {
    this.setState({
      isDraggingLeftKnob: false,
      isReleasingLeftKnob: false,
      isDraggingRightKnob: false,
      isReleasingRightKnob: true,
    });

    this.snapToClosestBreakpoint();
  }

  private onRKnobDragMove(delta: number) {
    const [lval, rval] = this.state.range;
    const { max } = this.props;
    const minX = this.getDisplacementByValue(lval);
    const maxX = this.getDisplacementByValue(max);
    const currX = this.getDisplacementByValue(rval);
    const newX = Math.max(minX, Math.min(maxX, currX + delta));
    const newPos = this.getPositionByDisplacement(newX);
    const newVal = this.getValueByPosition(newPos);

    this.setState({
      isDraggingLeftKnob: false,
      isReleasingLeftKnob: false,
      isDraggingRightKnob: true,
      isReleasingRightKnob: false,
      range: [lval, newVal],
    });
  }
}

const StyledHighlight = styled.div<HighlightCSSProps & ExtendedCSSProps<HighlightCSSProps>>`
  top: 0;
  left: 0;
  position: absolute;
  height: 100%;
  background: ${props => props.tintColor};
  transition-property: ${props => props.isReleasing ? 'opacity, width, transform' : 'opacity'};
  transition-duration: 100ms;
  transition-timing-function: ease-out;
  ${props => props.extendedCSS(props)}
`;

const StyledLabel = styled.span<LabelCSSProps & ExtendedCSSProps<LabelCSSProps>>`
  background: transparent;
  color: #fff;
  left: 0;
  padding: 10px;
  pointer-events: none;
  position: absolute;
  text-align: center;
  top: ${props => props.knobRadius}px;
  transition-duration: 100ms;
  transition-property: ${props => props.isReleasing ? 'opacity, transform' : 'opacity'};
  transition-timing-function: ease-out;
  user-select: none;
  will-change: opacity, transform;
  ${props => props.extendedCSS(props)}
`;

const StyledKnob = styled.div<KnobCSSProps & ExtendedCSSProps<KnobCSSProps>>`
  background: transparent;
  bottom: 0;
  box-sizing: border-box;
  height: ${props => (props.radius + props.hitboxPadding) * 2}px;
  left: ${props => -props.radius - props.hitboxPadding}px;
  margin: auto 0;
  padding: ${props => props.hitboxPadding}px;
  pointer-events: ${props => props.isDisabled ? 'none' : 'auto'};
  position: absolute;
  top: 0;
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

const StyledGutter = styled.div<ExtendedCSSProps>`
  display: block;
  top: 0;
  left: 0;
  position: absolute;
  width: 100%;
  height: 2px;
  background: rgba(255, 255, 255, .2);
  ${props => props.extendedCSS(props)}
`;

const StyledRoot = styled.div`
  display: flex;
  flex: 0 0 auto;
  height: 2px;
  position: relative;
  width: 300px;
`;
