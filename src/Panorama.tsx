import React, { HTMLAttributes, useEffect, useRef, useState } from 'react'
import { Rect, Size } from 'spase'
import styled from 'styled-components'
import useDragEffect from './hooks/useDragEffect'
import useResizeEffect from './hooks/useResizeEffect'

export type Props = HTMLAttributes<HTMLDivElement> & {
  /**
   * The current angle in degrees, 0.0 - 360.0, inclusive. When angle is 0 or 360, the left bound of
   * the image is at the center of the component.
   */
  angle?: number

  /**
   * The panning speed. This is a multiplier to the number of pixels dragged, i.e. when set to 1,
   * the image will shift the same amount of pixels that were dragged.
   */
  speed?: number

  /**
   * The source URL of the image.
   */
  src: string

  /**
   * A decimal percentage of the component width indicating where 0° should be, i.e. if `zeroAnchor`
   * is `0`, the `angle` would be 0° when the left edge of the image is at the left edge of the
   * component.
   */
  zeroAnchor?: number

  /**
   * Handler invoked when the position (0.0 - 1.0, inclusive) is changed.
   */
  onPositionChange?: (displacement: number, isDragging: boolean) => void

  /**
   * Handler invoked when the angle is changed.
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
   * @param imageElement - The loaded image element.
   */
  onImageLoadComplete?: (imageElement: HTMLImageElement) => void

  /**
   * Handler invoked when there is an error loading the image.
   */
  onImageLoadError?: () => void

  /**
   * Handler invoked when the image size changes. This is the actual size of the loaded image. When
   * no images are loaded yet, the size is `undefined`.
   *
   * @param size - The actual size of the loaded iamge. If no images are loaded yet, the size is
   *               `undefined`.
   */
  onImageSizeChange?: (size?: Size) => void
}

function getImageSize(imageElement: HTMLImageElement): Size {
  return new Size([imageElement.width, imageElement.height])
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
  const offset = componentWidth*zeroAnchor
  return (angle / 360) * imageWidth - offset
}

function getAngleFromDisplacement(displacement: number, originalImageSize: Size, componentSize: Size, zeroAnchor: number): number {
  const { width: imageWidth } = getFilledImageSize(originalImageSize, componentSize)
  const { width: componentWidth } = componentSize
  const offset = componentWidth*zeroAnchor

  let angle = ((displacement + offset) % imageWidth) / imageWidth*360
  while (angle < 0) angle += 360
  return angle
}

/**
 * A component containing a pannable 360° panorama image. The angle supports two-way binding.
 *
 * @requires react
 * @requires styled-component
 * @requires spase
 * @requires interactjs
 */
export default function Panorama({
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
  ...props
}: Props) {
  function setAngleRef(angle: number) {
    if (angleRef.current === angle) return
    angleRef.current = angle
    setAngle(angle)
  }

  function setDisplacementRef(displacement: number) {
    if (displacementRef.current === displacement) return
    displacementRef.current = displacement
    setDisplacement(displacement)
  }

  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement | undefined>(undefined)
  const angleRef = useRef(angle)
  const displacementRef = useRef(containerRef.current && imageRef.current ? getDisplacementFromAngle(angle, getImageSize(imageRef.current), (Rect.from(containerRef.current) ?? new Rect()).size, zeroAnchor) : 0)

  const [_angle, setAngle] = useState(angleRef.current)
  const [displacement, setDisplacement] = useState(displacementRef.current)
  const [isLoading, setIsLoading] = useState(true)
  const [imageSize, setImageSize] = useState<Size | undefined>(undefined)
  const { isDragging: [isDragging, setIsDragging] } = useDragEffect(containerRef, { initialValue: NaN, onDragStart, onDragMove, onDragEnd }, [speed, zeroAnchor])
  const [size, setSize] = useResizeEffect(containerRef)

  function _onImageLoadComplete(event: Event) {
    const imageElement = event.currentTarget as HTMLImageElement
    const imageSize = getImageSize(imageElement)

    setIsLoading(false)

    const displacement = getDisplacementFromAngle(angle, imageSize, (Rect.from(containerRef.current) ?? new Rect()).size, zeroAnchor)
    setDisplacementRef(displacement)

    setImageSize(imageSize)

    onImageLoadComplete?.(imageElement)
  }

  function _onImageLoadError(event: Event) {
    setIsLoading(false)

    setImageSize(undefined)

    onImageLoadError?.()
  }

  function onDragMove(dx: number, dy: number) {
    if (!imageRef.current || !containerRef.current) return

    const newDisplacement = displacementRef.current - (dx * speed)
    const newAngle = getAngleFromDisplacement(newDisplacement, getImageSize(imageRef.current), (Rect.from(containerRef.current) ?? new Rect()).size, zeroAnchor)

    setDisplacementRef(newDisplacement)
    setAngleRef(newAngle)
  }

  useEffect(() => {
    setIsLoading(true)

    imageRef.current = new Image()
    imageRef.current.src = src
    imageRef.current.addEventListener('load', _onImageLoadComplete)
    imageRef.current.addEventListener('error', _onImageLoadError)

    return () => {
      imageRef.current?.removeEventListener('load', _onImageLoadComplete)
      imageRef.current?.removeEventListener('error', _onImageLoadError)
      imageRef.current = undefined
    }
  }, [src])

  useEffect(() => {
    console.log('FOO', size)
  }, [size])

  useEffect(() => {
    onImageSizeChange?.(imageSize)
  }, [imageSize])

  useEffect(() => {
    onAngleChange?.(_angle, isDragging)
    onPositionChange?.(_angle / 360, isDragging)
  }, [_angle])

  useEffect(() => {
    if (isDragging || isLoading) return
    if (angle === _angle) return
    setIsDragging(false)
    setAngleRef(angle)
  }, [angle])

  return (
    <StyledRoot ref={containerRef} {...props}>
      <StyledImageContainer
        style={{
          backgroundImage: `url(${src})`,
          backgroundPositionX: `${-displacement}px`,
        }}
      />
    </StyledRoot>
  )
}

const StyledImageContainer = styled.div`
  background-repeat: repeat;
  background-size: auto 100%;
  height: 100%;
  left: 0;
  margin: 0;
  padding: 0;
  position: absolute;
  top: 0;
  width: 100%;
`

const StyledRoot = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex: 0 0 auto;
  justify-content: center;
  padding: 0;
  position: relative;
  touch-action: none;

  > div {
    height: 100%;
    left: 0;
    margin: 0;
    padding: 0;
    position: absolute;
    top: 0;
    width: 100%;
  }
`
