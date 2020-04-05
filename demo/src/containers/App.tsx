/**
 * @file Client app root.
 */

import { align, container, selectors } from 'promptu';
import React, { createRef, Fragment, PureComponent } from 'react';
import { hot } from 'react-hot-loader/root';
import styled from 'styled-components';
import BurgerButton from '../../../src/BurgerButton';
import $$GithubIcon from '../assets/images/github-icon.svg';
import Accordion from './Accordion';
import Compass from './Compass';
import List from './List';
import MasonryGrid from './MasonryGrid';
import Video from './Video';

const debug = process.env.NODE_ENV === 'development' ? require('debug')('etudes') : () => {};

interface Props {}

interface State {
  isNavActive: boolean;
  featuredComponent?: string;
}

class App extends PureComponent<Props, State> {
  nodeRefs = {
    burgerButton: createRef<BurgerButton>(),
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      isNavActive: false,
    };
  }

  componentDidMount() {
    window.addEventListener('hashchange', () => this.mapLocationToState());
    this.mapLocationToState();
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevState.featuredComponent !== this.state.featuredComponent) {
      this.mapStateToLocation();
      this.nodeRefs.burgerButton.current?.deactivate();
    }
  }

  mapLocationToState() {
    const hasHash = window.location.hash && window.location.hash !== '';

    this.setState({
      featuredComponent: hasHash ? window.location.hash.substring(1, window.location.hash.length) : undefined,
    });
  }

  mapStateToLocation() {
    window.location.hash = this.state.featuredComponent ?? '';
  }

  renderFeaturedComponent() {
    debug(`Loading component ID ${this.state.featuredComponent}... OK`);

    switch (this.state.featuredComponent) {
      case 'masonry-grid': return <MasonryGrid/>;
      case 'list': return <List/>;
      case 'accordion': return <Accordion/>;
      case 'compass': return <Compass/>;
      case 'video': return <Video/>;
      default: return (
        <StyledIntroduction>
          <h1>Études</h1>
          <span>A study of styled React components</span>
        </StyledIntroduction>
      );
    }
  }

  render() {
    return (
      <Fragment>
        <main style={{
          height: '100%',
          left: 0,
          position: 'absolute',
          top: 0,
          width: '100%',
        }}>
          {this.renderFeaturedComponent()}
        </main>
        <aside style={{
          height: '100%',
          left: 0,
          perspective: '80rem',
          pointerEvents: 'none',
          position: 'fixed',
          top: 0,
          transform: 'translate3d(0, 0, 0)',
          width: '100%',
        }}>
          <StyledNav isActive={this.state.isNavActive}>
            <StyledNavButton isActive={this.state.featuredComponent === 'masonry-grid'} onClick={() => this.setState({ featuredComponent: 'masonry-grid' })}>Masonry Grid</StyledNavButton>
            <StyledNavButton isActive={this.state.featuredComponent === 'list'} onClick={() => this.setState({ featuredComponent: 'list' })}>List+Dropdown</StyledNavButton>
            <StyledNavButton isActive={this.state.featuredComponent === 'accordion'} onClick={() => this.setState({ featuredComponent: 'accordion' })}>Accordion</StyledNavButton>
            <StyledNavButton isActive={this.state.featuredComponent === 'compass'} onClick={() => this.setState({ featuredComponent: 'compass' })}>Compass+Sliders</StyledNavButton>
            <StyledNavButton isActive={this.state.featuredComponent === 'video'} onClick={() => this.setState({ featuredComponent: 'video' })}>Video</StyledNavButton>
          </StyledNav>
          <StyledBurgerButton
            ref={this.nodeRefs.burgerButton}
            height={32}
            isFunky={true}
            thickness={6}
            tintColor={this.state.isNavActive ? '#000' : '#fff'}
            width={36}
            onActivate={() => this.setState({ isNavActive: true })}
            onDeactivate={() => this.setState({ isNavActive: false })}
          />
          <StyledGithubButton href='https://github.com/andrewscwei/etudes'/>
        </aside>
      </Fragment>
    );
  }
}

export default hot(App);

const StyledNavButton = styled.button<{
  isActive: boolean;
}>`
  ${container.box}
  color: ${props => props.isActive ? '#2b14d4' : '#000'};
  font-size: 2rem;
  font-weight: 700;
  pointer-events: ${props => props.isActive ? 'none' : 'auto'};
  text-align: right;
  text-transform: uppercase;
  transform: translate3d(0, 0, 0) rotateX(${Math.floor(Math.random() * 10) + 5}deg) rotateY(${Math.floor(Math.random() * 10) + 5}deg) rotateZ(0deg);
  transition: all .1s ease-out;

  ${selectors.hwot} {
    color: #2b14d4;
  }
`;

const StyledNav = styled.nav<{
  isActive: boolean;
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
`;

const StyledIntroduction = styled.div`
  ${container.fvcc}
  ${align.tl}
  width: 100%;
  height: 100%;
  perspective: 80rem;

  h1 {
    font-size: 8rem;
    color: #fff;
    text-shadow: -12px 4px 0px rgba(43, 20, 212, 1);
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
    text-shadow: -2px 4px 0px rgba(255, 255, 255, .3);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .1rem;
    transform: translate3d(0, 0, 10rem) rotateX(10deg) rotateY(-30deg) scale(1);
  }
`;

const StyledBurgerButton = styled(BurgerButton)`
  ${align.ftr}
  margin: 8vh 8vw;
  pointer-events: auto;
  transition: all .1s ease-out;
  transform: translate3d(0, 0, 10rem) rotateX(-5deg) rotateY(-60deg) scale(1);
  z-index: 1000;

  ${selectors.hwot} {
    transform: translate3d(0, 0, 10rem) rotateX(-5deg) rotateY(-20deg) scale(1.2);
  }
`;

const StyledGithubButton = styled.a`
  ${container.box}
  ${align.fbl}
  background: url(${$$GithubIcon}) center / 100% no-repeat;
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
`;
