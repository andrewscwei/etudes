import classNames from 'classnames'
import React, { forwardRef, useRef, useState, type HTMLAttributes, type PropsWithChildren } from 'react'
import { Rect, type Size } from 'spase'
import { useRect } from '../hooks/useRect'
import { asComponentDict, asStyleDict, cloneStyledElement, styles } from '../utils'
import { Panorama, type PanoramaProps } from './Panorama'

export type PanoramaSliderProps = PanoramaProps & PropsWithChildren<{
  /**
   * Field-of-view (0.0 - 360.0 degrees, inclusive) that represents the size of
   * the reticle. 360 indicates the reticle covers the entire image. If this is
   * unspecified, the component will attempt to automatically calculate the FOV
   * using the `viewportSize` prop.
   */
  fov?: number

  /**
   * Specifies which length (width or height) should be automatically
   * calculated. The counterpart must be known (if `width` is specified here,
   * the component's height must be known, i.e. it is specified in the CSS).
   * Defaults to `width`.
   */
  autoDimension?: 'width' | 'height'

  /**
   * Size of the viewport that this component is controlling. A viewport can be
   * thought of as a DOM element containing an aspect-filled image. This is used
   * to automatically calculate the FOV if `fov` prop is not specified. If it
   * is, this prop is ignored.
   */
  viewportSize?: Size

  /**
   * Specifies if the component should use default styles.
   */
  usesDefaultStyles?: boolean
}>

/**
 * A slider for a {@link Panorama} component.
 *
 * @exports PanoramaSliderIndicator The indicator that appears when the slider
 *                                  is being dragged.
 * @exports PanoramaSliderReticle The reticle that indicates the FOV of the
 *                                backing {@link Panorama}.
 * @exports PanoramaSliderTrack The slide track.
 */
export const PanoramaSlider = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & PanoramaSliderProps>(({
  className,
  style,
  angle = 0,
  autoDimension = 'width',
  children,
  fov,
  speed = 1,
  src,
  usesDefaultStyles = false,
  viewportSize,
  zeroAnchor = 0,
  onAngleChange,
  onDragEnd,
  onDragStart,
  onLoadImageComplete,
  onLoadImageError,
  onLoadImageStart,
  onImageSizeChange,
  onPositionChange,
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

    return panoramaRect.width * (deg / 360)
  }

  const getAdjustedZeroAnchor = () => {
    if (panoramaRect.width <= 0) return zeroAnchor

    return ((panoramaRect.width - reticleWidth) * 0.5 + zeroAnchor * reticleWidth) / panoramaRect.width
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
  const panoramaRect = useRect(panoramaRef)

  const [imageSize, setImageSize] = useState<Size | undefined>()
  const [isDragging, setIsDragging] = useState(false)

  const aspectRatio = getAspectRatio()
  const reticleWidth = getReticleWidth()
  const adjustedZeroAnchor = getAdjustedZeroAnchor()

  const components = asComponentDict(children, {
    track: PanoramaSliderTrack,
    reticle: PanoramaSliderReticle,
    indicator: PanoramaSliderIndicator,
  })

  const fixedStyles = getFixedStyles({ autoDimension, panoramaRect, aspectRatio, reticleWidth })
  const defaultStyles = usesDefaultStyles ? getDefaultStyles({ isDragging }) : undefined

  return (
    <div {...props} ref={ref} className={classNames(className, { dragging: isDragging })} style={styles(style, fixedStyles.root)} data-component='panorama-slider'>
      <Panorama
        angle={angle}
        ref={panoramaRef}
        speed={speed}
        src={src}
        style={fixedStyles.panorama}
        zeroAnchor={adjustedZeroAnchor}
        onAngleChange={onAngleChange}
        onDragEnd={dragEndHandler}
        onDragStart={dragStartHandler}
        onLoadImageComplete={onLoadImageComplete}
        onLoadImageError={onLoadImageError}
        onLoadImageStart={onLoadImageStart}
        onImageSizeChange={setImageSize}
        onPositionChange={onPositionChange}
      />
      <div style={fixedStyles.body}>
        <div style={fixedStyles.controls}>
          {cloneStyledElement(components.track ?? <PanoramaSliderTrack style={defaultStyles?.track}/>, {
            style: styles(fixedStyles.track),
          })}
          {cloneStyledElement(components.reticle ?? <PanoramaSliderReticle style={defaultStyles?.reticle}/>, {
            style: styles(fixedStyles.reticle),
          })}
          {cloneStyledElement(components.track ?? <PanoramaSliderTrack style={defaultStyles?.track}/>, {
            style: styles(fixedStyles.track),
          })}
        </div>
      </div>
      {cloneStyledElement(components.indicator ?? <PanoramaSliderIndicator style={defaultStyles?.indicator}/>, {
        style: styles(fixedStyles.indicator),
      })}
    </div>
  )
})

Object.defineProperty(PanoramaSlider, 'displayName', { value: 'PanoramaSlider', writable: false })

export const PanoramaSliderTrack = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ ...props }, ref) => <div {...props} ref={ref} data-child='track'/>)

export const PanoramaSliderReticle = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ ...props }, ref) => <div {...props} ref={ref} data-child='reticle'/>)

export const PanoramaSliderIndicator = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ ...props }, ref) => <div {...props} ref={ref} data-child='indicator'/>)

function getDefaultStyles({ isDragging = false }) {
  return asStyleDict({
    track: {
      background: 'rgba(0, 0, 0, .7)',
      height: '100%',
    },
    reticle: {
      background: `rgba(0, 0, 0, ${isDragging ? 0 : 0.3})`,
      flex: '0 0 auto',
      height: '100%',
      transitionDuration: '100ms',
      transitionProperty: 'background',
      transitionTimingFunction: 'ease-out',
    },
    indicator: {
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
    },
  })
}

function getFixedStyles({ autoDimension = 'width', panoramaRect = new Rect(), aspectRatio = 0, reticleWidth = 0 }) {
  return asStyleDict({
    root: {
      ...autoDimension === 'width' ? {
        width: `${panoramaRect.height * aspectRatio}px`,
      } : {
        height: `${panoramaRect.width / aspectRatio}px`,
      },
    },
    body: {
      height: '100%',
      left: '0',
      overflow: 'hidden',
      pointerEvents: 'none',
      position: 'absolute',
      top: '0',
      width: '100%',
    },
    panorama: {
      height: '100%',
      width: '100%',
    },
    controls: {
      alignItems: 'center',
      display: 'flex',
      height: '100%',
      justifyContent: 'flex-start',
      left: '0',
      overflow: 'visible',
      position: 'absolute',
      top: '0',
      width: '100%',
    },
    track: {
      flex: '1 0 auto',
    },
    reticle: {
      width: `${reticleWidth}px`,
    },
    indicator: {
      width: `${reticleWidth}px`,
    },
  })
}
