import re
import logging
from typing import Optional, List
from fastapi import FastAPI, HTTPException, Response, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
import edge_tts

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("edge_tts_app")

app = FastAPI(
    title="Edge TTS Voice Lab API",
    description="Backend service for Microsoft Edge Text-to-Speech testing application",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cache for voices to avoid excessive network requests
_voices_cache: List[dict] = []

class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000, description="The text to synthesize")
    voice: str = Field(..., min_length=1, max_length=100, description="Edge TTS voice identifier")
    rate: str = Field(default="+0%", description="Speech rate adjustment, e.g. +0%, +20%, -10%")
    volume: str = Field(default="+0%", description="Speech volume adjustment, e.g. +0%, +10%, -20%")
    pitch: str = Field(default="+0Hz", description="Speech pitch adjustment, e.g. +0Hz, +10Hz, -10Hz")

    @field_validator("text")
    @classmethod
    def validate_text(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Input text cannot be empty or whitespace only.")
        if len(stripped) > 5000:
            raise ValueError("Input text exceeds maximum length of 5000 characters.")
        return stripped

    @field_validator("rate")
    @classmethod
    def validate_rate(cls, v: str) -> str:
        v = v.strip()
        if not re.match(r"^[+-]?\d+%$", v):
            raise ValueError("Rate must be formatted like '+0%' or '-10%'.")
        if not v.startswith(("+", "-")):
            v = f"+{v}"
        return v

    @field_validator("volume")
    @classmethod
    def validate_volume(cls, v: str) -> str:
        v = v.strip()
        if not re.match(r"^[+-]?\d+%$", v):
            raise ValueError("Volume must be formatted like '+0%' or '-10%'.")
        if not v.startswith(("+", "-")):
            v = f"+{v}"
        return v

    @field_validator("pitch")
    @classmethod
    def validate_pitch(cls, v: str) -> str:
        v = v.strip()
        if not re.match(r"^[+-]?\d+Hz$", v):
            raise ValueError("Pitch must be formatted like '+0Hz' or '-10Hz'.")
        if not v.startswith(("+", "-")):
            v = f"+{v}"
        return v


@app.get("/api/health")
async def health_check():
    """Health check endpoint to verify backend service status."""
    return {
        "status": "ok",
        "service": "Edge TTS Voice Lab Backend",
        "cached_voices_count": len(_voices_cache)
    }


@app.get("/api/voices")
async def get_voices(force_refresh: bool = Query(default=False)):
    """
    Retrieve available voices dynamically from Edge TTS.
    Returns normalized metadata including identifier, name, locale, and gender.
    """
    global _voices_cache
    if _voices_cache and not force_refresh:
        return _voices_cache

    try:
        raw_voices = await edge_tts.list_voices()
        formatted_voices = []
        for voice in raw_voices:
            formatted_voices.append({
                "id": voice.get("ShortName"),
                "name": voice.get("FriendlyName") or voice.get("ShortName"),
                "locale": voice.get("Locale"),
                "localeName": voice.get("LocaleName") or voice.get("Locale"),
                "gender": voice.get("Gender", "Unknown"),
                "isEnglish": voice.get("Locale", "").lower().startswith("en-"),
                "suggestedCodec": voice.get("SuggestedCodec", "audio-24khz-48kbitrate-mono-mp3"),
                "personalities": voice.get("VoiceTag", {}).get("VoicePersonalities", [])
            })

        # Sort: English voices first, then alphabetical by locale and name
        formatted_voices.sort(key=lambda x: (not x["isEnglish"], x["locale"], x["name"]))
        _voices_cache = formatted_voices
        logger.info(f"Loaded {len(_voices_cache)} voices from Edge TTS.")
        return _voices_cache
    except Exception as e:
        logger.error(f"Failed to fetch voices from Edge TTS: {e}")
        # If we have cached voices, return them even on failure
        if _voices_cache:
            return _voices_cache
        raise HTTPException(
            status_code=502,
            detail=f"Unable to retrieve voices from Microsoft Edge TTS service: {str(e)}"
        )


@app.post("/api/tts")
async def generate_speech(request: TTSRequest):
    """
    Generate speech using Microsoft Edge TTS and stream back the MP3 audio.
    Processes audio completely in memory without permanent disk storage.
    """
    try:
        communicate = edge_tts.Communicate(
            text=request.text,
            voice=request.voice,
            rate=request.rate,
            volume=request.volume,
            pitch=request.pitch
        )

        audio_buffer = bytearray()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_buffer.extend(chunk["data"])

        if len(audio_buffer) == 0:
            raise HTTPException(
                status_code=400,
                detail="Edge TTS did not return any audio data for the given text and voice."
            )

        logger.info(f"Generated {len(audio_buffer)} bytes of audio for voice '{request.voice}'.")

        return Response(
            content=bytes(audio_buffer),
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": f'inline; filename="{request.voice}.mp3"',
                "Content-Type": "audio/mpeg",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "X-Audio-Length-Bytes": str(len(audio_buffer))
            }
        )

    except ValueError as ve:
        logger.warning(f"Validation or voice error: {ve}")
        raise HTTPException(status_code=400, detail=str(ve))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during TTS generation: {e}", exc_info=True)
        raise HTTPException(
            status_code=502,
            detail=f"Speech synthesis failed with Microsoft Edge TTS: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
