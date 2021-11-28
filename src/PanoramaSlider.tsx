// import { DirtyType, EventType, UpdateDelegate } from 'dirty-dom'
// import React, { createRef, HTMLAttributes, useEffect, useState } from 'react'
// import { Rect, Size } from 'spase'
// import styled, { css, CSSProp } from 'styled-components'
// import Panorama, { Props as PanoramaProps } from './Panorama'
// import { ExtendedCSSProps } from './types'

// export type IndicatorCSSProps = Readonly<{
//   isDragging: boolean
//   reticleWidth: number
// }>

// export type ReticleCSSProps = Readonly<{
//   isDragging: boolean
// }>

// export type GutterCSSProps = Readonly<{
//   isDragging: boolean
// }>

// export type Props = HTMLAttributes<HTMLDivElement> & PanoramaProps & {
//   /**
//    * Field-of-view (0.0 - 360.0 degrees, inclusive) that represents the size of the reticle. 360
//    * indicates the reticle covers the entire image. If this is unspecified, the component will
//    * attempt to automatically calculate the FOV using the `targetViewportSize` prop.
//    */
//   fov?: number

//   /**
//    * Size of the viewport that this component is controlling. A viewport can be thought of a DOM
//    * element containing an aspect-filled image. This is used to automatically calculate the FOV if
//    * `fov` prop is not specified. If it is, this prop is ignored.
//    */
//   viewportSize?: Size

//   /**
//    * Additional CSS to be provided to the reticle.
//    */
//   reticleCSS?: CSSProp<any>

//   /**
//    * Additional CSS to be provided to the gutter.
//    */
//   gutterCSS?: CSSProp<any>

//   /**
//    * Additional CSS to be provided to the indicator.
//    */
//   indicatorCSS?: CSSProp<any>
// }

// export default function PanoramaSlider({
//   angle = 0,
//   speed = 1,
//   viewportSize,
//   reticleCSS,
//   gutterCSS,
//   indicatorCSS,
//   angle = 0,
//   speed = 1,
//   src,
//   zeroAnchor = 0,
//   onAngleChange,
//   onPositionChange,
//   onDragStart,
//   onDragEnd,
//   onImageLoadStart,
//   onImageLoadComplete,
//   onImageLoadError,
//   onImageSizeChange,
//   style,
//   ...props,
// }: Props) {
//   let updateDelegate: UpdateDelegate | undefined

//   const nodeRefs = {
//     root: createRef<HTMLDivElement>(),
//     // panorama: createRef<Panorama>(),
//   }

//   let lastHeight = 0

//   function setAngle(angle: number) {
//     // this.nodeRefs.panorama.current?.setAngle(angle)
//   }

//   function reconfigureUpdateDelegate() {
//     this.updateDelegate?.deinit()

//     this.updateDelegate = new UpdateDelegate(info => this.update(info), {
//       [EventType.RESIZE]: {
//         target: this.nodeRefs.root.current,
//       },
//     })

//     this.updateDelegate?.init()
//   }

//   function onDragStart() {
//     this.setState({ isDragging: true })
//   }

//   function onDragEnd() {
//     this.setState({ isDragging: false })
//   }

//   function onAngleChange(angle: number) {
//     this.props.onAngleChange?.(angle)
//   }

//   function onPositionChange = (position: number) => {
//     this.props.onPositionChange?.(position)
//   }

//   function onImageLoad = (image: HTMLImageElement) => {
//     this.setState({ imageSize: new Size([image.width, image.height]) })
//     this.props.onImageLoad?.(image)
//   }

//   constructor(props: Props) {
//     super(props)

//     if (this.props.fov === undefined && this.props.viewportSize === undefined) {
//       throw new Error('Either `fov` or `viewportSize` must be specified')
//     }

//     this.state = {
//       imageSize: new Size(),
//       isDragging: false,
//     }
//   }

//   function getImageAspectRatio(): number {
//     const { width, height } = this.state.imageSize
//     if (height === 0) return 0
//     return width / height
//   }

//   function getReticleWidth(): number {
//     let fov = 0

//     if (this.props.fov !== undefined) {
//       fov = this.props.fov
//     }
//     else if (this.props.viewportSize !== undefined) {
//       fov = (this.props.viewportSize.width / (this.props.viewportSize.height * this.imageAspectRatio)) * 360
//     }

//     fov = Math.max(0, Math.min(360, fov))

