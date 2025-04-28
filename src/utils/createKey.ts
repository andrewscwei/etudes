export function createKey(value: any): string {
  if (value === null || value === undefined) {
    return ''
  }
  else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  else if (typeof value === 'function') {
    return value.toString()
  }
  else if (value instanceof Date) {
    return value.toISOString()
  }
  else if (value instanceof RegExp) {
    return value.toString()
  }
  else if (value instanceof Map) {
    return JSON.stringify(Array.from(value.entries()))
  }
  else if (value instanceof Set) {
    return JSON.stringify(Array.from(value.values()))
  }
  else if (value instanceof WeakMap || value instanceof WeakSet) {
    return ''
  }
  else if (value instanceof ArrayBuffer) {
    return value.toString()
  }
  else if (Array.isArray(value)) {
    return JSON.stringify(value.map(createKey))
  }
  else if (typeof value === 'object') {
    return JSON.stringify(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)))
  }
  else {
    return ''
  }
}
