/**
 * LandingPage.jsx — Full-page experience with continuous flowing spline waveforms
 * Requirements:
 *   1. Faster animation pace
 *   2. Spline lines visible throughout entire page (from top to bottom)
 *   3. Motion clearly visible behind transparent marquee & nav
 */

import { useRef } from 'react'
import Nav              from '../components/Nav'
import HeroSection      from '../components/HeroSection'
import HowItWorks       from '../components/HowItWorks'
import DarkHeroCard     from '../components/DarkHeroCard'
import UploadCard       from '../components/UploadCard'
import Footer           from '../components/Footer'
import AnimatedWaveform from '../components/AnimatedWaveform'

export default function LandingPage({
  onUpload,
  onOpenMenu,
  onOpenInfo,
  onSelectExample,
}) {
  const uploadRef     = useRef(null)
  const howItWorksRef = useRef(null)

  const scrollToUpload     = () => uploadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const scrollToHowItWorks = () => howItWorksRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div className="min-h-screen relative flex flex-col bg-white selection:bg-black selection:text-white overflow-x-hidden">
      {/* Full-page continuous flowing spline waveforms along left & right margins */}
      <AnimatedWaveform side="left" />
      <AnimatedWaveform side="right" />

      {/* Clean Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm">
        <Nav
          onOpenMenu={onOpenMenu}
          onGoHome={scrollToUpload}
        />
      </header>

      <main className="flex-1 relative z-10">
        {/* 1. Hero Section (with contained marquee above headline) */}
        <HeroSection
          onUploadClick={scrollToUpload}
          onExampleClick={onSelectExample}
          onOpenInfo={onOpenInfo}
          onOpenMenu={onOpenMenu}
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
