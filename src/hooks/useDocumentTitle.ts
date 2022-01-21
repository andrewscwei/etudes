import { DependencyList, useEffect } from 'react'

/**
 * Hook for adding document title. By default this hook is dependent on the `title` only.
 *
 * @param title - The document title.
 * @param deps - Additional dependencies.
 */
export default function useDocumentTitle(title: string, deps?: DependencyList) {
  useEffect(() => {
    document.title = title
  }, [title, ...deps ? deps : []])
}
