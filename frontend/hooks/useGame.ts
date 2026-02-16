'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSocket } from './useSocket';

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
  attackValue?: number;
  defenseValue?: number;
  nightActionLabel?: string;
  nightActionLabel2?: string;
  goalEs: string;
  goalEn: string;
  abilitiesEs: string[];
  abilitiesEn: string[];
  attributesListEs?: string[];
  attributesListEn?: string[];
  executionerTarget?: { id: string; name: string; position: number } | null;
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

interface UseGameReturn {
  gameState: GameState | null;
  players: Player[];
  messages: ChatMessage[];
  yourPlayerId: string | null;
  yourRole: RoleInfo | null;
  phaseTimer: number | null;
  gameResult: GameResult | null;
  stagedAction: { actionType: string; targetId: string; targetName: string } | null;
  jesterWinData: JesterWinData | null;
  deathReveals: DeathRevealInfo[];
  isRevealingDeaths: boolean;
  voteCounts: Record<string, number>; // Vote counts by playerId
  connected: boolean;
  loading: boolean;
  error: string | null;
  joinGame: (code: string, playerName: string, userId?: string) => void;
  toggleReady: (isReady: boolean) => void;
  startGame: () => void;
  updateConfig: (config: Record<string, unknown>) => void;
  sendMessage: (content: string, channel?: string) => void;
  submitNightAction: (targetId: string, target2Id?: string) => void;
  submitVote: (nomineeId: string) => void;
  submitVerdict: (verdict: 'GUILTY' | 'INNOCENT' | 'ABSTAIN') => void;
  updateTestament: (text: string) => void;
  updateDeathNote: (text: string) => void;
  jesterHaunt: (targetId: string) => void;
  addBot: () => void;
  removeBot: (playerId: string) => void;
  clearDeathReveals: () => void;
}

