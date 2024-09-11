import { Dial, DialKnob, DialTrack } from 'etudes/components/Dial'
import { Frame } from '../components/Frame.js'

export function DialDemo() {
  return (
    <Frame
      options={[
        ['angle: 0', 'angle: 45', 'angle: 90', 'angle: 135', 'angle: 180', 'angle: 225', 'angle: 270', 'angle: 315'],
        ['knobThickness: 4', 'knobThickness: 2'],
        ['knobLength: 28', 'knobLength: 36', 'knobLength: 20'],
        ['trackGap: 0', 'trackGap: 2', 'trackGap: 4'],
        ['trackThickness: 4', 'trackThickness: 2'],
      ]}
      title='Dial'
    >
      {({ angle, knobLength, knobThickness, trackGap, trackThickness }, toast) => (
        <Dial
          angle={Number(angle)}
          className='relative'
          knobLength={Number(knobLength)}
          knobThickness={Number(knobThickness)}
          radius={56}
          trackGap={Number(trackGap)}
          trackThickness={Number(trackThickness)}
        >
          <DialKnob className='stroke-dark'/>
          <DialTrack className='stroke-dark/20'/>
        </Dial>
      )}
    </Frame>
  )
}
