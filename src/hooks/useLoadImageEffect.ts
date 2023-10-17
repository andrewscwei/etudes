import { useEffect, useRef, useState, type DependencyList, type Dispatch, type SetStateAction } from 'react'
import { Size } from 'spase'

type ReturnedStates = {
  /**
   * A tuple consisting of a stateful value indicating if the image is loading,
   * and a function that updates the loading state.
   */
  isLoading: [boolean, Dispatch<SetStateAction<boolean>>]

  /**
   * A tuple consisting of a stateful value representing the size of the image,
   * and a function that updates the size.
   */
  imageSize: [Size | undefined, Dispatch<SetStateAction<Size | undefined>>]
}

type Options = {
  /**
   * `srcset` attribute of the image.
   */
  srcSet?: string

  /**
   * `sizes` attribute of the image.
   */
  sizes?: string

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
   * Handler invoked when the image size changes. If there is no loaded image,
   * the size is `undefined`.
   *
   * @param size The original image size.
   */
  onImageSizeChange?: (size?: Size) => void
}

function getImageSize(imageElement: HTMLImageElement): Size {
  return new Size([imageElement.width, imageElement.height])
}

/**
 * Hook for preloading an image.
 *
 * @param src The image source.
 * @param options See {@link Options}.
 * @param deps Additional dependencies.
 *
 * @returns See {@link ReturnedStates}.
 */
export function useLoadImageEffect(
  src?: string, {
    srcSet,
    sizes,
    onImageLoadComplete,
    onImageLoadError,
    onImageSizeChange,
  }: Options = {},
  deps?: DependencyList,
): ReturnedStates {
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
    if (!src) return

    setIsLoading(true)

    imageRef.current = new Image()
    imageRef.current.src = src
    if (srcSet) imageRef.current.srcset = srcSet
    if (sizes) imageRef.current.sizes = sizes
    imageRef.current.addEventListener('load', imageLoadCompleteHandler)
    imageRef.current.addEventListener('error', imageLoadErrorHandler)

    return () => {
      imageRef.current?.removeEventListener('load', imageLoadCompleteHandler)
      imageRef.current?.removeEventListener('error', imageLoadErrorHandler)
      imageRef.current = undefined
    }
  }, [src, ...deps ? deps : []])

  useEffect(() => {
    onImageSizeChange?.(imageSize)
  }, [imageSize])

  return {
    isLoading: [isLoading, setIsLoading],
    imageSize: [imageSize, setImageSize],
  }
}