export const useGame = (): UseGameReturn => {
  const { socket, connected, emit, on, off, connect } = useSocket();
  
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [yourPlayerId, setYourPlayerId] = useState<string | null>(null);
  const [yourRole, setYourRole] = useState<RoleInfo | null>(null);
  const [phaseTimer, setPhaseTimer] = useState<number | null>(null);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stagedAction, setStagedAction] = useState<{ actionType: string; targetId: string; targetName: string } | null>(null);
  const [jesterWinData, setJesterWinData] = useState<JesterWinData | null>(null);
  const [deathReveals, setDeathReveals] = useState<DeathRevealInfo[]>([]);
  const [isRevealingDeaths, setIsRevealingDeaths] = useState(false);
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!socket) return;

    // Game state handler
    const handleGameState = (data: any) => {
      console.log('Game state received:', data);
      setGameState(data.game);
      setPlayers(data.players);
      setYourPlayerId(data.yourPlayerId);
      setLoading(false);
    };

    // Player joined handler
    const handlePlayerJoined = (data: any) => {
      console.log('Player joined:', data.player.name);
      setPlayers(prev => {
        if (prev.some(p => p.id === data.player.id)) return prev;
        return [...prev, data.player];
      });
    };

    // Player ready handler
    const handlePlayerReady = (data: any) => {
      setPlayers(prev =>
        prev.map(p =>
          p.id === data.playerId ? { ...p, isReady: data.isReady } : p
        )
      );
    };

    // Game starting handler
    const handleGameStarting = (data: any) => {
      console.log('Game starting in', data.countdown, 'seconds');
      setGameState(prev => prev ? { ...prev, status: 'STARTING' } : prev);
    };

    // Game started handler
    const handleGameStarted = (data: any) => {
      console.log('Game started!', data);
      setGameState(prev => prev ? {
        ...prev,
        status: 'PLAYING',
        phase: data.phase,
        day: data.day,
      } : prev);
      
      // Update players list if provided (fixes sync issues on game start)
      if (data.players) {
        setPlayers(data.players);
      }
    };

    // Role assigned (sent only to this socket)
    const handleRoleAssigned = (data: RoleInfo) => {
      console.log('Your role:', data.roleNameEs, '(' + data.faction + ')');
      setYourRole(data);
    };

    // Phase change handler
    const handlePhaseChange = (data: any) => {
      console.log('Phase change:', data.phase, 'Day:', data.day);
      setGameState(prev => prev ? {
        ...prev,
        phase: data.phase,
        day: data.day ?? prev.day,
      } : prev);

      // Clear staged action on phase change
      setStagedAction(null);
      
      // Clear vote counts when phase changes
      if (data.phase !== 'VOTING') {
        setVoteCounts({});
      }

      // Add system message for phase change
      if (data.message) {
        const sysMsg: ChatMessage = {
          id: `sys-${Date.now()}`,
          author: { id: 'system', name: 'Sistema', position: 0 },
          content: data.message,
          timestamp: new Date(),
          channel: 'PUBLIC',
          isSystem: true,
        };
        setMessages(prev => [...prev, sysMsg]);
      }
    };

    // Phase timer tick
    const handlePhaseTimer = (data: { timeLeft: number }) => {
      setPhaseTimer(data.timeLeft);
    };

    // Death reveal (new system for morning reveals)
    const handleDeathReveal = (data: any) => {
      console.log('Death reveal:', data);
      if (data.type === 'NO_DEATHS') {
        const sysMsg: ChatMessage = {
          id: `no-deaths-${Date.now()}`,
          author: { id: 'system', name: 'Sistema', position: 0 },
          content: data.message,
          timestamp: new Date(),
          channel: 'PUBLIC',
          isSystem: true,
        };
        setMessages(prev => [...prev, sysMsg]);
        return;
      }

      if (data.type === 'DEATH') {
        // Update player state
        setPlayers(prev =>
          prev.map(p =>
            p.id === data.playerId
              ? { ...p, alive: false, roleName: data.roleName, faction: data.faction }
              : p
          )
        );

        // Add to death reveals queue
        const deathInfo: DeathRevealInfo = {
          playerId: data.playerId,
          playerName: data.playerName,
          position: data.position,
          roleName: data.isCleaned ? undefined : data.roleName,
          faction: data.isCleaned ? undefined : data.faction,
          testament: data.will,
          deathNote: data.deathNote || data.executionNote,
          cause: data.causeOfDeath,
          isCleaned: data.isCleaned,
        };
        
        setDeathReveals(prev => [...prev, deathInfo]);
        setIsRevealingDeaths(true);
      }
    };

    // Player died (night kills)
    const handlePlayerDied = (data: any) => {
      console.log('Player died:', data.playerName);
      setPlayers(prev =>
        prev.map(p =>
          p.id === data.playerId
            ? { ...p, alive: false, roleName: data.roleName, faction: data.faction }
            : p
        )
      );

      const deathMsgs: ChatMessage[] = [];

      deathMsgs.push({
        id: `death-${Date.now()}-${data.playerId}`,
        author: { id: 'system', name: 'Sistema', position: 0 },
        content: `💀 ${data.playerName} ha muerto. Era ${data.roleName} (${data.faction}).`,
        timestamp: new Date(),
        channel: 'PUBLIC',
        isSystem: true,
      });

      // Show testament if available
      if (data.will) {
        deathMsgs.push({
          id: `will-${Date.now()}-${data.playerId}`,
          author: { id: 'system', name: 'Sistema', position: 0 },
          content: `📜 Testamento de ${data.playerName}: "${data.will}"`,
          timestamp: new Date(),
          channel: 'PUBLIC',
          isSystem: true,
        });
      }

      // Show death note if available
      if (data.deathNote) {
        deathMsgs.push({
          id: `dn-${Date.now()}-${data.playerId}`,
          author: { id: 'system', name: 'Sistema', position: 0 },
          content: `🗡️ Nota de muerte: "${data.deathNote}"`,
          timestamp: new Date(),
          channel: 'PUBLIC',
          isSystem: true,
        });
      }

      setMessages(prev => [...prev, ...deathMsgs]);
    };

    // Player executed (trial)
    const handlePlayerExecuted = (data: any) => {
      console.log('Player executed:', data.playerName);
      setPlayers(prev =>
        prev.map(p =>
          p.id === data.playerId
            ? { ...p, alive: false, roleName: data.roleName, faction: data.faction }
            : p
        )
      );

      const execMsgs: ChatMessage[] = [];

      execMsgs.push({
        id: `exec-${Date.now()}`,
        author: { id: 'system', name: 'Sistema', position: 0 },
        content: `⚖️ ${data.playerName} ha sido ejecutado. Era ${data.roleName} (${data.faction}).`,
        timestamp: new Date(),
        channel: 'PUBLIC',
        isSystem: true,
      });

      if (data.will) {
        execMsgs.push({
          id: `will-exec-${Date.now()}`,
          author: { id: 'system', name: 'Sistema', position: 0 },
          content: `📜 Testamento de ${data.playerName}: "${data.will}"`,
          timestamp: new Date(),
          channel: 'PUBLIC',
          isSystem: true,
        });
      }

      setMessages(prev => [...prev, ...execMsgs]);
    };

    // Player acquitted
    const handlePlayerAcquitted = (data: any) => {
      const sysMsg: ChatMessage = {
        id: `acq-${Date.now()}`,
        author: { id: 'system', name: 'Sistema', position: 0 },
        content: `🕊️ ${data.playerName} ha sido absuelto. (${data.guiltyVotes} culpable / ${data.innocentVotes} inocente)`,
        timestamp: new Date(),
        channel: 'PUBLIC',
        isSystem: true,
      };
      setMessages(prev => [...prev, sysMsg]);
    };

    // Vote cast (voting phase)
    const handleVoteCast = (data: any) => {
      const sysMsg: ChatMessage = {
        id: `vote-${Date.now()}-${data.voterId}`,
        author: { id: 'system', name: 'Sistema', position: 0 },
        content: `🗳️ ${data.voterName} ha votado contra ${data.nomineeName} (${data.currentVotes}/${data.requiredVotes})`,
        timestamp: new Date(),
        channel: 'PUBLIC',
        isSystem: true,
      };
      setMessages(prev => [...prev, sysMsg]);
      
      // Update vote counts
      if (data.allVoteCounts) {
        const newCounts: Record<string, number> = {};
        data.allVoteCounts.forEach((vc: any) => {
          newCounts[vc.playerId] = vc.voteCount;
        });
        setVoteCounts(newCounts);
      }
    };

    // Verdict update (trial phase)
    const handleVerdictUpdate = (data: any) => {
      const sysMsg: ChatMessage = {
        id: `verdict-${Date.now()}-${data.voterId}`,
        author: { id: 'system', name: 'Sistema', position: 0 },
        content: `⚖️ ${data.voterName} ha votado: ${data.verdict === 'GUILTY' ? '⚔️ Culpable' : data.verdict === 'INNOCENT' ? '🕊️ Inocente' : '🤷 Abstención'}`,
        timestamp: new Date(),
        channel: 'PUBLIC',
        isSystem: true,
      };
      setMessages(prev => [...prev, sysMsg]);
    };

    // Night action confirmed (staging feedback)
    const handleActionConfirmed = (data: any) => {
      const sysMsg: ChatMessage = {
        id: `action-${Date.now()}`,
        author: { id: 'system', name: 'Sistema', position: 0 },
        content: data.message || '✅ Acción nocturna confirmada',
        timestamp: new Date(),
        channel: 'PUBLIC',
        isSystem: true,
      };
      setMessages(prev => [...prev, sysMsg]);
      // Store staging info for UI
      setStagedAction(data.canChange ? { actionType: data.actionType, targetId: data.targetId, targetName: data.targetName } : null);
    };

    // Night result (private investigation result, roleblock notification, etc.)
    const handleNightResult = (data: any) => {
      console.log('Night result:', data);
      const sysMsg: ChatMessage = {
        id: `nightres-${Date.now()}-${Math.random()}`,
        author: { id: 'system', name: 'Sistema', position: 0 },
        content: `🔍 ${data.message}${data.target ? ` (${data.target})` : ''}`,
        timestamp: new Date(),
        channel: 'PUBLIC',
        isSystem: true,
      };
      setMessages(prev => [...prev, sysMsg]);
    };

    // Game ended
    const handleGameEnded = (data: GameResult) => {
      console.log('Game ended! Winner:', data.winner);
      setGameState(prev => prev ? { ...prev, status: 'FINISHED' } : prev);
      setGameResult(data);
    };

    // Chat message handler
    const handleChatMessage = (data: ChatMessage) => {
      setMessages(prev => [...prev, data]);
    };

    // Error handler
    const handleError = (data: { message: string }) => {
      console.error('Socket error:', data.message);
      setError(data.message);
      setLoading(false);
    };

    // Player reconnected
    const handlePlayerReconnected = (data: any) => {
      const sysMsg: ChatMessage = {
        id: `reconn-${Date.now()}`,
        author: { id: 'system', name: 'Sistema', position: 0 },
        content: `🔄 ${data.playerName} se ha reconectado.`,
        timestamp: new Date(),
        channel: 'PUBLIC',
        isSystem: true,
      };
      setMessages(prev => [...prev, sysMsg]);
    };

    // Jester won (lynched)
    const handleJesterWon = (data: JesterWinData) => {
      console.log('Jester won!', data);
      setJesterWinData(data);
      const sysMsg: ChatMessage = {
        id: `jester-won-${Date.now()}`,
        author: { id: 'system', name: 'Sistema', position: 0 },
        content: data.message,
        timestamp: new Date(),
        channel: 'PUBLIC',
        isSystem: true,
      };
      setMessages(prev => [...prev, sysMsg]);
    };

    // Jester haunt selected
    const handleJesterHauntSelected = (data: any) => {
      const sysMsg: ChatMessage = {
        id: `jester-haunt-${Date.now()}`,
        author: { id: 'system', name: 'Sistema', position: 0 },
        content: data.message,
        timestamp: new Date(),
        channel: 'PUBLIC',
        isSystem: true,
      };
      setMessages(prev => [...prev, sysMsg]);
      // Clear jester win UI after selection
      setJesterWinData(null);
    };

    // Jester haunt confirmed (to the Jester)
    const handleJesterHauntConfirmed = (data: any) => {
      const sysMsg: ChatMessage = {
        id: `jester-haunt-confirm-${Date.now()}`,
        author: { id: 'system', name: 'Sistema', position: 0 },
        content: `👻 Has elegido hauntar a ${data.targetName}. Lo matarás esta noche.`,
        timestamp: new Date(),
        channel: 'PUBLIC',
        isSystem: true,
      };
      setMessages(prev => [...prev, sysMsg]);
      setJesterWinData(null);
    };

    // Register all handlers
    on('game:state', handleGameState);
    on('player:joined', handlePlayerJoined);
    on('death:reveal', handleDeathReveal);

    // Player left handler
    const handlePlayerLeft = (data: any) => {
      setPlayers(prev => prev.filter(p => p.id !== data.playerId));
    };

    on('player:left', handlePlayerLeft);
    on('player:ready', handlePlayerReady);
    on('game:starting', handleGameStarting);
    on('game:started', handleGameStarted);
    on('role:assigned', handleRoleAssigned);
    on('phase:change', handlePhaseChange);
    on('phase:timer', handlePhaseTimer);
    on('player:died', handlePlayerDied);
    on('player:executed', handlePlayerExecuted);
    on('player:acquitted', handlePlayerAcquitted);
    on('vote:cast', handleVoteCast);
    on('verdict:update', handleVerdictUpdate);
    on('action:confirmed', handleActionConfirmed);
    on('night:result', handleNightResult);
    on('game:ended', handleGameEnded);
    on('chat:message', handleChatMessage);
    on('error', handleError);
    on('jester:won', handleJesterWon);
    on('jester:haunt:selected', handleJesterHauntSelected);
    on('jester:haunt:confirmed', handleJesterHauntConfirmed);
    on('player:reconnected', handlePlayerReconnected);

    // Cleanup
    return () => {
      off('game:state', handleGameState);
      off('player:joined', handlePlayerJoined);
      off('death:reveal', handleDeathReveal);
      off('player:left', handlePlayerLeft);
      off('player:ready', handlePlayerReady);
      off('game:starting', handleGameStarting);
      off('game:started', handleGameStarted);
      off('role:assigned', handleRoleAssigned);
      off('phase:change', handlePhaseChange);
      off('phase:timer', handlePhaseTimer);
      off('player:died', handlePlayerDied);
      off('player:executed', handlePlayerExecuted);
      off('player:acquitted', handlePlayerAcquitted);
      off('vote:cast', handleVoteCast);
      off('verdict:update', handleVerdictUpdate);
      off('action:confirmed', handleActionConfirmed);
      off('night:result', handleNightResult);
      off('game:ended', handleGameEnded);
      off('chat:message', handleChatMessage);
      off('error', handleError);
      off('jester:won', handleJesterWon);
      off('jester:haunt:selected', handleJesterHauntSelected);
      off('jester:haunt:confirmed', handleJesterHauntConfirmed);
      off('player:reconnected', handlePlayerReconnected);
    };
  }, [socket, on, off]);

  const joinGame = useCallback((code: string, playerName: string, userId?: string) => {
    setLoading(true);
    setError(null);
    connect();
    emit('game:join', { code, playerName, userId: userId || undefined });
  }, [connect, emit]);

  const toggleReady = useCallback((isReady: boolean) => {
    emit('player:ready', { isReady });
  }, [emit]);

  const startGame = useCallback(() => {
    emit('game:start', {});
  }, [emit]);

  const updateConfig = useCallback((config: Record<string, unknown>) => {
    emit('game:config', config);
  }, [emit]);

  const sendMessage = useCallback((content: string, channel: string = 'PUBLIC') => {
    emit('chat:message', { content, channel });
  }, [emit]);

  const submitNightAction = useCallback((targetId: string, target2Id?: string) => {
    if (target2Id) {
      emit('action:night', { targetId, target2Id });
    } else {
      emit('action:night', { targetId });
    }
  }, [emit]);

  const submitVote = useCallback((nomineeId: string) => {
    emit('vote:nominate', { nomineeId });
  }, [emit]);

  const submitVerdict = useCallback((verdict: 'GUILTY' | 'INNOCENT' | 'ABSTAIN') => {
    emit('vote:verdict', { verdict });
  }, [emit]);

  const updateTestament = useCallback((text: string) => {
    emit('testament:update', { text });
  }, [emit]);

  const updateDeathNote = useCallback((text: string) => {
    emit('deathnote:update', { text });
  }, [emit]);

  const addBot = useCallback(() => {
    emit('game:add-bot', {});
  }, [emit]);

  const removeBot = useCallback((playerId: string) => {
    emit('game:remove-bot', { playerId });
  }, [emit]);

  const jesterHaunt = useCallback((targetId: string) => {
    emit('jester:haunt', { targetId });
  }, [emit]);

  const clearDeathReveals = useCallback(() => {
    setDeathReveals([]);
    setIsRevealingDeaths(false);
  }, []);

  return {
    gameState,
    players,
    messages,
    yourPlayerId,
    yourRole,
    phaseTimer,
    gameResult,
    stagedAction,
    jesterWinData,
    deathReveals,
    isRevealingDeaths,
    voteCounts,
    connected,
    loading,
    updateConfig,
    error,
    joinGame,
    toggleReady,
    startGame,
    sendMessage,
    submitNightAction,
    submitVote,
    submitVerdict,
    updateTestament,
    updateDeathNote,
    jesterHaunt,
    addBot,
    removeBot,
    clearDeathReveals,
  };
};
