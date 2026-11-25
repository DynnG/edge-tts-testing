export interface Voice {
  id: string;
  name: string;
  locale: string;
  localeName: string;
  gender: string;
  isEnglish: boolean;
  suggestedCodec?: string;
  personalities?: string[];
}

export interface SpeechSettings {
  rate: number;    // percentage, e.g. 0 means "+0%"
  volume: number;  // percentage, e.g. 0 means "+0%"
  pitch: number;   // Hertz, e.g. 0 means "+0Hz"
}

export interface GeneratedSample {
  id: string;
  createdAt: number;
  text: string;
  voice: Voice;
  settings: SpeechSettings;
  formattedSettings: {
    rate: string;
    volume: string;
    pitch: string;
  };
  audioUrl: string;
  audioBlob: Blob;
  sizeBytes: number;
}
