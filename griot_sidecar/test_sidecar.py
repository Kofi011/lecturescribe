"""
test_sidecar.py — Test script to verify Griot Nano 1 sidecar endpoint
"""

import sys
import math
import struct
import tempfile
import requests

SIDECAR_URL = "http://localhost:8000"

def create_sine_wav(filename: str, duration_sec: int = 3, sample_rate: int = 16000):
    num_channels = 1
    bits_per_sample = 16
    byte_rate = sample_rate * num_channels * (bits_per_sample // 8)
    block_align = num_channels * (bits_per_sample // 8)
    data_size = duration_sec * byte_rate
    header_size = 44

    with open(filename, "wb") as f:
        # RIFF header
        f.write(b"RIFF")
        f.write(struct.pack("<I", 36 + data_size))
        f.write(b"WAVE")
        f.write(b"fmt ")
        f.write(struct.pack("<I", 16))
        f.write(struct.pack("<H", 1))  # PCM
        f.write(struct.pack("<H", num_channels))
        f.write(struct.pack("<I", sample_rate))
        f.write(struct.pack("<I", byte_rate))
        f.write(struct.pack("<H", block_align))
        f.write(struct.pack("<H", bits_per_sample))
        f.write(b"data")
        f.write(struct.pack("<I", data_size))

        # 440 Hz tone
        freq = 440.0
        for i in range(duration_sec * sample_rate):
            sample = int(32767.0 * 0.3 * math.sin(2.0 * math.pi * freq * (i / sample_rate)))
            f.write(struct.pack("<h", sample))

    print(f"Created test WAV file: {filename}")


def run_tests():
    print("=== TEST 1: Health check ===")
    try:
        res = requests.get(f"{SIDECAR_URL}/health", timeout=10)
        print(f"Health status: {res.status_code}")
        print(f"Health response: {res.json()}")
        assert res.status_code == 200, "Health check failed"
    except Exception as e:
        print(f"Error connecting to sidecar: {e}")
        sys.exit(1)

    print("\n=== TEST 2: Transcribe endpoint ===")
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        tmp_path = tmp.name

    create_sine_wav(tmp_path, duration_sec=3)

    try:
        with open(tmp_path, "rb") as f:
            files = {"audio": ("sample_lecture.wav", f, "audio/wav")}
            res = requests.post(f"{SIDECAR_URL}/transcribe", files=files, timeout=60)

        print(f"Transcribe status: {res.status_code}")
        data = res.json()
        print(f"Transcribe response: {data}")

        assert res.status_code == 200, f"Transcribe failed: {data}"
        assert "transcript" in data, "Missing 'transcript' in response"
        assert "language" in data, "Missing 'language' in response"
        print("\n[SUCCESS] Sidecar /transcribe endpoint test PASSED successfully!")

    finally:
        import os
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


if __name__ == "__main__":
    run_tests()
