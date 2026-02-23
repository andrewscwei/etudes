import { forwardRef, type HTMLAttributes, useCallback, useEffect, useRef, useState } from 'react'
import { Rect, Size } from 'spase'

import { useImageSize } from '../hooks/useImageSize.js'
import { useInertiaDragValue } from '../hooks/useInertiaDragValue.js'
import { useRect } from '../hooks/useRect.js'
import { asStyleDict } from '../utils/asStyleDict.js'

export namespace Panorama {
  /**
   * Type describing the props of {@link Panorama}.
   */
  export type Props = {
    /**
     * The current angle in degrees, 0.0 - 360.0, inclusive. When angle is 0 or
     * 360, the `zeroAnchor` position of the image is at the left bound of the
     * component.
     */
    angle?: number

    /**
     * The panning speed. This is expressed a multiplier of the number of pixels
     * dragged, i.e. when set to 1, the image will shift the same amount of
     * pixels that were dragged.
     */
    speed?: number

    /**
     * The source URL of the image.
     */
    src: string

    /**
     * A decimal percentage of the image width indicating where 0° should be,
     * i.e. if `zeroAnchor` is `0`, the `angle` would be 0° when the left edge
     * of the image is at the left edge of the component.
     */
    zeroAnchor?: number

    /**
     * Handler invoked when the position changes. This can either be invoked
     * from the `angle` prop being changed or from the image being dragged.
     *
     * @param position The current position.
     * @param isDragging Specifies if the position change is due to dragging.
     */
    onPositionChange?: (position: number, isDragging: boolean) => void

    /**
     * Handler invoked when the angle changes. This can either be invoked from
     * the `angle` prop being changed or from the image being dragged. When
     * `angle` is being double-bound, ensure that the value is only being set by
     * this handler when `isDragging` is `true` to avoid potential update
     * overflow.
     *
     * @param angle The current angle.
     * @param isDragging Specifies if the angle change is due to dragging.
     */
    onAngleChange?: (angle: number, isDragging: boolean) => void

    /**
     * Handler invoked when dragging starts.
     */
    onDragStart?: () => void

    /**
     * Handler invoked when dragging ends.
     */
    onDragEnd?: () => void

    /**
     * Handler invoked when the image begins loading.
     */
    onLoadImageStart?: () => void

    /**
     * Handler invoked when the image is done loading.
     */
    onLoadImageComplete?: () => void

    /**
     * Handler invoked when there is an error loading the image.
     */
    onLoadImageError?: () => void

    /**
     * Handler invoked when the image size changes. This is the actual size of
     * the loaded image. When no images are loaded yet, the size is `undefined`.
     *
     * @param size The actual size of the loaded image. If no images are loaded
     *               yet, the size is `undefined`.
     */
    onImageSizeChange?: (size?: Size) => void
  } & Omit<HTMLAttributes<HTMLDivElement>, 'aria-valuenow' | 'role'>
}

/**
 * A component containing a pannable 360° panorama image. The angle supports
 * two-way binding.
 */
export const Panorama = /* #__PURE__ */ forwardRef<HTMLDivElement, Readonly<Panorama.Props>>((
  {
    angle: externalAngle = 0,
    speed = 1,
    src,
    zeroAnchor = 0,
    onAngleChange,
    onDragEnd,
    onDragStart,
    onImageSizeChange,
    onLoadImageComplete,
    onLoadImageError,
    onLoadImageStart,
    onPositionChange,
    ...props
  },
  ref,
) => {
  const mapDragPositionToDisplacement = useCallback((currentPosition: number, dx: number, _: number): number => {
    const newDisplacement = currentPosition - dx * speed

    return newDisplacement
  }, [speed])

  const bodyRef = useRef<HTMLDivElement>(null)
  const bodyRect = useRect(bodyRef)
  const imageSize = useImageSize({ src }, {
    onError: onLoadImageError,
    onLoad: onLoadImageComplete,
    onLoadStart: onLoadImageStart,
  })
  const [angle, setAngle] = useState(externalAngle)

  const { setValue: setDisplacement, value: displacement, isDragging } = useInertiaDragValue(bodyRef, {
    initialValue: 0,
    transform: mapDragPositionToDisplacement,
    onDragEnd,
    onDragStart,
  })

  useEffect(() => {
    if (isDragging || !imageSize) return

    const newDisplacement = _getDisplacementFromAngle(externalAngle, imageSize, Rect.size(bodyRect), zeroAnchor)

    if (newDisplacement !== displacement) {
      setDisplacement(newDisplacement)
    }

    if (externalAngle !== angle) {
      setAngle(externalAngle)
    }
  }, [externalAngle, imageSize, bodyRect.width, bodyRect.height, zeroAnchor])

  useEffect(() => {
    if (!isDragging || !imageSize) return

    const newAngle = _getAngleFromDisplacement(displacement, imageSize, Rect.size(bodyRect), zeroAnchor)

    if (angle !== newAngle) {
      setAngle(newAngle)
    }
  }, [displacement, imageSize, bodyRect.width, bodyRect.height, zeroAnchor])

  useEffect(() => {
    onAngleChange?.(angle, isDragging)
    onPositionChange?.(angle / 360, isDragging)
  }, [angle])

  useEffect(() => {
    onImageSizeChange?.(imageSize)
  }, [imageSize?.width, imageSize?.height])

  const fixedStyles = _getFixedStyles({ displacement, src })

  return (
    <div
      {...props}
      ref={ref}
      aria-valuenow={angle}
      role='slider'
    >
      <div ref={bodyRef} style={fixedStyles.body}/>
    </div>
  )
})

function _getFixedStyles({ displacement = NaN, src = '' }) {
  return asStyleDict({
    body: {
      backgroundImage: `url(${src})`,
      backgroundPositionX: `${-displacement}px`,
      backgroundRepeat: 'repeat',
      backgroundSize: 'auto 100%',
      height: '100%',
      touchAction: 'none',
      width: '100%',
    },
  })
}

function _getFilledImageSize(originalSize: Size, sizeToFill: Size): Size {
  const { height: originalHeight, width: originalWidth } = originalSize
  const { height: filledHeight } = sizeToFill

  if (originalHeight <= 0) return Size.zero

  const aspectRatio = filledHeight / originalHeight
  const filledWidth = aspectRatio * originalWidth

  return Size.make(filledWidth, filledHeight)
}

function _getDisplacementFromAngle(angle: number, originalImageSize: Size, componentSize: Size, zeroAnchor: number): number {
  const { width: imageWidth } = _getFilledImageSize(originalImageSize, componentSize)
  const { width: componentWidth } = componentSize
  const offset = componentWidth * zeroAnchor

  return angle / 360 * imageWidth - offset
}

function _getAngleFromDisplacement(displacement: number, originalImageSize: Size, componentSize: Size, zeroAnchor: number): number {
  const { width: imageWidth } = _getFilledImageSize(originalImageSize, componentSize)
  const { width: componentWidth } = componentSize
  const offset = componentWidth * zeroAnchor

  let angle = (displacement + offset) % imageWidth / imageWidth * 360
  while (angle < 0) angle += 360

  return angle
}

if (process.env.NODE_ENV === 'development') {
  Panorama.displayName = 'Panorama'
}
