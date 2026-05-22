import { type HTMLAttributes, type MouseEvent, type Ref, type RefObject, useCallback, useLayoutEffect, useMemo, useRef } from 'react'
import { Rect } from 'spase'

import { useInertiaDrag } from '../hooks/useInertiaDrag.js'
import { useRect } from '../hooks/useRect.js'
import { asComponentDict } from '../utils/asComponentDict.js'
import { asStyleDict } from '../utils/asStyleDict.js'
import { Styled } from '../utils/Styled.js'
import { styles } from '../utils/styles.js'

/**
 * A slider component supporting both horizontal and vertical orientations. The
 * component consists of three customizable elements: a draggable knob, a label
 * on the knob, and a scroll track on either side of the knob. While the width
 * and height of the slider is inferred from its CSS rules, the width and height
 * of the knob are set via props (`knobWidth` and `knobHeight`, respectively).
 * The size of the knob does not impact the size of the slider.
 *
 * @exports Slider.Knob Component for the knob.
 * @exports Slider.KnobContainer Component for the container of the knob.
 * @exports Slider.Label Component for the label on the knob.
 * @exports Slider.Track Component for the slide track on either side of the
 *                       knob.
 */
export function Slider({
  ref,
  children,
  knobHeight = 30,
  knobPadding = 0,
  knobWidth = 30,
  orientation = 'vertical',
  position = 0,
  trackPadding = 0,
  isClipped = false,
  isInverted = false,
  isTrackInteractive = true,
  formatLabel,
  onChange,
  onDragEnd,
  onDragStart,
  ...props
}: Readonly<Slider.Props>) {
  const rootRef = ref as RefObject<HTMLDivElement> ?? useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const knobContainerRef = useRef<HTMLButtonElement>(null)
  const startTrackRef = useRef<HTMLDivElement>(null)
  const endTrackRef = useRef<HTMLDivElement>(null)
  const positionRef = useRef(position)
  const isDraggingRef = useRef(false)

  const bodyRect = useRect(bodyRef)

  const withDraggedValue = useCallback((pos: number, dx: number, dy: number) => {
    const vPos = _mapValuePositionToVisualPosition(pos, isInverted)

    switch (orientation) {
      case 'horizontal': {
        const maxWidth = isClipped ? bodyRect.width - knobWidth : bodyRect.width
        if (maxWidth <= 0) return pos

        const newX = vPos * maxWidth + dx
        const newVPos = _clamped(newX / maxWidth)

        return _mapVisualPositionToValuePosition(newVPos, isInverted)
      }
      case 'vertical': {
        const maxHeight = isClipped ? bodyRect.height - knobHeight : bodyRect.height
        if (maxHeight <= 0) return pos

        const newY = vPos * maxHeight + dy
        const newVPos = _clamped(newY / maxHeight)

        return _mapVisualPositionToValuePosition(newVPos, isInverted)
      }
      default:
        console.error(`[etudes::Slider] Invalid orientation: ${orientation}`)

        return NaN
    }
  }, [bodyRect.width, bodyRect.height, isClipped, isInverted, knobWidth, knobHeight, orientation])

  const applyPosition = useCallback((pos: number) => {
    const vPos = _mapValuePositionToVisualPosition(pos, isInverted)
    const knob = knobContainerRef.current
    const startTrack = startTrackRef.current
    const endTrack = endTrackRef.current
    const computeTrackOffset = (size: number) => `${trackPadding <= 0 ? 0 : size * 0.5}px - ${trackPadding}px`

    switch (orientation) {
      case 'horizontal':
        if (knob) knob.style.left = isClipped ? `calc(${vPos * 100}% + ${knobWidth * 0.5 - vPos * knobWidth}px)` : `${vPos * 100}%`
        if (startTrack) startTrack.style.width = `calc(${vPos * 100}% - ${computeTrackOffset(knobWidth)})`
        if (endTrack) endTrack.style.width = `calc(${(1 - vPos) * 100}% - ${computeTrackOffset(knobWidth)})`

        break
      case 'vertical':
        if (knob) knob.style.top = isClipped ? `calc(${vPos * 100}% + ${knobHeight * 0.5 - vPos * knobHeight}px)` : `${vPos * 100}%`
        if (startTrack) startTrack.style.height = `calc(${vPos * 100}% - ${computeTrackOffset(knobHeight)})`
        if (endTrack) endTrack.style.height = `calc(${(1 - vPos) * 100}% - ${computeTrackOffset(knobHeight)})`

        break
      default:
        break
    }
  }, [isClipped, isInverted, knobHeight, knobWidth, orientation, trackPadding])

  const suppressTransitions = useCallback((suppressed: boolean) => {
    const value = suppressed ? 'none' : ''

    for (const el of [knobContainerRef.current, startTrackRef.current, endTrackRef.current]) {
      if (el) el.style.transition = value
    }
  }, [])

  const trackClickHandler = useCallback((event: MouseEvent) => {
    if (!isTrackInteractive) return

    const vrect = Rect.fromViewport()
    let newPos: number

    switch (orientation) {
      case 'horizontal': {
        if (bodyRect.width <= 0) return

        const newVPos = (event.clientX + vrect.left - bodyRect.left) / bodyRect.width
        newPos = _mapVisualPositionToValuePosition(newVPos, isInverted)

        break
      }
      case 'vertical': {
        if (bodyRect.height <= 0) return

        const newVPos = (event.clientY + vrect.top - bodyRect.top) / bodyRect.height
        newPos = _mapVisualPositionToValuePosition(newVPos, isInverted)

        break
      }
      default:
        console.error(`[etudes::Slider] Invalid orientation: ${orientation}`)

        return
    }

    const hasChanged = newPos !== positionRef.current

    if (hasChanged) {
      positionRef.current = newPos
      applyPosition(newPos)
      onChange?.(newPos, false)
    }
  }, [bodyRect.left, bodyRect.top, bodyRect.width, bodyRect.height, isInverted, isTrackInteractive, orientation])

  useInertiaDrag(knobContainerRef, {
    onDragEnd: () => {
      suppressTransitions(false)

      isDraggingRef.current = false
      rootRef.current?.classList.remove('dragging')
      knobContainerRef.current?.classList.remove('dragging')

      onChange?.(positionRef.current, false)
      onDragEnd?.()
    },
    onDragMove: ({ x, y }) => {
      const newPosition = withDraggedValue(positionRef.current, x, y)
      const hasChanged = newPosition !== positionRef.current

      if (hasChanged) {
        positionRef.current = newPosition
        applyPosition(newPosition)
        onChange?.(newPosition, true)
      }

      isDraggingRef.current = true
      rootRef.current?.classList.add('dragging')
      knobContainerRef.current?.classList.add('dragging')
    },
    onDragStart: () => {
      suppressTransitions(true)

      isDraggingRef.current = true
      rootRef.current?.classList.add('dragging')
      knobContainerRef.current?.classList.add('dragging')

      onDragStart?.()
    },
  })

  useLayoutEffect(() => {
    if (isDraggingRef.current) return

    positionRef.current = position

    applyPosition(position)
  }, [position, applyPosition])

  const isAtEnd = isInverted ? position === 0 : position === 1
  const isAtStart = isInverted ? position === 1 : position === 0
  const fixedStyles = useMemo(() => _getFixedStyles({ knobHeight, knobPadding, knobWidth, orientation, isTrackInteractive }), [knobHeight, knobPadding, knobWidth, orientation, isTrackInteractive])

  const components = asComponentDict(children, {
    knob: Slider.Knob,
    knobContainer: Slider.KnobContainer,
    label: Slider.Label,
    track: Slider.Track,
  })

  return (
    <div
      {...props}
      ref={rootRef}
      aria-orientation={orientation}
      aria-valuenow={position}
      data-at-end={isAtEnd ? '' : undefined}
      data-at-start={isAtStart ? '' : undefined}
      data-orientation={orientation}
      role='slider'
    >
      <div
        key={orientation}
        ref={bodyRef}
        style={fixedStyles.body}
      >
        <Styled
          ref={startTrackRef}
          style={styles(fixedStyles.track, orientation === 'vertical' ? { top: '0' } : { left: '0' })}
          data-side={isInverted ? 'end' : 'start'}
          element={components.track ?? <Slider.Track/>}
          onClick={trackClickHandler}
        >
          <div style={fixedStyles.trackHitBox}/>
        </Styled>
        <Styled
          ref={endTrackRef}
          style={styles(fixedStyles.track, orientation === 'vertical' ? { bottom: '0' } : { right: '0' })}
          data-side={isInverted ? 'start' : 'end'}
          element={components.track ?? <Slider.Track/>}
          onClick={trackClickHandler}
        >
          <div style={fixedStyles.trackHitBox}/>
        </Styled>
        <Styled
          ref={knobContainerRef}
          style={fixedStyles.knobContainer}
          element={components.knobContainer ?? <Slider.KnobContainer/>}
        >
          <Styled
            style={styles(fixedStyles.knob)}
            element={components.knob ?? <Slider.Knob/>}
          >
            <div style={fixedStyles.knobHitBox}/>
            {formatLabel && (
              <Styled
                style={styles(fixedStyles.label)}
                element={components.label ?? <Slider.Label/>}
              >
                {formatLabel(position)}
              </Styled>
            )}
          </Styled>
        </Styled>
      </div>
    </div>
  )
}

