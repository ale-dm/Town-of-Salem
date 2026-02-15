'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  author: {
    id: string;
    name: string;
    position: number;
  };
  content: string;
  timestamp: Date;
  channel: 'PUBLIC' | 'MAFIA' | 'DEAD' | 'JAIL' | 'WHISPER';
  isSystem?: boolean;
}

interface ChatBoxProps {
  messages: ChatMessage[];
  onSendMessage: (content: string, channel?: string) => void;
  yourPlayerId: string | null;
  currentChannel?: string;
  disabled?: boolean;
  placeholder?: string;
}

const CHANNEL_COLORS: Record<string, string> = {
  PUBLIC: 'border-mafia-gold',
  MAFIA: 'border-mafia-blood',
  DEAD: 'border-neutral',
  JAIL: 'border-yellow-600',
  WHISPER: 'border-purple-500',
};

const CHANNEL_LABELS: Record<string, string> = {
  PUBLIC: '💬 Público',
  MAFIA: '🔪 Mafia',
  DEAD: '💀 Muertos',
  JAIL: '⛓️ Cárcel',
  WHISPER: '🤫 Susurro',
};

export default function ChatBox({
  messages,
  onSendMessage,
  yourPlayerId,
  currentChannel = 'PUBLIC',
  disabled = false,
  placeholder = 'Escribe un mensaje...',
}: ChatBoxProps) {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed || disabled) return;
    onSendMessage(trimmed, currentChannel);
    setMessage('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Channel indicator */}
      <div className="flex items-center gap-2 px-3 py-2 bg-mafia-dark/60 border-b border-mafia-wood/30">
        <span className="font-medieval text-sm text-mafia-gold">
          {CHANNEL_LABELS[currentChannel] || '💬 Chat'}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-medieval p-3 space-y-1 min-h-0">
        {messages.length === 0 && (
          <p className="text-center text-mafia-text/30 font-crimson italic py-8">
            No hay mensajes aún...
          </p>
        )}
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm',
                CHANNEL_COLORS[msg.channel] || 'border-mafia-gold',
                msg.isSystem
                  ? 'bg-mafia-dark/40 text-mafia-gold/70 text-center italic border-l-0'
                  : 'bg-mafia-wood-dark/50 border-l-3',
                msg.author.id === yourPlayerId && !msg.isSystem && 'bg-mafia-wood/30'
              )}
            >
              {!msg.isSystem && (
                <span className="font-medieval text-mafia-gold text-xs mr-2">
                  [{msg.author.position}] {msg.author.name}:
                </span>
              )}
              <span className="font-crimson text-mafia-text">{msg.content}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-2 border-t border-mafia-wood/30 bg-mafia-dark/40">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? 'Chat deshabilitado' : placeholder}
            disabled={disabled}
            maxLength={200}
            className="input-medieval flex-1 text-sm py-2"
          />
          <button
            onClick={handleSend}
            disabled={disabled || !message.trim()}
            className="btn-medieval px-4 py-2 text-sm disabled:opacity-30"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
