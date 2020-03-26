/**
 * @file Client app root.
 */

import MasonryGrid from 'etudes/MasonryGrid';
import React, { CSSProperties, Fragment, PureComponent } from 'react';
import { hot } from 'react-hot-loader/root';
import Footer from '../components/Footer';

const debug = require('debug')('app');

export interface Props {}

export interface State {}

class App extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    debug('Initializing...', 'OK');
  }

  render() {
    return (
      <Fragment>
        <style>{`
          .grid-item {
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            padding: 20px;
            color: #fff;
            background: #e91e63;
          }
        `}</style>
        <main style={{
          padding: '30px',
          boxSizing: 'border-box',
          height: 'auto',
          left: '0',
          minHeight: '100%',
          top: '0',
          width: '100%',
        }}>
          <MasonryGrid sections={6} verticalSpacing={30} horizontalSpacing={30}>
            {[...new Array(60)].map((v, i) => (
              <div key={i} className={`grid-item h${Math.floor(Math.random() * 5) + 1} mg-${Math.floor(Math.random() * 1) + 1}`}>{i}</div>
            ))}
          </MasonryGrid>
        </main>
        <Footer/>
      </Fragment>
    );
  }
}

export default hot(App);
