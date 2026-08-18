/**
 * HeroSection.jsx — Hero section with continuous animated waveform motion and interactive actions
 * Requirement 1: Animated Curly Line / Visual Motion
 * Requirement 2: Every Clickable Element Must Produce a Relevant Result
 */

import AnimatedWaveform from './AnimatedWaveform'

export default function HeroSection({ onUploadClick, onExampleClick }) {
  return (
    <section className="relative text-center px-6 pt-20 pb-16 md:pt-28 md:pb-24 overflow-hidden">
      {/* Requirement 1: Animated flowing spline waveform motion */}
      <AnimatedWaveform side="left" />
      <AnimatedWaveform side="right" />

      <div className="relative max-w-4xl mx-auto z-10">
        {/* Main Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-black tracking-tight leading-[1.04] mb-8">
          Turn your lecture into{' '}
          <span className="font-serif italic font-normal text-[1.12em] tracking-tight inline-block pr-1">
            notes.
          </span>
        </h1>

        {/* Subtext */}
        <p className="text-neutral-500 text-lg md:text-xl font-normal mb-12 max-w-2xl mx-auto leading-relaxed">
          Upload any lecture recording and get a full transcript, structured study
          notes, key concepts, and revision questions in seconds.
        </p>

        {/* Call to action buttons */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button
            id="hero-upload-btn"
            onClick={onUploadClick}
            className="btn-primary text-base px-8 py-4 shadow-md"
          >
            Upload a lecture
          </button>

          <button
            id="hero-example-btn"
            onClick={onExampleClick}
            className="inline-flex items-center gap-3 px-6 py-3.5 bg-neutral-100/90 hover:bg-neutral-200/80 text-black text-sm font-semibold rounded-full border border-neutral-200/80 transition-all select-none cursor-pointer shadow-sm"
          >
            <span className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-xs">
              &lt;/&gt;
            </span>
            <div className="text-left flex flex-col">
              <span className="font-bold text-xs text-neutral-900 leading-tight">See an example</span>
              <span className="text-[11px] text-neutral-500 font-normal flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> CS 101 Lecture Notes
              </span>
            </div>
          </button>
        </div>
      </div>
    </section>
  )
}
