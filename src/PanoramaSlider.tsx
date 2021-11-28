import classNames from 'classnames'
import _ from 'lodash'
import React, { HTMLAttributes, useRef, useState } from 'react'
import { Size } from 'spase'
import styled, { CSSProp } from 'styled-components'
import useResizeEffect from './hooks/useResizeEffect'
import Panorama, { Props as PanoramaProps } from './Panorama'

export type Props = HTMLAttributes<HTMLDivElement> & PanoramaProps & {
  /**
   * Field-of-view (0.0 - 360.0 degrees, inclusive) that represents the size of the reticle. 360
   * indicates the reticle covers the entire image. If this is unspecified, the component will
   * attempt to automatically calculate the FOV using the `viewportSize` prop.
   */
  fov?: number

  /**
   * Specifies which length (width or height) should be automatically calculated. The counterpart
   * must be known (if `width` is specified here, the component's height must be known, i.e. it is
   * specified in the CSS). Defaults to `width`.
   */
  autoDimension?: 'width' | 'height'

  /**
   * Size of the viewport that this component is controlling. A viewport can be thought of as a DOM
   * element containing an aspect-filled image. This is used to automatically calculate the FOV if
   * `fov` prop is not specified. If it is, this prop is ignored.
   */
  viewportSize?: Size

  /**
   * Additional CSS to be provided to the internal panorama component.
   */
  panoramaCSS?: CSSProp<any>

  /**
   * Additional CSS to be provided to the reticle.
   */
  reticleCSS?: CSSProp<any>

  /**
   * Additional CSS to be provided to the gutter.
   */
  gutterCSS?: CSSProp<any>

  /**
   * Additional CSS to be provided to the indicator.
   */
  indicatorCSS?: CSSProp<any>
}

export default function PanoramaSlider({
  fov,
  autoDimension = 'width',
  viewportSize,
  panoramaCSS,
  reticleCSS,
  gutterCSS,
  indicatorCSS,
  angle = 0,
  speed = 1,
  src,
  zeroAnchor = 0,
  onAngleChange,
  onPositionChange,
  onDragStart,
  onDragEnd,
  onImageLoadStart,
  onImageLoadComplete,
  onImageLoadError,
  onImageSizeChange,
  onResize,
  style,
  ...props
}: Props) {
  function getImageAspectRatio(): number {
    if (!imageSize) return 0
    const { width, height } = imageSize
    if (height === 0) return 0
    return width / height
  }

  function getReticleWidth(): number {
    const angle = _.clamp(fov ?? (viewportSize ? (viewportSize.width / (viewportSize.height * aspectRatio)) * 360 : 0), 0, 360)
    return size.width * (angle / 360)
  }

  function getAdjustedZeroAnchor() {
    if (size.width <= 0) return zeroAnchor

    return ((size.width - reticleWidth) * 0.5 + (zeroAnchor * reticleWidth)) / size.width
  }

  const rootRef = useRef<HTMLDivElement>(null)

  const [imageSize, setImageSize] = useState<Size | undefined>(undefined)
  const [isDragging, setIsDragging] = useState(false)
  const [size] = useResizeEffect(rootRef, { onResize })

  const aspectRatio = getImageAspectRatio()
  const reticleWidth = getReticleWidth()
  const adjustedZeroAnchor = getAdjustedZeroAnchor()

  return (
    <StyledRoot ref={rootRef} style={{
      ...style,
      ...autoDimension === 'width' ? {
        width: `${size.height * aspectRatio}px`,
      } : {
        height: `${size.width / aspectRatio}px`,
      },
    }} {...props}>
      <StyledPanorama
        angle={angle}
        css={panoramaCSS}
        onAngleChange={onAngleChange}
        onDragEnd={() => {
          setIsDragging(false)
          onDragEnd?.()
        }}
        onDragStart={() => {
          setIsDragging(true)
          onDragStart?.()
        }}
        onImageLoadComplete={onImageLoadComplete}
        onImageLoadError={onImageLoadError}
        onImageLoadStart={onImageLoadStart}
        onImageSizeChange={size => setImageSize(size)}
        onPositionChange={onPositionChange}
        speed={speed}
        src={src}
        style={{ height: '100%', width: '100%' }}
        zeroAnchor={adjustedZeroAnchor}
      />
      <StyledSlideTrack>
        <div>
          <StyledGutter className={classNames({ dragging: isDragging })} css={gutterCSS}/>
          <StyledReticle className={classNames({ dragging: isDragging })} css={reticleCSS} style={{ width: `${reticleWidth}px` }}/>
          <StyledGutter className={classNames({ dragging: isDragging })} css={gutterCSS}/>
        </div>
      </StyledSlideTrack>
      <StyledIndicator className={classNames({ dragging: isDragging })} style={{ width: `${reticleWidth}px` }} css={indicatorCSS}/>
    </StyledRoot>
  )
}

const StyledReticle = styled.div`
  background: rgba(0, 0, 0, .3);
  flex: 0 0 auto;
  height: 100%;
  transition-duration: 100ms;
  transition-property: background;
  transition-timing-function: ease-out;

  &.dragging {
    background: rgba(0, 0, 0, 0);
  }

  ${props => props.css}
  `

const StyledGutter = styled.div`
  background: rgba(0, 0, 0, .7);
  display: block;
  flex: 1 0 auto;
  height: 100%;
  pointer-events: none;

  ${props => props.css}
`

const StyledSlideTrack = styled.div`
  box-sizing: border-box;
  display: block;
  height: 100%;
  left: 0;
  overflow: hidden;
  pointer-events: none;
  position: absolute;
  top: 0;
  width: 100%;

  > div {
    align-items: center;
    display: flex;
    height: 100%;
    justify-content: flex-start;
    left: 0;
    overflow: visible;
    position: absolute;
    top: 0;
    width: 100%;
  }
`

const StyledIndicator = styled.div`
  background: #fff;
  border-radius: 2px;
  bottom: -10px;
  box-sizing: border-box;
  display: block;
  height: 2px;
  left: 0;
  margin: 0 auto;
  opacity: 0;
  right: 0;
  transition: opacity .3s ease-out;

  &.dragging {
    opacity: 1;
  }

  ${props => props.css}
`

const StyledPanorama = styled(Panorama)`
  ${(props: any) => props.css}
`

const StyledRoot = styled.div`
  box-sizing: border-box;
  display: block;
  flex: 0 0 auto;
`
