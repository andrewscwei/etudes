import classNames from 'classnames'
import React, { forwardRef, HTMLAttributes, PropsWithChildren, useEffect, useState } from 'react'
import { Transition } from 'react-transition-group'
import Each from './Each'
import useInterval from './hooks/useInterval'
import asComponentDict from './utils/asComponentDict'
import asStyleDict from './utils/asStyleDict'
import cloneStyledElement from './utils/cloneStyledElement'
import styles from './utils/styles'

export type RotatingGalleryProps = HTMLAttributes<HTMLDivElement> & PropsWithChildren<{
  /**
   * Current image index. An error is thrown if the index is invalid (must be
   * between 0 and length of `srcs` - 1, inclusive). This prop supports two-way
   * binding.
   */
  index?: number

  /**
   * An array of image paths.
   */
  srcs?: string[]

  /**
   * The duration of one rotation in milliseconds (how long one image stays
   * before transitioning to the next). Specifying `NaN` or a negative number
   * will prevent the component from automatically rotating.
   */
  rotationDuration?: number

  /**
   * The duration of an image transition in milliseconds.
   */
  transitionDuration?: number

  /**
   * Handler invoked when the image index changes.
   *
   * @param index - The current image index.
   */
  onIndexChange?: (index: number) => void
}>

/**
 * A component displaying rotating images.
 *
 * @exports RotatingGalleryImage - Component for each rotating image, classes:
 *                                 `entering`, `entered`, `exiting`, `exited`.
 */
export default forwardRef<HTMLDivElement, RotatingGalleryProps>(({
  children,
  index: externalIndex = 0,
  rotationDuration,
  srcs = [],
  transitionDuration = 500,
  onIndexChange,
  ...props
}, ref) => {
  const [index, setIndex] = useState(externalIndex)

  useInterval(() => {
    setIndex((index + 1) % srcs.length)
  }, rotationDuration, undefined, [index])

  useEffect(() => {
    if (externalIndex === index) return
    setIndex(externalIndex)
  }, [externalIndex])

  useEffect(() => {
    onIndexChange?.(index)
  }, [index])

  const components = asComponentDict(children, {
    image: RotatingGalleryImage,
  })

  const fixedStyles = asStyleDict({
    image: {
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      height: '100%',
      left: '0',
      position: 'absolute',
      top: '0',
      width: '100%',
      transitionDuration: `${transitionDuration}ms`,
    },
  })

  const defaultStyles = asStyleDict({
    image: {
      transitionProperty: 'opacity',
      transitionTimingFunction: 'ease-out',
    },
  })

  return (
    <div {...props} ref={ref}>
      <Each in={srcs}>
        {(src, idx) => (
          <Transition in={idx === index} timeout={transitionDuration}>
            {state => cloneStyledElement(components.image ?? <RotatingGalleryImage style={styles(
              defaultStyles.image,
              state === 'entering' && { opacity: '1' },
              state === 'exiting' && { opacity: '0' },
            )}/>, {
              className: classNames(state),
              style: styles(fixedStyles.image, {
                backgroundImage: `url(${src})`,
              }),
            })}
          </Transition>
        )}
      </Each>
    </div>
  )
})

export const RotatingGalleryImage = ({ ...props }: HTMLAttributes<HTMLDivElement>) => <div {...props}/>
