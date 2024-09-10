import { Panorama } from 'etudes/components/Panorama'
import { useSize } from 'etudes/hooks/useSize'
import { useEffect, useRef, useState } from 'react'
import { Size } from 'spase'
import $$PanoramaImage from '../assets/images/panorama.png'
import { Frame } from '../components/Frame.js'

export function PanoramaDemo() {
  const [angle, setAngle] = useState(0)
  const [width, setWidth] = useState(800)
  const [viewportSize, setViewportSize] = useState(new Size())
  const [zeroAnchor] = useState(0.5)
  const panoramaRef = useRef<HTMLDivElement>(null)
  const panoramaSize = useSize(panoramaRef)

  useEffect(() => {
    setViewportSize(panoramaSize)
  }, [panoramaSize.width, panoramaSize.height])

  return (
    <Frame title='Panorama'>
      <Panorama
        ref={panoramaRef}
        angle={angle}
        src={$$PanoramaImage}
        style={{ width: `${width}px` }}
        zeroAnchor={zeroAnchor}
        onAngleChange={(value, isDragging) => { if (isDragging) setAngle(value) }}
      />
    </Frame>
  )
}
