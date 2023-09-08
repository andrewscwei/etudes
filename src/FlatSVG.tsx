import { XMLBuilder, XMLParser } from 'fast-xml-parser'
import React, { HTMLAttributes, forwardRef } from 'react'

export type FlatSVGProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * The SVG string markup, i.e. "<svg>...</svg>".
   */
  svg: string

  /**
   * Specifies whether the 'class' should be removed in the SVG root node and
   * all of its child nodes.
   */
  stripClasses?: boolean

  /**
   * Specifies whether extraneous attributes should be removed from the SVG root
   * node. The `whitelistedAttributes` prop defines what attributes should be
   * kept.
   */
  stripExtraneousAttributes?: boolean

  /**
   * Specifies whether the 'id' attribute should be removed in the SVG root node
   * and all of its child nodes.
   */
  stripIds?: boolean

  /**
   * Specifies whether the 'style' atribute and any <style> nodes should be
   * removed in the SVG root node and all of its child nodes.
   */
  stripStyles?: boolean

  /**
   * Specifies attribute names to exclude from being stripped if
   * `stripExtraneousAttributes` is enabled. By default, only `viewBox` is
   * whitelisted.
   */
  whitelistedAttributes?: string[]
}

/**
 * A component whose root element wraps an SVG markup. When wrapping the SVG, it
 * will attempt to sanitize the markup (i.e. stripping useless attributes)
 * according to the props specified.
 */
export default forwardRef<HTMLDivElement, FlatSVGProps>(({
  svg,
  stripClasses = true,
  stripExtraneousAttributes = true,
  stripIds = true,
  stripStyles = true,
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
        if (stripStyles && tagName === 'style') return false

        const attrNames = Object.keys(attrs)

        for (const attrName of attrNames) {
          if (stripIds && attrName.toLowerCase() === `${attributeNamePrefix}id`) delete attrs[attrName]
          if (stripClasses && attrName.toLowerCase() === `${attributeNamePrefix}class`) delete attrs[attrName]
          if (stripStyles && attrName.toLowerCase() === `${attributeNamePrefix}style`) delete attrs[attrName]
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
      ref={ref}
      dangerouslySetInnerHTML={{ __html: sanitizedMarkup() }}
    />
  )
})
