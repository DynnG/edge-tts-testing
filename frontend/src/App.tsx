import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { TextInputPanel } from './components/TextInputPanel';
import { VoiceSelector } from './components/VoiceSelector';
import { SettingsSliders } from './components/SettingsSliders';
import { AudioPlayer } from './components/AudioPlayer';
import { ComparisonList } from './components/ComparisonList';
import {
  Voice,
  SpeechSettings,
  GeneratedSample,
} from './types';
import {
  fetchHealth,
  fetchVoices,
  generateSpeechAudio,
  formatSettingRate,
  formatSettingVolume,
  formatSettingPitch,
} from './api';
import { Play, Loader2, Sparkles, AlertCircle } from 'lucide-react';

const INITIAL_TEXT =
  "Hello! Welcome to this text-to-speech testing application. Today, we will evaluate how natural, clear, and understandable this voice sounds when speaking English.";

export const App: React.FC = () => {
  // Application State
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [voices, setVoices] = useState<Voice[]>([]);
  const [voicesLoading, setVoicesLoading] = useState<boolean>(true);
  const [voicesError, setVoicesError] = useState<string | null>(null);

  const [text, setText] = useState<string>(INITIAL_TEXT);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('');
  const [englishOnly, setEnglishOnly] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [settings, setSettings] = useState<SpeechSettings>({
    rate: 0,
    volume: 0,
    pitch: 0,
  });

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const [currentSample, setCurrentSample] = useState<GeneratedSample | null>(null);
  const [historySamples, setHistorySamples] = useState<GeneratedSample[]>([]);

  // Check backend health
  const checkHealthStatus = useCallback(async () => {
    try {
      setBackendStatus('checking');
      await fetchHealth();
      setBackendStatus('connected');
    } catch {
      setBackendStatus('error');
    }
  }, []);

  // Fetch voices dynamically
  const loadVoices = useCallback(async (forceRefresh = false) => {
    setVoicesLoading(true);
    setVoicesError(null);
    try {
      const data = await fetchVoices(forceRefresh);
      setVoices(data);
      setBackendStatus('connected');

      // Pick sensible default English voice if not selected yet
      if (!selectedVoiceId || !data.some((v) => v.id === selectedVoiceId)) {
        const preferredVoices = [
          'en-US-JennyNeural',
          'en-US-GuyNeural',
          'en-US-AriaNeural',
          'en-US-ChristopherNeural',
        ];
        const defaultVoice =
          data.find((v) => preferredVoices.includes(v.id)) ||
          data.find((v) => v.isEnglish) ||
          data[0];

        if (defaultVoice) {
          setSelectedVoiceId(defaultVoice.id);
        }
      }
    } catch (err: any) {
      setVoicesError(err.message || 'Failed to load voices from Edge TTS.');
      setBackendStatus('error');
    } finally {
      setVoicesLoading(false);
    }
  }, [selectedVoiceId]);

  useEffect(() => {
    checkHealthStatus();
    loadVoices();
  }, [checkHealthStatus, loadVoices]);

  // Handle TTS Generation
  const handleGenerate = async () => {
    const trimmedText = text.trim();
    if (!trimmedText) {
      setGenerationError('Please enter some text to synthesize.');
      return;
    }

    if (!selectedVoiceId) {
      setGenerationError('Please select a voice first.');
      return;
    }

    const voiceObj = voices.find((v) => v.id === selectedVoiceId);
    if (!voiceObj) {
      setGenerationError(`Selected voice identifier '${selectedVoiceId}' is not valid.`);
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const audioBlob = await generateSpeechAudio({
        text: trimmedText,
        voice: selectedVoiceId,
        settings,
      });

      const audioUrl = URL.createObjectURL(audioBlob);

      const newSample: GeneratedSample = {
        id: `sample_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: Date.now(),
        text: trimmedText,
        voice: voiceObj,
        settings: { ...settings },
        formattedSettings: {
          rate: formatSettingRate(settings.rate),
          volume: formatSettingVolume(settings.volume),
          pitch: formatSettingPitch(settings.pitch),
        },
        audioBlob,
        audioUrl,
        sizeBytes: audioBlob.size,
      };

      setCurrentSample(newSample);
      // Prepend to history for comparison
      setHistorySamples((prev) => [newSample, ...prev]);
    } catch (err: any) {
      setGenerationError(err.message || 'Speech generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearHistory = () => {
    // Revoke object URLs to release memory
    historySamples.forEach((s) => {
      URL.revokeObjectURL(s.audioUrl);
    });
    setHistorySamples([]);
  };

  return (
    <div className="app-container">
      <Header
        backendStatus={backendStatus}
        onCheckHealth={checkHealthStatus}
        voiceCount={voices.length}
      />

      {backendStatus === 'error' && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <div>
            <strong>Backend Connection Failed:</strong> Unable to connect to the FastAPI server at <code>http://127.0.0.1:8000</code>.
            Please ensure the backend is running with <code>uvicorn main:app --reload</code>.
          </div>
        </div>
      )}

      <main className="main-grid">
        {/* Left / Main Configuration Panel */}
        <section className="card">
          <h2 className="card-title">
            <Sparkles size={18} color="var(--accent)" />
            Speech Configuration
          </h2>

          <TextInputPanel
            text={text}
            onChangeText={setText}
            disabled={isGenerating}
          />

          <VoiceSelector
            voices={voices}
            selectedVoiceId={selectedVoiceId}
            onSelectVoice={setSelectedVoiceId}
            englishOnly={englishOnly}
            onToggleEnglishOnly={setEnglishOnly}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            loading={voicesLoading}
            error={voicesError}
            onRetry={() => loadVoices(true)}
          />

          <SettingsSliders
            settings={settings}
            onChangeSettings={setSettings}
            disabled={isGenerating}
          />

          {generationError && (
            <div className="alert alert-danger">
              <AlertCircle size={16} />
              <span>{generationError}</span>
            </div>
          )}

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={isGenerating || text.trim().length === 0 || voicesLoading || !selectedVoiceId}
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} className="spinner" />
                Synthesizing Speech with Edge TTS...
              </>
            ) : (
              <>
                <Play size={18} fill="currentColor" />
                Generate Speech
              </>
            )}
          </button>
        </section>

        {/* Right / Results & Comparison Panel */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <h2 className="card-title">
              Generated Audio Player
            </h2>
            <AudioPlayer sample={currentSample} autoPlay={true} />
          </div>

          <div className="card">
            <ComparisonList
              samples={historySamples}
              onClearHistory={handleClearHistory}
              onSelectSample={(sample) => setCurrentSample(sample)}
            />
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
