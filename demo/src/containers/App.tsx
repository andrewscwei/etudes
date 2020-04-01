/**
 * @file Client app root.
 */

import { align, container, selectors } from 'promptu';
import React, { createRef, Fragment, PureComponent } from 'react';
import { hot } from 'react-hot-loader/root';
import styled from 'styled-components';
import BurgerButton from '../../../lib/BurgerButton';
import $$GithubIcon from '../assets/images/github-icon.svg';
import MasonryGrid from './MasonryGrid';
import Video from './Video';
import VList from './VList';

interface Props {}

interface State {
  isNavActive: boolean;
  featuredComponent?: string;
}

class App extends PureComponent<Props, State> {
  state: State = {
    isNavActive: false,
  };

  nodeRefs = {
    burgerButton: createRef<BurgerButton>(),
  };

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevState.featuredComponent !== this.state.featuredComponent) {
      this.nodeRefs.burgerButton.current?.deactivate();
    }
  }

  renderFeaturedComponent() {
    switch (this.state.featuredComponent) {
      case 'masonry-grid': return <MasonryGrid/>;
      case 'video': return <Video/>
      case 'vlist': return <VList/>
      default: return <Fragment/>;
    }
  }

  render() {
    return (
      <Fragment>
        {this.renderFeaturedComponent()}
        <StyledNav isActive={this.state.isNavActive}>
          <StyledNavButton onClick={() => this.setState({ featuredComponent: 'masonry-grid' })}>Masonry Grid</StyledNavButton>
          <StyledNavButton onClick={() => this.setState({ featuredComponent: 'video' })}>Video</StyledNavButton>
          <StyledNavButton onClick={() => this.setState({ featuredComponent: 'vlist' })}>Vlist</StyledNavButton>
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
      </Fragment>
    );
  }
}

export default hot(App);

const StyledNavButton = styled.button`
  ${container.box}
  color: #000;
  font-size: 3rem;
  font-weight: 700;
  text-align: right;
  text-transform: uppercase;
  transform: translate3d(0, 0, 0) rotateX(${Math.floor(Math.random() * 10) + 5}deg) rotateY(${Math.floor(Math.random() * 10) + 5}deg) rotateZ(0deg);
  transition: all .1s ease-out;

  ${selectors.hwot} {
    color: #e91e63;
  }
`;

const StyledNav = styled.nav<{
  isActive: boolean;
}>`
  ${container.fvtr}
  ${align.ftr}
  padding: 10rem 3rem;
  background: #fff;
  height: 100%;
  width: 40rem;
  transition: all .1s ease-out;
  transform: ${props => props.isActive ?
    'translate3d(0, 0, 100rem) rotateX(-5deg) rotateY(30deg) rotateZ(5deg)' :
    'translate3d(100%, 0, 100rem) rotateX(0deg) rotateY(0deg) rotateZ(0deg)'
  };
  pointer-events: ${props => props.isActive ? 'auto' : 'none'};
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
  z-index: 10;
`;

const StyledBurgerButton = styled(BurgerButton)`
  ${align.ftr}
  margin: 3rem;
  transition: all .1s ease-out;
  transform: translate3d(0, 0, 100rem) rotateX(-10deg) rotateY(30deg);
  z-index: 100;

  ${selectors.hwot} {
    transform: translate3d(0, 0, 100rem) rotateX(-10deg) rotateY(30deg) scale(1.2);
  }
`;

const StyledGithubButton = styled.a`
  ${container.box}
  ${align.fbl}
  background: url(${$$GithubIcon}) center / 100% no-repeat;
  margin: 3rem;
  transition: all .1s ease-out;
  height: 4rem;
  width: 4rem;
  cursor: pointer;
  transform: translate3d(0, 0, 100rem) rotateX(10deg) rotateY(30deg);
  z-index: 100;

  ${selectors.hwot} {
    transform: translate3d(0, 0, 100rem) rotateX(10deg) rotateY(30deg) scale(1.2);
  }
`;