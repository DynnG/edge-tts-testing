import React, { useMemo } from 'react';
import { Mic, Search, Globe, AlertTriangle, RefreshCw } from 'lucide-react';
import { Voice } from '../types';

interface VoiceSelectorProps {
  voices: Voice[];
  selectedVoiceId: string;
  onSelectVoice: (voiceId: string) => void;
  englishOnly: boolean;
  onToggleEnglishOnly: (val: boolean) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  voices,
  selectedVoiceId,
  onSelectVoice,
  englishOnly,
  onToggleEnglishOnly,
  searchQuery,
  onSearchChange,
  loading,
  error,
  onRetry,
}) => {
  // Filter voices according to english-only checkbox and search query
  const filteredVoices = useMemo(() => {
    return voices.filter((v) => {
      if (englishOnly && !v.isEnglish) {
        return false;
      }
      if (!searchQuery.trim()) {
        return true;
      }
      const query = searchQuery.toLowerCase();
      return (
        v.id.toLowerCase().includes(query) ||
        v.name.toLowerCase().includes(query) ||
        v.locale.toLowerCase().includes(query) ||
        v.localeName.toLowerCase().includes(query) ||
        v.gender.toLowerCase().includes(query)
      );
    });
  }, [voices, englishOnly, searchQuery]);

  const currentVoice = useMemo(() => {
    return voices.find((v) => v.id === selectedVoiceId);
  }, [voices, selectedVoiceId]);

  return (
    <div className="input-group">
      <div className="input-header">
        <label className="label">
          <Mic size={16} />
          Voice Selection
        </label>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          {filteredVoices.length} {filteredVoices.length === 1 ? 'voice' : 'voices'} available
        </span>
      </div>

      {error ? (
        <div className="alert alert-danger" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
          <button className="btn btn-ghost" onClick={onRetry} style={{ padding: '4px 8px' }}>
            <RefreshCw size={13} />
            Retry
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div className="voice-search-box">
              <Search className="search-icon" size={15} />
              <input
                type="text"
                className="search-input"
                placeholder="Search by voice name, country, gender, or ID..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="filter-bar">
            <label className="toggle-label">
              <input
                type="checkbox"
                className="toggle-checkbox"
                checked={englishOnly}
                onChange={(e) => onToggleEnglishOnly(e.target.checked)}
                disabled={loading}
              />
              <span>English voices only</span>
            </label>
            {loading && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent)' }}>
                <RefreshCw size={13} className="spinner" />
                Loading voices...
              </span>
            )}
          </div>

          <select
            className="select-dropdown"
            value={selectedVoiceId}
            onChange={(e) => onSelectVoice(e.target.value)}
            disabled={loading || filteredVoices.length === 0}
          >
            {filteredVoices.length === 0 ? (
              <option value="" disabled>
                {loading ? 'Fetching available voices from Microsoft...' : 'No voices match your search'}
              </option>
            ) : (
              filteredVoices.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.locale} - {v.gender}) [{v.id}]
                </option>
              ))
            )}
          </select>

          {currentVoice && (
            <div className="voice-badge-row">
              <span className="badge badge-accent">
                <Globe size={12} />
                {currentVoice.localeName} ({currentVoice.locale})
              </span>
              <span className="badge">
                Gender: {currentVoice.gender}
              </span>
              <span className="badge" style={{ fontFamily: 'var(--font-mono)' }}>
                ID: {currentVoice.id}
              </span>
              {currentVoice.personalities && currentVoice.personalities.length > 0 && (
                <span className="badge" title="Voice Personality">
                  Style: {currentVoice.personalities.join(', ')}
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
