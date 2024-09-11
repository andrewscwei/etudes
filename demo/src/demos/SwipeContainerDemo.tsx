import { SwipeContainer } from 'etudes/components/SwipeContainer'
import { Frame } from '../components/Frame.js'

export function SwipeContainerDemo() {
  return (
    <Frame title='SwipeContainer'>
      {(_, toast) => (
        <SwipeContainer
          className='bg-dark/10 flex size-full cursor-grab items-center justify-center'
          onSwipeDown={() => toast(`<${Date.now()}>Swiped down`)}
          onSwipeLeft={() => toast(`<${Date.now()}>Swiped left`)}
          onSwipeRight={() => toast(`<${Date.now()}>Swiped right`)}
          onSwipeUp={() => toast(`<${Date.now()}>Swiped up`)}
        >
          <span className='border-dark pointer-events-none select-none border px-2 py-1 text-base'>Swipe here!</span>
        </SwipeContainer>
      )}
    </Frame>
  )
}
