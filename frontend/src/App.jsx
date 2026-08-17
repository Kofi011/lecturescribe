import './App.css'

/**
 * App.jsx — root component.
 * Phase 1: minimal skeleton to confirm the app boots.
 * Actual pages/routing wired up in Phase 2+.
 */
function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {/* Wordmark — italic serif per DESIGN.md */}
      <span className="wordmark text-4xl mb-4">LectureScribe</span>
      <p className="text-gray-500 text-sm">Phase 1 — project skeleton running ✓</p>
    </div>
  )
}

export default App
