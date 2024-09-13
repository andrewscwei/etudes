import { StrictMode } from 'react'
import { Footer } from './components/Footer.js'
import { Header } from './components/Header'
import { AccordionDemo } from './demos/AccordionDemo.js'
import { BurgerButtonDemo } from './demos/BurgerButtonDemo'
import { ButtonDemo } from './demos/ButtonDemo'
import { CarouselDemo } from './demos/CarouselDemo.js'
import { CollectionDemo } from './demos/CollectionDemo.js'
import { CounterDemo } from './demos/CounterDemo.js'
import { CoverImageDemo } from './demos/CoverImageDemo.js'
import { CoverVideoDemo } from './demos/CoverVideoDemo.js'
import { DialDemo } from './demos/DialDemo.js'
import { DropdownDemo } from './demos/DropdownDemo.js'
import { FlatSVGDemo } from './demos/FlatSVGDemo.js'
import { ImageDemo } from './demos/ImageDemo.js'
import { MasonryGridDemo } from './demos/MasonryGridDemo.js'
import { OptionButtonDemo } from './demos/OptionButtonDemo'
import { PanoramaDemo } from './demos/PanoramaDemo.js'
import { PanoramaSliderDemo } from './demos/PanoramaSliderDemo.js'
import { RangeSliderDemo } from './demos/RangeSliderDemo.js'
import { SelectableButtonDemo } from './demos/SelectableButtonDemo'
import { SliderDemo } from './demos/SliderDemo.js'
import { StepwiseSliderDemo } from './demos/StepwiseSliderDemo.js'
import { SwipeContainerDemo } from './demos/SwipeRegionDemo.js'
import { TextFieldDemo } from './demos/TextFieldDemo.js'
import { VideoDemo } from './demos/VideoDemo.js'
import { WithTooltipDemo } from './demos/WithTooltipDemo.js'

export function App() {
  return (
    <StrictMode>
      <Header className='px-safe-or-4 tab:px-safe-or-10 note:px-safe-or-20'/>
      <main
        className='px-safe-or-4 tab:px-safe-or-10 note:px-safe-or-20 grid-cols text-dark grid w-full gap-6 py-6'
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr)' }}
      >
        <AccordionDemo/>
        <BurgerButtonDemo/>
        <ButtonDemo/>
        <CarouselDemo/>
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
        <RangeSliderDemo/>
        <SelectableButtonDemo/>
        <SliderDemo/>
        <StepwiseSliderDemo/>
        <SwipeContainerDemo/>
        <TextFieldDemo/>
        <VideoDemo/>
        <WithTooltipDemo/>
      </main>
      <Footer className='px-safe-or-4 tab:px-safe-or-10 note:px-safe-or-20'/>
    </StrictMode>
  )
}
