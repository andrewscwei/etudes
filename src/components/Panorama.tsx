import React, { forwardRef, useEffect, useRef, useState, type HTMLAttributes } from 'react'
import { Size } from 'spase'
import { useDragValueEffect } from '../hooks/useDragValueEffect'
import { useImageSize } from '../hooks/useImageSize'
import { useRect } from '../hooks/useRect'
import { asStyleDict } from '../utils'

export type PanoramaHTMLAttributes = Omit<HTMLAttributes<HTMLDivElement>, 'onResize'>

export type PanoramaProps = {
  /**
   * The current angle in degrees, 0.0 - 360.0, inclusive. When angle is 0 or
   * 360, the `zeroAnchor` position of the image is at the left bound of the
   * component.
   */
  angle?: number

  /**
   * The panning speed. This is expressed a multiplier of the number of pixels
   * dragged, i.e. when set to 1, the image will shift the same amount of pixels
   * that were dragged.
   */
  speed?: number

  /**
   * The source URL of the image.
   */
  src?: string

  /**
   * A decimal percentage of the image width indicating where 0° should be,
   * i.e. if `zeroAnchor` is `0`, the `angle` would be 0° when the left edge of
   * the image is at the left edge of the component.
   */
  zeroAnchor?: number

  /**
   * Handler invoked when the positionchanges. This can either be invoked from
   * the `angle` prop being changed or from the image being dragged.
   *
   * @param position The current position.
   * @param isDragging Specifies if the position change is due to dragging.
   */
  onPositionChange?: (position: number, isDragging: boolean) => void

  /**
   * Handler invoked when the angle changes. This can either be invoked from the
   * `angle` prop being changed or from the image being dragged. When `angle` is
   * being double-binded, ensure that the value is only being set by this
   * handler when `isDragging` is `true` to avoid potential update overflow.
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
   * Handler invoked when the image size changes. This is the actual size of the
   * loaded image. When no images are loaded yet, the size is `undefined`.
   *
   * @param size The actual size of the loaded iamge. If no images are loaded
   *               yet, the size is `undefined`.
   */
  onImageSizeChange?: (size?: Size) => void
}

/**
 * A component containing a pannable 360° panorama image. The angle supports two-way binding.
 */
export const Panorama = forwardRef<HTMLDivElement, PanoramaHTMLAttributes & PanoramaProps>(({
  angle: externalAngle = 0,
  speed = 1,
  src,
  zeroAnchor = 0,
  onAngleChange,
  onPositionChange,
  onDragStart,
  onDragEnd,
  onLoadImageStart,
  onLoadImageComplete,
  onLoadImageError,
  onImageSizeChange,
  ...props
}, ref) => {
  const mapDragPositionToDisplacement = (currentPosition: number, dx: number, dy: number): number => {
    const newDisplacement = currentPosition - dx * speed

    return newDisplacement
  }

  const bodyRef = useRef<HTMLDivElement>(null)
  const bodyRect = useRect(bodyRef)
  const imageSize = useImageSize({ src }, {
    onLoadStart: onLoadImageStart,
    onLoadComplete: onLoadImageComplete,
    onLoadError: onLoadImageError,
  })
  const [angle, setAngle] = useState(externalAngle)

  const { isDragging: [isDragging], value: [displacement, setDisplacement] } = useDragValueEffect(bodyRef, {
    initialValue: 0,
    transform: mapDragPositionToDisplacement,
    onDragStart,
    onDragEnd,
  })

  useEffect(() => {
    if (isDragging || !imageSize) return

    const newDisplacement = getDisplacementFromAngle(externalAngle, imageSize, bodyRect.size, zeroAnchor)

    if (newDisplacement !== displacement) {
      setDisplacement(newDisplacement)
    }

    if (externalAngle !== angle) {
      setAngle(externalAngle)
    }
  }, [externalAngle, imageSize, bodyRect.width, bodyRect.height, zeroAnchor])

  useEffect(() => {
    if (!isDragging || !imageSize) return

    const newAngle = getAngleFromDisplacement(displacement, imageSize, bodyRect.size, zeroAnchor)

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

  const fixedStyles = getFixedStyles({ src, displacement })

  return (
    <div {...props} ref={ref} data-component='panorama'>
      <div ref={bodyRef} style={fixedStyles.body}/>
    </div>
  )
})

Object.defineProperty(Panorama, 'displayName', { value: 'Panorama', writable: false })

function getFixedStyles({ src = '', displacement = NaN } = {}) {
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

function getFilledImageSize(originalSize: Size, sizeToFill: Size): Size {
  const { width: originalWidth, height: originalHeight } = originalSize
  const { height: filledHeignt } = sizeToFill

  if (originalHeight <= 0) return new Size()

  const aspectRatio = filledHeignt / originalHeight
  const filledWidth = aspectRatio * originalWidth

  return new Size([filledWidth, filledHeignt])
}

function getDisplacementFromAngle(angle: number, originalImageSize: Size, componentSize: Size, zeroAnchor: number): number {
  const { width: imageWidth } = getFilledImageSize(originalImageSize, componentSize)
  const { width: componentWidth } = componentSize
  const offset = componentWidth * zeroAnchor

  return angle / 360 * imageWidth - offset
}

function getAngleFromDisplacement(displacement: number, originalImageSize: Size, componentSize: Size, zeroAnchor: number): number {
  const { width: imageWidth } = getFilledImageSize(originalImageSize, componentSize)
  const { width: componentWidth } = componentSize
  const offset = componentWidth * zeroAnchor

  let angle = (displacement + offset) % imageWidth / imageWidth * 360
  while (angle < 0) angle += 360

  return angle
}
