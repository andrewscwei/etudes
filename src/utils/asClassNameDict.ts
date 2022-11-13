export default function asClassNameDict<T>(dict: { [K in keyof T]: string }) {
  return dict
}
