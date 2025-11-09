//Generated with assistance from Chat GPT – Nov 8, 2025
import React, { useState, useEffect, useRef } from 'react';
import { ToneIndicator } from './ToneIndicator';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Sparkles, Send, RefreshCw, Lightbulb, Edit3, Info, MessageCircle, Settings, FlaskConical } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TonePreset } from './ToneSettings';
import { useToneSettings } from './ToneSettingsContext';
import { useAccessibility } from './AccessibilitySettings';
import { classifyTone, rewriteTone } from '../services/aiClient';

interface ComposeAreaProps {
  selectedPreset: string;
  allPresets: TonePreset[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

interface ToneAnalysis {
  originalText: string;
  detectedTone: {
    label: string;
    type: 'positive' | 'neutral' | 'negative' | 'uncertain';
    explanation: string;
    confidence?: number;
  };
  suggestions?: string[];
  alternativeText?: string;
  emojiSuggestions?: string[];
}

const analyzeTone = (text: string, preset: string, presetData?: any): ToneAnalysis | null => {
  if (!text.trim()) return null;

  const exclamationCount = (text.match(/!/g) || []).length;
  const hasAllCaps = /[A-Z]{3,}/.test(text);
  const isDry = text.trim().length < 10 && !/[!?.]/.test(text);
  
  // Get preset-specific guidelines
  const guidelines = presetData?.guidelines;

  // Helper function to generate preset-aware suggestions
  const getPresetSuggestions = (baseText: string, toneType: string) => {
    const suggestions: string[] = [];
    
    if (preset === 'professional' || guidelines?.targetTone?.toLowerCase().includes('professional') || guidelines?.targetTone?.toLowerCase().includes('formal')) {
      if (exclamationCount > 1) suggestions.push('Reduce exclamation marks for a more professional tone');
      if (hasAllCaps) suggestions.push('Avoid all caps in professional communication');
      if (isDry && toneType === 'negative') suggestions.push('Consider adding more context to be clearer');
      if (!text.match(/[.!?]$/)) suggestions.push('End with proper punctuation');
    } else if (preset === 'enthusiastic' || guidelines?.targetTone?.toLowerCase().includes('enthusiastic') || guidelines?.targetTone?.toLowerCase().includes('energetic')) {
      if (exclamationCount === 0) suggestions.push('Add an exclamation mark to show enthusiasm!');
      if (!text.match(/[😊🎉✨👍]/)) suggestions.push('Consider adding an energetic emoji');
      if (text.endsWith('.')) suggestions.push('Replace period with exclamation mark for more energy');
    } else if (preset === 'casual' || guidelines?.targetTone?.toLowerCase().includes('casual') || guidelines?.targetTone?.toLowerCase().includes('relaxed')) {
      if (text.length > 50) suggestions.push('Consider keeping it shorter and more casual');
      if (exclamationCount > 2) suggestions.push('This might be a bit much even for casual chat');
    } else if (preset === 'friendly-clear' || guidelines?.targetTone?.toLowerCase().includes('friendly') || guidelines?.targetTone?.toLowerCase().includes('warm')) {
      if (isDry) suggestions.push('Add some warmth with an emoji or friendly phrase');
      if (exclamationCount > 2) suggestions.push('Tone down the intensity slightly');
    }
    
    return suggestions;
  };

  // Example analyses based on common patterns
  if (text.includes("I'll be there later!!!")) {
    const suggestions = getPresetSuggestions(text, 'uncertain');
    const baseAlternative = preset === 'professional' 
      ? "I will be there later. Thank you for your patience."
      : preset === 'enthusiastic'
      ? "I'll be there later! So excited to see you!"
      : "I'll be there later! Looking forward to it.";
    
    return {
      originalText: text,
      detectedTone: {
        label: 'Excited but possibly overwhelming',
        type: 'uncertain',
        explanation: preset === 'professional' 
          ? 'Multiple exclamation marks may be too informal for a professional setting.'
          : 'Multiple exclamation marks show enthusiasm, but may come across as too intense in some contexts.',
        confidence: 82
      },
      suggestions: suggestions.length > 0 ? suggestions : [
        'Consider reducing exclamation marks for a calmer tone',
        `For ${preset} style: Try a more balanced approach`
      ],
      alternativeText: baseAlternative,
      emojiSuggestions: preset === 'professional' ? [] : ['😊', '👍', '✨']
    };
  }

  if (exclamationCount >= 3) {
    const suggestions = getPresetSuggestions(text, 'uncertain');
    const alternativeText = preset === 'professional'
      ? text.replace(/!+/g, '.')
      : preset === 'enthusiastic'
      ? text
      : text.replace(/!{3,}/g, '!');
    
    return {
      originalText: text,
      detectedTone: {
        label: preset === 'enthusiastic' ? 'Very Excited (fits your style!)' : 'Very Excited',
        type: preset === 'enthusiastic' ? 'positive' : 'uncertain',
        explanation: preset === 'professional'
          ? 'Multiple exclamation marks are not appropriate for professional communication.'
          : preset === 'enthusiastic'
          ? 'High energy matches your enthusiastic preset! This conveys excitement well.'
          : 'Multiple exclamation marks convey high energy and excitement, which might be overwhelming to some recipients.',
        confidence: 78
      },
      suggestions: suggestions.length > 0 ? suggestions : [
        preset === 'enthusiastic' ? 'Your enthusiasm shines through!' : 'Your message has high energy',
        preset === 'enthusiastic' ? 'This fits your energetic style well' : 'Consider reducing exclamation marks if you want a calmer tone'
      ],
      alternativeText: preset === 'enthusiastic' ? undefined : alternativeText,
      emojiSuggestions: preset === 'professional' ? [] : ['😊', '🎉', '✨']
    };
  }

  if (hasAllCaps) {
    const suggestions = getPresetSuggestions(text, 'negative');
    return {
      originalText: text,
      detectedTone: {
        label: 'Intense/Shouting',
        type: 'negative',
        explanation: preset === 'professional'
          ? 'All caps is unprofessional and can be perceived as aggressive.'
          : 'All caps can be perceived as shouting or aggressive, even if that\'s not your intent.',
        confidence: 88
      },
      suggestions: suggestions.length > 0 ? suggestions : [
        'ALL CAPS may come across as shouting',
        `For ${preset} style: Use normal capitalization`
      ],
      alternativeText: text.toLowerCase().charAt(0).toUpperCase() + text.toLowerCase().slice(1)
    };
  }

  if (isDry) {
    const suggestions = getPresetSuggestions(text, 'neutral');
    let alternativeText = text + '.';
    
    if (preset === 'friendly-clear') {
      alternativeText = text + ' 😊';
    } else if (preset === 'enthusiastic') {
      alternativeText = text + '!';
    } else if (preset === 'professional') {
      alternativeText = text + '. Thank you.';
    }
    
    return {
      originalText: text,
      detectedTone: {
        label: preset === 'casual' ? 'Brief & Casual' : 'Dry/Terse',
        type: preset === 'casual' ? 'neutral' : 'neutral',
        explanation: preset === 'casual'
          ? 'Short and to the point - fits a casual style, though could use punctuation.'
          : preset === 'professional'
          ? 'Very brief messages may seem dismissive in professional contexts.'
          : 'Short messages without punctuation can seem dismissive or uninterested.',
        confidence: 72
      },
      suggestions: suggestions.length > 0 ? suggestions : [
        preset === 'casual' ? 'Fits your casual style!' : 'This might seem a bit dry',
        preset === 'professional' ? 'Add more context for clarity' : 'Consider adding more context or a friendly emoji'
      ],
      alternativeText: preset === 'casual' ? undefined : alternativeText,
      emojiSuggestions: preset === 'professional' ? [] : ['😊', '👍', '🙂']
    };
  }

  if (text.toLowerCase().includes('sorry') || text.toLowerCase().includes('apologize')) {
    return {
      originalText: text,
      detectedTone: {
        label: 'Apologetic',
        type: 'neutral',
        explanation: 'Your message expresses regret or apology in a clear, sincere way.',
        confidence: 91
      },
      suggestions: [
        'Your apologetic tone comes through clearly',
        'This should be well-received'
      ],
      emojiSuggestions: ['🙏', '💙', '😔']
    };
  }

  if (text.includes('?') && text.split(' ').length <= 5) {
    return {
      originalText: text,
      detectedTone: {
        label: 'Curious',
        type: 'positive',
        explanation: 'Your question is direct and friendly, inviting conversation.',
        confidence: 85
      },
      suggestions: [
        'Your tone is friendly and inquisitive'
      ],
      emojiSuggestions: ['🤔', '😊', '👀']
    };
  }

  // Default neutral analysis with preset awareness
  const suggestions = getPresetSuggestions(text, 'neutral');
  let explanation = 'Your message has a balanced, conversational tone that should be well-received.';
  
  if (preset === 'professional' && guidelines) {
    explanation = 'Your message maintains an appropriate professional tone.';
  } else if (preset === 'enthusiastic' && !exclamationCount && guidelines) {
    explanation = 'Your message is clear, but could be more energetic for your enthusiastic style.';
  } else if (preset === 'casual' && text.length > 40 && guidelines) {
    explanation = 'Your message is clear, though slightly long for casual chat.';
  }
  
  return {
    originalText: text,
    detectedTone: {
      label: 'Neutral',
      type: 'neutral',
      explanation,
      confidence: 76
    },
    suggestions: suggestions.length > 0 ? suggestions : [
      `Your message tone fits the ${preset} style well`
    ],
    emojiSuggestions: preset === 'professional' ? [] : ['😊', '👍', '🙂']
  };
};

export function ComposeArea({ selectedPreset, allPresets, activeTab, onTabChange }: ComposeAreaProps) {
  const [message, setMessage] = useState('');
  const [analysis, setAnalysis] = useState<ToneAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [livePreview, setLivePreview] = useState<ToneAnalysis | null>(null);
  const analysisRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const { autoCheckEnabled, disableSuggestions, suggestionTrigger } = useToneSettings();
  const { settings } = useAccessibility();
  
  const currentPresetData = allPresets.find(p => p.id === selectedPreset);

  // Real-time tone feedback while typing
  useEffect(() => {
    if (autoCheckEnabled && message.trim()) {
      const timer = setTimeout(() => {
        const result = analyzeTone(message, selectedPreset, currentPresetData);
        setLivePreview(result);
      }, 500); // Debounce by 500ms
      return () => clearTimeout(timer);
    } else {
      setLivePreview(null);
    }
  }, [message, selectedPreset, currentPresetData, autoCheckEnabled]);

  // Auto-scroll to analysis results when they appear
  useEffect(() => {
    if (analysis && analysisRef.current && scrollContainerRef.current) {
      setTimeout(() => {
        analysisRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest' 
        });
      }, 100);
    }
  }, [analysis]);