export namespace Slider {
  /**
   * Type describing the orientation of {@link Slider}.
   */
  export type Orientation = 'horizontal' | 'vertical'

  /**
   * Type describing the props of {@link Slider}.
   */
  export type Props = {
    /**
     * Reference to the root element.
     */
    ref?: Ref<HTMLDivElement>

    /**
     * Specifies if the knob is clipped to the track.
     */
    isClipped?: boolean

    /**
     * By default the position is a value from 0 - 1, 0 being the start of the
     * slider and 1 being the end. Switching on this flag inverts this behavior,
     * where 0 becomes the end of the slider and 1 being the start.
     */
    isInverted?: boolean

    /**
     * Specifies if the track is clickable to set the position of the knob.
     */
    isTrackInteractive?: boolean

    /**
     * Padding between the track and the knob in pixels.
     */
    trackPadding?: number

    /**
     * Height of the knob in pixels.
     */
    knobHeight?: number

    /**
     * Invisible padding around the knob in pixels, helps expand its hit box.
     */
    knobPadding?: number

    /**
     * Width of the knob in pixels.
     */
    knobWidth?: number

    /**
     * Orientation of the slider.
     */
    orientation?: Orientation

    /**
     * The current position.
     */
    position?: number

    /**
     * A function that formats the position to be displayed as the slider label.
     * If not provided, no label will be rendered.
     *
     * @param position The current slider position.
     *
     * @returns The formatted string.
     */
    formatLabel?: (position: number) => string

    /**
     * Handler invoked when position changes.
     *
     * @param position The current slider position.
     * @param isDragging Specifies if the position change is due to dragging.
     */
    onChange?: (position: number, isDragging: boolean) => void

    /**
     * Handler invoked when dragging ends.
     */
    onDragEnd?: () => void

    /**
     * Handler invoked when dragging begins.
     */
    onDragStart?: () => void
  } & Omit<HTMLAttributes<HTMLDivElement>, 'aria-orientation' | 'aria-valuenow' | 'onChange' | 'role'>

