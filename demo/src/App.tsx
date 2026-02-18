import { StrictMode } from 'react'

import { Footer } from './components/Footer.js'
import { Header } from './components/Header.js'
import { AccordionDemo } from './demos/AccordionDemo.js'
import { BurgerButtonDemo } from './demos/BurgerButtonDemo.js'
import { ButtonDemo } from './demos/ButtonDemo.js'
import { CarouselDemo } from './demos/CarouselDemo.js'
import { CodeInputDemo } from './demos/CodeInputDemo.js'
import { CollectionDemo } from './demos/CollectionDemo.js'
import { CounterDemo } from './demos/CounterDemo.js'
import { CoverImageDemo } from './demos/CoverImageDemo.js'
import { CoverVideoDemo } from './demos/CoverVideoDemo.js'
import { DialDemo } from './demos/DialDemo.js'
import { DropdownDemo } from './demos/DropdownDemo.js'
import { FlatSVGDemo } from './demos/FlatSVGDemo.js'
import { ImageDemo } from './demos/ImageDemo.js'
import { MasonryGridDemo } from './demos/MasonryGridDemo.js'
import { OptionButtonDemo } from './demos/OptionButtonDemo.js'
import { PanoramaDemo } from './demos/PanoramaDemo.js'
import { PanoramaSliderDemo } from './demos/PanoramaSliderDemo.js'
import { PictureDemo } from './demos/PictureDemo.js'
import { RangeSliderDemo } from './demos/RangeSliderDemo.js'
import { SelectableButtonDemo } from './demos/SelectableButtonDemo.js'
import { SelectDemo } from './demos/SelectDemo.js'
import { SliderDemo } from './demos/SliderDemo.js'
import { StepSliderDemo } from './demos/StepSliderDemo.js'
import { SwipeContainerDemo } from './demos/SwipeRegionDemo.js'
import { TextAreaDemo } from './demos/TextAreaDemo.js'
import { TextFieldDemo } from './demos/TextFieldDemo.js'
import { ToggleDemo } from './demos/ToggleDemo.js'
import { VideoDemo } from './demos/VideoDemo.js'
import { WithTooltipDemo } from './demos/WithTooltipDemo.js'

export function App() {
  return (
    <StrictMode>
      <Header/>
      <main className='w-full px-safe'>
        <div
          className='grid-cols grid w-full gap-6 px-4 py-6 text-dark tab:px-10 note:px-20'
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr)' }}
        >
          <AccordionDemo/>
          <BurgerButtonDemo/>
          <ButtonDemo/>
          <CarouselDemo/>
          <CodeInputDemo/>
          <CollectionDemo/>
          <CounterDemo/>
          <CoverImageDemo/>
          <CoverVideoDemo/>
          <DialDemo/>
          <DropdownDemo/>
          <FlatSVGDemo/>
          <ImageDemo/>
          <MasonryGridDemo/>
          <OptionButtonDemo/>
          <PanoramaDemo/>
          <PanoramaSliderDemo/>
          <PictureDemo/>
          <RangeSliderDemo/>
          <SelectableButtonDemo/>
          <SelectDemo/>
          <SliderDemo/>
          <StepSliderDemo/>
          <SwipeContainerDemo/>
          <TextAreaDemo/>
          <TextFieldDemo/>
          <ToggleDemo/>
          <VideoDemo/>
          <WithTooltipDemo/>
        </div>
      </main>
      <Footer/>
    </StrictMode>
  )
}
