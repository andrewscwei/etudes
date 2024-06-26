import clsx from 'clsx'
import { forwardRef, useEffect, type ComponentType, type HTMLAttributes, type PropsWithChildren } from 'react'
import { useInterval } from '../hooks/useInterval'
import { Each } from '../operators/Each'
import { asClassNameDict, asStyleDict, styles } from '../utils'

export type RotatingGalleryImageProps = HTMLAttributes<HTMLElement> & {
  index: number
  isVisible: boolean
  src: string
}

export type RotatingGalleryProps = HTMLAttributes<HTMLDivElement> & PropsWithChildren<{
  /**
   * Current image index. An error is thrown if the index is invalid (must be
   * between 0 and length of `srcs` - 1, inclusive). This prop supports two-way
   * binding.
   */
  index?: number

  /**
   * Specifies if lazy loading of images should be enabled.
   */
  lazy?: boolean

  /**
   * The duration of one rotation in milliseconds (how long one image stays
   * before transitioning to the next). Specifying `NaN` or a negative number
   * will prevent the component from automatically rotating.
   */
  rotationDuration?: number

  /**
   * An array of image paths.
   */
  srcs?: string[]

  /**
   * The duration of an image transition in milliseconds.
   */
  transitionDuration?: number

  /**
   * Specifies if the component should use default styles.
   */
  usesDefaultStyles?: boolean

  /**
   * Handler invoked when the image index changes.
   *
   * @param index The current image index.
   */
  onIndexChange?: (index: number) => void

  /**
   * Component type for generating images in this collection.
   */
  ImageComponent?: ComponentType<RotatingGalleryImageProps>
}>

/**
 * A component displaying rotating images.
 */
export const RotatingGallery = forwardRef<HTMLDivElement, RotatingGalleryProps>(({
  children,
  className,
  index = 0,
  lazy = true,
  rotationDuration = 5000,
  srcs = [],
  transitionDuration = 500,
  usesDefaultStyles = true,
  onIndexChange,
  ImageComponent,
  ...props
}, ref) => {
  const handleIndexChange = (newValue: number) => {
    onIndexChange?.(newValue)
  }

  const fixedClassNames = getFixedClassNames()
  const fixedStyles = getFixedStyles({ transitionDuration })
  const defaultStyles = usesDefaultStyles ? getDefaultStyles() : undefined

  useInterval(() => {
    handleIndexChange((index + 1) % srcs.length)
  }, rotationDuration, undefined, [JSON.stringify(srcs), index])

  useEffect(() => {
    onIndexChange?.(index)
  }, [index])

  return (
    <div {...props} ref={ref} className={clsx(className, fixedClassNames.root)} data-component='rotating-gallery'>
      <Each in={srcs}>
        {(src, idx) => {
          const isVisible = idx === index

          return ImageComponent ? (
            <ImageComponent
              className={clsx(fixedClassNames.image)}
              data-child='item'
              index={idx}
              isVisible={isVisible}
              src={src}
              style={styles(
                fixedStyles.image,
                defaultStyles?.image,
                usesDefaultStyles ? {
                  opacity: isVisible ? '1' : '0',
                } : {},
              )}
            />
          ) : (
            <img
              className={clsx(fixedClassNames.image)}
              data-child='item'
              loading={lazy ? 'lazy' : 'eager'}
              src={src}
              style={styles(
                fixedStyles.image,
                defaultStyles?.image,
                usesDefaultStyles ? {
                  opacity: isVisible ? '1' : '0',
                } : {},
              )}
            />
          )
        }}
      </Each>
    </div>
  )
})

Object.defineProperty(RotatingGallery, 'displayName', { value: 'RotatingGallery', writable: false })

function getFixedClassNames() {
  return asClassNameDict({
    root: clsx('rotating-gallery'),
    image: clsx('image'),
  })
}

function getFixedStyles({ transitionDuration = 0 }) {
  return asStyleDict({
    image: {
      height: '100%',
      left: '0',
      position: 'absolute',
      top: '0',
      width: '100%',
      transitionDuration: `${transitionDuration}ms`,
    },
  })
}

function getDefaultStyles() {
  return asStyleDict({
    image: {
      transitionProperty: 'opacity',
      transitionTimingFunction: 'linear',
    },
  })
}
