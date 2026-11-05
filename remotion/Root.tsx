import React from 'react'
import { Composition } from 'remotion'
import { CapKeynotePresentation } from './CapKeynotePresentation'
import { CommunityIntro } from './CommunityIntro'
import { KeynotePresentation } from './KeynotePresentation'
import { ShortsTemplate } from './ShortsTemplate'
import { UserAuthenticWalkthrough } from './UserAuthenticWalkthrough'

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Option 2: Authentic User Walkthrough (100% Genuine Lip Sync + Mastered Audio + Pauses Removed) */}
      <Composition
        id="UserAuthenticWalkthrough"
        component={UserAuthenticWalkthrough}
        durationInFrames={3466}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Option A: Polished Cap Walkthrough (Real Host Webcam Bubble + Master Voiceover) */}
      <Composition
        id="CapKeynotePresentation"
        component={CapKeynotePresentation}
        durationInFrames={3220}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Approach C: Premium Executive Keynote Walkthrough (Real Site Screenshots + Authentic Voice) */}
      <Composition
        id="KeynotePresentation"
        component={KeynotePresentation}
        durationInFrames={3220}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* 2-Minute Full Community Introduction (Motion Graphics) */}
      <Composition
        id="CommunityIntro"
        component={CommunityIntro}
        durationInFrames={3600}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* 60-Second Neural Short Template (9:16 Vertical) */}
      <Composition
        id="NeuralShortTemplate"
        component={ShortsTemplate as any}
        durationInFrames={1800}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          title: 'Configure Copilot Studio Agent in Dataverse',
          pillar: 'Dataverse & Power Platform',
          lane: 'new',
          pillarColor: '#34D8B0',
          steps: [
            'Create an autonomous agent in Copilot Studio',
            'Bind generative answers directly to Dataverse tables',
            'Enable audit gating and cross-app handoffs',
            'Deploy into Power Apps solutions with ALM pipelines',
          ],
          codeSnippet: `// Dataverse virtual table binding\nconst agent = await copilot.createAgent({\n  grounding: 'Dataverse.Entity.Reconciliation',\n  mode: 'autonomous_audit'\n});`,
        }}
      />
    </>
  )
}
