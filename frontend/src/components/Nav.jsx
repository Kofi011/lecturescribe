/**
 * Nav.jsx — Navigation bar with interactive Menu Drawer and Sub-Nav Ticker
 * Requirement 2: Every Clickable Element Must Produce a Relevant Result
 * Requirement 3: Do not expose underlying transcription vendor technology
 */

import { useState } from 'react'

export default function Nav({ onOpenMenu, onOpenInfo, onGoHome }) {
  return (
    <div className="w-full">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-6 md:px-12">
        {/* Wordmark Logo */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-1 group select-none text-left cursor-pointer"
          title="Return to Home"
        >
          <span className="font-serif text-3xl md:text-4xl italic text-black font-normal tracking-tight">
            LectureScribe
          </span>
          <sup className="text-xs font-sans font-bold text-black -top-2">®</sup>
        </button>

        {/* Action Menu button */}
        <button
          onClick={onOpenMenu}
          className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2"
          aria-label="Open Workspace Menu"
        >
          <span>Menu</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="2,8 6,4 10,8" />
          </svg>
        </button>
      </nav>

      {/* Interactive Ticker Bar — Clicking any tag opens relevant specs/tools */}
      <div className="border-y border-neutral-100 bg-neutral-50/70 py-2.5 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-neutral-500 font-medium">
          <button
            onClick={() => onOpenInfo('format_intelligence')}
            className="shrink-0 font-semibold text-black flex items-center gap-2 hover:underline cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Speech Intelligence
          </button>
          <div className="flex items-center gap-6 md:gap-10 overflow-x-auto no-scrollbar whitespace-nowrap pl-6">
            <button
              onClick={() => onOpenInfo('format_mp3')}
              className="text-neutral-800 font-semibold hover:text-black hover:underline cursor-pointer"
            >
              MP3 Audio
            </button>
            <button
              onClick={() => onOpenInfo('format_wav')}
              className="hover:text-black hover:underline cursor-pointer"
            >
              WAV Lossless
            </button>
            <button
              onClick={() => onOpenInfo('format_m4a')}
              className="text-neutral-800 font-semibold hover:text-black hover:underline cursor-pointer"
            >
              M4A Apple Audio
            </button>
            <button
              onClick={() => onOpenInfo('format_markdown')}
              className="hover:text-black hover:underline cursor-pointer"
            >
              Structured Markdown
            </button>
            <button
              onClick={() => onOpenMenu('topics')}
              className="text-neutral-800 font-semibold hover:text-black hover:underline cursor-pointer"
            >
              Concept Explorer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
