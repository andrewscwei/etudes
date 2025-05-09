/**
 * Type-guarding function that ensures the provided dictionary is a valid
 * dictionary of class names.
 *
 * @param dict A dictionary of class names.
 *
 * @returns A dictionary of class names.
 */
export function asClassNameDict<T>(dict: { [K in keyof T]: string }) {
  return dict
}
