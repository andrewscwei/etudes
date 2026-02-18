import { type ChangeEvent, type ClipboardEvent, forwardRef, type HTMLAttributes, type HTMLInputAutoCompleteAttribute, type KeyboardEvent, useEffect, useRef } from 'react'

import { Repeat } from '../flows/Repeat.js'
import { asComponentDict } from '../utils/asComponentDict.js'
import { asStyleDict } from '../utils/asStyleDict.js'
import { Styled } from '../utils/Styled.js'
import { styles } from '../utils/styles.js'

const _CodeInput = /* #__PURE__ */ forwardRef<HTMLDivElement, CodeInput.Props>((
  {
    style,
    autoComplete = 'one-time-code',
    autoFocus = false,
    children,
    inputMode = 'numeric',
    placeholder,
    size,
    value,
    isDisabled = false,
    isRequired = true,
    onChange,
    ...props
  },
  ref,
) => {
  const fields = _normalizeFields(value, size)
  const fieldRefs = useRef<HTMLInputElement[]>([])
  const fixedStyles = _getFixedStyles()

  const components = asComponentDict(children, {
    field: _Field,
  })

  const focusOn = (index: number) => {
    if (index < 0) {
      fieldRefs.current[0]?.focus()
    } else if (index >= size) {
      fieldRefs.current[size - 1]?.focus()
    } else {
      fieldRefs.current[index]?.focus()
    }
  }

  const changeHandler = (index: number) => {
    return (e: ChangeEvent<HTMLInputElement>) => {
      const curr = fields[index]
      const input = _trimEdgeChar(e.target.value, curr)
      const newValue = _insertFields(fields.slice(), input.split('').slice(0, size), index)

      onChange(newValue)

      const nextIndex = Math.min(index + input.length, size - 1)

      focusOn(nextIndex)
    }
  }

  const keyDownHandler = (index: number) => {
    return (e: KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
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
        case 'Backspace': {
          e.preventDefault()

          if (fields[index]) {
            const newValue = fields.slice()
            newValue[index] = ''

            onChange(newValue)
            focusOn(index - 1)
          } else {
            focusOn(index - 1)
          }

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

      const input = e.clipboardData.getData('text').trim()
      const newValue = _insertFields(fields.slice(), input.split('').slice(0, size), index)

      onChange(newValue)

      const nextIndex = Math.min(index + input.length, size - 1)

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
            {...isDisabled ? { 'aria-disabled': true } : {}}
            ref={(el: HTMLInputElement) => (fieldRefs.current[i] = el)}
            style={styles(fixedStyles.field)}
            aria-required={isRequired}
            autoComplete={autoComplete}
            disabled={isDisabled}
            element={components.field ?? <_Field/>}
            inputMode={inputMode}
            placeholder={placeholder}
            required={isRequired}
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
  <input
    {...props}
    autoCapitalize='off'
    autoCorrect='off'
    type='text'
  />
)

export namespace CodeInput {
  /**
   * Type describing the properties of {@link CodeInput}.
   */
  export type Props = {
    /**
     * Specifies the autocomplete behavior for the code input.
     */
    autoComplete?: HTMLInputAutoCompleteAttribute

    /**
     * Specifies if the first empty field should be focused on mount.
     */
    autoFocus?: boolean

    /**
     * Specifies the input mode for each field.
     */
    inputMode?: 'numeric' | 'text'

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
  } & Omit<HTMLAttributes<HTMLDivElement>, 'onChange'>
}

/**
 * A component for entering codes, such as verification codes or PINs, through
 * multiple input fields.
 *
 * @exports CodeInput.Field Component for the each field in a {@link CodeInput}.
 */
export const CodeInput = /* #__PURE__ */ Object.assign(_CodeInput, {
  /**
   * Component for the each field in a {@link CodeInput}.
   */
  Field: _Field,
})

function _getFixedStyles() {
  return asStyleDict({
    field: {
      caretColor: 'transparent',
      flex: '1',
      minWidth: '0',
    },
    root: {
      alignItems: 'stretch',
      display: 'flex',
      justifyContent: 'stretch',
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

function _trimEdgeChar(str: string, char: string) {
  if (char === '') {
    return str
  }

  if (str.startsWith(char)) {
    return str.slice(char.length)
  }

  if (str.endsWith(char)) {
    return str.slice(0, -char.length)
  }

  return str
}

if (process.env.NODE_ENV === 'development') {
  _CodeInput.displayName = 'CodeInput'

  _Field.displayName = 'CodeInput.Field'
}
