import { type Ref, type TextareaHTMLAttributes } from 'react'

export namespace TextArea {
  /**
   * Type describing the props of {@link TextArea}.
   */
  export type Props = {
    /**
     * Reference to the root element.
     */
    ref?: Ref<HTMLTextAreaElement>

    onChange: (value: string) => void
  } & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'>
}

/**
 * A text area component that allows the user to enter multiple lines of text.
 */
export function TextArea({ ref, onChange, ...props }: TextArea.Props) {
  return (
    <textarea
      {...props}
      ref={ref}
      onChange={event => onChange(event.target.value)}
    />
  )
}

if (process.env.NODE_ENV === 'development') {
  TextArea.displayName = 'TextArea'
}
