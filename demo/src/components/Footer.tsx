import React, { PropsWithChildren, SFC } from 'react';
import $$GithubIcon from '../assets/images/github-icon.svg';

export interface Props extends PropsWithChildren<{}> {}

const Footer: SFC<Props> = () => (
  <footer style={{
    alignItems: 'center',
    bottom: '0',
    boxSizing: 'border-box',
    display: 'flex',
    height: '50px',
    justifyContent: 'flex-start',
    left: '0',
    padding: '0 30px',
    width: '100%',
    position: 'fixed',
  }}>
    <a href='https://github.com/andrewscwei/etudes' style={{
      background: `url(${$$GithubIcon}) center / 100% no-repeat`,
      display: 'block',
      height: '20px',
      transition: 'all .2s ease-out',
      width: '20px',
      cursor: 'pointer',
    }}/>
  </footer>
);

export default Footer;
