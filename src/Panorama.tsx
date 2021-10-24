import interact from 'interactjs'
import React, { createRef, CSSProperties, PureComponent } from 'react'
import { Rect, Size } from 'spase'
import styled from 'styled-components'

export interface Props {
  className?: string
  style: CSSProperties
  defaultAngle: number
  speed: number
  src: string
  onAngleChange?: (angle: number) => void
  onDragEnd?: () => void
  onDragStart?: () => void
  onImageLoad?: (image: HTMLImageElement) => void
  onPositionChange?: (position: number) => void
}

export interface State {
  angle: number
  position: number
  isDragging: boolean
  imageSize: Size
}

export default class Panorama extends PureComponent<Props, State> {
  static defaultProps: Partial<Props> = {
    defaultAngle: 0,
    speed: 2,
    style: {},
  }

  nodeRefs = {
    root: createRef<HTMLDivElement>(),
  }

  image?: HTMLImageElement = undefined

  constructor(props: Props) {
    super(props)

    this.state = {
      angle: props.defaultAngle,
      position: 0,
      isDragging: false,
      imageSize: new Size(),
    }
  }

  get rect(): Rect {
    return Rect.from(this.nodeRefs.root.current) ?? new Rect()
  }

  get imageSize(): Size {
    return this.state.imageSize
  }

  componentDidMount() {
    this.image = new Image()
    this.image.src = this.props.src
    this.image.addEventListener('load', this.onImageLoad)

    this.props.onAngleChange?.(this.state.angle)
    this.props.onPositionChange?.(this.state.position)

    this.reconfigureInteractivityIfNeeded()
  }

  componentWillUnmount() {
    this.image?.removeEventListener('load', this.onImageLoad)
    this.image = undefined
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const { angle, position, isDragging } = this.state

    if (prevProps.src !== this.props.src) {
      if (this.image) this.image.removeEventListener('load', this.onImageLoad)
      this.image = new Image()
      this.image.src = this.props.src
      this.image.addEventListener('load', this.onImageLoad)
    }

    if (prevState.angle !== angle) {
      this.props.onAngleChange?.(angle)
    }

    if (prevState.position !== position) {
      this.props.onPositionChange?.(position)
    }

    if (prevState.isDragging !== isDragging) {
      if (isDragging) {
        this.props.onDragStart?.()
      }
      else {
        this.props.onDragEnd?.()
      }
    }

    this.reconfigureInteractivityIfNeeded()
  }

  render() {
    return (
      <StyledRoot
        className={this.props.className}
        style={this.props.style}
        ref={this.nodeRefs.root}
      >
        <StyledImage
          style={{
            backgroundImage: `url(${this.props.src})`,
            backgroundPositionX: `${-this.state.position}px`,
          }}
        />
      </StyledRoot>
    )
  }

  setAngle(angle: number) {
    this.setState({
      angle,
      position: this.getPositionFromAngle(angle),
    })
  }

  getImageSize(): Size {
    const { imageSize } = this.state
    const rect = this.rect
    const aspectRatio = rect.height / imageSize.height
    const w = aspectRatio * imageSize.width

    return new Size({
      width: w,
      height: rect.height,
    })
  }

  getPositionFromAngle(angle: number): number {
    const { width: imageWidth } = this.getImageSize()
    const { width } = this.rect
    return angle / 360 * imageWidth - width / 2
  }

  getAngleFromPosition(position: number): number {
    const { width: imageWidth } = this.getImageSize()
    const { width } = this.rect

    let angle = ((position + width / 2) % imageWidth) / imageWidth * 360
    while (angle < 0) angle += 360

    return angle
  }

  resetPosition() {
    this.setState({ position: this.getPositionFromAngle(this.state.angle) })
  }

  private reconfigureInteractivityIfNeeded() {
    const rootNode = this.nodeRefs.root.current

    if (rootNode && !interact.isSet(rootNode)) {
      interact(rootNode).draggable({
        inertia: true,
        onstart: () => this.onDragStart(),
        onmove: ({ dx }) => this.onDragMove(dx),
        onend: () => this.onDragEnd(),
      })
    }
  }

  private onImageLoad = (event: Event) => {
    const image = event.currentTarget as HTMLImageElement

    this.setState({
      imageSize: new Size([image.width, image.height]),
    })

    this.resetPosition()
    this.props.onImageLoad?.(image)
  }

  private onDragStart() {
    this.setState({
      isDragging: true,
    })
  }

  private onDragMove(delta: number) {
    const { speed } = this.props
    const { position } = this.state

    const newPosition = position - (delta * speed)
    const newAngle = this.getAngleFromPosition(newPosition)

    this.setState({
      angle: newAngle,
      position: newPosition,
    })
  }

  private onDragEnd() {
    this.setState({
      isDragging: false,
    })
  }
}

const StyledImage = styled.div`
  background-repeat: repeat;
  background-size: cover;
  height: 100%;
  left: 0;
  margin: 0;
  padding: 0;
  position: absolute;
  top: 0;
  width: 100%;
`

const StyledRoot = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex: 0 0 auto;
  justify-content: center;
  padding: 0;
  position: relative;
  touch-action: none;
`
