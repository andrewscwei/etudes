import classNames from 'classnames'
import React, { HTMLAttributes, useEffect, useState } from 'react'
import styled from 'styled-components'
import Repeat from './Repeat'

export type Props = HTMLAttributes<HTMLButtonElement> & {
  height?: number
  isActive?: boolean
  isDoubleJointed?: boolean
  isLastBarHalfWidth?: boolean
  thickness?: number
  tintColor?: string
  transitionDuration?: number
  width?: number
  onActivate?: () => void
  onDeactivate?: () => void
}

/**
 * Three-striped burger button component that transforms into an "X" when selected.
 *
 * @exports BurgerButtonBar - Component for each line on the burger button.
 */
export default function BurgerButton({
  height = 20,
  isActive: externalIsActive = false,
  isDoubleJointed = false,
  isLastBarHalfWidth = false,
  thickness = 2,
  tintColor = '#000',
  transitionDuration = 200,
  width = 20,
  onActivate,
  onDeactivate,
  ...props
}: Props) {
  const [isActive, setIsActive] = useState(externalIsActive)

  useEffect(() => {
    if (isActive !== externalIsActive) {
      setIsActive(externalIsActive)
    }
  }, [externalIsActive])

  useEffect(() => {
    if (isActive) {
      onActivate?.()
    }
    else {
      onDeactivate?.()
    }
  }, [isActive])

  return (
    <StyledRoot {...props} width={width} height={height} thickness={thickness} onClick={() => setIsActive(!isActive)}>
      <Repeat count={isDoubleJointed ? 2 : 1}>
        <StyledJoint
          className={classNames({ active: isActive, half: isDoubleJointed })}
          height={height}
          isLastBarHalfWidth={isLastBarHalfWidth}
          thickness={thickness}
          width={width}
        >
          <Repeat count={3}>
            <BurgerButtonBar className={classNames({ active: isActive, half: isDoubleJointed })} style={{ height: `${thickness}px` }}/>
          </Repeat>
        </StyledJoint>
      </Repeat>
    </StyledRoot>
  )
}

export const BurgerButtonBar = styled.span`
  background: #fff;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  position: absolute;
  transition-duration: 100ms;
  transition-property: width, height, transform, opacity, background;
  transition-timing-function: ease-out;
  width: 100%;
`

const StyledJoint = styled.div<{
  height: number
  isLastBarHalfWidth: boolean
  thickness: number
  width: number
}>`
  height: 100%;
  position: absolute;
  width: 100%;

  &.half {
    width: 50%;
  }

  &:nth-of-type(1) {
    left: 0;
    top: 0;

    ${BurgerButtonBar}:nth-child(1) {
      left: 0;
      top: 0;
      transform-origin: center;
      transform: translate3d(0, 0, 0) rotate(0deg);
    }

    ${BurgerButtonBar}:nth-child(2) {
      left: 0;
      top: ${props => props.height * 0.5 - props.thickness * 0.5}px;
      transform-origin: center;
      transform: translate3d(0, 0, 0) scale(1);
    }

    ${BurgerButtonBar}:nth-child(3) {
      left: 0;
      top: ${props => props.height - props.thickness}px;
      transform-origin: center;
      transform: translate3d(0, 0, 0) rotate(0deg);
      width: ${props => props.isLastBarHalfWidth ? '50%' : '100%'};
    }

    &.active {
      ${BurgerButtonBar}:nth-child(1) {
        transform: ${props => `translate3d(0, ${props.height * 0.5 - props.thickness * 0.5}px, 0) rotate(45deg)`};
      }

      ${BurgerButtonBar}:nth-child(2) {
        transform: ${props => 'translate3d(0, 0, 0) scale(0)'};
      }

      ${BurgerButtonBar}:nth-child(3) {
        transform: ${props => `translate3d(0, ${props.thickness * 0.5 - props.height * 0.5}px, 0) rotate(-45deg)`};
        width: 100%;
      }
    }

    &.half {
      ${BurgerButtonBar}:nth-child(1) {
        transform-origin: right center;
      }

      ${BurgerButtonBar}:nth-child(2) {
        transform-origin: right center;
      }

      ${BurgerButtonBar}:nth-child(3) {
        transform-origin: right center;
        width: 100%;
      }
    }
  }

  &:nth-of-type(2) {
    right: 0;
    top: 0;

    span:nth-child(1) {
      left: 0;
      top: 0;
      transform-origin: left center;
      transform: translate3d(0, 0, 0) rotate(0deg);
    }

    span:nth-child(2) {
      left: 0;
      top: ${props => props.height * 0.5 - props.thickness * 0.5}px;
      transform-origin: left center;
      transform: translate3d(0, 0, 0) scale(1);
    }

    span:nth-child(3) {
      left: 0;
      top: ${props => props.height - props.thickness}px;
      transform-origin: left center;
      transform: translate3d(0, 0, 0) rotate(0deg);
      width: ${props => props.isLastBarHalfWidth ? 0 : '100%'};
    }

    &.active {
      span:nth-child(1) {
        transform: ${props => `translate3d(0, ${props.height * 0.5 - props.thickness * 0.5}px, 0) rotate(-45deg)`};
      }

      span:nth-child(2) {
        transform: translate3d(0, 0, 0) scale(0);
      }

      span:nth-child(3) {
        transform: ${props => `translate3d(0, ${props.thickness * 0.5 - props.height * 0.5}px, 0) rotate(45deg)`};
        width: 100%;
      }
    }
  }
`

const StyledRoot = styled.button<{
  height: number
  thickness: number
  width: number
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

  html:not(.touch) &:hover {
    ${StyledJoint}:not(.half) {
      span:nth-child(3) {
        width: ${props => props.width}px;
      }
    }

    ${StyledJoint}.half:nth-of-type(2) {
      span:nth-child(3) {
        width: ${props => props.width * 0.5}px;
      }
    }
  }
`
