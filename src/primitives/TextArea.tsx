import { type Ref, type RefObject, type TextareaHTMLAttributes, useEffect, useRef } from 'react'

export namespace TextArea {
  /**
   * Type describing the props of {@link TextArea}.
   */
  export type Props = {
    /**
     * Reference to the root element.
     */
    ref?: Ref<HTMLTextAreaElement>

    /**
     * Specifies if the text area should be focused when it is mounted.
     */
    autoFocus?: boolean

    onChange: (value: string) => void
  } & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'autoFocus' | 'onChange'>
}

/**
 * A text area component that allows the user to enter multiple lines of text.
 */
export function TextArea({
  ref,
  autoFocus = false,
  onChange,
  ...props
}: TextArea.Props) {
  const rootRef = ref as RefObject<HTMLTextAreaElement> ?? useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!autoFocus) return

    const element = rootRef.current
    if (!element) return

    const timeoutId = setTimeout(() => {
      const length = element.value.length
      element.focus({ preventScroll: true })
      element.setSelectionRange(length, length)
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [autoFocus])

  return (
    <textarea
      {...props}
      ref={rootRef}
      onChange={event => onChange(event.target.value)}
    />
  )
}

if (process.env.NODE_ENV === 'development') {
  TextArea.displayName = 'TextArea'
}
