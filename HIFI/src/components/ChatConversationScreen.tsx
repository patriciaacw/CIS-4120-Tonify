import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Camera, Mic, Plus, Info as InfoIcon, MessageCircle, Sparkles, Settings, FlaskConical } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ToneIndicator } from './ToneIndicator';
import { SuggestedReplies } from './SuggestedReplies';
import { TonePreset } from './ToneSettings';
import { useAccessibility } from './AccessibilitySettings';
import { useToneSettings } from './ToneSettingsContext';
import { sendMessage, subscribeToMessages } from '../services/messageService';

interface Message {
  id: string;
  text: string;
  sender: 'them' | 'me';
  senderName?: string;
  tone?: {
    label: string;
    type: 'positive' | 'neutral' | 'negative' | 'uncertain';
    explanation: string;
    confidence?: number;
  };
  timestamp: string;
  suggestedReplies?: Array<{
    text: string;
    tone: string;
  }>;
}

interface ChatConversationScreenProps {
  userId: string;
  chatId: string;
  chatName: string;
  isGroup: boolean;
  onBack: () => void;
  selectedPreset: string;
  allPresets: TonePreset[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onMessagePreviewUpdate?: (chatId: string, text: string, timestamp?: number) => void;
}

// Mock conversation data
const getConversationMessages = (chatId: string): Message[] => {
  const conversations: Record<string, Message[]> = {
    '1': [
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
      }
    ],
    '2': [
      {
        id: '1',
        text: "I just got the internship at Google!",
        sender: 'me',
        timestamp: '3:42 PM'
      },
      {
        id: '2',
        text: "wow really?",
        sender: 'them',
        senderName: 'Mike',
        tone: {
          label: 'Surprised',
          type: 'uncertain',
          explanation: 'Could be genuine surprise or sarcastic disbelief. Context would help clarify.',
          confidence: 54
        },
        timestamp: '3:45 PM',
        suggestedReplies: [
          { text: "Yeah! Pretty cool right?", tone: "Enthusiastic" },
          { text: "Yep, it's true", tone: "Neutral" },
          { text: "I know, surprised me too!", tone: "Friendly" }
        ]
      }
    ],
    '3': [
      {
        id: '1',
        text: "Hey everyone! Can we meet tomorrow to review?",
        sender: 'them',
        senderName: 'Alex',
        tone: {
          label: 'Friendly',
          type: 'positive',
          explanation: 'Warm invitation to collaborate with the group.',
          confidence: 89
        },
        timestamp: '4:05 PM'
      },
      {
        id: '2',
        text: "Works for me!",
        sender: 'them',
        senderName: 'Jordan',
        timestamp: '4:07 PM'
      },
      {
        id: '3',
        text: "Yeah I can make it",
        sender: 'me',
        timestamp: '4:09 PM'
      },
      {
        id: '4',
        text: "Can we meet tomorrow?",
        sender: 'them',
        senderName: 'Alex',
        timestamp: '4:12 PM',
        suggestedReplies: [
          { text: "Yes, what time?", tone: "Helpful" },
          { text: "Sure! Where?", tone: "Friendly" },
          { text: "Sounds good 👍", tone: "Casual" }
        ]
      }
    ]
  };

  return conversations[chatId] || [];
};

// Tone analysis function
const analyzeTone = (text: string, preset: string, presetData?: TonePreset) => {
  if (!text.trim()) return null;

  const exclamationCount = (text.match(/!/g) || []).length;
  const hasAllCaps = /[A-Z]{3,}/.test(text);
  const isDry = text.trim().length < 10 && !/[!?.]/.test(text);

  if (exclamationCount >= 3) {
    return {
      label: preset === 'enthusiastic' ? 'Very Excited (fits your style!)' : 'Very Excited',
      type: preset === 'enthusiastic' ? 'positive' : 'uncertain',
      confidence: 78
    } as const;
  }

  if (hasAllCaps) {
    return {
      label: 'Intense/Shouting',
      type: 'negative',
      confidence: 88
    } as const;
  }

  if (isDry) {
    return {
      label: preset === 'casual' ? 'Brief & Casual' : 'Dry/Terse',
      type: 'neutral',
      confidence: 72
    } as const;
  }

  return {
    label: 'Neutral',
    type: 'neutral',
    confidence: 76
  } as const;
};

