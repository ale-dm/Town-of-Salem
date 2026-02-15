import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  level: number;
  xp: number;
}

interface UserStats {
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  winRate: number;
  townWins: number;
  mafiaWins: number;
  neutralWins: number;
  currentStreak: number;
  bestStreak: number;
}

interface UserState {
  user: User | null;
  stats: UserStats | null;
  deviceId: string | null;
  
  // Actions
  setUser: (user: User) => void;
  setStats: (stats: UserStats) => void;
  setDeviceId: (deviceId: string) => void;
  clearUser: () => void;
  updateXP: (xp: number) => void;
  updateLevel: (level: number) => void;
}

// Generate device ID if not exists
const generateDeviceId = () => {
  return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        stats: null,
        deviceId: null,

        setUser: (user) => set({ user }),

        setStats: (stats) => set({ stats }),

        setDeviceId: (deviceId) => set({ deviceId }),

        clearUser: () => set({ user: null, stats: null }),

        updateXP: (xp) =>
          set((state) => ({
            user: state.user ? { ...state.user, xp } : null,
          })),

        updateLevel: (level) =>
          set((state) => ({
            user: state.user ? { ...state.user, level } : null,
          })),
      }),
      {
        name: 'user-storage',
        partialize: (state) => ({
          user: state.user,
          deviceId: state.deviceId || generateDeviceId(),
        }),
      }
    )
  )
);
