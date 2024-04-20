import debug from 'debug'

export function createDebug(subnamespace = '') {
  if (process.env.NODE_ENV === 'development') {
    const namespace = ['etudes', ...subnamespace.split(':').filter(Boolean)].join(':')
    if (typeof window === 'undefined') debug.enable(namespace)

    return debug(namespace)
  }
  else {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return () => {}
  }
}