  /**
   * Component for the slide track on either side of the knob of a
   * {@link Slider}.
   */
  export const Track = ({ ...props }: HTMLAttributes<HTMLDivElement>) => (
    <div {...props}/>
  )

  /**
   * Component for the knob of a {@link Slider}.
   */
  export const Knob = ({ ...props }: HTMLAttributes<HTMLDivElement>) => (
    <div {...props}/>
  )

  /**
   * Component for the container of the knob of a {@link Slider}.
   */
  export const KnobContainer = ({ ...props }: HTMLAttributes<HTMLButtonElement>) => (
    <button {...props}/>
  )

  /**
   * Component for the label on the knob of a {@link Slider}.
   */
  export const Label = ({ ...props }: HTMLAttributes<HTMLDivElement>) => (
    <div {...props}/>
  )
}

function _getFixedStyles({ knobHeight = 0, knobPadding = 0, knobWidth = 0, orientation = 'vertical', isTrackInteractive = true }) {
  return asStyleDict({
    body: {
      height: '100%',
      width: '100%',
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
      ...orientation === 'vertical' ? { left: '50%' } : { top: '50%' },
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
      userSelect: 'none',
    },
    track: {
      cursor: isTrackInteractive ? 'pointer' : 'auto',
      pointerEvents: isTrackInteractive ? 'auto' : 'none',
      position: 'absolute',
      ...orientation === 'vertical' ? {
        left: '0',
        margin: '0 auto',
        right: '0',
        width: '100%',
      } : {
        bottom: '0',
        height: '100%',
        margin: 'auto 0',
        top: '0',
      },
    },
    trackHitBox: {
      height: '100%',
      minHeight: '20px',
      minWidth: '20px',
      position: 'absolute',
      transform: orientation === 'horizontal' ? 'translate(0, -50%)' : 'translate(-50%, 0)',
      width: '100%',
    },
  })
}

function _mapVisualPositionToValuePosition(vPos: number, isInverted: boolean) {
  return isInverted ? 1 - vPos : vPos
}

function _mapValuePositionToVisualPosition(pos: number, isInverted: boolean) {
  return isInverted ? 1 - pos : pos
}

function _clamped(value: number, max: number = 1, min: number = 0): number {
  return Math.max(min, Math.min(max, value))
}

if (process.env.NODE_ENV === 'development') {
  Slider.displayName = 'Slider'
  Slider.Track.displayName = 'Slider.Track'
  Slider.Knob.displayName = 'Slider.Knob'
  Slider.KnobContainer.displayName = 'Slider.KnobContainer'
  Slider.Label.displayName = 'Slider.Label'
}
