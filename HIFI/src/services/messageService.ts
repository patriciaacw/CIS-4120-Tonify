import { database } from '../config/firebase';
import { ref, push, onValue, off, serverTimestamp, set } from 'firebase/database';

export interface ToneData {
  text: string;
  tone: string;
  confidence: number;
  timestamp: number;
  userId: string;
}

export interface Message {
  id?: string;
  text: string;
  tone?: string;
  confidence?: number;
  timestamp: number;
  userId: string;
  chatId: string;
}

/**
 * Send a message with tone data to a specific chat
 */
export const sendMessage = async (
  chatId: string,
  messageData: Omit<Message, 'id' | 'timestamp'>
): Promise<string> => {
  try {
    const messagesRef = ref(database, `chats/${chatId}/messages`);
    const newMessageRef = push(messagesRef);
    
    await set(newMessageRef, {
      ...messageData,
      timestamp: serverTimestamp(),
    });
    
    return newMessageRef.key!;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Send tone analysis data
 */
export const sendToneData = async (
  conversationId: string,
  toneData: Omit<ToneData, 'timestamp'>
): Promise<void> => {
  try {
    const toneRef = ref(database, `conversations/${conversationId}/toneAnalysis`);
    await push(toneRef, {
      ...toneData,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error sending tone data:', error);
    throw error;
  }
};

/**
 * Listen for new messages in a chat
 */
export const subscribeToMessages = (
  chatId: string,
  callback: (messages: Message[]) => void
): (() => void) => {
  const messagesRef = ref(database, `chats/${chatId}/messages`);
  
  const unsubscribe = onValue(messagesRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const messages: Message[] = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
      callback(messages);
    } else {
      callback([]);
    }
  });

  // Return cleanup function
  return () => off(messagesRef);
};

/**
 * Listen for tone analysis updates
 */
export const subscribeToToneAnalysis = (
  conversationId: string,
  callback: (toneData: ToneData[]) => void
): (() => void) => {
  const toneRef = ref(database, `conversations/${conversationId}/toneAnalysis`);
  
  const unsubscribe = onValue(toneRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const toneDataArray: ToneData[] = Object.values(data);
      callback(toneDataArray);
    } else {
      callback([]);
    }
  });

  return () => off(toneRef);
};