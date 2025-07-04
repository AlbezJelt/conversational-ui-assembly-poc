import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles } from 'lucide-react';
import { useConversationStore } from '../conversation/conversationStore';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  intent?: string;
}

interface ConversationPanelProps {
  onSendMessage: (message: string) => void;
  isProcessing?: boolean;
  className?: string;
}

/**
 * Elegant conversation interface with typing indicators and smooth animations.
 * Maintains context and provides visual feedback for AI processing.
 */
export const ConversationPanel: React.FC<ConversationPanelProps> = ({
  onSendMessage,
  isProcessing = false,
  className = ''
}) => {
  const { messages, addMessage } = useConversationStore();
  const [input, setInput] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (input.trim() && !isProcessing) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const messageVariants = {
    initial: { opacity: 0, y: 10, scale: 0.95 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1]
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  const typingIndicatorVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div 
      className={`flex flex-col h-full bg-white ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-sm font-medium uppercase tracking-wider text-gray-900">
          Personal Shopping Assistant
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Tell me what you're looking for
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              variants={messageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              layout
              className={`flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                {message.intent && (
                  <div className="mt-2 flex items-center gap-1">
                    <Sparkles size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {message.intent}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              variants={typingIndicatorVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex justify-start"
            >
              <div className="bg-gray-100 px-4 py-3 rounded-2xl">
                <div className="flex items-center gap-1">
                  <motion.span
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  />
                  <motion.span
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.span
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Describe what you're looking for..."
            className="flex-1 px-4 py-2 bg-gray-50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
            disabled={isProcessing}
          />
          <motion.button
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            className="p-2 bg-black text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send size={20} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Register component
if (typeof window !== 'undefined' && window.ComponentRegistry) {
  window.ComponentRegistry.register('ConversationPanel', ConversationPanel);
}