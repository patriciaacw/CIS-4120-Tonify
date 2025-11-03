import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ToneSettingsContextType {
  showTonesOnAll: boolean;
  setShowTonesOnAll: (value: boolean) => void;
  autoCheckEnabled: boolean;
  setAutoCheckEnabled: (value: boolean) => void;
  compactMode: boolean;
  setCompactMode: (value: boolean) => void;
  disableSuggestions: boolean;
  setDisableSuggestions: (value: boolean) => void;
  suggestionTrigger: 'always' | 'negative' | 'uncertain' | 'never';
  setSuggestionTrigger: (value: 'always' | 'negative' | 'uncertain' | 'never') => void;
}

const ToneSettingsContext = createContext<ToneSettingsContextType | null>(null);

export function ToneSettingsProvider({ children }: { children: ReactNode }) {
  const [showTonesOnAll, setShowTonesOnAll] = useState(true);
  const [autoCheckEnabled, setAutoCheckEnabled] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [disableSuggestions, setDisableSuggestions] = useState(false);
  const [suggestionTrigger, setSuggestionTrigger] = useState<'always' | 'negative' | 'uncertain' | 'never'>('always');

  return (
    <ToneSettingsContext.Provider
      value={{
        showTonesOnAll,
        setShowTonesOnAll,
        autoCheckEnabled,
        setAutoCheckEnabled,
        compactMode,
        setCompactMode,
        disableSuggestions,
        setDisableSuggestions,
        suggestionTrigger,
        setSuggestionTrigger,
      }}
    >
      {children}
    </ToneSettingsContext.Provider>
  );
}

export function useToneSettings() {
  const context = useContext(ToneSettingsContext);
  if (!context) {
    throw new Error('useToneSettings must be used within ToneSettingsProvider');
  }
  return context;
}
