/**
 * LandingPage.jsx — Full-page experience with continuous flowing spline waveforms
 */

import { useRef } from 'react'
import Nav              from '../components/Nav'
import HeroSection      from '../components/HeroSection'
import HowItWorks       from '../components/HowItWorks'
import DarkHeroCard     from '../components/DarkHeroCard'
import ContactSection   from '../components/ContactSection'
import Footer           from '../components/Footer'
import AnimatedWaveform from '../components/AnimatedWaveform'

export default function LandingPage({
  onUpload,
  onNavigate,
  currentUser,
  onLogout,
  onOpenInfo,
  onSelectExample,
  onOpenWorkspaceModal,
}) {
  const contactRef    = useRef(null)
  const howItWorksRef = useRef(null)

  const scrollToContact    = () => contactRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const scrollToHowItWorks = () => howItWorksRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div className="min-h-screen relative flex flex-col bg-white selection:bg-black selection:text-white overflow-x-hidden">
      {/* Full-viewport flowing wave ribbon background */}
      <AnimatedWaveform />

      {/* Clean Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm">
        <Nav
          currentPage="landing"
          onNavigate={onNavigate}
          currentUser={currentUser}
          onLogout={onLogout}
          onOpenWorkspaceModal={onOpenWorkspaceModal}
        />
      </header>

      <main className="flex-1 relative z-10">
        {/* 1. Hero Section (with contained marquee above headline) */}
        <HeroSection
          onUploadClick={() => onNavigate('trial')}
          onExampleClick={onSelectExample}
          onOpenInfo={onOpenInfo}
          onOpenMenu={() => onOpenWorkspaceModal('lectures')}
        />

        {/* 2. Feature Section: "Three things, done properly." */}
        <HowItWorks
          sectionRef={howItWorksRef}
          onExploreFeature={(actionKey) => {
            if (actionKey === 'topics') {
              onOpenWorkspaceModal('topics')
            } else {
              onOpenInfo(actionKey)
            }
          }}
        />

        {/* 3. Dark Hero Card: "Studying with an AI scribe?" */}
        <DarkHeroCard
          onGetStarted={() => onNavigate('trial')}
          onSeeExample={onSelectExample}
        />

        {/* 4. Contact & Inquiries Section */}
        <ContactSection
          sectionRef={contactRef}
        />
      </main>

      {/* 5. Minimal Footer */}
      <Footer onOpenInfo={onOpenInfo} />
    </div>
  )
}
