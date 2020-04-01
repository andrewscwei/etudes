import React, { PureComponent } from 'react';
import styled from 'styled-components';

interface Props {
  height: number;
  isActiveByDefault: boolean;
  isDoubleJointed: boolean;
  isFunky: boolean;
  onActivate?: () => {};
  onDeactivate?: () => {};
  thickness: number;
  tintColor: string;
  transitionDuration: number;
  width: number;
}

interface State {
  isActive: boolean;
}

class BurgerButton extends PureComponent<Props, State> {
  static defaultProps = {
    height: 20,
    isActiveByDefault: false,
    isDoubleJointed: true,
    isFunky: false,
    thickness: 2,
    tintColor: '#000',
    transitionDuration: 200,
    width: 20,
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      isActive: this.props.isActiveByDefault,
    };
  }

  toggle() {
    if (this.state.isActive) {
      this.setState({
        isActive: false,
      });

      if (this.props.onDeactivate) this.props.onDeactivate();
    }
    else {
      this.setState({
        isActive: true,
      });

      if (this.props.onActivate) this.props.onActivate();
    }
  }

  render() {
    const { isDoubleJointed, width, height, thickness } = this.props;

    const w = width * 0.5;
    const h = height * 0.5;
    const t = thickness * 0.5;
    const d = 45;
    const r = d * Math.PI / 180;

    return (
      <StyledRoot {...this.props} {...this.state} onClick={() => this.toggle()} w={w} h={h} t={t} d={d} r={r}>
        { isDoubleJointed &&
          <>
            <div>
              <span/>
              <span/>
              <span/>
            </div>
            <div>
              <span/>
              <span/>
              <span/>
            </div>
          </>
          ||
          <>
            <div>
              <span/>
              <span/>
              <span/>
            </div>
          </>
        }
      </StyledRoot>
    );
  }
}

export default BurgerButton;

const StyledRoot = styled.button<{
  isActive: boolean;
  width: number;
  height: number;
  thickness: number;
  tintColor: string;
  isDoubleJointed: boolean;
  isFunky: boolean;
  transitionDuration: number;
  w: number;
  h: number;
  t: number;
  d: number;
  r: number;
}>`
  background: transparent;
  border: none;
  box-sizing: border-box;
  display: block;
  height: ${props => props.height}px;
  margin: 0;
  min-height: ${props => props.height}px;
  min-width: ${props => props.width}px;
  outline: none;
  padding: 0;
  pointer-events: auto;
  position: relative;
  width: ${props => props.width}px;

  > div:only-of-type {
    width: 100%;
    height: 100%;

    span:nth-child(1) {
      left: 0;
      position: absolute;
      top: 0;
      transform-origin: center;
      transform: ${props => props.isActive ? `translate3d(0, ${props.h - props.t}px, 0) rotate(${props.d}deg)` : 'translate3d(0, 0, 0) rotate(0deg)'};
    }

    span:nth-child(2) {
      left: 0;
      position: absolute;
      top: ${props => props.h - props.t}px;
      transform-origin: center;
      transform: ${props => props.isActive ? 'translate3d(0, 0, 0) scale(0)' : 'translate3d(0, 0, 0) scale(1)'};
    }

    span:nth-child(3) {
      top: ${props => props.height - props.thickness};
      left: 0;
      position: absolute;
      transform-origin: center;
      transform: ${props => props.isActive ? `translate3d(0, ${props.t - props.h}px, 0) rotate(${-props.d}deg)` : 'translate3d(0, 0, 0) rotate(0deg)'};
      width: ${props => props.isActive ? '100%' : (props.isFunky ? '50%' : '100%')};
    }
  }

  > div:not(:only-of-type) {
    height: 100%;
    width: 50%;

    &:nth-of-type(1) {
      left: 0;
      top: 0;
      position: absolute;

      span:nth-child(1) {
        top: 0;
        left: 0;
        transform-origin: right center;
        transform: ${props => props.isActive ? `translate3d(0, ${props.h - props.t}px, 0) rotate(${props.d}deg)` : 'translate3d(0, 0, 0) rotate(0deg)'};
      }

      span:nth-child(2) {
        left: 0;
        top: ${props => props.h - props.t}px;
        transform: ${props => props.isActive ? 'translate3d(0, 0, 0) scale(0)' : 'translate3d(0, 0, 0) scale(1)'};
        transform-origin: right center;
      }

      span:nth-child(3) {
        top: ${props => props.height - props.thickness}px;
        left: 0;
        width: 100%;
        transform-origin: right center;
        transform: ${props => props.isActive ? `translate3d(0, ${props.t - props.h}px, 0) rotate(${-props.d}deg)` : 'translate3d(0, 0, 0) rotate(0deg)'};
      }
    }

    &:nth-of-type(2) {
      right: 0;
      top: 0;
      position: absolute;

      span:nth-child(1) {
        top: 0;
        left: 0;
        transform-origin: left center;
        transform: ${props => props.isActive ? `translate3d(${0}px, ${props.h - props.t}px, 0) rotate(${-props.d}deg)` : 'translate3d(0, 0, 0) rotate(0deg)'};
      }

      span:nth-child(2) {
        left: 0;
        top: ${props => props.h - props.t}px;
        transform: ${props => props.isActive ? 'translate3d(0, 0, 0) scale(0)' : 'translate3d(0, 0, 0) scale(1)'};
        transform-origin: left center;
      }

      span:nth-child(3) {
        transform-origin: left center;
        transform: ${props => props.isActive ? `translate3d(0, ${props.t - props.h}px, 0) rotate(${props.d}deg)` : 'translate3d(0, 0, 0) rotate(0deg)'};
        width: ${props => props.isActive ? '100%' : (props.isFunky ? 0 : '100%')};
        left: 0;
        top: ${props => props.height - props.thickness}px;
      }
    }
  }

  span {
    background: ${props => props.tintColor};
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    position: absolute;
    width: 100%;
    height: ${props => props.thickness}px;
    transition-duration: ${props => props.transitionDuration}ms;
    transition-property: width, height, transform, opacity, background;
    transition-timing-function: ease-out;
  }

  &:hover {
    div:not(:only-of-type):nth-of-type(2)::after {
      height: ${props => props.thickness}px;
      width: ${props => props.w}px;
    }

    div:only-of-type span:nth-child(3) {
      height: ${props => props.thickness}px;
      width: ${props => props.width}px;
    }
  }
`;
