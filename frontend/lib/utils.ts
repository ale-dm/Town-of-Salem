// Utility functions for the Mafia Game

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Format time to readable string
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Get faction color
 */
export function getFactionColor(faction: string): string {
  const colors: Record<string, string> = {
    TOWN: '#4169e1',
    MAFIA: '#8b0000',
    NEUTRAL: '#808080',
    COVEN: '#9932cc',
  };
  return colors[faction.toUpperCase()] || '#808080';
}

/**
 * Get faction name in Spanish
 */
export function getFactionName(faction: string): string {
  const names: Record<string, string> = {
    TOWN: 'Pueblo',
    MAFIA: 'Mafia',
    NEUTRAL: 'Neutral',
    COVEN: 'Aquelarre',
  };
  return names[faction.toUpperCase()] || faction;
}

/**
 * Get phase name in Spanish
 */
export function getPhaseName(phase: string): string {
  const names: Record<string, string> = {
    DAY: 'Día',
    NIGHT: 'Noche',
    VOTING: 'Votación',
    DEFENSE: 'Defensa',
    JUDGEMENT: 'Juicio',
    LAST_WORDS: 'Últimas Palabras',
    DISCUSSION: 'Discusión',
  };
  return names[phase.toUpperCase()] || phase;
}

/**
 * Generate random avatar emoji
 */
export function getRandomAvatar(): string {
  const avatars = [
    '🧑', '👨', '👩', '🧔', '👱', '👴', '👵', '🧓',
    '🕵️', '👮', '👷', '💂', '🥷', '👸', '🤴', '🧙',
  ];
  return avatars[Math.floor(Math.random() * avatars.length)];
}

/**
 * Validate game code format (6 alphanumeric characters)
 */
export function isValidGameCode(code: string): boolean {
  return /^[A-Z0-9]{6}$/.test(code);
}

/**
 * Validate player name
 */
export function isValidPlayerName(name: string): boolean {
  return name.length >= 3 && name.length <= 20 && /^[a-zA-Z0-9_\s]+$/.test(name);
}

/**
 * Calculate win rate percentage
 */
export function calculateWinRate(wins: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((wins / total) * 100);
}

/**
 * Get player count text
 */
export function getPlayerCountText(current: number, max: number): string {
  return `${current}/${max} jugadores`;
}

/**
 * Format timer (seconds to mm:ss)
 */
export function formatTimer(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Sleep function for delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Shuffle array
 */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get ordinal number (1st, 2nd, 3rd, etc.)
 */
export function getOrdinal(n: number): string {
  const s = ['º', '°'];
  return n + s[0];
}
