import { DebugConsole } from 'etudes/components/DebugConsole'
import { MasonryGrid } from 'etudes/components/MasonryGrid'
import { Each } from 'etudes/operators/Each'
import { useMemo, useState } from 'react'
import styled from 'styled-components'

export function MasonryGridDemo() {
  const [itemIndex, setItemIndex] = useState(-1)

  const items = useMemo(() => [...new Array(200)].map((v, i) => ({
    h: Math.floor(Math.random() * 6) + 1,
    b: Math.floor(Math.random() * 1) + 1,
  })), [])

  return (
    <>
      <StyledRoot>
        <StyledMasonryGrid
          horizontalSpacing={20}
          orientation='vertical'
          sections={6}
          verticalSpacing={20}
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
        style={{ transform: 'translate3d(0, 0, 0) rotateX(10deg) rotateY(30deg)' }}
        title='?: Masonry Grid'
      />
    </>
  )
}

const StyledMasonryGrid = styled(MasonryGrid)`
  transform: translate3d(0, 0, 0) rotate3d(1, 1, 0, 2deg);
  width: 80%;
`

const StyledGridItem = styled.button`
  align-items: center;
  background: #fff;
  border: none;
  box-sizing: border-box;
  color: #000;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  font-size: 20px;
  font-weight: 700;
  justify-content: center;
  transition: all 100ms ease-out;

  &.h-1 { height: 40px; }
  &.h-2 { height: 80px; }
  &.h-3 { height: 120px; }
  &.h-4 { height: 160px; }
  &.h-5 { height: 200px; }
  &.h-6 { height: 240px; }

  &:hover {
    background: #ff0054;
    color: #fff;
    transform: translate3d(0, 0, 0) scale(1.1);
  }
`

const StyledRoot = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  height: 100%;
  justify-content: flex-start;
  overflow-x: hidden;
  perspective: 800px;
  width: 100%;
`
