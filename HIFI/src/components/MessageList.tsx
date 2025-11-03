import React, { useState } from 'react';
import { ToneIndicator } from './ToneIndicator';
import { SuggestedReplies } from './SuggestedReplies';
import { motion, AnimatePresence } from 'motion/react';
import { Info, HelpCircle } from 'lucide-react';
import { useToneSettings } from './ToneSettingsContext';
import { useAccessibility } from './AccessibilitySettings';

interface Message {
  id: string;
  text: string;
  sender: 'them' | 'me';
  senderName?: string;
  tone?: {
    label: string;
    type: 'positive' | 'neutral' | 'negative' | 'uncertain';
    explanation: string;
    confidence?: number; // 0-100 confidence score
  };
  timestamp: string;
  suggestedReplies?: Array<{
    text: string;
    tone: string;
  }>;
}

const mockMessages: Message[] = [
  {
    id: '1',
    text: "Hey! Want to grab lunch tomorrow?",
    sender: 'them',
    senderName: 'Sarah',
    tone: {
      label: 'Friendly',
      type: 'positive',
      explanation: 'This message is warm and inviting with a casual, upbeat tone.',
      confidence: 92
    },
    timestamp: '10:23 AM',
    suggestedReplies: [
      { text: "Sure! 😊", tone: "Friendly" },
      { text: "Yes, sounds great!", tone: "Enthusiastic" },
      { text: "That works for me", tone: "Neutral" }
    ]
  },
  {
    id: '2',
    text: "Yeah sounds good!",
    sender: 'me',
    timestamp: '10:25 AM'
  },
  {
    id: '3',
    text: "fine.",
    sender: 'them',
    senderName: 'Sarah',
    tone: {
      label: 'Upset',
      type: 'negative',
      explanation: 'The lowercase and period suggest annoyance or frustration. This is likely not genuinely "fine".',
      confidence: 78
    },
    timestamp: '2:15 PM',
    suggestedReplies: [
      { text: "Is everything okay?", tone: "Caring" },
      { text: "Did I do something wrong?", tone: "Concerned" },
      { text: "Want to talk about it?", tone: "Supportive" }
    ]
  },
  {
    id: '4',
    text: "Did I do something wrong?",
    sender: 'me',
    timestamp: '2:17 PM'
  },
  {
    id: '5',
    text: "No sorry! I'm just stressed about work",
    sender: 'them',
    senderName: 'Sarah',
    tone: {
      label: 'Apologetic',
      type: 'neutral',
      explanation: 'This message shows genuine apology and explains the previous short response. The tone is sincere.',
      confidence: 88
    },
    timestamp: '2:18 PM',
    suggestedReplies: [
      { text: "No worries! Let me know if I can help", tone: "Supportive" },
      { text: "I understand, hope it gets better!", tone: "Caring" },
      { text: "Thanks for letting me know 💙", tone: "Warm" }
    ]
  },
  {
    id: '6',
    text: "wow really?",
    sender: 'them',
    senderName: 'Mike',
    tone: {
      label: 'Surprised',
      type: 'uncertain',
      explanation: 'Could be genuine surprise or sarcastic disbelief. Context from previous messages would help clarify.',
      confidence: 54
    },
    timestamp: '3:45 PM',
    suggestedReplies: [
      { text: "Yeah! Pretty cool right?", tone: "Enthusiastic" },
      { text: "Yep, it's true", tone: "Neutral" },
      { text: "I know, surprised me too!", tone: "Friendly" }
    ]
  },
  {
    id: '7',
    text: "k",
    sender: 'them',
    senderName: 'Alex',
    tone: {
      label: 'Possibly Upset',
      type: 'negative',
      explanation: 'Single letter "k" often indicates annoyance or passive aggression. A longer "okay" would be more neutral.',
      confidence: 65
    },
    timestamp: '4:12 PM',
    suggestedReplies: [
      { text: "Everything alright?", tone: "Concerned" },
      { text: "Thanks for letting me know", tone: "Neutral" },
      { text: "Talk soon!", tone: "Friendly" }
    ]
  }
];

