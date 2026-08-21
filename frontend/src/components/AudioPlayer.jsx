/**
 * AudioPlayer.jsx — Minimalist Black & White Lecture Audio Player
 * Strictly adheres to DESIGN.md (pill buttons, high-contrast, clean typography).
 */

import { useState, useRef, useEffect } from 'react'

export default function AudioPlayer({ audioUrl, fileName, durationSec, onTimeUpdate }) {
  const audioRef = useRef(null)
  const progressBarRef = useRef(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(durationSec || 0)
  const [playbackRate, setPlaybackRate] = useState(1.0)
  const [isMuted, setIsMuted] = useState(false)

  const SPEEDS = [1.0, 1.25, 1.5, 2.0]

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => {
      setCurrentTime(audio.currentTime)
      onTimeUpdate?.(audio.currentTime)
    }

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration)
      }
    }

    const handleEnded = () => {
      setIsPlaying(false)
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [onTimeUpdate])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play().then(() => setIsPlaying(true)).catch((e) => console.warn('Audio play error:', e))
    }
  }

  const cycleSpeed = () => {
    const currentIndex = SPEEDS.indexOf(playbackRate)
    const nextSpeed = SPEEDS[(currentIndex + 1) % SPEEDS.length]
    setPlaybackRate(nextSpeed)
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed
    }
  }

  const skipSeconds = (seconds) => {
    if (!audioRef.current) return
    const newTime = Math.max(0, Math.min(audioRef.current.currentTime + seconds, duration))
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleSeek = (e) => {
    if (!progressBarRef.current || !audioRef.current || !duration) return
    const rect = progressBarRef.current.getBoundingClientRect()
    const clickPos = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    const percentage = clickPos / rect.width
    const newTime = percentage * duration
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const toggleMute = () => {
    if (!audioRef.current) return
    audioRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '0:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="bg-white border border-neutral-200/90 rounded-[28px] p-6 shadow-sm mb-8 space-y-4">
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="metadata"
        />
      )}

      {/* Top Details & Speed control */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="pill-badge text-[10px] bg-black text-white">LECTURE AUDIO</span>
          {fileName && (
            <span className="text-xs font-semibold text-neutral-600 truncate max-w-xs sm:max-w-md">
              {fileName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Playback speed pill */}
          <button
            onClick={cycleSpeed}
            className="px-3 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-800 hover:bg-black hover:text-white transition-colors cursor-pointer"
            title="Cycle playback speed"
          >
            {playbackRate.toFixed(playbackRate === 1 ? 0 : 2).replace(/\.00$/, '')}x Speed
          </button>

          {/* Mute button */}
          <button
            onClick={toggleMute}
            className="p-1.5 rounded-full text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            <span className="text-xs">{isMuted ? '🔇' : '🔊'}</span>
          </button>
        </div>
      </div>

      {/* Progress Bar / Scrubber */}
      <div className="space-y-1.5">
        <div
          ref={progressBarRef}
          onClick={handleSeek}
          className="relative w-full h-3 bg-neutral-100 rounded-full cursor-pointer overflow-hidden group hover:h-3.5 transition-all"
        >
          <div
            className="absolute top-0 left-0 h-full bg-black rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Timestamps */}
        <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-400 px-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Playback Controls Toolbar */}
      <div className="flex items-center justify-center gap-3 pt-1">
        <button
          onClick={() => skipSeconds(-10)}
          className="btn-secondary text-xs px-3.5 py-1.5 rounded-full"
          title="Rewind 10 seconds"
        >
          ↺ -10s
        </button>

        <button
          onClick={togglePlay}
          className="btn-primary text-xs px-6 py-2.5 flex items-center gap-2 rounded-full shadow-sm"
        >
          <span>{isPlaying ? '⏸' : '▶'}</span>
          <span>{isPlaying ? 'Pause Lecture' : 'Play Lecture'}</span>
        </button>

        <button
          onClick={() => skipSeconds(10)}
          className="btn-secondary text-xs px-3.5 py-1.5 rounded-full"
          title="Forward 10 seconds"
        >
          +10s ↻
        </button>
      </div>
    </div>
  )
}
