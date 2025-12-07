//Generated with assistance from ChatGPT -- December 6, 2025
import React, { useState, useEffect, useRef } from 'react';
import { ToneIndicator } from './ToneIndicator';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import {
  Sparkles,
  RefreshCw,
  Lightbulb,
  Edit3,
  MessageCircle,
  Settings,
} from 'lucide-react';
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
  onSend?: (text: string) => void; // still available but no UI button
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

export function ComposeArea({
  selectedPreset,
  allPresets,
  activeTab,
  onTabChange,
  onSend,
}: ComposeAreaProps) {
  const [message, setMessage] = useState('');
  const [analysis, setAnalysis] = useState<ToneAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 🔹 Live tone preview that should match detected tone
  const [livePreview, setLivePreview] = useState<ToneAnalysis | null>(null);

  const analysisRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { disableSuggestions, suggestionTrigger } = useToneSettings();
  const { settings } = useAccessibility(); // kept for future use / consistency

  const currentPresetData = allPresets.find((p) => p.id === selectedPreset);

  // A simple request counter to avoid race conditions in live tone API calls
  const latestRequestId = useRef(0);

  // 🔹 LIVE TONE: use classifyTone, but only when user pauses + message is long enough
  useEffect(() => {
    const trimmed = message.trim();

    // If empty or very short, don't analyze
    if (!trimmed || trimmed.length < 5) {
      setLivePreview(null);
      return;
    }

    const thisRequestId = ++latestRequestId.current;

    // Show quick placeholder so the pill appears immediately
    setLivePreview((prev) => ({
      originalText: message,
      detectedTone: {
        label: 'Analyzing…',
        type: 'uncertain',
        explanation: 'Analyzing tone...',
        confidence: undefined,
      },
      suggestions: prev?.suggestions,
      emojiSuggestions: prev?.emojiSuggestions ?? [],
    }));

    // Wait longer before hitting the API so we don't fire on every keystroke
    const timer = setTimeout(async () => {
      try {
        const tone = await classifyTone(message);
        if (!tone) return;

        // Only apply if this is still the latest request
        if (thisRequestId !== latestRequestId.current) return;

        setLivePreview({
          originalText: message,
          detectedTone: {
            label: tone.label,
            type: tone.type,
            explanation: tone.explanation,
            confidence: tone.confidence,
          },
          suggestions:
            tone.suggestions && tone.suggestions.length > 0
              ? tone.suggestions
              : [],
          emojiSuggestions: [],
        });
      } catch (err) {
        console.error('Live tone classify failed:', err);
        if (thisRequestId === latestRequestId.current) {
          setLivePreview(null);
        }
      }
    }, 1200); // was 400ms, now 1.2s pause before we call the API

    return () => clearTimeout(timer);
  }, [message, selectedPreset, currentPresetData]);

  // Auto-scroll to analysis card when it appears
  useEffect(() => {
    if (analysis && analysisRef.current && scrollContainerRef.current) {
      setTimeout(() => {
        analysisRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }, 100);
    }
  }, [analysis]);

  // 🔹 Helper: build preset-aware suggestions from guidelines + detected tone
  const buildPresetSuggestions = (
    msg: string,
    toneResult: {
      label: string;
      type: 'positive' | 'neutral' | 'negative' | 'uncertain';
      explanation: string;
      confidence?: number;
      suggestions?: string[];
    },
    preset: string,
    presetData?: TonePreset
  ): string[] => {
    const presetSuggestions: string[] = [];

    if (!presetData?.guidelines) return presetSuggestions;

    const g = presetData.guidelines;

    // High-level reminder of target tone
    if (g.targetTone) {
      presetSuggestions.push(
        `For your "${presetData.name}" preset, aim for: ${g.targetTone}.`
      );
    }

    // Encourage things user said they want
    if (g.encourages && g.encourages.length > 0) {
      const topEncourages = g.encourages.slice(0, 2).join(', ');
      presetSuggestions.push(`Try including: ${topEncourages}.`);
    }

    // Only emphasize "avoids" when tone is negative/uncertain or explanation hints at issues
    if (
      (toneResult.type === 'negative' || toneResult.type === 'uncertain') &&
      g.avoids &&
      g.avoids.length > 0
    ) {
      const topAvoids = g.avoids.slice(0, 2).join(', ');
      presetSuggestions.push(`Watch out for: ${topAvoids}.`);
    }

    return presetSuggestions;
  };

  const handleSendFromCompose = () => {
    const text = message.trim();
    if (!text) return;

    if (onSend) {
      onSend(text);          // send to Firebase / backend
    }

    setAnalysis(null);       // clear analysis
    setMessage('');          // clear textarea
  };

  const handleAnalyze = async () => {
    if (!message.trim()) return;
    setIsAnalyzing(true);

    try {
      // 🔹 If livePreview is already for this exact text and not "Analyzing…",
      // reuse it so detected tone == live tone.
      let toneResult:
        | {
            label: string;
            type: 'positive' | 'neutral' | 'negative' | 'uncertain';
            explanation: string;
            confidence?: number;
            suggestions?: string[];
          }
        | null = null;

      if (
        livePreview &&
        livePreview.originalText === message &&
        livePreview.detectedTone.label !== 'Analyzing…'
      ) {
        toneResult = {
          label: livePreview.detectedTone.label,
          type: livePreview.detectedTone.type,
          explanation: livePreview.detectedTone.explanation,
          confidence: livePreview.detectedTone.confidence,
          suggestions: livePreview.suggestions,
        };
      } else {
        const tone = await classifyTone(message);
        if (!tone) {
          setIsAnalyzing(false);
          return;
        }
        toneResult = tone;
      }

      // 🔹 Build combined suggestions: AI suggestions + preset-aware guidance
      const aiSuggestions =
        toneResult.suggestions && toneResult.suggestions.length > 0
          ? toneResult.suggestions
          : [];

      const presetAware = buildPresetSuggestions(
        message,
        toneResult,
        selectedPreset,
        currentPresetData
      );

      const combinedSuggestions = [...aiSuggestions, ...presetAware];

      const targetTone =
        currentPresetData?.guidelines?.targetTone ||
        currentPresetData?.name ||
        selectedPreset ||
        'friendly';

      const rewrite = await rewriteTone(message, targetTone);

      const newAnalysis: ToneAnalysis = {
        originalText: message,
        detectedTone: {
          label: toneResult.label,
          type: toneResult.type,
          explanation: toneResult.explanation,
          confidence: toneResult.confidence,
        },
        suggestions:
          combinedSuggestions.length > 0 ? combinedSuggestions : undefined,
        alternativeText: rewrite.suggestions?.[0],
        emojiSuggestions: [],
      };

      setAnalysis(newAnalysis);
    } catch (err) {
      console.error(err);
      setAnalysis(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyAlternative = () => {
    if (analysis?.alternativeText) {
      setMessage(analysis.alternativeText);
      setAnalysis(null);
      // livePreview will auto-refresh because message changed
    }
  };

  const adjustTone = async (
    adjustment: 'calmer' | 'warmer' | 'shorter' | 'emoji' | 'formal' | 'energetic'
  ) => {
    if (!message.trim()) return;
    setIsAnalyzing(true);

    try {
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
          targetTone =
            'similar meaning but a bit more playful with light emoji';
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

      const rewrite = await rewriteTone(message, `${styleLabel} – ${targetTone}`);

      if (rewrite.suggestions && rewrite.suggestions.length > 0) {
        setMessage(rewrite.suggestions[0]);
        setAnalysis(null);
        // livePreview will update automatically
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exampleMessages = [
    "I'll be there later!!!",
    'Thanks SO MUCH for the help',
    'ok',
    'Sorry I missed your call earlier, was in a meeting',
  ];

  const loadExample = (example: string) => {
    setMessage(example);
    setAnalysis(null);
    // livePreview will update automatically
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      {/* Tab Navigation Bar with Status Bar Spacing */}
      <div className="pt-[44px] bg-[#F6F6F6] shrink-0">
        <div className="w-full flex justify-around border-b border-[#E5E5EA] bg-[#F9F9F9]/95 backdrop-blur-xl h-[49px]">
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
        </div>
      </div>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto bg-white">
        <div className="p-4 pb-6 space-y-5">
          {/* Instructions */}
          <div className="bg-[#E8F0FE] border border-[#D2E3FC] rounded-xl p-3.5">
            <div className="flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-[#1967D2] mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-[#1967D2] text-[14px] mb-1">
                  Pre-Send Tone Check
                </h3>
                <p className="text-[12px] text-[#1967D2]/80 leading-[1.5]">
                  Write your message below and tap &quot;Check Tone&quot; to see
                  how it might be perceived before sending.
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
              <h4 className="text-[14px] text-gray-900 mb-2.5">
                Your {currentPresetData.name} Style Guide
              </h4>
              <div className="space-y-2.5 text-[12px]">
                {currentPresetData.guidelines.encourages.length > 0 && (
                  <div>
                    <span className="text-green-700">Encourages:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {currentPresetData.guidelines.encourages
                        .slice(0, 4)
                        .map((item, idx) => (
                          <span
                            key={idx}
                            className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full"
                          >
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
                      {currentPresetData.guidelines.avoids
                        .slice(0, 4)
                        .map((item, idx) => (
                          <span
                            key={idx}
                            className="bg-red-50 text-red-700 px-2 py-0.5 rounded-full"
                          >
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
            <label className="text-[13px] text-gray-600 block mb-2">
              Try an example:
            </label>
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
            <div className="flex items-center justify_between mb-2.5">
              <label className="text-[13px] text-gray-600">
                Your message:
              </label>
              {livePreview && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1.5"
                >
                  <span className="text-[10px] text-gray-500">
                    Live tone:
                  </span>
                  <ToneIndicator tone={livePreview.detectedTone} size="sm" />
                  <span className="text-[10px] text-gray-600">
                    {livePreview.detectedTone.label}
                  </span>
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

              {/* Send from Compose */}
              <Button
                onClick={handleSendFromCompose}
                disabled={!message.trim() || !onSend}
                variant="outline"
                className="flex-1"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Send
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
                      <p className="text-sm text-gray-600">
                        {analysis.detectedTone.label}
                      </p>
                    </div>
                    {analysis.detectedTone.confidence && (
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Confidence</div>
                        <div className="text-sm text-gray-900">
                          {analysis.detectedTone.confidence}%
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 bg-white rounded-lg p-3 border border-gray-100">
                    {analysis.detectedTone.explanation}
                  </p>

                  {analysis.emojiSuggestions &&
                    analysis.emojiSuggestions.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="w-3 h-3 text-gray-500" />
                          <span className="text-xs text-gray-600">
                            Suggested emojis:
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {analysis.emojiSuggestions.map((emoji, idx) => (
                            <button
                              key={idx}
                              onClick={() =>
                                setMessage((prev) => `${prev} ${emoji}`)
                              }
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
                {!disableSuggestions &&
                  analysis.suggestions &&
                  analysis.suggestions.length > 0 &&
                  (() => {
                    if (suggestionTrigger === 'never') return null;
                    if (
                      suggestionTrigger === 'negative' &&
                      analysis.detectedTone.type !== 'negative'
                    )
                      return null;
                    if (
                      suggestionTrigger === 'uncertain' &&
                      !['negative', 'uncertain'].includes(
                        analysis.detectedTone.type
                      )
                    )
                      return null;

                    return (
                      <div className="bg-[#E8F0FE] border border-[#D2E3FC] rounded-xl p-3">
                        <h4 className="text-[#1967D2] mb-2 text-sm">
                          Suggestions
                        </h4>
                        <ul className="space-y-1.5">
                          {analysis.suggestions.map((suggestion, idx) => (
                            <li
                              key={idx}
                              className="text-xs text-[#1967D2] flex items-start gap-2"
                            >
                              <span className="text-[#1967D2]/60 mt-0.5">
                                •
                              </span>
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

                {/* Edit button only (no Send) */}
                <div className="flex">
                  <Button
                    onClick={() => {
                      setAnalysis(null);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Message
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
