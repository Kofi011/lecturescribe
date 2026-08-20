/**
 * test_dual_engine.js — Verification test for Phase 3 Dual Transcription Engine
 */

import fs from 'fs'
import path from 'path'
import { transcribeWithGriot, transcribeAudio } from './src/services/transcribe.js'
import dotenv from 'dotenv'

dotenv.config()

function createTestWav(filePath) {
  const sampleRate = 16000
  const durationSec = 3
  const numChannels = 1
  const bitsPerSample = 16
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8)
  const blockAlign = numChannels * (bitsPerSample / 8)
  const dataSize = durationSec * byteRate
  const buffer = Buffer.alloc(44 + dataSize)

  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + dataSize, 4)
  buffer.write('WAVE', 8)
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16)
  buffer.writeUInt16LE(1, 20) // PCM
  buffer.writeUInt16LE(numChannels, 22)
  buffer.writeUInt32LE(sampleRate, 24)
  buffer.writeUInt32LE(byteRate, 28)
  buffer.writeUInt16LE(blockAlign, 32)
  buffer.writeUInt16LE(bitsPerSample, 34)
  buffer.write('data', 36)
  buffer.writeUInt32LE(dataSize, 40)

  for (let i = 0; i < durationSec * sampleRate; i++) {
    const sample = Math.floor(32767 * 0.3 * Math.sin((2 * Math.PI * 440 * i) / sampleRate))
    buffer.writeInt16LE(sample, 44 + i * 2)
  }

  fs.writeFileSync(filePath, buffer)
  console.log(`Created test WAV file: ${filePath}`)
}

async function runTests() {
  const testWavPath = path.resolve('./test_sample.wav')
  createTestWav(testWavPath)

  try {
    console.log('\n=== TEST 1: Direct Griot Sidecar Speech Service ===')
    const griotResult = await transcribeWithGriot(testWavPath, 'audio/wav')
    console.log('Griot Result:', griotResult)
    if (!griotResult.engine || griotResult.engine !== 'griot-nano-1') {
      throw new Error(`Expected engine 'griot-nano-1', got '${griotResult.engine}'`)
    }
    console.log('✓ Griot Sidecar test PASSED')

    console.log('\n=== TEST 2: Dual Transcription Engine Orchestrator ===')
    const orchestratedResult = await transcribeAudio(testWavPath, 'audio/wav')
    console.log('Orchestrated Result:', orchestratedResult)
    if (!orchestratedResult.engine || !orchestratedResult.transcript) {
      throw new Error('Orchestrated result missing required fields')
    }
    console.log('✓ Dual Transcription Engine Orchestrator test PASSED')

    console.log('\n=== TEST 3: POST /api/upload End-to-End Test ===')
    const fileBuffer = fs.readFileSync(testWavPath)
    const formData = new FormData()
    formData.append('audio', new Blob([fileBuffer], { type: 'audio/wav' }), 'test_sample.wav')

    const uploadRes = await fetch('http://localhost:5000/api/upload', {
      method: 'POST',
      body: formData,
    })

    const uploadData = await uploadRes.json()
    console.log('Upload HTTP Status:', uploadRes.status)
    console.log('Upload Result payload:', {
      status: uploadData.status,
      title: uploadData.title,
      engine_used: uploadData.engine_used,
      language: uploadData.language,
      transcriptLength: uploadData.transcript?.length,
      hasConcepts: Array.isArray(uploadData.key_concepts),
      hasNotes: Array.isArray(uploadData.study_notes),
    })

    if (uploadRes.status !== 200 || uploadData.status !== 'complete') {
      throw new Error(`Upload failed: ${JSON.stringify(uploadData)}`)
    }
    if (!uploadData.engine_used) {
      throw new Error("Upload response missing 'engine_used'")
    }

    console.log('\n✓ ALL DUAL TRANSCRIPTION TESTS PASSED 100% SUCCESSFULLY!')
  } finally {
    if (fs.existsSync(testWavPath)) fs.unlinkSync(testWavPath)
  }
}

runTests().catch(err => {
  console.error('\n✗ TEST FAILED:', err)
  process.exit(1)
})