  const handleAnalyze = async () => {
    if (!message.trim()) return;
    setIsAnalyzing(true);

    try {
      // 1) Ask AI what the tone is
      const tone = await classifyTone(message);

      // 2) Ask AI to rewrite to match the user’s preset style
      const targetTone =
        currentPresetData?.guidelines?.targetTone ||
        currentPresetData?.name ||
        selectedPreset ||
        "friendly";

      const rewrite = await rewriteTone(message, targetTone);

      const newAnalysis: ToneAnalysis = {
        originalText: message,
        detectedTone: {
          label: tone.label,
          type: tone.type,
          explanation: tone.explanation,
          confidence: tone.confidence
        },
        // Short explanatory suggestions from the classifier
        suggestions: tone.suggestions && tone.suggestions.length > 0
          ? tone.suggestions
          : undefined,
        // First full rewritten message as “Apply Suggested Version”
        alternativeText: rewrite.suggestions[0],
        // (we’ll skip emojiSuggestions for now)
        emojiSuggestions: []
      };

      setAnalysis(newAnalysis);
    } catch (err) {
      console.error(err);
      // fallback: clear analysis on error
      setAnalysis(null);
    } finally {
      setIsAnalyzing(false);
    }
  };


  const applyAlternative = () => {
    if (analysis?.alternativeText) {
      setMessage(analysis.alternativeText);
      setAnalysis(null);
    }
  };

