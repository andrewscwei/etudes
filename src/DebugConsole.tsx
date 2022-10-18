import React, { createRef, CSSProperties, PureComponent } from 'react'
import styled from 'styled-components'

export interface Props {
  className?: string
  style: CSSProperties
  margin: number
  maxEntries: number
  align: 'tl' | 'tc' | 'tr' | 'cl' | 'cc' | 'cr' | 'bl' | 'bc' | 'br'
  message?: string
  title?: string
}

export interface State {
  messages: string[]
}

export default class DebugConsole extends PureComponent<Props, State> {
  static defaultProps: Partial<Props> = {
    align: 'br',
    margin: 0,
    maxEntries: -1,
    style: {},
  }

  nodeRefs = {
    messages: createRef<HTMLDivElement>(),
  }

  constructor(props: Props) {
    super(props)

    this.state = {
      messages: this.props.message ? [this.props.message] : [],
    }
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevProps.message !== this.props.message) {
      this.push(this.props.message ?? '')
    }

    if (prevState.messages.length !== this.state.messages.length) {
      const m = this.nodeRefs.messages.current?.scrollHeight ?? 0
      this.nodeRefs.messages.current?.scrollTo(0, m)
    }
  }

  push(message: string) {
    if (this.props.maxEntries < 0) {
      this.setState({
        messages: [...this.state.messages, message],
      })
    }
    else {
      const n = this.state.messages.length

      this.setState({
        messages: [...this.state.messages.slice(Math.max(0, n - (this.props.maxEntries - 1)), n), message],
      })
    }
  }

  clear() {
    this.setState({
      messages: [],
    })
  }

  render() {
    return (
      <StyledRoot
        className={this.props.className}
        style={{
          ...this.props.style,
          margin: 0,
          position: 'fixed',
          ...this.getStyleByAlignment(this.props.align),
        }}
      >
        <h6>{this.props.title ?? 'Untitled'}</h6>
        <div ref={this.nodeRefs.messages}>
          {this.state.messages.map((v, i) => (
            <span key={`item-${i}`} dangerouslySetInnerHTML={{ __html: v }}/>
          ))}
        </div>
      </StyledRoot>
    )
  }

  private getStyleByAlignment(align: Props['align']): CSSProperties {
    switch (align) {
      case 'tl': return { top: `${this.props.margin}px`, left: `${this.props.margin}px` }
      case 'tc': return { top: `${this.props.margin}px`, left: 0, right: 0, margin: '0 auto' }
      case 'tr': return { top: `${this.props.margin}px`, right: `${this.props.margin}px` }
      case 'cl': return { top: 0, left: `${this.props.margin}px`, bottom: 0, margin: 'auto 0' }
      case 'cc': return { top: 0, left: 0, right: 0, bottom: 0, margin: 'auto' }
      case 'cr': return { top: 0, bottom: 0, right: `${this.props.margin}px`, margin: 'auto 0' }
      case 'bl': return { bottom: `${this.props.margin}px`, left: `${this.props.margin}px` }
      case 'bc': return { bottom: `${this.props.margin}px`, left: 0, right: 0, margin: '0 auto' }
      default: return { bottom: `${this.props.margin}px`, right: `${this.props.margin}px` }
    }
  }
}

const StyledRoot = styled.div`
  align-items: flex-start;
  background: #000;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  font-family: monospace;
  justify-content: flex-start;
  max-height: 20rem;
  min-height: 10rem;
  width: 300px;

  h6 {
    background: #fff;
    color: #000;
    flex: 0 0 auto;
    font-size: 20px;
    font-weight: 700;
    overflow: hidden;
    padding: 10px;
    text-overflow: ellipsis;
    text-transform: uppercase;
    white-space: nowrap;
    width: 100%;
  }

  > div {
    -webkit-overflow-scrolling: touch;
    align-items: flex-start;
    box-sizing: border-box;
    color: #fff;
    display: flex;
    flex-direction: column;
    font-size: 14px;
    justify-content: flex-start;
    overflow-x: hidden;
    overflow-y: scroll;
    padding: 10px 20px;
    width: 100%;

    > span:not(:last-child) {
      margin-bottom: 2px;
    }
  }
`
