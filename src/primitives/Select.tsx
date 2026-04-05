import { type ChangeEvent, type HTMLAttributes, type Ref } from 'react'

import { asComponentDict } from '../utils/asComponentDict.js'
import { asStyleDict } from '../utils/asStyleDict.js'
import { Styled } from '../utils/Styled.js'
import { styles } from '../utils/styles.js'

/**
 * A select component that allows users to select an option from a dropdown
 * toggle.
 *
 * @exports Select.ExpandIcon Component for the expand icon.
 * @exports Select.Option Component for each option.
 * @exports Select.Toggle Component for the toggle.
 */
export function Select<T extends string>({
  id,
  ref,
  children,
  formatValue = v => v,
  name,
  options,
  placeholder,
  value,
  isRequired = false,
  onChange,
  ...props
}: Select.Props<T>) {
  const components = asComponentDict(children, {
    expandIcon: Select.ExpandIcon,
    option: Select.Option,
    toggle: Select.Toggle,
  })

  return (
    <div {...props} ref={ref} style={FIXED_STYLES.root}>
      <Styled
        style={FIXED_STYLES.select}
        aria-required={isRequired ? 'true' : undefined}
        element={components.toggle ?? <Select.Toggle/>}
        name={name}
        required={isRequired}
        value={value}
        onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange?.(event.target.value as T)}
      >
        {placeholder !== undefined && (
          <Styled disabled element={components.option ?? <Select.Option/>} hidden value=''>{placeholder}</Styled>
        )}
        {options.map((val, idx) => (
          <Styled key={`${idx}-${val}`} element={components.option ?? <Select.Option/>} value={val}>{formatValue(val)}</Styled>
        ))}
      </Styled>
      {components.expandIcon && (
        <Styled style={FIXED_STYLES.expandIcon} element={components.expandIcon}/>
      )}
    </div>
  )
}

export namespace Select {
  /**
   * Type describing the props of {@link Select}.
   */
  export type Props<T extends string> = {
    /**
     * Reference to the root element.
     */
    ref?: Ref<HTMLDivElement>

    /**
     * Specifies if a selection is required.
     */
    isRequired?: boolean

    /**
     * Name of the `select` element.
     */
    name?: string

    /**
     * The options to display in the `select` element.
     */
    options: readonly T[]
    /**
     * Placeholder text to display when no option is selected (i.e. when the
     * value is `''`).
     */
    placeholder?: string

    /**
     * Current value of the `select` element.
     */
    value?: NoInfer<T>

    /**
     * Function to format the value of the `select` element for display in the
     * toggle. If not provided, the value will be displayed as is.
     *
     * @param value The current value of the `select` element.
     *
     * @returns The formatted value to display in the toggle.
     */
    formatValue?: (value: NoInfer<T>) => string

    /**
     * Handler invoked when the value of the `select` element changes.
     *
     * @param value The new value of the `select` element.
     */
    onChange?: (value: NoInfer<T>) => void
  } & Omit<HTMLAttributes<HTMLDivElement>, 'onChange'>

  /**
   * Component for the expand icon of a {@link Select}.
   */
  export const ExpandIcon = ({ style, children, ...props }: HTMLAttributes<HTMLDivElement>) => (
    <figure {...props} style={styles(style, { pointerEvents: 'none' })} aria-hidden={true}>{children}</figure>
  )

  /**
   * Component for each option of a {@link Select}.
   */
  export const Option = ({ ...props }: HTMLAttributes<HTMLOptionElement>) => (
    <option {...props}/>
  )

  /**
   * Component for the `select` element of a {@link Select}.
   */
  export const Toggle = ({ children, ...props }: HTMLAttributes<HTMLSelectElement>) => (
    <select {...props}>{children}</select>
  )
}

const FIXED_STYLES = asStyleDict({
  expandIcon: {
    pointerEvents: 'none',
    zIndex: 1,
  },
  root: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  select: {
    appearance: 'none',
    boxSizing: 'border-box',
    height: '100%',
    left: 0,
    position: 'absolute',
    top: 0,
    width: '100%',
  },
})

if (process.env.NODE_ENV === 'development') {
  Select.displayName = 'Select'
  Select.ExpandIcon.displayName = 'Select.ExpandIcon'
  Select.Option.displayName = 'Select.Option'
  Select.Toggle.displayName = 'Select.Toggle'
}