  // Quick adjustment functions - preset aware
  const adjustTone = async (
    adjustment: 'calmer' | 'warmer' | 'shorter' | 'emoji' | 'formal' | 'energetic'
  ) => {
    if (!message.trim()) return;
    setIsAnalyzing(true);

    try {
      // describe what kind of rewrite we want
      let targetTone: string;
      switch (adjustment) {
        case 'calmer':
          targetTone = 'calm, de-escalating, non-confrontational';
          break;
        case 'warmer':
          targetTone = 'warm, friendly, supportive';
          break;
        case 'shorter':
          targetTone = 'short, concise, to-the-point but polite';
          break;
        case 'emoji':
          targetTone = 'similar meaning but a bit more playful with light emoji';
          break;
        case 'formal':
          targetTone = 'formal, professional, respectful';
          break;
        case 'energetic':
          targetTone = 'more energetic and enthusiastic';
          break;
      }

      const styleLabel =
        currentPresetData?.guidelines?.targetTone ||
        currentPresetData?.name ||
        selectedPreset;

      const rewrite = await rewriteTone(
        message,
        `${styleLabel} – ${targetTone}`
      );

      if (rewrite.suggestions && rewrite.suggestions.length > 0) {
        setMessage(rewrite.suggestions[0]);   // update textbox with AI rewrite
        setAnalysis(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };


  const exampleMessages = [
    "I'll be there later!!!",
    "Thanks SO MUCH for the help",
    "ok",
    "Sorry I missed your call earlier, was in a meeting"
  ];

  const loadExample = (example: string) => {
    setMessage(example);
    setAnalysis(null);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      {/* Tab Navigation Bar with Status Bar Spacing */}
      <div className="pt-[44px] bg-[#F6F6F6] shrink-0">
        <div className="w-full grid grid-cols-4 rounded-none border-b border-[#E5E5EA] bg-[#F9F9F9]/95 backdrop-blur-xl h-[49px]">
        <button 
          onClick={() => onTabChange?.('messages')}
          className="flex flex-col items-center justify-center gap-[2px] text-[#8E8E93] hover:text-[#007AFF] transition-colors"
        >
          <MessageCircle className="w-[25px] h-[25px]" strokeWidth={2} />
          <span className="text-[10px]">Messages</span>
        </button>
        <button className="flex flex-col items-center justify-center gap-[2px] text-[#007AFF]">
          <Sparkles className="w-[25px] h-[25px]" strokeWidth={2} />
          <span className="text-[10px]">Compose</span>
        </button>
        <button 
          onClick={() => onTabChange?.('settings')}
          className="flex flex-col items-center justify-center gap-[2px] text-[#8E8E93] hover:text-[#007AFF] transition-colors"
        >
          <Settings className="w-[25px] h-[25px]" strokeWidth={2} />
          <span className="text-[10px]">Settings</span>
        </button>
        <button 
          onClick={() => onTabChange?.('requirements')}
          className="flex flex-col items-center justify-center gap-[2px] text-[#8E8E93] hover:text-[#007AFF] transition-colors"
        >
          <FlaskConical className="w-[25px] h-[25px]" strokeWidth={2} />
          <span className="text-[10px]">Demo</span>
        </button>
        </div>
      </div>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto bg-white">
        <div className="p-4 pb-6 space-y-5">
        {/* Instructions */}
        <div className="bg-[#E8F0FE] border border-[#D2E3FC] rounded-xl p-3.5">
          <div className="flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-[#1967D2] mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-[#1967D2] text-[14px] mb-1">Pre-Send Tone Check</h3>
              <p className="text-[12px] text-[#1967D2]/80 leading-[1.5]">
                Write your message below and tap "Check Tone" to see how it might be perceived before sending.
              </p>
              {currentPresetData && (
                <div className="mt-2.5 pt-2.5 border-t border-[#D2E3FC]/50">
                  <p className="text-[12px] text-[#1967D2] leading-[1.5]">
                    <strong>Active style:</strong> {currentPresetData.name}
                    {currentPresetData.guidelines && (
                      <span className="block mt-1 text-[#1967D2]/70">
                        {currentPresetData.guidelines.targetTone}
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Current Preset Guidelines */}
        {currentPresetData?.guidelines && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5">
            <h4 className="text-[14px] text-gray-900 mb-2.5">Your {currentPresetData.name} Style Guide</h4>
            <div className="space-y-2.5 text-[12px]">
              {currentPresetData.guidelines.encourages.length > 0 && (
                <div>
                  <span className="text-green-700">Encourages:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {currentPresetData.guidelines.encourages.slice(0, 4).map((item, idx) => (
                      <span key={idx} className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {currentPresetData.guidelines.avoids.length > 0 && (
                <div>
                  <span className="text-red-700">Avoids:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {currentPresetData.guidelines.avoids.slice(0, 4).map((item, idx) => (
                      <span key={idx} className="bg-red-50 text-red-700 px-2 py-0.5 rounded-full">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Examples */}
        <div>
          <label className="text-[13px] text-gray-600 block mb-2">Try an example:</label>
          <div className="flex flex-wrap gap-2">
            {exampleMessages.map((example, idx) => (
              <button
                key={idx}
                onClick={() => loadExample(example)}
                className="text-[12px] px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-700"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Message Input with Live Preview */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-[13px] text-gray-600">Your message:</label>
            {livePreview && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1.5"
              >
                <span className="text-[10px] text-gray-500">Live tone:</span>
                <ToneIndicator tone={livePreview.detectedTone} size="sm" />
                <span className="text-[10px] text-gray-600">{livePreview.detectedTone.label}</span>
              </motion.div>
            )}
          </div>
          <Textarea
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setAnalysis(null);
            }}
            placeholder="Type your message here..."
            className={`min-h-[120px] resize-none transition-all ${
              livePreview?.detectedTone.type === 'negative' 
                ? 'border-red-300 focus:border-red-400' 
                : livePreview?.detectedTone.type === 'uncertain'
                ? 'border-amber-300 focus:border-amber-400'
                : livePreview?.detectedTone.type === 'positive'
                ? 'border-green-300 focus:border-green-400'
                : ''
            }`}
          />
          
          {/* Quick Adjustment Buttons - Preset Aware */}
          {message.trim() && !analysis && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-2 mt-2"
            >
              {selectedPreset === 'professional' ? (
                <>
                  <button
                    onClick={() => adjustTone('formal')}
                    className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded-md text-blue-700 transition-colors"
                  >
                    More formal
                  </button>
                  <button
                    onClick={() => adjustTone('warmer')}
                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors"
                  >
                    Add courtesy
                  </button>
                </>
              ) : selectedPreset === 'enthusiastic' ? (
                <>
                  <button
                    onClick={() => adjustTone('energetic')}
                    className="text-xs px-2 py-1 bg-amber-100 hover:bg-amber-200 rounded-md text-amber-700 transition-colors"
                  >
                    More energy
                  </button>
                  <button
                    onClick={() => adjustTone('calmer')}
                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors"
                  >
                    Tone down
                  </button>
                </>
              ) : selectedPreset === 'casual' ? (
                <>
                  <button
                    onClick={() => adjustTone('shorter')}
                    className="text-xs px-2 py-1 bg-green-100 hover:bg-green-200 rounded-md text-green-700 transition-colors"
                  >
                    Keep it brief
                  </button>
                  <button
                    onClick={() => adjustTone('emoji')}
                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors"
                  >
                    + Emoji
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => adjustTone('calmer')}
                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors"
                  >
                    Make calmer
                  </button>
                  <button
                    onClick={() => adjustTone('warmer')}
                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors"
                  >
                    Add warmth
                  </button>
                  <button
                    onClick={() => adjustTone('shorter')}
                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors"
                  >
                    Shorten
                  </button>
                  <button
                    onClick={() => adjustTone('emoji')}
                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors"
                  >
                    + Emoji
                  </button>
                </>
              )}
            </motion.div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 relative">
          <Button
            onClick={handleAnalyze}
            disabled={!message.trim() || isAnalyzing}
            className="flex-1 bg-[#007AFF] hover:bg-[#0051D5]"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Check Tone
              </>
            )}
          </Button>
        </div>

        {/* Analysis Results */}
        <AnimatePresence>
          {analysis && (
            <motion.div
              ref={analysisRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              {/* Tone Indicator */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <ToneIndicator tone={analysis.detectedTone} size="lg" />
                  <div className="flex-1">
                    <h4 className="text-gray-900">Detected Tone</h4>
                    <p className="text-sm text-gray-600">{analysis.detectedTone.label}</p>
                  </div>
                  {analysis.detectedTone.confidence && (
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Confidence</div>
                      <div className="text-sm text-gray-900">{analysis.detectedTone.confidence}%</div>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-700 bg-white rounded-lg p-3 border border-gray-100">
                  {analysis.detectedTone.explanation}
                </p>
                
                {/* Emoji Suggestions */}
                {analysis.emojiSuggestions && analysis.emojiSuggestions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-600">Suggested emojis:</span>
                    </div>
                    <div className="flex gap-2">
                      {analysis.emojiSuggestions.map((emoji, idx) => (
                        <button
                          key={idx}
                          onClick={() => setMessage(message + ' ' + emoji)}
                          className="text-lg px-2 py-1 bg-white border border-gray-200 rounded-lg hover:border-[#007AFF] hover:bg-[#007AFF]/5 transition-all"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Suggestions */}
              {!disableSuggestions && analysis.suggestions && analysis.suggestions.length > 0 && (() => {
                // Check if suggestions should be shown based on suggestionTrigger setting
                if (suggestionTrigger === 'never') return null;
                if (suggestionTrigger === 'negative' && analysis.detectedTone.type !== 'negative') return null;
                if (suggestionTrigger === 'uncertain' && !['negative', 'uncertain'].includes(analysis.detectedTone.type)) return null;
                
                return (
                  <div className="bg-[#E8F0FE] border border-[#D2E3FC] rounded-xl p-3">
                    <h4 className="text-[#1967D2] mb-2 text-sm">Suggestions</h4>
                    <ul className="space-y-1.5">
                      {analysis.suggestions.map((suggestion, idx) => (
                        <li key={idx} className="text-xs text-[#1967D2] flex items-start gap-2">
                          <span className="text-[#1967D2]/60 mt-0.5">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {analysis.alternativeText && (
                      <Button
                        onClick={applyAlternative}
                        variant="outline"
                        size="sm"
                        className="mt-2 w-full border-[#D2E3FC] text-[#1967D2] hover:bg-[#D2E3FC]/30"
                      >
                        <RefreshCw className="w-3 h-3 mr-2" />
                        Apply Suggested Version
                      </Button>
                    )}
                  </div>
                );
              })()}

              {/* Edit & Send Buttons */}
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    // Keep the analysis visible but allow editing
                    setAnalysis(null);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Message
                </Button>
                <Button className="flex-1 bg-[#34C759] hover:bg-[#2FB350]">
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
