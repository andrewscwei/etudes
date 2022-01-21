import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

const debug = process.env.NODE_ENV === 'development' ? require('debug')('etudes:hooks') : () => {}

export type Options<T> = {
  /**
   * Function for transforming the search param value to the value of the mapped state.
   */
  mapSearchParamToState?: (value: string | null) => NonNullable<T> | null

  /**
   * Function for transforming the value of the mapped state to the search param value.
   */
  mapStateToSearchParam?: (state: T | null) => string | null
}

/**
 * Hook for mapping a search param to a state. Whenever the value of the target search param
 * changes, the mapped state will change as well, and vice versa.
 *
 * @param param - The search param key.
 * @param initialState - The initial value of the state.
 * @param options - See {@link Options}.
 *
 * @returns A tuple consisting of a stateful value representing the current value of the mapped
 *          state and a function that updates it.
 */
export default function useSearchParamState<T>(param: string, initialState?: T | null, { mapSearchParamToState, mapStateToSearchParam }: Options<T> = {}): [NonNullable<T> | null, Dispatch<SetStateAction<NonNullable<T> | null>>] {
  const _mapSearchParamToState = (value: string | null, initialState?: T | null): NonNullable<T> | null => {
    if (mapSearchParamToState) {
      return mapSearchParamToState(value)
    }
    else if (value === null) {
      return initialState ?? null
    }
    else {
      return value as unknown as NonNullable<T>
    }
  }

  const _mapStateToSearchParam = (state: T | null): string | null => {
    if (mapStateToSearchParam) {
      return mapStateToSearchParam(state)
    }
    else if (state === null) {
      return null
    }
    else {
      return `${state}`
    }
  }

  const [searchParams, setSearchParams] = useSearchParams()
  const currentState = _mapSearchParamToState(searchParams.get(param), initialState)
  const [state, setState] = useState(currentState)

  debug('Using search param state...', 'OK', `param=${param}, initialState=${currentState}`)

  useEffect(() => {
    const value = searchParams.get(param)
    const newValue = _mapStateToSearchParam(state)

    if (newValue === value) return

    if (newValue === null) {
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
