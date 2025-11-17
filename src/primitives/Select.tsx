import { forwardRef, type ChangeEvent, type HTMLAttributes } from 'react'
import { Styled } from '../utils/Styled.js'
import { asComponentDict } from '../utils/asComponentDict.js'
import { asStyleDict } from '../utils/asStyleDict.js'
import { styles } from '../utils/styles.js'

/**
 * Type describing the props of {@link Select}.
 */
export type SelectProps = Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> & {
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
  options: string[]

  /**
   * Placeholder text to display when no option is selected (i.e. when the value
   * is `''`).
   */
  placeholder?: string

  /**
   * Current value of the `select` element.
   */
  value?: string

  /**
   * Handler invoked when the value of the `select` element changes.
   *
   * @param value The new value of the `select` element.
   */
  onChange?: (value: string) => void
}

/**
 * A select component that allows users to select an option from a dropdown
 * toggle.
 *
 * @exports SelectExpandIcon Component for the expand icon.
 * @exports SelectOption Component for each option.
 * @exports SelectToggle Component for the toggle.
 */
export const Select = /* #__PURE__ */ forwardRef<HTMLDivElement, SelectProps>(({
  children,
  id,
  isRequired = false,
  name,
  options,
  placeholder,
  value = '',
  onChange,
  ...props
}, ref) => {
  const components = asComponentDict(children, {
    expandIcon: SelectExpandIcon,
    option: SelectOption,
    toggle: SelectToggle,
  })

  return (
    <div {...props} ref={ref} style={FIXED_STYLES.root}>
      <Styled
        aria-required={isRequired ? 'true' : undefined}
        element={components.toggle ?? <SelectToggle/>}
        name={name}
        required={isRequired}
        style={FIXED_STYLES.select}
        value={value}
        onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange?.(event.target.value)}
      >
        {placeholder !== undefined && (
          <Styled disabled hidden element={components.option ?? <SelectOption/>} value=''>{placeholder}</Styled>
        )}
        {options.map((val, idx) => (
          <Styled key={`${idx}-${val}`} element={components.option ?? <SelectOption/>} value={val}>{val}</Styled>
        ))}
      </Styled>
      {components.expandIcon && (
        <Styled element={components.expandIcon} style={FIXED_STYLES.expandIcon}/>
      )}
    </div>
  )
})

/**
 * Component for the expand icon of a {@link Select}.
 */
export const SelectExpandIcon = ({ children, style, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <figure {...props} aria-hidden={true} style={styles(style, { pointerEvents: 'none' })}>{children}</figure>
)

/**
 * Component for the `select` element of a {@link Select}.
 */
export const SelectToggle = ({ children, ...props }: HTMLAttributes<HTMLSelectElement>) => (
  <select {...props}>{children}</select>
)

/**
 * Component for each option of a {@link Select}.
 */
export const SelectOption = ({ ...props }: HTMLAttributes<HTMLOptionElement>) => (
  <option {...props}/>
)

const FIXED_STYLES = asStyleDict({
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
  expandIcon: {
    pointerEvents: 'none',
    zIndex: 1,
  },
})

if (process.env.NODE_ENV === 'development') {
  Select.displayName = 'Select'
  SelectExpandIcon.displayName = 'SelectExpandIcon'
  SelectOption.displayName = 'SelectOption'
  SelectToggle.displayName = 'SelectToggle'
}
