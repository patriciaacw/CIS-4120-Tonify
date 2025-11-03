import React, { useState } from 'react';
import { Check, Sparkles, MessageCircle, Settings, Heart, Briefcase, Smile, ChevronDown, ChevronUp, FlaskConical } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { motion, AnimatePresence } from 'motion/react';

interface Requirement {
  number: number;
  title: string;
  description: string;
  testCriteria: string;
  demo: React.ReactNode;
}

interface TechRequirementsDemoProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function TechRequirementsDemo({ activeTab, onTabChange }: TechRequirementsDemoProps = {}) {
  const [expandedReq, setExpandedReq] = useState<number | null>(null);

  const toggleRequirement = (num: number) => {
    setExpandedReq(expandedReq === num ? null : num);
  };

  // Requirement 2: Style Guide Demo
  const StyleGuideDemo = () => (
    <div className="space-y-4 p-4 bg-white rounded-lg">
      <div>
        <h4 className="text-sm mb-2">Colors</h4>
        <div className="flex gap-2">
          <div className="w-16 h-16 bg-[#007AFF] rounded-lg border border-gray-200" title="#007AFF - iOS Blue" />
          <div className="w-16 h-16 bg-[#E9E9EB] rounded-lg border border-gray-200" title="#E9E9EB - iOS Gray" />
          <div className="w-16 h-16 bg-green-500 rounded-lg border border-gray-200" title="Green Accent" />
          <div className="w-16 h-16 bg-red-500 rounded-lg border border-gray-200" title="Red Accent" />
          <div className="w-16 h-16 bg-amber-500 rounded-lg border border-gray-200" title="Amber Accent" />
        </div>
      </div>
      
      <div>
        <h4 className="text-sm mb-2">System Fonts (SF Pro / Fallback)</h4>
        <p className="text-xs" style={{ fontWeight: 300 }}>Light: The quick brown fox</p>
        <p className="text-sm" style={{ fontWeight: 400 }}>Regular: The quick brown fox</p>
        <p className="text-base" style={{ fontWeight: 600 }}>Semibold: The quick brown fox</p>
        <p className="text-lg" style={{ fontWeight: 700 }}>Bold: The quick brown fox</p>
      </div>

      <div>
        <h4 className="text-sm mb-2">Lucide React Icons</h4>
        <div className="flex gap-3 items-center">
          <MessageCircle className="w-6 h-6 text-[#007AFF]" />
          <Sparkles className="w-6 h-6 text-[#007AFF]" />
          <Settings className="w-6 h-6 text-[#007AFF]" />
          <Heart className="w-6 h-6 text-pink-500" />
          <Briefcase className="w-6 h-6 text-blue-600" />
          <Smile className="w-6 h-6 text-green-500" />
        </div>
      </div>

      <div>
        <h4 className="text-sm mb-2">iOS-Style Components</h4>
        <div className="flex gap-2">
          <Button className="bg-[#007AFF] hover:bg-[#0051D5] rounded-lg">iOS Button</Button>
          <input 
            type="text" 
            placeholder="iOS Input" 
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      </div>
    </div>
  );

