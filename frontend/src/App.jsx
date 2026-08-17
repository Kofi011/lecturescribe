/**
 * App.jsx — root component with simple page state machine
 *
 * Pages:
 *   landing    → LandingPage (Phase 2)
 *   processing → ProcessingPage (Phase 6)
 *   results    → ResultsPage (Phase 5)
 *
 * Phase 2: only 'landing' is rendered; the other pages are stubs
 * wired up in later phases.
 */

import './App.css'
import { useState } from 'react'
import LandingPage from './pages/LandingPage'

export default function App() {
  // Page state: 'landing' | 'processing' | 'results'
  const [page, setPage]         = useState('landing')
  // Result data passed from upload → results page
  const [result, setResult]     = useState(null)

  /** Called when upload succeeds — in Phase 3 will switch to processing/results */
  const handleUploadSuccess = (data) => {
    // Phase 2: data is a stub validation response
    // Phase 3+: will set page to 'processing' then 'results' with real transcript/notes
    console.log('[app] upload validated:', data)
    // Future: setPage('processing')
    //         setResult(data)
  }

  if (page === 'landing') {
    return <LandingPage onUploadSuccess={handleUploadSuccess} />
  }

  // Stubs — replaced in Phase 5 & 6
  if (page === 'processing') {
    return <div className="min-h-screen flex items-center justify-center"><p>Processing… (Phase 6)</p></div>
  }

  if (page === 'results') {
    return <div className="min-h-screen flex items-center justify-center"><p>Results (Phase 5)</p></div>
  }

  return null
}
