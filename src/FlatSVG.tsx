import React, { CSSProperties, PropsWithChildren, SFC } from 'react';
import styled, { css } from 'styled-components';

interface Props {
  className?: string;
  src: string;
  style?: CSSProperties;
  fillColor?: string;
  strokeColor?: string;
  isAnimated?: boolean;
}

const FlatSVG: SFC<PropsWithChildren<Props>> = ({ className, style, isAnimated, fillColor, strokeColor, src }) => (
  <StyledRoot
    className={className}
    dangerouslySetInnerHTML={{ __html: src }}
    fillColor={fillColor}
    isAnimated={isAnimated ?? false}
    strokeColor={strokeColor}
    style={style ?? {}}
  />
);

export default FlatSVG;

const StyledRoot = styled.figure<{
  fillColor?: string;
  strokeColor?: string;
  isAnimated: boolean;
}>`
  box-sizing: border-box;
  display: inline-block;
  flex: 0 0 auto;
  height: 100%;
  position: relative;
  width: auto;

  > svg {
    height: 100%;
    transition-delay: inherit;
    transition-duration: inherit;
    transition-property: inherit;
    transition-timing-function: inherit;
    width: auto;

    ${props => props.isAnimated && css`
      transition-property: stroke, fill, transform;
      transition-duration: 100ms;
      transition-timing-function: ease-out;
      will-change: stroke, fill, transform;
    `}

    * {
      transition-delay: inherit;
      transition-duration: inherit;
      transition-property: inherit;
      transition-timing-function: inherit;

      ${props => props.fillColor !== undefined && css`
        fill: ${props.fillColor} !important;
      `}

      ${props => props.strokeColor !== undefined && css`
        stroke: ${props.strokeColor} !important;
      `}
    }
  }
`;
