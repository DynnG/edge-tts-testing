# Edge TTS Voice Lab

A standalone web application built from scratch to test, evaluate, and compare **Microsoft Edge Text-to-Speech (Edge TTS)** voices.

This application allows developers and creators to evaluate voice naturalness, pronunciation, speaking rate, volume, and pitch adjustments before selecting a voice for production use.

---

## Features

- **Dynamic Voice Discovery**: Dynamically retrieves the full catalog of voices (300+ voices across 70+ languages) directly from Microsoft Edge TTS.
- **Search & Filtering**: Search voices by name, country/locale, gender, or official identifier. Includes an instant toggle for English voices.
- **Customizable Prosody Controls**:
  - **Speaking Rate**: Slower to faster (`-50%` to `+100%`).
  - **Volume**: Quieter to louder (`-50%` to `+50%`).
  - **Pitch**: Lower to higher (`-50Hz` to `+50Hz`).
- **Interactive Audio Player**: Listen to real MP3 audio streamed from Microsoft's speech service, with playback scrubber, duration display, and one-click replay.
- **Voice Comparison Session**: Automatically saves generated voice samples in your browser's session history so you can compare multiple voices using the exact same text side-by-side.
- **Downloadable MP3s**: Easily download synthesized audio files directly to your computer.
- **Zero Cloud Costs / No API Keys**: Powered by the open-source `edge-tts` engine with no subscriptions or paid credentials required.
- **Privacy & Memory Safe**: Generated audio is streamed strictly through in-memory buffers; no audio or text is permanently stored on the server or in any database.

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Lucide Icons
- **Backend**: Python 3.10+, FastAPI, Uvicorn, Pydantic
- **Speech Engine**: `edge-tts` Python library (streaming Microsoft Edge neural voices)
- **Audio Output**: MP3 format (`audio/mpeg`)

---

## Prerequisites

Before starting, ensure you have the following installed on your machine:
- **Python**: Version 3.10 or higher (`python --version`)
- **Node.js**: Version 18 or higher with npm (`node -v` and `npm -v`)
- **Internet Connection**: Microsoft Edge TTS communicates with Microsoft's speech service over the internet.

---

## Installation & Setup

Clone or open the project folder in **Windows PowerShell**:

```powershell
cd C:\Users\Geraldyn\OneDrive\Documents\tts_testing
```

### 1. Backend Setup

Create a Python virtual environment and install the required dependencies:

```powershell
# Navigate into backend (or run from root)
python -m venv backend\.venv

# Activate the virtual environment
.\backend\.venv\Scripts\Activate.ps1

# Install required Python packages
pip install -r backend\requirements.txt
```

### 2. Frontend Setup

Install Node.js packages for the React frontend:

```powershell
cd frontend
npm install
cd ..
```

---

## Running the Application

To run the application, open **two separate Windows PowerShell terminal windows**:

### Terminal 1: Start Backend (FastAPI)

```powershell
cd C:\Users\Geraldyn\OneDrive\Documents\tts_testing
.\backend\.venv\Scripts\Activate.ps1
cd backend
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The backend API will be available at:
- **API Base URL**: `http://127.0.0.1:8000`
- **Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`
- **Health Check**: `http://127.0.0.1:8000/api/health`

### Terminal 2: Start Frontend (Vite + React)

```powershell
cd C:\Users\Geraldyn\OneDrive\Documents\tts_testing\frontend
npm run dev
```

The frontend development server will start at:
- **Application URL**: `http://localhost:5173`

Open `http://localhost:5173` in your web browser.

---

## How to Test and Compare Voices

1. **Enter or Paste Text**:
   - Type or paste any text into the **Speech Text** field.
   - Click the **Sample Text** button to quickly load a standardized English test paragraph.
2. **Select a Voice**:
   - Use the voice dropdown to pick a voice.
   - Use the search bar to filter by language, country, voice personality, or gender (e.g. `Jenny`, `Guy`, `UK`, `Female`).
   - Leave **English voices only** checked for English tests, or uncheck it to explore any of the 300+ international voices.
3. **Adjust Speech Prosody (Optional)**:
   - Move the **Speaking Rate** slider to test faster or slower pacing.
   - Adjust **Volume** or **Pitch** if needed.
   - Click **Reset Defaults** at any time to return to normal speech settings.
4. **Generate & Listen**:
   - Click **Generate Speech**.
   - The audio player will display the synthesized MP3 audio.
   - Use the play/pause button, time scrubber, and replay button.
5. **Compare Voices Side-by-Side**:
   - Without changing the text, choose a different voice from the dropdown (for example, compare `en-US-JennyNeural` vs `en-US-GuyNeural` vs `en-GB-SoniaNeural`).
   - Click **Generate Speech** again.
   - Both samples will be preserved in the **Voice Comparison History** list on the right, allowing you to listen to both and compare audio quality, articulation, and accent.
6. **Download MP3**:
   - Click **Download MP3** on any sample to save the raw audio file to your local drive.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check verifying that the backend is operational |
| `GET` | `/api/voices` | Fetches available voices dynamically from Edge TTS |
| `POST` | `/api/tts` | Generates speech MP3 audio in-memory from text and voice settings |

### TTS Request Schema:
```json
{
  "text": "Hello world!",
  "voice": "en-US-JennyNeural",
  "rate": "+0%",
  "volume": "+0%",
  "pitch": "+0Hz"
}
```

---

## Important Limitations & Notes

- **Internet Dependency**: `edge-tts` uses Microsoft's online speech services. An active internet connection is required to fetch voices and synthesize audio.
- **Service Availability**: Microsoft Edge TTS is an online service provided by Microsoft for Edge browser features. It may be subject to network latency, transient Microsoft service disruptions, or rate limits if excessively queried.
- **Session-Only Storage**: Audio and comparison history are kept in memory and browser session state only. Refreshing the browser or clearing the session resets the comparison history.
