import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

const debug = process.env.NODE_ENV === 'development' ? require('debug')('etudes:hooks') : () => {}

export type Options<T> = {
  mapSearchParamToState?: (value: string | null) => NonNullable<T> | null
  mapStateToSearchParam?: (state: T | null) => string | null
}

export default function useSearchParamState<T>(param: string, initialState?: T | null, { mapSearchParamToState, mapStateToSearchParam }: Options<T> = {}): [NonNullable<T> | null, Dispatch<SetStateAction<NonNullable<T> | null>>] {
  function _mapSearchParamToState(value: string | null, initialState?: T | null): NonNullable<T> | null {
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

  function _mapStateToSearchParam(state: T | null): string | null {
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
