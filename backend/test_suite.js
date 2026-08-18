import fs from 'fs'

const BASE_URL = 'http://localhost:5000'

async function uploadAudio(filePath, filename, mimeType) {
  const fileBuf = fs.readFileSync(filePath)
  const formData = new FormData()
  const fileBlob = new Blob([fileBuf], { type: mimeType })
  formData.append('audio', fileBlob, filename)

  const res = await fetch(`${BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  })

  const json = await res.json()
  return { status: res.status, ok: res.ok, data: json }
}

async function runTests() {
  console.log('=== TEST 1: Health Check ===')
  const healthRes = await fetch(`${BASE_URL}/api/health`)
  const healthJson = await healthRes.json()
  console.log('Health Response:', healthJson)

  console.log('\n=== TEST 2: Valid WAV Lecture Upload & End-to-End Processing ===')
  const wavRes = await uploadAudio('sample_lecture.wav', 'sample_lecture.wav', 'audio/wav')
  console.log('WAV Status:', wavRes.status)
  console.log('WAV Title:', wavRes.data?.title)
  console.log('WAV Transcript:\n', wavRes.data?.transcript)
  console.log('\nWAV Notes:\n', wavRes.data?.notes_markdown)

  console.log('\n=== TEST 3: Invalid File Type Rejection (.txt) ===')
  fs.writeFileSync('invalid.txt', 'This is a text file, not audio.')
  const txtRes = await uploadAudio('invalid.txt', 'invalid.txt', 'text/plain')
  console.log('Invalid Format Status:', txtRes.status)
  console.log('Invalid Format Error:', txtRes.data?.error)
  fs.unlinkSync('invalid.txt')

  console.log('\n=== TEST 4: File Over 10 Minutes Duration Check (11 min WAV) ===')
  // 11 min = 660 sec at 8000 Hz, 8-bit mono = 5,280,000 bytes PCM data
  const dataSize = 11 * 60 * 8000
  const longWav = Buffer.alloc(44 + dataSize)
  longWav.write('RIFF', 0)
  longWav.writeUInt32LE(36 + dataSize, 4)
  longWav.write('WAVE', 8)
  longWav.write('fmt ', 12)
  longWav.writeUInt32LE(16, 16)      // PCM header length
  longWav.writeUInt16LE(1, 20)       // AudioFormat: PCM
  longWav.writeUInt16LE(1, 22)       // NumChannels: 1 (mono)
  longWav.writeUInt32LE(8000, 24)    // SampleRate: 8000
  longWav.writeUInt32LE(8000, 28)    // ByteRate: 8000 * 1 * 1
  longWav.writeUInt16LE(1, 32)       // BlockAlign: 1
  longWav.writeUInt16LE(8, 34)       // BitsPerSample: 8
  longWav.write('data', 36)
  longWav.writeUInt32LE(dataSize, 40)
  
  fs.writeFileSync('long_lecture.wav', longWav)
  const longRes = await uploadAudio('long_lecture.wav', 'long_lecture.wav', 'audio/wav')
  console.log('Over-10-Min Status:', longRes.status)
  console.log('Over-10-Min Error:', longRes.data?.error)
  fs.unlinkSync('long_lecture.wav')

  console.log('\n=== ALL TESTS COMPLETED ===')
}

runTests().catch(console.error)
