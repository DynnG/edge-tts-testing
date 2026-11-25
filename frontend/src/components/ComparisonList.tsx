import React, { useState } from 'react';
import { History, Download, Trash2, Globe, Clock, ExternalLink } from 'lucide-react';
import { GeneratedSample } from '../types';

interface ComparisonListProps {
  samples: GeneratedSample[];
  onClearHistory: () => void;
  onSelectSample: (sample: GeneratedSample) => void;
}

export const ComparisonList: React.FC<ComparisonListProps> = ({
  samples,
  onClearHistory,
  onSelectSample,
}) => {
  const [, setActivePlayingId] = useState<string | null>(null);

  const formatTimestamp = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="comparison-section">
      <div className="history-header">
        <h3 className="card-title">
          <History size={18} color="var(--accent)" />
          Voice Comparison History ({samples.length})
        </h3>
        {samples.length > 0 && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClearHistory}
            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            title="Clear all generated samples from this session"
          >
            <Trash2 size={12} />
            Clear Session
          </button>
        )}
      </div>

      {samples.length === 0 ? (
        <div className="empty-state" style={{ padding: '30px 10px' }}>
          <p style={{ fontSize: '0.875rem' }}>No comparison recordings yet.</p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', maxWidth: '280px', textAlign: 'center' }}>
            Generate speech with multiple voices to compare their naturalness, accent, and timbre side-by-side.
          </span>
        </div>
      ) : (
        <div className="history-list">
          {samples.map((item, index) => {
            const downloadFilename = `${item.voice.id}_sample_${index + 1}.mp3`;

            return (
              <div key={item.id} className="history-item">
                <div className="history-meta">
                  <div>
                    <div className="history-voice-name">
                      {item.voice.name}
                    </div>
                    <div className="history-voice-id">
                      {item.voice.id}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => onSelectSample(item)}
                      style={{ padding: '3px 8px', fontSize: '0.7rem' }}
                      title="Load into main player"
                    >
                      <ExternalLink size={11} />
                      Main Player
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      <Clock size={12} />
                      <span>{formatTimestamp(item.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="history-text-preview" title={item.text}>
                  "{item.text.length > 110 ? `${item.text.slice(0, 110)}...` : item.text}"
                </div>

                <div className="voice-badge-row">
                  <span className="badge badge-accent">
                    <Globe size={11} />
                    {item.voice.locale}
                  </span>
                  <span className="badge">
                    Rate: {item.formattedSettings.rate}
                  </span>
                  <span className="badge">
                    Vol: {item.formattedSettings.volume}
                  </span>
                  <span className="badge">
                    Pitch: {item.formattedSettings.pitch}
                  </span>
                  <span className="badge">
                    {item.voice.gender}
                  </span>
                </div>

                {/* Inline HTML5 Audio Player */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <audio
                    src={item.audioUrl}
                    controls
                    style={{
                      width: '100%',
                      height: '36px',
                      borderRadius: '8px',
                      outline: 'none',
                    }}
                    onPlay={() => setActivePlayingId(item.id)}
                    onPause={() => setActivePlayingId(null)}
                  />
                  <a
                    href={item.audioUrl}
                    download={downloadFilename}
                    className="btn btn-ghost"
                    style={{ padding: '6px 10px', textDecoration: 'none' }}
                    title="Download this MP3 sample"
                  >
                    <Download size={14} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
