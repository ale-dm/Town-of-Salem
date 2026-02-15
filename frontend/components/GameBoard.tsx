'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatBox from '@/components/ChatBox';
import VotingPanel from '@/components/VotingPanel';
import { cn, getPhaseName, formatTimer, getFactionColor } from '@/lib/utils';

interface Player {
  id: string;
  name: string;
  position: number;
  isHost: boolean;
  isReady: boolean;
  isBot: boolean;
  alive: boolean;
  roleName?: string;
  faction?: string;
}

interface RoleInfo {
  roleName: string;
  roleNameEs: string;
  faction: string;
  icon: string;
  color: string;
  goalEs: string;
  goalEn: string;
  abilitiesEs: string[];
  abilitiesEn: string[];
}

interface GameState {
  code: string;
  status: 'WAITING' | 'STARTING' | 'PLAYING' | 'FINISHED';
  phase: 'DAY' | 'NIGHT' | 'VOTING' | 'TRIAL' | 'DEFENSE';
  day: number;
  config: any;
}

interface ChatMessage {
  id: string;
  author: { id: string; name: string; position: number };
  content: string;
  timestamp: Date;
  channel: 'PUBLIC' | 'MAFIA' | 'DEAD' | 'JAIL' | 'WHISPER';
  isSystem?: boolean;
}

interface GameResult {
  winner: string;
  winningPlayers: Array<{ id: string; name: string; roleName: string; faction: string }>;
  losingPlayers: Array<{ id: string; name: string; roleName: string; faction: string }>;
}

interface GameBoardProps {
  gameState: GameState;
  players: Player[];
  messages: ChatMessage[];
  yourPlayerId: string | null;
  yourRole: RoleInfo | null;
  phaseTimer: number | null;
  gameResult: GameResult | null;
  stagedAction?: { actionType: string; targetId: string; targetName: string } | null;
  onSendMessage: (content: string, channel?: string) => void;
  onNightAction: (targetId: string) => void;
  onVote: (nomineeId: string) => void;
  onVerdict: (verdict: 'GUILTY' | 'INNOCENT' | 'ABSTAIN') => void;
  onTestamentUpdate?: (text: string) => void;
  onDeathNoteUpdate?: (text: string) => void;
}

const PHASE_BG: Record<string, string> = {
  DAY: 'from-blue-900/20 via-mafia-dark to-mafia-dark',
  NIGHT: 'from-indigo-950/40 via-mafia-dark to-mafia-dark',
  VOTING: 'from-amber-900/20 via-mafia-dark to-mafia-dark',
  TRIAL: 'from-red-950/30 via-mafia-dark to-mafia-dark',
  DEFENSE: 'from-red-900/20 via-mafia-dark to-mafia-dark',
};

const PHASE_ICON: Record<string, string> = {
  DAY: '☀️',
  NIGHT: '🌙',
  VOTING: '🗳️',
  TRIAL: '⚖️',
  DEFENSE: '🛡️',
};

