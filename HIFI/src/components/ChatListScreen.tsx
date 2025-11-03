import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Edit3, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';

export interface Chat {
  id: string;
  name: string;
  isGroup: boolean;
  lastMessage: string;
  timestamp: string;
  unread: number;
  avatar?: string;
  participants?: string[];
}

interface ChatListScreenProps {
  onChatSelect: (chatId: string) => void;
  onCreateChat: () => void;
  customChats?: Record<string, { name: string; isGroup: boolean }>;
}

const mockChats: Chat[] = [
  {
    id: '1',
    name: 'Sarah Mitchell',
    isGroup: false,
    lastMessage: "No sorry! I'm just stressed about work",
    timestamp: '2:18 PM',
    unread: 2,
    avatar: 'SM'
  },
  {
    id: '2',
    name: 'Mike Chen',
    isGroup: false,
    lastMessage: "wow really?",
    timestamp: '3:45 PM',
    unread: 1,
    avatar: 'MC'
  },
  {
    id: '3',
    name: 'Study Group',
    isGroup: true,
    lastMessage: "Alex: Can we meet tomorrow?",
    timestamp: '4:12 PM',
    unread: 0,
    participants: ['Alex', 'Jordan', 'Taylor']
  },
  {
    id: '4',
    name: 'Mom',
    isGroup: false,
    lastMessage: "Love you! Have a great day 💕",
    timestamp: 'Yesterday',
    unread: 0,
    avatar: 'MO'
  },
  {
    id: '5',
    name: 'Project Team',
    isGroup: true,
    lastMessage: "Jamie: Updated the presentation",
    timestamp: 'Yesterday',
    unread: 5,
    participants: ['Jamie', 'Sam', 'Chris', 'Morgan']
  },
  {
    id: '6',
    name: 'Alex Rivera',
    isGroup: false,
    lastMessage: "k",
    timestamp: 'Tuesday',
    unread: 0,
    avatar: 'AR'
  },
  {
    id: '7',
    name: 'Jordan Lee',
    isGroup: false,
    lastMessage: "That sounds great! Let's do it",
    timestamp: 'Monday',
    unread: 0,
    avatar: 'JL'
  },
  {
    id: '8',
    name: 'Family',
    isGroup: true,
    lastMessage: "Dad: See you all on Sunday!",
    timestamp: 'Monday',
    unread: 0,
    participants: ['Mom', 'Dad', 'Sister']
  },
  {
    id: '9',
    name: 'Taylor Kim',
    isGroup: false,
    lastMessage: "Thanks for your help yesterday 😊",
    timestamp: 'Sunday',
    unread: 0,
    avatar: 'TK'
  },
  {
    id: '10',
    name: 'Book Club',
    isGroup: true,
    lastMessage: "Casey: What did everyone think?",
    timestamp: 'Saturday',
    unread: 0,
    participants: ['Casey', 'Riley', 'Quinn']
  }
];

