import classNames from 'classnames'
import React, { forwardRef, HTMLAttributes, useEffect, useRef } from 'react'
import { Size } from 'spase'
import styled, { css } from 'styled-components'
import useDragEffect from './hooks/useDragEffect'
import useResizeEffect from './hooks/useResizeEffect'
import { ExtendedCSSFunction, ExtendedCSSProps, Orientation, Range } from './types'

export type KnobCSSProps = {
  radius: number
  tintColor: string
  hitboxPadding: number
  isDragging: boolean
  isReleasing: boolean
  isDisabled: boolean
}

export type LabelCSSProps = {
  knobRadius: number
  orientation: Orientation
  isDragging: boolean
  isReleasing: boolean
}

export type HighlightCSSProps = {
  tintColor: string
  isDragging: boolean
  isReleasing: boolean
}

export type RangeSliderProps = HTMLAttributes<HTMLDivElement> & {
  areLabelsVisible: boolean
  decimalPlaces: number
  defaultRange?: Range
  hitboxPadding: number
  knobRadius: number
  max: number
  min: number
  orientation: Orientation
  steps: number
  tintColor: string
  onRangeChange: (range: Range) => void
  cssKnob: ExtendedCSSFunction<KnobCSSProps>
  cssHighlight: ExtendedCSSFunction<HighlightCSSProps>
  cssLabel: ExtendedCSSFunction<LabelCSSProps>
  cssGutter: ExtendedCSSFunction
}

export default forwardRef<HTMLDivElement, RangeSliderProps>(({
  areLabelsVisible = true,
  className,
  decimalPlaces = 2,
  defaultRange,
  hitboxPadding = 20,
  knobRadius = 10,
  max,
  min,
  orientation = 'vertical',
  steps = -1,
  style,
  tintColor = '#fff',
  onRangeChange,
  cssGutter = () => css``,
  cssHighlight = () => css``,
  cssKnob = () => css``,
  cssLabel = () => css``,
  ...props
}, ref) => {
  const bodyRef = useRef<HTMLDivElement>(null)
  const knob0Ref = useRef<HTMLDivElement>(null)
  const knob1Ref = useRef<HTMLDivElement>(null)

  const [size] = useResizeEffect(bodyRef)

  const { isDragging: [isDraggingStartKnob], isReleasing: [isReleasingStartKnob], value: [startValue, setStartValue] } = useDragEffect(knob0Ref, {
    initialValue: defaultRange?.[0] ?? min,
    transform: (value: number, dx: number, dy: number) => {
      const delta = orientation === 'horizontal' ? dx : dy
      const dMin = getDisplacementByValue(min, { min, max, orientation, size })
      const dMax = end
      const dCurr = getDisplacementByValue(value, { min, max, orientation, size })
      const dNext = Math.max(dMin, Math.min(dMax, dCurr + delta))
      const pos = getPositionByDisplacement(dNext, { orientation, size })

      return getValueByPosition(pos, { min, max })
    },
  }, [min, max, orientation, size])

  const { isDragging: [isDraggingEndKnob], isReleasing: [isReleasingEndKnob], value: [endValue, setEndValue] } = useDragEffect(knob1Ref, {
    initialValue: defaultRange?.[1] ?? max,
    transform: (value: number, dx: number, dy: number) => {
      const delta = orientation === 'horizontal' ? dx : dy
      const dMin = start
      const dMax = end
      const dCurr = getDisplacementByValue(value, { min, max, orientation, size })
      const dNext = Math.max(dMin, Math.min(dMax, dCurr + delta))
      const pos = getPositionByDisplacement(dNext, { orientation, size })

      return getValueByPosition(pos, { min, max })
    },
  }, [min, max, orientation, size])

  const breakpoints = [min, ...[...Array(steps)].map((v, i) => min + (i + 1) * (max - min) / (1 + steps)), max]
  const start = getDisplacementByValue(startValue, { min, max, orientation, size })
  const end = getDisplacementByValue(endValue, { min, max, orientation, size })
  const highlightLength = end - start

  useEffect(() => {
    onRangeChange?.([startValue, endValue])
  }, [startValue, endValue])

  useEffect(() => {
    if (steps < 0) return

    setStartValue(getClosestSteppedValue(startValue, breakpoints))
    setEndValue(getClosestSteppedValue(endValue, breakpoints))
  }, [isReleasingStartKnob, isReleasingEndKnob])

  return (
    <StyledRoot
      {...props}
      className={classNames(className, orientation)}
      orientation={orientation}
      ref={bodyRef}
      style={{
        ...style ?? {},
      }}
    >
      <StyledGutter
        extendedCSS={cssGutter}
      />
      <StyledKnob
        ref={knob0Ref}
        radius={knobRadius}
        tintColor={tintColor}
        hitboxPadding={hitboxPadding}
        isDragging={isDraggingStartKnob}
        isReleasing={isReleasingStartKnob}
        isDisabled={endValue === min && startValue === min}
        style={orientation === 'horizontal' ? {
          marginLeft: `${start}px`,
        } : {
          marginTop: `${start}px`,
        }}
        extendedCSS={cssKnob}
      />
      {areLabelsVisible && (
        <StyledLabel
          knobRadius={knobRadius}
          orientation={orientation}
          isDragging={isDraggingStartKnob}
          isReleasing={isReleasingStartKnob}
          style={orientation === 'horizontal' ? {
            transform: `translate3d(calc(-50% + ${start}px), 0, 0)`,
          } : {
            transform: `translate3d(0, calc(-50% + ${start}px), 0)`,
          }}
          extendedCSS={cssLabel}
        >
          {Number(startValue.toFixed(decimalPlaces)).toLocaleString()}
        </StyledLabel>
      )}
      <StyledHighlight
        tintColor={tintColor}
        isDragging={isDraggingStartKnob || isDraggingEndKnob}
        isReleasing={isReleasingStartKnob || isReleasingEndKnob}
        style={orientation === 'horizontal' ? {
          width: `${highlightLength}px`,
          transform: `translate3d(${start}px, 0, 0)`,
        } : {
          height: `${highlightLength}px`,
          transform: `translate3d(0, ${start}px, 0)`,
        }}
        extendedCSS={cssHighlight}
      />
      <StyledKnob
        ref={knob1Ref}
        radius={knobRadius}
        tintColor={tintColor}
        hitboxPadding={hitboxPadding}
        isDragging={isDraggingEndKnob}
        isReleasing={isReleasingEndKnob}
        isDisabled={endValue === max && startValue === max}
        style={orientation === 'horizontal' ? {
          marginLeft: `${end}px`,
        } : {
          marginTop: `${end}px`,
        }}
        extendedCSS={cssKnob}
      />
      {areLabelsVisible && (
        <StyledLabel
          knobRadius={knobRadius}
          orientation={orientation}
          isDragging={isDraggingStartKnob || isDraggingEndKnob}
          isReleasing={isReleasingStartKnob || isReleasingEndKnob}
          style={orientation === 'horizontal' ? {
            transform: `translate3d(calc(-50% + ${end}px), 0, 0)`,
          } : {
            transform: `translate3d(0, calc(-50% + ${end}px), 0)`,
          }}
          extendedCSS={cssLabel}
        >
          {Number(endValue.toFixed(decimalPlaces)).toLocaleString()}
        </StyledLabel>
      )}
    </StyledRoot>
  )
})