//     const maxWidth = (Rect.from(this.nodeRefs.root.current)?.height ?? 0) * this.imageAspectRatio
//     const width = maxWidth * (fov / 360)
//     return Math.min(maxWidth, width)
//   }

//   useEffect(() => {
//     reconfigureUpdateDelegate()

//     return () => {

//     }
//   }, [])

//   componentDidUpdate(prevProps: Props, prevState: State) {
//     if (prevState.imageSize !== this.state.imageSize) {
//       // this.nodeRefs.panorama.current?.resetPosition()
//     }
//   }

//   update(info: DirtyInfo) {
//     const { [DirtyType.SIZE]: dirtySize } = info

//     if (dirtySize) {
//       if (this.lastHeight !== dirtySize.minSize.height) {
//         this.forceUpdate()
//         this.lastHeight = dirtySize.minSize.height
//       }
//     }
//   }

//   const [isDragging, setIsDragging] = useState(false)
//   const reticleWidth = this.reticleWidth

//   function _onImageSizeChange(imageSize?: Size) {
//     onImageSizeChange?.(imageSize)
//   }

//   return (
//     <StyledRoot
//       ref={this.nodeRefs.root}
//       style={{
//         ...style,
//         width: `${(Rect.from(this.nodeRefs.root.current)?.height ?? 0) * this.imageAspectRatio}px`,
//       }}
//       {...props}
//     >
//       <Panorama
//         angle={angle}
//         onAngleChange={onAngleChange}
//         onDragEnd={onDragEnd}
//         onDragStart={onDragStart}
//         onImageLoadComplete={onImageLoadComplete}
//         onImageLoadError={onImageLoadError}
//         onImageLoadStart={onImageLoadStart}
//         onImageSizeChange={_onImageSizeChange}
//         onPositionChange={onPositionChange}
//         speed={speed}
//         src={src}
//         zeroAnchor={zeroAnchor}
//         style={{ height: '100%', width: '100%' }}
//       />
//       <StyledSlideTrack>
//         <div>
//           <StyledGutter isDragging={isDragging} css={gutterCSS}/>
//           <StyledReticle isDragging={isDragging} css={reticleCSS} style={{ width: `${reticleWidth}px` }}/>
//           <StyledGutter isDragging={isDragging} css={gutterCSS}/>
//         </div>
//       </StyledSlideTrack>
//       <StyledIndicator isDragging={isDragging} reticleWidth={reticleWidth} css={indicatorCSS}/>
//     </StyledRoot>
//   )
// }

// const StyledReticle = styled.div<ReticleCSSProps & ExtendedCSSProps<ReticleCSSProps>>`
//   background: rgba(0, 0, 0, ${props => props.isDragging ? 0 : .3});
//   flex: 0 0 auto;
//   height: 100%;
//   transition-duration: 100ms;
//   transition-property: background;
//   transition-timing-function: ease-out;
//   will-change: background;
//   ${props => props.extendedCSS(props)}
//   `

// const StyledGutter = styled.div<GutterCSSProps & ExtendedCSSProps<GutterCSSProps>>`
//   background: rgba(0, 0, 0, .7);
//   display: block;
//   flex: 1 0 auto;
//   height: 100%;
//   pointer-events: none;
//   ${props => props.extendedCSS(props)}
// `

// const StyledSlideTrack = styled.div`
//   box-sizing: border-box;
//   display: block;
//   height: 100%;
//   left: 0;
//   overflow: hidden;
//   pointer-events: none;
//   position: absolute;
//   top: 0;
//   width: 100%;

//   > div {
//     align-items: center;
//     display: flex;
//     height: 100%;
//     justify-content: flex-start;
//     left: 0;
//     overflow: visible;
//     position: absolute;
//     top: 0;
//     width: 100%;
//   }
// `

// const StyledIndicator = styled.div<IndicatorCSSProps & ExtendedCSSProps<IndicatorCSSProps>>`
//   background: #fff;
//   border-radius: 2px;
//   bottom: -10px;
//   box-sizing: border-box;
//   display: block;
//   height: 2px;
//   left: 0;
//   margin: 0 auto;
//   opacity: ${props => props.isDragging ? 1 : 0};
//   right: 0;
//   transition: opacity .3s ease-out;
//   width: ${props => props.reticleWidth}px;
// `

// const StyledRoot = styled.div`
//   box-sizing: border-box;
//   display: block;
//   flex: 0 0 auto;
// `
