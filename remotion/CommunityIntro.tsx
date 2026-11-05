import React from 'react'
import { Sequence } from 'remotion'
import { Scene1Mission } from './scenes/Scene1Mission'
import { Scene2Pillars } from './scenes/Scene2Pillars'
import { Scene3Deliverables } from './scenes/Scene3Deliverables'
import { Scene4Practitioners } from './scenes/Scene4Practitioners'
import { Scene5CallToAction } from './scenes/Scene5CallToAction'

export const CommunityIntro: React.FC = () => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#060A12',
      }}
    >
      {/* Scene 1: The Problem & The Mission (0:00 - 0:25) -> 750 frames */}
      <Sequence from={0} durationInFrames={750}>
        <Scene1Mission />
      </Sequence>

      {/* Scene 2: The 4 Strategic Pillars (0:25 - 1:00) -> 1050 frames */}
      <Sequence from={750} durationInFrames={1050}>
        <Scene2Pillars />
      </Sequence>

      {/* Scene 3: Core Deliverables (1:00 - 1:27) -> 810 frames */}
      <Sequence from={1800} durationInFrames={810}>
        <Scene3Deliverables />
      </Sequence>

      {/* Scene 4: Built by Practitioners, for Practitioners (1:27 - 1:44) -> 510 frames */}
      <Sequence from={2610} durationInFrames={510}>
        <Scene4Practitioners />
      </Sequence>

      {/* Scene 5: Call to Action (1:44 - 2:00) -> 480 frames */}
      <Sequence from={3120} durationInFrames={480}>
        <Scene5CallToAction />
      </Sequence>
    </div>
  )
}