export function ChatListScreen({ onChatSelect, onCreateChat, customChats }: ChatListScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Merge custom chats with mock chats
  const allChats = React.useMemo(() => {
    const customChatsList: Chat[] = customChats 
      ? Object.entries(customChats)
          .filter(([id]) => !mockChats.find(c => c.id === id))
          .map(([id, details]) => ({
            id,
            name: details.name,
            isGroup: details.isGroup,
            lastMessage: 'Start a conversation...',
            timestamp: 'Now',
            unread: 0,
            avatar: details.name.split(' ').map(n => n[0]).join(''),
            participants: details.isGroup ? details.name.split(', ') : undefined
          }))
      : [];
    
    return [...customChatsList, ...mockChats];
  }, [customChats]);

  const filteredChats = searchQuery.trim()
    ? allChats.filter(chat =>
        chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allChats;

  const getGroupAvatar = (participants?: string[]) => {
    if (!participants || participants.length === 0) return 'GR';
    return participants.slice(0, 2).map(p => p[0]).join('');
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-[#F6F6F6] border-b border-[#E5E5EA] shrink-0">
        <div className="pt-[52px] pb-[8px] px-4">
          <h1 className="text-center text-[#000000] text-[17px] tracking-[-0.4px]">Messages</h1>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-[8px] py-[8px] bg-[#F6F6F6] border-b border-[#E5E5EA] shrink-0">
        <div className="relative">
          <Search className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[13px] h-[13px] text-[#8E8E93]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full pl-[32px] pr-3 py-[7px] bg-[#E5E5EA] rounded-[10px] text-[17px] placeholder:text-[#8E8E93] focus:outline-none focus:bg-[#D1D1D6] transition-colors"
          />
        </div>
      </div>

      {/* Create Chat Button */}
      <div className="px-[16px] py-[12px] bg-white border-b border-[#E5E5EA] shrink-0">
        <button 
          onClick={onCreateChat}
          className="flex items-center gap-[12px] text-[#007AFF] hover:opacity-80 transition-opacity active:opacity-60"
        >
          <div className="w-[36px] h-[36px] rounded-full bg-[#007AFF] flex items-center justify-center">
            <Edit3 className="w-[18px] h-[18px] text-white" strokeWidth={2} />
          </div>
          <span className="text-[17px] tracking-[-0.4px]">New Message</span>
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6 text-center">
            <p className="text-gray-500 text-[15px]">No conversations found</p>
            <p className="text-gray-400 text-[13px] mt-1">Try a different search term</p>
          </div>
        ) : (
          <div>
            {/* Personal Chats Section */}
            {filteredChats.some(chat => !chat.isGroup) && (
              <div>
                <div className="px-4 pt-[10px] pb-[4px]">
                  <h3 className="text-[12px] text-[#8E8E93] uppercase tracking-[0.08em]">Personal Chats</h3>
                </div>
                {filteredChats
                  .filter(chat => !chat.isGroup)
                  .map((chat, index) => (
                    <ChatCell 
                      key={chat.id} 
                      chat={chat} 
                      onSelect={onChatSelect}
                      delay={index * 0.03}
                      getGroupAvatar={getGroupAvatar}
                    />
                  ))}
              </div>
            )}

            {/* Group Chats Section */}
            {filteredChats.some(chat => chat.isGroup) && (
              <div>
                <div className="px-4 pt-[10px] pb-[4px]">
                  <h3 className="text-[12px] text-[#8E8E93] uppercase tracking-[0.08em]">Group Chats</h3>
                </div>
                {filteredChats
                  .filter(chat => chat.isGroup)
                  .map((chat, index) => (
                    <ChatCell 
                      key={chat.id} 
                      chat={chat} 
                      onSelect={onChatSelect}
                      delay={index * 0.03}
                      getGroupAvatar={getGroupAvatar}
                    />
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Separate ChatCell component for better organization
function ChatCell({ 
  chat, 
  onSelect, 
  delay,
  getGroupAvatar 
}: { 
  chat: Chat; 
  onSelect: (id: string) => void; 
  delay: number;
  getGroupAvatar: (participants?: string[]) => string;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      onClick={() => onSelect(chat.id)}
      className="w-full px-[16px] py-[11px] flex items-center gap-[12px] hover:bg-[#F6F6F6] active:bg-[#E5E5EA] transition-colors border-b border-[#E5E5EA]"
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <Avatar className="w-[40px] h-[40px]">
          <AvatarFallback className={`${
            chat.isGroup ? 'bg-[#8E8E93]' : 'bg-[#007AFF]'
          } text-white text-[15px]`}>
            {chat.isGroup ? getGroupAvatar(chat.participants) : chat.avatar}
          </AvatarFallback>
        </Avatar>
        {chat.unread > 0 && (
          <div className="absolute -top-[2px] -right-[2px] min-w-[20px] h-[20px] bg-[#007AFF] rounded-full flex items-center justify-center px-[6px]">
            <span className="text-white text-[12px]">{chat.unread}</span>
          </div>
        )}
      </div>

      {/* Chat Info */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between mb-[2px]">
          <h3 className="text-[17px] tracking-[-0.4px] truncate">
            {chat.name}
          </h3>
          <div className="flex items-center gap-[6px] shrink-0 ml-2">
            <span className={`text-[15px] tracking-[-0.2px] ${
              chat.unread > 0 ? 'text-[#007AFF]' : 'text-[#8E8E93]'
            }`}>
              {chat.timestamp}
            </span>
            <ChevronRight className="w-[20px] h-[20px] text-[#C7C7CC]" strokeWidth={2} />
          </div>
        </div>
        <p className={`text-[15px] tracking-[-0.2px] truncate leading-[1.3] ${
          chat.unread > 0 ? 'text-[#000000]' : 'text-[#8E8E93]'
        }`}>
          {chat.lastMessage}
        </p>
      </div>
    </motion.button>
  );
}
