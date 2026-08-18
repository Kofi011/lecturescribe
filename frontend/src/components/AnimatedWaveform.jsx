/**
 * AnimatedWaveform.jsx — Full-page flowing curly spline waveforms (calibrated subtle visibility)
 */

export default function AnimatedWaveform({ side = 'left' }) {
  const isLeft = side === 'left'

  return (
    <div
      className={[
        'fixed inset-y-0 w-[110px] sm:w-[140px] md:w-[180px] lg:w-[220px] pointer-events-none select-none z-0 overflow-hidden',
        isLeft ? 'left-0' : 'right-0',
      ].join(' ')}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 220 1200"
        preserveAspectRatio="none"
        fill="none"
        className={`w-full h-full ${isLeft ? 'animate-flowing-wave' : 'animate-flowing-wave-delayed'}`}
      >
        <defs>
          <linearGradient id={`fullpage-wave-${side}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.36" />
            <stop offset="25%" stopColor="#000000" stopOpacity="0.28" />
            <stop offset="60%" stopColor="#000000" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.30" />
          </linearGradient>
        </defs>

        {/* 6 full-height organic flowing spline paths with refined subtle line weight */}
        {[18, 52, 86, 120, 154, 188].map((offset, i) => {
          const xStart = isLeft ? offset : 220 - offset
          const cp1x   = isLeft ? offset + 35 : 220 - (offset + 35)
          const cp2x   = isLeft ? Math.max(8, offset - 30) : Math.min(212, 220 - (offset - 30))
          const cp3x   = isLeft ? offset + 25 : 220 - (offset + 25)
          const cp4x   = isLeft ? Math.max(8, offset - 25) : Math.min(212, 220 - (offset - 25))
          const xEnd   = isLeft ? offset + 10 : 220 - (offset + 10)

          return (
            <path
              key={i}
              d={`M${xStart},0 C${cp1x},250 ${cp2x},500 ${cp3x},750 C${cp4x},950 ${xEnd},1100 ${xEnd},1200`}
              stroke={`url(#fullpage-wave-${side})`}
              strokeWidth={1.4 + (i % 2) * 0.3}
              strokeLinecap="round"
              className="transition-all duration-300"
              style={{
                animation: `flowWaveFast ${3.6 + i * 0.4}s ease-in-out infinite alternate`,
                transformOrigin: 'center center',
              }}
            />
          )
        })}
      </svg>
    </div>
  )
}
