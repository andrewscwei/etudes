import React, { HTMLAttributes, useEffect, useState } from 'react'
import { Transition } from 'react-transition-group'
import styled, { css, CSSProp } from 'styled-components'
import useInterval from './hooks/useInterval'

export type Props = HTMLAttributes<HTMLDivElement> & {
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
   * the next). Specifying `NaN` or a negative number will prevent the component from automatically
   * rotating.
   */
  rotationDuration?: number

  /**
   * The duration of an image transition in milliseconds.
   */
  transitionDuration?: number

  /**
   * The default CSS of the image container.
   */
  cssDefault?: CSSProp<any>

  /**
   * The CSS of the image container (a `<div>` element containing the image) when the image is
   * entering into view. This CSS lasts for `transitionDuration` milliseconds.
   */
  cssEntering?: CSSProp<any>

  /**
   * The CSS of the image container (a `<div>` element containing the image) after the image has
   * entered into view.
   */
  cssEntered?: CSSProp<any>

  /**
   * The CSS of the image container (a `<div>` element containing the image) when the image is
   * exiting out of view. This CSS lasts for `transitionDuration` milliseconds.
   */
  cssExiting?: CSSProp<any>

  /**
   * The CSS of the image container (a `<div>` element containing the image) after the image has
   * exited out of view.
   */
  cssExited?: CSSProp<any>

  /**
   * Handler invoked when the image index changes.
   *
   * @param index - The current image index.
   */
  onIndexChange?: (index: number) => void
}

/**
 * A component displaying rotating images.
 *
 * @exports RotatingGalleryImage - Component for each rotating image.
 */
export default function RotatingGallery({
  index: externalIndex = 0,
  onIndexChange,
  rotationDuration,
  transitionDuration = 500,
  srcs = [],
  cssDefault = css`
    transition-property: opacity;
    transition-timing-function: ease-out;
  `,
  cssEntering = css`
    opacity: 1;
  `,
  cssEntered,
  cssExiting = css`
    opacity: 0;
  `,
  cssExited,
  ...props
}: Props) {
  const [index, setIndex] = useState(externalIndex)

  useInterval(() => {
    setIndex((index + 1) % srcs.length)
  }, rotationDuration, undefined, [index])

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
            <RotatingGalleryImage
              className={state}
              css={cssDefault}
              cssEntering={cssEntering ?? cssEntered}
              cssEntered={cssEntered ?? cssEntering}
              cssExiting={cssExiting ?? cssExited}
              cssExited={cssExited ?? cssExiting}
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

export const RotatingGalleryImage = styled.div<{
  cssEntering: Props['cssEntering']
  cssEntered: Props['cssEntered']
  cssExiting: Props['cssExiting']
  cssExited: Props['cssExited']
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
    ${props => props.cssEntering}
  }

  &.entered {
    ${props => props.cssEntered}
  }

  &.exiting {
    ${props => props.cssExiting}
  }

  &.exited {
    ${props => props.cssExited}
  }
`

const StyledRoot = styled.div`
  height: 100%;
  position: relative;
  width: 100%;
`
