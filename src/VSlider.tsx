import interact from 'interactjs';
import React, { createRef, CSSProperties, PureComponent } from 'react';
import styled, { FlattenSimpleInterpolation, css, SimpleInterpolation, FlattenInterpolation } from 'styled-components';
import { Rect } from 'dirty-dom';

export interface DataProps {
  label?: string;
  position?: number;
}

export interface Props {
  className?: string;
  style: CSSProperties;
  data: ReadonlyArray<DataProps>;
  defaultIndex: number;
  gutterPadding: number;
  gutterWidth: number;
  knobHeight: number;
  knobWidth: number;
  autoSnap: boolean;
  isInverted: boolean;
  isLabelVisible: boolean;
  onlyDispatchesOnDragEnd: boolean;
  onDragEnd?: () => void;
  onDragStart?: () => void;
  onIndexChange?: (index: number) => void;
  onPositionChange?: (position: number) => void;
  gutterCSS: (props: Props) => FlattenSimpleInterpolation;
  knobCSS: (props: Props) => FlattenSimpleInterpolation;
  labelCSS: (props: Props) => FlattenSimpleInterpolation;
}

interface State {
  isDragging: boolean;
  isReleasing: boolean;
  position: number;
}

export default class VSlider extends PureComponent<Props, State> {
  static defaultProps: Partial<Props> = {
    autoSnap: true,
    data: VSlider.dataFactory(10, (index: number, position: number) => `${index}`),
    defaultIndex: 0,
    gutterCSS: props => css``,
    gutterPadding: 0,
    gutterWidth: 1,
    isInverted: false,
    isLabelVisible: true,
    knobCSS: props => css``,
    knobHeight: 30,
    knobWidth: 30,
    labelCSS: props => css``,
    onlyDispatchesOnDragEnd: false,
    style: {},
  };

