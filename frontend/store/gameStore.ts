import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

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
  will?: string;
  deathNote?: string;
}

interface GameConfig {
  minPlayers: number;
  maxPlayers: number;
  dayDuration: number;
  nightDuration: number;
  votingDuration: number;
  roleList: string[];
  mode: string;
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
}

interface GameState {
  // Game info
  gameId: string | null;
  code: string | null;
  status: 'WAITING' | 'STARTING' | 'PLAYING' | 'FINISHED' | null;
  phase: 'DAY' | 'NIGHT' | 'VOTING' | 'DEFENSE' | 'JUDGEMENT' | 'LAST_WORDS' | 'DISCUSSION' | null;
  day: number;
  config: GameConfig | null;

  // Players
  players: Player[];
  yourPlayerId: string | null;
  yourRole: string | null;

  // Chat
  messages: ChatMessage[];

  // UI State
  selectedPlayer: string | null;
  isMenuOpen: boolean;
  isChatOpen: boolean;

  // Actions - Game
  setGame: (game: {
    gameId: string;
    code: string;
    status: string;
    phase: string;
    day: number;
    config: GameConfig;
  }) => void;
  updateGameStatus: (status: GameState['status']) => void;
  updateGamePhase: (phase: GameState['phase'], day?: number) => void;
  clearGame: () => void;

  // Actions - Players
  setPlayers: (players: Player[]) => void;
  addPlayer: (player: Player) => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  removePlayer: (playerId: string) => void;
  setYourPlayerId: (playerId: string) => void;
  setYourRole: (role: string) => void;

  // Actions - Chat
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;

  // Actions - UI
  setSelectedPlayer: (playerId: string | null) => void;
  toggleMenu: () => void;
  toggleChat: () => void;
}

export const useGameStore = create<GameState>()(
  devtools(
    (set) => ({
      // Initial state
      gameId: null,
      code: null,
      status: null,
      phase: null,
      day: 1,
      config: null,
      players: [],
      yourPlayerId: null,
      yourRole: null,
      messages: [],
      selectedPlayer: null,
      isMenuOpen: false,
      isChatOpen: true,

      // Game actions
      setGame: (game) =>
        set({
          gameId: game.gameId,
          code: game.code,
          status: game.status as GameState['status'],
          phase: game.phase as GameState['phase'],
          day: game.day,
          config: game.config,
        }),

      updateGameStatus: (status) => set({ status }),

      updateGamePhase: (phase, day) =>
        set((state) => ({
          phase,
          day: day !== undefined ? day : state.day,
        })),

      clearGame: () =>
        set({
          gameId: null,
          code: null,
          status: null,
          phase: null,
          day: 1,
          config: null,
          players: [],
          yourPlayerId: null,
          yourRole: null,
          messages: [],
          selectedPlayer: null,
        }),

      // Player actions
      setPlayers: (players) => set({ players }),

      addPlayer: (player) =>
        set((state) => ({
          players: [...state.players, player],
        })),

      updatePlayer: (playerId, updates) =>
        set((state) => ({
          players: state.players.map((p) =>
            p.id === playerId ? { ...p, ...updates } : p
          ),
        })),

      removePlayer: (playerId) =>
        set((state) => ({
          players: state.players.filter((p) => p.id !== playerId),
        })),

      setYourPlayerId: (playerId) => set({ yourPlayerId: playerId }),

      setYourRole: (role) => set({ yourRole: role }),

      // Chat actions
      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),

      clearMessages: () => set({ messages: [] }),

      // UI actions
      setSelectedPlayer: (playerId) => set({ selectedPlayer: playerId }),

      toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),

      toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
    }),
    { name: 'game-store' }
  )
);
