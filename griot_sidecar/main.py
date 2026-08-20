"""
main.py — Griot Nano 1 FastAPI Sidecar Service
LectureScribe Speech Intelligence Layer

Wraps huggingface.co/Qlerqly/griot-nano-1 ConformerCTC model with:
  - POST /transcribe -> { "transcript": str, "language": str, "engine": "griot-nano-1" }
  - GET  /health     -> { "status": "ok", "model": "Qlerqly/griot-nano-1" }
"""

import os
import sys
import json
import tempfile
import logging
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import soundfile as sf
import torch
from huggingface_hub import snapshot_download

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("griot-sidecar")

app = FastAPI(
    title="Griot Nano 1 Speech Sidecar",
    description="ASR service wrapping Qlerqly/griot-nano-1 for African-accented & multilingual lecture speech.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_REPO = os.getenv("GRIOT_MODEL_ID", "Qlerqly/griot-nano-1")
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
DTYPE = torch.float32

griot_model = None
id_to_token = None
vocab = None


SNAPSHOT_PATH = Path(r"C:\Users\USER\.cache\huggingface\hub\models--Qlerqly--griot-nano-1\snapshots\d97d87beddde3707135b0c3d99d4d8dbe27249a7")


def load_griot_engine():
    global griot_model, id_to_token, vocab
    if griot_model is None:
        logger.info(f"Resolving Griot Nano 1 model...")
        if SNAPSHOT_PATH.exists() and (SNAPSHOT_PATH / "model.safetensors").exists():
            model_dir = SNAPSHOT_PATH
        else:
            model_dir = Path(snapshot_download(MODEL_REPO))
        logger.info(f"Model directory resolved to: {model_dir}")

        src_dir = str(model_dir / "src")
        if src_dir not in sys.path:
            sys.path.insert(0, src_dir)

        from conformer_ctc.model import ConformerCTC, ConformerCTCConfig
        from safetensors.torch import load_file

        config_path = model_dir / "config.json"
        vocab_path = model_dir / "vocab.json"
        weights_path = model_dir / "model.safetensors"

        config = ConformerCTCConfig(**json.loads(config_path.read_text(encoding="utf-8")))
        vocab_data = json.loads(vocab_path.read_text(encoding="utf-8"))
        vocab = {str(token): int(index) for token, index in vocab_data.items()}
        id_to_token = {index: token for token, index in vocab.items()}

        logger.info("Initializing ConformerCTC architecture...")
        model = ConformerCTC(config)
        logger.info(f"Loading weights from {weights_path}...")
        model.load_state_dict(load_file(weights_path))
        model.to(device=DEVICE, dtype=DTYPE).eval()

        griot_model = model
        logger.info("Griot Nano 1 loaded successfully ✓")
    return griot_model, id_to_token



@app.get("/")
@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "Griot Nano 1 Sidecar",
        "model": MODEL_REPO,
        "device": str(DEVICE),
    }


def prepare_audio(audio: np.ndarray, sample_rate: int) -> np.ndarray:
    if audio.ndim > 1:
        audio = audio.mean(axis=1)
    audio = audio.astype(np.float32, copy=False)
    if sample_rate != 16_000:
        from scipy.signal import resample_poly
        from math import gcd
        divisor = gcd(sample_rate, 16_000)
        audio = resample_poly(audio, 16_000 // divisor, sample_rate // divisor)
    return audio.astype(np.float32, copy=False)


@app.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    """
    Transcribes audio using Griot Nano 1.
    Returns:
        {
            "transcript": str,
            "language": str,
            "engine": "griot-nano-1"
        }
    """
    if not audio.filename:
        raise HTTPException(status_code=400, detail="No audio file uploaded.")

    suffix = os.path.splitext(audio.filename)[1].lower() or ".wav"
    if suffix not in [".mp3", ".wav", ".m4a", ".ogg", ".flac"]:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported format '{suffix}'. Supported: mp3, wav, m4a.",
        )

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp_path = tmp.name
        content = await audio.read()
        tmp.write(content)

    try:
        model, id_to_tok = load_griot_engine()
        from conformer_ctc.data import FeatureConfig, audio_to_log_mel
        from conformer_ctc.model import greedy_decode

        # Read audio with soundfile
        data, sr = sf.read(tmp_path, dtype="float32")
        processed_audio = prepare_audio(data, sr)

        logger.info(f"Computing log-mel features for {len(processed_audio)/16000:.2f}s audio...")
        feature_cfg = FeatureConfig(sample_rate=16_000, n_mels=model.config.n_mels)
        features = audio_to_log_mel(processed_audio, 16_000, feature_cfg)
        lengths = torch.tensor([features.shape[0]], dtype=torch.long, device=DEVICE)

        with torch.inference_mode():
            output = model(features.unsqueeze(0).to(device=DEVICE, dtype=DTYPE), lengths)

        decoded_text = greedy_decode(
            output.logits.cpu(),
            output.output_lengths.cpu(),
            id_to_tok,
            blank_id=model.config.blank_id,
            pad_id=model.config.pad_id,
        )[0]

        logger.info(f"Griot transcription complete: {len(decoded_text)} chars")

        return {
            "transcript": decoded_text.strip(),
            "language": "en",
            "engine": "griot-nano-1",
        }

    except Exception as e:
        logger.error(f"Griot transcription error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Griot transcription failed: {str(e)}",
        )
    finally:
        if os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except Exception:
                pass


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
