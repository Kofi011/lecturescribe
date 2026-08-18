/**
 * AnimatedWaveform.jsx — Elegant flowing curly spline waveforms
 * Strictly contained within the left and right outer margins to avoid overlapping text.
 */

export default function AnimatedWaveform({ side = 'left' }) {
  const isLeft = side === 'left'

  return (
    <div
      className={[
        'absolute top-1/2 -translate-y-1/2 w-[110px] sm:w-[150px] md:w-[190px] lg:w-[220px] h-[520px] md:h-[620px] pointer-events-none select-none z-0 overflow-hidden',
        isLeft ? 'left-0 sm:left-1 md:left-3 lg:left-6' : 'right-0 sm:right-1 md:right-3 lg:right-6',
      ].join(' ')}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 200 620"
        fill="none"
        className={`w-full h-full ${isLeft ? 'animate-flowing-wave' : 'animate-flowing-wave-delayed'}`}
      >
        <defs>
          <linearGradient id={`outer-wave-${side}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.38" />
            <stop offset="50%" stopColor="#000000" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.10" />
          </linearGradient>
        </defs>

        {/* 6 gracefully curved lines restricted to the side gutter */}
        {[15, 45, 75, 105, 135, 165].map((offset, i) => {
          const xStart = isLeft ? offset : 200 - offset
          const cp1x   = isLeft ? offset + 35 : 200 - (offset + 35)
          const cp1y   = 160
          const cp2x   = isLeft ? Math.max(10, offset - 35) : Math.min(190, 200 - (offset - 35))
          const cp2y   = 360
          const xEnd   = isLeft ? offset + 15 : 200 - (offset + 15)

          return (
            <path
              key={i}
              d={`M${xStart},0 C${cp1x},${cp1y} ${cp2x},${cp2y} ${xEnd},620`}
              stroke={`url(#outer-wave-${side})`}
              strokeWidth={1.4 + (i % 2) * 0.3}
              strokeLinecap="round"
              className="transition-all duration-300"
              style={{
                animation: `flowWave ${9 + i * 1.5}s ease-in-out infinite alternate`,
                transformOrigin: 'center center',
              }}
            />
          )
        })}
      </svg>
    </div>
  )
}
