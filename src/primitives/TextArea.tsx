import { forwardRef, type TextareaHTMLAttributes } from 'react'

export namespace TextArea {
  /**
   * Type describing the props of {@link TextArea}.
   */
  export type Props = {
    onChange: (value: string) => void
  } & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'>
}

/**
 * A text area component that allows the user to enter multiple lines of text.
 */
export const TextArea = /* #__PURE__ */ forwardRef<HTMLTextAreaElement, TextArea.Props>((
  {
    onChange,
    ...props
  },
  ref,
) => {
  return (
    <textarea
      {...props}
      ref={ref}
      onChange={event => onChange(event.target.value)}
    />
  )
})

if (process.env.NODE_ENV === 'development') {
  TextArea.displayName = 'TextArea'
}
