import React, { HTMLAttributes, useEffect, useState } from 'react'
import { Transition } from 'react-transition-group'
import styled, { css, CSSProp } from 'styled-components'
import useInterval from './hooks/useInterval'

type Props = HTMLAttributes<HTMLDivElement> & {
  /**
   * Current image index. An error is thrown if the index is invalid (must be between 0 and length
   * of `srcs` - 1, inclusive). This prop supports two-way binding.
   */
  index?: number

  /**
   * An array of image paths.
   */
  srcs?: string[]

  /**
   * The duration of one rotation in milliseconds (how long one image stays before transitioning to
   * the next).
   */
  rotationDuration?: number

  /**
   * The duration of an image transition in milliseconds.
   */
  transitionDuration?: number

  /**
   * The default CSS of the image container.
   */
  defaultCSS?: CSSProp<any>

  /**
   * The CSS of the image container (a `<div>` element containing the image) when the image is
   * entering into view. This CSS lasts for `transitionDuration` milliseconds.
   */
  enteringCSS?: CSSProp<any>

  /**
   * The CSS of the image container (a `<div>` element containing the image) after the image has
   * entered into view.
   */
  enteredCSS?: CSSProp<any>

  /**
   * The CSS of the image container (a `<div>` element containing the image) when the image is
   * exiting out of view. This CSS lasts for `transitionDuration` milliseconds.
   */
  exitingCSS?: CSSProp<any>

  /**
   * The CSS of the image container (a `<div>` element containing the image) after the image has
   * exited out of view.
   */
  exitedCSS?: CSSProp<any>

  /**
   * Handler invoked when the image index changes.
   *
   * @param index - The current image index.
   */
  onIndexChange?: (index: number) => void
}

export default function RotatingGallery({
  index: externalIndex = 0,
  onIndexChange,
  rotationDuration = 1000,
  transitionDuration = 500,
  srcs = [],
  defaultCSS = css`
    transition-property: opacity;
    transition-timing-function: ease-out;
  `,
  enteringCSS = css`
    opacity: 1;
  `,
  enteredCSS,
  exitingCSS = css`
    opacity: 0;
  `,
  exitedCSS,
  ...props
}: Props) {
  const [index, setIndex] = useState(externalIndex)

  useInterval(() => {
    setIndex((index + 1) % srcs.length)
  }, rotationDuration)

  useEffect(() => {
    if (externalIndex === index) return
    setIndex(externalIndex)
  }, [externalIndex])

  useEffect(() => {
    onIndexChange?.(index)
  }, [index])

  return (
    <StyledRoot {...props}>
      {srcs.map((src, idx) => (
        <Transition key={src} in={idx === index} timeout={transitionDuration}>
          {state => (
            <StyledImage
              className={state}
              css={defaultCSS}
              enteringCSS={enteringCSS ?? enteredCSS}
              enteredCSS={enteredCSS ?? enteringCSS}
              exitingCSS={exitingCSS ?? exitedCSS}
              exitedCSS={exitedCSS ?? exitingCSS}
              style={{
                transitionDuration: `${transitionDuration}ms`,
                backgroundImage: `url(${src})`,
              }}
            />
          )}
        </Transition>
      ))}
    </StyledRoot>
  )
}

const StyledImage = styled.div<{
  enteringCSS: Props['enteringCSS']
  enteredCSS: Props['enteredCSS']
  exitingCSS: Props['exitingCSS']
  exitedCSS: Props['exitedCSS']
}>`
  background-repeat: no-repeat;
  background-size: cover;
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;

  ${props => props.css}

  &.entering {
    ${props => props.enteringCSS}
  }

  &.entered {
    ${props => props.enteredCSS}
  }

  &.exiting {
    ${props => props.exitingCSS}
  }

  &.exited {
    ${props => props.exitedCSS}
  }
`

const StyledRoot = styled.div`
  position: relative;
`
