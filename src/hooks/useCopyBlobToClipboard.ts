import { useCallback } from 'react'

/**
 * Hook for copying a blob to the clipboard.
 *
 * @returns The callback to copy a blob to the clipboard.
 */
export function useCopyBlobToClipboard() {
  return useCallback(async (blob: Blob) => {
    const type = blob.type
    const item = new ClipboardItem({ [type]: blob })

    try {
      await navigator.clipboard.write([item])
    }
    catch (err) {
      console.error('[etudes::useCopyBlobToClipboard] Failed to copy blob to clipboard:', err)
    }
  }, [])
}
