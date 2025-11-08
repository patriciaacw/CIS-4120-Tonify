import { database } from '../config/firebase';
import { ref, push, set, get, onValue, off } from 'firebase/database';

export interface Chat {
  id: string;
  name: string;
  isGroup: boolean;
  participants: string[];
  lastMessage?: string;
  lastMessageTime?: number;
}

/**
 * Create a new chat
 */
export const createChat = async (
  name: string,
  participants: string[],
  isGroup: boolean
): Promise<string> => {
  try {
    const chatsRef = ref(database, 'chats');
    const newChatRef = push(chatsRef);
    
    await set(newChatRef, {
      name,
      participants,
      isGroup,
      createdAt: Date.now(),
    });
    
    return newChatRef.key!;
  } catch (error) {
    console.error('Error creating chat:', error);
    throw error;
  }
};

/**
 * Get all chats for a user
 */
export const getUserChats = async (userId: string): Promise<Chat[]> => {
  try {
    const chatsRef = ref(database, 'chats');
    const snapshot = await get(chatsRef);
    
    if (snapshot.exists()) {
      const allChats = snapshot.val();
      const userChats: Chat[] = [];
      
      Object.keys(allChats).forEach(chatId => {
        const chat = allChats[chatId];
        if (chat.participants.includes(userId)) {
          userChats.push({
            id: chatId,
            ...chat
          });
        }
      });
      
      return userChats;
    }
    
    return [];
  } catch (error) {
    console.error('Error getting user chats:', error);
    throw error;
  }
};

/**
 * Subscribe to chat updates
 */
export const subscribeToChats = (
  userId: string,
  callback: (chats: Chat[]) => void
): (() => void) => {
  const chatsRef = ref(database, 'chats');
  
  const unsubscribe = onValue(chatsRef, (snapshot) => {
    if (snapshot.exists()) {
      const allChats = snapshot.val();
      const userChats: Chat[] = [];
      
      Object.keys(allChats).forEach(chatId => {
        const chat = allChats[chatId];
        if (chat.participants.includes(userId)) {
          userChats.push({
            id: chatId,
            ...chat
          });
        }
      });
      
      callback(userChats);
    } else {
      callback([]);
    }
  });

  return () => off(chatsRef);
};