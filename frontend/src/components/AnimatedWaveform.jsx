import { useEffect, useRef } from 'react'

/**
 * AnimatedWaveform.jsx — Silk-like Topographic Wave Mesh Background
 * 
 * Refined per user feedback:
 * - Subdued, calming motion (reduced speed and gentle harmonic amplitude)
 * - Elegant ash / slate-graphite gray palette matching minimalist design
 * - Delicate line opacities (0.04 to 0.18) so text remains 100% readable without visual clutter
 * - High-DPI hardware-accelerated Canvas with graceful edge bleeding
 */
export default function AnimatedWaveform({ side }) {
  if (side === 'right') {
    return null
  }

  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let animationFrameId
    let width = 0
    let height = 0
    let dpr = window.devicePixelRatio || 1
    let isVisible = true

    const handleResize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    const handleVisibility = () => {
      isVisible = !document.hidden
      if (isVisible) {
        animationFrameId = requestAnimationFrame(render)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    // Configuration for the 3 layered ribbons in elegant ash/slate-gray tones
    const ribbon1 = {
      lineCount: 46,
      baseYRatio: 0.52,
      baseSpread: 190,
      speed: 0.00022, // Slower, calmer motion
      colors: [
        { h: 220, s: 12, l: 30, a: 0.16 }, // Deep graphite gray
        { h: 215, s: 10, l: 45, a: 0.13 }, // Medium slate gray
        { h: 210, s: 8,  l: 58, a: 0.10 }, // Soft ash
        { h: 220, s: 6,  l: 25, a: 0.18 }, // Charcoal accent
        { h: 215, s: 12, l: 68, a: 0.08 }, // Whisper light gray
      ],
      nodes: 8,
      phaseOffset: 0,
      archFactor: -30,
      yShift: -10,
    }

    const ribbon2 = {
      lineCount: 36,
      baseYRatio: 0.48,
      baseSpread: 160,
      speed: 0.00018, // Very gentle drift
      colors: [
        { h: 215, s: 14, l: 38, a: 0.14 },
        { h: 220, s: 8,  l: 52, a: 0.11 },
        { h: 210, s: 6,  l: 62, a: 0.08 },
        { h: 225, s: 10, l: 28, a: 0.15 },
        { h: 215, s: 8,  l: 72, a: 0.06 },
      ],
      nodes: 8,
      phaseOffset: Math.PI * 0.85,
      archFactor: 25,
      yShift: 15,
    }

    const ribbon3 = {
      lineCount: 22,
      baseYRatio: 0.54,
      baseSpread: 120,
      speed: 0.00026,
      colors: [
        { h: 215, s: 10, l: 42, a: 0.12 },
        { h: 220, s: 8,  l: 60, a: 0.08 },
        { h: 210, s: 6,  l: 35, a: 0.10 },
      ],
      nodes: 8,
      phaseOffset: Math.PI * 1.4,
      archFactor: -15,
      yShift: 5,
    }

    const render = (currentTime) => {
      if (!isVisible) return

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)

      // Draw layered ribbons in subtle grayscale
      drawRibbon(ctx, ribbon1, currentTime, width, height)
      drawRibbon(ctx, ribbon2, currentTime, width, height)
      drawRibbon(ctx, ribbon3, currentTime, width, height)

      animationFrameId = requestAnimationFrame(render)
    }

    animationFrameId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none select-none z-0 overflow-hidden"
      style={{ opacity: 0.95 }}
      aria-hidden="true"
    />
  )
}

/**
 * Computes and renders a parametric ribbon of smooth flowing spline curves
 */
function drawRibbon(ctx, config, time, width, height) {
  const {
    lineCount,
    baseYRatio,
    baseSpread,
    speed,
    colors,
    nodes,
    phaseOffset,
    archFactor,
    yShift,
  } = config

  const t = time * speed

  const xPoints = []
  const stepX = (width * 1.3) / (nodes - 1)
  const startX = -width * 0.15

  for (let k = 0; k < nodes; k++) {
    xPoints.push(startX + k * stepX)
  }

  const spineY = []
  const spreadFactors = []
  const twistAngles = []

  for (let k = 0; k < nodes; k++) {
    const normK = k / (nodes - 1)
    const kPhase = k * 0.9 + phaseOffset

    // Calmer, smaller harmonic drift amplitudes
    const yDrift =
      Math.sin(t * 1.1 + kPhase) * 32 +
      Math.cos(t * 0.75 - kPhase * 0.6) * 22 +
      Math.sin(t * 0.35 + k * 1.1) * 14

    const sCurve = Math.sin(normK * Math.PI * 1.8 - 0.4) * archFactor

    spineY.push(height * baseYRatio + yDrift + sCurve + yShift)

    // Gentle width breathing
    const spreadMod =
      1 +
      0.25 * Math.sin(t * 1.25 + kPhase * 1.1) +
      0.15 * Math.cos(t * 0.8 - kPhase * 0.5)
    spreadFactors.push(baseSpread * Math.max(0.4, spreadMod))

    // Subtle 3D twist angle
    const twist =
      Math.sin(t * 0.95 + kPhase) * 0.55 +
      Math.cos(t * 0.6 - kPhase * 0.7) * 0.28
    twistAngles.push(twist)
  }

  for (let i = 0; i < lineCount; i++) {
    const u = i / (lineCount - 1)
    const v = u - 0.5

    const vDist = Math.sign(v) * Math.pow(Math.abs(v * 2), 1.06) * 0.5

    const colorIndex = i % colors.length
    const col = colors[colorIndex]

    const edgeAlphaFactor = 1 - Math.pow(Math.abs(v) * 1.45, 2) * 0.45
    const finalAlpha = Math.max(0.03, col.a * edgeAlphaFactor)

    ctx.strokeStyle = `hsla(${col.h}, ${col.s}%, ${col.l}%, ${finalAlpha})`
    ctx.lineWidth = 0.8 + (i % 3) * 0.2

    const linePoints = []
    for (let k = 0; k < nodes; k++) {
      const spread = spreadFactors[k]
      const twist = twistAngles[k]

      const offsetY = vDist * spread * Math.cos(twist)
      const offsetX = vDist * (spread * 0.28) * Math.sin(twist)

      linePoints.push({
        x: xPoints[k] + offsetX,
        y: spineY[k] + offsetY,
      })
    }

    ctx.beginPath()
    ctx.moveTo(linePoints[0].x, linePoints[0].y)

    for (let k = 0; k < linePoints.length - 1; k++) {
      const p0 = k > 0 ? linePoints[k - 1] : linePoints[k]
      const p1 = linePoints[k]
      const p2 = linePoints[k + 1]
      const p3 = k + 2 < linePoints.length ? linePoints[k + 2] : p2

      const tension = 0.5
      const cp1x = p1.x + ((p2.x - p0.x) / 6) * tension * 2
      const cp1y = p1.y + ((p2.y - p0.y) / 6) * tension * 2
      const cp2x = p2.x - ((p3.x - p1.x) / 6) * tension * 2
      const cp2y = p2.y - ((p3.y - p1.y) / 6) * tension * 2

      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y)
    }

    ctx.stroke()
  }
}
