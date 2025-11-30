import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Check, Sparkles, Heart, Briefcase, Smile, Plus, Edit2, Trash2, ChevronDown, ChevronUp, Volume2, Eye, Palette, X, MessageCircle, Settings, FlaskConical } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAccessibility } from './AccessibilitySettings';
import { useToneSettings } from './ToneSettingsContext';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';

interface ToneSettingsProps {
  selectedPreset: string;
  onPresetChange: (preset: string) => void;
  onPresetsChange?: (presets: TonePreset[]) => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export interface TonePreset {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  examples: string[];
  isCustom?: boolean;
  guidelines?: {
    // What this preset aims for
    targetTone: string;
    // When to use this preset
    usageContext: string;
    // Specific characteristics to encourage
    encourages: string[];
    // Things to avoid
    avoids: string[];
  };
}

const defaultTonePresets: TonePreset[] = [
  {
    id: 'friendly-clear',
    name: 'Friendly & Clear',
    description: 'Warm and approachable while maintaining clarity. Good for most conversations.',
    icon: <Heart className="w-5 h-5" />,
    color: 'from-pink-500 to-rose-500',
    examples: [
      'Uses moderate enthusiasm',
      'Includes context and explanations',
      'Balances warmth with clarity'
    ],
    guidelines: {
      targetTone: 'Warm, clear, and approachable',
      usageContext: 'General conversations with friends, family, and acquaintances',
      encourages: ['Clear explanations', 'Moderate enthusiasm', 'Contextual information', 'Friendly emojis'],
      avoids: ['Excessive formality', 'Being too brief', 'Overly intense emotions']
    }
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Polished and respectful tone suitable for work and formal contexts.',
    icon: <Briefcase className="w-5 h-5" />,
    color: 'from-blue-500 to-indigo-500',
    examples: [
      'Formal language and structure',
      'Measured and respectful',
      'Minimizes casual expressions'
    ],
    guidelines: {
      targetTone: 'Polished, formal, and respectful',
      usageContext: 'Work colleagues, supervisors, professional contacts',
      encourages: ['Complete sentences', 'Formal language', 'Respectful phrasing', 'Clear structure'],
      avoids: ['Casual language', 'Slang', 'Excessive emojis', 'All caps']
    }
  },
  {
    id: 'casual',
    name: 'Casual & Relaxed',
    description: 'Laid-back and easygoing for close friends and informal chats.',
    icon: <Smile className="w-5 h-5" />,
    color: 'from-green-500 to-emerald-500',
    examples: [
      'More informal language',
      'Shorter, conversational messages',
      'Comfortable with slang/emojis'
    ],
    guidelines: {
      targetTone: 'Relaxed, informal, and conversational',
      usageContext: 'Close friends, family, casual group chats',
      encourages: ['Brief messages', 'Casual language', 'Emojis', 'Conversational tone'],
      avoids: ['Over-explaining', 'Formal language', 'Being too serious']
    }
  },
  {
    id: 'enthusiastic',
    name: 'Enthusiastic',
    description: 'High energy and excitement. Shows genuine interest and positivity.',
    icon: <Sparkles className="w-5 h-5" />,
    color: 'from-amber-500 to-orange-500',
    examples: [
      'More exclamation marks',
      'Expressive and energetic',
      'Shows excitement clearly'
    ],
    guidelines: {
      targetTone: 'Energetic, positive, and expressive',
      usageContext: 'Celebrations, good news, showing excitement',
      encourages: ['Exclamation marks', 'Positive language', 'Energetic emojis', 'Expressive words'],
      avoids: ['Being understated', 'Minimal punctuation', 'Neutral tone']
    }
  }
];

export function ToneSettings({ selectedPreset, onPresetChange, onPresetsChange, activeTab, onTabChange }: ToneSettingsProps) {
  const { settings, updateSettings } = useAccessibility();
  const {
    showTonesOnAll,
    setShowTonesOnAll,
    autoCheckEnabled,
    setAutoCheckEnabled,
    disableSuggestions,
    setDisableSuggestions,
    suggestionTrigger,
    setSuggestionTrigger,
  } = useToneSettings();
  const [customPresets, setCustomPresets] = useState<TonePreset[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [isCreatingPreset, setIsCreatingPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDescription, setNewPresetDescription] = useState('');
  const [newPresetTargetTone, setNewPresetTargetTone] = useState('');
  const [newPresetUsageContext, setNewPresetUsageContext] = useState('');
  const [newPresetEncourages, setNewPresetEncourages] = useState('');
  const [newPresetAvoids, setNewPresetAvoids] = useState('');

  const allPresets = [...defaultTonePresets, ...customPresets];

  // Notify parent component of preset changes
  useEffect(() => {
    if (onPresetsChange) {
      onPresetsChange(allPresets);
    }
  }, [customPresets, onPresetsChange]);

  const handleCreatePreset = () => {
    if (newPresetName.trim()) {
      const encourages = newPresetEncourages.split(',').map(s => s.trim()).filter(Boolean);
      const avoids = newPresetAvoids.split(',').map(s => s.trim()).filter(Boolean);
      
      const newPreset: TonePreset = {
        id: `custom-${Date.now()}`,
        name: newPresetName,
        description: newPresetDescription || 'Custom tone preset',
        icon: <Sparkles className="w-5 h-5" />,
        color: 'from-purple-500 to-violet-500',
        examples: encourages.length > 0 ? encourages.slice(0, 3) : ['Custom tone guidance'],
        isCustom: true,
        guidelines: {
          targetTone: newPresetTargetTone || 'Custom tone style',
          usageContext: newPresetUsageContext || 'As defined by user',
          encourages: encourages.length > 0 ? encourages : ['User-defined characteristics'],
          avoids: avoids.length > 0 ? avoids : ['User-defined characteristics to avoid']
        }
      };
      setCustomPresets([...customPresets, newPreset]);
      setIsCreatingPreset(false);
      setNewPresetName('');
      setNewPresetDescription('');
      setNewPresetTargetTone('');
      setNewPresetUsageContext('');
      setNewPresetEncourages('');
      setNewPresetAvoids('');
      onPresetChange(newPreset.id);
    }
  };

  const handleDeletePreset = (presetId: string) => {
    setCustomPresets(customPresets.filter(p => p.id !== presetId));
    if (selectedPreset === presetId) {
      onPresetChange('friendly-clear');
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      {/* Tab Navigation Bar with Status Bar Spacing */}
      <div className="pt-[44px] bg-[#F6F6F6] shrink-0">
        <div className="w-full grid grid-cols-3 place-items-center rounded-none border-b border-[#E5E5EA] bg-[#F9F9F9]/95 backdrop-blur-xl h-[49px]">
          
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
      
          <button className="flex flex-col items-center justify-center gap-[2px] text-[#007AFF]">
            <Settings className="w-[25px] h-[25px]" strokeWidth={2} />
            <span className="text-[10px]">Settings</span>
          </button>
        </div>
      </div>

        {/* Preset Cards */}
        <div className="space-y-2.5">
          {allPresets.map((preset) => (
            <motion.button
              key={preset.id}
              onClick={() => onPresetChange(preset.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full text-left transition-all ${
                selectedPreset === preset.id
                  ? 'ring-2 ring-offset-2 ring-[#007AFF]'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="border border-gray-200 rounded-xl p-3.5 space-y-2.5">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${preset.color} flex items-center justify-center text-white shrink-0`}>
                      {preset.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-gray-900 text-[15px]">{preset.name}</h3>
                      <p className="text-[12px] text-gray-600 mt-0.5 leading-[1.4]">
                        {preset.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {selectedPreset === preset.id && (
                      <div className="w-6 h-6 rounded-full bg-[#007AFF] flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    {preset.isCustom && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePreset(preset.id);
                        }}
                        className="p-1.5 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Examples */}
                <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
                  {preset.examples.map((example, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[12px] text-gray-700">
                      <span className="text-gray-400 mt-0.5">•</span>
                      <span className="leading-[1.4]">{example}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.button>
          ))}

          {/* Add Custom Preset Button */}
          <Button
            onClick={() => setIsCreatingPreset(true)}
            variant="outline"
            className="w-full border-dashed border-2 h-11"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Custom Preset
          </Button>
        </div>

        {/* Info Box */}
        <div className="bg-[#E8F0FE] border border-[#D2E3FC] rounded-xl p-3.5">
          <div className="flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-[#1967D2] flex-shrink-0 mt-0.5" />
            <div className="text-[12px] text-[#1967D2] leading-[1.5]">
              <p>
                Your selected preset helps Tonify understand your preferred communication style. When you check a message, Tonify will consider this preset and suggest adjustments.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Settings */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-gray-900 mb-3 text-[15px]">General Options</h3>
          
          <div className="space-y-2.5">
            <label className="flex items-center justify-between p-3 bg-[#F6F6F6] rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="flex-1 min-w-0 pr-3">
                <div className="text-[14px] text-gray-900">Show tone indicators on all messages</div>
                <div className="text-[12px] text-gray-600 mt-0.5">Display tone indicators automatically</div>
              </div>
              <Switch checked={showTonesOnAll} onCheckedChange={setShowTonesOnAll} />
            </label>

            <label className="flex items-center justify-between p-3 bg-[#F6F6F6] rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="flex-1 min-w-0 pr-3">
                <div className="text-[14px] text-gray-900">Auto-check before sending</div>
                <div className="text-[12px] text-gray-600 mt-0.5">Automatically analyze tone when composing</div>
              </div>
              <Switch checked={autoCheckEnabled} onCheckedChange={setAutoCheckEnabled} />
            </label>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full mb-3 hover:opacity-70 transition-opacity"
          >
            <h3 className="text-gray-900 text-[15px]">Advanced Settings</h3>
            {showAdvanced ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
          </button>

          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2.5"
              >
                <div className="p-3 bg-[#F6F6F6] rounded-lg">
                  <label className="text-[14px] text-gray-900 block mb-2">
                    When to show suggestions
                  </label>
                  <Select 
                    value={disableSuggestions ? 'never' : suggestionTrigger} 
                    onValueChange={(value: any) => {
                      if (value === 'never') {
                        setDisableSuggestions(true);
                        setSuggestionTrigger('always');
                      } else {
                        setDisableSuggestions(false);
                        setSuggestionTrigger(value);
                      }
                    }}
                  >
                    <SelectTrigger className="text-[14px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="always">Always show suggestions</SelectItem>
                      <SelectItem value="negative">Only for negative tones</SelectItem>
                      <SelectItem value="uncertain">For negative or uncertain tones</SelectItem>
                      <SelectItem value="never">Never show suggestions</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-gray-500 mt-2">
                    Control when Tonify provides alternative phrasings
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Accessibility Settings */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={() => setShowAccessibility(!showAccessibility)}
            className="flex items-center justify-between w-full mb-3 hover:opacity-70 transition-opacity"
          >
            <h3 className="text-gray-900 text-[15px]">Accessibility</h3>
            {showAccessibility ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
          </button>

          <AnimatePresence>
            {showAccessibility && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2.5"
              >
                {/* High Contrast */}
                <label className="flex items-center justify-between p-3 bg-[#F6F6F6] rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-3">
                    <Eye className="w-4 h-4 text-gray-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] text-gray-900">High Contrast Mode</div>
                      <div className="text-[12px] text-gray-600 mt-0.5">Increase contrast for better visibility</div>
                    </div>
                  </div>
                  <Switch 
                    checked={settings.highContrast} 
                    onCheckedChange={(checked) => updateSettings({ highContrast: checked })} 
                  />
                </label>

                {/* Colorblind Mode */}
                <div className="p-3 bg-[#F6F6F6] rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Palette className="w-4 h-4 text-gray-600" />
                    <label className="text-[14px] text-gray-900">Colorblind Mode</label>
                  </div>
                  <Select 
                    value={settings.colorblindMode} 
                    onValueChange={(value: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia') => 
                      updateSettings({ colorblindMode: value })
                    }
                  >
                    <SelectTrigger className="text-[14px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="protanopia">Protanopia (Red-blind)</SelectItem>
                      <SelectItem value="deuteranopia">Deuteranopia (Green-blind)</SelectItem>
                      <SelectItem value="tritanopia">Tritanopia (Blue-blind)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Read Aloud */}
                <label className="flex items-center justify-between p-3 bg-[#F6F6F6] rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-3">
                    <Volume2 className="w-4 h-4 text-gray-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] text-gray-900">Read Aloud Feature</div>
                      <div className="text-[12px] text-gray-600 mt-0.5">Read messages in corresponding tone</div>
                    </div>
                  </div>
                  <Switch 
                    checked={settings.readAloudEnabled} 
                    onCheckedChange={(checked) => updateSettings({ readAloudEnabled: checked })} 
                  />
                </label>

                <div className="bg-[#E8F0FE] border border-[#D2E3FC] rounded-lg p-3 text-[11px] text-[#1967D2] leading-[1.5]">
                  Note: These settings apply to the entire app and help make Tonify more accessible.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Create Custom Preset Modal - Custom implementation to stay within phone frame */}
      <AnimatePresence>
        {isCreatingPreset && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreatingPreset(false)}
              className="fixed inset-0 bg-black/50 z-40"
              style={{ position: 'absolute' }}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] max-h-[calc(100%-4rem)] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
              style={{ position: 'absolute' }}
            >
              {/* Header */}
              <div className="px-5 pt-5 pb-3 border-b border-gray-200 shrink-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h2 className="text-[17px] text-gray-900">Create Custom Preset</h2>
                    <p className="text-[13px] text-gray-600 mt-1">
                      Match your preferred communication style
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCreatingPreset(false)}
                    className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-5 py-4 space-y-3.5 overflow-y-auto flex-1">
                <div>
                  <label className="text-[13px] text-gray-700 block mb-1.5">Preset Name *</label>
                  <Input
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder="e.g., Empathetic, Direct, Playful"
                    className="text-[15px]"
                  />
                </div>
                <div>
                  <label className="text-[13px] text-gray-700 block mb-1.5">Description *</label>
                  <Textarea
                    value={newPresetDescription}
                    onChange={(e) => setNewPresetDescription(e.target.value)}
                    placeholder="Describe when and how this tone should be used..."
                    className="min-h-[60px] text-[15px]"
                  />
                </div>
                <div>
                  <label className="text-[13px] text-gray-700 block mb-1.5">Target Tone</label>
                  <Input
                    value={newPresetTargetTone}
                    onChange={(e) => setNewPresetTargetTone(e.target.value)}
                    placeholder="e.g., Warm and supportive"
                    className="text-[15px]"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">The overall tone you want to achieve</p>
                </div>
                <div>
                  <label className="text-[13px] text-gray-700 block mb-1.5">Usage Context</label>
                  <Input
                    value={newPresetUsageContext}
                    onChange={(e) => setNewPresetUsageContext(e.target.value)}
                    placeholder="e.g., With family"
                    className="text-[15px]"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">When to use this preset</p>
                </div>
                <div>
                  <label className="text-[13px] text-gray-700 block mb-1.5">Encourages (comma-separated)</label>
                  <Textarea
                    value={newPresetEncourages}
                    onChange={(e) => setNewPresetEncourages(e.target.value)}
                    placeholder="e.g., Clear explanations, Warmth"
                    className="min-h-[60px] text-[15px]"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">Characteristics to include in messages</p>
                </div>
                <div>
                  <label className="text-[13px] text-gray-700 block mb-1.5">Avoids (comma-separated)</label>
                  <Textarea
                    value={newPresetAvoids}
                    onChange={(e) => setNewPresetAvoids(e.target.value)}
                    placeholder="e.g., Being too brief, Sarcasm"
                    className="min-h-[60px] text-[15px]"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">Things to avoid in messages</p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-gray-200 shrink-0 flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreatingPreset(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreatePreset}
                  disabled={!newPresetName.trim()}
                  className="flex-1 bg-[#007AFF] hover:bg-[#0051D5] disabled:opacity-50"
                >
                  Create
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
        </div>
    </div>
  );
}
