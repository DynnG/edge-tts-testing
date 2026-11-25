import React from 'react';
import { Sliders, RotateCcw, Gauge, Volume2, Music } from 'lucide-react';
import { SpeechSettings } from '../types';

interface SettingsSlidersProps {
  settings: SpeechSettings;
  onChangeSettings: (newSettings: SpeechSettings) => void;
  disabled?: boolean;
}

export const SettingsSliders: React.FC<SettingsSlidersProps> = ({
  settings,
  onChangeSettings,
  disabled = false,
}) => {
  const handleRateChange = (rate: number) => {
    onChangeSettings({ ...settings, rate });
  };

  const handleVolumeChange = (volume: number) => {
    onChangeSettings({ ...settings, volume });
  };

  const handlePitchChange = (pitch: number) => {
    onChangeSettings({ ...settings, pitch });
  };

  const handleReset = () => {
    onChangeSettings({ rate: 0, volume: 0, pitch: 0 });
  };

  const formatRate = (val: number) => `${val >= 0 ? '+' : ''}${val}%`;
  const formatVolume = (val: number) => `${val >= 0 ? '+' : ''}${val}%`;
  const formatPitch = (val: number) => `${val >= 0 ? '+' : ''}${val}Hz`;

  const isDefault = settings.rate === 0 && settings.volume === 0 && settings.pitch === 0;

  return (
    <div className="input-group">
      <div className="input-header">
        <label className="label">
          <Sliders size={16} />
          Speech Prosody Settings
        </label>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={handleReset}
          disabled={disabled || isDefault}
          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
          title="Reset rate, volume, and pitch to default values"
        >
          <RotateCcw size={12} />
          Reset Defaults
        </button>
      </div>

      <div className="sliders-grid">
        {/* Speaking Rate */}
        <div className="slider-group">
          <div className="slider-info">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
              <Gauge size={14} />
              Speaking Rate
            </span>
            <span className="slider-val">{formatRate(settings.rate)}</span>
          </div>
          <div className="slider-track-container">
            <input
              type="range"
              className="slider-input"
              min={-50}
              max={100}
              step={5}
              value={settings.rate}
              onChange={(e) => handleRateChange(Number(e.target.value))}
              disabled={disabled}
            />
          </div>
        </div>

        {/* Volume */}
        <div className="slider-group">
          <div className="slider-info">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
              <Volume2 size={14} />
              Volume Level
            </span>
            <span className="slider-val">{formatVolume(settings.volume)}</span>
          </div>
          <div className="slider-track-container">
            <input
              type="range"
              className="slider-input"
              min={-50}
              max={50}
              step={5}
              value={settings.volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              disabled={disabled}
            />
          </div>
        </div>

        {/* Pitch */}
        <div className="slider-group">
          <div className="slider-info">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
              <Music size={14} />
              Pitch Adjustment
            </span>
            <span className="slider-val">{formatPitch(settings.pitch)}</span>
          </div>
          <div className="slider-track-container">
            <input
              type="range"
              className="slider-input"
              min={-50}
              max={50}
              step={5}
              value={settings.pitch}
              onChange={(e) => handlePitchChange(Number(e.target.value))}
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
