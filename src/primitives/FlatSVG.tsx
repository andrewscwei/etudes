import { XMLBuilder, XMLParser } from 'fast-xml-parser'
import { forwardRef, type HTMLAttributes } from 'react'

export namespace FlatSVG {
  /**
   * Type describing the props of {@link FlatSVG}.
   */
  export type Props = {
    /**
     * Specifies how the SVG should be resized:
     * - `preserve`: Default: the SVG size attributes are unchanged.
     * - `none`: The SVG size attributes are stripped.
     * - `fill`: The SVG will fill the container, i.e. `width="100%"` and
     *   `height="100%"`.
     * - `height`: The SVG will maintain its aspect ratio and fill the height of
     *   the container, i.e. `width="auto"` and `height="100%"`.
     * - `width`: The SVG will maintain its aspect ratio and fill the width of
     *   the container, i.e. `width="100%"` and `height="auto"`.
     */
    fillMode?: 'fill' | 'height' | 'none' | 'preserve' | 'width'

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
     * Specifies whether the 'id' attribute should be removed in the SVG root
     * node and all of its child nodes.
     */
    shouldStripIds?: boolean

    /**
     * Specifies whether the 'x' and 'y' attributes should be removed in the SVG
     * root node.
     */
    shouldStripPositions?: boolean

    /**
     * Specifies whether the 'style' attribute and any <style> nodes should be
     * removed in the SVG root node and all of its child nodes.
     */
    shouldStripStyles?: boolean
  } & Omit<HTMLAttributes<HTMLElement>, 'role'>
}

/**
 * A component whose root element wraps an SVG markup. When wrapping the SVG, it
 * will attempt to sanitize the markup (i.e. stripping useless attributes)
 * according to the props specified.
 */
export const FlatSVG = /* #__PURE__ */ forwardRef<HTMLDivElement, Readonly<FlatSVG.Props>>((
  {
    fillMode = 'preserve',
    svg,
    shouldStripClasses = true,
    shouldStripIds = true,
    shouldStripPositions = true,
    shouldStripStyles = true,
    ...props
  },
  ref,
) => {
  const attributeNamePrefix = '@_'
  const idAttributes = ['id'].map(t => `${attributeNamePrefix}${t}`)
  const classAttributes = ['class'].map(t => `${attributeNamePrefix}${t}`)
  const styleAttributes = ['fill', 'stroke', 'style'].map(t => `${attributeNamePrefix}${t}`)
  const positionAttributes = ['x', 'y'].map(t => `${attributeNamePrefix}${t}`)

  const sanitizedMarkup = () => {
    const parser = new XMLParser({
      attributeNamePrefix,
      ignoreAttributes: false,
      ignoreDeclaration: true,
      ignorePiTags: true,
      removeNSPrefix: true,
      trimValues: true,
      updateTag: (tagName, _, attrs) => {
        if (shouldStripStyles && tagName.toLowerCase() === 'style') return false

        const attrNames = Object.keys(attrs)

        for (const attrName of attrNames) {
          if (tagName.toLowerCase() === 'svg') {
            if (shouldStripPositions && positionAttributes.includes(attrName.toLowerCase())) delete attrs[attrName]

            if (fillMode !== 'preserve') {
              // Delete first to account for case sensitivity, re-add later.
              if (attrName.toLowerCase() === `${attributeNamePrefix}width`) delete attrs[attrName]
              if (attrName.toLowerCase() === `${attributeNamePrefix}height`) delete attrs[attrName]
            }
          }

          if (shouldStripIds && idAttributes.includes(attrName.toLowerCase())) delete attrs[attrName]
          if (shouldStripClasses && classAttributes.includes(attrName.toLowerCase())) delete attrs[attrName]
          if (shouldStripStyles && styleAttributes.includes(attrName.toLowerCase())) delete attrs[attrName]
        }

        if (tagName.toLowerCase() === 'svg') {
          switch (fillMode) {
            case 'fill':
              attrs[`${attributeNamePrefix}width`] = '100%'
              attrs[`${attributeNamePrefix}height`] = '100%'
              break
            case 'height':
              attrs[`${attributeNamePrefix}height`] = '100%'
              break
            case 'width':
              attrs[`${attributeNamePrefix}width`] = '100%'
              break
            default:
              break
          }
        }

        return tagName
      },
    })

    const builder = new XMLBuilder({
      attributeNamePrefix,
      format: false,
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

if (process.env.NODE_ENV === 'development') {
  FlatSVG.displayName = 'FlatSVG'
}
