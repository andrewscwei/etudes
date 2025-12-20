import { useCallback } from 'react'

/**
 * Hook for downloading a blob as a file.
 *
 * @returns The callback to download a blob.
 */
export function useDownloadBlob() {
  return useCallback((blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }, [])
}
