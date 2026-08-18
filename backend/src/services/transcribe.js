/**
 * services/transcribe.js — Speech intelligence transcription engine
 */

import Groq from 'groq-sdk'
import fs from 'fs'

let _client = null

function getClient() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error(
      'Speech intelligence service is not configured. ' +
      'Please ensure the API key is provided in the backend configuration.'
    )
  }
  if (!_client) _client = new Groq({ apiKey: process.env.GROQ_API_KEY })
  return _client
}

/**
 * Transcribe lecture audio into structured text.
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
      response_format: 'text',
      language: 'en',
    })
  } catch (err) {
    const status = err?.status ?? err?.statusCode
    if (status === 401) {
      throw new Error('Speech service authentication failed. Please check your configuration.')
    }
    if (status === 429) {
      throw new Error('Speech service is busy right now. Please wait a moment and try again.')
    }
    if (status === 413) {
      throw new Error('Audio recording exceeds the single-request size limit. Please upload a shorter segment.')
    }
    if (err?.code === 'ECONNRESET' || err?.code === 'ETIMEDOUT') {
      throw new Error('Speech processing timed out. Please check your connection and try again.')
    }
    throw new Error(`Speech processing error: ${err?.message || 'Unable to process audio.'}`)
  }

  const text = typeof transcription === 'string'
    ? transcription.trim()
    : transcription?.text?.trim() ?? ''

  if (!text) {
    throw new Error(
      'No clear speech was detected in this recording. ' +
      'Please ensure the audio has audible spoken lecture content.'
    )
  }

  return text
}
