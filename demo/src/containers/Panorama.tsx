/**
 * @file Client app root.
 */

import { Size } from 'dirty-dom';
import { container } from 'promptu';
import React, { createRef, Fragment, PureComponent } from 'react';
import { hot } from 'react-hot-loader/root';
import styled from 'styled-components';
import DebugConsole from '../../../src/DebugConsole';
import Panorama from '../../../src/Panorama';
import PanoramaSlider from '../../../src/PanoramaSlider';
import $$PanoramaImage from '../assets/images/panorama.jpg';

export interface Props {
  defaultAngle: number;
}

export interface State {
  angle: number;
}

export default hot(class extends PureComponent<Props, State> {
  static defaultProps: Partial<Props> = {
    defaultAngle: 0,
  };

  nodeRefs = {
    panorama: createRef<Panorama>(),
    slider: createRef<PanoramaSlider>(),
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      angle: this.props.defaultAngle,
    };
  }

  componentDidMount() {
    this.forceUpdate();
  }

  render() {
    return (
      <Fragment>
        <StyledRoot>
          <Panorama
            ref={this.nodeRefs.panorama}
            src={$$PanoramaImage}
            defaultAngle={this.props.defaultAngle}
            onAngleChange={angle => {
              this.setState({ angle });
              this.nodeRefs.slider.current?.setAngle(angle);
            }}
            style={{
              height: '40rem',
              transform: 'translate3d(0, 0, 0) rotateX(0deg) rotateY(20deg)',
              width: '40rem',
              maxWidth: '80%',
            }}
          />
          <PanoramaSlider
            ref={this.nodeRefs.slider}
            src={$$PanoramaImage}
            viewportSize={this.nodeRefs.panorama.current?.rect.size ?? new Size()}
            defaultAngle={this.props.defaultAngle}
            onAngleChange={angle => {
              this.setState({ angle });
              this.nodeRefs.panorama.current?.setAngle(angle);
            }}
            style={{
              marginTop: '3rem',
              height: '6rem',
              width: '80%',
              transform: 'translate3d(0, 0, 0) rotateX(0deg) rotateY(20deg)',
            }}
          />
        </StyledRoot>
        <DebugConsole
          title='?: Panorama'
          maxEntries={1}
          message={`Angle: ${Math.round(this.state.angle)}°`}
          style={{
            transform: 'translate3d(0, 0, 0) rotateX(10deg) rotateY(30deg)',
          }}
        />
      </Fragment>
    );
  }
});

const StyledRoot = styled.div`
  ${container.fvcc}
  width: 100%;
  height: 100%;
  padding: 3rem;
  perspective: 80rem;
  overflow: hidden;
`;
