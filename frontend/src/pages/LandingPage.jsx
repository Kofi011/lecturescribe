/**
 * LandingPage.jsx — Assembles the complete SasuSync-inspired experience
 */

import { useRef } from 'react'
import Nav          from '../components/Nav'
import HeroSection  from '../components/HeroSection'
import HowItWorks   from '../components/HowItWorks'
import DarkHeroCard from '../components/DarkHeroCard'
import UploadCard   from '../components/UploadCard'
import Footer       from '../components/Footer'

export default function LandingPage({ onUpload }) {
  const uploadRef     = useRef(null)
  const howItWorksRef = useRef(null)

  const scrollToUpload  = () => uploadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const scrollToExample = () => howItWorksRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div className="min-h-screen flex flex-col bg-white selection:bg-black selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md">
        <Nav />
      </header>

      <main className="flex-1">
        {/* 1. Hero Section (Image 4 style) */}
        <HeroSection
          onUploadClick={scrollToUpload}
          onExampleClick={scrollToExample}
        />

        {/* 2. Feature Section: "Three things, done properly." (Image 2 style) */}
        <HowItWorks sectionRef={howItWorksRef} />

        {/* 3. Dark Hero Card: "Studying with an AI scribe?" (Image 1 style) */}
        <DarkHeroCard
          onGetStarted={scrollToUpload}
          onSeeExample={scrollToExample}
        />

        {/* 4. Upload Card Studio */}
        <UploadCard
          cardRef={uploadRef}
          onSubmit={onUpload}
        />
      </main>

      {/* 5. Minimal Footer */}
      <Footer />
    </div>
  )
}