export function MessageList() {
  const [expandedTone, setExpandedTone] = useState<string | null>(null);
  const [showRepliesFor, setShowRepliesFor] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(true);
  const { getConfidenceBarColor } = useAccessibility();
  const { suggestionTrigger, disableSuggestions } = useToneSettings();

  const toggleToneExplanation = (messageId: string) => {
    setExpandedTone(expandedTone === messageId ? null : messageId);
    if (showHint) setShowHint(false);
  };

  const toggleSuggestedReplies = (messageId: string) => {
    setShowRepliesFor(showRepliesFor === messageId ? null : messageId);
  };

  return (
    <div className="h-full overflow-y-auto bg-white">
      {/* Info Banner */}
      <div className="sticky top-0 bg-[#E8F0FE] border-b border-[#D2E3FC] px-4 py-2.5 flex items-start gap-2 z-10">
        <Info className="w-4 h-4 text-[#1967D2] mt-0.5 flex-shrink-0" />
        <p className="text-xs text-[#1967D2]">
          Tap tone indicators to understand the emotional context of messages
        </p>
      </div>

      <div className="px-4 py-4 pb-6 space-y-3">
        {mockMessages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[75%] ${message.sender === 'them' ? 'space-y-1' : ''}`}>
              {message.sender === 'them' && message.senderName && (
                <div className="text-xs text-gray-500 px-3">{message.senderName}</div>
              )}
              
              <div className="flex items-start gap-2">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`rounded-[18px] px-3.5 py-2 ${
                    message.sender === 'me'
                      ? 'bg-[#007AFF] text-white'
                      : 'bg-[#E9E9EB] text-black'
                  }`}
                >
                  <p className="text-[15px]">{message.text}</p>
                  <div className="text-[11px] opacity-60 mt-0.5">{message.timestamp}</div>
                </motion.div>

                {message.tone && (() => {
                  // Don't show tone indicators if disabled
                  if (disableSuggestions || suggestionTrigger === 'never') return null;
                  
                  // Only show negative tones if set to negative
                  if (suggestionTrigger === 'negative' && message.tone.type !== 'negative') return null;
                  
                  // Only show negative or uncertain tones if set to uncertain
                  if (suggestionTrigger === 'uncertain' && !['negative', 'uncertain'].includes(message.tone.type)) return null;
                  
                  return (
                    <button
                      onClick={() => toggleToneExplanation(message.id)}
                      className="flex-shrink-0 mt-1"
                    >
                      <ToneIndicator 
                        tone={message.tone} 
                        isExpanded={expandedTone === message.id}
                      />
                    </button>
                  );
                })()}
              </div>

              <AnimatePresence>
                {message.tone && expandedTone === message.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 px-3 py-2 bg-[#F6F6F6] rounded-xl border border-gray-200">
                      <p className="text-xs text-gray-700 mb-2">{message.tone.explanation}</p>
                      {message.tone.confidence && (
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-300">
                          <span className="text-[10px] text-gray-500">Confidence:</span>
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${getConfidenceBarColor(message.tone.confidence)} rounded-full transition-all`}
                              style={{ width: `${message.tone.confidence}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-gray-600">{message.tone.confidence}%</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Suggested Replies */}
              {message.suggestedReplies && message.sender === 'them' && (
                <>
                  <button
                    onClick={() => toggleSuggestedReplies(message.id)}
                    className="text-[10px] text-[#007AFF] mt-1 px-3 hover:underline"
                  >
                    {showRepliesFor === message.id ? 'Hide' : 'Show'} suggested replies
                  </button>
                  <AnimatePresence>
                    {showRepliesFor === message.id && (
                      <SuggestedReplies replies={message.suggestedReplies} />
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
