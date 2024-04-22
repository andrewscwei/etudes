import { useState } from 'react'
import { Size } from 'spase'
import { useLoadImageEffect, type UseLoadImageEffectOptions, type UseLoadImageEffectParams } from './useLoadImageEffect'

type Params = UseLoadImageEffectParams

type Options = UseLoadImageEffectOptions & {
  /**
   * If `false`, the size will be reset to `undefined` when the image begins
   * loading or when an error occurs. Defaults to `true`.
   */
  preservesSizeBetweenLoads?: boolean
}

/**
 * Hook for retrieving the size of an image.
 *
 * @param params See {@link Params}.
 * @param options See {@link Options}.
 *
 * @returns The actual size of the image if loading was successful, `undefined`
 *          otherwise.
 */
export function useImageSize({ src, srcSet, sizes }: Params, { preservesSizeBetweenLoads = true, onLoadStart, onLoadComplete, onLoadError }: Options = {}): Size | undefined {
  const handleLoad = (element: HTMLImageElement) => {
    if (!preservesSizeBetweenLoads) setImageSize(undefined)

    onLoadStart?.(element)
  }

  const handleLoadComplete = (element: HTMLImageElement) => {
    setImageSize(getSize(element))

    onLoadComplete?.(element)
  }

  const handleLoadError = (element: HTMLImageElement) => {
    if (!preservesSizeBetweenLoads) setImageSize(undefined)

    onLoadError?.(element)
  }

  const [imageSize, setImageSize] = useState<Size | undefined>()

  useLoadImageEffect({ src, srcSet, sizes }, {
    onLoadStart: t => handleLoad(t),
    onLoadComplete: t => handleLoadComplete(t),
    onLoadError: t => handleLoadError(t),
  })

  return imageSize
}

function getSize(element?: HTMLImageElement): Size | undefined {
  if (!element) return undefined
  if (typeof element.width !== 'number') return undefined
  if (typeof element.height !== 'number') return undefined

  return new Size([element.width, element.height])
}
