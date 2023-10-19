import classNames from 'classnames'
import React, { forwardRef, useRef, useState, type HTMLAttributes, type PropsWithChildren } from 'react'
import { type Size } from 'spase'
import { useResizeEffect } from '../hooks/useResizeEffect'
import { asClassNameDict, asComponentDict, asStyleDict, cloneStyledElement, styles } from '../utils'
import { Panorama, type PanoramaProps } from './Panorama'

export type PanoramaSliderProps = HTMLAttributes<HTMLDivElement> & PanoramaProps & PropsWithChildren<{
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
export const PanoramaSlider = forwardRef<HTMLDivElement, PanoramaSliderProps>(({
  className,
  style,
  angle = 0,
  autoDimension = 'width',
  children,
  fov,
  speed = 1,
  src,
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

  const components = asComponentDict(children, {
    track: PanoramaSliderTrack,
    reticle: PanoramaSliderReticle,
    indicator: PanoramaSliderIndicator,
  })

  const fixedClassNames = asClassNameDict({
    root: classNames({
      dragging: isDragging,
    }),
    track: classNames({
      dragging: isDragging,
    }),
    reticle: classNames({
      dragging: isDragging,
    }),
    indicator: classNames({
      dragging: isDragging,
    }),
  })

  const fixedStyles = asStyleDict({
    root: {
      ...autoDimension === 'width' ? {
        width: `${size.height * aspectRatio}px`,
      } : {
        height: `${size.width / aspectRatio}px`,
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

  const defaultStyles = asStyleDict({
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

  return (
    <div
      {...props}
      ref={ref}
      className={classNames(className, fixedClassNames.root)}
      style={styles(style, fixedStyles.root)}
    >
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
        onImageLoadComplete={onImageLoadComplete}
        onImageLoadError={onImageLoadError}
        onImageLoadStart={onImageLoadStart}
        onImageSizeChange={setImageSize}
        onPositionChange={onPositionChange}
      />
      <div style={fixedStyles.body}>
        <div style={fixedStyles.controls}>
          {cloneStyledElement(components.track ?? <PanoramaSliderTrack style={defaultStyles.track}/>, {
            className: classNames(fixedClassNames.track),
            style: styles(fixedStyles.track),
          })}
          {cloneStyledElement(components.reticle ?? <PanoramaSliderReticle style={defaultStyles.reticle}/>, {
            className: classNames(fixedClassNames.reticle),
            style: styles(fixedStyles.reticle),
          })}
          {cloneStyledElement(components.track ?? <PanoramaSliderTrack style={defaultStyles.track}/>, {
            className: classNames(fixedClassNames.track),
            style: styles(fixedStyles.track),
          })}
        </div>
      </div>
      {cloneStyledElement(components.indicator ?? <PanoramaSliderIndicator style={defaultStyles.indicator}/>, {
        className: classNames(fixedClassNames.indicator),
        style: styles(fixedStyles.indicator),
      })}
    </div>
  )
})

Object.defineProperty(PanoramaSlider, 'displayName', { value: 'PanoramaSlider', writable: false })

export const PanoramaSliderTrack = ({ ...props }: HTMLAttributes<HTMLDivElement>) => <div {...props}/>

export const PanoramaSliderReticle = ({ ...props }: HTMLAttributes<HTMLDivElement>) => <div {...props}/>

export const PanoramaSliderIndicator = ({ ...props }: HTMLAttributes<HTMLDivElement>) => <div {...props}/>
