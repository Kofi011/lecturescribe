/**
 * AnimatedWaveform.jsx — Full-page flowing curly spline waveforms
 * Requirements:
 *   1. Increased pace / dynamic flowing motion
 *   2. Spans throughout the entire page with gentle, slight transparency
 *   3. Visible at the top through the transparent marquee container & nav
 */

export default function AnimatedWaveform({ side = 'left' }) {
  const isLeft = side === 'left'

  return (
    <div
      className={[
        'fixed inset-y-0 w-[100px] sm:w-[130px] md:w-[160px] lg:w-[200px] pointer-events-none select-none z-0 overflow-hidden',
        isLeft ? 'left-0' : 'right-0',
      ].join(' ')}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 200 1200"
        preserveAspectRatio="none"
        fill="none"
        className={`w-full h-full ${isLeft ? 'animate-flowing-wave' : 'animate-flowing-wave-delayed'}`}
      >
        <defs>
          <linearGradient id={`fullpage-wave-${side}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.25" />
            <stop offset="30%" stopColor="#000000" stopOpacity="0.20" />
            <stop offset="70%" stopColor="#000000" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.22" />
          </linearGradient>
        </defs>

        {/* 6 full-height organic flowing spline paths */}
        {[15, 45, 75, 105, 135, 165].map((offset, i) => {
          const xStart = isLeft ? offset : 200 - offset
          const cp1x   = isLeft ? offset + 35 : 200 - (offset + 35)
          const cp2x   = isLeft ? Math.max(8, offset - 30) : Math.min(192, 200 - (offset - 30))
          const cp3x   = isLeft ? offset + 25 : 200 - (offset + 25)
          const cp4x   = isLeft ? Math.max(8, offset - 25) : Math.min(192, 200 - (offset - 25))
          const xEnd   = isLeft ? offset + 10 : 200 - (offset + 10)

          return (
            <path
              key={i}
              d={`M${xStart},0 C${cp1x},250 ${cp2x},500 ${cp3x},750 C${cp4x},950 ${xEnd},1100 ${xEnd},1200`}
              stroke={`url(#fullpage-wave-${side})`}
              strokeWidth={1.3 + (i % 2) * 0.3}
              strokeLinecap="round"
              className="transition-all duration-300"
              style={{
                animation: `flowWaveFast ${3.8 + i * 0.4}s ease-in-out infinite alternate`,
                transformOrigin: 'center center',
              }}
            />
          )
        })}
      </svg>
    </div>
  )
}
