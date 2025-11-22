import { forwardRef, useEffect, useRef, type ChangeEvent, type ClipboardEvent, type HTMLAttributes, type KeyboardEvent } from 'react'
import { Repeat } from '../flows/Repeat.js'
import { asComponentDict } from '../utils/asComponentDict.js'
import { asStyleDict } from '../utils/asStyleDict.js'
import { Styled } from '../utils/Styled.js'
import { styles } from '../utils/styles.js'

const _CodeInput = /* #__PURE__ */ forwardRef<HTMLDivElement, CodeInput.Props>(({
  children,
  autoFocus = false,
  isDisabled = false,
  isRequired = true,
  placeholder,
  size,
  style,
  value,
  onChange,
  ...props
}, ref) => {
  const fields = _normalizeFields(value, size)
  const fieldRefs = useRef<HTMLInputElement[]>([])
  const fixedStyles = _getFixedStyles()

  const components = asComponentDict(children, {
    field: _Field,
  })

  const focusOn = (index: number) => {
    if (index < 0) {
      fieldRefs.current[0]?.focus()
    }
    else if (index >= size) {
      fieldRefs.current[size - 1]?.focus()
    }
    else {
      fieldRefs.current[index]?.focus()
    }
  }

  const changeHandler = (index: number) => {
    return (e: ChangeEvent<HTMLInputElement>) => {
      const prev = fields[index]
      const curr = e.target.value
      const char = _replaceFirst(curr, prev).slice(-1)

      const newValue = fields.slice()
      newValue[index] = char

      onChange(newValue)

      if (char) {
        focusOn(index + 1)
      }
      else {
        focusOn(index - 1)
      }
    }
  }

  const keyDownHandler = (index: number) => {
    return (e: KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case 'Backspace': {
          e.preventDefault()

          if (fields[index]) {
            const newValue = fields.slice()
            newValue[index] = ''

            onChange(newValue)
            focusOn(index - 1)
          }
          else {
            focusOn(index - 1)
          }

          break
        }
        case 'ArrowLeft': {
          e.preventDefault()
          focusOn(index - 1)
          break
        }
        case 'ArrowRight': {
          e.preventDefault()
          focusOn(index + 1)
          break
        }
        default:
          break
      }
    }
  }

  const pasteHandler = (index: number) => {
    return (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault()

      const text = e.clipboardData.getData('text').trim()
      const newValue = _insertFields(fields.slice(), text.split('').slice(0, size), index)

      onChange(newValue)

      const nextIndex = Math.min(index + text.length, size - 1)

      focusOn(nextIndex)
    }
  }

  useEffect(() => {
    if (!autoFocus) return

    const firstEmpty = fields.findIndex(t => t === '')

    if (firstEmpty !== -1) {
      focusOn(firstEmpty)
    }
  }, [autoFocus])

  return (
    <div {...props} ref={ref} style={styles(style, fixedStyles.root)}>
      <Repeat count={size}>
        {i => (
          <Styled
            ref={(el: HTMLInputElement) => (fieldRefs.current[i] = el)}
            aria-disabled={isDisabled}
            aria-required={isRequired}
            disabled={isDisabled}
            element={components.field ?? <_Field/>}
            placeholder={placeholder}
            required={isRequired}
            style={styles(fixedStyles.field)}
            value={fields[i]}
            onChange={changeHandler(i)}
            onKeyDown={keyDownHandler(i)}
            onPaste={pasteHandler(i)}
          />
        )}
      </Repeat>
    </div>
  )
})

const _Field = ({ ...props }: HTMLAttributes<HTMLInputElement>) => (
  <input {...props} type='text'/>
)

function _getFixedStyles() {
  return asStyleDict({
    root: {
      alignItems: 'stretch',
      display: 'flex',
      justifyContent: 'stretch',
    },
    field: {
      caretColor: 'transparent',
      flex: '1',
      minWidth: '0',
    },
  })
}

function _normalizeFields(value: string[], size: number) {
  const out = value.slice(0, size)

  while (out.length < size) {
    out.push('')
  }

  return out
}

function _insertFields(source: string[], target: string[], start: number = 0) {
  let writeIdx = start
  let readIdx = 0

  while (readIdx < target.length && writeIdx < source.length) {
    source[writeIdx] = target[readIdx]
    writeIdx++
    readIdx++
  }

  while (readIdx < target.length) {
    source.shift()
    source.push(target[readIdx])
    readIdx++
  }

  return source
}

function _replaceFirst(str: string, search: string, replacement: string = '') {
  const index = str.indexOf(search)

  if (index === -1) return str

  return (str.slice(0, index) + replacement + str.slice(index + search.length))
}

export namespace CodeInput {
  /**
   * Type describing the properties of {@link CodeInput}.
   */
  export type Props = Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> & {
    /**
     * Specifies if the first empty field should be focused on mount.
     */
    autoFocus?: boolean

    /**
     * Specifies if each field in the code input is disabled.
     */
    isDisabled?: boolean

    /**
     * Specifies if each field in the code input is required.
     */
    isRequired?: boolean

    /**
     * Placeholder text for each field.
     */
    placeholder?: string

    /*
     * The number of input fields.
     */
    size: number

    /**
     * The current value.
     */
    value: string[]

    /**
     * Handler invoked when the value changes.
     *
     * @param newValue The new value.
     */
    onChange: (newValue: string[]) => void
  }
}

/**
 * A component for entering codes, such as verification codes or PINs, through
 * multiple input fields.
 *
 * @exports CodeInput.Field Component for the each field in a {@link CodeInput}.
 */
export const CodeInput = Object.assign(_CodeInput, {
  /**
   * Component for the each field in a {@link CodeInput}.
   */
  Field: _Field,
})

if (process.env.NODE_ENV === 'development') {
  _CodeInput.displayName = 'CodeInput'
  _Field.displayName = 'CodeInput.Field'
}
