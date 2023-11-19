import { XMLBuilder, XMLParser } from 'fast-xml-parser'
import React, { forwardRef, type HTMLAttributes } from 'react'

export type FlatSVGProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * The SVG string markup, i.e. "<svg>...</svg>".
   */
  svg: string

  /**
   * Specifies whether the 'class' should be removed in the SVG root node and
   * all of its child nodes.
   */
  shouldStripClasses?: boolean

  /**
   * Specifies whether extraneous attributes should be removed from the SVG root
   * node. The `whitelistedAttributes` prop defines what attributes should be
   * kept.
   */
  shouldStripExtraneousAttributes?: boolean

  /**
   * Specifies whether the 'id' attribute should be removed in the SVG root node
   * and all of its child nodes.
   */
  shouldStripIds?: boolean

  /**
   * Specifies whether the 'style' atribute and any <style> nodes should be
   * removed in the SVG root node and all of its child nodes.
   */
  shouldStripStyles?: boolean

  /**
   * Specifies attribute names to exclude from being stripped if
   * `shouldStripExtraneousAttributes` is enabled. By default, only `viewBox` is
   * whitelisted.
   */
  whitelistedAttributes?: string[]
}

/**
 * A component whose root element wraps an SVG markup. When wrapping the SVG, it
 * will attempt to sanitize the markup (i.e. stripping useless attributes)
 * according to the props specified.
 */
export const FlatSVG = forwardRef<HTMLDivElement, FlatSVGProps>(({
  svg,
  shouldStripClasses = true,
  shouldStripExtraneousAttributes = true,
  shouldStripIds = true,
  shouldStripStyles = true,
  whitelistedAttributes = ['viewBox'],
  ...props
}, ref) => {
  const attributeNamePrefix = '@_'

  const sanitizedMarkup = () => {
    const parser = new XMLParser({
      attributeNamePrefix,
      ignoreAttributes: false,
      ignoreDeclaration: true,
      ignorePiTags: true,
      removeNSPrefix: true,
      trimValues: true,
      updateTag: (tagName, jPath, attrs) => {
        if (shouldStripStyles && tagName === 'style') return false

        const attrNames = Object.keys(attrs)

        for (const attrName of attrNames) {
          if (shouldStripIds && attrName.toLowerCase() === `${attributeNamePrefix}id`) delete attrs[attrName]
          if (shouldStripClasses && attrName.toLowerCase() === `${attributeNamePrefix}class`) delete attrs[attrName]
          if (shouldStripStyles && attrName.toLowerCase() === `${attributeNamePrefix}style`) delete attrs[attrName]
        }

        return tagName
      },
    })

    const builder = new XMLBuilder({
      attributeNamePrefix,
      format: true,
      ignoreAttributes: false,
    })

    const xml = parser.parse(svg)

    return builder.build(xml)
  }

  return (
    <figure
      {...props}
      data-component='flat-svg'
      ref={ref}
      dangerouslySetInnerHTML={{ __html: sanitizedMarkup() }}
    />
  )
})

Object.defineProperty(FlatSVG, 'displayName', { value: 'FlatSVG', writable: false })
