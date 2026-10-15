/**
 * Voice Recognition & Speech Synthesis Utility for JarvisOS
 * Supports Web Speech API with graceful fallback when unavailable
 */

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function isSpeechSynthesisSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean('speechSynthesis' in window && window.speechSynthesis);
}

export interface VoiceListenerOptions {
  onResult: (transcript: string, isFinal: boolean) => void;
  onError: (error: string) => void;
  onEnd: () => void;
}

export function createVoiceListener(options: VoiceListenerOptions): { start: () => void; stop: () => void } {
  if (!isSpeechRecognitionSupported()) {
    return {
      start: () => options.onError('Speech recognition is not supported in this browser. Please type your command.'),
      stop: () => {},
    };
  }

  const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognitionClass();

  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onresult = (event: any) => {
    let interim = '';
    let final = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final += event.results[i][0].transcript;
      } else {
        interim += event.results[i][0].transcript;
      }
    }

    const transcript = (final || interim).trim();
    if (transcript) {
      options.onResult(transcript, Boolean(final));
    }
  };

  recognition.onerror = (event: any) => {
    const errorMap: Record<string, string> = {
      'not-allowed': 'Microphone access denied. Please grant microphone permissions in your browser.',
      'no-speech': 'No speech detected. Please try again.',
      'audio-capture': 'No microphone hardware found.',
      'network': 'Network error occurred during speech processing.',
    };
    options.onError(errorMap[event.error] || `Speech error: ${event.error}`);
  };

  recognition.onend = () => {
    options.onEnd();
  };

  return {
    start: () => {
      try {
        recognition.start();
      } catch (err: any) {
        options.onError(err.message || 'Failed to start microphone.');
        options.onEnd();
      }
    },
    stop: () => {
      try {
        recognition.stop();
      } catch {
        // Safe ignore
      }
    },
  };
}

export function speakJarvisResponse(text: string, enabled: boolean = true): void {
  if (!enabled || !isSpeechSynthesisSupported()) return;

  try {
    window.speechSynthesis.cancel(); // Stop prior speech

    // Clean text of markdown, urls, and json code blocks for natural speech
    const clean = text
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[#*_~>]/g, '')
      .slice(0, 300); // Keep voice announcements concise

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1.05;
    utterance.pitch = 0.95;

    // Try to find a crisp English voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Male') || v.name.includes('David') || v.name.includes('Daniel'))
    ) || voices.find(v => v.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('[Voice Synthesis] Speech failed:', err);
  }
}
