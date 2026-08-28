/**
 * services/transcribe.js — Dual Transcription Engine (Groq Whisper + Griot Nano 1)
 *
 * Architecture:
 * 1. Groq Whisper API (whisper-large-v3-turbo) -> High throughput cloud ASR for clear English speech
 * 2. Griot Nano 1 Sidecar (Qlerqly/griot-nano-1) -> Specialized for African-accented, dialectal & multilingual lectures
 * 3. Intelligent Routing: Analyzes detected language + confidence (avg_logprob / no_speech_prob).
 *    Routes clear English to Whisper, and dialectal/multilingual/low-confidence audio to Griot Nano 1.
 * 4. Output Normalization: Standardized { transcript, language, engine }
 */

import Groq from 'groq-sdk'
import fs from 'fs'
import path from 'path'

let _groqClient = null

function getGroqClient() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error(
      'Groq Speech service is not configured. ' +
      'Please ensure GROQ_API_KEY is provided in the backend .env file.'
    )
  }
  if (!_groqClient) {
    _groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY })
  }
  return _groqClient
}

/**
 * Transcribes audio via the Griot Nano 1 FastAPI sidecar service.
 *
 * @param {string} filePath  Absolute path to the temp audio file
 * @param {string} mimeType  MIME type hint
 * @returns {Promise<{ transcript: string, language: string, engine: string }>}
 */
export async function transcribeWithGriot(filePath, mimeType = 'audio/wav') {
  const sidecarUrl = process.env.GRIOT_SIDECAR_URL || 'http://localhost:8000'
  const filename = path.basename(filePath)

  let fileBuffer
  try {
    fileBuffer = fs.readFileSync(filePath)
  } catch (err) {
    throw new Error(`Failed to read audio file for Griot sidecar: ${err.message}`)
  }

  const formData = new FormData()
  const audioBlob = new Blob([fileBuffer], { type: mimeType })
  formData.append('audio', audioBlob, filename)

  let response
  try {
    response = await fetch(`${sidecarUrl}/transcribe`, {
      method: 'POST',
      body: formData,
    })
  } catch (err) {
    if (err?.cause?.code === 'ECONNREFUSED' || err.message?.includes('fetch failed')) {
      throw new Error(
        'Griot Nano 1 Speech Sidecar is unreachable. ' +
        'Please make sure the Python service is running on ' + sidecarUrl
      )
    }
    throw new Error(`Griot Nano 1 request error: ${err.message}`)
  }

  if (!response.ok) {
    const errText = await response.text().catch(() => '')
    throw new Error(`Griot Nano 1 error (${response.status}): ${errText || 'Transcription failed'}`)
  }

  const data = await response.json()
  const transcript = (data.transcript || '').trim()

  return {
    transcript,
    language: data.language || 'en',
    engine: 'griot-nano-1',
  }
}

/**
 * Checks the operational health status of the Griot Nano 1 sidecar.
 * @returns {Promise<'healthy'|'offline'>}
 */
export async function checkGriotHealth() {
  const sidecarUrl = process.env.GRIOT_SIDECAR_URL || 'http://localhost:8000'
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 1500)
    const res = await fetch(`${sidecarUrl}/health`, { signal: controller.signal })
    clearTimeout(timeout)
    return res.ok ? 'healthy' : 'offline'
  } catch {
    return 'offline'
  }
}

/**
 * Transcribes audio via Groq Whisper with verbose JSON metadata.
 *
 * @param {string} filePath Absolute path to audio file
 * @returns {Promise<{ transcript: string, language: string, segments: Array, engine: string }>}
 */
export async function transcribeWithWhisper(filePath) {
  const client = getGroqClient()

  let result
  try {
    result = await client.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-large-v3-turbo',
      response_format: 'verbose_json',
      temperature: 0.0,
    })
  } catch (err) {
    const status = err?.status ?? err?.statusCode
    if (status === 401) {
      throw new Error('Groq Speech service authentication failed. Please check your GROQ_API_KEY.')
    }
    if (status === 429) {
      throw new Error('Groq Speech service rate limit exceeded. Please wait a moment and try again.')
    }
    if (status === 413) {
      throw new Error('Audio recording exceeds the single-request size limit. Please upload a shorter segment.')
    }
    if (err?.code === 'ECONNRESET' || err?.code === 'ETIMEDOUT') {
      throw new Error('Speech processing timed out. Please check your network connection and try again.')
    }
    throw new Error(`Groq Whisper transcription error: ${err?.message || 'Unable to process audio.'}`)
  }

  const text = (result?.text || '').trim()
  const rawLang = (result?.language || 'english').toLowerCase()
  const language = (rawLang === 'english' || rawLang === 'en') ? 'en' : rawLang
  const segments = result?.segments || []

  return {
    transcript: text,
    language,
    segments,
    engine: 'groq-whisper',
  }
}

