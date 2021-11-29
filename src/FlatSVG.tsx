import React, { HTMLAttributes } from 'react'
import styled, { CSSProp } from 'styled-components'

export type Props = HTMLAttributes<HTMLDivElement> & {
  /**
   * The SVG string markup, i.e. "<svg>...</svg>".
   */
  markup: string

  /**
   * Specifies whether the 'class' should be removed in the SVG root node and all of its child
   * nodes.
   */
  stripClasses?: boolean

  /**
   * Specifies whether extraneous attributes should be removed from the SVG root node. The
   * `whitelistedAttributes` prop defines what attributes should be kept.
   */
  stripExtraneousAttributes?: boolean

  /**
   * Specifies whether the 'id' attribute should be removed in the SVG root node and all of its
   * child nodes.
   */
  stripIds?: boolean

  /**
   * Specifies whether the 'style' atribute and any <style> nodes should be removed in the SVG root
   * node and all of its child nodes.
   */
  stripStyles?: boolean

  /**
   * Extended CSS to be provided to the SVG root node.
   */
  cssSVG?: CSSProp<any>

  /**
   * Specifies attribute names to exclude from being stripped if `stripExtraneousAttributes` is
   * enabled. By default, only `viewBox` is whitelisted.
   */
  whitelistedAttributes?: string[]
}

function removeStyles(element: Element) {
  element.removeAttribute('style')

  const inlineStyles = element.getElementsByTagName('style')
  const numInlineStyles = inlineStyles.length

  for (let i = 0; i < numInlineStyles; i++) {
    const inlineStyle = inlineStyles[i]
    inlineStyle.remove()
  }

  const numChildren = element.children.length

  for (let i = 0; i < numChildren; i++) {
    removeStyles(element.children[i])
  }
}

function removeAttributes(element: Element, attributes: string[] | undefined = undefined, recursive = false, whitelist: string[] = []) {
  const attrs = attributes ?? element.getAttributeNames()
  const numAttrs = attrs.length

  for (let i = 0; i < numAttrs; i++) {
    const attr = attrs[i]
    const keep = whitelist.indexOf(attr) > -1
    if (!keep) element.removeAttribute(attr)
  }

  if (recursive) {
    const numChildren = element.children.length

    for (let i = 0; i < numChildren; i++) {
      removeAttributes(element.children[i], attributes, recursive, whitelist)
    }
  }
}

/**
 * A component whose root element wraps an SVG markup. When wrapping the SVG, it will attempt to
 * sanitize the markup (i.e. stripping useless attributes) according to the props specified.
 */
export default function FlatSVG({
  markup,
  stripClasses = true,
  stripExtraneousAttributes = true,
  stripIds = true,
  stripStyles = true,
  cssSVG,
  whitelistedAttributes = ['viewBox'],
  ...props
}: Props) {
  function sanitizedMarkup(): string {
    const mockContainer = document.createElement('div')
    mockContainer.innerHTML = markup

    const elements = mockContainer.getElementsByTagName('svg')
    if (elements.length > 1) throw new Error('More than one SVG element found in provided markup')

    const svgElement = elements[0]
    if (!svgElement) throw new Error('No SVG in provided markup')

    if (stripExtraneousAttributes) removeAttributes(svgElement, undefined, false, [...whitelistedAttributes, 'style', 'class', 'id'])
    if (stripIds) removeAttributes(svgElement, ['id'], true)
    if (stripClasses) removeAttributes(svgElement, ['class'], true)
    if (stripStyles) removeStyles(svgElement)

    return svgElement.outerHTML
  }

  return (
    <StyledRoot
      dangerouslySetInnerHTML={{ __html: sanitizedMarkup() }}
      cssSVG={cssSVG}
      {...props}
    />
  )
}

const StyledRoot = styled.figure<{ cssSVG: Props['cssSVG'] }>`
  box-sizing: border-box;
  display: inline-block;
  flex: 0 0 auto;
  height: auto;
  position: relative;
  width: auto;

  > svg {
    height: auto;
    transition-delay: inherit;
    transition-duration: inherit;
    transition-property: inherit;
    transition-timing-function: inherit;
    width: auto;

    * {
      transition-delay: inherit;
      transition-duration: inherit;
      transition-property: inherit;
      transition-timing-function: inherit;
    }

    ${props => props.cssSVG}
  }
`
