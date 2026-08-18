/**
 * AnimatedWaveform.jsx — Continuous, subtle flowing spline waveform motion
 * Requirement 1: The curly line element should not remain static.
 * It gently moves across its path like a flowing signal, waveform, or stream of thought.
 */

import { useEffect, useRef } from 'react'

export default function AnimatedWaveform({ side = 'left' }) {
  const isLeft = side === 'left'

  return (
    <div
      className={[
        'absolute top-1/2 -translate-y-1/2 w-[300px] h-[650px] pointer-events-none select-none overflow-visible transition-opacity duration-700',
        isLeft ? 'left-0 -translate-x-1/3' : 'right-0 translate-x-1/3',
      ].join(' ')}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 300 650"
        fill="none"
        className={`w-full h-full ${isLeft ? 'animate-flowing-wave' : 'animate-flowing-wave-delayed'}`}
      >
        <defs>
          <linearGradient id={`wave-gradient-${side}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.16" />
            <stop offset="50%" stopColor="#000000" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* 7 intertwined continuous organic spline paths */}
        {[30, 65, 100, 135, 170, 205, 240].map((offset, i) => {
          const xStart = isLeft ? offset : 300 - offset
          const cp1x = isLeft ? offset + 70 : 300 - (offset + 70)
          const cp2x = isLeft ? offset - 50 : 300 - (offset - 50)
          const cp3x = isLeft ? offset + 40 : 300 - (offset + 40)
          const xEnd = isLeft ? offset + 10 : 300 - (offset + 10)

          return (
            <path
              key={i}
              d={`M${xStart},0 C${cp1x},160 ${cp2x},320 ${cp3x},480 L${xEnd},650`}
              stroke={`url(#wave-gradient-${side})`}
              strokeWidth={1.2 + (i % 2) * 0.4}
              strokeDasharray="8 4"
              className="transition-all duration-500"
              style={{
                animation: `flowWave ${10 + i * 2}s ease-in-out infinite alternate`,
                transformOrigin: 'center center',
              }}
            />
          )
        })}
      </svg>
    </div>
  )
}
