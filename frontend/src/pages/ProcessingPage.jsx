/**
 * ProcessingPage.jsx — dark rounded hero card showing live processing stages
 *
 * Per DESIGN.md / ARCHITECTURE.md:
 *   Dark rounded card on a white page, white headline
 *   Status stages: ✓ done  ●  in progress  ○ pending  ✗ error
 *
 * Stages:
 *   uploaded    → Transcribing → Summarizing → Complete (or Error)
 *
 * Props:
 *   stage: 'uploaded' | 'transcribing' | 'summarizing' | 'complete' | 'error'
 *   error: string | null  — specific error message when stage === 'error'
 */

import Nav from '../components/Nav'

// Stage definitions — order matters
const STAGES = [
  { key: 'uploaded',     label: 'Audio uploaded' },
  { key: 'transcribing', label: 'Transcribing lecture…' },
  { key: 'summarizing',  label: 'Generating notes…' },
  { key: 'complete',     label: 'Complete' },
]

const STAGE_ORDER = STAGES.map((s) => s.key)

function StageIcon({ status }) {
  if (status === 'done') {
    return (
      <span className="text-white font-bold text-base leading-none select-none" aria-label="Done">
        ✓
      </span>
    )
  }
  if (status === 'active') {
    return (
      <span
        className="block w-3 h-3 rounded-full bg-white animate-pulse select-none"
        aria-label="In progress"
      />
    )
  }
  if (status === 'error') {
    return (
      <span className="text-white font-bold text-base leading-none select-none" aria-label="Error">
        ✗
      </span>
    )
  }
  // pending
  return (
    <span
      className="block w-3 h-3 rounded-full border-2 border-white/30 select-none"
      aria-label="Pending"
    />
  )
}

export default function ProcessingPage({ stage, error, onRetry }) {
  const currentIdx = STAGE_ORDER.indexOf(stage)
  const isError    = stage === 'error'

  // Determine status for each row
  function getStatus(stageKey, idx) {
    if (isError) {
      // Mark the active stage as error, prior stages as done, later as pending
      if (idx < currentIdx)  return 'done'
      if (idx === currentIdx) return 'error'
      return 'pending'
    }
    if (idx < currentIdx)   return 'done'
    if (idx === currentIdx) return stage === 'complete' ? 'done' : 'active'
    return 'pending'
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100">
        <Nav />
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        {/* Dark rounded hero card per DESIGN.md */}
        <div
          className="card-dark w-full max-w-lg"
          role="status"
          aria-live="polite"
          aria-label={`Processing stage: ${stage}`}
        >
          {/* Headline */}
          <h1 className="text-3xl md:text-4xl font-black text-white mb-10 tracking-tight">
            {isError
              ? 'Something went wrong.'
              : stage === 'complete'
              ? 'Done.'
              : 'Processing your lecture.'}
          </h1>

          {/* Stage list */}
          <ol className="space-y-5">
            {STAGES.map(({ key, label }, idx) => {
              const status = getStatus(key, idx)
              return (
                <li
                  key={key}
                  className={[
                    'flex items-center gap-4 text-base transition-opacity duration-300',
                    status === 'pending' ? 'opacity-30' : 'opacity-100',
                  ].join(' ')}
                >
                  <span className="w-5 h-5 flex items-center justify-center shrink-0">
                    <StageIcon status={status} />
                  </span>
                  <span className={status === 'active' ? 'text-white font-semibold' : 'text-white/80'}>
                    {label}
                  </span>
                </li>
              )
            })}
          </ol>

          {/* Error details */}
          {isError && error && (
            <div className="mt-8 border border-white/20 rounded-card p-4 text-sm text-white/80 leading-relaxed">
              {error}
            </div>
          )}

          {/* Retry button (error state only) */}
          {isError && onRetry && (
            <button
              onClick={onRetry}
              className="mt-8 w-full inline-flex items-center justify-center px-6 py-3 bg-white text-black font-semibold rounded-pill hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Try again
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
