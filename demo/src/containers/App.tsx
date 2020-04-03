/**
 * @file Client app root.
 */

import { align, container, selectors } from 'promptu';
import React, { createRef, Fragment, PureComponent } from 'react';
import { hot } from 'react-hot-loader/root';
import styled from 'styled-components';
import BurgerButton from '../../../src/BurgerButton';
import $$GithubIcon from '../assets/images/github-icon.svg';
import MasonryGrid from './MasonryGrid';
import Video from './Video';
import VList from './VList';
import HList from './HList';
import Dropdown from './Dropdown';

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

    if (window.location.hash && window.location.hash !== '') {
      this.state = {
        isNavActive: false,
        featuredComponent: window.location.hash.substring(1, window.location.hash.length),
      };
    }
    else {
      this.state = {
        isNavActive: false,
      };
    }
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevState.featuredComponent !== this.state.featuredComponent) {
      if (this.state.featuredComponent) window.location.hash = this.state.featuredComponent;
      this.nodeRefs.burgerButton.current?.deactivate();
    }
  }

  renderFeaturedComponent() {
    switch (this.state.featuredComponent) {
      case 'masonry-grid': return <MasonryGrid/>;
      case 'hlist': return <HList/>;
      case 'vlist': return <VList/>;
      case 'dropdown': return <Dropdown/>;
      case 'video': return <Video/>;
      default: return <Fragment/>;
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
            <StyledNavButton onClick={() => this.setState({ featuredComponent: 'masonry-grid' })}>Masonry Grid</StyledNavButton>
            <StyledNavButton onClick={() => this.setState({ featuredComponent: 'hlist' })}>Hlist</StyledNavButton>
            <StyledNavButton onClick={() => this.setState({ featuredComponent: 'vlist' })}>Vlist</StyledNavButton>
            <StyledNavButton onClick={() => this.setState({ featuredComponent: 'dropdown' })}>Dropdown</StyledNavButton>
            <StyledNavButton onClick={() => this.setState({ featuredComponent: 'video' })}>Video</StyledNavButton>
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

const StyledNavButton = styled.button`
  ${container.box}
  color: #000;
  font-size: 2.2rem;
  font-weight: 700;
  pointer-events: 'auto';
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
  z-index: 10;

  ${selectors.eblc} {
    margin-bottom: .6rem;
  }
`;

const StyledBurgerButton = styled(BurgerButton)`
  ${align.ftr}
  margin: 8vh 8vw;
  pointer-events: auto;
  transition: all .1s ease-out;
  transform: translate3d(0, 0, 10rem) rotateX(-5deg) rotateY(-60deg) scale(1);
  z-index: 100;

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
  z-index: 100;

  ${selectors.hwot} {
    transform: translate3d(0, 0, 10rem) rotateX(-10deg) rotateY(10deg) scale(1.2);
  }
`;
