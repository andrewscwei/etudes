import { forwardRef, type ChangeEvent, type HTMLAttributes } from 'react'
import { Styled } from '../utils/Styled.js'
import { asComponentDict } from '../utils/asComponentDict.js'
import { asStyleDict } from '../utils/asStyleDict.js'
import { styles } from '../utils/styles.js'

const _Select = /* #__PURE__ */ forwardRef<HTMLDivElement, Select.Props>((
  {
    children,
    id,
    isRequired = false,
    name,
    options,
    placeholder,
    value = '',
    onChange,
    ...props
  },
  ref,
) => {
  const components = asComponentDict(children, {
    expandIcon: _ExpandIcon,
    option: _Option,
    toggle: _Toggle,
  })

  return (
    <div {...props} ref={ref} style={FIXED_STYLES.root}>
      <Styled
        aria-required={isRequired ? 'true' : undefined}
        element={components.toggle ?? <_Toggle/>}
        name={name}
        required={isRequired}
        style={FIXED_STYLES.select}
        value={value}
        onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange?.(event.target.value)}
      >
        {placeholder !== undefined && (
          <Styled disabled hidden element={components.option ?? <_Option/>} value=''>{placeholder}</Styled>
        )}
        {options.map((val, idx) => (
          <Styled key={`${idx}-${val}`} element={components.option ?? <_Option/>} value={val}>{val}</Styled>
        ))}
      </Styled>
      {components.expandIcon && (
        <Styled element={components.expandIcon} style={FIXED_STYLES.expandIcon}/>
      )}
    </div>
  )
})

const _ExpandIcon = ({ children, style, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <figure {...props} aria-hidden={true} style={styles(style, { pointerEvents: 'none' })}>{children}</figure>
)

const _Toggle = ({ children, ...props }: HTMLAttributes<HTMLSelectElement>) => (
  <select {...props}>{children}</select>
)

const _Option = ({ ...props }: HTMLAttributes<HTMLOptionElement>) => (
  <option {...props}/>
)

export namespace Select {
  /**
   * Type describing the props of {@link Select}.
   */
  export type Props = Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> & {
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
     * Placeholder text to display when no option is selected (i.e. when the
     * value is `''`).
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
}

/**
 * A select component that allows users to select an option from a dropdown
 * toggle.
 *
 * @exports Select.ExpandIcon Component for the expand icon.
 * @exports Select.Option Component for each option.
 * @exports Select.Toggle Component for the toggle.
 */
export const Select = /* #__PURE__ */ Object.assign(_Select, {
  /**
   * Component for the expand icon of a {@link Select}.
   */
  ExpandIcon: _ExpandIcon,

  /**
   * Component for each option of a {@link Select}.
   */
  Option: _Option,

  /**
   * Component for the `select` element of a {@link Select}.
   */
  Toggle: _Toggle,
})

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
  _Select.displayName = 'Select'

  _ExpandIcon.displayName = 'Select.ExpandIcon'
  _Option.displayName = 'Select.Option'
  _Toggle.displayName = 'Select.Toggle'
}
