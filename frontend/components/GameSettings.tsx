'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface GameConfig {
  minPlayers: number;
  maxPlayers: number;
  dayDuration: number;
  nightDuration: number;
  votingDuration: number;
  mode: string;
}

interface GameSettingsProps {
  config: GameConfig;
  isHost: boolean;
  onUpdate?: (config: Partial<GameConfig>) => void;
}

export default function GameSettings({ config, isHost }: GameSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left font-medieval text-mafia-gold text-lg"
      >
        <span>⚙️ Configuración</span>
        <span className="text-sm">{isOpen ? '▼' : '▶'}</span>
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-3 bg-mafia-dark/40 rounded-lg p-4"
        >
          <SettingRow
            label="Modo"
            value={config.mode === 'classic' ? '🏰 Clásico' : config.mode}
          />
          <SettingRow
            label="Jugadores"
            value={`${config.minPlayers} - ${config.maxPlayers}`}
          />
          <SettingRow
            label="Duración Día"
            value={`${config.dayDuration}s`}
          />
          <SettingRow
            label="Duración Noche"
            value={`${config.nightDuration}s`}
          />
          <SettingRow
            label="Duración Votación"
            value={`${config.votingDuration}s`}
          />
          {!isHost && (
            <p className="text-mafia-text/40 text-xs font-crimson italic text-center mt-2">
              Solo el host puede cambiar la configuración
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-mafia-text/70 font-crimson text-sm">{label}</span>
      <span className="text-mafia-gold font-medieval text-sm">{value}</span>
    </div>
  );
}
