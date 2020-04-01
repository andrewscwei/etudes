/**
 * @file Client app root.
 */

import { align, container, selectors } from 'promptu';
import React, { createRef, Fragment, PureComponent } from 'react';
import { hot } from 'react-hot-loader/root';
import { Route, RouteComponentProps, Switch } from 'react-router';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import BurgerButton from '../../../lib/BurgerButton';
import $$GithubIcon from '../assets/images/github-icon.svg';
import routes from '../routes';

interface Props {
  route: RouteComponentProps<{}>;
}

interface State {
  isNavActive: boolean;
}

class App extends PureComponent<Props, State> {
  state: State = {
    isNavActive: false,
  };

  nodeRefs = {
    burgerButton: createRef<BurgerButton>(),
  };

  generateRoutes() {
    return routes.map((route, index) => (
      <Route exact={route.exact} path={route.path} key={`route-${index}`} component={route.component}/>
    ));
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.route.location.pathname !== this.props.route.location.pathname) {
      this.nodeRefs.burgerButton.current?.deactivate();
    }
  }

  render() {
    const { route } = this.props;

    return (
      <Fragment>
        <Switch location={route.location}>{this.generateRoutes()}</Switch>
        <StyledNav isActive={this.state.isNavActive}>
          <StyledNavLink to='/masonry-grid'>Masonry Grid</StyledNavLink>
          <StyledNavLink to='/video'>Video</StyledNavLink>
          <StyledNavLink to='/vlist'>Vlist</StyledNavLink>
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

const StyledNavLink = styled(NavLink)`
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