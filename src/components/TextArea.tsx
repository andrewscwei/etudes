import { forwardRef, type TextareaHTMLAttributes } from 'react'

/**
 * Type describing the props of {@link TextArea}.
 */
export type TextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> & {
  onChange: (value: string) => void
}

/**
 * A text area component that allows the user to enter multiple lines of text.
 */
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({
  onChange,
  ...props
}, ref) => {
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
