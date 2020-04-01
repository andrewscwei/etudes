import React, { createRef, CSSProperties, PureComponent } from 'react';
import styled from 'styled-components';

interface Props {
  className?: string;
  message?: string;
  style?: CSSProperties;
  title?: string;
  align?: 'tl' | 'tc' | 'tr' | 'cl' | 'cc' | 'cr' | 'bl' | 'bc' | 'br';
}

interface State {
  messages: Array<string>;
}

export default class DebugConsole extends PureComponent<Props, State> {
  nodeRefs = {
    messages: createRef<HTMLDivElement>(),
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      messages: this.props.message ? [this.props.message] : [],
    };
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevProps.message !== this.props.message) {
      this.setState({
        messages: [...this.state.messages, this.props.message ?? ''],
      });
    }

    if (prevState.messages.length !== this.state.messages.length) {
      const m = this.nodeRefs.messages.current?.scrollHeight ?? 0;
      this.nodeRefs.messages.current?.scrollTo(0, m);
    }
  }

  clear() {
    this.setState({
      messages: [],
    });
  }

  render() {
    const { className, style, title, message, align } = this.props;

    return (
      <StyledRoot className={className} style={style} align={align}>
        <h6>{title ?? 'Untitled'}</h6>
        <div ref={this.nodeRefs.messages}>
          {this.state.messages.map((v, i) => (
            <span key={`item-${i}`} dangerouslySetInnerHTML={{ __html: v }}/>
          ))}
        </div>
      </StyledRoot>
    );
  }
}

const StyledRoot = styled.div<{
  align: Props['align'];
}>`
  align-items: flex-start;
  background: #000;
  bottom: 30px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  font-family: monospace;
  justify-content: flex-start;
  width: 300px;
  min-height: 10rem;
  position: fixed;
  right: 30px;
  max-height: 20rem;

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
`;
