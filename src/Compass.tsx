import React, { PureComponent } from 'react';
import styled, { CSSProperties } from 'styled-components';

interface Props {
  /**
   * Current angle reading of the compass, between 0 - 360 (degrees), inclusive.
   */
  angle: number;

  /**
   * Field of view expressed in angles, must be between 0 and 360, exclusive.
   *
   * @example Suppose the compass were to be used to control a photosphere of
   *          an image that is 1000 x 500, and the window size is 500 x 500,
   *          that would mean the FOV is 500 / 1000 * 360 = 180 degrees.
   */
  fov: number;

  /**
   * Class attribute of the component.
   * @optional
   */
  className?: string;

  /**
   * Color of the highlight indicator.
   * @optional
   */
  highlightColor: string;

  /**
   * The thickness of the highlight indicator.
   * @optional
   */
  highlightThickness: number;

  /**
   * Radius of the component.
   * @optional
   */
  radius: number;

  /**
   * The inline CSS provided to the component.
   * @optional
   */
  style: CSSProperties;

  /**
   * The color of the circular compass track.
   * @optional
   */
  trackColor: string;

  /**
   * The `stroke-dasharray` attribute provided to the circular compass track.
   * @optional
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray}
   */
  trackDasharray: string;

  /**
   * The thickness of the circular compass track.
   * @optional
   */
  trackThickness: number;
}

export default class Compass extends PureComponent<Props> {
  static defaultProps: Partial<Props> = {
    highlightColor: '#fff',
    highlightThickness: 10,
    radius: 50,
    style: {},
    trackColor: '#fff',
    trackDasharray: '4',
    trackThickness: 2,
  };

  render() {
    const { className, highlightColor, highlightThickness, radius, trackColor, trackDasharray, trackThickness, style } = this.props;
    const diameter = radius * 2;

    return (
      <StyledRoot
        className={className}
        style={{
          ...style,
          width: `${diameter}px`,
          height: `${diameter}px`,
        }}
      >
        <StyledCircle>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width={diameter}
            height={diameter}
            viewBox={`0 0 ${diameter} ${diameter}`}
          >
            <circle
              cx={radius}
              cy={radius}
              r={radius - trackThickness / 2}
              fill='none'
              stroke={trackColor}
              strokeWidth={trackThickness}
              strokeDasharray={trackDasharray}
            />
          </svg>
        </StyledCircle>
        <StyledHighlight
          style={{
            transform: `rotate(${(this.props.angle + 360) % 360}deg)`,
          }}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width={diameter}
            height={diameter}
            viewBox={`0 0 ${diameter} ${diameter}`}
          >
            <path
              fill='none'
              stroke={highlightColor}
              strokeWidth={highlightThickness}
              d={this.describeArc(radius, radius, radius - highlightThickness / 2 - (trackThickness - highlightThickness) / 2, -this.props.fov / 2, this.props.fov / 2)}
            />
          </svg>
        </StyledHighlight>
      </StyledRoot>
    );
  }

  private polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians)),
    };
  }

  private describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
    const start = this.polarToCartesian(x, y, radius, endAngle);
    const end = this.polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    const d = [
      'M', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    ];

    return d.join(' ');
  }
}

const StyledCircle = styled.div`
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  position: absolute;
  transform-origin: center;
`;

const StyledHighlight = styled.div`
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  position: absolute;
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100%;
  transform-origin: center;

  svg {
    top: 0;
    right: 0;
    overflow: visible;
    position: absolute;
  }
`;

const StyledRoot = styled.div`
  box-sizing: border-box;
  display: block;
`;
