/**
 * AnimatedWaveform.jsx — Flowing curly spline waveforms along left & right margins
 * Corrected to start below the header path so it never crosses the logo or Menu button.
 */

export default function AnimatedWaveform({ side = 'left' }) {
  const isLeft = side === 'left'

  return (
    <div
      className={[
        'fixed top-[76px] sm:top-[88px] bottom-0 w-[110px] sm:w-[150px] md:w-[190px] lg:w-[230px] pointer-events-none select-none z-0 overflow-hidden',
        isLeft ? 'left-0' : 'right-0',
      ].join(' ')}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 230 1200"
        preserveAspectRatio="none"
        fill="none"
        className={`w-full h-full ${isLeft ? 'animate-flowing-wave' : 'animate-flowing-wave-delayed'}`}
      >
        <defs>
          <linearGradient id={`fullpage-wave-${side}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.32" />
            <stop offset="25%" stopColor="#000000" stopOpacity="0.26" />
            <stop offset="60%" stopColor="#000000" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.28" />
          </linearGradient>
        </defs>

        {/* 6 organic flowing spline paths starting below header and sweeping along the flank */}
        {[18, 52, 86, 120, 154, 188].map((offset, i) => {
          const xStart = isLeft ? offset : 230 - offset
          const cp1x   = isLeft ? offset + 32 : 230 - (offset + 32)
          const cp2x   = isLeft ? Math.max(8, offset - 26) : Math.min(222, 230 - (offset - 26))
          const cp3x   = isLeft ? offset + 22 : 230 - (offset + 22)
          const cp4x   = isLeft ? Math.max(8, offset - 22) : Math.min(222, 230 - (offset - 22))
          const xEnd   = isLeft ? offset + 8 : 230 - (offset + 8)

          return (
            <path
              key={i}
              d={`M${xStart},0 C${cp1x},220 ${cp2x},480 ${cp3x},740 C${cp4x},940 ${xEnd},1080 ${xEnd},1200`}
              stroke={`url(#fullpage-wave-${side})`}
              strokeWidth={1.3 + (i % 2) * 0.3}
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
