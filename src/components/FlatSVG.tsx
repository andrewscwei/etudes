import { XMLBuilder, XMLParser } from 'fast-xml-parser'
import { forwardRef, type HTMLAttributes } from 'react'

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
   * Specifies whether the 'x' and 'y' attributes should be removed in the SVG
   * root node.
   */
  shouldStripPosition?: boolean

  /**
   * Specifies whether the 'width' and 'height' attributes should be removed in
   * the SVG root node.
   */
  shouldStripSize?: boolean

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
export const FlatSVG = /* #__PURE__ */ forwardRef<HTMLDivElement, FlatSVGProps>(({
  svg,
  shouldStripClasses = true,
  shouldStripExtraneousAttributes = true,
  shouldStripIds = true,
  shouldStripPosition = true,
  shouldStripSize = true,
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
        if (shouldStripStyles && tagName.toLowerCase() === 'style') return false

        const attrNames = Object.keys(attrs)

        for (const attrName of attrNames) {
          if (tagName.toLowerCase() === 'svg') {
            if (shouldStripPosition && attrName.toLowerCase() === `${attributeNamePrefix}x`) delete attrs[attrName]
            if (shouldStripPosition && attrName.toLowerCase() === `${attributeNamePrefix}y`) delete attrs[attrName]
            if (shouldStripSize && attrName.toLowerCase() === `${attributeNamePrefix}width`) delete attrs[attrName]
            if (shouldStripSize && attrName.toLowerCase() === `${attributeNamePrefix}height`) delete attrs[attrName]
          }

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
      ref={ref}
      dangerouslySetInnerHTML={{ __html: sanitizedMarkup() }}
      role='img'
    />
  )
})
