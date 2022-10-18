import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const debug = process.env.NODE_ENV === 'development' ? require('debug')('etudes:hooks') : () => {}

export type Options<T> = {
  /**
   * Function for transforming the search param value to the value of the mapped state.
   *
   * @param value - The search param value. `undefined` means the value is unavailable.
   *
   * @returns The equivalent state value.
   */
  mapSearchParamToState?: (value?: string) => T

  /**
   * Function for transforming the value of the mapped state to the search param value.
   *
   * @param state - The state value.
   *
   * @returns The equivalent search param value.
   */
  mapStateToSearchParam?: (state: T) => string | undefined
}

/**
 * Hook for mapping a search param to a state. Whenever the value of the target search param
 * changes, the mapped state will change as well, and vice versa.
 *
 * @param param - The search param key.
 * @param defaultValue - The default value of the state.
 * @param options - See {@link Options}.
 *
 * @returns A tuple consisting of a stateful value representing the current value of the mapped
 *          state and a function that updates it.
 */
export default function useSearchParamState<T>(param: string, defaultValue: T, { mapSearchParamToState, mapStateToSearchParam }: Options<T> = {}): [T, Dispatch<SetStateAction<T>>] {
  const defaultMapSearchParamToState = (value: string | undefined, fallback: T): T => {
    if (mapSearchParamToState) {
      return mapSearchParamToState(value)
    }
    else if (!value) {
      return fallback
    }
    else {
      return value as unknown as NonNullable<T>
    }
  }

  const defaultMapStateToSearchParam = (state: T): string | undefined => {
    if (mapStateToSearchParam) {
      return mapStateToSearchParam(state)
    }
    else if (state === defaultValue) {
      return undefined
    }
    else {
      return `${state}`
    }
  }

  const [searchParams, setSearchParams] = useSearchParams()
  const currentState = defaultMapSearchParamToState(searchParams.get(param) ?? undefined, defaultValue)
  const [state, setState] = useState(currentState)

  debug('Using search param state...', 'OK', `param=${param}, defaultValue=${currentState}`)

  useEffect(() => {
    const value = searchParams.get(param)
    const newValue = defaultMapStateToSearchParam(state)

    if (newValue === value) return

    if (!newValue) {
      searchParams.delete(param)
    }
    else {
      searchParams.set(param, newValue)
    }

    debug('Handling state change...', 'OK', `state=${state}, oldValue=${value}, newValue=${newValue}`)

    setSearchParams(searchParams)
  }, [state])

  return [state, setState]
}
