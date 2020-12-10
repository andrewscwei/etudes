import { DirtyInfo, DirtyType, EventType, Rect, Size, UpdateDelegate, UpdateDelegator } from 'dirty-dom'
import React, { createRef, CSSProperties, PureComponent } from 'react'
import styled, { css, FlattenSimpleInterpolation } from 'styled-components'
import Panorama from './Panorama'
import { ExtendedCSSProps } from './types'

type IndicatorCSSProps = Readonly<{
  isDragging: boolean
  reticleWidth: number
}>

type ReticleCSSProps = Readonly<{
  isDragging: boolean
}>

type GutterCSSProps = Readonly<{
  isDragging: boolean
}>

interface Props {
  /**
   * Class attribute of the root element.
   */
  className?: string

  /**
   * Inline style attribute of the root element.
   */
  style: CSSProperties

  /**
   * Default angle (0 - 360 degrees, inclusive) of the slider. 0 is the
   * beginning of the image, 360 is the end.
   */
  defaultAngle: number

  /**
   * Field-of-view (0 - 360 degrees, inclusive) that represents the size of the
   * reticle. 360 indicates the reticle covers the entire image. If this is
   * unspecified, the component will attempt to automatically calculate the FOV
   * using the `targetViewportSize` prop.
   */
  fov?: number

  /**
   * Size of the viewport that this component is controlling. A viewport can be
   * thought of a DOM element containing an aspect filled image. This is used
   * to automatically calculate the FOV if `fov` prop is not specified. If it
   * is, this prop is ignored.
   */
  viewportSize?: Size

  /**
   * Sliding speed of the reticle.
   */
  speed: number

  /**
   * Image source.
   */
  src: string

  /**
   * Handler invoked when the sliding angle changes.
   */
  onAngleChange?: (angle: number) => void

  /**
   * Handler invoked when the image is loaded.
   */
  onImageLoad?: (image: HTMLImageElement) => void

  /**
   * Handler invoked when the sliding position changes.
   */
  onPositionChange?: (position: number) => void

  /**
   * Additional CSS to be provided to the reticle.
   */
  reticleCSS?: (props: ReticleCSSProps) => FlattenSimpleInterpolation

  /**
   * Additional CSS to be provided to the gutter.
   */
  gutterCSS?: (props: GutterCSSProps) => FlattenSimpleInterpolation

  /**
   * Additional CSS to be provided to the indicator.
   */
  indicatorCSS?: (props: GutterCSSProps) => FlattenSimpleInterpolation

}

interface State {
  isDragging: boolean
  imageSize: Size
}

export default class PanoramaSlider extends PureComponent<Props, State> implements UpdateDelegator {
  static defaultProps = {
    defaultAngle: 0,
    speed: 2,
    style: {},
  }

  updateDelegate?: UpdateDelegate = undefined

  nodeRefs = {
    root: createRef<HTMLDivElement>(),
    panorama: createRef<Panorama>(),
  }

  private lastHeight = 0

  constructor(props: Props) {
    super(props)

    if (this.props.fov === undefined && this.props.viewportSize === undefined) {
      throw new Error('Either `fov` or `viewportSize` must be specified')
    }

    this.state = {
      imageSize: new Size(),
      isDragging: false,
    }
  }

  get imageAspectRatio(): number {
    const { width, height } = this.state.imageSize
    if (height === 0) return 0
    return width / height
  }

  get reticleWidth(): number {
    let fov = 0

    if (this.props.fov !== undefined) {
      fov = this.props.fov
    }
    else if (this.props.viewportSize !== undefined) {
      fov = (this.props.viewportSize.width / (this.props.viewportSize.height * this.imageAspectRatio)) * 360
    }

    fov = Math.max(0, Math.min(360, fov))

    const maxWidth = (Rect.from(this.nodeRefs.root.current)?.height ?? 0) * this.imageAspectRatio
    const width = maxWidth * (fov / 360)
    return Math.min(maxWidth, width)
  }

  componentDidMount() {
    this.reconfigureUpdateDelegate()
  }

  componentWillUnmount() {
    this.updateDelegate?.deinit()
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevState.imageSize !== this.state.imageSize) {
      this.nodeRefs.panorama.current?.resetPosition()
    }

