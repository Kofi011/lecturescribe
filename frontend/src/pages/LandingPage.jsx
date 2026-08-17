/**
 * LandingPage.jsx — assembles the full landing page
 *
 * Layout (per DESIGN.md alternating light/dark sections):
 *   Nav       — sticky top bar
 *   HeroSection  — light bg, headline + CTA buttons
 *   HowItWorks   — DARK bg, 3-card feature row
 *   UploadCard   — light bg, the file-picker card
 *   Footer       — minimal border-top row
 */

import { useRef } from 'react'
import Nav from '../components/Nav'
import HeroSection from '../components/HeroSection'
import HowItWorks from '../components/HowItWorks'
import UploadCard from '../components/UploadCard'
import Footer from '../components/Footer'

export default function LandingPage({ onUploadSuccess }) {
  const uploadRef = useRef(null)
  const howItWorksRef = useRef(null)

  // Smooth-scroll to the upload card when "Upload a lecture" is clicked
  const scrollToUpload = () => {
    uploadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Smooth-scroll to the how-it-works section for "See an example"
  const scrollToExample = () => {
    howItWorksRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Sticky nav */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100">
        <Nav />
      </header>

      <main className="flex-1">
        {/* Hero: light bg */}
        <HeroSection
          onUploadClick={scrollToUpload}
          onExampleClick={scrollToExample}
        />

        {/* How it works: dark bg */}
        <HowItWorks sectionRef={howItWorksRef} />

        {/* Upload: light bg */}
        <UploadCard
          cardRef={uploadRef}
          onUploadSuccess={onUploadSuccess}
        />
      </main>

      <Footer />
    </div>
  )
}
