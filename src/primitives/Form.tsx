import { forwardRef, type HTMLAttributes } from 'react'

/**
 * Type describing the props of {@link Form}.
 */
export type FormProps = HTMLAttributes<HTMLFormElement> & {
  /**
   * Handler invoked when the form is submitted.
   */
  onSubmit: () => void
}

/**
 * A form component overrides the default submission behavior.
 */
export const Form = /* #__PURE__ */ forwardRef<HTMLFormElement, FormProps>(({
  onSubmit,
  ...props
}, ref) => {
  return (
    <form
      {...props}
      ref={ref}
      onSubmit={e => {
        e.preventDefault()
        onSubmit()
      }}
    />
  )
})

if (process.env.NODE_ENV !== 'production') {
  Form.displayName = 'Form'
}
