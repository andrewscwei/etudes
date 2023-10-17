import React, { forwardRef, useEffect, useRef, useState, type HTMLAttributes } from 'react'
import { Size } from 'spase'
import { useDragValueEffect } from './hooks/useDragValueEffect'
import { useLoadImageEffect } from './hooks/useLoadImageEffect'
import { useResizeEffect } from './hooks/useResizeEffect'
import { asStyleDict } from './utils'

export type PanoramaProps = Omit<HTMLAttributes<HTMLDivElement>, 'onResize'> & {
  /**
   * The current angle in degrees, 0.0 - 360.0, inclusive. When angle is 0 or
   * 360, the left bound of the image is at the center of the component.
   */
  angle?: number

  /**
   * The panning speed. This is a multiplier to the number of pixels dragged,
   * i.e. when set to 1, the image will shift the same amount of pixels that
   * were dragged.
   */
  speed?: number

  /**
   * The source URL of the image.
   */
  src?: string

  /**
   * A decimal percentage of the component width indicating where 0° should be,
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
  onImageLoadStart?: () => void

  /**
   * Handler invoked when the image is done loading.
   *
   * @param imageElement The loaded image element.
   */
  onImageLoadComplete?: (imageElement: HTMLImageElement) => void

  /**
   * Handler invoked when there is an error loading the image.
   */
  onImageLoadError?: () => void

  /**
   * Handler invoked when the image size changes. This is the actual size of the
   * loaded image. When no images are loaded yet, the size is `undefined`.
   *
   * @param size The actual size of the loaded iamge. If no images are loaded
   *               yet, the size is `undefined`.
   */
  onImageSizeChange?: (size?: Size) => void

  /**
   * Handler invoked when the size of this component changes.
   *
   * @param size The size of this component.
   */
  onResize?: (size: Size) => void
}

/**
 * A component containing a pannable 360° panorama image. The angle supports
 * two-way binding.
 */
export const Panorama = forwardRef<HTMLDivElement, PanoramaProps>(({
  angle: externalAngle = 0,
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
  ...props
}, ref) => {
  const mapDragPositionToDisplacement = (currentPosition: number, dx: number, dy: number): number => {
    const newDisplacement = currentPosition - dx * speed

    return newDisplacement
  }

  const bodyRef = useRef<HTMLDivElement>(null)
  const [size] = useResizeEffect(bodyRef, { onResize })
  const [angle, setAngle] = useState(externalAngle)

  const { isLoading: [isLoading], imageSize: [imageSize] } = useLoadImageEffect(src, {
    onImageLoadComplete,
    onImageLoadError,
    onImageSizeChange,
  })

  const { isDragging: [isDragging], value: [displacement, setDisplacement] } = useDragValueEffect(bodyRef, {
    initialValue: 0,
    transform: mapDragPositionToDisplacement,
    onDragStart,
    onDragEnd,
  })

  useEffect(() => {
    if (isDragging || isLoading || !imageSize) return

    const newDisplacement = getDisplacementFromAngle(externalAngle, imageSize, size, zeroAnchor)

    if (newDisplacement !== displacement) {
      setDisplacement(newDisplacement)
    }

    if (externalAngle !== angle) {
      setAngle(externalAngle)
    }
  }, [externalAngle, isLoading, imageSize, size, zeroAnchor])

  useEffect(() => {
    if (!isDragging || !imageSize) return

    const newAngle = getAngleFromDisplacement(displacement, imageSize, size, zeroAnchor)

    if (angle !== newAngle) {
      setAngle(newAngle)
    }
  }, [displacement, imageSize, size, zeroAnchor])

  useEffect(() => {
    onAngleChange?.(angle, isDragging)
    onPositionChange?.(angle / 360, isDragging)
  }, [angle])

  const fixedStyles = asStyleDict({
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

  return (
    <div {...props} ref={ref}>
      <div ref={bodyRef} style={fixedStyles.body}/>
    </div>
  )
})

Object.defineProperty(Panorama, 'displayName', { value: 'Panorama', writable: false })

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
