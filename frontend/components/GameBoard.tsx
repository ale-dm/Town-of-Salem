'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, getPhaseName, formatTimer, getFactionColor, getFactionName } from '@/lib/utils';
import DeathRevealModal from './DeathRevealModal';
import TestamentModal from './TestamentModal';

// ============================================
// TYPES
// ============================================

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
  slug: string;
  icon: string;
  iconImage?: string;
  iconCircled?: string;
  color: string;
  goalEs: string;
  goalEn: string;
  abilitiesEs: string[];
  abilitiesEn: string[];
  attributesListEs?: string[];
  attackValue?: number;
  defenseValue?: number;
  nightActionLabel?: string;
  nightActionLabel2?: string;
  executionerTarget?: {
    id: string;
    name: string;
    position: number;
  } | null;
}

interface GameState {
  code: string;
  status: 'WAITING' | 'STARTING' | 'PLAYING' | 'FINISHED';
  phase: 'DAY' | 'NIGHT' | 'VOTING' | 'DEFENSE' | 'JUDGEMENT' | 'LAST_WORDS' | 'DISCUSSION';
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

interface JesterWinData {
  jesterId: string;
  jesterName: string;
  guiltyVoters: Array<{ id: string; name: string; position: number }>;
  message: string;
}

interface DeathRevealInfo {
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

interface GameBoardProps {
  gameState: GameState;
  players: Player[];
  messages: ChatMessage[];
  yourPlayerId: string | null;
  yourRole: RoleInfo | null;
  phaseTimer: number | null;
  gameResult: GameResult | null;
  stagedAction?: { actionType: string; targetId: string; targetName: string } | null;
  jesterWinData?: JesterWinData | null;
  deathReveals?: DeathRevealInfo[];
  isRevealingDeaths?: boolean;
  voteCounts?: Record<string, number>;
  onSendMessage: (content: string, channel?: string) => void;
  onNightAction: (targetId: string, target2Id?: string) => void;
  onVote: (nomineeId: string) => void;
  onVerdict: (verdict: 'GUILTY' | 'INNOCENT' | 'ABSTAIN') => void;
  onTestamentUpdate?: (text: string) => void;
  onDeathNoteUpdate?: (text: string) => void;
  onJesterHaunt?: (targetId: string) => void;
  onDeathRevealsComplete?: () => void;
}

// ============================================
// CONSTANTS
// ============================================

const ATTACK_LABELS: Record<number, string> = { 0: 'None', 1: 'Basic', 2: 'Powerful', 3: 'Unstoppable' };
const DEFENSE_LABELS: Record<number, string> = { 0: 'None', 1: 'Basic', 2: 'Powerful', 3: 'Invincible' };

const PHASE_ICON: Record<string, string> = {
  DAY: '☀️',
  NIGHT: '🌙',
  VOTING: '🗳️',
  DEFENSE: '🛡️',
  JUDGEMENT: '⚖️',
  LAST_WORDS: '💀',
  DISCUSSION: '💬',
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function GameBoard({
  gameState,
  players,
  messages,
  yourPlayerId,
  yourRole,
  phaseTimer,
  gameResult,
  stagedAction,
  jesterWinData,
  deathReveals = [],
  isRevealingDeaths = false,
  voteCounts = {},
  onSendMessage,
  onNightAction,
  onVote,
  onVerdict,
  onTestamentUpdate,
  onDeathNoteUpdate,
  onJesterHaunt,
  onDeathRevealsComplete,
}: GameBoardProps) {
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [selectedTarget2, setSelectedTarget2] = useState<string | null>(null);
  const [leftTab, setLeftTab] = useState<'role' | 'rolelist'>('role');
  const [chatMessage, setChatMessage] = useState('');
  const [showTestament, setShowTestament] = useState(false);
  const [showDeathNote, setShowDeathNote] = useState(false);
  const [testamentText, setTestamentText] = useState('');
  const [deathNoteText, setDeathNoteText] = useState('');
  const [testamentSaved, setTestamentSaved] = useState(false);
  const [secondaryActionActive, setSecondaryActionActive] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const yourPlayer = players.find((p) => p.id === yourPlayerId);
  const alivePlayers = players.filter((p) => p.alive);
  const deadPlayers = players.filter((p) => !p.alive);
  const isNight = gameState.phase === 'NIGHT';
  const isVoting = gameState.phase === 'VOTING';
  const isTrial = gameState.phase === 'DEFENSE' || gameState.phase === 'JUDGEMENT' || gameState.phase === 'LAST_WORDS';
  const isMafia = yourRole?.faction === 'MAFIA';
  const chatChannel = !yourPlayer?.alive ? 'DEAD' : (isNight && isMafia) ? 'MAFIA' : 'PUBLIC';
  const isTransporter = yourRole?.slug === 'transporter';

  // Phase music system
  useEffect(() => {
    const getPhaseMusic = () => {
      switch (gameState.phase) {
        case 'NIGHT':
          return '/sounds/Night_Theme.mp3.mpeg';
        case 'VOTING':
          return '/sounds/Voting_Theme.mp3.mpeg';
        case 'DEFENSE':
        case 'JUDGEMENT':
        case 'LAST_WORDS':
          return '/sounds/Defense_Theme.mp3.mpeg';
        case 'DISCUSSION':
          return '/sounds/Discussion_Theme.mp3.mpeg';
        case 'DAY':
        default:
          return '/sounds/Day_Theme.mp3.mpeg';
      }
    };

    const musicSrc = getPhaseMusic();
    
    if (audioRef.current) {
      // Check if src ends with the music file (since browser converts relative to absolute URLs)
      if (!audioRef.current.src.endsWith(musicSrc)) {
        audioRef.current.pause();
        audioRef.current.src = musicSrc;
        audioRef.current.loop = true;
        audioRef.current.volume = 0.3;
        audioRef.current.play().catch(err => console.log('Audio play prevented:', err));
      }
    } else {
      audioRef.current = new Audio(musicSrc);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch(err => console.log('Audio play prevented:', err));
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [gameState.phase]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Reset target selections when phase changes
  useEffect(() => {
    setSelectedTarget(null);
    setSelectedTarget2(null);
  }, [gameState.phase]);

  // Send chat
  const handleSendChat = () => {
    const trimmed = chatMessage.trim();
    if (!trimmed) return;
    onSendMessage(trimmed, chatChannel);
    setChatMessage('');
    chatInputRef.current?.focus();
  };

  // Player click handler
  const handlePlayerClick = (player: Player) => {
    if (!player.alive) return;

    if (isNight && yourPlayer?.alive) {
      const canSelfTarget = yourRole?.slug === 'doctor' || yourRole?.slug === 'survivor' || yourRole?.slug === 'veteran';
      
      // Transporter needs 2 targets
      if (isTransporter) {
        if (player.id === selectedTarget) {
          // Deselect first target
          setSelectedTarget(null);
        } else if (player.id === selectedTarget2) {
          // Deselect second target
          setSelectedTarget2(null);
        } else if (!selectedTarget) {
          // Select first target
          setSelectedTarget(player.id);
        } else if (!selectedTarget2) {
          // Select second target and send action
          onNightAction(selectedTarget, player.id);
          // Reset selections after sending
          setTimeout(() => {
            setSelectedTarget(null);
            setSelectedTarget2(null);
          }, 100);
        }
      } else {
        // Normal single-target roles
        if (player.id !== yourPlayerId || canSelfTarget) {
          const newTarget = selectedTarget === player.id ? null : player.id;
          setSelectedTarget(newTarget);
          if (newTarget) {
            onNightAction(newTarget);
          }
        }
      }
    } else if (isVoting && yourPlayer?.alive && player.id !== yourPlayerId) {
      onVote(player.id);
    }
  };

  // ============================================
  // GAME OVER SCREEN
  // ============================================
  if (gameState.status === 'FINISHED' && gameResult) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-4"
        style={{ background: 'linear-gradient(180deg, #0a0603 0%, #1a1008 50%, #0a0603 100%)' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full text-center space-y-6 p-8 rounded-lg border-2"
          style={{ background: '#2a1a08', borderColor: '#8b6914' }}
        >
          <h1 className="font-pirata text-5xl text-[#ffd700] drop-shadow-lg">🎭 Fin de la Partida</h1>
          <p className="font-medieval text-2xl" style={{ color: getFactionColor(gameResult.winner) }}>
            ¡{gameResult.winner === 'TOWN' ? '🏘️ El Pueblo' : gameResult.winner === 'MAFIA' ? '🔫 La Mafia' : gameResult.winner === 'NEUTRAL' ? '🎭 Neutral' : '🤝 Empate'} gana!
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <h3 className="font-medieval text-green-400 text-lg mb-2">🏆 Ganadores</h3>
              {(gameResult.winningPlayers || []).map(p => (
                <div key={p.id} className="flex items-center gap-2 text-sm font-crimson py-1" style={{ color: '#e8d4b8' }}>
                  <span>{p.name}</span>
                  <span style={{ color: '#8b6914' }}>- {p.roleName}</span>
                </div>
              ))}
            </div>
            <div>
              <h3 className="font-medieval text-red-400 text-lg mb-2">💀 Perdedores</h3>
              {(gameResult.losingPlayers || []).map(p => (
                <div key={p.id} className="flex items-center gap-2 text-sm font-crimson py-1 opacity-60" style={{ color: '#e8d4b8' }}>
                  <span>{p.name}</span>
                  <span style={{ color: '#5a3a10' }}>- {p.roleName}</span>
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

  // ============================================
  // JESTER WIN OVERLAY (Haunt Selection)
  // ============================================
  const showJesterHaunt = jesterWinData && jesterWinData.jesterId === yourPlayerId && !yourPlayer?.alive;

  // ============================================
  // MAIN GAME LAYOUT — Town of Salem Faithful Copy
  // ============================================
  const isDay = !isNight;
  const votesNeeded = Math.ceil(alivePlayers.length / 2);

  return (
    <div
      className="h-screen flex flex-col overflow-hidden select-none"
      style={{ background: isNight ? '#080a14' : '#1a1408' }}
    >
      {/* Jester Haunt Selection Modal */}
      <AnimatePresence>
        {showJesterHaunt && jesterWinData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="max-w-lg w-full mx-4 p-8 rounded-lg border-4"
              style={{ 
                background: 'linear-gradient(135deg, #1a0a2e 0%, #3d1f5e 100%)',
                borderColor: '#8b4789',
                boxShadow: '0 0 40px rgba(139, 71, 137, 0.6)'
              }}
            >
              <h2 className="font-pirata text-4xl text-center mb-4" style={{ color: '#d4a5ff' }}>
                🎭 ¡Victoria del Jester!
              </h2>
              <p className="font-medieval text-lg text-center mb-6" style={{ color: '#e8d4b8' }}>
                {jesterWinData.message}
              </p>
              
              {jesterWinData.guiltyVoters.length > 0 ? (
                <>
                  <p className="font-crimson text-center mb-4" style={{ color: '#ff6b6b' }}>
                    👻 Elige quién pagará por su crimen:
                  </p>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {jesterWinData.guiltyVoters.map((voter) => (
                      <button
                        key={voter.id}
                        onClick={() => onJesterHaunt?.(voter.id)}
                        className="w-full p-3 rounded border-2 transition-all hover:scale-105"
                        style={{
                          background: '#2a1a3d',
                          borderColor: '#6b3d7a',
                          color: '#e8d4b8'
                        }}
                      >
                        <span className="font-medieval text-lg">
                          [{voter.position}] {voter.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <p className="font-crimson text-center" style={{ color: '#999' }}>
                  No hay acusadores vivos para hauntar.
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============== MAIN AREA (3 columns) ============== */}
      <div className="flex-1 flex min-h-0">

        {/* ========== LEFT PANEL — Role Card (≈21% width) ========== */}
        <aside
          className="flex-shrink-0 flex flex-col"
          style={{
            width: '21%',
            minWidth: 260,
            maxWidth: 320,
            background: 'linear-gradient(180deg, #2a1808 0%, #1e1004 100%)',
            borderRight: '4px solid #6b4a1a',
            boxShadow: 'inset -2px 0 8px rgba(0,0,0,0.5)',
          }}
        >
          {/* Player name header */}
          <div
            className="flex items-center gap-2 px-4 py-3"
            style={{
              borderBottom: '3px solid #6b4a1a',
              background: 'linear-gradient(180deg, #3a2410 0%, #2a1808 100%)',
            }}
          >
            <span style={{ color: '#8b6914', fontSize: 22 }}>☰</span>
            <h2
              className="font-medieval truncate"
              style={{ color: '#e8d4b8', fontSize: 20, fontWeight: 'bold', letterSpacing: 1 }}
            >
              {yourPlayer?.name || 'Jugador'}
            </h2>
          </div>

          {/* Tabs: RoleName | ROLE LIST */}
          <div className="flex" style={{ borderBottom: '3px solid #6b4a1a' }}>
            <button
              onClick={() => setLeftTab('role')}
              className="flex-1 py-3 font-medieval uppercase tracking-widest transition-colors"
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: leftTab === 'role' ? '#c83030' : '#8a7050',
                background: leftTab === 'role' ? '#1e1004' : '#261808',
                borderBottom: leftTab === 'role' ? '3px solid #c83030' : '3px solid transparent',
              }}
            >
              {yourRole?.roleNameEs || yourRole?.roleName || 'Rol'}
            </button>
            <button
              onClick={() => setLeftTab('rolelist')}
              className="flex-1 py-3 font-medieval uppercase tracking-widest transition-colors"
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: leftTab === 'rolelist' ? '#e8d4b8' : '#8a7050',
                background: leftTab === 'rolelist' ? '#1e1004' : '#261808',
                borderBottom: leftTab === 'rolelist' ? '3px solid #e8d4b8' : '3px solid transparent',
              }}
            >
              Role List
            </button>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ scrollbarWidth: 'thin' }}>
            {leftTab === 'role' && yourRole ? (
              <>
                {/* Role icon — webp image like original */}
                {yourRole.iconImage && (
                  <div className="flex justify-center">
                    <div
                      className="relative flex items-center justify-center"
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, #3a2810 0%, #1a1004 100%)',
                        border: '3px solid #6b4a1a',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                      }}
                    >
                      <img
                        src={yourRole.iconImage}
                        alt={yourRole.roleName}
                        style={{ width: 60, height: 60, objectFit: 'contain' }}
                      />
                    </div>
                  </div>
                )}

                {/* Role name centered */}
                <h3
                  className="font-pirata text-center uppercase tracking-wider"
                  style={{
                    color: yourRole.color || '#ffd700',
                    fontSize: 22,
                    textShadow: '1px 2px 4px rgba(0,0,0,0.6)',
                  }}
                >
                  {yourRole.roleNameEs || yourRole.roleName}
                </h3>

                {/* Attack / Defense row — bordered box like original */}
                <div
                  className="flex items-center gap-8 px-3 py-2"
                  style={{
                    border: '2px solid #5a4020',
                    borderRadius: 4,
                    background: '#1a1004',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 22, filter: 'hue-rotate(40deg) saturate(1.5)' }}>🗡️</span>
                    <span className="font-medieval" style={{ color: '#4cc84c', fontSize: 17, fontWeight: 'bold' }}>
                      {ATTACK_LABELS[yourRole.attackValue ?? 0]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 22 }}>🛡️</span>
                    <span className="font-medieval" style={{ color: '#4cc84c', fontSize: 17, fontWeight: 'bold' }}>
                      {DEFENSE_LABELS[yourRole.defenseValue ?? 0]}
                    </span>
                  </div>
                </div>

                {/* Alignment — colored by faction */}
                <div>
                  <h4 className="font-medieval" style={{ color: '#c8a848', fontSize: 16, fontWeight: 'bold' }}>
                    Alignment
                  </h4>
                  <p className="font-crimson mt-1" style={{ fontSize: 15 }}>
                    <span style={{ color: getFactionColor(yourRole.faction) }}>
                      {getFactionName(yourRole.faction)}
                    </span>
                    {' '}
                    <span style={{ color: getFactionColor(yourRole.faction) }}>
                      ({yourRole.roleName})
                    </span>
                  </p>
                </div>

                {/* Goal */}
                <div>
                  <h4 className="font-medieval" style={{ color: '#44bb44', fontSize: 16, fontWeight: 'bold' }}>
                    Goal
                  </h4>
                  <p className="font-crimson mt-1" style={{ color: '#e8d4b8', fontSize: 14, lineHeight: 1.4 }}>
                    {yourRole.goalEs}
                  </p>
                </div>

                {/* Abilities */}
                <div>
                  <h4 className="font-medieval" style={{ color: '#44bb44', fontSize: 16, fontWeight: 'bold' }}>
                    Abilities
                  </h4>
                  <ul className="mt-1 space-y-1">
                    {(Array.isArray(yourRole.abilitiesEs) ? yourRole.abilitiesEs : [yourRole.abilitiesEs])
                      .filter(Boolean)
                      .map((a, i) => (
                        <li key={i} className="font-crimson" style={{ color: '#e8d4b8', fontSize: 14, lineHeight: 1.4 }}>
                          -{a}
                        </li>
                      ))}
                  </ul>
                </div>

                {/* Attributes */}
                {yourRole.attributesListEs && yourRole.attributesListEs.length > 0 && (
                  <div>
                    <h4 className="font-medieval" style={{ color: '#44bb44', fontSize: 16, fontWeight: 'bold' }}>
                      Attributes
                    </h4>
                    <ul className="mt-1 space-y-1">
                      {yourRole.attributesListEs.map((attr, i) => (
                        <li key={i} className="font-crimson" style={{ color: '#e8d4b8', fontSize: 14, lineHeight: 1.4 }}>
                          -{attr}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : leftTab === 'rolelist' ? (
              <div className="space-y-1.5">
                {players.map((p) => (
                  <div
                    key={p.id}
                    className={cn(
                      'flex items-center gap-3 px-2 py-1.5 rounded font-crimson',
                      !p.alive && 'opacity-30 line-through'
                    )}
                  >
                    <span className="font-medieval flex-shrink-0" style={{ color: '#6b4a1a', fontSize: 14, width: 20, textAlign: 'right' }}>
                      {p.position}
                    </span>
                    <span
                      className="flex-1 truncate"
                      style={{ color: p.id === yourPlayerId ? '#ffd700' : '#c8b888', fontSize: 14 }}
                    >
                      {p.name}
                    </span>
                    {isVoting && voteCounts[p.id] > 0 && (
                      <span 
                        className="px-2 py-0.5 rounded font-medieval"
                        style={{ 
                          background: 'rgba(255, 100, 100, 0.2)', 
                          color: '#ff6464', 
                          fontSize: 12,
                          border: '1px solid rgba(255, 100, 100, 0.4)'
                        }}
                      >
                        🗳️ {voteCounts[p.id]}
                      </span>
                    )}
                    {(p.id === yourPlayerId || !p.alive) && p.roleName && (
                      <span style={{ color: '#8a6a30', fontSize: 12 }}>{p.roleName}</span>
                    )}
                    {isMafia && p.alive && p.faction === 'MAFIA' && p.id !== yourPlayerId && (
                      <span style={{ color: '#c03030', fontSize: 12 }}>Mafia</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-crimson italic text-center py-8" style={{ color: '#5a3a10', fontSize: 14 }}>
                Rol no asignado
              </p>
            )}
          </div>

          {/* Staged action indicator */}
          {isNight && stagedAction && yourPlayer?.alive && (
            <div className="px-4 py-3" style={{ borderTop: '2px solid #3a5a20', background: '#0e1a06' }}>
              <p className="text-green-400 font-crimson animate-pulse" style={{ fontSize: 14 }}>
                🎯 → {stagedAction.targetName}
              </p>
            </div>
          )}
        </aside>

        {/* ========== CENTER COLUMN (plaza + chat below) — chat spans full width at bottom ========== */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0">

          {/* CENTER — Town Plaza with floating timer */}
          <main className="flex-1 flex flex-col min-h-0 relative overflow-hidden"
            style={{
              background: isNight
                ? 'radial-gradient(ellipse at 50% 45%, #141e30 0%, #0a0e1a 50%, #060810 100%)'
                : 'radial-gradient(ellipse at 50% 45%, #3a3018 0%, #241c0c 50%, #1a1408 100%)',
            }}
          >
            {/* Floating timer — top center like original: "DAY 2 ⚒️ 26" */}
            <div
              className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-1.5 rounded-lg"
              style={{
                background: 'rgba(30,18,6,0.9)',
                border: '3px solid #6b4a1a',
                boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
              }}
            >
              <span
                className="font-pirata"
                style={{ fontSize: 26, color: '#e8d4b8' }}
              >
                {isNight ? 'NIGHT' : 'DAY'} {gameState.day}
              </span>
              <span style={{ fontSize: 22 }}>{isNight ? '🌙' : '⚒️'}</span>
              {phaseTimer !== null && (
                <span
                  className={cn(
                    'font-pirata',
                    phaseTimer <= 10 && 'animate-pulse'
                  )}
                  style={{
                    fontSize: 28,
                    color: phaseTimer <= 10 ? '#ff4040' : '#e8d4b8',
                    fontWeight: 'bold',
                  }}
                >
                  {phaseTimer}
                </span>
              )}
            </div>

            {/* Phase overlay for LAST_WORDS */}
            <AnimatePresence>
              {gameState.phase === 'LAST_WORDS' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 pointer-events-none"
                >
                  <p className="font-pirata text-red-400 drop-shadow-lg" style={{ fontSize: 40 }}>💀 Últimas Palabras</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Verdict buttons for trial */}
            {gameState.phase === 'JUDGEMENT' && yourPlayer?.alive && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => onVerdict('GUILTY')}
                  className="px-8 py-4 rounded-lg font-medieval shadow-lg transition-colors"
                  style={{ background: '#5a0a0a', border: '3px solid #c03030', color: '#ff6060', fontSize: 18 }}
                >
                  ⚔️ Culpable
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => onVerdict('INNOCENT')}
                  className="px-8 py-4 rounded-lg font-medieval shadow-lg transition-colors"
                  style={{ background: '#0a3a0a', border: '3px solid #30a030', color: '#60ff60', fontSize: 18 }}
                >
                  🕊️ Inocente
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => onVerdict('ABSTAIN')}
                  className="px-8 py-4 rounded-lg font-medieval shadow-lg transition-colors"
                  style={{ background: '#2a1a08', border: '3px solid #8b6914', color: '#a08050', fontSize: 18 }}
                >
                  🤷 Abstener
                </motion.button>
              </div>
            )}

            {/* Player Circle — large, like original */}
            <div className="flex-1 flex items-center justify-center">
              <div
                className="relative"
                style={{
                  width: 'min(680px, 62vw, 75vh)',
                  height: 'min(680px, 62vw, 75vh)',
                }}
              >
                {/* Center green plaza circle */}
                <div
                  className="absolute rounded-full shadow-inner flex items-center justify-center"
                  style={{
                    inset: '22%',
                    background: isNight
                      ? 'radial-gradient(circle, #1a2424 0%, #0e1616 60%, #0a1010 100%)'
                      : 'radial-gradient(circle, #5a7a3a 0%, #3a5a2a 40%, #2a4820 80%)',
                    border: '4px solid #5a3a10',
                    boxShadow: isNight
                      ? 'inset 0 0 40px rgba(0,0,0,0.6), 0 0 30px rgba(0,0,0,0.4)'
                      : 'inset 0 0 40px rgba(0,0,0,0.3), 0 0 30px rgba(0,0,0,0.3)',
                  }}
                >
                  {/* Stone center with gallows */}
                  <div className="flex flex-col items-center">
                    <div
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: isNight
                          ? 'radial-gradient(circle, #2a2a2a 0%, #1a1a1a 100%)'
                          : 'radial-gradient(circle, #8a7a60 0%, #6a5a40 100%)',
                        border: '2px solid #4a3a20',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {/* Gallows post */}
                      <div style={{
                        width: 8,
                        height: 36,
                        background: '#8b6914',
                        borderRadius: 2,
                        position: 'relative',
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: -8,
                          width: 24,
                          height: 6,
                          background: '#8b6914',
                          borderRadius: 2,
                        }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Players arranged in circle */}
                {players.map((player, index) => {
                  const total = players.length;
                  const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
                  const radiusX = 0.43;
                  const radiusY = 0.41;
                  const cx = 50 + radiusX * 100 * Math.cos(angle);
                  const cy = 50 + radiusY * 100 * Math.sin(angle);

                  const isSelected = selectedTarget === player.id;
                  const isYou = player.id === yourPlayerId;
                  const canClick = player.alive && (
                    (isNight && yourPlayer?.alive) ||
                    (isVoting && yourPlayer?.alive && !isYou)
                  );

                  return (
                    <motion.button
                      key={player.id}
                      onClick={() => handlePlayerClick(player)}
                      disabled={!canClick}
                      whileHover={canClick ? { scale: 1.12 } : {}}
                      whileTap={canClick ? { scale: 0.9 } : {}}
                      className="absolute flex flex-col items-center gap-0.5"
                      style={{
                        left: `${cx}%`,
                        top: `${cy}%`,
                        transform: 'translate(-50%, -50%)',
                        cursor: canClick ? 'pointer' : 'default',
                        zIndex: isSelected ? 10 : 1,
                      }}
                    >
                      {/* Character avatar — larger */}
                      <div
                        className="rounded-full flex items-center justify-center transition-all duration-200"
                        style={{
                          width: 56,
                          height: 56,
                          background: !player.alive
                            ? '#1a1a1a'
                            : isSelected
                              ? '#4a3510'
                              : isNight ? '#2a2838' : '#3a2810',
                          border: !player.alive
                            ? '3px solid #333'
                            : isSelected
                              ? '3px solid #ffd700'
                              : isYou
                                ? '3px solid #c8a020'
                                : '3px solid #5a3a10',
                          boxShadow: isSelected
                            ? '0 0 20px rgba(255,215,0,0.6), 0 0 40px rgba(255,215,0,0.2)'
                            : '0 3px 8px rgba(0,0,0,0.5)',
                          opacity: player.alive ? 1 : 0.25,
                          fontSize: 28,
                        }}
                      >
                        {!player.alive ? '💀' : player.isBot ? '🤖' : '🧑'}
                      </div>

                      {/* Name label — larger text */}
                      <span
                        className="font-medieval text-center leading-tight"
                        style={{
                          fontSize: 11,
                          fontWeight: 'bold',
                          color: !player.alive
                            ? '#444'
                            : isYou
                              ? '#ffd700'
                              : '#e8d4b8',
                          textShadow: '0 2px 4px rgba(0,0,0,0.95), 0 0px 8px rgba(0,0,0,0.7)',
                          textDecoration: !player.alive ? 'line-through' : 'none',
                          maxWidth: 80,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          letterSpacing: 0.5,
                        }}
                      >
                        {player.name.toUpperCase()}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Night action / voting hint */}
            {isNight && yourPlayer?.alive && (
              <div className="flex-shrink-0 flex items-center justify-between pb-3 px-4">
                <div>
                  {stagedAction ? (
                    <p className="text-green-400/80 font-crimson" style={{ fontSize: 14 }}>
                      ✓ Acción preparada contra <strong>{stagedAction.targetName}</strong>
                    </p>
                  ) : (
                    <p className="font-crimson" style={{ color: '#7a5a30', fontSize: 14 }}>
                      Selecciona un objetivo para tu acción nocturna
                    </p>
                  )}
                </div>

                {/* Secondary action toggle (Cautious, Self-Heal, Alert, Vest, Ignite) */}
                {yourRole?.nightActionLabel2 && yourRole?.iconCircled && (
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setSecondaryActionActive(!secondaryActionActive)}
                    className="flex flex-col items-center gap-1"
                    style={{ cursor: 'pointer' }}
                  >
                    <div
                      className="rounded-full flex items-center justify-center transition-all"
                      style={{
                        width: 64,
                        height: 64,
                        border: secondaryActionActive ? '3px solid #ffd700' : '3px solid #5a3a10',
                        background: secondaryActionActive
                          ? 'radial-gradient(circle, #4a3a10 0%, #2a1808 100%)'
                          : 'radial-gradient(circle, #2a1808 0%, #1a1004 100%)',
                        boxShadow: secondaryActionActive
                          ? '0 0 20px rgba(255,215,0,0.4), 0 0 40px rgba(255,215,0,0.1)'
                          : '0 2px 8px rgba(0,0,0,0.5)',
                      }}
                    >
                      <img
                        src={yourRole.iconCircled}
                        alt={yourRole.nightActionLabel2}
                        style={{
                          width: 48,
                          height: 48,
                          filter: secondaryActionActive ? 'brightness(1.2)' : 'brightness(0.8)',
                        }}
                      />
                    </div>
                    <span
                      className="font-medieval uppercase"
                      style={{
                        fontSize: 12,
                        fontWeight: 'bold',
                        color: secondaryActionActive ? '#ffd700' : '#8a6a30',
                        letterSpacing: 1,
                      }}
                    >
                      {yourRole.nightActionLabel2}
                    </span>
                  </motion.button>
                )}
              </div>
            )}
            {/* Voting announcement — large banner like original */}
            {isVoting && (
              <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 text-center" style={{ maxWidth: '80%' }}>
                <p
                  className="font-pirata drop-shadow-lg"
                  style={{
                    fontSize: 24,
                    color: '#ffd700',
                    textShadow: '2px 2px 6px rgba(0,0,0,0.9)',
                    lineHeight: 1.3,
                  }}
                >
                  {votesNeeded} votes are needed to send someone to trial.
                </p>
              </div>
            )}
          </main>

          {/* ============== BOTTOM CHAT — spans center width ============== */}
          <footer
            className="flex-shrink-0 flex flex-col"
            style={{
              borderTop: '4px solid #6b4a1a',
              background: 'linear-gradient(180deg, #1e1206 0%, #140c04 100%)',
            }}
          >
            {/* Chat messages */}
            <div
              className="overflow-y-auto px-4 py-2 space-y-0.5"
              style={{ height: 110, background: '#0c0804', scrollbarWidth: 'thin' }}
            >
              {messages
                .filter(m => m.channel === chatChannel || m.channel === 'PUBLIC' || m.isSystem)
                .slice(-60)
                .map((msg) => (
                  <div key={msg.id} className={cn('font-crimson flex items-start gap-1', msg.isSystem && 'italic')} style={{ fontSize: 15, lineHeight: 1.4 }}>
                    {!msg.isSystem && msg.author.position != null && (
                      <span
                        className="flex-shrink-0 inline-flex items-center justify-center rounded-full font-medieval"
                        style={{
                          width: 20,
                          height: 20,
                          fontSize: 11,
                          fontWeight: 'bold',
                          background: '#c8a020',
                          color: '#1a1004',
                          border: '1px solid #8b6914',
                          marginTop: 2,
                        }}
                      >
                        {msg.author.position}
                      </span>
                    )}
                    {!msg.isSystem && (
                      <span className="font-medieval flex-shrink-0" style={{ color: '#e8c848', fontSize: 14, fontWeight: 'bold' }}>
                        {msg.author.name}:
                      </span>
                    )}
                    <span style={{ color: msg.isSystem ? '#8b6914' : '#e8d4b8' }}>
                      {msg.content}
                    </span>
                  </div>
                ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input row — tall, with big icons like original */}
            <div
              className="flex items-center gap-3 px-3"
              style={{
                borderTop: '3px solid #6b4a1a',
                background: 'linear-gradient(180deg, #3a2810 0%, #2a1808 100%)',
                height: 56,
              }}
            >
              {/* Chat bubble icon */}
              <span
                className="flex-shrink-0 rounded-full flex items-center justify-center"
                style={{
                  width: 40,
                  height: 40,
                  background: '#4a3418',
                  border: '2px solid #6b4a1a',
                  fontSize: 22,
                }}
              >
                💬
              </span>

              {/* Input */}
              <input
                ref={chatInputRef}
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendChat();
                  }
                }}
                placeholder={
                  !yourPlayer?.alive
                    ? 'ESTÁS MUERTO...'
                    : isNight && !isMafia
                      ? 'ES DE NOCHE...'
                      : isNight && isMafia
                        ? '🔪 CHAT DE MAFIA...'
                        : 'ENTER YOUR CHAT MESSAGE HERE...'
                }
                disabled={!yourPlayer?.alive && gameState.status !== 'FINISHED'}
                maxLength={200}
                className="flex-1 rounded px-4 py-2 font-pirata tracking-wider focus:outline-none"
                style={{
                  background: '#140c04',
                  border: '2px solid #4a3418',
                  color: '#c83030',
                  fontSize: 18,
                  height: 40,
                }}
              />

              {/* Channel indicator */}
              {isNight && isMafia && yourPlayer?.alive && (
                <span className="text-red-400 font-medieval flex-shrink-0" style={{ fontSize: 12 }}>🔪 MAFIA</span>
              )}

              {/* Action buttons — large wooden framed like original */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => { setShowTestament(!showTestament); setShowDeathNote(false); }}
                  className="flex items-center justify-center rounded transition-colors"
                  style={{
                    width: 44,
                    height: 44,
                    background: showTestament ? '#3a2a10' : '#2a1808',
                    border: showTestament ? '3px solid #ffd700' : '3px solid #6b4a1a',
                    fontSize: 24,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                  }}
                  title="Testamento"
                >
                  📜
                </button>
                <button
                  onClick={() => { setShowDeathNote(!showDeathNote); setShowTestament(false); }}
                  className="flex items-center justify-center rounded transition-colors"
                  style={{
                    width: 44,
                    height: 44,
                    background: showDeathNote ? '#2a0808' : '#2a1808',
                    border: showDeathNote ? '3px solid #c03030' : '3px solid #6b4a1a',
                    fontSize: 24,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                  }}
                  title="Nota de Muerte"
                >
                  🗡️
                </button>
                {/* RIP/Graveyard button */}
                <button
                  className="flex items-center justify-center rounded"
                  style={{
                    width: 44,
                    height: 44,
                    background: '#2a1808',
                    border: '3px solid #6b4a1a',
                    fontSize: 24,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                  }}
                  title="Cementerio"
                >
                  🪦
                </button>
              </div>
            </div>

            {/* Testament/DeathNote popups */}
            <AnimatePresence>
              {showDeathNote && yourPlayer?.alive && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                  style={{ borderTop: '2px solid #3a0a0a', background: '#140606' }}
                >
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medieval text-red-400" style={{ fontSize: 16 }}>🗡️ Nota de Muerte</h3>
                      <button
                        onClick={() => onDeathNoteUpdate?.(deathNoteText)}
                        className="px-4 py-1 rounded font-medieval text-red-400 transition-colors"
                        style={{ border: '2px solid #3a0a0a', fontSize: 14 }}
                      >
                        💾 Guardar
                      </button>
                    </div>
                    <textarea
                      value={deathNoteText}
                      onChange={(e) => setDeathNoteText(e.target.value.slice(0, 200))}
                      maxLength={200}
                      placeholder="Deja una nota para tu víctima..."
                      rows={2}
                      className="w-full rounded p-3 font-crimson resize-none focus:outline-none"
                      style={{ background: '#0a0604', border: '2px solid #3a0a0a', color: '#ff9090', fontSize: 14 }}
                    />
                    <span style={{ color: '#3a1010', fontSize: 12 }}>{deathNoteText.length}/200</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </footer>
        </div>

        {/* ========== RIGHT PANEL — Day header + Player List (≈21%) ========== */}
        <aside
          className="flex-shrink-0 flex flex-col"
          style={{
            width: '21%',
            minWidth: 240,
            maxWidth: 310,
            background: 'linear-gradient(180deg, #2a1808 0%, #1e1004 100%)',
            borderLeft: '4px solid #6b4a1a',
            boxShadow: 'inset 2px 0 8px rgba(0,0,0,0.5)',
          }}
        >
          {/* DAY X header — massive like original */}
          <div
            className="flex-shrink-0 flex flex-col items-center justify-center py-3"
            style={{
              borderBottom: '4px solid #6b4a1a',
              background: 'linear-gradient(180deg, #3a2410 0%, #2a1808 100%)',
            }}
          >
            <h1
              className="font-pirata tracking-wider"
              style={{
                fontSize: 48,
                color: '#e8d4b8',
                textShadow: '2px 3px 6px rgba(0,0,0,0.8)',
                fontWeight: 'normal',
              }}
            >
              {isNight ? 'NIGHT' : 'DAY'} {gameState.day}
            </h1>
          </div>

          {/* ALL LIVE TOWNIES / TARGETS subtitle */}
          <div
            className="flex-shrink-0 py-2 text-center"
            style={{
              background: '#1a1004',
              borderBottom: '2px solid #3a2410',
            }}
          >
            <span
              className="font-medieval uppercase tracking-widest"
              style={{ color: '#e8c848', fontSize: 14, fontWeight: 'bold' }}
            >
              {isNight ? 'Targets' : 'All Live Townies'}
            </span>
          </div>

          {/* Player list — large entries */}
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            {players.map((player) => {
              const isYou = player.id === yourPlayerId;
              const isFirstTarget = selectedTarget === player.id;
              const isSecondTarget = selectedTarget2 === player.id;
              const isSelected = isFirstTarget || isSecondTarget;
              const isExecutionerTarget = yourRole?.executionerTarget?.id === player.id;

              return (
                <button
                  key={player.id}
                  onClick={() => handlePlayerClick(player)}
                  className="w-full flex items-center gap-2 text-left transition-colors"
                  style={{
                    padding: '8px 10px',
                    borderBottom: '2px solid #3a2410',
                    borderLeft: isSelected ? '5px solid #ffd700' : '5px solid transparent',
                    background: isSelected
                      ? '#3a2a10'
                      : isYou && player.alive
                        ? '#2a1c0c'
                        : 'transparent',
                    opacity: player.alive ? 1 : 0.3,
                  }}
                >
                  {/* Position number — gold circle like original */}
                  <span
                    className="font-pirata flex-shrink-0 flex items-center justify-center rounded-full"
                    style={{
                      color: player.alive ? '#1a1004' : '#444',
                      background: player.alive ? '#c8a020' : '#333',
                      fontSize: 18,
                      fontWeight: 'bold',
                      width: 32,
                      height: 32,
                      border: '2px solid #8b6914',
                    }}
                  >
                    {player.position}
                  </span>

                  {/* Name + role */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p
                        className="font-medieval truncate uppercase tracking-wide"
                        style={{
                          fontSize: 16,
                          fontWeight: 'bold',
                          color: !player.alive ? '#555' : isYou ? '#ffd700' : '#e8d4b8',
                          textDecoration: !player.alive ? 'line-through' : 'none',
                          letterSpacing: 1,
                        }}
                      >
                        {player.name}
                      </p>
                      
                      {/* Executioner target indicator */}
                      {isExecutionerTarget && player.alive && (
                        <span 
                          className="flex-shrink-0"
                          style={{ fontSize: 18 }}
                          title="Objetivo del Executioner"
                        >
                          ⚖️
                        </span>
                      )}
                      
                      {/* Transporter selection indicators */}
                      {isFirstTarget && isTransporter && (
                        <span 
                          className="flex-shrink-0 font-medieval"
                          style={{ color: '#ffd700', fontSize: 14, fontWeight: 'bold' }}
                        >
                          1
                        </span>
                      )}
                      {isSecondTarget && isTransporter && (
                        <span 
                          className="flex-shrink-0 font-medieval"
                          style={{ color: '#ffd700', fontSize: 14, fontWeight: 'bold' }}
                        >
                          2
                        </span>
                      )}
                    </div>

                    {/* Your role shown under your name — like "ESCORT" in colored text */}
                    {isYou && yourRole && player.alive && (
                      <p
                        className="font-medieval uppercase tracking-wider"
                        style={{
                          fontSize: 13,
                          fontWeight: 'bold',
                          color: yourRole.color || getFactionColor(yourRole.faction),
                        }}
                      >
                        {yourRole.roleNameEs}
                      </p>
                    )}

                    {/* Dead player's role */}
                    {!player.alive && player.roleName && (
                      <p className="font-crimson" style={{ color: '#555', fontSize: 12 }}>
                        {player.roleName}
                      </p>
                    )}

                    {/* Fellow mafia */}
                    {isMafia && player.alive && player.faction === 'MAFIA' && !isYou && (
                      <p className="font-crimson" style={{ color: '#c03030', fontSize: 12 }}>Mafia</p>
                    )}
                  </div>

                  {/* VOTE button during voting phase — like original green button */}
                  {isVoting && player.alive && !isYou && yourPlayer?.alive && (
                    <div
                      className="flex-shrink-0 flex items-center justify-center font-medieval uppercase"
                      style={{
                        background: 'linear-gradient(180deg, #4a8a20 0%, #3a6a18 100%)',
                        border: '2px solid #6aaa30',
                        borderRadius: 4,
                        padding: '4px 10px',
                        color: '#e8d4b8',
                        fontSize: 13,
                        fontWeight: 'bold',
                        letterSpacing: 1,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                      }}
                    >
                      Vote
                    </div>
                  )}

                  {/* Night action buttons — KILL/CANCEL like original */}
                  {isNight && player.alive && yourPlayer?.alive && yourRole?.nightActionLabel && (
                    (() => {
                      const canSelfTarget = yourRole?.slug === 'doctor' || yourRole?.slug === 'survivor' || yourRole?.slug === 'veteran';
                      const showButton = !isYou || canSelfTarget;
                      if (!showButton) return null;

                      const isTargeted = selectedTarget === player.id || selectedTarget2 === player.id;
                      const isFirstTarget = selectedTarget === player.id;
                      const isSecondTarget = selectedTarget2 === player.id;

                      if (isTargeted) {
                        return (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {yourRole.iconCircled && (
                              <img
                                src={yourRole.iconCircled}
                                alt=""
                                style={{ width: 28, height: 28, opacity: 0.8 }}
                              />
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isFirstTarget) {
                                  setSelectedTarget(null);
                                } else if (isSecondTarget) {
                                  setSelectedTarget2(null);
                                }
                              }}
                              className="flex items-center justify-center font-medieval uppercase"
                              style={{
                                background: 'linear-gradient(180deg, #8a2020 0%, #6a1818 100%)',
                                border: '2px solid #aa3030',
                                borderRadius: 4,
                                padding: '4px 10px',
                                color: '#ff9090',
                                fontSize: 13,
                                fontWeight: 'bold',
                                letterSpacing: 1,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                              }}
                            >
                              Cancel {isTransporter ? (isFirstTarget ? '1' : '2') : ''}
                            </button>
                          </div>
                        );
                      }

                      // If Transporter already has 2 targets, don't show button
                      if (isTransporter && selectedTarget && selectedTarget2) {
                        return null;
                      }

                      return (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {yourRole.iconCircled && (
                            <img
                              src={yourRole.iconCircled}
                              alt=""
                              style={{ width: 28, height: 28, opacity: 0.6 }}
                            />
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayerClick(player);
                            }}
                            className="flex items-center justify-center font-medieval uppercase"
                            style={{
                              background: 'linear-gradient(180deg, #8a2020 0%, #6a1818 100%)',
                              border: '2px solid #aa3030',
                              borderRadius: 4,
                              padding: '4px 10px',
                              color: '#e8d4b8',
                              fontSize: 13,
                              fontWeight: 'bold',
                              letterSpacing: 1,
                              boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                            }}
                          >
                            {yourRole.nightActionLabel}
                          </button>
                        </div>
                      );
                    })()
                  )}

                  {/* Status */}
                  {!player.alive && <span style={{ fontSize: 16 }}>💀</span>}
                </button>
              );
            })}
          </div>
        </aside>
      </div>

      {/* Testament Modal - Full screen with background image */}
      <TestamentModal
        isOpen={showTestament && !!yourPlayer?.alive}
        playerName={yourPlayer?.name || 'Jugador'}
        testament={testamentText}
        isEditable={true}
        onClose={() => setShowTestament(false)}
        onSave={(text) => {
          setTestamentText(text);
          onTestamentUpdate?.(text);
          setTestamentSaved(true);
          setTimeout(() => setTestamentSaved(false), 2000);
        }}
      />

      {/* Death Reveal Modal - Shows deaths one by one */}
      <DeathRevealModal
        deaths={deathReveals}
        isActive={isRevealingDeaths}
        onComplete={() => onDeathRevealsComplete?.()}
      />
    </div>
  );
}
