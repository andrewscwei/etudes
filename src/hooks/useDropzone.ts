import { useCallback, useState, type DragEvent } from 'react'

/**
 * Type describing the output of {@link useDropzone}.
 */
export type UseDropzoneOutput<T = HTMLElement> = {
  /**
   * Specifies whether the element is currently being dragged over.
   */
  isDropping: boolean

  /**
   * Handler invoked when a file is dragged over the element. This handler
   * should be added to the `onDragOver` event of the element.
   *
   * @param event The drag event.
   */
  onDragOver: (event: DragEvent<T>) => void

  /**
   * Handler invoked when a file is dragged out of the element. This handler
   * should be added to the `onDragLeave` event of the element.
   *
   * @param event The drag event.
   */
  onDragLeave: (event: DragEvent<T>) => void

  /**
   * Handler invoked when a file is dropped on the element. This handler should
   * be added to the `onDrop` event of the element.
   *
   * @param event The drag event.
   */
  onDrop: (event: DragEvent<T>) => void
}

/**
 * Hook for adding drag-and-drop interaction to an element.
 *
 * @param action The handler to call when a file is dropped.
 *
 * @returns See {@link UseDropzoneOutput}.
 */
export function useDropzone<T = HTMLElement>(action: (file: File) => void): UseDropzoneOutput<T> {
  const [isDropping, setIsDropping] = useState(false)

  const dragOverListener = useCallback((e: DragEvent<T>) => {
    e.preventDefault()
    e.stopPropagation()

    setIsDropping(true)
  }, [])

  const dragLeaveListener = useCallback((e: DragEvent<T>) => {
    e.preventDefault()
    e.stopPropagation()

    setIsDropping(false)
  }, [])

  const dropListener = useCallback((e: DragEvent<T>) => {
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
    onDragOver: dragOverListener,
    onDragLeave: dragLeaveListener,
    onDrop: dropListener,
  }
}
