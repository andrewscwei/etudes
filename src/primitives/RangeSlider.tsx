import clsx from 'clsx'
import isDeepEqual from 'fast-deep-equal/react'
import { forwardRef, type HTMLAttributes, useCallback, useEffect, useRef, useState } from 'react'
import { Rect } from 'spase'

import { useInertiaDragValue } from '../hooks/useInertiaDragValue.js'
import { useRect } from '../hooks/useRect.js'
import { asClassNameDict } from '../utils/asClassNameDict.js'
import { asComponentDict } from '../utils/asComponentDict.js'
import { asStyleDict } from '../utils/asStyleDict.js'
import { createKey } from '../utils/createKey.js'
import { Styled } from '../utils/Styled.js'
import { styles } from '../utils/styles.js'

const _RangeSlider = /* #__PURE__ */ forwardRef<HTMLDivElement, Readonly<RangeSlider.Props>>((
  {
    className,
    children,
    decimalPlaces = 2,
    knobHeight = 28,
    knobPadding = 0,
    knobWidth = 40,
    max: maxValue,
    min: minValue,
    orientation = 'vertical',
    range: externalRange,
    steps = -1,
    isClipped = false,
    onChange,
    ...props
  },
  ref,
) => {
  const bodyRef = useRef<HTMLDivElement>(null)
  const bodyRect = useRect(bodyRef)
  const startKnobContainerRef = useRef<HTMLDivElement>(null)
  const endKnobContainerRef = useRef<HTMLDivElement>(null)
  const [range, setRange] = useState<RangeSlider.Range>(externalRange ?? [minValue, maxValue])
  const breakpoints = _createBreakpoints(minValue, maxValue, steps)
  const [start, end] = range.map(t => _getDisplacementByValue(t, minValue, maxValue, orientation, bodyRect, knobWidth, knobHeight, isClipped))
  const highlightLength = end - start
  const components = asComponentDict(children, {
    gutter: _Gutter,
    highlight: _Highlight,
    knob: _Knob,
    knobContainer: _KnobContainer,
    label: _Label,
  })

  const mapStartDragValueToValue = useCallback((value: number, dx: number, dy: number) => {
    const delta = orientation === 'horizontal' ? dx : dy
    const dMin = _getDisplacementByValue(minValue, minValue, maxValue, orientation, bodyRect, knobWidth, knobHeight, isClipped)
    const dMax = _getDisplacementByValue(range[1], minValue, maxValue, orientation, bodyRect, knobWidth, knobHeight, isClipped)
    const dCurr = _getDisplacementByValue(value, minValue, maxValue, orientation, bodyRect, knobWidth, knobHeight, isClipped) + delta

    return _getValueByDisplacement(Math.max(dMin, Math.min(dMax, dCurr)), minValue, maxValue, orientation, bodyRect, knobWidth, knobHeight, isClipped)
  }, [knobWidth, knobHeight, isClipped, minValue, maxValue, orientation, range[1], Rect.toString(bodyRect)])

  const mapEndDragValueToValue = useCallback((value: number, dx: number, dy: number) => {
    const delta = orientation === 'horizontal' ? dx : dy
    const dMin = _getDisplacementByValue(range[0], minValue, maxValue, orientation, bodyRect, knobWidth, knobHeight, isClipped)
    const dMax = _getDisplacementByValue(maxValue, minValue, maxValue, orientation, bodyRect, knobWidth, knobHeight, isClipped)
    const dCurr = _getDisplacementByValue(value, minValue, maxValue, orientation, bodyRect, knobWidth, knobHeight, isClipped) + delta

    return _getValueByDisplacement(Math.max(dMin, Math.min(dMax, dCurr)), minValue, maxValue, orientation, bodyRect, knobWidth, knobHeight, isClipped)
  }, [knobWidth, knobHeight, isClipped, minValue, maxValue, orientation, range[0], Rect.toString(bodyRect)])

  const { setValue: setStartValue, value: startValue, isDragging: isDraggingStartKnob, isReleasing: isReleasingStartKnob } = useInertiaDragValue(startKnobContainerRef, {
    initialValue: externalRange?.[0] ?? minValue,
    transform: mapStartDragValueToValue,
  })

  const { setValue: setEndValue, value: endValue, isDragging: isDraggingEndKnob, isReleasing: isReleasingEndKnob } = useInertiaDragValue(endKnobContainerRef, {
    initialValue: externalRange?.[1] ?? maxValue,
    transform: mapEndDragValueToValue,
  })

  const fixedClassNames = _getFixedClassNames({ isDraggingEndKnob, isDraggingStartKnob, isReleasingEndKnob, isReleasingStartKnob })
  const fixedStyles = _getFixedStyles({ highlightLength, knobHeight, knobPadding, knobWidth, orientation, start })

  useEffect(() => {
    setRange([startValue, endValue])
  }, [startValue, endValue])

  useEffect(() => {
    onChange?.(range)
  }, [range[0], range[1]])

  useEffect(() => {
    if (isDraggingStartKnob || isDraggingEndKnob || isReleasingEndKnob || isDeepEqual(externalRange, range)) return
    setRange(externalRange ?? [minValue, maxValue])
    setStartValue(externalRange?.[0] ?? minValue)
    setEndValue(externalRange?.[1] ?? maxValue)
  }, [externalRange?.[0], externalRange?.[1], isDraggingStartKnob, isDraggingEndKnob, isReleasingEndKnob])

  useEffect(() => {
    if (!breakpoints) return
    setStartValue(_getClosestSteppedValue(startValue, breakpoints))
  }, [isReleasingStartKnob, createKey(breakpoints)])

  useEffect(() => {
    if (!breakpoints || !isReleasingEndKnob) return
    setEndValue(_getClosestSteppedValue(endValue, breakpoints))
  }, [isReleasingEndKnob, createKey(breakpoints)])

  return (
    <div
      {...props}
      className={clsx(className, orientation)}
      ref={ref}
      aria-valuemax={maxValue}
      aria-valuemin={minValue}
      role='slider'
    >
      <div ref={bodyRef} style={fixedStyles.body}>
        <Styled style={styles(fixedStyles.gutter)} element={components.gutter ?? <_Gutter/>}/>
        <Styled style={styles(fixedStyles.highlight)} element={components.highlight ?? <_Highlight/>}/>
        <Styled
          className={fixedClassNames.startKnobContainer}
          ref={startKnobContainerRef}
          style={styles(fixedStyles.knobContainer, {
            pointerEvents: isDeepEqual([startValue, endValue], [minValue, minValue]) ? 'none' : 'auto',
          }, orientation === 'horizontal' ? {
            left: `${start}px`,
            top: `${bodyRect.height * 0.5}px`,
          } : {
            left: `${bodyRect.width * 0.5}px`,
            top: `${start}px`,
          })}
          disabled={isDeepEqual([startValue, endValue], [minValue, minValue])}
          element={components.knobContainer ?? <_KnobContainer/>}
        >
          <Styled className={fixedClassNames.startKnob} style={styles(fixedStyles.knob)} element={components.knob ?? <_Knob/>}>
            <div style={fixedStyles.knobHitBox}/>
            {components.label && (
              <Styled className={fixedClassNames.startLabel} style={styles(fixedStyles.label)} element={components.label ?? <_Label/>}>
                {Number(startValue.toFixed(decimalPlaces)).toLocaleString()}
              </Styled>
            )}
          </Styled>
        </Styled>
        <Styled
          className={fixedClassNames.endKnobContainer}
          ref={endKnobContainerRef}
          style={styles(fixedStyles.knobContainer, {
            pointerEvents: isDeepEqual([startValue, endValue], [maxValue, maxValue]) ? 'none' : 'auto',
          }, orientation === 'horizontal' ? {
            left: `${end}px`,
            top: `${bodyRect.height * 0.5}px`,
          } : {
            left: `${bodyRect.width * 0.5}px`,
            top: `${end}px`,
          })}
          disabled={isDeepEqual([startValue, endValue], [maxValue, maxValue])}
          element={components.knobContainer ?? <_KnobContainer/>}
        >
          <Styled className={fixedClassNames.endKnob} style={styles(fixedStyles.knob)} element={components.knob ?? <_Knob/>}>
            <div style={fixedStyles.knobHitBox}/>
            {components.label && (
              <Styled className={fixedClassNames.endLabel} style={styles(fixedStyles.label)} element={components.label ?? <_Label/>}>
                {Number(endValue.toFixed(decimalPlaces)).toLocaleString()}
              </Styled>
            )}
          </Styled>
        </Styled>
      </div>
    </div>
  )
})