export function ChatConversationScreen({ 
  userId,
  chatId, 
  chatName, 
  isGroup, 
  onBack,
  selectedPreset,
  allPresets,
  activeTab = 'messages',
  onTabChange = () => {}, 
  onMessagePreviewUpdate,
}: ChatConversationScreenProps) {
  // Hard-coded “seed” messages for each chat
  const [mockMessages, setMockMessages] = useState<Message[]>(
    () => getConversationMessages(chatId)
  );

  // Live messages coming from Firebase
  const [liveMessages, setLiveMessages] = useState<Message[]>([]);

  // Derived list used by the UI
  const allMessages = [...mockMessages, ...liveMessages];
  const [inputText, setInputText] = useState('');
  const [expandedTone, setExpandedTone] = useState<string | null>(null);
  const [showRepliesFor, setShowRepliesFor] = useState<string | null>(null);
  const [liveAnalysis, setLiveAnalysis] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { getConfidenceBarColor } = useAccessibility();
  const { suggestionTrigger, disableSuggestions } = useToneSettings();

  const currentPresetData = allPresets.find(p => p.id === selectedPreset);

  useEffect(() => {
    setMockMessages(getConversationMessages(chatId));
  }, [chatId]);  

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [allMessages.length]);


  useEffect(() => {
    if (!chatId) return;
  
    const unsubscribe = subscribeToMessages(chatId, (fbMessages) => {
      const mapped: Message[] = fbMessages.map((m) => ({
        id: m.id || Math.random().toString(),
        text: m.text,
        sender: m.userId === userId ? 'me' : 'them',
        timestamp: new Date(m.timestamp || Date.now()).toLocaleTimeString(
          'en-US',
          { hour: 'numeric', minute: '2-digit' }
        ),
      }));
      setLiveMessages(mapped);
    
      // ✅ update preview for this chat
      if (fbMessages.length && onMessagePreviewUpdate) {
        const latest = fbMessages[fbMessages.length - 1];
        onMessagePreviewUpdate(chatId, latest.text, latest.timestamp);
      }
    });
  
    return unsubscribe;
  }, [chatId, userId]);
  
  
  // Live tone analysis - Always enabled
  useEffect(() => {
    if (inputText.trim()) {
      const timer = setTimeout(() => {
        const analysis = analyzeTone(inputText, selectedPreset, currentPresetData);
        setLiveAnalysis(analysis);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setLiveAnalysis(null);
    }
  }, [inputText, selectedPreset, currentPresetData]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
  
    try {
      await sendMessage(chatId, {
        text: inputText,
        userId,
        chatId,
        tone: liveAnalysis?.label,        // optional, can be undefined
        confidence: liveAnalysis?.confidence,
      });
  
      setInputText('');
      setLiveAnalysis(null);
      // No need to manually update messages:
      // subscribeToMessages will fire and update liveMessages.
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };
  

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Navigation Bar */}
      <div className="bg-[#F6F6F6] border-b border-[#E5E5EA] shrink-0">
        <div className="pt-[52px] pb-[8px] px-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={onBack}
              className="flex items-center gap-1 text-[#007AFF] hover:opacity-80 transition-opacity active:opacity-60 -ml-2"
            >
              <ChevronLeft className="w-[22px] h-[22px]" strokeWidth={2.5} />
              <span className="text-[17px] tracking-[-0.4px]">Messages</span>
            </button>
            
            <div className="w-10" />
          </div>
        </div>
      </div>

      {/* Contact Info with Avatar and Name */}
      <div className="bg-white border-b border-[#E5E5EA] py-[12px] shrink-0">
        <div className="flex flex-col items-center gap-[8px]">
          <Avatar className="w-[56px] h-[56px]">
            <AvatarFallback className={`${
              isGroup ? 'bg-[#8E8E93]' : 'bg-[#007AFF]'
            } text-white text-[20px]`}>
              {getInitials(chatName)}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-[17px] tracking-[-0.4px] text-[#000000]">{chatName}</h2>
        </div>
      </div>

      {/* Tonify Analysis Bar - Always shown in chats */}
      <div className="bg-[#E8F0FE] border-b border-[#D2E3FC] shrink-0">
        <div className="px-4 py-3 flex items-start gap-2.5">
          <InfoIcon className="w-[16px] h-[16px] text-[#1967D2] mt-0.5 flex-shrink-0" strokeWidth={2} />
          <div className="flex-1">
            <p className="text-[13px] text-[#1967D2] leading-[1.4]">
              Tonify Analysis Active: Tap tone indicators on messages to understand emotional context
            </p>
            {currentPresetData && (
              <p className="text-[12px] text-[#1967D2]/70 mt-1.5">
                Using {currentPresetData.name} style
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation Bar */}
      <div className="w-full flex justify-around border-b border-[#E5E5EA] bg-[#F9F9F9]/95 backdrop-blur-xl h-[49px] shrink-0">

        <button
            onClick={() => onTabChange('messages')}
            className={`flex flex-col items-center justify-center gap-[2px] transition-colors ${
                activeTab === 'messages' ? 'text-[#007AFF]' : 'text-[#8E8E93]'
            }`}
        >
          <MessageCircle className="w-[25px] h-[25px]" strokeWidth={2} />
          <span className="text-[10px]">Messages</span>
        </button>

        <button
            onClick={() => onTabChange('compose')}
            className={`flex flex-col items-center justify-center gap-[2px] transition-colors ${
                activeTab === 'compose' ? 'text-[#007AFF]' : 'text-[#8E8E93]'
            }`}
        >
          <Sparkles className="w-[25px] h-[25px]" strokeWidth={2} />
          <span className="text-[10px]">Compose</span>
        </button>

        <button
            onClick={() => onTabChange('settings')}
            className={`flex flex-col items-center justify-center gap-[2px] transition-colors ${
                activeTab === 'settings' ? 'text-[#007AFF]' : 'text-[#8E8E93]'
            }`}
        >
          <Settings className="w-[25px] h-[25px]" strokeWidth={2} />
          <span className="text-[10px]">Settings</span>
        </button>

      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-white px-4 py-3">
        <div className="space-y-4">
          {allMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] ${message.sender === 'them' ? 'space-y-1.5' : ''}`}>
                {message.sender === 'them' && message.senderName && isGroup && (
                  <div className="text-[13px] text-gray-500 px-3 mb-0.5">{message.senderName}</div>
                )}
                
                <div className="flex items-start gap-2">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`rounded-[18px] px-3.5 py-2.5 ${
                      message.sender === 'me'
                        ? 'bg-[#007AFF] text-white'
                        : 'bg-[#E9E9EB] text-black'
                    }`}
                  >
                    <p className="text-[15px] leading-[1.35]">{message.text}</p>
                    <div className={`text-[11px] mt-1 ${
                      message.sender === 'me' ? 'opacity-70' : 'opacity-60'
                    }`}>
                      {message.timestamp}
                    </div>
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
                        onClick={() => setExpandedTone(expandedTone === message.id ? null : message.id)}
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

                {/* Tone Explanation */}
                <AnimatePresence>
                  {message.tone && expandedTone === message.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 px-3.5 py-3 bg-[#F6F6F6] rounded-xl border border-gray-200">
                        <p className="text-[13px] text-gray-700 leading-[1.5]">{message.tone.explanation}</p>
                        {message.tone.confidence && (
                          <div className="flex items-center gap-2.5 pt-2.5 mt-2.5 border-t border-gray-300">
                            <span className="text-[11px] text-gray-500">Confidence:</span>
                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${getConfidenceBarColor(message.tone.confidence)} rounded-full transition-all`}
                                style={{ width: `${message.tone.confidence}%` }}
                              />
                            </div>
                            <span className="text-[11px] text-gray-600">{message.tone.confidence}%</span>
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
                      onClick={() => setShowRepliesFor(showRepliesFor === message.id ? null : message.id)}
                      className="text-[12px] text-[#007AFF] mt-1.5 px-3 hover:opacity-80 transition-opacity"
                    >
                      {showRepliesFor === message.id ? 'Hide' : 'Show'} suggested replies
                    </button>
                    <AnimatePresence>
                      {showRepliesFor === message.id && (
                        <SuggestedReplies 
                          replies={message.suggestedReplies}
                          onSelect={(text) => {
                            setInputText(text);
                            setShowRepliesFor(null);
                            inputRef.current?.focus();
                          }}
                        />
                      )}
                    </AnimatePresence>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Tone Preview Bar */}
      <AnimatePresence>
        {liveAnalysis && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gray-50 border-t border-gray-200 overflow-hidden shrink-0"
          >
            <div className="px-4 py-2.5 flex items-center gap-2.5">
              <ToneIndicator tone={liveAnalysis} size="sm" />
              <span className="text-[13px] text-gray-600">
                {liveAnalysis.label} ({liveAnalysis.confidence}% confidence)
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Input */}
      <div className="bg-[#F6F6F6] border-t border-gray-200 px-3 py-2.5 shrink-0">
        <div className="flex items-end gap-2.5">
          <button className="w-8 h-8 rounded-full bg-transparent flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors shrink-0 mb-0.5">
            <Plus className="w-5 h-5" />
          </button>
          
          <div className="flex-1 bg-white rounded-[20px] px-4 py-2 border border-gray-300 flex items-center gap-2.5">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="iMessage"
              className="flex-1 bg-transparent text-[15px] focus:outline-none placeholder:text-gray-400"
            />
            <button className="text-gray-500 hover:text-gray-700 transition-colors">
              <Camera className="w-5 h-5" />
            </button>
            <button className="text-gray-500 hover:text-gray-700 transition-colors">
              <Mic className="w-5 h-5" />
            </button>
          </div>

          {inputText.trim() ? (
            <button 
              onClick={handleSend}
              className="w-8 h-8 rounded-full bg-[#007AFF] flex items-center justify-center text-white hover:bg-[#0051D5] transition-colors shrink-0 mb-0.5 active:scale-95"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          ) : (
            <div className="w-8 h-8 mb-0.5" />
          )}
        </div>
      </div>
    </div>
  );
}