  static dataFactory(length: number, labelIterator?: (index: number, position: number) => string): ReadonlyArray<DataProps> {
    if (length <= 0) throw new Error('`length` value cannot be less than or equal to 0');
    if (Math.round(length) !== length) throw new Error('`length` value must be an integer');

    const interval = 1 / length;

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
      position: this.getPositionByIndex(this.props.defaultIndex),
    };
  }

  /**
   * Computed rect of this component.
   */
  get rect(): Rect {
    return Rect.from(this.nodeRefs.root.current) ?? new Rect();
  }

  /**
   * Height of the gutter above the knob.
   */
  get topGutterHeight(): number {
    const { isInverted, gutterPadding, knobHeight } = this.props;
    const { position } = this.state;
    return Math.max(0, (isInverted ? (1 - position) : position) * this.rect.height - (knobHeight / 2) - gutterPadding);
  }

  /**
   * Height of the gutter below the knob.
   */
  get bottomGutterHeight(): number {
    const { isInverted, gutterPadding, knobHeight } = this.props;
    const { position } = this.state;
    return Math.max(0, (isInverted ? position : (1 - position)) * this.rect.height - (knobHeight / 2) - gutterPadding);
  }

  /**
   * Position of the knob ranging from 0 to 1, inclusive. If for whatever reason
   * the position cannot be computed, -1 is returned.
   */
  get knobPosition(): number {
    const { isInverted } = this.props;
    const { position } = this.state;
    const rootNode = this.nodeRefs.root.current;

    if (!rootNode) return -1;

    const p = isInverted ? (1 - position) : position;

    return p * this.rect.height;
  }

  /**
   * Gets the index of the data array of which the sliding position is pointing
   * at.
   */
  get index(): number {
    const { data } = this.props;
    const { position } = this.state;

    let idx = 0;
    let delta = NaN;

    for (let i = 0, n = data.length; i < n; i++) {
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

    if (!this.props.onlyDispatchesOnDragEnd && this.state.isDragging) {
      this.props.onPositionChange?.(this.state.position);
      this.props.onIndexChange?.(this.index);
    }

    if (!this.state.isDragging) {
      this.props.onPositionChange?.(this.state.position);
      this.props.onIndexChange?.(this.index);
      this.props.onDragEnd?.();
    }
    else {
      this.props.onDragStart?.();
    }

    this.forceUpdate();
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    this.reconfigureInteractivityIfNeeded();

    if (prevState.position !== this.state.position) {
      if (!this.props.onlyDispatchesOnDragEnd && this.state.isDragging) {
        this.props.onPositionChange?.(this.state.position);
        this.props.onIndexChange?.(this.index);
      }
    }

    if (prevState.isDragging !== this.state.isDragging) {
      if (!this.state.isDragging) {
        this.props.onPositionChange?.(this.state.position);
        this.props.onIndexChange?.(this.index);
        this.props.onDragEnd?.();
      }
      else {
        this.props.onDragStart?.();
      }
    }
  }

  render() {
    const { className, data, knobHeight, knobWidth, isLabelVisible, isInverted, labelCSS, gutterCSS, knobCSS, style } = this.props;
    const { isDragging, isReleasing, position } = this.state;

    return (
      <StyledRoot
        className={className}
        ref={this.nodeRefs.root}
        style={style}
      >
        <StyledGutter
          style={{ top: 0, height: `${this.topGutterHeight}px` }}
          extendedCSS={gutterCSS(this.props)}
        />
        <StyledKnob
          gutterWidth={this.rect.width}
          height={knobHeight}
          isAtBottom={isInverted ? (position === 0) : (position === 1)}
          isAtTop={isInverted ? (position === 1) : (position === 0)}
          isDragging={isDragging}
          isReleasing={isReleasing}
          ref={this.nodeRefs.knob}
          style={{ transform: `translate3d(0, ${this.knobPosition}px, 0)` }}
          extendedCSS={knobCSS(this.props)}
          width={knobWidth}
        >
          {isLabelVisible && (
            <StyledLabel
              knobHeight={knobHeight}
              extendedCSS={labelCSS(this.props)}
            >
              {data[this.index].label ?? ''}
            </StyledLabel>
          )}
        </StyledKnob>
        <StyledGutter
          style={{ bottom: 0, height: `${this.bottomGutterHeight}px` }}
          extendedCSS={gutterCSS(this.props)}
        />

      </StyledRoot>
    );
  }

  /**
   * Gets the knob position by data index. This value ranges between 0 - 1,
   * inclusive.
   *
   * @param index - The data index.
   *
   * @returns The position.
   */
  private getPositionByIndex(index: number): number {
    const { data } = this.props;
    return data[index].position ?? (index / (data.length - 1));
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
      position: this.props.autoSnap ? this.getPositionByIndex(this.index) : this.state.position,
    });
  }
}

const StyledGutter = styled.div<{
  extendedCSS: FlattenSimpleInterpolation;
}>`
  left: 0;
  right: 0;
  margin: 0 auto;
  position: absolute;
  width: 100%;
  background: #fff;
  ${props => props.extendedCSS}
`;

const StyledLabel = styled.label<{
  extendedCSS: FlattenSimpleInterpolation;
  knobHeight: number;
}>`
  font-size: ${props => props.knobHeight * .5}px;
  pointer-events: none;
  user-select: none;
  color: #000;
  ${props => props.extendedCSS}
`;

const StyledKnob = styled.div<{
  gutterWidth: number;
  height: number;
  isAtBottom: boolean;
  isAtTop: boolean;
  isDragging: boolean;
  isReleasing: boolean;
  width: number;
  extendedCSS: FlattenSimpleInterpolation;
}>`
  align-items: center;
  background: #fff;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: ${props => props.height}px;
  justify-content: center;
  margin: ${props => -props.height / 2}px 0 0 ${props => (-props.width + props.gutterWidth) / 2}px;
  opacity: ${props => props.isDragging ? .6 : 1};
  position: relative;
  touch-action: none;
  transition-duration: 150ms;
  transition-property: ${props => props.isReleasing ? 'opacity, transform' : 'opacity'};
  transition-timing-function: ease-out;
  width: ${props => props.width}px;
  z-index: 1;

  ${props => props.extendedCSS}
`;

const StyledRoot = styled.div`
  box-sizing: border-box;
  display: block;
  height: 300px;
  position: relative;
  width: 4px;
`;
