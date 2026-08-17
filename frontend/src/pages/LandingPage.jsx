/**
 * LandingPage.jsx — assembles the full landing page
 *
 * Layout (per DESIGN.md alternating light/dark sections):
 *   Nav         — sticky top bar
 *   HeroSection — light bg, headline + CTA buttons
 *   HowItWorks  — DARK bg, 3-card feature row
 *   UploadCard  — light bg, file picker card
 *   Footer      — minimal border-top row
 */

import { useRef } from 'react'
import Nav          from '../components/Nav'
import HeroSection  from '../components/HeroSection'
import HowItWorks   from '../components/HowItWorks'
import UploadCard   from '../components/UploadCard'
import Footer       from '../components/Footer'

export default function LandingPage({ onUpload }) {
  const uploadRef     = useRef(null)
  const howItWorksRef = useRef(null)

  const scrollToUpload  = () => uploadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const scrollToExample = () => howItWorksRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100">
        <Nav />
      </header>

      <main className="flex-1">
        <HeroSection
          onUploadClick={scrollToUpload}
          onExampleClick={scrollToExample}
        />
        <HowItWorks sectionRef={howItWorksRef} />
        <UploadCard
          cardRef={uploadRef}
          onSubmit={onUpload}
        />
      </main>

      <Footer />
    </div>
  )
}
