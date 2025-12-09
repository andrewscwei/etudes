import clsx from 'clsx'
import { forwardRef, useCallback, useRef, useState, type HTMLAttributes } from 'react'
import { Rect, type Size } from 'spase'
import { useRect } from '../hooks/useRect.js'
import { Panorama } from '../primitives/Panorama.js'
import { asComponentDict } from '../utils/asComponentDict.js'
import { asStyleDict } from '../utils/asStyleDict.js'
import { Styled } from '../utils/Styled.js'
import { styles } from '../utils/styles.js'

const _PanoramaSlider = /* #__PURE__ */ forwardRef<HTMLDivElement, Readonly<PanoramaSlider.Props>>((
  {
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
  },
  ref,
) => {
  const panoramaRef = useRef<HTMLDivElement>(null)
  const panoramaRect = useRect(panoramaRef)

  const [imageSize, setImageSize] = useState<Size | undefined>()
  const [isDragging, setIsDragging] = useState(false)

  const getAspectRatio = useCallback(() => {
    if (!imageSize) return 0
    const { width, height } = imageSize
    if (height === 0) return 0

    return width / height
  }, [imageSize?.width, imageSize?.height])

  const aspectRatio = getAspectRatio()

  const getReticleWidth = useCallback(() => {
    const deg = Math.min(360, Math.max(0, fov ?? (viewportSize ? viewportSize.width / (viewportSize.height * aspectRatio) * 360 : 0)))

    return panoramaRect.width * (deg / 360)
  }, [viewportSize?.width, viewportSize?.height, aspectRatio, panoramaRect.width, fov])

  const reticleWidth = getReticleWidth()

  const getAdjustedZeroAnchor = useCallback(() => {
    if (panoramaRect.width <= 0) return zeroAnchor

    return ((panoramaRect.width - reticleWidth) * 0.5 + zeroAnchor * reticleWidth) / panoramaRect.width
  }, [panoramaRect.width, reticleWidth, zeroAnchor])

  const adjustedZeroAnchor = getAdjustedZeroAnchor()

  const dragStartHandler = useCallback(() => {
    setIsDragging(true)
    onDragStart?.()
  }, [onDragStart])

  const dragEndHandler = useCallback(() => {
    setIsDragging(false)
    onDragEnd?.()
  }, [onDragEnd])

  const components = asComponentDict(children, {
    track: _Track,
    reticle: _Reticle,
    indicator: _Indicator,
  })

  const fixedStyles = _getFixedStyles({ autoDimension, panoramaRect, aspectRatio, reticleWidth })

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
          <Styled className={clsx({ dragging: isDragging })} element={components.track ?? <_Track/>} style={fixedStyles.track}/>
          <Styled className={clsx({ dragging: isDragging })} element={components.reticle ?? <_Reticle/>} style={fixedStyles.reticle}/>
          <Styled className={clsx({ dragging: isDragging })} element={components.track ?? <_Track/>} style={fixedStyles.track}/>
        </div>
      </div>
      <Styled className={clsx({ dragging: isDragging })} element={components.indicator ?? <_Indicator/>} style={fixedStyles.indicator}/>
    </div>
  )
})

const _Indicator = ({ ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div {...props}/>
)

const _Reticle = ({ ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div {...props}/>
)

const _Track = ({ ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div {...props}/>
)

export namespace PanoramaSlider {
  /**
   * Type describing the props of {@link PanoramaSlider}.
   */
  export type Props = Panorama.Props & {
    /**
     * Field-of-view (0.0 - 360.0 degrees, inclusive) that represents the size
     * of the reticle. 360 indicates the reticle covers the entire image. If
     * this is unspecified, the component will attempt to automatically
     * calculate the FOV using the `viewportSize` prop.
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
     * Size of the viewport that this component is controlling. A viewport can
     * be thought of as a DOM element containing an aspect-filled image. This is
     * used to automatically calculate the FOV if `fov` prop is not specified.
     * If it is, this prop is ignored.
     */
    viewportSize?: Size
  }
}

/**
 * A slider for a {@link Panorama}.
 *
 * @exports Panorama.SliderIndicator Component for the active indicator that
 *                                  appears when the slider is dragged.
 * @exports Panorama.SliderReticle Component for the reticle that indicates the
 *                                FOV of the backing {@link Panorama}.
 * @exports Panorama.SliderTrack Component for the slide track.
 */
export const PanoramaSlider = /* #__PURE__ */ Object.assign(_PanoramaSlider, {
  /**
   * Component for the active indicator of a {@link PanoramaSlider}.
   */
  Indicator: _Indicator,

  /**
   * Component for the active reticle of a {@link PanoramaSlider}.
   */
  Reticle: _Reticle,

  /**
   * Component for the slide track of a {@link PanoramaSlider}.
   */
  Track: _Track,
})

function _getFixedStyles({ autoDimension = 'width', panoramaRect = Rect.zero, aspectRatio = 0, reticleWidth = 0 }) {
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

if (process.env.NODE_ENV === 'development') {
  _PanoramaSlider.displayName = 'PanoramaSlider'

  _Indicator.displayName = 'PanoramaSlider.Indicator'
  _Reticle.displayName = 'PanoramaSlider.Reticle'
  _Track.displayName = 'PanoramaSlider.Track'
}
