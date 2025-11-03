import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AccessibilitySettings {
  highContrast: boolean;
  colorblindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  readAloudEnabled: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (updates: Partial<AccessibilitySettings>) => void;
  getToneColor: (type: 'positive' | 'neutral' | 'negative' | 'uncertain') => string;
  getToneColorClasses: (type: 'positive' | 'neutral' | 'negative' | 'uncertain', highContrast?: boolean) => string;
  getConfidenceBarColor: (confidence: number) => string;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    colorblindMode: 'none',
    readAloudEnabled: false
  });

  const updateSettings = (updates: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
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

  const getToneColorClasses = (type: 'positive' | 'neutral' | 'negative' | 'uncertain', highContrast = false) => {
    const borderWidth = highContrast ? 'border-4' : 'border-2';
    
    // Standard colors (green=positive, yellow=neutral, red=negative)
    const standardColors = {
      positive: `bg-green-100 border-green-500 text-green-700 ${borderWidth}`,
      neutral: `bg-yellow-100 border-yellow-500 text-yellow-700 ${borderWidth}`,
      negative: `bg-red-100 border-red-500 text-red-700 ${borderWidth}`,
      uncertain: `bg-amber-100 border-amber-500 text-amber-700 ${borderWidth}`
    };

    // Colorblind-friendly alternatives
    const colorblindColors = {
      protanopia: {
        positive: `bg-blue-100 border-blue-500 text-blue-700 ${borderWidth}`,
        neutral: `bg-amber-100 border-amber-500 text-amber-700 ${borderWidth}`,
        negative: `bg-orange-100 border-orange-600 text-orange-800 ${borderWidth}`,
        uncertain: `bg-purple-100 border-purple-500 text-purple-700 ${borderWidth}`
      },
      deuteranopia: {
        positive: `bg-blue-100 border-blue-500 text-blue-700 ${borderWidth}`,
        neutral: `bg-amber-100 border-amber-500 text-amber-700 ${borderWidth}`,
        negative: `bg-orange-100 border-orange-600 text-orange-800 ${borderWidth}`,
        uncertain: `bg-purple-100 border-purple-500 text-purple-700 ${borderWidth}`
      },
      tritanopia: {
        positive: `bg-cyan-100 border-cyan-500 text-cyan-700 ${borderWidth}`,
        neutral: `bg-pink-100 border-pink-500 text-pink-700 ${borderWidth}`,
        negative: `bg-rose-100 border-rose-600 text-rose-800 ${borderWidth}`,
        uncertain: `bg-purple-100 border-purple-500 text-purple-700 ${borderWidth}`
      }
    };

    if (settings.colorblindMode !== 'none') {
      return colorblindColors[settings.colorblindMode][type];
    }

    return standardColors[type];
  };

  const getConfidenceBarColor = (confidence: number) => {
    // Determine base color based on confidence level
    let baseColor = 'bg-red-500';
    if (confidence > 70) baseColor = 'bg-green-500';
    else if (confidence > 40) baseColor = 'bg-amber-500';

    // Apply colorblind-friendly alternatives if needed
    if (settings.colorblindMode !== 'none') {
      if (confidence > 70) {
        // High confidence - use blue for protanopia/deuteranopia, cyan for tritanopia
        return settings.colorblindMode === 'tritanopia' ? 'bg-cyan-500' : 'bg-blue-500';
      } else if (confidence > 40) {
        // Medium confidence - keep amber (works for all types)
        return 'bg-amber-500';
      } else {
        // Low confidence - use orange for protanopia/deuteranopia, rose for tritanopia
        return settings.colorblindMode === 'tritanopia' ? 'bg-rose-500' : 'bg-orange-600';
      }
    }

    return baseColor;
  };

  return (
    <AccessibilityContext.Provider value={{ settings, updateSettings, getToneColor, getToneColorClasses, getConfidenceBarColor }}>
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
