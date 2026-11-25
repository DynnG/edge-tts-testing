import React from 'react';
import { FileText, Trash2, RotateCcw } from 'lucide-react';

interface TextInputPanelProps {
  text: string;
  onChangeText: (text: string) => void;
  maxLength?: number;
  disabled?: boolean;
}

const DEFAULT_SAMPLE =
  "Hello! Welcome to this text-to-speech testing application. Today, we will evaluate how natural, clear, and understandable this voice sounds when speaking English.";

export const TextInputPanel: React.FC<TextInputPanelProps> = ({
  text,
  onChangeText,
  maxLength = 5000,
  disabled = false,
}) => {
  const charCount = text.length;
  const isNearLimit = charCount > maxLength * 0.9;

  const handleInsertSample = () => {
    onChangeText(DEFAULT_SAMPLE);
  };

  const handleClear = () => {
    onChangeText('');
  };

  return (
    <div className="input-group">
      <div className="input-header">
        <label className="label">
          <FileText size={16} />
          Speech Text
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="quick-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleInsertSample}
              disabled={disabled}
              title="Insert suggested sample paragraph"
            >
              <RotateCcw size={13} />
              Sample Text
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleClear}
              disabled={disabled || text.length === 0}
              title="Clear text field"
            >
              <Trash2 size={13} />
              Clear
            </button>
          </div>
          <span className={`char-counter ${isNearLimit ? 'warning' : ''}`}>
            {charCount} / {maxLength}
          </span>
        </div>
      </div>

      <textarea
        className="textarea-field"
        value={text}
        onChange={(e) => onChangeText(e.target.value.slice(0, maxLength))}
        placeholder="Type or paste text here to test pronunciation, prosody, and naturalness..."
        disabled={disabled}
        rows={5}
      />
    </div>
  );
};
