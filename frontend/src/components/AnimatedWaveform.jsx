/**
 * AnimatedWaveform.jsx — Highly visible, elegant flowing curly spline waveforms
 * Positioned in left and right margins with smooth continuous wave motion.
 */

export default function AnimatedWaveform({ side = 'left' }) {
  const isLeft = side === 'left'

  return (
    <div
      className={[
        'absolute top-1/2 -translate-y-1/2 w-[260px] md:w-[320px] lg:w-[380px] h-[580px] md:h-[680px] pointer-events-none select-none z-0 transition-opacity duration-700',
        isLeft ? 'left-0 md:left-2 lg:left-6' : 'right-0 md:right-2 lg:right-6',
      ].join(' ')}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 320 680"
        fill="none"
        className={`w-full h-full ${isLeft ? 'animate-flowing-wave' : 'animate-flowing-wave-delayed'}`}
      >
        <defs>
          <linearGradient id={`visible-wave-${side}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#000000" stopOpacity="0.30" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {/* 8 distinct, clearly visible flowing curved lines */}
        {[20, 55, 90, 125, 160, 195, 230, 265].map((offset, i) => {
          const xStart = isLeft ? offset : 320 - offset
          const cp1x   = isLeft ? offset + 90 : 320 - (offset + 90)
          const cp1y   = 170
          const cp2x   = isLeft ? offset - 60 : 320 - (offset - 60)
          const cp2y   = 380
          const xEnd   = isLeft ? offset + 30 : 320 - (offset + 30)

          return (
            <path
              key={i}
              d={`M${xStart},0 C${cp1x},${cp1y} ${cp2x},${cp2y} ${xEnd},680`}
              stroke={`url(#visible-wave-${side})`}
              strokeWidth={1.5 + (i % 3) * 0.3}
              strokeLinecap="round"
              className="transition-all duration-300"
              style={{
                animation: `flowWave ${8 + i * 1.5}s ease-in-out infinite alternate`,
                transformOrigin: 'center center',
              }}
            />
          )
        })}
      </svg>
    </div>
  )
}
