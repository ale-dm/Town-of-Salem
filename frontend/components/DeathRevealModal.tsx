'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TestamentModal from './TestamentModal';

interface DeathInfo {
  playerId: string;
  playerName: string;
  position: number;
  roleName?: string;
  faction?: string;
  testament?: string;
  deathNote?: string;
  cause?: string;
  isCleaned?: boolean;
}

interface DeathRevealModalProps {
  deaths: DeathInfo[];
  isActive: boolean;
  onComplete: () => void;
}

export default function DeathRevealModal({ deaths, isActive, onComplete }: DeathRevealModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTestament, setShowTestament] = useState(false);

  const handleNext = useCallback(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= deaths.length) {
      // Last death, complete
      onComplete();
      setCurrentIndex(0);
    } else {
      setCurrentIndex(nextIndex);
    }
    setShowTestament(false);
  }, [currentIndex, deaths.length, onComplete]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isActive || showTestament) return;
    
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isActive, showTestament, handleNext]);

  // Auto-advance timer
  useEffect(() => {
    if (!isActive || deaths.length === 0 || showTestament) {
      return;
    }

    // Set timer for auto-advance (4.5 seconds)
    const timer = setTimeout(() => {
      handleNext();
    }, 4500);

    return () => clearTimeout(timer);
  }, [isActive, deaths.length, currentIndex, showTestament, handleNext]);

  if (!isActive || deaths.length === 0 || currentIndex >= deaths.length) {
    return null;
  }

  const currentDeath = deaths[currentIndex];
  const progress = ((currentIndex + 1) / deaths.length) * 100;

  return (
    <>
      <motion.div
        key={`death-${currentIndex}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 flex items-center justify-center p-4"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.95) 100%)',
          backdropFilter: 'blur(8px)',
        }}
      >
        {/* Death Announcement Card */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: 100 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.7, opacity: 0, y: -100 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          className="relative max-w-md w-full p-8 rounded-lg"
          style={{
            background: 'linear-gradient(135deg, #1a1004 0%, #2a1808 50%, #1a1004 100%)',
            border: '4px solid #6b4a1a',
            boxShadow: '0 20px 60px rgba(0,0,0,0.9), inset 0 0 40px rgba(0,0,0,0.3)',
          }}
        >
          {/* Skull decoration */}
          <motion.div
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', damping: 15 }}
            className="flex justify-center mb-4"
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: 'radial-gradient(circle, #2a1a08 0%, #0a0604 100%)',
                border: '3px solid #4a3418',
                fontSize: 48,
              }}
            >
              💀
            </div>
          </motion.div>

          {/* Player died announcement */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-pirata text-center mb-2"
            style={{
              fontSize: 36,
              color: '#c03030',
              textShadow: '2px 2px 8px rgba(0,0,0,0.8)',
              letterSpacing: 2,
            }}
          >
            {currentDeath.playerName} ha muerto
          </motion.h2>

          {/* Position */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center font-medieval mb-4"
            style={{
              fontSize: 16,
              color: '#8b6914',
            }}
          >
            Posición {currentDeath.position}
          </motion.p>

          {/* Role reveal (unless cleaned) */}
          {!currentDeath.isCleaned && currentDeath.roleName && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center mb-4 p-4 rounded"
              style={{
                background: 'rgba(0,0,0,0.4)',
                border: '2px solid #4a3418',
              }}
            >
              <p className="font-medieval mb-1" style={{ fontSize: 14, color: '#8b6914' }}>
                Su rol era:
              </p>
              <p
                className="font-pirata"
                style={{
                  fontSize: 24,
                  color: currentDeath.faction === 'TOWN' ? '#44bb44' : 
                         currentDeath.faction === 'MAFIA' ? '#c03030' : '#8b6914',
                  textShadow: '1px 1px 4px rgba(0,0,0,0.7)',
                }}
              >
                {currentDeath.roleName}
              </p>
            </motion.div>
          )}

          {/* Cleaned message */}
          {currentDeath.isCleaned && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center mb-4 p-4 rounded"
              style={{
                background: 'rgba(20,10,5,0.7)',
                border: '2px solid #2a1a08',
              }}
            >
              <p className="font-medieval italic" style={{ fontSize: 15, color: '#6b4a1a' }}>
                🧹 Su cuerpo fue limpiado por un Janitor
              </p>
              <p className="font-crimson text-sm mt-1" style={{ color: '#4a3418' }}>
                No se pudo determinar su rol
              </p>
            </motion.div>
          )}

          {/* Death note */}
          {currentDeath.deathNote && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="mb-4 p-3 rounded"
              style={{
                background: 'rgba(60,10,10,0.3)',
                border: '2px solid #5a0a0a',
              }}
            >
              <p className="font-medieval text-red-400 mb-1" style={{ fontSize: 13 }}>
                💀 Nota de Muerte:
              </p>
              <p className="font-crimson italic" style={{ fontSize: 14, color: '#ff8080' }}>
                "{currentDeath.deathNote}"
              </p>
            </motion.div>
          )}

          {/* Testament button */}
          {!currentDeath.isCleaned && currentDeath.testament && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex justify-center"
            >
              <button
                onClick={() => setShowTestament(true)}
                className="px-6 py-3 rounded-lg font-medieval transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #3a2810 0%, #2a1808 100%)',
                  border: '3px solid #6b4a1a',
                  color: '#e8c868',
                  fontSize: 16,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <img
                  src="/sounds/Last_Will_Button_-_Unity.webp"
                  alt="Testament"
                  style={{ width: 24, height: 24 }}
                />
                Ver Testamento
              </button>
            </motion.div>
          )}

          {/* Continue/Next button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="flex justify-center mt-4"
          >
            <button
              onClick={handleNext}
              className="px-8 py-2 rounded-lg font-medieval transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #1a1004 0%, #3a2810 100%)',
                border: '2px solid #8b6914',
                color: '#c8a020',
                fontSize: 14,
                boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
              }}
            >
              {currentIndex + 1 < deaths.length ? 'Siguiente ►' : 'Continuar ►'}
            </button>
          </motion.div>

          {/* Progress bar */}
          {deaths.length > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-6"
            >
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ background: 'rgba(0,0,0,0.5)' }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #8b6914 0%, #c8a020 100%)',
                    boxShadow: '0 0 10px rgba(200,160,32,0.5)',
                  }}
                />
              </div>
              <p className="text-center mt-2 font-medieval" style={{ fontSize: 12, color: '#6b4a1a' }}>
                {currentIndex + 1} de {deaths.length} muertes
              </p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Testament Modal */}
      {showTestament && !currentDeath.isCleaned && (
        <TestamentModal
          isOpen={showTestament}
          playerName={currentDeath.playerName}
          roleName={currentDeath.roleName}
          testament={currentDeath.testament}
          isEditable={false}
          onClose={() => setShowTestament(false)}
        />
      )}
    </>
  );
}
