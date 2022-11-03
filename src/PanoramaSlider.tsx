import React, { Children, cloneElement, CSSProperties, forwardRef, HTMLAttributes, isValidElement, PropsWithChildren, ReactNode, useRef, useState } from 'react'
import { Size } from 'spase'
import useResizeEffect from './hooks/useResizeEffect'
import Panorama, { PanoramaProps } from './Panorama'

export type PanoramaSliderProps = HTMLAttributes<HTMLDivElement> & PanoramaProps & PropsWithChildren<{
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
}>

export type PanoramaSliderTrackProps = HTMLAttributes<HTMLDivElement> & {
  isDragging?: boolean
}

export type PanoramaSliderReticleProps = HTMLAttributes<HTMLDivElement> & {
  isDragging?: boolean
  width?: number
}

export type PanoramaSliderIndicatorProps = HTMLAttributes<HTMLDivElement> & {
  isDragging?: boolean
  width?: number
}

/**
 * A slider for a {@link Panorama} component.
 *
 * @exports PanoramaSliderIndicator
 * @exports PanoramaSliderReticle
 * @exports PanoramaSliderTrack
 */
export default forwardRef<HTMLDivElement, PanoramaSliderProps>(({
  angle = 0,
  autoDimension = 'width',
  children,
  fov,
  speed = 1,
  src,
  style,
  viewportSize,
  zeroAnchor = 0,
  onAngleChange,
  onDragEnd,
  onDragStart,
  onImageLoadComplete,
  onImageLoadError,
  onImageLoadStart,
  onImageSizeChange,
  onPositionChange,
  onResize,
  ...props
}, ref) => {
  const getAspectRatio = () => {
    if (!imageSize) return 0
    const { width, height } = imageSize
    if (height === 0) return 0

    return width / height
  }

  const getReticleWidth = () => {
    const deg = Math.min(360, Math.max(0, fov ?? (viewportSize ? viewportSize.width / (viewportSize.height * aspectRatio) * 360 : 0)))

    return size.width * (deg / 360)
  }

  const getAdjustedZeroAnchor = () => {
    if (size.width <= 0) return zeroAnchor

    return ((size.width - reticleWidth) * 0.5 + zeroAnchor * reticleWidth) / size.width
  }

  const dragStartHandler = () => {
    setIsDragging(true)
    onDragStart?.()
  }

  const dragEndHandler = () => {
    setIsDragging(false)
    onDragEnd?.()
  }

  const panoramaRef = useRef<HTMLDivElement>(null)
  const [imageSize, setImageSize] = useState<Size | undefined>(undefined)
  const [isDragging, setIsDragging] = useState(false)
  const [size] = useResizeEffect(panoramaRef, { onResize })
  const aspectRatio = getAspectRatio()
  const reticleWidth = getReticleWidth()
  const adjustedZeroAnchor = getAdjustedZeroAnchor()
  const customComponents = parseElements(children)

  return (
    <div
      {...props}
      ref={ref}
      style={{
        ...style,
        ...autoDimension === 'width' ? {
          width: `${size.height * aspectRatio}px`,
        } : {
          height: `${size.width / aspectRatio}px`,
        },
      }}
    >
      <Panorama
        angle={angle}
        ref={panoramaRef}
        speed={speed}
        src={src}
        style={{ height: '100%', width: '100%' }}
        zeroAnchor={adjustedZeroAnchor}
        onAngleChange={onAngleChange}
        onDragEnd={dragEndHandler}
        onDragStart={dragStartHandler}
        onImageLoadComplete={onImageLoadComplete}
        onImageLoadError={onImageLoadError}
        onImageLoadStart={onImageLoadStart}
        onImageSizeChange={setImageSize}
        onPositionChange={onPositionChange}
      />
      <div style={bodyStyle()}>
        <div style={componentContainerStyle()}>
          {cloneElement(customComponents.track ?? <PanoramaSliderTrack style={defaultTrackStyle({ isDragging })}/>, { isDragging })}
          {cloneElement(customComponents.reticle ?? <PanoramaSliderReticle style={defaultReticleStyle({ isDragging })}/>, { isDragging, width: reticleWidth })}
          {cloneElement(customComponents.track ?? <PanoramaSliderTrack style={defaultTrackStyle({ isDragging })}/>, { isDragging })}
        </div>
      </div>
      {cloneElement(customComponents.indicator ?? <PanoramaSliderIndicator style={defaultIndicatorStyle({ isDragging })}/>, { isDragging, width: reticleWidth })}
    </div>
  )
})

