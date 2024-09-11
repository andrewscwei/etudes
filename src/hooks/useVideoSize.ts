import { useState } from 'react'
import { Size } from 'spase'
import { useLoadVideoMetadataEffect, type UseLoadVideoMetadataEffectOptions, type UseLoadVideoMetadataEffectParams } from './useLoadVideoMetadataEffect.js'

type Params = UseLoadVideoMetadataEffectParams

type Options = UseLoadVideoMetadataEffectOptions & {
  /**
   * If `false`, the size will be reset to `undefined` when the video begins
   * loading or when an error occurs. Defaults to `true`.
   */
  preservesSizeBetweenLoads?: boolean
}

/**
 * Hook for retrieving the size of a video.
 *
 * @param params See {@link Params}.
 * @param options See {@link Options}.
 *
 * @returns The actual size of the video if loading was successful, `undefined`
 *          otherwise.
 */
export function useVideoSize({ src }: Params, { preservesSizeBetweenLoads = true, onLoadStart, onLoadComplete, onLoadError }: Options = {}): Size | undefined {
  const handleLoad = (element: HTMLVideoElement) => {
    if (!preservesSizeBetweenLoads) setSize(undefined)

    onLoadStart?.(element)
  }

  const handleLoadComplete = (element: HTMLVideoElement) => {
    setSize(getSize(element))

    onLoadComplete?.(element)
  }

  const handleLoadError = (element: HTMLVideoElement) => {
    if (!preservesSizeBetweenLoads) setSize(undefined)

    onLoadError?.(element)
  }

  const [size, setSize] = useState<Size | undefined>(undefined)

  useLoadVideoMetadataEffect({ src }, {
    onLoadStart: t => handleLoad(t),
    onLoadComplete: t => handleLoadComplete(t),
    onLoadError: t => handleLoadError(t),
  })

  return size
}

function getSize(element?: HTMLVideoElement): Size | undefined {
  if (!element) return undefined
  if (typeof element.videoWidth !== 'number') return undefined
  if (typeof element.videoHeight !== 'number') return undefined

  return Size.make(element.videoWidth, element.videoHeight)
}
