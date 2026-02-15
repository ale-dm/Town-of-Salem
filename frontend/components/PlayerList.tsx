'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Player {
  id: string;
  name: string;
  position: number;
  isHost: boolean;
  isReady: boolean;
  isBot: boolean;
  alive: boolean;
}

interface PlayerListProps {
  players: Player[];
  yourPlayerId: string | null;
  maxPlayers?: number;
}

export default function PlayerList({ players, yourPlayerId, maxPlayers = 15 }: PlayerListProps) {
  const emptySlots = Math.max(0, 4 - players.length); // Show at least enough for minPlayers

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medieval text-mafia-gold text-lg">
          👥 Jugadores
        </h3>
        <span className="text-mafia-text/70 font-crimson text-sm">
          {players.length}/{maxPlayers}
        </span>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-medieval pr-1">
        <AnimatePresence>
          {players.map((player) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border-l-4 transition-colors duration-200',
                'bg-mafia-wood-dark hover:bg-mafia-wood',
                player.isReady ? 'border-green-500' : 'border-mafia-gold/40',
                player.id === yourPlayerId && 'ring-1 ring-mafia-gold/50'
              )}
            >
              {/* Position */}
              <span className="text-mafia-gold/50 font-mono text-sm w-5 text-center">
                {player.position}
              </span>

              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-mafia-wood flex items-center justify-center text-lg">
                {player.isBot ? '🤖' : '🧑'}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'font-crimson font-semibold truncate',
                    player.id === yourPlayerId ? 'text-mafia-gold' : 'text-mafia-text'
                  )}>
                    {player.name}
                  </span>
                  {player.isHost && (
                    <span className="text-xs bg-mafia-gold/20 text-mafia-gold px-1.5 py-0.5 rounded font-medieval">
                      👑 Host
                    </span>
                  )}
                  {player.id === yourPlayerId && (
                    <span className="text-xs text-mafia-gold/60">(tú)</span>
                  )}
                </div>
              </div>

              {/* Ready Status */}
              <div className={cn(
                'text-sm font-medieval px-2 py-1 rounded',
                player.isReady
                  ? 'bg-green-900/40 text-green-400'
                  : 'bg-mafia-dark/40 text-mafia-text/40'
              )}>
                {player.isReady ? '✅ Listo' : '⏳'}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty slots */}
        {Array.from({ length: emptySlots }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="flex items-center gap-3 p-3 rounded-lg border-l-4 border-mafia-wood-dark/30 bg-mafia-dark/30"
          >
            <span className="text-mafia-text/20 font-mono text-sm w-5 text-center">
              {players.length + i + 1}
            </span>
            <div className="w-8 h-8 rounded-full bg-mafia-dark/50 flex items-center justify-center text-mafia-text/20">
              ?
            </div>
            <span className="text-mafia-text/20 font-crimson italic">
              Esperando jugador...
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
