import { align, container, selectors } from 'promptu'
import React, { useEffect, useState } from 'react'
import styled, { css } from 'styled-components'
import BurgerButton, { BurgerButtonBar } from '../../lib/BurgerButton'
import FlatSVG from '../../lib/FlatSVG'
import WithTooltip from '../../lib/WithTooltip'
import $$GithubIcon from './assets/svgs/github-icon.svg'
import AccordionDemo from './containers/AccordionDemo'
import DialSlidersDemo from './containers/DialSlidersDemo'
import ListDemo from './containers/ListDemo'
import MasonryGridDemo from './containers/MasonryGridDemo'
import PanoramaDemo from './containers/PanoramaDemo'
import VideoDemo from './containers/VideoDemo'

export default function App() {
  const mapLocationToHash = () => {
    const hasHash = window.location.hash && window.location.hash !== ''
    setHash(hasHash ? window.location.hash.substring(1, window.location.hash.length) : undefined)
  }

  const mapHashToLocation = () => {
    window.location.hash = hash ?? ''
  }

  const [isNavActive, setIsNavActive] = useState(false)
  const [hash, setHash] = useState<string | undefined>()

  useEffect(() => {
    mapLocationToHash()

    function onHashChange() {
      mapLocationToHash()
    }

    window.addEventListener('hashchange', onHashChange)

    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    mapHashToLocation()
    setIsNavActive(false)
  }, [hash])

  function renderDemo() {
    switch (hash) {
      case 'masonry-grid': return <MasonryGridDemo/>
      case 'list': return <ListDemo/>
      case 'accordion': return <AccordionDemo/>
      case 'dial+sliders': return <DialSlidersDemo/>
      case 'video': return <VideoDemo/>
      case 'panorama+slider': return <PanoramaDemo/>
      default: return (
        <StyledIntroduction>
          <div>
            <h1>Études</h1>
          </div>
          <span>A study of styled React components</span>
        </StyledIntroduction>
      )
    }
  }

  return (
    <>
      <StyledDemo>{renderDemo()}</StyledDemo>
      <StyledHUDs>
        <StyledNav isActive={isNavActive}>
          <StyledNavButton isActive={hash === 'masonry-grid'} onClick={() => setHash('masonry-grid')}>Masonry Grid</StyledNavButton>
          <StyledNavButton isActive={hash === 'list'} onClick={() => setHash('list')}>List+Dropdown</StyledNavButton>
          <StyledNavButton isActive={hash === 'accordion'} onClick={() => setHash('accordion')}>Accordion</StyledNavButton>
          <StyledNavButton isActive={hash === 'dial+sliders'} onClick={() => setHash('dial+sliders')}>Dial+Sliders</StyledNavButton>
          <StyledNavButton isActive={hash === 'video'} onClick={() => setHash('video')}>Video</StyledNavButton>
          <StyledNavButton isActive={hash === 'panorama+slider'} onClick={() => setHash('panorama+slider')}>Panorama+Slider</StyledNavButton>
        </StyledNav>
        <StyledBurgerButton
          height={32}
          isActive={isNavActive}
          isDoubleJointed={true}
          isLastBarHalfWidth={true}
          thickness={6}
          width={36}
          onActivate={() => setIsNavActive(true)}
          onDeactivate={() => setIsNavActive(false)}
        >
          <BurgerButtonBar className='bar'/>
        </StyledBurgerButton>
        <WithTooltip hint='This is wrapped with WithTooltip!' backgroundColor='#fff' textColor='#000'>
          <StyledGithubButton href='https://github.com/andrewscwei/etudes'>
            <FlatSVG svg={$$GithubIcon} css={css`svg * { fill: #fff; }`}/>
          </StyledGithubButton>
        </WithTooltip>
      </StyledHUDs>
    </>
  )
}

const StyledHUDs = styled.aside`
  height: 100%;
  left: 0;
  perspective: 80rem;
  pointer-events: none;
  position: fixed;
  top: 0;
  transform: translate3d(0, 0, 0);
  width: 100%;
`

const StyledDemo = styled.main`
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
`

const StyledNavButton = styled.button<{
  isActive: boolean
}>`
  ${container.box}
  color: ${props => props.isActive ? '#ff0054' : '#000'};
  font-size: 1.8rem;
  font-weight: 700;
  pointer-events: ${props => props.isActive ? 'none' : 'auto'};
  text-align: right;
  text-transform: uppercase;
  transform: translate3d(0, 0, 0) rotateX(${Math.floor(Math.random() * 10) + 5}deg) rotateY(${Math.floor(Math.random() * 10) + 5}deg) rotateZ(0deg);
  transition: all .1s ease-out;

  ${selectors.hwot} {
    color: #ff0054;
  }
`

const StyledNav = styled.nav<{
  isActive: boolean
}>`
  ${container.fvtr}
  ${align.ftr}
  padding: 10rem 8vw 10rem 0rem;
  background: #fff;
  height: 100%;
  width: 30rem;
  transition: all .1s ease-out;
  transform: ${props => props.isActive ?
    'translate3d(0, 2rem, 5rem) rotateX(0deg) rotateY(-20deg) rotateZ(0deg)' :
    'translate3d(100%, 0, 5rem) rotateX(0deg) rotateY(0deg) rotateZ(0deg)'
};
  pointer-events: ${props => props.isActive ? 'auto' : 'none'};
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
  z-index: 100;

  ${selectors.eblc} {
    margin-bottom: .6rem;
  }
`

const StyledIntroduction = styled.div`
  ${container.fvcc}
  ${align.tl}
  width: 100%;
  height: 100%;
  perspective: 80rem;

  h1 {
    font-size: 8rem;
    color: #fff;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1rem;
    transform: translate3d(0, 0, 10rem) rotateX(10deg) rotateY(30deg) scale(1);
  }

  span {
    font-size: 1.8rem;
    color: #fff;
    max-width: 26rem;
    text-align: center;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .1rem;
    transform: translate3d(0, 0, 10rem) rotateX(10deg) rotateY(-30deg) scale(1);
  }
`

const StyledBurgerButton = styled(BurgerButton)`
  ${align.ftr}
  margin: 8vh 8vw;
  pointer-events: auto;
  transition: all 100ms ease-out;
  transform: translate3d(0, 0, 10rem) rotateX(-5deg) rotateY(-60deg) scale(1);
  z-index: 1000;

  ${selectors.hwot} {
    transform: translate3d(0, 0, 10rem) rotateX(-5deg) rotateY(-20deg) scale(1.2);

    .bar[data-index='2'] {
      width: 100% !important;
    }
  }

  .bar {
    transition: all 100ms ease-out;
    background: #fff;
    &.active { background: #000; }
  }
`

const StyledGithubButton = styled.a`
  ${container.box}
  ${align.fbl}
  cursor: pointer;
  height: 4rem;
  margin: 8vh 8vw;
  pointer-events: auto;
  transform: translate3d(0, 0, 10rem) rotateX(-10deg) rotateY(-5deg) scale(1);
  transition: all .1s ease-out;
  width: 4rem;
  z-index: 1000;

  ${selectors.hwot} {
    transform: translate3d(0, 0, 10rem) rotateX(-10deg) rotateY(10deg) scale(1.2);
  }
`