/**
 * Evaluates Whisper verbose_json segments to determine speech confidence.
 *
 * @param {Array} segments
 * @returns {{ isConfident: boolean, avgLogprob: number, maxNoSpeechProb: number }}
 */
function evaluateConfidence(segments = []) {
  if (!segments.length) {
    return { isConfident: true, avgLogprob: 0, maxNoSpeechProb: 0 }
  }

  // Look at the initial sample (up to first 5 segments or ~30s of speech)
  const sampleSegments = segments.slice(0, 5)
  const totalLogprob = sampleSegments.reduce((acc, s) => acc + (s.avg_logprob ?? -0.5), 0)
  const avgLogprob = totalLogprob / sampleSegments.length
  const maxNoSpeechProb = Math.max(...sampleSegments.map(s => s.no_speech_prob ?? 0))

  // High confidence: avg_logprob >= -0.85 and no_speech_prob < 0.45
  const isConfident = avgLogprob >= -0.85 && maxNoSpeechProb < 0.45

  return { isConfident, avgLogprob, maxNoSpeechProb }
}

/**
 * Intelligent Dual-Engine Transcription Orchestrator:
 * 1. Executes language detection & confidence analysis via Groq Whisper.
 * 2. If standard English + high confidence -> Uses Groq Whisper.
 * 3. If dialectal/accented English with lower confidence OR multilingual -> Routes to Griot Nano 1.
 * 4. Normalizes output to { transcript, language, engine }.
 *
 * @param {string} filePath  Absolute path to the audio file
 * @param {string} mimeType  MIME type hint (e.g. 'audio/mpeg')
 * @returns {Promise<{ transcript: string, language: string, engine: string }>}
 */
export async function transcribeAudio(filePath, mimeType = 'audio/mpeg') {
  console.log(`[transcribe] analyzing audio for intelligent routing: ${path.basename(filePath)}`)

  // Step 1: Initial Whisper pass for language detection & confidence scoring
  let whisperResult
  try {
    whisperResult = await transcribeWithWhisper(filePath)
  } catch (whisperErr) {
    console.warn(`[transcribe] Whisper primary pass failed: ${whisperErr.message}. Attempting Griot Nano 1 sidecar fallback...`)
    try {
      return await transcribeWithGriot(filePath, mimeType)
    } catch (griotErr) {
      throw new Error(
        `Transcription failed on both engines.\n` +
        `Whisper error: ${whisperErr.message}\n` +
        `Griot sidecar error: ${griotErr.message}`
      )
    }
  }

  const { transcript, language, segments } = whisperResult
  const { isConfident, avgLogprob, maxNoSpeechProb } = evaluateConfidence(segments)

  console.log(
    `[transcribe] routing metrics -> language: "${language}", avgLogprob: ${avgLogprob.toFixed(3)}, ` +
    `maxNoSpeechProb: ${maxNoSpeechProb.toFixed(3)}, isConfident: ${isConfident}`
  )

  // Step 2: Routing decision
  const isClearEnglish = (language === 'en' || language === 'english') && isConfident

  if (isClearEnglish) {
    console.log('[transcribe] routed to: Groq Whisper (High-confidence English)')
    if (!transcript) {
      throw new Error('No clear speech was detected in this recording. Please ensure the audio has audible spoken lecture content.')
    }
    return {
      transcript,
      language: 'en',
      engine: 'groq-whisper',
    }
  }

  // Step 3: Route to Griot Nano 1 for accented / multilingual / low-confidence speech
  console.log(`[transcribe] routing to: Griot Nano 1 Sidecar (reason: ${language !== 'en' ? `language=${language}` : 'accented/low-confidence speech'})`)
  try {
    const griotResult = await transcribeWithGriot(filePath, mimeType)
    console.log(`[transcribe] Griot Nano 1 transcription succeeded (${griotResult.transcript.length} chars)`)
    return {
      transcript: griotResult.transcript,
      language: language !== 'en' ? language : 'en-af',
      engine: 'griot-nano-1',
    }
  } catch (griotErr) {
    console.warn(`[transcribe] Griot Nano 1 sidecar routing failed: ${griotErr.message}. Falling back to Whisper transcript.`)
    // If Griot is unreachable or errored, fallback to Whisper's result if we have text
    if (transcript) {
      return {
        transcript,
        language,
        engine: 'groq-whisper',
      }
    }
    throw griotErr
  }
}
