/**
 * ProcessingPage.jsx — Dark rounded container matching SasuSync Image 1
 */

import Nav from '../components/Nav'

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
        className="block w-2.5 h-2.5 rounded-full bg-white animate-pulse select-none"
        aria-label="In progress"
      />
    )
  }
  if (status === 'error') {
    return (
      <span className="text-red-400 font-bold text-base leading-none select-none" aria-label="Error">
        ✕
      </span>
    )
  }
  return (
    <span
      className="block w-2.5 h-2.5 rounded-full border border-neutral-600 select-none"
      aria-label="Pending"
    />
  )
}

export default function ProcessingPage({ stage, error, onRetry }) {
  const currentIdx = STAGE_ORDER.indexOf(stage)
  const isError    = stage === 'error'

  function getStatus(stageKey, idx) {
    if (isError) {
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
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-100">
        <Nav />
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div
          className="card-dark w-full max-w-xl"
          role="status"
          aria-live="polite"
        >
          {/* Headline with italic serif accent */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-10 tracking-tight leading-tight">
            {isError ? (
              <>Something went <span className="font-serif italic font-normal text-[1.12em]">wrong.</span></>
            ) : stage === 'complete' ? (
              <>All <span className="font-serif italic font-normal text-[1.12em]">done.</span></>
            ) : (
              <>Processing your <span className="font-serif italic font-normal text-[1.12em]">lecture.</span></>
            )}
          </h1>

          {/* Status Stage List */}
          <ol className="space-y-6">
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
                  <span className={status === 'active' ? 'text-white font-semibold' : 'text-neutral-300 font-normal'}>
                    {label}
                  </span>
                </li>
              )
            })}
          </ol>

          {/* Error Details */}
          {isError && error && (
            <div className="mt-8 border border-neutral-800 bg-neutral-900/50 rounded-[20px] p-5 text-sm text-neutral-300 leading-relaxed font-normal">
              {error}
            </div>
          )}

          {/* Retry Button */}
          {isError && onRetry && (
            <button
              onClick={onRetry}
              className="mt-8 w-full btn-white"
            >
              Try again
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
