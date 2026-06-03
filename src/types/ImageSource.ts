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
  /**
   * Converts an `ImageSource` object into props that can be spread onto a
   * `<source>` or `<img>` element, including validation of the `ImageSource`
   * object.
   *
   * @param imageSource The `ImageSource` object to convert into props.
   *
   * @returns An object containing the props to spread onto a `<source>` or
   *          `<img>` element.
   */
  export function asProps(imageSource: ImageSource) {
    try {
      assert(imageSource)

      return {
        media: imageSource.media,
        sizes: asSizes(imageSource),
        srcSet: asSourceSet(imageSource),
        type: imageSource.type,
      }
    } catch (error) {
      console.error(`[etudes:ImageSource] ${error}`)

      return undefined
    }
  }

  /**
   * Converts an `ImageSource` object into a string suitable for the `srcSet`
   * attribute of an `<img>` or `<source>` element.
   *
   * @param imageSource The `ImageSource` object to convert into a `srcSet`
   *                    string.
   *
   * @returns A string suitable for the `srcSet` attribute of an `<img>` or
   *          `<source>` element.
   */
  function asSourceSet(imageSource: ImageSource): string {
    return imageSource.srcSet.map(({ pixelDensity, src, width }) => {
      let res = src

      if (width !== undefined) {
        res += ` ${width}w`
      } else if (pixelDensity !== undefined) {
        res += ` ${pixelDensity}x`
      }

      return res
    }).filter(Boolean).join(', ')
  }

  /**
   * Converts an `ImageSource` object into a string suitable for the `sizes`
   * attribute of an `<img>` or `<source>` element.
   *
   * @param imageSource The `ImageSource` object to convert into a `sizes`
   *                    string.
   *
   * @returns A string suitable for the `sizes` attribute of an `<img>` or
   *          `<source>` element.
   */
  function asSizes(imageSource: ImageSource): string | undefined {
    return imageSource.sizes?.map(({ media, width }) => {
      let t = width

      if (media) t = `${media} ${t}`

      return t
    }).filter(Boolean).join(', ')
  }

  /**
   * Asserts an `ImageSource` object, throwing an error if the object is
   * invalid.
   *
   * @param imageSource The `ImageSource` object to assert.
   *
   * @throws If the `ImageSource` object is invalid.
   */
  function assert(value?: any): asserts value is ImageSource {
    if (!is(value)) {
      throw Error('Invalid `ImageSource` object')
    }

    const { sizes = [], srcSet } = value

    if (sizes.length > 0 && !srcSet.some(({ width }) => width !== undefined)) {
      throw Error('If `sizes` is specified, at least one entry in `srcSet` must have a `width` specified')
    }

    if (sizes.length > 0 && sizes[sizes.length - 1].media !== undefined) {
      throw Error('The last item in `sizes` must not have a `media` condition')
    }

    if (srcSet.length === 0) {
      throw Error('At least one entry in `srcSet` must be specified')
    }

    srcSet.forEach(({ pixelDensity, src, width }) => {
      if (src === undefined || src === '') {
        throw Error('Each entry in `srcSet` must have a non-empty `src`')
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

  /**
   * Type guard to check if a value is an `ImageSource` object.
   *
   * @param value The value to check.
   *
   * @returns `true` if the value is an `ImageSource` object, `false` otherwise.
   */
  function is(value?: any): value is ImageSource {
    if (typeof value !== 'object' || value === null) return false
    if (value.media !== undefined && typeof value.media !== 'string') return false
    if (value.type !== undefined && typeof value.type !== 'string') return false

    if (value.sizes !== undefined) {
      if (!Array.isArray(value.sizes)) return false

      for (const size of value.sizes) {
        if (typeof size !== 'object' || size === null) return false
        if (size.media !== undefined && typeof size.media !== 'string') return false
        if (typeof size.width !== 'string') return false
      }
    }

    if (!Array.isArray(value.srcSet)) return false

    for (const srcSetEntry of value.srcSet) {
      if (typeof srcSetEntry !== 'object' || srcSetEntry === null) return false
      if (typeof srcSetEntry.src !== 'string') return false

      if (srcSetEntry.width !== undefined) {
        if (!isFinite(srcSetEntry.width) || !Number.isInteger(srcSetEntry.width) || srcSetEntry.width <= 0) return false
      }

      if (srcSetEntry.pixelDensity !== undefined) {
        if (!isFinite(srcSetEntry.pixelDensity) || srcSetEntry.pixelDensity <= 0) return false
      }

      if (srcSetEntry.width !== undefined && srcSetEntry.pixelDensity !== undefined) return false
    }

    return true
  }
}
