import React from 'react';
import { hydrate, render } from 'react-dom';
import App from './containers/App';

if (process.env.NODE_ENV === 'development') {
  window.localStorage.debug = 'etudes*';
}

const markup = () => (
  <App/>
);

const root = document.getElementById('app');

if (root!.hasChildNodes() && process.env.NODE_ENV !== 'development') {
  hydrate(markup(), root);
}
else {
  render(markup(), root);
}