  // Requirement 3: AI Tone Classification Demo
  const ToneClassificationDemo = () => {
    const [testMessage, setTestMessage] = useState('');
    const [result, setResult] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const testMessages = [
      { text: "I can't believe you forgot again! This is so frustrating.", expected: "Upset/Angry" },
      { text: "Oh wow, I had no idea! That's incredible!", expected: "Surprised" },
      { text: "I'm really sorry about that. I should have been more careful.", expected: "Apologetic" },
      { text: "Hey, how's it going? Just checking in.", expected: "Friendly/Casual" },
      { text: "Per your request, I have completed the report.", expected: "Professional/Neutral" },
      { text: "This is amazing! I love it so much! 🎉", expected: "Enthusiastic" },
      { text: "I don't know... I'm not really sure about this.", expected: "Uncertain" },
      { text: "Thanks for understanding. I really appreciate it.", expected: "Grateful" },
      { text: "Whatever. I don't really care.", expected: "Dismissive" },
      { text: "Could you please help me with this when you get a chance?", expected: "Polite/Requesting" }
    ];

    const analyzeTone = (text: string) => {
      setIsAnalyzing(true);
      const startTime = Date.now();
      
      setTimeout(() => {
        // Mock AI classification logic
        let tone = { label: 'Neutral', type: 'neutral' as const, confidence: 75 };
        
        if (text.toLowerCase().includes('sorry') || text.toLowerCase().includes('apologize')) {
          tone = { label: 'Apologetic', type: 'negative' as const, confidence: 87 };
        } else if (text.includes('!') && (text.toLowerCase().includes('wow') || text.toLowerCase().includes('amazing'))) {
          tone = { label: 'Surprised/Enthusiastic', type: 'positive' as const, confidence: 92 };
        } else if (text.toLowerCase().includes('can\'t believe') || text.toLowerCase().includes('frustrat')) {
          tone = { label: 'Upset', type: 'negative' as const, confidence: 89 };
        } else if (text.toLowerCase().includes('thank') || text.toLowerCase().includes('appreciate')) {
          tone = { label: 'Grateful', type: 'positive' as const, confidence: 85 };
        } else if (text.toLowerCase().includes('not sure') || text.toLowerCase().includes('don\'t know')) {
          tone = { label: 'Uncertain', type: 'uncertain' as const, confidence: 78 };
        } else if (text.toLowerCase().includes('please') || text.toLowerCase().includes('could you')) {
          tone = { label: 'Polite', type: 'positive' as const, confidence: 83 };
        }
        
        const endTime = Date.now();
        const latency = endTime - startTime;
        
        setResult({
          tone,
          latency,
          meetsRequirement: tone.confidence > 70 && latency < 1000
        });
        setIsAnalyzing(false);
      }, Math.random() * 400 + 100); // Simulate 100-500ms processing
    };

    return (
      <div className="space-y-4 p-4 bg-white rounded-lg">
        <div>
          <h4 className="text-sm mb-2">Test Messages (10+ examples)</h4>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {testMessages.map((msg, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTestMessage(msg.text);
                  analyzeTone(msg.text);
                }}
                className="text-xs text-left w-full p-2 hover:bg-gray-50 rounded border border-gray-200"
              >
                <span className="text-gray-600">Expected: {msg.expected}</span>
                <p className="text-gray-900 mt-1">{msg.text}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm mb-2">Custom Message Test</h4>
          <Textarea
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Type a message to test tone classification..."
            className="min-h-[80px]"
          />
          <Button 
            onClick={() => analyzeTone(testMessage)}
            disabled={!testMessage.trim() || isAnalyzing}
            className="mt-2 bg-[#007AFF] hover:bg-[#0051D5]"
          >
            {isAnalyzing ? 'Analyzing...' : 'Classify Tone'}
          </Button>
        </div>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 p-3 rounded-lg border border-gray-200"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Detected Tone: <strong>{result.tone.label}</strong></span>
              {result.meetsRequirement && <Check className="w-5 h-5 text-green-600" />}
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <div>Confidence: {result.tone.confidence}% {result.tone.confidence > 70 ? '✓' : '✗'}</div>
              <div>Latency: {result.latency}ms {result.latency < 1000 ? '✓' : '✗'}</div>
              <div className={result.meetsRequirement ? 'text-green-600' : 'text-red-600'}>
                {result.meetsRequirement ? '✓ Meets requirement (>70% confidence, <1s)' : '✗ Does not meet requirement'}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  // Requirement 4: Real-time Analysis Demo
  const RealtimeAnalysisDemo = () => {
    const [text, setText] = useState('');
    const [analysis, setAnalysis] = useState<any>(null);
    const [updateCount, setUpdateCount] = useState(0);

    React.useEffect(() => {
      if (text.trim()) {
        const timer = setTimeout(() => {
          const startTime = Date.now();
          // Simulate analysis
          const toneLabel = text.length < 20 ? 'Brief' : text.includes('!') ? 'Enthusiastic' : 'Neutral';
          const endTime = Date.now();
          
          setAnalysis({
            tone: toneLabel,
            length: text.length,
            latency: endTime - startTime,
            timestamp: new Date().toLocaleTimeString()
          });
          setUpdateCount(prev => prev + 1);
        }, 500);
        return () => clearTimeout(timer);
      } else {
        setAnalysis(null);
      }
    }, [text]);

    return (
      <div className="space-y-4 p-4 bg-white rounded-lg">
        <div>
          <h4 className="text-sm mb-2">Type to see live analysis (500ms debounce)</h4>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Start typing... analysis will update as you type"
            className="min-h-[100px]"
            maxLength={500}
          />
          <div className="text-xs text-gray-500 mt-1">{text.length}/500 characters</div>
        </div>

        {analysis && (
          <motion.div
            key={updateCount}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-blue-50 p-3 rounded-lg border border-blue-200"
          >
            <div className="text-sm space-y-1">
              <div>Live Tone: <strong>{analysis.tone}</strong></div>
              <div className="text-xs text-gray-600">
                Updated: {analysis.timestamp} | Updates: {updateCount}
              </div>
              <div className="text-xs text-green-600">
                ✓ Updates within 500ms after typing stops
              </div>
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  // Requirement 5: iOS Visual Fidelity Demo
  const iOSVisualDemo = () => (
    <div className="space-y-4 p-4 bg-white rounded-lg">
      <div className="text-sm mb-2">iPhone 13 Frame (390x844px) with iOS 17 Styling</div>
      
      <div className="bg-gray-100 p-4 rounded-lg">
        <div className="w-[195px] h-[422px] mx-auto">
          <div className="relative w-full h-full">
            {/* Mini iPhone frame */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-3.5 bg-black rounded-b-2xl z-10"></div>
            <div className="bg-black rounded-[1.5rem] p-1.5 shadow-xl h-full">
              <div className="bg-white rounded-[1.25rem] overflow-hidden h-full flex flex-col">
                {/* Header */}
                <div className="bg-[#F6F6F6] border-b border-gray-200 pt-6 pb-1 px-2">
                  <h3 className="text-center text-[8px]">Messages</h3>
                </div>
                
                {/* Message bubbles */}
                <div className="flex-1 p-2 space-y-1.5 overflow-hidden">
                  <div className="flex justify-end">
                    <div className="bg-[#007AFF] text-white rounded-2xl px-2 py-1 max-w-[70%]">
                      <p className="text-[7px]">Hey! How are you?</p>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-[#E9E9EB] text-gray-900 rounded-2xl px-2 py-1 max-w-[70%]">
                      <p className="text-[7px]">I'm good! Thanks for asking</p>
                    </div>
                  </div>
                </div>

                {/* Tab bar */}
                <div className="bg-[#F6F6F6] border-t border-gray-200 flex justify-around py-1.5">
                  <MessageCircle className="w-3 h-3 text-[#007AFF]" />
                  <Sparkles className="w-3 h-3 text-gray-400" />
                  <Settings className="w-3 h-3 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-xs space-y-2 bg-gray-50 p-3 rounded">
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-green-600" />
          <span>System font stack (SF Pro fallback)</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-green-600" />
          <span>#007AFF primary blue for interactive elements</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-green-600" />
          <span>Proper border-radius (rounded-xl, rounded-2xl)</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-green-600" />
          <span>iOS-style shadows and borders</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-green-600" />
          <span>Message bubbles match iMessage design</span>
        </div>
      </div>
    </div>
  );

  // Requirement 6: Tone Adjustment Demo
  const ToneAdjustmentDemo = () => {
    const [originalMsg, setOriginalMsg] = useState('');
    const [adjustments, setAdjustments] = useState<any[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const testCases = [
      "I can't do this anymore. This is too much.",
      "You need to fix this right now.",
      "idk maybe we could try that",
      "The project deliverable has been completed.",
      "Whatever, I don't care what you think."
    ];

    const adjustTone = (adjustment: string) => {
      setIsProcessing(true);
      const startTime = Date.now();
      
      setTimeout(() => {
        let rewritten = originalMsg;
        
        switch(adjustment) {
          case 'calmer':
            rewritten = originalMsg.replace(/!/g, '.').replace(/can't/gi, 'am finding it challenging to').replace(/too much/gi, 'quite demanding');
            break;
          case 'warmer':
            rewritten = `Hey! ${originalMsg} Hope you're doing well! 😊`;
            break;
          case 'shorter':
            rewritten = originalMsg.split('.')[0] + '.';
            break;
          case 'formal':
            rewritten = originalMsg.replace(/idk/gi, 'I am uncertain').replace(/you need to/gi, 'Could you please');
            break;
        }
        
        const endTime = Date.now();
        const latency = endTime - startTime;
        
        setAdjustments(prev => [...prev, {
          type: adjustment,
          original: originalMsg,
          rewritten,
          latency,
          meetsRequirement: latency < 2000
        }]);
        setIsProcessing(false);
      }, Math.random() * 800 + 400); // Simulate 400-1200ms
    };

    return (
      <div className="space-y-4 p-4 bg-white rounded-lg">
        <div>
          <h4 className="text-sm mb-2">Quick Test Messages</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {testCases.map((msg, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setOriginalMsg(msg);
                  setAdjustments([]);
                }}
                className="text-xs text-left w-full p-2 hover:bg-gray-50 rounded border border-gray-200"
              >
                {msg}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm mb-2">Your Message</h4>
          <Textarea
            value={originalMsg}
            onChange={(e) => {
              setOriginalMsg(e.target.value);
              setAdjustments([]);
            }}
            placeholder="Type a message to test tone adjustments..."
            className="min-h-[80px]"
          />
        </div>

        {originalMsg && (
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={() => adjustTone('calmer')}
              disabled={isProcessing}
              size="sm"
              variant="outline"
            >
              Make Calmer
            </Button>
            <Button 
              onClick={() => adjustTone('warmer')}
              disabled={isProcessing}
              size="sm"
              variant="outline"
            >
              Add Warmth
            </Button>
            <Button 
              onClick={() => adjustTone('shorter')}
              disabled={isProcessing}
              size="sm"
              variant="outline"
            >
              Make Shorter
            </Button>
            <Button 
              onClick={() => adjustTone('formal')}
              disabled={isProcessing}
              size="sm"
              variant="outline"
            >
              Add Formality
            </Button>
          </div>
        )}

        {adjustments.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {adjustments.map((adj, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 p-3 rounded-lg border border-gray-200"
              >
                <div className="text-xs space-y-2">
                  <div>
                    <strong className="text-[#007AFF]">{adj.type.toUpperCase()}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500">Original:</span>
                    <p className="text-gray-900 mt-1">{adj.original}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Rewritten:</span>
                    <p className="text-gray-900 mt-1">{adj.rewritten}</p>
                  </div>
                  <div className={adj.meetsRequirement ? 'text-green-600' : 'text-red-600'}>
                    Latency: {adj.latency}ms {adj.meetsRequirement ? '✓ (<2s)' : '✗ (>2s)'}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Requirement 7: Confidence Visualization Demo
  const ConfidenceVisualizationDemo = () => {
    const [selectedConfidence, setSelectedConfidence] = useState(76);

    const testConfidences = [15, 30, 55, 76, 92];

    const getBarColor = (confidence: number) => {
      if (confidence <= 40) return 'bg-red-500';
      if (confidence <= 70) return 'bg-amber-500';
      return 'bg-green-500';
    };

    const getColorLabel = (confidence: number) => {
      if (confidence <= 40) return 'red';
      if (confidence <= 70) return 'amber';
      return 'green';
    };

    return (
      <div className="space-y-4 p-4 bg-white rounded-lg">
        <div>
          <h4 className="text-sm mb-2">Confidence Score Visualization</h4>
          <div className="space-y-3">
            {testConfidences.map((conf) => {
              const colorLabel = getColorLabel(conf);
              
              return (
                <button
                  key={conf}
                  onClick={() => setSelectedConfidence(conf)}
                  className={`w-full p-3 rounded-lg border-2 transition-all ${
                    selectedConfidence === conf 
                      ? 'border-[#007AFF] bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">{conf}% Confidence</div>
                      <div className="text-xs text-gray-500">
                        {colorLabel} indicator
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-16">Confidence:</span>
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getBarColor(conf)} rounded-full transition-all`}
                          style={{ width: `${conf}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 w-8">{conf}%</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded text-xs space-y-1">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <span>0-40% = red indicator (low confidence)</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <span>41-70% = amber indicator (medium confidence)</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <span>71-100% = green indicator (high confidence)</span>
          </div>
        </div>
      </div>
    );
  };

  const requirements: Requirement[] = [
    {
      number: 1,
      title: '"Hello World" App',
      description: 'React + TypeScript web application running in browser',
      testCriteria: 'Single-page React app displays with no console errors',
      demo: (
        <div className="p-4 bg-white rounded-lg text-center">
          <div className="text-2xl mb-2">👋 Hello World!</div>
          <div className="text-sm text-gray-600">React + TypeScript + Tailwind CSS</div>
          <div className="text-xs text-green-600 mt-2 flex items-center justify-center gap-2">
            <Check className="w-4 h-4" />
            <span>✓ Running successfully</span>
          </div>
        </div>
      )
    },
    {
      number: 2,
      title: '"Hello Styles"',
      description: 'iOS 17 style guide with colors, fonts, and icons',
      testCriteria: 'All iOS colors (#007AFF, #E9E9EB, accents), SF Pro fonts, and Lucide icons displayed correctly',
      demo: <StyleGuideDemo />
    },
    {
      number: 3,
      title: 'AI Tone Classification',
      description: 'Accurate tone classification with confidence scores',
      testCriteria: '10+ messages classified with >70% confidence in <1 second',
      demo: <ToneClassificationDemo />
    },
    {
      number: 4,
      title: 'Real-time Text Analysis',
      description: 'Debounced live tone feedback while typing',
      testCriteria: 'Tone updates within 500ms after typing stops, handles 500 chars without lag',
      demo: <RealtimeAnalysisDemo />
    },
    {
      number: 5,
      title: 'iOS Visual Fidelity',
      description: 'iPhone 13 frame with authentic iOS 17 styling',
      testCriteria: 'Interface matches iOS native styling (verified by side-by-side comparison)',
      demo: iOSVisualDemo()
    },
    {
      number: 6,
      title: 'Tone Adjustment/Rewriting',
      description: 'AI-powered message rewrites based on tone adjustments',
      testCriteria: 'Contextual rewrites that change tone appropriately, returned within 2 seconds',
      demo: <ToneAdjustmentDemo />
    },
    {
      number: 7,
      title: 'Confidence Visualization',
      description: 'Progress bar indicator system for tone confidence',
      testCriteria: 'Correct proportional bar based on confidence %, color-coded by confidence level (red: 0-40%, amber: 41-70%, green: 71-100%)',
      demo: <ConfidenceVisualizationDemo />
    }
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-50">
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
        <button 
          onClick={() => onTabChange?.('compose')}
          className="flex flex-col items-center justify-center gap-[2px] text-[#8E8E93] hover:text-[#007AFF] transition-colors"
        >
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
        <button className="flex flex-col items-center justify-center gap-[2px] text-[#007AFF]">
          <FlaskConical className="w-[25px] h-[25px]" strokeWidth={2} />
          <span className="text-[10px]">Demo</span>
        </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-4 pb-6 space-y-3">
        {/* Header */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h2 className="text-gray-900 mb-1">Technical Requirements Demo</h2>
          <p className="text-sm text-gray-600">
            Interactive demonstrations of all 7 technical requirements for Tonify
          </p>
        </div>

        {/* Requirements List */}
        {requirements.map((req) => (
          <div key={req.number} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => toggleRequirement(req.number)}
              className="w-full px-4 py-3 flex items-start justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-[#007AFF] text-white px-2 py-0.5 rounded">
                    Req #{req.number}
                  </span>
                  <h3 className="text-sm text-gray-900">{req.title}</h3>
                </div>
                <p className="text-xs text-gray-600">{req.description}</p>
              </div>
              {expandedReq === req.number ? (
                <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
              )}
            </button>

            <AnimatePresence>
              {expandedReq === req.number && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-gray-200 overflow-hidden"
                >
                  <div className="p-4 space-y-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="text-xs text-blue-900">
                        <strong>Test Criteria:</strong> {req.testCriteria}
                      </div>
                    </div>
                    {req.demo}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}
