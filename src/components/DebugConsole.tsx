import { forwardRef, useEffect, useRef, useState, type CSSProperties, type HTMLAttributes } from 'react'
import { Each } from '../operators/Each'
import { asStyleDict, styles } from '../utils'

export type DebugConsoleProps = HTMLAttributes<HTMLDivElement> & {
  align?: 'tl' | 'tc' | 'tr' | 'cl' | 'cc' | 'cr' | 'bl' | 'bc' | 'br'
  margin?: number
  maxEntries?: number
  message?: string
  title?: string
}

export const DebugConsole = forwardRef<HTMLDivElement, DebugConsoleProps>(({
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
    <div
      {...props}
      ref={ref}
      data-component='debug-console'
      style={styles(style, FIXED_STYLES.root, getStyleByAlignment(align, margin))}
    >
      <div data-child='header' style={FIXED_STYLES.title}>{title ?? 'Untitled'}</div>
      <div ref={messagesRef} data-child='messages' style={FIXED_STYLES.messages}>
        <Each in={messages} render={msg => <div dangerouslySetInnerHTML={{ __html: msg }}/>}/>
      </div>
    </div>
  )
})

Object.defineProperty(DebugConsole, 'displayName', { value: 'DebugConsole', writable: false })

function getStyleByAlignment(align: DebugConsoleProps['align'], margin: number): CSSProperties {
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

const FIXED_STYLES = asStyleDict({
  root: {
    background: '#000',
    fontFamily: 'monospace',
    position: 'fixed',
    width: '300px',
  },
  title: {
    background: '#fff',
    boxSizing: 'border-box',
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
  },
  messages: {
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
  },
})
