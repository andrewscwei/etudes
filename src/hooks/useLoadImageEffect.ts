import { DependencyList, Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { Size } from 'spase'

type ReturnedStates = {
  isLoading: [boolean, Dispatch<SetStateAction<boolean>>]
  imageSize: [Size | undefined, Dispatch<SetStateAction<Size | undefined>>]
}

type Options = {

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
   * Handler invoked when the image size changes. If there is no loaded image, the size is
   * `undefined`.
   *
   * @param size - The original image size.
   */
  onImageSizeChange?: (size?: Size) => void
}

function getImageSize(imageElement: HTMLImageElement): Size {
  return new Size([imageElement.width, imageElement.height])
}

export default function useLoadImageEffect(src: string, { onImageLoadComplete, onImageLoadError, onImageSizeChange }: Options = {}, deps?: DependencyList): ReturnedStates {
  const imageLoadCompleteHandler = (event: Event) => {
    const imageElement = event.currentTarget as HTMLImageElement
    const imageSize = getImageSize(imageElement)

    setIsLoading(false)
    setImageSize(imageSize)

    onImageLoadComplete?.(imageElement)
  }

  const imageLoadErrorHandler = (event: Event) => {
    setIsLoading(false)
    setImageSize(undefined)

    onImageLoadError?.()
  }

  const imageRef = useRef<HTMLImageElement | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [imageSize, setImageSize] = useState<Size | undefined>(undefined)

  useEffect(() => {
    setIsLoading(true)

    imageRef.current = new Image()
    imageRef.current.src = src
    imageRef.current.addEventListener('load', imageLoadCompleteHandler)
    imageRef.current.addEventListener('error', imageLoadErrorHandler)

    return () => {
      imageRef.current?.removeEventListener('load', imageLoadCompleteHandler)
      imageRef.current?.removeEventListener('error', imageLoadErrorHandler)
      imageRef.current = undefined
    }
  }, [src])

  useEffect(() => {
    onImageSizeChange?.(imageSize)
  }, [imageSize])

  return {
    isLoading: [isLoading, setIsLoading],
    imageSize: [imageSize, setImageSize],
  }
}