export default function GameBoard({
  gameState,
  players,
  messages,
  yourPlayerId,
  yourRole,
  phaseTimer,
  gameResult,
  stagedAction,
  onSendMessage,
  onNightAction,
  onVote,
  onVerdict,
  onTestamentUpdate,
  onDeathNoteUpdate,
}: GameBoardProps) {
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(true);
  const [showRoleCard, setShowRoleCard] = useState(false);
  const [showTestament, setShowTestament] = useState(false);
  const [testamentText, setTestamentText] = useState('');
  const [deathNoteText, setDeathNoteText] = useState('');
  const [testamentSaved, setTestamentSaved] = useState(false);

  const yourPlayer = players.find((p) => p.id === yourPlayerId);
  const alivePlayers = players.filter((p) => p.alive);
  const deadPlayers = players.filter((p) => !p.alive);
  const isNight = gameState.phase === 'NIGHT';
  const isVoting = gameState.phase === 'VOTING' || gameState.phase === 'TRIAL' || gameState.phase === 'DEFENSE';

  const isMafia = yourRole?.faction === 'MAFIA';
  const chatChannel = !yourPlayer?.alive ? 'DEAD' : (isNight && isMafia) ? 'MAFIA' : 'PUBLIC';

  // Game Over Screen
  if (gameState.status === 'FINISHED' && gameResult) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-mafia-dark via-mafia-wood-dark to-mafia-dark p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-wood max-w-2xl w-full text-center space-y-6 p-8"
        >
          <h1 className="font-pirata text-5xl text-mafia-gold">🎭 Fin de la Partida</h1>
          <p className="font-medieval text-2xl" style={{ color: getFactionColor(gameResult.winner) }}>
            ¡{gameResult.winner === 'TOWN' ? '🏘️ El Pueblo' : gameResult.winner === 'MAFIA' ? '🔫 La Mafia' : gameResult.winner === 'NEUTRAL' ? '🎭 Neutral' : '🤝 Empate'} gana!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <h3 className="font-medieval text-green-400 text-lg mb-2">🏆 Ganadores</h3>
              {(gameResult.winningPlayers || []).map(p => (
                <div key={p.id} className="flex items-center gap-2 text-sm text-mafia-text font-crimson py-1">
                  <span>{p.name}</span>
                  <span className="text-mafia-gold/60">- {p.roleName}</span>
                </div>
              ))}
            </div>
            <div>
              <h3 className="font-medieval text-red-400 text-lg mb-2">💀 Perdedores</h3>
              {(gameResult.losingPlayers || []).map(p => (
                <div key={p.id} className="flex items-center gap-2 text-sm text-mafia-text/60 font-crimson py-1">
                  <span>{p.name}</span>
                  <span className="text-mafia-gold/40">- {p.roleName}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => window.location.href = '/'}
            className="btn-medieval px-8 py-3 mt-4"
          >
            🏠 Volver al Inicio
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={cn(
      'min-h-screen flex flex-col bg-gradient-to-b',
      PHASE_BG[gameState.phase] || PHASE_BG.DAY
    )}>
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 py-2 bg-mafia-dark/80 border-b border-mafia-wood/30">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{PHASE_ICON[gameState.phase]}</span>
          <div>
            <p className="font-pirata text-mafia-gold text-lg leading-tight">
              {getPhaseName(gameState.phase)}
            </p>
            <p className="text-mafia-text/50 text-xs font-crimson">
              Día {gameState.day}
            </p>
          </div>
        </div>

        {/* Phase Timer */}
        {phaseTimer !== null && (
          <div className={cn(
            'font-mono text-2xl font-bold px-4 py-1 rounded-lg border',
            phaseTimer <= 10
              ? 'text-red-400 border-red-500/50 bg-red-900/20 animate-pulse'
              : 'text-mafia-gold border-mafia-gold/30 bg-mafia-dark/40'
          )}>
            {formatTimer(phaseTimer)}
          </div>
        )}

        <div className="flex items-center gap-3">
          <span className="text-mafia-text/50 text-xs font-crimson">
            {alivePlayers.length} vivos • {deadPlayers.length} muertos
          </span>
          {yourPlayer?.alive && (
            <button
              onClick={() => setShowTestament(!showTestament)}
              className={cn(
                'font-medieval text-sm px-3 py-1 rounded-lg border transition-colors',
                showTestament
                  ? 'text-mafia-gold border-mafia-gold/50 bg-mafia-wood/30'
                  : 'text-mafia-text/50 border-mafia-wood/30 hover:text-mafia-gold hover:bg-mafia-wood/20'
              )}
            >
              📜
            </button>
          )}
          <button
            onClick={() => setShowChat(!showChat)}
            className="text-mafia-gold font-medieval text-sm px-3 py-1 rounded-lg border border-mafia-gold/30 hover:bg-mafia-wood/30 transition-colors"
          >
            {showChat ? '💬 Chat' : '👥 Lista'}
          </button>
        </div>
      </header>

      {/* Your Role Banner */}
      {yourRole && (
        <button
          onClick={() => setShowRoleCard(!showRoleCard)}
          className="px-4 py-2 bg-mafia-dark/60 border-b border-mafia-wood/20 flex items-center justify-center gap-3 hover:bg-mafia-wood/20 transition-colors cursor-pointer"
        >
          <span className="text-xl">{yourRole.icon}</span>
          <span
            className="font-medieval text-lg font-bold"
            style={{ color: yourRole.color || getFactionColor(yourRole.faction) }}
          >
            {yourRole.roleNameEs}
          </span>
          <span className="text-mafia-text/40 text-xs font-crimson">
            ({yourRole.faction})
          </span>
          {!yourPlayer?.alive && (
            <span className="text-red-400 text-sm font-crimson">💀 Muerto</span>
          )}
          <span className="text-mafia-gold/40 text-xs">▼</span>
        </button>
      )}

      {/* Role Card Popup */}
      <AnimatePresence>
        {showRoleCard && yourRole && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-mafia-dark/90 border-b border-mafia-wood/30"
          >
            <div className="p-4 max-w-lg mx-auto space-y-3">
              <p className="text-mafia-text font-crimson text-sm">
                <span className="text-mafia-gold font-medieval">Objetivo: </span>
                {yourRole.goalEs}
              </p>
              <div>
                <span className="text-mafia-gold font-medieval text-sm">Habilidades:</span>
                <ul className="mt-1 space-y-1">
                  {(Array.isArray(yourRole.abilitiesEs) ? yourRole.abilitiesEs : [yourRole.abilitiesEs]).filter(Boolean).map((ability, i) => (
                    <li key={i} className="text-mafia-text/80 font-crimson text-xs flex gap-2">
                      <span className="text-mafia-gold/60">•</span>
                      {ability}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Area */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Player Circle / Grid */}
        <div className={cn(
          'flex-1 p-4 overflow-y-auto',
          showChat ? 'hidden lg:block' : 'block'
        )}>
          {/* Voting panel during voting */}
          {isVoting ? (
            <VotingPanel
              players={alivePlayers}
              yourPlayerId={yourPlayerId}
              phase={gameState.phase}
              selectedTarget={selectedTarget}
              onSelectTarget={setSelectedTarget}
              onConfirmVote={(targetId) => {
                onVote(targetId);
                setSelectedTarget(null);
              }}
              onVerdict={onVerdict}
            />
          ) : (
            /* Player grid */
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-w-3xl mx-auto">
              {players.map((player) => (
                <motion.button
                  key={player.id}
                  whileHover={player.alive ? { scale: 1.05 } : {}}
                  whileTap={player.alive ? { scale: 0.95 } : {}}
                  onClick={() => {
                    if (player.alive && isNight && player.id !== yourPlayerId) {
                      setSelectedTarget(selectedTarget === player.id ? null : player.id);
                    }
                  }}
                  disabled={!player.alive}
                  className={cn(
                    'flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all duration-200',
                    player.alive
                      ? 'bg-mafia-wood-dark border-mafia-wood hover:border-mafia-gold'
                      : 'bg-mafia-dark/60 border-mafia-dark/30 opacity-40',
                    selectedTarget === player.id && 'border-mafia-gold shadow-glow ring-2 ring-mafia-gold/30',
                    player.id === yourPlayerId && player.alive && 'ring-1 ring-mafia-gold/30'
                  )}
                >
                  <span className="text-2xl">
                    {!player.alive ? '💀' : player.isBot ? '🤖' : '🧑'}
                  </span>
                  <span className={cn(
                    'font-crimson text-xs truncate w-full text-center',
                    player.alive ? 'text-mafia-text' : 'text-mafia-text/30 line-through'
                  )}>
                    {player.name}
                  </span>
                  {/* Show role if dead */}
                  {!player.alive && player.roleName && (
                    <span className="text-mafia-gold/40 text-[10px] font-crimson">
                      {player.roleName}
                    </span>
                  )}
                  <span className="text-mafia-gold/40 text-[10px] font-mono">
                    #{player.position}
                  </span>
                </motion.button>
              ))}
            </div>
          )}

          {/* Night action hint */}
          {isNight && yourPlayer?.alive && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-center"
            >
              {stagedAction ? (
                <div className="space-y-2">
                  <p className="text-green-400 font-crimson text-sm animate-pulse">
                    🎯 Acción preparada contra {stagedAction.targetName}
                  </p>
                  <p className="text-mafia-gold/40 font-crimson text-xs">
                    Puedes cambiar tu objetivo seleccionando otro jugador
                  </p>
                </div>
              ) : (
                <p className="text-mafia-gold/60 font-crimson text-sm">
                  {selectedTarget
                    ? `Objetivo seleccionado: ${players.find(p => p.id === selectedTarget)?.name}`
                    : 'Selecciona un objetivo para tu acción nocturna'}
                </p>
              )}
              {selectedTarget && (
                <button
                  onClick={() => {
                    onNightAction(selectedTarget);
                    setSelectedTarget(null);
                  }}
                  className="btn-medieval mt-2 px-6 py-2 text-sm"
                >
                  {stagedAction ? '🔄 Cambiar Objetivo' : '✅ Confirmar Acción'}
                </button>
              )}
            </motion.div>
          )}
        </div>

        {/* Testament / Death Note Panel */}
        <AnimatePresence>
          {showTestament && yourPlayer?.alive && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 320 }}
              exit={{ opacity: 0, width: 0 }}
              className="border-l border-mafia-wood/30 flex flex-col bg-mafia-dark/90 overflow-hidden"
            >
              <div className="p-3 border-b border-mafia-wood/30 flex items-center justify-between">
                <h3 className="font-medieval text-mafia-gold text-sm">📜 Testamento</h3>
                <button
                  onClick={() => setShowTestament(false)}
                  className="text-mafia-text/40 hover:text-mafia-text text-sm"
                >✕</button>
              </div>
              <div className="flex-1 p-3 flex flex-col gap-3">
                <div className="flex-1 flex flex-col">
                  <label className="text-mafia-text/60 text-xs font-crimson mb-1">
                    Tu testamento (visible al morir):
                  </label>
                  <textarea
                    value={testamentText}
                    onChange={(e) => {
                      const val = e.target.value.slice(0, 500);
                      setTestamentText(val);
                      setTestamentSaved(false);
                    }}
                    maxLength={500}
                    placeholder="Escribe tu testamento aquí... Será visible para todos al morir."
                    className="flex-1 bg-mafia-dark/60 border border-mafia-wood/30 rounded-lg p-2 text-sm text-mafia-text font-crimson resize-none focus:outline-none focus:border-mafia-gold/50 placeholder:text-mafia-text/20 min-h-[120px]"
                  />
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-mafia-text/30 text-[10px]">
                      {testamentText.length}/500
                    </span>
                    <button
                      onClick={() => {
                        onTestamentUpdate?.(testamentText);
                        setTestamentSaved(true);
                        setTimeout(() => setTestamentSaved(false), 2000);
                      }}
                      className="px-3 py-1 rounded text-xs font-crimson border border-mafia-gold/30 text-mafia-gold hover:bg-mafia-gold/10 transition-colors"
                    >
                      {testamentSaved ? '✅ Guardado' : '💾 Guardar'}
                    </button>
                  </div>
                </div>

                {/* Death Note (only for Mafia/NK roles) */}
                {yourRole && ['MAFIA'].includes(yourRole.faction) && (
                  <div className="flex flex-col">
                    <label className="text-mafia-blood text-xs font-crimson mb-1">
                      🗡️ Nota de muerte (visible junto a tus víctimas):
                    </label>
                    <textarea
                      value={deathNoteText}
                      onChange={(e) => {
                        const val = e.target.value.slice(0, 200);
                        setDeathNoteText(val);
                      }}
                      maxLength={200}
                      placeholder="Deja una nota para tu víctima..."
                      className="bg-red-950/30 border border-red-900/30 rounded-lg p-2 text-sm text-red-200 font-crimson resize-none focus:outline-none focus:border-red-500/50 placeholder:text-red-900/40 min-h-[80px]"
                    />
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-mafia-text/30 text-[10px]">{deathNoteText.length}/200</span>
                      <button
                        onClick={() => onDeathNoteUpdate?.(deathNoteText)}
                        className="px-3 py-1 rounded text-xs font-crimson border border-red-900/30 text-red-400 hover:bg-red-900/10 transition-colors"
                      >
                        💾 Guardar Nota
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Panel */}
        <div className={cn(
          'lg:w-96 border-l border-mafia-wood/30 flex flex-col',
          showChat ? 'flex-1 lg:flex-none' : 'hidden lg:flex'
        )}>
          <ChatBox
            messages={messages.filter(m =>
              m.channel === chatChannel || m.channel === 'PUBLIC' || m.isSystem
            )}
            onSendMessage={onSendMessage}
            yourPlayerId={yourPlayerId}
            currentChannel={chatChannel}
            disabled={!yourPlayer?.alive && gameState.status !== 'FINISHED'}
            placeholder={
              !yourPlayer?.alive
                ? 'Estás muerto...'
                : isNight && isMafia
                  ? '🔪 Chat de Mafia (privado)...'
                  : isNight
                    ? 'Es de noche... espera al día.'
                    : 'Discute con el pueblo...'
            }
          />
        </div>
      </div>
    </div>
  );
}
