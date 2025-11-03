import React, { useState, useEffect } from 'react';
import { ChatListScreen } from './components/ChatListScreen';
import { ChatConversationScreen } from './components/ChatConversationScreen';
import { CreateChatDialog } from './components/CreateChatDialog';
import { ComposeArea } from './components/ComposeArea';
import { ToneSettings, TonePreset } from './components/ToneSettings';
import { TechRequirementsDemo } from './components/TechRequirementsDemo';
import { OnboardingWalkthrough } from './components/OnboardingWalkthrough';
import { AccessibilityProvider } from './components/AccessibilitySettings';
import { ToneSettingsProvider } from './components/ToneSettingsContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { MessageCircle, Settings, Sparkles, FlaskConical } from 'lucide-react';
import { AnimatePresence } from 'motion/react';

// Chat details lookup - now as state that can be updated
const initialChatDetails: Record<string, { name: string; isGroup: boolean }> = {
  '1': { name: 'Sarah Mitchell', isGroup: false },
  '2': { name: 'Mike Chen', isGroup: false },
  '3': { name: 'Study Group', isGroup: true },
  '4': { name: 'Mom', isGroup: false },
  '5': { name: 'Project Team', isGroup: true },
  '6': { name: 'Alex Rivera', isGroup: false },
  '7': { name: 'Jordan Lee', isGroup: false },
  '8': { name: 'Family', isGroup: true },
  '9': { name: 'Taylor Kim', isGroup: false },
  '10': { name: 'Book Club', isGroup: true },
};

export default function App() {
  const [activeTab, setActiveTab] = useState('messages');
  const [selectedPreset, setSelectedPreset] = useState('friendly-clear');
  const [allPresets, setAllPresets] = useState<TonePreset[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showCreateChat, setShowCreateChat] = useState(false);
  const [chatDetails, setChatDetails] = useState(initialChatDetails);
  const [nextChatId, setNextChatId] = useState(11);

  // Reset chat selection when switching tabs
  useEffect(() => {
    if (activeTab !== 'messages') {
      setSelectedChatId(null);
    }
  }, [activeTab]);

  // Check if this is the first time opening the app
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('tonify-onboarding-complete');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('tonify-onboarding-complete', 'true');
    setShowOnboarding(false);
  };

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  const handleBackToList = () => {
    setSelectedChatId(null);
  };

  const handleCreateChat = () => {
    setShowCreateChat(true);
  };

  const handleChatCreate = (contactIds: string[], contacts: { id: string; name: string; avatar: string }[]) => {
    // Create a new chat ID
    const newChatId = String(nextChatId);
    setNextChatId(prev => prev + 1);
    
    // Determine chat name based on number of contacts
    const isGroup = contacts.length > 1;
    const chatName = isGroup 
      ? contacts.map(c => c.name.split(' ')[0]).join(', ') 
      : contacts[0].name;
    
    // Add the new chat to chatDetails
    setChatDetails(prev => ({
      ...prev,
      [newChatId]: {
        name: chatName,
        isGroup
      }
    }));
    
    // Navigate to the new chat
    setSelectedChatId(newChatId);
  };

  return (
    <AccessibilityProvider>
      <ToneSettingsProvider>
      <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4">
        {/* iPhone 13 Frame */}
        <div className="relative w-[390px]">
          {/* iPhone Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-50"></div>
          
          {/* iPhone Screen */}
          <div className="bg-black rounded-[3rem] p-3 shadow-2xl">
            <div className="bg-white rounded-[2.5rem] overflow-hidden h-[844px] flex flex-col relative">
              {/* Onboarding Walkthrough */}
              <AnimatePresence>
                {showOnboarding && (
                  <OnboardingWalkthrough onComplete={handleOnboardingComplete} />
                )}
              </AnimatePresence>

            {/* Tab Navigation - iMessage Style */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
              <TabsContent value="messages" className="m-0 p-0 flex-1 min-h-0 overflow-hidden">
                {selectedChatId ? (
                  <ChatConversationScreen
                    chatId={selectedChatId}
                    chatName={chatDetails[selectedChatId]?.name || 'Chat'}
                    isGroup={chatDetails[selectedChatId]?.isGroup || false}
                    onBack={handleBackToList}
                    selectedPreset={selectedPreset}
                    allPresets={allPresets}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                  />
                ) : (
                  <ChatListScreen 
                    onChatSelect={handleChatSelect}
                    onCreateChat={handleCreateChat}
                    customChats={chatDetails}
                  />
                )}
              </TabsContent>

              <TabsContent value="compose" className="m-0 p-0 flex-1 min-h-0">
                <ComposeArea 
                  selectedPreset={selectedPreset}
                  allPresets={allPresets}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />
              </TabsContent>

              <TabsContent value="settings" className="m-0 p-0 flex-1 min-h-0">
                <ToneSettings 
                  selectedPreset={selectedPreset} 
                  onPresetChange={setSelectedPreset}
                  onPresetsChange={setAllPresets}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />
              </TabsContent>

              <TabsContent value="requirements" className="m-0 p-0 flex-1 min-h-0">
                <TechRequirementsDemo 
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />
              </TabsContent>
            </Tabs>

            {/* Create Chat Dialog */}
            <CreateChatDialog 
              open={showCreateChat}
              onOpenChange={setShowCreateChat}
              onChatCreate={handleChatCreate}
            />
          </div>
        </div>
      </div>
    </div>
      </ToneSettingsProvider>
    </AccessibilityProvider>
  );
}
