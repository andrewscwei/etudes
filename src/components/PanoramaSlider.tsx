import clsx from 'clsx'
import { forwardRef, useRef, useState, type HTMLAttributes } from 'react'
import { Rect, type Size } from 'spase'
import { useRect } from '../hooks/index.js'
import { asComponentDict, asStyleDict, cloneStyledElement, styles } from '../utils/index.js'
import { Panorama, type PanoramaProps } from './Panorama.js'

export type PanoramaSliderProps = PanoramaProps & {
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
}

/**
 * A slider for a {@link Panorama} component.
 *
 * @exports PanoramaSliderIndicator The indicator that appears when the slider
 *                                  is being dragged.
 * @exports PanoramaSliderReticle The reticle that indicates the FOV of the
 *                                backing {@link Panorama}.
 * @exports PanoramaSliderTrack The slide track.
 */
export const PanoramaSlider = /* #__PURE__ */ forwardRef<HTMLDivElement, Readonly<PanoramaSliderProps>>(({
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

  return (
    <div
      {...props}
      ref={ref}
      className={clsx(className, { dragging: isDragging })}
      style={styles(style, fixedStyles.root)}
    >
      <Panorama
        ref={panoramaRef}
        angle={angle}
        speed={speed}
        src={src}
        style={fixedStyles.panorama}
        zeroAnchor={adjustedZeroAnchor}
        onAngleChange={onAngleChange}
        onDragEnd={dragEndHandler}
        onDragStart={dragStartHandler}
        onImageSizeChange={setImageSize}
        onLoadImageComplete={onLoadImageComplete}
        onLoadImageError={onLoadImageError}
        onLoadImageStart={onLoadImageStart}
        onPositionChange={onPositionChange}
      />
      <div style={fixedStyles.body}>
        <div style={fixedStyles.controls}>
          {cloneStyledElement(components.track ?? <PanoramaSliderTrack/>, {
            className: clsx({ dragging: isDragging }),
            style: styles(fixedStyles.track),
          })}
          {cloneStyledElement(components.reticle ?? <PanoramaSliderReticle/>, {
            className: clsx({ dragging: isDragging }),
            style: styles(fixedStyles.reticle),
          })}
          {cloneStyledElement(components.track ?? <PanoramaSliderTrack/>, {
            className: clsx({ dragging: isDragging }),
            style: styles(fixedStyles.track),
          })}
        </div>
      </div>
      {cloneStyledElement(components.indicator ?? <PanoramaSliderIndicator/>, {
        className: clsx({ dragging: isDragging }),
        style: styles(fixedStyles.indicator),
      })}
    </div>
  )
})

export const PanoramaSliderTrack = /* #__PURE__ */ forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ ...props }, ref) => (
  <div {...props} ref={ref}/>
))

export const PanoramaSliderReticle = /* #__PURE__ */ forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ ...props }, ref) => (
  <div {...props} ref={ref}/>
))

export const PanoramaSliderIndicator = /* #__PURE__ */ forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ ...props }, ref) => (
  <div {...props} ref={ref}/>
))

function getFixedStyles({ autoDimension = 'width', panoramaRect = Rect.make(), aspectRatio = 0, reticleWidth = 0 }) {
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

PanoramaSlider.displayName = 'PanoramaSlider'
