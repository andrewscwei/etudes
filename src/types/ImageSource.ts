/**
 * Type describing the source of an image, which can be used in the `<source>`
 * element or the `<img>` element.
 */
export type ImageSource = {
  /**
   * Media query condition (i.e. `(max-width: 100px)`).
   */
  media?: string

  /**
   * List of descriptors for each entry in the `sizes` attribute of `<img>` and
   * `source` elements.
   */
  sizes?: {
    /**
     * Optional media query condition (i.e. `(max-width: 100px)`). Note that this
     * must be omitted for the last item in this list of sizes.
     */
    media?: string

    /**
     * A CSS size value indicating the size of the image's slot on the page,
     * i.e. `100px`, `100vw`, `50%`, etc.
     */
    width: string
  }[]

  /**
   * List of descriptors for each entry in the `srcset` attribute of `<img>` and
   * `source` elements. Only one of `width` or `pixelDensity` can be specified,
   * or neither (defaults to `pixelDensity` of `1.0`).
   */
  srcSet: {
    /**
     * A URL specifying an image location.
     */
    src: string

    /**
     * Optional intrinsic width (in pixels) of the image expressed as a positive
     * integer. If set, leave `pixelDensity` unspecified (only one of `width` or
     * `pixelDensity` can be specified).
     */
    width?: number

    /**
     * Optional pixel density of the image expressed as a positive floating
     * number. If set, leave `width` unspecified (only one of `width` or
     * `pixelDensity` can be specified.
     */
    pixelDensity?: number
  }[]

  /**
   * Optional MIME type of the image (e.g. `image/png`, `image/jpeg`, etc.).
   * This is used to set the `type` attribute of `<source>` elements.
   */
  type?: string
}

export namespace ImageSource {
  export function asProps(imageSource: ImageSource) {
    try {
      validate(imageSource)

      return {
        media: imageSource.media,
        sizes: resolveSizes(imageSource),
        srcSet: resolveSourceSet(imageSource),
        type: imageSource.type,
      }
    }
    catch (error) {
      console.error(`[etudes:ImageSource] ${error}`)

      return undefined
    }
  }

  function validate({ sizes = [], srcSet: sourceSet }: ImageSource): void {
    if (sizes.length > 0 && !sourceSet.some(({ width }) => width !== undefined)) {
      throw Error('If `sizes` is specified, at least one entry in `sourceSet` must have a `width` specified')
    }

    if (sizes.length > 0 && sizes[sizes.length - 1].media !== undefined) {
      throw Error('The last item in `sizes` must not have a `media` condition')
    }

    if (sourceSet.length === 0) {
      throw Error('At least one entry in `sourceSet` must be specified')
    }

    sourceSet.forEach(({ src, width, pixelDensity }) => {
      if (src === undefined || src === '') {
        throw Error('Each entry in `sourceSet` must have a non-empty `src`')
      }

      if (width !== undefined && (!isFinite(width) || !Number.isInteger(width) || width <= 0)) {
        throw Error('If `width` is specified, it must be a positive integer greater than 0')
      }

      if (pixelDensity !== undefined && (!isFinite(pixelDensity) || pixelDensity <= 0)) {
        throw Error('If `pixelDensity` is specified, it must be a number greater than 0')
      }

      if (width !== undefined && pixelDensity !== undefined) {
        throw Error('Only one of `width` or `pixelDensity` can be specified')
      }
    })
  }

  function resolveSourceSet(imageSource: ImageSource): string {
    return imageSource.srcSet.map(({ pixelDensity, src, width }) => {
      let res = src

      if (width !== undefined) {
        res += ` ${width}w`
      }
      else if (pixelDensity !== undefined) {
        res += ` ${pixelDensity}x`
      }

      return res
    }).filter(Boolean).join(', ')
  }

  function resolveSizes(imageSource: ImageSource): string | undefined {
    return imageSource.sizes?.map(({ media, width }) => {
      let t = width

      if (media) t = `${media} ${t}`

      return t
    }).filter(Boolean).join(', ')
  }
}
