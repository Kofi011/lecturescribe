/**
 * AboutPage.jsx — Static About & Mission Page per DESIGN.md
 */

import Nav from '../components/Nav'
import Footer from '../components/Footer'
import AnimatedWaveform from '../components/AnimatedWaveform'

export default function AboutPage({
  onNavigate,
  currentUser,
  onLogout,
  onOpenInfo,
  onOpenWorkspaceModal,
}) {
  return (
    <div className="min-h-screen relative flex flex-col bg-white selection:bg-black selection:text-white overflow-x-hidden">
      {/* Spline waveforms below header */}
      <AnimatedWaveform />

      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-neutral-100">
        <Nav
          currentPage="about"
          onNavigate={onNavigate}
          currentUser={currentUser}
          onLogout={onLogout}
          onOpenWorkspaceModal={onOpenWorkspaceModal}
        />
      </header>

      <main className="flex-1 relative z-10 max-w-5xl mx-auto px-6 py-12 md:py-20 space-y-16">
        {/* 1. Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-6">
          <span className="pill-badge text-xs">ABOUT LECTURESCRIBE</span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-black tracking-tight leading-[1.08]">
            Smarter lecture notes, built for{' '}
            <span className="font-serif italic font-normal text-[1.12em] tracking-tight inline-block pr-1">
              students.
            </span>
          </h1>
          <p className="text-neutral-600 text-base sm:text-lg leading-relaxed font-normal">
            University students record or receive hours of lecture audio each week, but rarely re-listen because it takes too long. LectureScribe removes that friction by transforming complex spoken lectures into structured study outlines, terminology glossaries, and interactive revision questions in minutes.
          </p>

          <div className="flex items-center justify-center gap-4 pt-4 flex-wrap">
            <button
              onClick={() => onNavigate('trial')}
              className="btn-primary text-sm px-8 py-4 shadow-sm"
            >
              Try 3 free lectures
            </button>
            <button
              onClick={() => onNavigate('auth')}
              className="btn-secondary text-sm px-8 py-4"
            >
              Create an account
            </button>
          </div>
        </section>

        {/* 2. Three Core Architectural Pillars */}
        <section className="space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
              Three things, built properly.
            </h2>
            <p className="text-neutral-500 text-sm mt-2 font-normal">
              Engineered specifically for academic speech, accented audio, and rapid exam preparation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pillar 1 */}
            <div className="card-white flex flex-col justify-between hover:border-black transition-all">
              <div>
                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm mb-4">
                  01
                </div>
                <h3 className="font-bold text-lg text-black mb-2">
                  Adaptive Speech Intelligence
                </h3>
                <p className="text-neutral-600 text-sm leading-relaxed font-normal">
                  Intelligently processes audio through an advanced <strong>Acoustic Neural Pipeline</strong>, preserving maximum transcription fidelity across global accents, varied classroom acoustics, and fast lecture speech.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-100 text-xs font-semibold text-neutral-400">
                Speech Intelligence
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="card-white flex flex-col justify-between hover:border-black transition-all">
              <div>
                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm mb-4">
                  02
                </div>
                <h3 className="font-bold text-lg text-black mb-2">
                  Semantic Study Synthesis
                </h3>
                <p className="text-neutral-600 text-sm leading-relaxed font-normal">
                  Rather than a wall of raw text, transcripts are parsed into hierarchical markdown study notes, highlighted key arguments, and a dedicated terminology glossary.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-100 text-xs font-semibold text-neutral-400">
                Structured Knowledge
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="card-white flex flex-col justify-between hover:border-black transition-all">
              <div>
                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm mb-4">
                  03
                </div>
                <h3 className="font-bold text-lg text-black mb-2">
                  Grounded AI Academic Tutor
                </h3>
                <p className="text-neutral-600 text-sm leading-relaxed font-normal">
                  Ask questions, clarify complex theorems, and self-test with an AI tutor strictly grounded in the verbatim content of your recorded lecture.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-100 text-xs font-semibold text-neutral-400">
                Interactive Learning
              </div>
            </div>
          </div>
        </section>

        {/* 3. Dark Hero Statement Card per DESIGN.md */}
        <section className="card-dark text-center space-y-6">
          <span className="pill-badge bg-white/10 text-white text-[11px]">OUR PHILOSOPHY</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            Study without the{' '}
            <span className="font-serif italic font-normal text-[1.12em] text-white">
              friction.
            </span>
          </h2>
          <p className="text-neutral-400 text-base max-w-2xl mx-auto leading-relaxed font-normal">
            We believe technology should quietly get out of the way. No ad banners, no bloated dashboards, and no confusing tiers. Just upload your lecture and get straight to studying.
          </p>

          <div className="pt-2 flex justify-center">
            <button
              onClick={() => onNavigate('trial')}
              className="btn-white text-sm px-8 py-3.5"
            >
              Start learning now →
            </button>
          </div>
        </section>
      </main>

      <Footer onOpenInfo={onOpenInfo} />
    </div>
  )
}