const _Gutter = ({ ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div {...props}/>
)

const _Label = ({ ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div {...props}/>
)

const _Highlight = ({ ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div {...props}/>
)

const _Knob = ({ ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div {...props}/>
)

const _KnobContainer = ({ ...props }: HTMLAttributes<HTMLButtonElement>) => (
  <button {...props}/>
)

export namespace RangeSlider {
  /**
   * Type describing the orientation of {@link RangeSlider}.
   */
  export type Orientation = 'horizontal' | 'vertical'

  /**
   * Type describing the range of values of {@link RangeSlider}.
   */
  export type Range = [number, number]

  /**
   * Type describing the props of {@link RangeSlider}.
   */
  export type Props = {
    /**
     * Number of decimal places to display.
     */
    decimalPlaces?: number

    /**
     * Specifies if the knobs are clipped to the track.
     */
    isClipped?: boolean

    /**
     * Height of the knobs in pixels.
     */
    knobHeight?: number

    /**
     * Invisible padding around the knobs in pixels, helps expand their hit
     * boxes.
     */
    knobPadding?: number

    /**
     * Width of the knobs in pixels.
     */
    knobWidth?: number

    /**
     * Maximum value to clamp to.
     */
    max: number

    /**
     * Minimum value to clamp to.
     */
    min: number

    /**
     * Orientation of the slider.
     */
    orientation?: Orientation

    /**
     * Range of values.
     */
    range?: Range

    /**
     * Number of intervals between the minimum and maximum values to snap to
     * when either knob releases. If set to `-1`, the knobs will not snap to any
     * value.
     */
    steps?: number

    /**
     * Handler invoked when the range of values changes.
     *
     * @param range The current range of values.
     */
    onChange?: (range: Range) => void
  } & Omit<HTMLAttributes<HTMLDivElement>, 'aria-valuemax' | 'aria-valuemin' | 'onChange' | 'role'>
}

/**
 * A slider component that allows the user to select a range of values.
 *
 * @exports RangeSlider.Gutter Component for the gutter.
 * @exports RangeSlider.Highlight Component for the highlight.
 * @exports RangeSlider.Knob Component for the knob.
 * @exports RangeSlider.KnobContainer Component for the container of the knob.
 * @exports RangeSlider.Label Component for the label.
 */
export const RangeSlider = /* #__PURE__ */ Object.assign(_RangeSlider, {
  /**
   * Component for the gutter of a {@link RangeSlider}.
   */
  Gutter: _Gutter,

  /**
   * Component for the highlight of a {@link RangeSlider}.
   */
  Highlight: _Highlight,

  /**
   * Component for the knob of a {@link RangeSlider}.
   */
  Knob: _Knob,

  /**
   * Component for the container of the knob of a {@link RangeSlider}.
   */
  KnobContainer: _KnobContainer,

  /**
   * Component for the label of a {@link RangeSlider}.
   */
  Label: _Label,
})

function _getFixedClassNames({ isDraggingEndKnob = false, isDraggingStartKnob = false, isReleasingEndKnob = false, isReleasingStartKnob = false }) {
  return asClassNameDict({
    endKnob: clsx({
      dragging: isDraggingEndKnob,
      releasing: isReleasingEndKnob,
    }),
    endKnobContainer: clsx({
      dragging: isDraggingEndKnob,
      releasing: isReleasingEndKnob,
    }),
    endLabel: clsx({
      dragging: isDraggingEndKnob,
      releasing: isReleasingEndKnob,
    }),
    startKnob: clsx({
      dragging: isDraggingStartKnob,
      releasing: isReleasingStartKnob,
    }),
    startKnobContainer: clsx({
      dragging: isDraggingStartKnob,
      releasing: isReleasingStartKnob,
    }),
    startLabel: clsx({
      dragging: isDraggingStartKnob,
      releasing: isReleasingStartKnob,
    }),
  })
}

function _getFixedStyles({ highlightLength = 0, knobHeight = 0, knobPadding = 0, knobWidth = 0, orientation = 'horizontal', start = 0 }) {
  return asStyleDict({
    body: {
      height: '100%',
      width: '100%',
    },
    gutter: {
      display: 'block',
      height: '100%',
      left: '0',
      position: 'absolute',
      top: '0',
      width: '100%',
    },
    highlight: {
      left: '0',
      position: 'absolute',
      top: '0',
      ...orientation === 'horizontal' ? {
        height: '100%',
        transform: `translate(${start}px, 0)`,
        width: `${highlightLength}px`,
      } : {
        height: `${highlightLength}px`,
        transform: `translate(0, ${start}px)`,
        width: '100%',
      },
    },
    knob: {
      height: `${knobHeight}px`,
      touchAction: 'none',
      width: `${knobWidth}px`,
    },
    knobContainer: {
      background: 'none',
      border: 'none',
      outline: 'none',
      position: 'absolute',
      transform: 'translate(-50%, -50%)',
      zIndex: '1',
    },
    knobHitBox: {
      background: 'none',
      height: `calc(100% + ${knobPadding * 2}px)`,
      left: `-${knobPadding}px`,
      padding: `${knobPadding}px`,
      position: 'absolute',
      top: `-${knobPadding}px`,
      width: `calc(100% + ${knobPadding * 2}px)`,
    },
    label: {
      pointerEvents: 'none',
      position: 'relative',
      userSelect: 'none',
    },
  })
}

function _getPositionByValue(value: number, min: number, max: number) {
  return (value - min) / (max - min)
}

function _getPositionByDisplacement(displacement: number, orientation: RangeSlider.Orientation, rect: Rect, knobWidth: number, knobHeight: number, isClipped: boolean) {
  switch (orientation) {
    case 'horizontal': {
      const maxWidth = isClipped ? rect.width - knobWidth : rect.width
      return (displacement - (isClipped ? knobWidth * 0.5 : 0)) / maxWidth
    }
    case 'vertical': {
      const maxHeight = isClipped ? rect.height - knobHeight : rect.height
      return (displacement - (isClipped ? knobHeight * 0.5 : 0)) / maxHeight
    }
    default:
      console.error(`[etudes::RangeSlider] Invalid orientation: ${orientation}`)

      return NaN
  }
}

function _getValueByPosition(position: number, min: number, max: number) {
  return position * (max - min) + min
}

function _getValueByDisplacement(displacement: number, min: number, max: number, orientation: RangeSlider.Orientation, rect: Rect, knobWidth: number, knobHeight: number, isClipped: boolean) {
  const position = _getPositionByDisplacement(displacement, orientation, rect, knobWidth, knobHeight, isClipped)

  return _getValueByPosition(position, min, max)
}

function _getDisplacementByPosition(position: number, orientation: RangeSlider.Orientation, rect: Rect, knobWidth: number, knobHeight: number, isClipped: boolean) {
  switch (orientation) {
    case 'horizontal': {
      const maxWidth = isClipped ? rect.width - knobWidth : rect.width
      return position * maxWidth + (isClipped ? knobWidth * 0.5 : 0)
    }
    case 'vertical': {
      const maxHeight = isClipped ? rect.height - knobHeight : rect.height
      return position * maxHeight + (isClipped ? knobHeight * 0.5 : 0)
    }
    default:
      console.error(`[etudes::RangeSlider] Invalid orientation: ${orientation}`)

      return NaN
  }
}

function _getDisplacementByValue(value: number, min: number, max: number, orientation: RangeSlider.Orientation, rect: Rect, knobWidth: number, knobHeight: number, isClipped: boolean) {
  const position = _getPositionByValue(value, min, max)

  return _getDisplacementByPosition(position, orientation, rect, knobWidth, knobHeight, isClipped)
}

function _getClosestSteppedValue(value: number, breakpoints: number[]) {
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

function _createBreakpoints(min: number, max: number, steps: number): number[] | undefined {
  if (steps < 0) return undefined

  return [
    min,
    ...[...Array(steps)].map((_, i) => min + (i + 1) * (max - min) / (1 + steps)),
    max,
  ]
}

if (process.env.NODE_ENV === 'development') {
  _RangeSlider.displayName = 'RangeSlider'

  _Gutter.displayName = 'RangeSlider.Gutter'
  _Label.displayName = 'RangeSlider.Label'
  _Highlight.displayName = 'RangeSlider.Highlight'
  _Knob.displayName = 'RangeSlider.Knob'
}
