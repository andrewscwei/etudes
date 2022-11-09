import classNames from 'classnames'
import isEqual from 'fast-deep-equal'
import React, { forwardRef, HTMLAttributes, PropsWithChildren, useEffect, useRef, useState } from 'react'
import useDragEffect from './hooks/useDragEffect'
import useResizeEffect from './hooks/useResizeEffect'
import { Orientation, Range } from './types'
import asComponentDict from './utils/asComponentDict'
import asStyleDict from './utils/asStyleDict'
import cloneStyledElement from './utils/cloneStyledElement'
import styles from './utils/styles'

export type RangeSliderProps = HTMLAttributes<HTMLDivElement> & PropsWithChildren<{
  areLabelsVisible?: boolean
  decimalPlaces?: number
  knobPadding?: number
  knobRadius?: number
  max: number
  min: number
  orientation?: Orientation
  range?: Range
  steps?: number
  tintColor?: string
  onRangeChange?: (range: Range) => void
}>

export default forwardRef<HTMLDivElement, RangeSliderProps>(({
  children,
  className,
  areLabelsVisible = true,
  decimalPlaces = 2,
  knobPadding = 20,
  knobRadius = 10,
  max: maxValue,
  min: minValue,
  orientation = 'vertical',
  range: externalRange,
  steps = -1,
  tintColor = '#fff',
  onRangeChange,
  ...props
}, ref) => {
  const getPositionByValue = (value: number) => (value - minValue) / (maxValue - minValue)
  const getPositionByDisplacement = (displacement: number) => displacement / (orientation === 'horizontal' ? size.width : size.height)
  const getValueByPosition = (position: number) => position * (maxValue - minValue) + minValue
  const getValueByDisplacement = (displacement: number) => getValueByPosition(getPositionByDisplacement(displacement))
  const getDisplacementByPosition = (position: number) => position * (orientation === 'horizontal' ? size.width : size.height)
  const getDisplacementByValue = (value: number) => getDisplacementByPosition(getPositionByValue(value))

  const getClosestSteppedValue = (value: number) => {
    const n = breakpoints.length
    let idx = 0
    let diff = Infinity

    for (let i = 0; i < n; i++) {
      const t = breakpoints[i]
      const d = Math.abs(value - t)

      if (d < diff) {
        diff = d
        idx = i
      }
    }

    return breakpoints[idx]
  }

  const bodyRef = useRef<HTMLDivElement>(null)
  const startKnobRef = useRef<HTMLDivElement>(null)
  const endKnobRef = useRef<HTMLDivElement>(null)

  const [size] = useResizeEffect(bodyRef)

  const [startValue, setStartValue] = useState(externalRange?.[0] ?? minValue)
  const [endValue, setEndValue] = useState(externalRange?.[1] ?? maxValue)

  const { isDragging: [isDraggingStartKnob], isReleasing: [isReleasingStartKnob], value: [start, setStart] } = useDragEffect(startKnobRef, {
    initialValue: getDisplacementByValue(externalRange?.[0] ?? minValue),
    transform: (displacement: number, dx: number, dy: number) => {
      const delta = orientation === 'horizontal' ? dx : dy
      const dMin = getDisplacementByValue(minValue)
      const dMax = getDisplacementByValue(endValue)
      const dCurr = displacement

      return Math.max(dMin, Math.min(dMax, dCurr + delta))
    },
  }, [minValue, orientation, size, endValue])

  const { isDragging: [isDraggingEndKnob], isReleasing: [isReleasingEndKnob], value: [end, setEnd] } = useDragEffect(endKnobRef, {
    initialValue: getDisplacementByValue(externalRange?.[1] ?? maxValue),
    transform: (displacement: number, dx: number, dy: number) => {
      const delta = orientation === 'horizontal' ? dx : dy
      const dMin = getDisplacementByValue(startValue)
      const dMax = getDisplacementByValue(maxValue)
      const dCurr = displacement + delta

      return Math.max(dMin, Math.min(dMax, dCurr))
    },
  }, [maxValue, orientation, size, startValue])

  const breakpoints = [minValue, ...[...Array(steps)].map((v, i) => minValue + (i + 1) * (maxValue - minValue) / (1 + steps)), maxValue]
  const highlightLength = end - start

  useEffect(() => {
    const value = getValueByDisplacement(start)
    if (isNaN(value) || startValue === value) return
    setStartValue(getValueByDisplacement(start))
  }, [start, minValue, maxValue, orientation, size])

  useEffect(() => {
    const value = getValueByDisplacement(end)
    if (isNaN(value) || endValue === value) return
    setEndValue(getValueByDisplacement(end))
  }, [end, minValue, maxValue, orientation, size])

  useEffect(() => {
    if (isDraggingStartKnob || isDraggingEndKnob || isEqual(externalRange, [startValue, endValue])) return

    setStart(getDisplacementByValue(externalRange?.[0] ?? minValue))
    setEnd(getDisplacementByValue(externalRange?.[1] ?? maxValue))
  }, [externalRange])

  useEffect(() => {
    if (steps < 0) return
    const value = getValueByDisplacement(start)
    const closestSteppedValue = getClosestSteppedValue(value)
    setStart(getDisplacementByValue(closestSteppedValue))
  }, [isReleasingStartKnob])

  useEffect(() => {
    if (steps < 0 || !isReleasingEndKnob) return
    const value = getValueByDisplacement(end)
    const closestSteppedValue = getClosestSteppedValue(value)
    setEnd(getDisplacementByValue(closestSteppedValue))
  }, [isReleasingEndKnob])

  useEffect(() => {
    onRangeChange?.([startValue, endValue])
  }, [startValue, endValue])

  const components = asComponentDict(children, {
    gutter: RangeSliderGutter,
    highlight: RangeSliderHighlight,
    knob: RangeSliderKnob,
    label: RangeSliderLabel,
  })

  const fixedStyles = asStyleDict({
    body: {
      height: '100%',
      width: '100%',
    },
    gutter: {
      display: 'block',
      top: '0',
      left: '0',
      position: 'absolute',
      width: '100%',
      height: '100%',
    },
    highlight: {
      background: tintColor,
      height: '100%',
      left: '0',
      position: 'absolute',
      top: '0',
      ...orientation === 'horizontal' ? {
        width: `${highlightLength}px`,
        transform: `translate3d(${start}px, 0, 0)`,
      } : {
        height: `${highlightLength}px`,
        transform: `translate3d(0, ${start}px, 0)`,
      },
    },
    knob: {
      bottom: '0',
      left: '0',
      margin: 'auto',
      position: 'absolute',
      right: '0',
      top: '0',
      touchAction: 'none',
      zIndex: '1',
    },
    knobHitbox: {
      background: 'transparent',
      height: `calc(100% + ${knobPadding * 2}px)`,
      left: `-${knobPadding}px`,
      padding: `${knobPadding}px`,
      position: 'absolute',
      top: `-${knobPadding}px`,
      width: `calc(100% + ${knobPadding * 2}px)`,
    },
    label: {
      pointerEvents: 'none',
      userSelect: 'none',
    },
  })

  const defaultStyles = asStyleDict({
    gutter: {
      background: 'rgba(255, 255, 255, .2)',
    },
    highlight: {
      transitionDuration: '100ms',
      transitionProperty: (isReleasingStartKnob ? !isReleasingEndKnob : isReleasingEndKnob) ? 'opacity, width, transform' : 'opacity',
      transitionTimingFunction: 'ease-out',
    },
    knob: {
      alignItems: 'center',
      background: tintColor,
      borderRadius: `${knobRadius}px`,
      boxSizing: 'border-box',
      display: 'flex',
      height: `${knobRadius * 2}px`,
      justifyContent: 'center',
      transitionDuration: '100ms',
      transitionTimingFunction: 'ease-out',
      width: `${knobRadius * 2}px`,
    },
    label: {
      background: 'transparent',
      color: '#fff',
      textAlign: 'center',
      transitionDuration: '100ms',
      transitionTimingFunction: 'ease-out',
      ...orientation === 'horizontal' ? {
        top: `calc(100% + 10px)`,
      } : {
        left: `calc(100% + 10px)`,
      }
    },
  })

  return (
    <div {...props} className={classNames(className, orientation)} ref={ref}>
      <div ref={bodyRef} style={fixedStyles.body}>
        {cloneStyledElement(components.gutter ?? <RangeSliderGutter style={defaultStyles.gutter}/>, { className: orientation, style: fixedStyles.gutter })}
        {cloneStyledElement(components.highlight ?? <RangeSliderHighlight style={defaultStyles.highlight}/>, { className: orientation, style: fixedStyles.highlight })}
        {cloneStyledElement(components.knob ?? <RangeSliderKnob style={styles(defaultStyles.knob, {
          transitionProperty: isReleasingStartKnob ? 'opacity, transform' : 'opacity',
        })}/>, {
          ref: startKnobRef,
          disabled: isEqual([startValue, endValue], [maxValue, maxValue]),
          className: classNames(orientation, {
            dragging: isDraggingStartKnob,
            releasing: isReleasingStartKnob,
          }),
          style: styles(fixedStyles.knob, {
            pointerEvents: isEqual([startValue, endValue], [minValue, minValue]) ? 'none' : 'auto',
          }, orientation === 'horizontal' ? {
            marginLeft: `${start}px`,
          } : {
            marginTop: `${start}px`,
          }),
        }, <div style={fixedStyles.knobHitbox}/>, areLabelsVisible && (
          cloneStyledElement(components.label ?? <RangeSliderLabel style={styles(defaultStyles.label, {
            transitionProperty: isReleasingStartKnob ? 'opacity, transform' : 'opacity',
          })}/>, {
            className: classNames(orientation, {
              dragging: isDraggingStartKnob || isDraggingEndKnob,
              releasing: isReleasingStartKnob || isReleasingEndKnob,
            }),
            style: styles(fixedStyles.label),
          }, Number(startValue.toFixed(decimalPlaces)).toLocaleString())
        ))}
        {cloneStyledElement(components.knob ?? <RangeSliderKnob style={styles(defaultStyles.knob, {
            transitionProperty: isReleasingEndKnob ? 'opacity, transform' : 'opacity',
          })}/>, {
          ref: endKnobRef,
          disabled: isEqual([startValue, endValue], [maxValue, maxValue]),
          className: classNames(orientation, {
            dragging: isDraggingEndKnob,
            releasing: isDraggingEndKnob,
          }),
          style: styles(fixedStyles.knob, {
            pointerEvents: isEqual([startValue, endValue], [maxValue, maxValue]) ? 'none' : 'auto',
          }, orientation === 'horizontal' ? {
            marginLeft: `${end}px`,
          } : {
            marginTop: `${end}px`,
          }),
        }, <div style={fixedStyles.knobHitbox}/>, areLabelsVisible && (
          cloneStyledElement(components.label ?? <RangeSliderLabel style={styles(defaultStyles.label, {
            transitionProperty: isReleasingEndKnob ? 'opacity, transform' : 'opacity',
          })}/>, {
            className: classNames(orientation, {
              dragging: isDraggingEndKnob,
              releasing: isReleasingEndKnob,
            }),
            style: styles(fixedStyles.label),
          }, Number(endValue.toFixed(decimalPlaces)).toLocaleString())
        ))}
      </div>
    </div>
  )
})

export const RangeSliderGutter = ({ ...props }: HTMLAttributes<HTMLDivElement>) => <div {...props}/>

export const RangeSliderLabel = ({ ...props }: HTMLAttributes<HTMLDivElement>) => <div {...props}/>

export const RangeSliderHighlight = ({ ...props }: HTMLAttributes<HTMLDivElement>) => <div {...props}/>

export const RangeSliderKnob = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ ...props }, ref) => <div {...props} ref={ref}/>)
