import React, { createRef, CSSProperties, PureComponent } from 'react'
import styled from 'styled-components'

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const debug = process.env.NODE_ENV === 'development' ? require('debug')('etudes:video') : () => {}

export interface Props {
  autoLoop: boolean
  autoPlay: boolean
  className?: string
  hasControls: boolean
  isCover: boolean
  isMuted: boolean
  onCanPlay: () => void
  onEnd: () => void
  onFullscreenChange: (isFullscreen: boolean) => void
  onPause: () => void
  onPlay: () => void
  playsInline: boolean
  posterSrc?: string
  src: string
  style: CSSProperties
}

export default class Video extends PureComponent<Props> {
  static defaultProps = {
    autoLoop: true,
    autoPlay: true,
    hasControls: false,
    isCover: true,
    isMuted: true,
    onCanPlay: () => {},
    onEnd: () => {},
    onFullscreenChange: () => {},
    onPause: () => {},
    onPlay: () => {},
    playsInline: true,
    style: {},
  }

  nodeRefs = {
    root: createRef<HTMLDivElement>(),
    video: createRef<HTMLVideoElement>(),
  }

  constructor(props: Props) {
    super(props)
    debug(`Initializing with src <${this.props.src}>...`, 'OK')
  }

  get isPaused(): boolean {
    if (!this.nodeRefs.video.current) return false

    return this.nodeRefs.video.current.paused
  }

  componentDidMount() {
    const videoNode = this.nodeRefs.video.current

    if (videoNode) {
      videoNode.muted = this.props.isMuted
      videoNode.load()

      videoNode.addEventListener('webkitfullscreenchange', this.onFullscreenChange)
      videoNode.addEventListener('mozfullscreenchange', this.onFullscreenChange)
      videoNode.addEventListener('fullscreenchange', this.onFullscreenChange)
    }
  }

  componentWillUnmount() {
    const videoNode = this.nodeRefs.video.current

    if (videoNode) {
      videoNode.removeEventListener('webkitfullscreenchange', this.onFullscreenChange)
      videoNode.removeEventListener('mozfullscreenchange', this.onFullscreenChange)
      videoNode.removeEventListener('fullscreenchange', this.onFullscreenChange)
    }

    this.pause()
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.isMuted !== this.props.isMuted && this.nodeRefs.video.current) {
      this.nodeRefs.video.current.muted = this.props.isMuted
    }

    if (prevProps.autoPlay !== this.props.autoPlay) {
      if (this.props.autoPlay) {
        this.play()
      }
      else {
        this.pause()
      }
    }
  }

  onFullscreenChange = (event: Event) => {
    const isFullscreen: boolean | undefined = (document as any).fullScreen || (document as any).mozFullScreen || (document as any).webkitIsFullScreen

    if (isFullscreen === undefined) return

    this.props.onFullscreenChange(isFullscreen)
  }

  onCanPlay(element: HTMLVideoElement) {
    debug('Checking if video is ready to play...', 'OK')

    if (this.props.autoPlay && this.isPaused) {
      this.play()
    }

    this.props.onCanPlay()
  }

  onPlay(element: HTMLVideoElement) {
    debug('Playing video...', 'OK')

    this.props.onPlay()
  }

  onPause(element: HTMLVideoElement) {
    debug('Pausing video...', 'OK')

    this.props.onPause()
  }

  onEnd(element: HTMLVideoElement) {
    debug('Ending video...', 'OK')

    this.props.onEnd()
  }

  play() {
    if (!this.nodeRefs.video.current) return
    this.nodeRefs.video.current.play()
  }

  pause() {
    if (!this.nodeRefs.video.current) return
    this.nodeRefs.video.current.pause()
  }

  render() {
    return (
      <StyledRoot
        className={this.props.className}
        isCover={this.props.isCover}
        ref={this.nodeRefs.root}
        style={this.props.style}
      >
        <video
          ref={this.nodeRefs.video}
          autoPlay={this.props.autoPlay}
          playsInline={this.props.playsInline}
          muted={this.props.isMuted}
          controls={this.props.hasControls}
          onCanPlay={event => this.onCanPlay(event.currentTarget)}
          onPlay={event => this.onPlay(event.currentTarget)}
          onPause={event => this.onPause(event.currentTarget)}
          onEnded={event => this.onEnd(event.currentTarget)}
          loop={this.props.autoLoop}
          poster={this.props.posterSrc}
        >
          <source src={this.props.src}/>
        </video>
      </StyledRoot>
    )
  }
}

const StyledRoot = styled.div<{
  isCover: boolean
}>`
  box-sizing: border-box;
  display: block;
  margin: 0;
  padding: 0;
  position: relative;

  video {
    display: block;
    height: 100%;
    margin: 0;
    object-fit: ${props => props.isCover ? 'cover' : 'filled'};
    outline: none;
    padding: 0;
    width: 100%;
  }
`
