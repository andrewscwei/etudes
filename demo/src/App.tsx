import { StrictMode } from 'react'
import { Footer } from './components/Footer.js'
import { Header } from './components/Header'
import { AccordionDemo } from './demos/AccordionDemo.js'
import { BurgerButtonDemo } from './demos/BurgerButtonDemo'
import { ButtonDemo } from './demos/ButtonDemo'
import { CarouselDemo } from './demos/CarouselDemo.js'
import { CollectionDemo } from './demos/CollectionDemo.js'
import { CoverImageDemo } from './demos/CoverImageDemo.js'
import { CoverVideoDemo } from './demos/CoverVideoDemo.js'
import { DialDemo } from './demos/DialDemo.js'
import { DropdownDemo } from './demos/DropdownDemo.js'
import { FlatSVGDemo } from './demos/FlatSVGDemo.js'
import { ImageDemo } from './demos/ImageDemo.js'
import { MasonryGridDemo } from './demos/MasonryGridDemo.js'
import { OptionButtonDemo } from './demos/OptionButtonDemo'
import { PanoramaSliderDemo } from './demos/PanoramaSliderDemo.js'
import { RotatingGalleryDemo } from './demos/RotatingGalleryDemo.js'
import { SelectableButtonDemo } from './demos/SelectableButtonDemo'
import { SliderDemo } from './demos/SliderDemo.js'
import { StepwiseSliderDemo } from './demos/StepwiseSlider.js'
import { TextFieldDemo } from './demos/TextFieldDemo.js'
import { VideoDemo } from './demos/VideoDemo.js'

export function App() {
  return (
    <StrictMode>
      <Header className='px-safe-or-4 tab:px-safe-or-10 note:px-safe-or-20'/>
      <main
        className='px-safe-or-4 tab:px-safe-or-10 note:px-safe-or-20 grid-cols grid w-full gap-6 py-6 text-black'
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr)' }}
      >
        <AccordionDemo/>
        <BurgerButtonDemo/>
        <ButtonDemo/>
        <CarouselDemo/>
        <CollectionDemo/>
        <CoverImageDemo/>
        <CoverVideoDemo/>
        <DialDemo/>
        <DropdownDemo/>
        <FlatSVGDemo/>
        <ImageDemo/>
        <MasonryGridDemo/>
        <OptionButtonDemo/>
        {/* <PanoramaDemo/> */}
        <PanoramaSliderDemo/>
        {/* <RangeSliderDemo/> */}
        <RotatingGalleryDemo/>
        <SelectableButtonDemo/>
        <SliderDemo/>
        <StepwiseSliderDemo/>
        <TextFieldDemo/>
        <VideoDemo/>
      </main>
      <Footer className='px-safe-or-4 tab:px-safe-or-10 note:px-safe-or-20'/>
    </StrictMode>
  )
}
