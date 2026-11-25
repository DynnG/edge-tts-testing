import React from 'react';
import { Radio, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

interface HeaderProps {
  backendStatus: 'connected' | 'error' | 'checking';
  onCheckHealth: () => void;
  voiceCount: number;
}

export const Header: React.FC<HeaderProps> = ({ backendStatus, onCheckHealth, voiceCount }) => {
  return (
    <header className="app-header">
      <div className="brand-wrapper">
        <div className="brand-icon">
          <Radio size={24} />
        </div>
        <div>
          <h1 className="brand-title">
            Edge TTS Voice Lab
          </h1>
          <p className="brand-subtitle">
            Test, listen to, and compare Microsoft Edge TTS voices in real-time.
          </p>
        </div>
      </div>

      <div className="header-status">
        {voiceCount > 0 && (
          <span className="badge badge-accent">
            {voiceCount} Voices Available
          </span>
        )}
        <div 
          className="status-badge" 
          title="Click to re-verify backend connectivity"
          onClick={onCheckHealth}
          style={{ cursor: 'pointer' }}
        >
          {backendStatus === 'connected' && (
            <>
              <CheckCircle2 size={14} color="#10b981" />
              <span>Backend Ready</span>
            </>
          )}
          {backendStatus === 'checking' && (
            <>
              <RefreshCw size={14} className="spinner" color="#f59e0b" />
              <span>Checking...</span>
            </>
          )}
          {backendStatus === 'error' && (
            <>
              <AlertCircle size={14} color="#ef4444" />
              <span>Backend Offline</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
