import { Children, isValidElement, type JSX, type JSXElementConstructor, type ReactNode } from 'react'

type ComponentTypeDict = Record<string, JSXElementConstructor<any>>

type ComponentElementDict<T extends ComponentTypeDict> = Record<keyof T, JSX.Element>

/**
 * Inspects the children of a component and returns a dictionary of matching
 * component types as specified in the `typeDict` parameter.
 *
 * @param children The children to inspect.
 * @param typeDict A dictionary of component types to match against.
 *
 * @returns A dictionary of matching component types.
 */
export function asComponentDict<T extends ComponentTypeDict>(children?: ReactNode, typeDict: T = {} as T): Partial<ComponentElementDict<T>> {
  const keys: (keyof T)[] = Object.keys(typeDict)
  const types = Object.values(typeDict)
  const components: Partial<ComponentElementDict<T>> = {}

  Children.forEach(children, child => {
    if (!isValidElement(child)) {
      console.error('[etudes::asComponentDict] Invalid child detected')

      return
    }

    const index = types.indexOf(child.type as any)

    if (index < 0) {
      console.error(`[etudes::asComponentDict] Unsupported child, only the following children are allowed: ${types.map(type => (type as any).displayName ?? type.name).join(', ')}`)

      return
    }

    const key = keys[index]

    if (components[key]) {
      console.error(`[etudes::asComponentDict] Only one ${types[index]} can be provided as a child`)

      return
    }

    components[key] = child
  })

  return components
}
