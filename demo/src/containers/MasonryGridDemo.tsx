import { animations, container, selectors } from 'promptu'
import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import DebugConsole from '../../../lib/DebugConsole'
import Each from '../../../lib/Each'
import MasonryGrid from '../../../lib/MasonryGrid'

export default function() {
  const [itemIndex, setItemIndex] = useState(-1)

  const items = useMemo(() => [...new Array(200)].map((v, i) => ({
    h: Math.floor(Math.random() * 6) + 1,
    b: Math.floor(Math.random() * 1) + 1,
  })), [])

  return (
    <>
      <StyledRoot>
        <StyledMasonryGrid
          horizontalSpacing={30}
          orientation='vertical'
          sections={6}
          verticalSpacing={30}
        >
          <Each in={items}>
            {(val, idx) => (
              <StyledGridItem className={`h-${val.h} base-${val.b}`} onClick={() => setItemIndex(idx)}>{idx + 1}</StyledGridItem>
            )}
          </Each>
        </StyledMasonryGrid>
      </StyledRoot>
      <DebugConsole
        message={itemIndex > -1 ? `You selected item <strong>#${itemIndex + 1}</strong>!` : 'No item seletected!'}
        title='?: Masonry Grid'
        style={{ transform: 'translate3d(0, 0, 0) rotateX(10deg) rotateY(30deg)' }}
      />
    </>
  )
}

const StyledMasonryGrid = styled(MasonryGrid)`
  transform: translate3d(0, 0, 0) rotate3d(1, 1, 0, 2deg);
  width: 80%;
`

const StyledGridItem = styled.button`
  ${container.fvcc}
  ${animations.transition(['transform', 'background', 'color'], 100)}
  background: #fff;
  color: #000;
  font-size: 2rem;
  font-weight: 700;

  &.h-1 { height: 4rem; }
  &.h-2 { height: 8rem; }
  &.h-3 { height: 12rem; }
  &.h-4 { height: 16rem; }
  &.h-5 { height: 20rem; }
  &.h-6 { height: 24rem; }

  ${selectors.hwot} {
    background: #ff0054;
    color: #fff;
    transform: translate3d(0, 0, 0) scale(1.1);
  }
`

const StyledRoot = styled.div`
  ${container.fvtc}
  height: 100%;
  overflow-x: hidden;
  perspective: 80rem;
  width: 100%;
`
