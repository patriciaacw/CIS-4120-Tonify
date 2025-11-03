import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AccessibilitySettings {
  textSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  colorblindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  readAloudEnabled: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (updates: Partial<AccessibilitySettings>) => void;
  getTextSizeClass: () => string;
  getToneColor: (type: 'positive' | 'neutral' | 'negative' | 'uncertain') => string;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    textSize: 'medium',
    highContrast: false,
    colorblindMode: 'none',
    readAloudEnabled: false
  });

  const updateSettings = (updates: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const getTextSizeClass = () => {
    switch (settings.textSize) {
      case 'small':
        return 'text-sm';
      case 'large':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  const getToneColor = (type: 'positive' | 'neutral' | 'negative' | 'uncertain') => {
    // Standard colors (green=positive, yellow=neutral, red=negative)
    const standardColors = {
      positive: 'from-green-500 to-emerald-500',
      neutral: 'from-amber-500 to-yellow-500',
      negative: 'from-red-500 to-rose-500',
      uncertain: 'from-amber-500 to-orange-500'
    };

    // Colorblind-friendly alternatives
    const colorblindColors = {
      protanopia: {
        positive: 'from-blue-500 to-cyan-500',
        neutral: 'from-amber-500 to-yellow-500',
        negative: 'from-orange-500 to-red-500',
        uncertain: 'from-purple-500 to-pink-500'
      },
      deuteranopia: {
        positive: 'from-blue-500 to-cyan-500',
        neutral: 'from-amber-500 to-yellow-500',
        negative: 'from-orange-500 to-red-500',
        uncertain: 'from-purple-500 to-pink-500'
      },
      tritanopia: {
        positive: 'from-cyan-500 to-teal-500',
        neutral: 'from-red-500 to-pink-500',
        negative: 'from-red-500 to-orange-500',
        uncertain: 'from-purple-500 to-indigo-500'
      }
    };

    if (settings.colorblindMode !== 'none') {
      return colorblindColors[settings.colorblindMode][type];
    }

    return standardColors[type];
  };

  return (
    <AccessibilityContext.Provider value={{ settings, updateSettings, getTextSizeClass, getToneColor }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}
