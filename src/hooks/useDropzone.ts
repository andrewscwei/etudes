import { useCallback, useState, type DragEvent } from 'react'

export function useDropzone<T = HTMLElement>(action: (file: File) => void) {
  const [isDropping, setIsDropping] = useState(false)

  const onDragOver = useCallback((e: DragEvent<T>) => {
    e.preventDefault()
    e.stopPropagation()

    setIsDropping(true)
  }, [])

  const onDragLeave = useCallback((e: DragEvent<T>) => {
    e.preventDefault()
    e.stopPropagation()

    setIsDropping(false)
  }, [])

  const onDrop = useCallback((e: DragEvent<T>) => {
    e.preventDefault()
    e.stopPropagation()

    setIsDropping(false)

    const files = e.dataTransfer.files

    if (files && files.length > 0) {
      const file = files[0]
      const formData = new FormData()
      formData.append('file', file)

      action(file)
    }
  }, [])

  return {
    isDropping,
    onDragOver,
    onDragLeave,
    onDrop,
  }
}
