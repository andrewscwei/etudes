import React from 'react';
import { hydrate, render } from 'react-dom';
import { BrowserRouter as Router, Route, RouteComponentProps } from 'react-router-dom';
import App from './containers/App';

const markup = () => (
  <Router>
    <Route render={(routeProps: RouteComponentProps<any>) => (
      <App route={routeProps}/>
    )}/>
  </Router>
);

const root = document.getElementById('app');

if (root!.hasChildNodes() && process.env.NODE_ENV !== 'development') {
  hydrate(markup(), root);
}
else {
  render(markup(), root);
}
