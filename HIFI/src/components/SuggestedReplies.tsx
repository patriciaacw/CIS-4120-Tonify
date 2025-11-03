import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';

interface SuggestedRepliesProps {
  replies: Array<{
    text: string;
    tone: string;
  }>;
  onSelect?: (text: string) => void;
}

export function SuggestedReplies({ replies, onSelect }: SuggestedRepliesProps) {
  const [confirmingReply, setConfirmingReply] = useState<{ text: string; tone: string } | null>(null);

  const handleSendReply = (reply: { text: string; tone: string }) => {
    if (onSelect) {
      onSelect(reply.text);
    } else {
      setConfirmingReply(reply);
    }
  };

  const confirmSend = () => {
    // Here you would actually send the message
    console.log('Sending:', confirmingReply?.text);
    if (onSelect && confirmingReply) {
      onSelect(confirmingReply.text);
    }
    setConfirmingReply(null);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="mt-2 space-y-2"
      >
        {replies.map((reply, idx) => (
          <motion.button
            key={idx}
            onClick={() => handleSendReply(reply)}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-xl hover:border-[#007AFF] hover:bg-[#007AFF]/5 transition-all group text-left"
          >
            <div className="flex-1">
              <p className="text-sm text-gray-900">{reply.text}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{reply.tone} tone</p>
            </div>
            <Send className="w-3 h-3 text-gray-400 group-hover:text-[#007AFF] transition-colors" />
          </motion.button>
        ))}
      </motion.div>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmingReply} onOpenChange={() => setConfirmingReply(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send this reply?</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-2 mt-2">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-gray-900">{confirmingReply?.text}</p>
                </div>
                <p className="text-xs text-gray-600">
                  Tone: {confirmingReply?.tone}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmSend}
              className="bg-[#007AFF] hover:bg-[#0051D5]"
            >
              Send Message
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
