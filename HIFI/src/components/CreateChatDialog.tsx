import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search, Users, User, X } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';

interface CreateChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChatCreate: (contactIds: string[], contacts: { id: string; name: string; avatar: string }[]) => void;
}

const mockContacts = [
  { id: 'c1', name: 'Sarah Mitchell', avatar: 'SM' },
  { id: 'c2', name: 'Mike Chen', avatar: 'MC' },
  { id: 'c3', name: 'Alex Rivera', avatar: 'AR' },
  { id: 'c4', name: 'Jordan Lee', avatar: 'JL' },
  { id: 'c5', name: 'Taylor Kim', avatar: 'TK' },
  { id: 'c6', name: 'Casey Morgan', avatar: 'CM' },
  { id: 'c7', name: 'Riley Parker', avatar: 'RP' },
  { id: 'c8', name: 'Quinn Davis', avatar: 'QD' },
];

export function CreateChatDialog({ open, onOpenChange, onChatCreate }: CreateChatDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  const filteredContacts = searchQuery.trim()
    ? mockContacts.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mockContacts;

  const toggleContact = (contactId: string) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleCreate = () => {
    if (selectedContacts.length === 0) return;
    
    // Get the selected contacts data
    const selectedContactsData = selectedContacts
      .map(id => mockContacts.find(c => c.id === id))
      .filter(Boolean) as { id: string; name: string; avatar: string }[];
    
    // Call the onChatCreate callback with the selected contacts
    onChatCreate(selectedContacts, selectedContactsData);
    
    // Close dialog and reset state
    onOpenChange(false);
    setSelectedContacts([]);
    setSearchQuery('');
  };

  const isGroupChat = selectedContacts.length > 1;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="absolute inset-0 bg-black/50 z-40"
          />
          
          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] max-h-[calc(100%-4rem)] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 pt-5 pb-4 border-b border-gray-200 shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[17px] text-gray-900">New Message</h2>
                <button
                  onClick={() => onOpenChange(false)}
                  className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts..."
              className="pl-9 bg-[#E5E5EA] border-0 focus-visible:ring-1 focus-visible:ring-[#007AFF] rounded-lg"
            />
          </div>

          {/* Selected Contacts */}
          {selectedContacts.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex items-center gap-2 mb-2.5">
                {isGroupChat ? (
                  <Users className="w-4 h-4 text-gray-500" />
                ) : (
                  <User className="w-4 h-4 text-gray-500" />
                )}
                <span className="text-[13px] text-gray-600">
                  {isGroupChat ? 'Group Chat' : '1-on-1 Chat'}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedContacts.map(id => {
                  const contact = mockContacts.find(c => c.id === id);
                  return contact ? (
                    <div
                      key={id}
                      className="flex items-center gap-1.5 bg-[#007AFF] text-white rounded-full px-3 py-1.5 text-[13px]"
                    >
                      <span>{contact.name.split(' ')[0]}</span>
                      <button
                        onClick={() => toggleContact(id)}
                        className="hover:opacity-80"
                      >
                        ×
                      </button>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}

              {/* Contact List */}
              <div className="space-y-1.5">
                {filteredContacts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No contacts found
                  </div>
                ) : (
                  filteredContacts.map(contact => (
                    <button
                      key={contact.id}
                      onClick={() => toggleContact(contact.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                        selectedContacts.includes(contact.id) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-[#007AFF] text-white text-[13px]">
                          {contact.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[15px] flex-1 text-left">{contact.name}</span>
                      {selectedContacts.includes(contact.id) && (
                        <div className="w-5 h-5 rounded-full bg-[#007AFF] flex items-center justify-center shrink-0">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Footer with Create Button */}
            <div className="px-5 py-4 border-t border-gray-200 shrink-0">
              <Button
                onClick={handleCreate}
                disabled={selectedContacts.length === 0}
                className="w-full h-11 bg-[#007AFF] hover:bg-[#0051D5] disabled:opacity-50 text-[15px]"
              >
                Create {isGroupChat ? 'Group' : 'Chat'} ({selectedContacts.length})
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
