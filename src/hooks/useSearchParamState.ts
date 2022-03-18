import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

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
  const _mapSearchParamToState = (value: string | undefined, defaultValue: T): T => {
    if (mapSearchParamToState) {
      return mapSearchParamToState(value)
    }
    else if (!value) {
      return defaultValue
    }
    else {
      return value as unknown as NonNullable<T>
    }
  }

  const _mapStateToSearchParam = (state: T): string | undefined => {
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
  const currentState = _mapSearchParamToState(searchParams.get(param) ?? undefined, defaultValue)
  const [state, setState] = useState(currentState)

  debug('Using search param state...', 'OK', `param=${param}, defaultValue=${currentState}`)

  useEffect(() => {
    const value = searchParams.get(param)
    const newValue = _mapStateToSearchParam(state)

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
