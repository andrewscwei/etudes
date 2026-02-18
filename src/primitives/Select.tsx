import { type ChangeEvent, forwardRef, type HTMLAttributes } from 'react'

import { asComponentDict } from '../utils/asComponentDict.js'
import { asStyleDict } from '../utils/asStyleDict.js'
import { Styled } from '../utils/Styled.js'
import { styles } from '../utils/styles.js'

const _Select = /* #__PURE__ */ forwardRef<HTMLDivElement, Select.Props>((
  {
    id,
    children,
    name,
    options,
    placeholder,
    value = '',
    isRequired = false,
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
        style={FIXED_STYLES.select}
        aria-required={isRequired ? 'true' : undefined}
        element={components.toggle ?? <_Toggle/>}
        name={name}
        required={isRequired}
        value={value}
        onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange?.(event.target.value)}
      >
        {placeholder !== undefined && (
          <Styled disabled element={components.option ?? <_Option/>} hidden value=''>{placeholder}</Styled>
        )}
        {options.map((val, idx) => (
          <Styled key={`${idx}-${val}`} element={components.option ?? <_Option/>} value={val}>{val}</Styled>
        ))}
      </Styled>
      {components.expandIcon && (
        <Styled style={FIXED_STYLES.expandIcon} element={components.expandIcon}/>
      )}
    </div>
  )
})

const _ExpandIcon = ({ style, children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <figure {...props} style={styles(style, { pointerEvents: 'none' })} aria-hidden={true}>{children}</figure>
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
  export type Props = {
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
  } & Omit<HTMLAttributes<HTMLDivElement>, 'onChange'>
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
  _Select.displayName = 'Select'

  _ExpandIcon.displayName = 'Select.ExpandIcon'
  _Option.displayName = 'Select.Option'
  _Toggle.displayName = 'Select.Toggle'
}
