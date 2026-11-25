import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Download, Globe, Music2 } from 'lucide-react';
import { GeneratedSample } from '../types';

interface AudioPlayerProps {
  sample: GeneratedSample | null;
  autoPlay?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ sample, autoPlay = true }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  useEffect(() => {
    if (sample && audioRef.current) {
      audioRef.current.load();
      if (autoPlay) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          setIsPlaying(false);
        });
      } else {
        setIsPlaying(false);
      }
    }
  }, [sample?.id, autoPlay]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.error('Play failed:', e);
      });
    }
  };

  const handleReplay = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().then(() => {
      setIsPlaying(true);
    });
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!sample) {
    return (
      <div className="audio-player-card">
        <div className="empty-state">
          <Music2 size={36} color="var(--text-dim)" />
          <p style={{ fontWeight: 500, color: 'var(--text-muted)' }}>No audio generated yet</p>
          <span style={{ fontSize: '0.8rem' }}>
            Select a voice, enter text, and click "Generate Speech" to test.
          </span>
        </div>
      </div>
    );
  }

  const downloadFilename = `${sample.voice.id}_${Date.now()}.mp3`;

  return (
    <div className="audio-player-card">
      <audio
        ref={audioRef}
        src={sample.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      <div className="player-main">
        <button
          type="button"
          className="play-btn"
          onClick={togglePlay}
          title={isPlaying ? 'Pause' : 'Play audio'}
        >
          {isPlaying ? <Pause size={22} /> : <Play size={22} style={{ marginLeft: 3 }} />}
        </button>

        <div className="player-track-info">
          <div className="track-voice-title">
            {sample.voice.name}
          </div>
          <div className="progress-container">
            <span className="time-display">{formatTime(currentTime)}</span>
            <input
              type="range"
              className="seek-bar"
              min={0}
              max={duration || 100}
              step={0.01}
              value={currentTime}
              onChange={handleSeek}
            />
            <span className="time-display">{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      <div className="voice-badge-row">
        <span className="badge badge-accent">
          <Globe size={11} />
          {sample.voice.locale}
        </span>
        <span className="badge">
          Rate: {sample.formattedSettings.rate}
        </span>
        <span className="badge">
          Vol: {sample.formattedSettings.volume}
        </span>
        <span className="badge">
          Pitch: {sample.formattedSettings.pitch}
        </span>
        <span className="badge" style={{ fontFamily: 'var(--font-mono)' }}>
          {(sample.sizeBytes / 1024).toFixed(1)} KB
        </span>
      </div>

      <div className="player-actions">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={handleReplay}
          title="Restart from beginning"
        >
          <RotateCcw size={14} />
          Replay
        </button>

        <a
          href={sample.audioUrl}
          download={downloadFilename}
          className="btn btn-ghost"
          style={{ textDecoration: 'none' }}
          title="Download MP3 file"
        >
          <Download size={14} />
          Download MP3
        </a>
      </div>
    </div>
  );
};
