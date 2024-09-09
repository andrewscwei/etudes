import { StrictMode } from 'react'
import { Header } from './components/Header'
import { BurgerButtonDemo } from './demos/BurgerButtonDemo'
import { ButtonDemo } from './demos/ButtonDemo'
import { CycleButtonDemo } from './demos/CycleButtonDemo'
import { SelectableButtonDemo } from './demos/SelectableButtonDemo'

export function App() {
  return (
    <StrictMode>
      <Header className='px-safe-or-4 tab:px-safe-or-10 note:px-safe-or-20'/>
      <main
        className='px-safe-or-4 tab:px-safe-or-10 note:px-safe-or-20 grid-cols grid w-full gap-3 py-6'
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr)' }}
      >
        <BurgerButtonDemo/>
        <ButtonDemo/>
        <CycleButtonDemo/>
        <SelectableButtonDemo/>
      </main>
    </StrictMode>
  )
}
