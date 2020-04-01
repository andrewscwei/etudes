/**
 * @file Client app root.
 */

import { align, container, selectors } from 'promptu';
import React, { Fragment, PureComponent } from 'react';
import { hot } from 'react-hot-loader/root';
import { Route, RouteComponentProps, Switch } from 'react-router';
import styled from 'styled-components';
import BurgerButton from '../../../lib/BurgerButton';
import $$GithubIcon from '../assets/images/github-icon.svg';
import routes from '../routes';
import { NavLink } from 'react-router-dom';

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

  generateRoutes() {
    return routes.map((route, index) => (
      <Route exact={route.exact} path={route.path} key={`route-${index}`} component={route.component}/>
    ));
  }

  render() {
    const { route } = this.props;

    return (
      <Fragment>
        <Switch location={route.location}>{this.generateRoutes()}</Switch>
        <StyledNav isActive={this.state.isNavActive}>
          <StyledNavLink to='/masonry-grid'>Masonry Grid</StyledNavLink>
        </StyledNav>
        <StyledBurgerButton
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
  font-size: 4.6rem;
  font-weight: 700;
  text-transform: uppercase;
  transform: translate3d(0, 0, 0) rotateX(${Math.floor(Math.random() * 30) + 5}deg) rotateY(${Math.floor(Math.random() * 30) + 5}deg) rotateZ(0deg);
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
  opacity: ${props => props.isActive ? 1 : 0};
  transition: all .1s ease-out;
  transform: ${props => `translate3d(${props.isActive ? 0 : '100%'}, 0, 0) rotateX(-5deg) rotateY(30deg) rotateZ(5deg)`};
  pointer-events: ${props => props.isActive ? 'auto' : 'none'};
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
`;

const StyledBurgerButton = styled(BurgerButton)`
  ${align.ftr}
  margin: 3rem;
  transition: all .1s ease-out;
  transform: translate3d(0, 0, 0) rotateX(-10deg) rotateY(30deg);

  ${selectors.hwot} {
    transform: translate3d(0, 0, 0) rotateX(-10deg) rotateY(30deg) scale(1.2);
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
  transform: translate3d(0, 0, 0) rotateX(10deg) rotateY(30deg);

  ${selectors.hwot} {
    transform: translate3d(0, 0, 0) rotateX(10deg) rotateY(30deg) scale(1.2);
  }
`;