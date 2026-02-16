'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TestamentModalProps {
  isOpen: boolean;
  playerName: string;
  roleName?: string;
  testament?: string;
  isEditable?: boolean;
  onClose: () => void;
  onSave?: (text: string) => void;
}

export default function TestamentModal({
  isOpen,
  playerName,
  roleName,
  testament = '',
  isEditable = false,
  onClose,
  onSave,
}: TestamentModalProps) {
  const [text, setText] = useState(testament);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setText(testament);
  }, [testament]);

  const handleSave = () => {
    onSave?.(text);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            className="relative max-w-2xl w-full"
            style={{
              aspectRatio: '3/4',
              maxHeight: '85vh',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Testament Background Image */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: "url('/sounds/Last_Will.webp')",
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                filter: 'drop-shadow(0 10px 40px rgba(0,0,0,0.9))',
              }}
            />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{
                background: 'rgba(26, 16, 4, 0.95)',
                border: '2px solid #6b4a1a',
                color: '#e8d4b8',
                fontSize: 20,
                boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
              }}
            >
              ✕
            </button>

            {/* Testament Content Overlay */}
            <div
              className="absolute inset-0 flex flex-col p-12"
              style={{
                paddingTop: '15%',
                paddingBottom: '12%',
                paddingLeft: '18%',
                paddingRight: '18%',
              }}
            >
              {/* Header */}
              <div className="text-center mb-4">
                <h2
                  className="font-pirata mb-1"
                  style={{
                    fontSize: 32,
                    color: '#2a1a08',
                    textShadow: '1px 1px 2px rgba(255,255,255,0.3)',
                    letterSpacing: 2,
                  }}
                >
                  Last Will and Testament
                </h2>
                <p
                  className="font-medieval"
                  style={{
                    fontSize: 18,
                    color: '#3a2410',
                    textShadow: '0.5px 0.5px 1px rgba(255,255,255,0.2)',
                  }}
                >
                  {playerName} {roleName && `- ${roleName}`}
                </p>
              </div>

              {/* Testament Text */}
              {isEditable ? (
                <textarea
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value.slice(0, 500));
                    setSaved(false);
                  }}
                  maxLength={500}
                  placeholder="Escribe tu testamento aquí... Será visible cuando mueras."
                  className="flex-1 w-full p-4 font-crimson resize-none focus:outline-none bg-transparent"
                  style={{
                    color: '#1a1004',
                    fontSize: 16,
                    lineHeight: 1.5,
                    textShadow: '0.5px 0.5px 1px rgba(255,255,255,0.1)',
                    caretColor: '#2a1a08',
                  }}
                />
              ) : (
                <div
                  className="flex-1 w-full p-4 font-crimson overflow-y-auto"
                  style={{
                    color: '#1a1004',
                    fontSize: 16,
                    lineHeight: 1.5,
                    textShadow: '0.5px 0.5px 1px rgba(255,255,255,0.1)',
                  }}
                >
                  {text || (
                    <p className="italic opacity-50">
                      No dejó testamento...
                    </p>
                  )}
                </div>
              )}

              {/* Footer - Save button & Character count */}
              {isEditable && (
                <div className="flex items-center justify-between mt-4">
                  <span
                    className="font-medieval"
                    style={{
                      fontSize: 13,
                      color: text.length >= 480 ? '#b83030' : '#5a4020',
                    }}
                  >
                    {text.length} / 500
                  </span>
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 rounded font-medieval transition-all hover:scale-105"
                    style={{
                      background: saved ? '#2a5a2a' : '#5a3a10',
                      border: '2px solid ' + (saved ? '#4a8a4a' : '#8b6914'),
                      color: saved ? '#90ff90' : '#e8d4b8',
                      fontSize: 15,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                    }}
                  >
                    {saved ? '✅ Guardado' : '💾 Guardar Testamento'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
