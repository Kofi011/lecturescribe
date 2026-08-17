/**
 * services/transcribe.js — Groq Whisper speech-to-text
 *
 * Model: whisper-large-v3-turbo (fast, accurate, per ARCHITECTURE.md)
 * Input:  path to a local audio file (mp3 / wav / m4a)
 * Output: plain-text transcript string
 *
 * Errors are thrown with human-readable messages so the route can
 * return them directly to the frontend.
 */

import Groq from 'groq-sdk'
import fs from 'fs'

let _client = null

function getClient() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error(
      'Transcription service is not configured. ' +
      'Please add GROQ_API_KEY to the backend .env file.'
    )
  }
  if (!_client) _client = new Groq({ apiKey: process.env.GROQ_API_KEY })
  return _client
}

/**
 * Transcribe an audio file using Groq Whisper.
 *
 * @param {string} filePath  Absolute path to the temp audio file
 * @param {string} mimeType  MIME type hint (e.g. 'audio/mpeg')
 * @returns {Promise<string>} Plain-text transcript
 */
export async function transcribeAudio(filePath, mimeType) {
  const client = getClient()

  let transcription
  try {
    transcription = await client.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-large-v3-turbo',
      response_format: 'text',   // returns a plain string, not JSON
      language: 'en',
    })
  } catch (err) {
    // Surface Groq API errors as readable messages
    const status = err?.status ?? err?.statusCode
    if (status === 401) {
      throw new Error('Invalid Groq API key. Check GROQ_API_KEY in your .env file.')
    }
    if (status === 429) {
      throw new Error('Groq API rate limit reached. Please wait a moment and try again.')
    }
    if (status === 413) {
      throw new Error('Audio file is too large for the transcription API. Try a shorter clip.')
    }
    // Timeout or network error
    if (err?.code === 'ECONNRESET' || err?.code === 'ETIMEDOUT') {
      throw new Error('Transcription timed out. The server may be busy — please try again.')
    }
    throw new Error(`Transcription failed: ${err?.message || 'Unknown API error.'}`)
  }

  // Groq with response_format:'text' returns the transcript string directly
  const text = typeof transcription === 'string'
    ? transcription.trim()
    : transcription?.text?.trim() ?? ''

  if (!text) {
    throw new Error(
      'No speech was detected in the audio. ' +
      'Make sure the file contains a spoken lecture.'
    )
  }

  return text
}