function getPositionByValue(value: number, { min, max }: Required<Pick<RangeSliderProps, 'min' | 'max'>>) {
  return (value - min) / (max - min)
}

function getDisplacementByPosition(position: number, { orientation, size }: Required<Pick<RangeSliderProps, 'orientation'>> & { size: Size }) {
  switch (orientation) {
    case 'horizontal': return position * size.width
    case 'vertical': return position * size.height
  }
}

function getDisplacementByValue(value: number, { min, max, orientation, size }: Parameters<typeof getPositionByValue>[1] & Parameters<typeof getDisplacementByPosition>[1]) {
  return getDisplacementByPosition(getPositionByValue(value, { min, max }), { orientation, size})
}

function getPositionByDisplacement(displacement: number, { orientation, size }: Required<Pick<RangeSliderProps, 'orientation'>> & { size: Size }) {
  switch (orientation) {
    case 'horizontal': return displacement / size.width
    case 'vertical': return displacement / size.height
  }
}

function getValueByPosition(position: number, { min, max }: Required<Pick<RangeSliderProps, 'min' | 'max'>>) {
  return position * (max - min) + min
}

function getClosestSteppedValue(value: number, breakpoints: number[]) {
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

const StyledHighlight = styled.div<HighlightCSSProps & ExtendedCSSProps<HighlightCSSProps>>`
  top: 0;
  left: 0;
  position: absolute;
  height: 100%;
  width: 100%;
  background: ${props => props.tintColor};
  transition-property: ${props => props.isReleasing ? 'opacity, width, transform' : 'opacity'};
  transition-duration: 100ms;
  transition-timing-function: ease-out;
  will-change: opacity, width, transform;
  ${props => props.extendedCSS(props)}
`

const StyledLabel = styled.span<LabelCSSProps & ExtendedCSSProps<LabelCSSProps>>`
  background: transparent;
  color: #fff;
  left: ${props => props.orientation === 'horizontal' ? '0' : `${props.knobRadius}px`};
  padding: 10px;
  pointer-events: none;
  position: absolute;
  text-align: center;
  top: ${props => props.orientation === 'horizontal' ? `${props.knobRadius}px` : '0'};
  transition-duration: 100ms;
  transition-property: ${props => props.isReleasing ? 'opacity, transform' : 'opacity'};
  transition-timing-function: ease-out;
  user-select: none;
  will-change: opacity, transform;
  ${props => props.extendedCSS(props)}
`

const StyledKnob = styled.div<KnobCSSProps & ExtendedCSSProps<KnobCSSProps>>`
  background: transparent;
  box-sizing: border-box;
  display: block;
  height: ${props => (props.radius + props.hitboxPadding) * 2}px;
  left: ${props => -props.radius - props.hitboxPadding}px;
  padding: ${props => props.hitboxPadding}px;
  pointer-events: ${props => props.isDisabled ? 'none' : 'auto'};
  position: absolute;
  top: ${props => -props.radius - props.hitboxPadding}px;
  touch-action: none;
  transition-duration: 100ms;
  transition-property: ${props => props.isReleasing ? 'background, opacity, margin, transform' : 'background, opacity, transform'};
  transition-timing-function: ease-out;
  width: ${props => (props.radius + props.hitboxPadding) * 2}px;
  will-change: opacity, transform, margin, background;
  z-index: 1;

  &::after {
    content: '';
    border-radius: 100%;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    margin: auto;
    position: absolute;
    width: ${props => props.radius * 2}px;
    height: ${props => props.radius * 2}px;
    background: ${props => props.tintColor};
  }

  ${props => props.extendedCSS(props)}
`

const StyledGutter = styled.div<ExtendedCSSProps<any>>`
  display: block;
  top: 0;
  left: 0;
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, .2);
  ${props => props.extendedCSS(props)}
`

const StyledRoot = styled.div<{
  orientation: Orientation
}>`
  display: flex;
  flex: 0 0 auto;
  height: ${props => props.orientation === 'horizontal' ? '2px' : '300px'};
  position: relative;
  width: ${props => props.orientation === 'horizontal' ? '300px' : '2px'};
`
