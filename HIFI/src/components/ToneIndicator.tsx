import React from 'react';
import { Smile, Frown, Meh, HelpCircle, Volume2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useAccessibility } from './AccessibilitySettings';

interface ToneIndicatorProps {
  tone: {
    label: string;
    type: 'positive' | 'neutral' | 'negative' | 'uncertain';
    explanation?: string;
    confidence?: number;
  };
  isExpanded?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showConfidence?: boolean;
}

export function ToneIndicator({ tone, isExpanded = false, size = 'md', showConfidence = false }: ToneIndicatorProps) {
  const { settings, getToneColorClasses } = useAccessibility();
  
  const getColorClasses = () => {
    return getToneColorClasses(tone.type, settings.highContrast);
  };

  const getIcon = () => {
    const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
    
    switch (tone.type) {
      case 'positive':
        return <Smile className={iconSize} />;
      case 'negative':
        return <Frown className={iconSize} />;
      case 'neutral':
        return <Meh className={iconSize} />;
      case 'uncertain':
        return <HelpCircle className={iconSize} />;
      default:
        return <Meh className={iconSize} />;
    }
  };

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  // Confidence dots (5-dot system)
  const getConfidenceDots = () => {
    if (!tone.confidence || !showConfidence) return null;
    
    const dotCount = Math.ceil(tone.confidence / 20); // 0-20=1, 21-40=2, 41-60=3, 61-80=4, 81-100=5
    const dots = Array.from({ length: 5 }, (_, i) => i < dotCount);
    
    let dotColor = 'bg-gray-300';
    if (tone.confidence > 70) dotColor = 'bg-green-500';
    else if (tone.confidence > 40) dotColor = 'bg-amber-500';
    else dotColor = 'bg-red-500';
    
    return (
      <div className="flex gap-0.5 mt-1">
        {dots.map((filled, idx) => (
          <div
            key={idx}
            className={`w-1 h-1 rounded-full ${filled ? dotColor : 'bg-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const handleReadAloud = (e: React.MouseEvent) => {
    if (settings.readAloudEnabled && tone.explanation) {
      e.stopPropagation();
      const utterance = new SpeechSynthesisUtterance(
        `${tone.label}. ${tone.explanation}`
      );
      // Adjust voice based on tone type
      if (tone.type === 'positive') {
        utterance.pitch = 1.2;
      } else if (tone.type === 'negative') {
        utterance.pitch = 0.9;
      }
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="relative inline-flex flex-col items-center">
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={`${sizeClasses[size]} ${getColorClasses()} rounded-full flex items-center justify-center transition-all ${
          isExpanded ? 'ring-2 ring-offset-1 ring-current' : ''
        }`}
        title={tone.label}
      >
        {getIcon()}
      </motion.div>
      {showConfidence && getConfidenceDots()}
      {settings.readAloudEnabled && tone.explanation && (
        <button
          onClick={handleReadAloud}
          className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
          title="Read aloud"
        >
          <Volume2 className="w-2.5 h-2.5 text-gray-600" />
        </button>
      )}
    </div>
  );
}
