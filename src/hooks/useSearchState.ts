import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { useSearchParams } from 'react-router'

/**
 * Type describing the output of {@link useSearchState}.
 */
export type UseSearchStateOutput<T> = [T, Dispatch<SetStateAction<T>>]

/**
 * Type describing the output of {@link useSearchState}.
 */
export type UseSearchStateOptions<T> = {
  /**
   * Function for transforming the search param value to the value of the mapped
   * state.
   *
   * @param value The search param value. `undefined` means the value is
   *              unavailable.
   *
   * @returns The equivalent state value.
   */
  mapSearchParamToState?: (value?: string) => T

  /**
   * Function for transforming the value of the mapped state to the search param
   * value.
   *
   * @param state The state value.
   *
   * @returns The equivalent search param value.
   */
  mapStateToSearchParam?: (state: T) => string | undefined

  /**
   * Whether to populate the state with the default value when the search param
   * is not present.
   */
  shouldPopulateDefaultState?: boolean
}

/**
 * Hook for mapping a search param to a state. Whenever the value of the target
 * search param changes, the mapped state will change as well, and vice versa.
 *
 * @param param The search param key.
 * @param defaultValue The default value of the state.
 * @param options See {@link UseSearchStateOptions}.
 *
 * @returns A tuple consisting of a stateful value representing the current
 *          value of the mapped state and a function that updates it.
 */
export function useSearchState<T>(
  param: string,
  defaultValue: T,
  {
    mapSearchParamToState,
    mapStateToSearchParam,
    shouldPopulateDefaultState = false,
  }: UseSearchStateOptions<T> = {},
): UseSearchStateOutput<T> {
  const defaultMapSearchParamToState = useCallback((value: string | undefined, fallback: T): T => {
    if (mapSearchParamToState) {
      return mapSearchParamToState(value)
    }
    else if (!value) {
      return fallback
    }
    else {
      return value as unknown as NonNullable<T>
    }
  }, [mapSearchParamToState])

  const defaultMapStateToSearchParam = useCallback((value: T): string | undefined => {
    if (mapStateToSearchParam) {
      return mapStateToSearchParam(value)
    }
    else if (!shouldPopulateDefaultState && value === defaultValue) {
      return undefined
    }
    else {
      return `${value}`
    }
  }, [defaultValue, shouldPopulateDefaultState, mapStateToSearchParam])

  const [searchParams, setSearchParams] = useSearchParams()
  const currentState = defaultMapSearchParamToState(searchParams.get(param) ?? undefined, defaultValue)
  const [state, setState] = useState(currentState)

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

    setSearchParams(searchParams)
  }, [state, defaultMapStateToSearchParam])

  return [state, setState]
}
