import { DependencyList, useEffect } from 'react'

export default function useDocumentTitle(title: string, deps?: DependencyList) {
  useEffect(() => {
    document.title = title
  }, [title, ...deps ? deps : []])
}
