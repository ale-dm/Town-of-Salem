// ============================================
// BOT PERSONALITIES - 6 predefined types
// ============================================

/**
 * Each personality defines traits (0-10), style, and behavior modifiers.
 */
export const PERSONALITIES = {
  paranoid: {
    id: 'paranoid',
    name: 'Paranoico',
    avatar: '😰',
    traits: {
      aggression: 7,
      paranoia: 10,
      verbosity: 8,
      deduction: 5,
      emotional: 8,
      riskTaking: 3,
      trustworthy: 2,
      leadership: 4,
    },
    style: {
      typos: false,
      emojis: ['😰', '👀', '🤔', '⚠️'],
      temperature: 0.9,
    },
    description: 'Desconfía de todos, acusa con frecuencia, cambia de opinión fácilmente.',
  },

  aggressive: {
    id: 'aggressive',
    name: 'Agresivo',
    avatar: '😡',
    traits: {
      aggression: 10,
      paranoia: 7,
      verbosity: 9,
      deduction: 6,
      emotional: 9,
      riskTaking: 9,
      trustworthy: 5,
      leadership: 8,
    },
    style: {
      typos: true,
      emojis: ['😡', '💀', '⚔️', '🔥'],
      temperature: 0.95,
    },
    description: 'Lidera votaciones, acusa fuertemente, usa mayúsculas, impaciente.',
  },

  sherlock: {
    id: 'sherlock',
    name: 'Sherlock',
    avatar: '🕵️',
    traits: {
      aggression: 5,
      paranoia: 6,
      verbosity: 7,
      deduction: 10,
      emotional: 3,
      riskTaking: 5,
      trustworthy: 6,
      leadership: 9,
    },
    style: {
      typos: false,
      emojis: ['🕵️', '📊', '🧠', '🔍'],
      temperature: 0.7,
    },
    description: 'Analítico, menciona patrones de voto, calmado y lógico.',
  },

  newbie: {
    id: 'newbie',
    name: 'Novato',
    avatar: '🤷',
    traits: {
      aggression: 3,
      paranoia: 5,
      verbosity: 4,
      deduction: 3,
      emotional: 6,
      riskTaking: 2,
      trustworthy: 8,
      leadership: 2,
    },
    style: {
      typos: true,
      emojis: ['🤷', '😅', '🤔'],
      temperature: 0.85,
    },
    description: 'Inseguro, pide ayuda, sigue a la mayoría, callado inicialmente.',
  },

  silent: {
    id: 'silent',
    name: 'Silencioso',
    avatar: '😶',
    traits: {
      aggression: 2,
      paranoia: 5,
      verbosity: 1,
      deduction: 7,
      emotional: 2,
      riskTaking: 4,
      trustworthy: 7,
      leadership: 1,
    },
    style: {
      typos: false,
      emojis: ['😶', '👍'],
      temperature: 0.6,
    },
    description: 'Muy pocas palabras, observa sin comentar, vota estratégicamente.',
  },

  chaotic: {
    id: 'chaotic',
    name: 'Caótico',
    avatar: '🎲',
    traits: {
      aggression: Math.floor(Math.random() * 6) + 3,
      paranoia: Math.floor(Math.random() * 6) + 3,
      verbosity: Math.floor(Math.random() * 6) + 3,
      deduction: Math.floor(Math.random() * 5) + 2,
      emotional: Math.floor(Math.random() * 5) + 5,
      riskTaking: 8,
      trustworthy: 4,
      leadership: Math.floor(Math.random() * 6) + 2,
    },
    style: {
      typos: true,
      emojis: ['🎲', '🎪', '🃏', '💥'],
      temperature: 1.0,
    },
    description: 'Impredecible, cambia estrategia, vota random a veces.',
  },
};

/**
 * Get a random personality for a bot
 */
export function getRandomPersonality() {
  const keys = Object.keys(PERSONALITIES);
  return { ...PERSONALITIES[keys[Math.floor(Math.random() * keys.length)]] };
}

/**
 * Get a specific personality by ID
 */
export function getPersonality(id) {
  return PERSONALITIES[id] ? { ...PERSONALITIES[id] } : getRandomPersonality();
}

/**
 * BOT NAMES - Spanish themed names for bots
 */
export const BOT_NAMES = [
  'Carlos', 'Miguel', 'Sofía', 'Elena', 'Pablo',
  'Lucía', 'Diego', 'Valentina', 'Andrés', 'Camila',
  'Javier', 'Isabella', 'Mateo', 'Daniela', 'Sebastián',
];

export function getRandomBotName(usedNames = []) {
  const available = BOT_NAMES.filter(n => !usedNames.includes(n));
  if (available.length === 0) return `Bot-${Math.floor(Math.random() * 1000)}`;
  return available[Math.floor(Math.random() * available.length)];
}
