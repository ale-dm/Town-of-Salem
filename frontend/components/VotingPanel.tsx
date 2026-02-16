'use client';

import { motion } from 'framer-motion';
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

interface VotingPanelProps {
  players: Player[];
  yourPlayerId: string | null;
  phase: string;
  selectedTarget: string | null;
  onSelectTarget: (playerId: string | null) => void;
  onConfirmVote?: (targetId: string) => void;
  onVerdict?: (verdict: 'GUILTY' | 'INNOCENT' | 'ABSTAIN') => void;
}

export default function VotingPanel({
  players,
  yourPlayerId,
  phase,
  selectedTarget,
  onSelectTarget,
  onConfirmVote,
  onVerdict,
}: VotingPanelProps) {
  const isTrialPhase = phase === 'DEFENSE' || phase === 'JUDGEMENT';

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="text-center mb-4">
        <h2 className="font-pirata text-2xl text-mafia-gold">
          {isTrialPhase ? '⚖️ Juicio' : '🗳️ Votación'}
        </h2>
        <p className="text-mafia-text/60 font-crimson text-sm mt-1">
          {isTrialPhase
            ? '¿Culpable o Inocente?'
            : 'Vota para enviar a alguien a juicio'}
        </p>
      </div>

      {isTrialPhase ? (
        /* Trial: Guilty / Innocent / Abstain */
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onVerdict?.('GUILTY')}
            className="px-8 py-4 bg-red-900/60 border-2 border-red-500 text-red-400 rounded-medieval font-medieval text-lg hover:bg-red-900 transition-colors"
          >
            ⚔️ Culpable
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onVerdict?.('INNOCENT')}
            className="px-8 py-4 bg-green-900/60 border-2 border-green-500 text-green-400 rounded-medieval font-medieval text-lg hover:bg-green-900 transition-colors"
          >
            🕊️ Inocente
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onVerdict?.('ABSTAIN')}
            className="px-8 py-4 bg-mafia-dark/60 border-2 border-mafia-wood text-mafia-text/60 rounded-medieval font-medieval text-lg hover:bg-mafia-wood-dark transition-colors"
          >
            🤷 Abstener
          </motion.button>
        </div>
      ) : (
        /* Nomination: Select a player */
        <div className="space-y-2">
          {players
            .filter((p) => p.id !== yourPlayerId)
            .map((player) => (
              <motion.button
                key={player.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() =>
                  onSelectTarget(selectedTarget === player.id ? null : player.id)
                }
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200 text-left',
                  selectedTarget === player.id
                    ? 'bg-mafia-blood/30 border-mafia-gold shadow-glow'
                    : 'bg-mafia-wood-dark border-mafia-wood/50 hover:border-mafia-gold/50'
                )}
              >
                <span className="text-mafia-gold/50 font-mono text-sm w-5">
                  {player.position}
                </span>
                <span className="text-xl">{player.isBot ? '🤖' : '🧑'}</span>
                <span className="flex-1 font-crimson text-mafia-text font-semibold">
                  {player.name}
                </span>
                {selectedTarget === player.id && (
                  <span className="text-mafia-gold font-medieval text-sm">
                    ✋ Votar
                  </span>
                )}
              </motion.button>
            ))}

          {selectedTarget && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mt-4"
            >
              <button
                onClick={() => onConfirmVote?.(selectedTarget)}
                className="btn-medieval px-8 py-3"
              >
                🗳️ Confirmar Voto
              </button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
