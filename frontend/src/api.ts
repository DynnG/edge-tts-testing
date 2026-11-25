import { Voice, SpeechSettings } from './types';

const API_BASE = '/api';

export function formatSettingRate(rate: number): string {
  const sign = rate >= 0 ? '+' : '';
  return `${sign}${rate}%`;
}

export function formatSettingVolume(volume: number): string {
  const sign = volume >= 0 ? '+' : '';
  return `${sign}${volume}%`;
}

export function formatSettingPitch(pitch: number): string {
  const sign = pitch >= 0 ? '+' : '';
  return `${sign}${pitch}Hz`;
}

export async function fetchHealth(): Promise<{ status: string; service: string }> {
  try {
    const res = await fetch(`${API_BASE}/health`, { method: 'GET' });
    if (!res.ok) {
      throw new Error(`Backend returned HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    throw new Error(err.message || 'Cannot connect to backend service.');
  }
}

export async function fetchVoices(forceRefresh = false): Promise<Voice[]> {
  try {
    const url = forceRefresh ? `${API_BASE}/voices?force_refresh=true` : `${API_BASE}/voices`;
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) {
      let errorMsg = `HTTP ${res.status}`;
      try {
        const body = await res.json();
        if (body.detail) errorMsg = body.detail;
      } catch {
        // ignore
      }
      throw new Error(errorMsg);
    }
    return await res.json();
  } catch (err: any) {
    throw new Error(err.message || 'Failed to retrieve voice list from Edge TTS.');
  }
}

export interface TTSPayload {
  text: string;
  voice: string;
  settings: SpeechSettings;
}

export async function generateSpeechAudio(payload: TTSPayload): Promise<Blob> {
  const reqBody = {
    text: payload.text,
    voice: payload.voice,
    rate: formatSettingRate(payload.settings.rate),
    volume: formatSettingVolume(payload.settings.volume),
    pitch: formatSettingPitch(payload.settings.pitch),
  };

  const res = await fetch(`${API_BASE}/tts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reqBody),
  });

  if (!res.ok) {
    let message = `Generation failed (HTTP ${res.status})`;
    try {
      const errJson = await res.json();
      if (errJson.detail) {
        message = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
      }
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  const blob = await res.blob();
  if (blob.size === 0) {
    throw new Error('Received an empty audio response from server.');
  }
  return blob;
}
