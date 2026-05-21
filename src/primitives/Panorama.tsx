import { type HTMLAttributes, type Ref, useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { Size } from 'spase'

import { useImageSize } from '../hooks/useImageSize.js'
import { useInertiaDrag } from '../hooks/useInertiaDrag.js'
import { useSize } from '../hooks/useSize.js'
import { asStyleDict } from '../utils/asStyleDict.js'

export namespace Panorama {
  /**
   * Type describing the props of {@link Panorama}.
   */
  export type Props = {
    /**
     * Reference to the root element.
     */
    ref?: Ref<HTMLDivElement>

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
     * Handler invoked when the position changes.
     *
     * @param position The current position.
     */
    onPositionChange?: (position: number) => void

    /**
     * Handler invoked when the angle changes.
     *
     * @param angle The current angle.
     */
    onAngleChange?: (angle: number) => void

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
     * @param size The actual size of the loaded image.
     */
    onImageSizeChange?: (size?: Size.Size) => void
  } & Omit<HTMLAttributes<HTMLDivElement>, 'aria-valuenow' | 'role'>
}

/**
 * A component containing a pannable 360° panorama image.
 */
export function Panorama({
  ref,
  angle = 0,
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
}: Panorama.Props) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const bodySize = useSize(bodyRef)
  const imageSize = useImageSize({ src }, {
    onError: onLoadImageError,
    onLoad: onLoadImageComplete,
    onLoadStart: onLoadImageStart,
  })
  const isDraggingRef = useRef(false)
  const displacementRef = useRef(0)

  const mapDragPositionToDisplacement = useCallback((pos: number, dx: number): number => {
    return pos - dx * speed
  }, [speed])

  const applyDisplacement = useCallback((value: number) => {
    if (!bodyRef.current) return

    bodyRef.current.style.backgroundPositionX = `${-value}px`
  }, [])

  useLayoutEffect(() => {
    if (isDraggingRef.current || !imageSize) return

    const newDisplacement = _mapAngleToDisplacement(angle, imageSize, bodySize, zeroAnchor)

    displacementRef.current = newDisplacement
    applyDisplacement(newDisplacement)
  }, [angle, imageSize, bodySize, zeroAnchor])

  useEffect(() => {
    onImageSizeChange?.(imageSize)
  }, [imageSize])

  useInertiaDrag(bodyRef, {
    onDragEnd: () => {
      isDraggingRef.current = false
      onDragEnd?.()
    },
    onDragMove: ({ x }) => {
      if (!imageSize) return

      const newDisplacement = mapDragPositionToDisplacement(displacementRef.current, x)
      const newAngle = _mapDisplacementToAngle(newDisplacement, imageSize, bodySize, zeroAnchor)
      const newPosition = _mapAngleToPosition(newAngle)

      displacementRef.current = newDisplacement
      applyDisplacement(newDisplacement)

      onAngleChange?.(newAngle)
      onPositionChange?.(newPosition)
    },
    onDragStart: () => {
      isDraggingRef.current = true
      onDragStart?.()
    },
  })

  return (
    <div
      {...props}
      ref={ref}
      aria-valuenow={angle}
      role='slider'
    >
      <div
        ref={bodyRef}
        style={{
          ...FIXED_STYLES.body,
          backgroundImage: `url(${src})`,
        }}
      />
    </div>
  )
}

const FIXED_STYLES = asStyleDict({
  body: {
    backgroundRepeat: 'repeat',
    backgroundSize: 'auto 100%',
    height: '100%',
    touchAction: 'none',
    width: '100%',
  },
})

function _getFilledImageSize(originalSize: Size.Size, sizeToFill: Size.Size): Size.Size {
  const { height: originalHeight, width: originalWidth } = originalSize
  const { height: filledHeight } = sizeToFill

  if (originalHeight <= 0) return Size.zero

  const aspectRatio = filledHeight / originalHeight
  const filledWidth = aspectRatio * originalWidth

  return Size.make(filledWidth, filledHeight)
}

function _mapAngleToDisplacement(angle: number, originalImageSize: Size.Size, componentSize: Size.Size, zeroAnchor: number): number {
  const { width: imageWidth } = _getFilledImageSize(originalImageSize, componentSize)
  const { width: componentWidth } = componentSize
  const offset = componentWidth * zeroAnchor

  return angle / 360 * imageWidth - offset
}

function _mapAngleToPosition(angle: number): number {
  return angle / 360
}

function _mapDisplacementToAngle(displacement: number, originalImageSize: Size.Size, componentSize: Size.Size, zeroAnchor: number): number {
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
