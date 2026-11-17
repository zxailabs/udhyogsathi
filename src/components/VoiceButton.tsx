"use client";

import React, { useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

export function VoiceButton({ onTranscript, disabled }: VoiceButtonProps) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const toggleVoice = () => {
    if (disabled) return;

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    const RecognitionCtor = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!RecognitionCtor) {
      alert("तुमच्या ब्राउझरमध्ये मराठी व्हॉईस इनपुट (SpeechRecognition) उपलब्ध नाही. कृपया Chrome किंवा Edge वापरा.");
      return;
    }

    const recognition = new RecognitionCtor();
    recognition.lang = "mr-IN";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let combined = "";
      for (let i = 0; i < event.results.length; i++) {
        combined += event.results[i][0].transcript;
      }
      if (combined.trim()) {
        onTranscript(combined.trim());
      }
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  };

  return (
    <button
      type="button"
      onClick={toggleVoice}
      disabled={disabled}
      title={listening ? "ऐकणे थांबवा" : "मराठीत बोला (Voice Input)"}
      className={`relative flex items-center justify-center w-10 h-10 rounded-xl border transition ${
        listening
          ? "bg-[#FF6B00]/20 border-[#FF6B00] text-[#FF6B00] pulse-custom"
          : "bg-white/[0.04] border-white/10 text-slate-300 hover:text-white hover:border-[#FF6B00]/50"
      } disabled:opacity-50`}
    >
      {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      {listening && (
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#FF6B00] animate-ping" />
      )}
    </button>
  );
}