export const PanoramaSliderTrack = forwardRef<HTMLDivElement, PanoramaSliderTrackProps>(({
  className,
  isDragging = false,
  style = {},
  ...props
}, ref) => (
  <div
    {...props}
    ref={ref}
    className={`${className ?? ''} ${isDragging ? 'dragging' : ''}`.split(' ').filter(Boolean).join(' ')}
    style={{ ...style, flex: '1 0 auto' }}
  />
))

export const PanoramaSliderReticle = forwardRef<HTMLDivElement, PanoramaSliderReticleProps>(({
  className,
  isDragging = false,
  style = {},
  width,
  ...props
}, ref) => (
  <div
    {...props}
    ref={ref}
    className={`${className ?? ''} ${isDragging ? 'dragging' : ''}`.split(' ').filter(Boolean).join(' ')}
    style={{ ...style, width: `${width}px` }}
  />
))

export const PanoramaSliderIndicator = forwardRef<HTMLDivElement, PanoramaSliderIndicatorProps>(({
  className,
  isDragging = false,
  style,
  width,
  ...props
}, ref) => (
  <div
    {...props}
    ref={ref}
    className={`${className ?? ''} ${isDragging ? 'dragging' : ''}`.split(' ').filter(Boolean).join(' ')}
    style={{ ...style, width: `${width}px` }}
  />
))

function parseElements(children?: ReactNode): { track?: JSX.Element; reticle?: JSX.Element; indicator?: JSX.Element } {
  let track: JSX.Element | undefined
  let reticle: JSX.Element | undefined
  let indicator: JSX.Element | undefined

  Children.forEach(children, child => {
    if (!isValidElement(child)) throw Error('Invalid child detected in PanoramaSlider')

    switch (child.type) {
      case PanoramaSliderTrack:
        if (track) throw Error('Only one PanoramaSliderTrack can be specified as a child of PanoramaSlider')
        track = child
        break
      case PanoramaSliderReticle:
        if (reticle) throw Error('Only one PanoramaSliderReticle can be specified as a child of PanoramaSlider')
        reticle = child
        break
      case PanoramaSliderIndicator:
        if (indicator) throw Error('Only one PanoramaSliderIndicator can be specified as a child of PanoramaSlider')
        indicator = child
        break
      default:
        throw Error('Unsupported child of PanoramaSlider, only the following children are allowed: PanoramaSliderTrack, PanoramaSliderReticle, PanoramaSliderIndicator')
    }
  })

  return { track, reticle, indicator }
}

const bodyStyle = (): CSSProperties => ({
  height: '100%',
  left: '0',
  overflow: 'hidden',
  pointerEvents: 'none',
  position: 'absolute',
  top: '0',
  width: '100%',
})

const componentContainerStyle = (): CSSProperties => ({
  alignItems: 'center',
  display: 'flex',
  height: '100%',
  justifyContent: 'flex-start',
  left: '0',
  overflow: 'visible',
  position: 'absolute',
  top: '0',
  width: '100%',
})

const defaultTrackStyle = (props: PanoramaSliderTrackProps): CSSProperties => ({
  background: 'rgba(0, 0, 0, .7)',
  height: '100%',
})

const defaultReticleStyle = ({ isDragging }: PanoramaSliderReticleProps): CSSProperties => ({
  background: `rgba(0, 0, 0, ${isDragging ? 0 : 0.3})`,
  flex: '0 0 auto',
  height: '100%',
  transitionDuration: '100ms',
  transitionProperty: 'background',
  transitionTimingFunction: 'ease-out',
})

const defaultIndicatorStyle = ({ isDragging }: PanoramaSliderIndicatorProps): CSSProperties => ({
  background: '#fff',
  borderRadius: '2px',
  bottom: '-10px',
  boxSizing: 'border-box',
  display: 'block',
  height: '2px',
  left: '0',
  margin: '0 auto',
  opacity: isDragging ? 1 : 0,
  position: 'absolute',
  right: '0',
  transition: 'opacity .3s ease-out',
})
