/**
 * LandingPage.jsx — Interactive Landing Experience with Animated Waveforms & SasuSync Layout
 * Requirement 1: Animated curly line visual motion
 * Requirement 2: Every clickable element produces a relevant result
 * Requirement 3: Internal transcription tech is not exposed
 */

import { useRef } from 'react'
import Nav          from '../components/Nav'
import HeroSection  from '../components/HeroSection'
import HowItWorks   from '../components/HowItWorks'
import DarkHeroCard from '../components/DarkHeroCard'
import UploadCard   from '../components/UploadCard'
import Footer       from '../components/Footer'

export default function LandingPage({
  onUpload,
  onOpenMenu,
  onOpenInfo,
  onSelectExample,
}) {
  const uploadRef     = useRef(null)
  const howItWorksRef = useRef(null)

  const scrollToUpload  = () => uploadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const scrollToHowItWorks = () => howItWorksRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div className="min-h-screen flex flex-col bg-white selection:bg-black selection:text-white">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md">
        <Nav
          onOpenMenu={onOpenMenu}
          onOpenInfo={onOpenInfo}
          onGoHome={scrollToUpload}
        />
      </header>

      <main className="flex-1">
        {/* 1. Hero Section with Animated Waveforms */}
        <HeroSection
          onUploadClick={scrollToUpload}
          onExampleClick={onSelectExample}
        />

        {/* 2. Feature Section: "Three things, done properly." */}
        <HowItWorks
          sectionRef={howItWorksRef}
          onExploreFeature={(actionKey) => {
            if (actionKey === 'topics') {
              onOpenMenu('topics')
            } else {
              onOpenInfo(actionKey)
            }
          }}
        />

        {/* 3. Dark Hero Card: "Studying with an AI scribe?" */}
        <DarkHeroCard
          onGetStarted={scrollToUpload}
          onSeeExample={onSelectExample}
        />

        {/* 4. Studio Upload Card */}
        <UploadCard
          cardRef={uploadRef}
          onSubmit={onUpload}
        />
      </main>

      {/* 5. Minimal Footer */}
      <Footer onOpenInfo={onOpenInfo} />
    </div>
  )
}