    this.reconfigureUpdateDelegate()
  }

  update(info: DirtyInfo) {
    const { [DirtyType.SIZE]: dirtySize } = info

    if (dirtySize) {
      if (this.lastHeight !== dirtySize.minSize.height) {
        this.forceUpdate()
        this.lastHeight = dirtySize.minSize.height
      }
    }
  }

  render() {
    const { className, defaultAngle, speed, src } = this.props
    const { isDragging } = this.state
    const reticleWidth = this.reticleWidth

    return (
      <StyledRoot
        className={className}
        ref={this.nodeRefs.root}
        style={{
          ...this.props.style,
          width: `${(Rect.from(this.nodeRefs.root.current)?.height ?? 0) * this.imageAspectRatio}px`,
        }}
      >
        <Panorama
          ref={this.nodeRefs.panorama}
          defaultAngle={defaultAngle}
          onImageLoad={this.onImageLoad}
          onAngleChange={this.onAngleChange}
          onDragStart={this.onDragStart}
          onDragEnd={this.onDragEnd}
          onPositionChange={this.onPositionChange}
          speed={speed}
          src={src}
          style={{
            height: '100%',
            width: '100%',
          }}
        />
        <StyledSlideTrack>
          <div>
            <StyledGutter
              isDragging={isDragging}
              extendedCSS={this.props.gutterCSS ?? (() => css``)}
            />
            <StyledReticle
              isDragging={isDragging}
              extendedCSS={this.props.reticleCSS ?? (() => css``)}
              style={{
                width: `${reticleWidth}px`,
              }}
            />
            <StyledGutter
              isDragging={isDragging}
              extendedCSS={this.props.gutterCSS ?? (() => css``)}
            />
          </div>
        </StyledSlideTrack>
        <StyledIndicator
          isDragging={isDragging}
          reticleWidth={reticleWidth}
          extendedCSS={this.props.indicatorCSS ?? (() => css``)}
        />
      </StyledRoot>
    )
  }

  setAngle(angle: number) {
    this.nodeRefs.panorama.current?.setAngle(angle)
  }

  private reconfigureUpdateDelegate() {
    this.updateDelegate?.deinit()

    this.updateDelegate = new UpdateDelegate(this, {
      [EventType.RESIZE]: {
        target: this.nodeRefs.root.current,
      },
    })

    this.updateDelegate?.init()
  }

  private onDragStart = () => {
    this.setState({ isDragging: true })
  }

  private onDragEnd = () => {
    this.setState({ isDragging: false })
  }

  private onAngleChange = (angle: number) => {
    this.props.onAngleChange?.(angle)
  }

  private onPositionChange = (position: number) => {
    this.props.onPositionChange?.(position)
  }

  private onImageLoad = (image: HTMLImageElement) => {
    this.setState({ imageSize: new Size([image.width, image.height]) })
    this.props.onImageLoad?.(image)
  }
}

const StyledReticle = styled.div<ReticleCSSProps & ExtendedCSSProps<ReticleCSSProps>>`
  background: rgba(0, 0, 0, ${props => props.isDragging ? 0 : .3});
  flex: 0 0 auto;
  height: 100%;
  transition-duration: 100ms;
  transition-property: background;
  transition-timing-function: ease-out;
  will-change: background;
  ${props => props.extendedCSS(props)}
  `

const StyledGutter = styled.div<GutterCSSProps & ExtendedCSSProps<GutterCSSProps>>`
  background: rgba(0, 0, 0, .7);
  display: block;
  flex: 1 0 auto;
  height: 100%;
  pointer-events: none;
  ${props => props.extendedCSS(props)}
`

const StyledSlideTrack = styled.div`
  box-sizing: border-box;
  display: block;
  height: 100%;
  left: 0;
  overflow: hidden;
  pointer-events: none;
  position: absolute;
  top: 0;
  width: 100%;

  > div {
    align-items: center;
    display: flex;
    height: 100%;
    justify-content: flex-start;
    left: 0;
    overflow: visible;
    position: absolute;
    top: 0;
    width: 100%;
  }
`

const StyledIndicator = styled.div<IndicatorCSSProps & ExtendedCSSProps<IndicatorCSSProps>>`
  background: #fff;
  border-radius: 2px;
  bottom: -10px;
  box-sizing: border-box;
  display: block;
  height: 2px;
  left: 0;
  right: 0;
  margin: 0 auto;
  opacity: ${props => props.isDragging ? 1 : 0};
  transition: opacity .3s ease-out;
  width: ${props => props.reticleWidth}px;
`

const StyledRoot = styled.div`
  box-sizing: border-box;
  display: block;
  flex: 0 0 auto;
`
