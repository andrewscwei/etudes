import React, { CSSProperties, forwardRef, HTMLAttributes, useEffect, useRef, useState } from 'react'
import Each from './Each'

export type Props = HTMLAttributes<HTMLDivElement> & {
  align?: 'tl' | 'tc' | 'tr' | 'cl' | 'cc' | 'cr' | 'bl' | 'bc' | 'br'
  margin?: number
  maxEntries?: number
  message?: string
  title?: string
}

export default forwardRef<HTMLDivElement, Props>(({
  align = 'br',
  margin = 0,
  maxEntries = -1,
  message,
  style = {},
  title,
  ...props
}, ref) => {
  const [messages, setMessages] = useState<string[]>([])
  const messagesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (message === undefined) {
      setMessages([])
    }
    else {
      const numMessages = messages.length

      setMessages([
        ...maxEntries < 0
          ? messages
          : messages.slice(Math.max(0, numMessages - (maxEntries - 1)), numMessages),
        message,
      ])
    }
  }, [message])

  useEffect(() => {
    messagesRef.current?.scrollTo(0, messagesRef.current?.scrollHeight)
  }, [messages])

  return (
    <div {...props} ref={ref} style={{ ...style, ...rootStyle, ...getStyleByAlignment(align, margin) }}>
      <div style={titleStyle}>{title ?? 'Untitled'}</div>
      <div style={messagesStyle} ref={messagesRef}>
        <Each in={messages} render={msg => <div dangerouslySetInnerHTML={{ __html: msg }}/>}/>
      </div>
    </div>
  )
})

function getStyleByAlignment(align: Props['align'], margin: number): CSSProperties {
  switch (align) {
    case 'tl': return { top: `${margin}px`, left: `${margin}px` }
    case 'tc': return { top: `${margin}px`, left: 0, right: 0, margin: '0 auto' }
    case 'tr': return { top: `${margin}px`, right: `${margin}px` }
    case 'cl': return { top: 0, left: `${margin}px`, bottom: 0, margin: 'auto 0' }
    case 'cc': return { top: 0, left: 0, right: 0, bottom: 0, margin: 'auto' }
    case 'cr': return { top: 0, bottom: 0, right: `${margin}px`, margin: 'auto 0' }
    case 'bl': return { bottom: `${margin}px`, left: `${margin}px` }
    case 'bc': return { bottom: `${margin}px`, left: 0, right: 0, margin: '0 auto' }
    default: return { bottom: `${margin}px`, right: `${margin}px` }
  }
}

const rootStyle: CSSProperties = {
  background: '#000',
  fontFamily: 'monospace',
  position: 'fixed',
  width: '300px',
}

const titleStyle: CSSProperties = {
  background: '#fff',
  color: '#000',
  fontSize: '14px',
  fontWeight: '700',
  height: '30px',
  lineHeight: '30px',
  overflow: 'hidden',
  padding: '0 10px',
  textOverflow: 'ellipsis',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
  width: '100%',
}

const messagesStyle: CSSProperties = {
  boxSizing: 'border-box',
  color: '#fff',
  fontSize: '12px',
  lineHeight: '150%',
  maxHeight: '200px',
  minHeight: '100px',
  overflowX: 'hidden',
  overflowY: 'scroll',
  padding: '10px',
  WebkitOverflowScrolling: 'touch',
  width: '100%',
}
