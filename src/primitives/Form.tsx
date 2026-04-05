import { type HTMLAttributes, type Ref } from 'react'

export namespace Form {
  /**
   * Type describing the props of {@link Form}.
   */
  export type Props = {
    /**
     * Reference to the root element.
     */
    ref?: Ref<HTMLFormElement>

    /**
     * Handler invoked when the form is submitted.
     */
    onSubmit: () => void
  } & HTMLAttributes<HTMLFormElement>
}

/**
 * A form component overrides the default submission behavior.
 */
export function Form({ ref, onSubmit, ...props }: Form.Props) {
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
}

if (process.env.NODE_ENV !== 'production') {
  Form.displayName = 'Form'
}
