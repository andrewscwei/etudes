import classNames from 'classnames'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { BurgerButton, BurgerButtonBar } from '../../lib/components/BurgerButton'
import { FlatSVG } from '../../lib/components/FlatSVG'
import { WithTooltip } from '../../lib/components/WithTooltip'
import $$GithubIcon from './assets/svgs/github-icon.svg'
import { AccordionDemo } from './containers/AccordionDemo'
import { CollectionDemo } from './containers/CollectionDemo'
import { DialSlidersDemo } from './containers/DialSlidersDemo'
import { MasonryGridDemo } from './containers/MasonryGridDemo'
import { PanoramaDemo } from './containers/PanoramaDemo'
import { VideoDemo } from './containers/VideoDemo'

export function App() {
  const mapLocationToHash = () => {
    const hasHash = window.location.hash && window.location.hash !== ''
    setHash(hasHash ? window.location.hash.substring(1, window.location.hash.length) : undefined)
  }

  const mapHashToLocation = () => {
    window.location.hash = hash ?? ''
  }

  const renderDemo = () => {
    switch (hash) {
      case 'masonry-grid': return <MasonryGridDemo/>
      case 'collection': return <CollectionDemo/>
      case 'accordion': return <AccordionDemo/>
      case 'dial+sliders': return <DialSlidersDemo/>
      case 'video': return <VideoDemo/>
      case 'panorama+slider': return <PanoramaDemo/>
      default: return (
        <StyledIntroduction>
          <div>
            <h1>Études</h1>
          </div>
          <span>A study of headless React components</span>
        </StyledIntroduction>
      )
    }
  }

  const [isNavActive, setIsNavActive] = useState(false)
  const [hash, setHash] = useState<string | undefined>('')

  useEffect(() => {
    mapLocationToHash()
    window.addEventListener('hashchange', mapLocationToHash)

    return () => window.removeEventListener('hashchange', mapLocationToHash)
  }, [])

  useEffect(() => {
    mapHashToLocation()
    setIsNavActive(false)
  }, [hash])

  return (
    <>
      <StyledDemo>{renderDemo()}</StyledDemo>
      <StyledHUDs>
        <StyledNav className={classNames({ active: isNavActive })}>
          <StyledNavButton className={classNames({ active: hash === 'masonry-grid' })} onClick={() => setHash('masonry-grid')}>Masonry Grid</StyledNavButton>
          <StyledNavButton className={classNames({ active: hash === 'collection' })} onClick={() => setHash('collection')}>Collection+Dropdown</StyledNavButton>
          <StyledNavButton className={classNames({ active: hash === 'accordion' })} onClick={() => setHash('accordion')}>Accordion</StyledNavButton>
          <StyledNavButton className={classNames({ active: hash === 'dial+sliders' })} onClick={() => setHash('dial+sliders')}>Dial+Sliders</StyledNavButton>
          <StyledNavButton className={classNames({ active: hash === 'video' })} onClick={() => setHash('video')}>Video</StyledNavButton>
          <StyledNavButton className={classNames({ active: hash === 'panorama+slider' })} onClick={() => setHash('panorama+slider')}>Panorama+Slider</StyledNavButton>
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
        <StyledWithTooltip hint='This is wrapped with WithTooltip!' backgroundColor='#fff'>
          <StyledGithubButton href='https://github.com/andrewscwei/etudes'>
            <FlatSVG svg={$$GithubIcon}/>
          </StyledGithubButton>
        </StyledWithTooltip>
      </StyledHUDs>
    </>
  )
}

const StyledDemo = styled.main`
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
`

const StyledIntroduction = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  height: 100%;
  justify-content: center;
  left: 0;
  margin: 0;
  perspective: 800px;
  position: absolute;
  top: 0;
  width: 100%;

  h1 {
    color: #fff;
    font-size: 80px;
    font-weight: 700;
    letter-spacing: 10px;
    margin: 0;
    padding: 0;
    text-transform: uppercase;
    transform: translate3d(0, 0, 100px) rotateX(10deg) rotateY(30deg) scale(1);
  }

  span {
    color: #fff;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 1px;
    max-width: 260px;
    text-align: center;
    text-transform: uppercase;
    transform: translate3d(0, 0, 100px) rotateX(10deg) rotateY(-30deg) scale(1);
  }
`

const StyledHUDs = styled.aside`
  height: 100%;
  left: 0;
  perspective: 800px;
  pointer-events: none;
  position: fixed;
  top: 0;
  transform: translate3d(0, 0, 0);
  width: 100%;

  > * {
    pointer-events: auto;
  }
`

const StyledNavButton = styled.button`
  background: none;
  border: none;
  color: #000;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  text-align: right;
  text-transform: uppercase;
  transform: translate3d(0, 0, 0) rotateX(${Math.floor(Math.random() * 10) + 5}deg) rotateY(${Math.floor(Math.random() * 10) + 5}deg) rotateZ(0deg);
  transition: all 100ms ease-out;

  &.active {
    color: #ff0054;
    pointer-events: none;
  }

  &:hover {
    color: #ff0054;
  }
`

const StyledNav = styled.nav`
  -webkit-overflow-scrolling: touch;
  align-items: flex-end;
  background: #fff;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  height: 100%;
  justify-content: flex-start;
  margin: 0;
  overflow-y: scroll;
  padding: 100px 5vw 100px 0;
  position: fixed;
  right: 0;
  top: 0;
  transform: translate3d(100%, 0, 50px) rotateX(0deg) rotateY(0deg) rotateZ(0deg);
  transition: all 100ms ease-out;
  width: 300px;
  z-index: 100;

  &.active {
    pointer-events: auto;
    transform: translate3d(0, 20px, 50px) rotateX(0deg) rotateY(-20deg) rotateZ(0deg);
  }

  > *:not(:last-child) {
    margin-bottom: 6px;
  }
`

const StyledBurgerButton = styled(BurgerButton)`
  cursor: pointer;
  margin: 0;
  margin: 8vh 8vw;
  position: fixed;
  right: 0;
  top: 0;
  transform: translate3d(0, 0, 100px) rotateX(-5deg) rotateY(-60deg) scale(1);
  transition: all 100ms ease-out;
  z-index: 1000;

  &:hover {
    transform: translate3d(0, 0, 100px) rotateX(-5deg) rotateY(-20deg) scale(1.1);

    .bar[data-index='2'] {
      width: 100% !important;
    }
  }

  .bar {
    transition: all 100ms ease-out;
    background: #fff;

    &.active {
      background: #000;
    }
  }
`

const StyledWithTooltip = styled(WithTooltip)`
  color: #000;
  padding: 10px;
  font-size: 10px;
  transition: opacity 100ms ease-out;
`

const StyledGithubButton = styled.a`
  bottom: 0;
  cursor: pointer;
  height: 40px;
  left: 0;
  margin: 0;
  margin: 8vh 8vw;
  position: fixed;
  transform: translate3d(0, 0, 100px) rotateX(-10deg) rotateY(-5deg) scale(1);
  transition: all 100ms ease-out;
  width: 40px;
  z-index: 1000;

  figure {
    height: 100%;
    margin: 0;
    padding: 0;
    width: 100%;
  }

  svg * { fill: #fff; }

  &:hover {
    transform: translate3d(0, 0, 100px) rotateX(-10deg) rotateY(10deg) scale(1.1);
  }
`
