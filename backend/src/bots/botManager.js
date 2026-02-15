// ============================================
// BOT MANAGER - AI Bot Orchestrator
// ============================================
// Handles bot triggers, decision-making via Gemini,
// timing simulation, and action execution.

import { prisma } from '../lib/prisma.js';
import { generateDecision, isAvailable as geminiAvailable } from './geminiService.js';
import { getRandomPersonality, getPersonality } from './personalities.js';

// ============================================
// IN-MEMORY BOT STATE
// ============================================

/** Map< gameCode, Map< playerId, BotState > > */
const activeBots = new Map();

/**
 * @typedef {Object} BotState
 * @property {string} playerId
 * @property {string} name
 * @property {object} personality
 * @property {object} role  - { roleName, faction, slug, nightActionType, ... }
 * @property {object} memory
 * @property {object} mood
 * @property {number} lastSpokeAt
 * @property {number} messageCount
 */

function createBotState(playerId, name, personalityId) {
  const personality = personalityId
    ? getPersonality(personalityId)
    : getRandomPersonality();

  return {
    playerId,
    name,
    personality,
    role: null,
    memory: {
      suspicions: {},     // name -> 0-10
      allies: [],
      roleClaims: {},     // name -> claimed role
      myMessages: [],
      knownInfo: [],      // "Sheriff: Player3 is Suspicious"
      myFakeClaim: null,
    },
    mood: {
      stress: 3,
      confidence: 5,
    },
    lastSpokeAt: 0,
    messageCount: 0,
  };
}

// ============================================
// BOT REGISTRATION
// ============================================

/**
 * Register bot players in a game for AI management.
 * Called after role assignment in startGameLoop.
 */
export function registerBots(gameCode, botPlayers, assignments) {
  if (!activeBots.has(gameCode)) {
    activeBots.set(gameCode, new Map());
  }
  const botMap = activeBots.get(gameCode);

  for (const bp of botPlayers) {
    const assignment = assignments.find(a => a.playerId === bp.id);
    if (!assignment) continue;

    const state = createBotState(bp.id, bp.name);
    state.role = {
      roleName: assignment.roleName,
      roleNameEs: assignment.roleNameEs,
      faction: assignment.faction,
      slug: assignment.slug,
      nightActionType: assignment.nightActionType,
      attackValue: assignment.attackValue,
      defenseValue: assignment.defenseValue,
    };
    botMap.set(bp.id, state);
  }

  console.log(`🤖 Registered ${botPlayers.length} bots for game ${gameCode}`);
}

/**
 * Clean up bots when game ends.
 */
export function unregisterBots(gameCode) {
  activeBots.delete(gameCode);
}

/**
 * Get all bot states for a game.
 */
function getGameBots(gameCode) {
  return activeBots.get(gameCode) || new Map();
}

// ============================================
// TRIGGERS - When bots should act
// ============================================

/**
 * Trigger bot night actions.
 * Called when night starts.
 */
export async function triggerNightActions(gameId, gameCode, io) {
  const bots = getGameBots(gameCode);
  if (bots.size === 0) return;

  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) return;

  const players = await prisma.gamePlayer.findMany({
    where: { gameId },
    orderBy: { position: 'asc' },
  });

  const alivePlayers = players.filter(p => p.alive);
  const deadPlayers = players.filter(p => !p.alive);

  for (const [botId, botState] of bots.entries()) {
    const botPlayer = players.find(p => p.id === botId);
    if (!botPlayer || !botPlayer.alive) continue;

    const actionType = botState.role.nightActionType;
    if (!actionType || actionType === 'NONE' || actionType === 'AUTOMATIC') continue;

    // Delay to simulate thinking (2-8 seconds)
    const delay = 2000 + Math.random() * 6000;
    setTimeout(async () => {
      try {
        const targetId = await decideNightAction(botState, alivePlayers, deadPlayers, game);
        if (targetId) {
          await executeNightAction(gameId, botId, targetId, io, gameCode);
        }
      } catch (err) {
        console.error(`🤖 Night action error for ${botState.name}:`, err.message);
      }
    }, delay);
  }
}

/**
 * Trigger bot day chat participation.
 * Called when day starts + periodically during day.
 */
export async function triggerDayChat(gameId, gameCode, io, isDay1 = false) {
  const bots = getGameBots(gameCode);
  if (bots.size === 0) return;

  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) return;

  const players = await prisma.gamePlayer.findMany({
    where: { gameId },
    orderBy: { position: 'asc' },
  });

  const recentMessages = await getRecentMessages(gameId, 20);

  for (const [botId, botState] of bots.entries()) {
    const botPlayer = players.find(p => p.id === botId);
    if (!botPlayer || !botPlayer.alive) continue;

    // Day 1: ALL bots greet (no cooldown, 100% chance)
    if (isDay1) {
      // Skip cooldown and probability checks on Day 1
    } else {
      // Check cooldown (30s min between messages)
      const now = Date.now();
      if (now - botState.lastSpokeAt < 30000) continue;

      // Probability based on verbosity
      const talkChance = botState.personality.traits.verbosity / 20; // 5% - 50%
      if (Math.random() > talkChance) continue;
    }

    // Delay to simulate reading + thinking
    // Day 1: shorter delays (1-6 seconds) so everyone greets quickly
    const delay = isDay1 
      ? (1000 + Math.random() * 5000)
      : (3000 + Math.random() * 12000);
    setTimeout(async () => {
      try {
        const message = await decideDayMessage(botState, players, recentMessages, game);
        if (message) {
          await sendBotMessage(gameId, gameCode, botId, botState.name, message, 'PUBLIC', io);
          botState.lastSpokeAt = Date.now();
          botState.messageCount++;
          botState.memory.myMessages.push(message);
        }
      } catch (err) {
        console.error(`🤖 Chat error for ${botState.name}:`, err.message);
      }
    }, delay);
  }
}

/**
 * Trigger bot voting decisions.
 * Called when voting phase starts.
 */
export async function triggerVoting(gameId, gameCode, io) {
  const bots = getGameBots(gameCode);
  if (bots.size === 0) return;

  const players = await prisma.gamePlayer.findMany({
    where: { gameId, alive: true },
    orderBy: { position: 'asc' },
  });
  const game = await prisma.game.findUnique({ where: { id: gameId } });
  const recentMessages = await getRecentMessages(gameId, 15);

  for (const [botId, botState] of bots.entries()) {
    const botPlayer = players.find(p => p.id === botId);
    if (!botPlayer) continue;

    // Delay: 3-12 seconds
    const delay = 3000 + Math.random() * 9000;
    setTimeout(async () => {
      try {
        const targetId = await decideVote(botState, players, recentMessages, game);
        if (targetId && targetId !== botId) {
          // Import submitVote dynamically to avoid circular
          const { submitVote } = await import('../gameEngine.js');
          await submitVote(gameId, botId, targetId, gameCode, io);
        }
      } catch (err) {
        console.error(`🤖 Vote error for ${botState.name}:`, err.message);
      }
    }, delay);
  }
}

/**
 * Trigger bot verdict during trial.
 */
export async function triggerVerdict(gameId, gameCode, accusedId, io) {
  const bots = getGameBots(gameCode);
  if (bots.size === 0) return;

  const players = await prisma.gamePlayer.findMany({
    where: { gameId, alive: true },
  });
  const recentMessages = await getRecentMessages(gameId, 10);
  const game = await prisma.game.findUnique({ where: { id: gameId } });

  for (const [botId, botState] of bots.entries()) {
    if (botId === accusedId) continue; // Accused can't vote

    const botPlayer = players.find(p => p.id === botId);
    if (!botPlayer) continue;

    const delay = 2000 + Math.random() * 8000;
    setTimeout(async () => {
      try {
        const verdict = await decideVerdict(botState, accusedId, players, recentMessages, game);
        if (verdict) {
          const { submitVerdict } = await import('../gameEngine.js');
          await submitVerdict(gameId, botId, verdict, gameCode, io);
        }
      } catch (err) {
        console.error(`🤖 Verdict error for ${botState.name}:`, err.message);
      }
    }, delay);
  }
}

/**
 * Trigger bot defense speech when they are on trial.
 */
export async function triggerDefense(gameId, gameCode, accusedId, io) {
  const bots = getGameBots(gameCode);
  if (bots.size === 0) return;

  const botState = bots.get(accusedId);
  if (!botState) return; // Accused is not a bot

  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) return;

  const players = await prisma.gamePlayer.findMany({
    where: { gameId },
    orderBy: { position: 'asc' },
  });
  const recentMessages = await getRecentMessages(gameId, 10);

  // Build defense prompt
  const defensePrompt = buildDefensePrompt(botState, players, recentMessages, game);

  const delay = 2000 + Math.random() * 4000;
  setTimeout(async () => {
    try {
      const decision = await generateDecision(defensePrompt, botState.personality.style.temperature);
      let defenseMsg;

      if (decision?.message) {
        defenseMsg = decision.message.substring(0, 280);
        defenseMsg = applyPersonalityStyle(defenseMsg, botState.personality);
      } else {
        // Fallback defense messages
        const { role, personality } = botState;
        const fallbacks = role.faction === 'MAFIA'
          ? [
              '¡Soy inocente! ¿Qué pruebas tenéis?',
              'Estáis cometiendo un error, soy Town',
              '¡No tenéis ninguna evidencia contra mí!',
              'Si me ejecutáis, la Mafia gana',
              'Soy Doctor, ¡estoy curando gente!',
            ]
          : [
              `¡Soy ${role.roleNameEs}! ¡No me matéis!`,
              '¡Soy inocente! ¡Investigadme!',
              'Estáis matando a un Town, ¡pensadlo bien!',
              '¡Si me ejecutáis perdemos!',
              `Soy ${role.roleNameEs} y he estado ayudando al pueblo`,
            ];
        defenseMsg = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      }

      if (defenseMsg) {
        await sendBotMessage(gameId, gameCode, accusedId, botState.name, defenseMsg, 'PUBLIC', io);
        botState.lastSpokeAt = Date.now();
        botState.messageCount++;
      }
    } catch (err) {
      console.error(`🤖 Defense error for ${botState.name}:`, err.message);
    }
  }, delay);
}

/**
 * Trigger bot reaction to a chat message (someone spoke).
 */
export async function triggerChatReaction(gameId, gameCode, message, io) {
  const bots = getGameBots(gameCode);
  if (bots.size === 0) return;

  const players = await prisma.gamePlayer.findMany({
    where: { gameId },
    orderBy: { position: 'asc' },
  });
  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game || game.phase === 'NIGHT') return; // Bots don't react to public chat at night

  const recentMessages = await getRecentMessages(gameId, 20);

  for (const [botId, botState] of bots.entries()) {
    const botPlayer = players.find(p => p.id === botId);
    if (!botPlayer || !botPlayer.alive) continue;

    // Check cooldown
    const now = Date.now();
    if (now - botState.lastSpokeAt < 20000) continue;

    // Was the bot mentioned?
    const mentioned = message.content?.toLowerCase().includes(botState.name.toLowerCase());

    // Probability: high if mentioned, low otherwise
    let reactChance;
    if (mentioned) {
      reactChance = 0.8;
    } else {
      reactChance = botState.personality.traits.verbosity / 40; // 2.5% - 25%
    }

    if (Math.random() > reactChance) continue;

    const delay = mentioned ? (2000 + Math.random() * 4000) : (5000 + Math.random() * 15000);
    setTimeout(async () => {
      try {
        const reply = await decideDayMessage(botState, players, recentMessages, game);
        if (reply) {
          await sendBotMessage(gameId, gameCode, botId, botState.name, reply, 'PUBLIC', io);
          botState.lastSpokeAt = Date.now();
          botState.messageCount++;
          botState.memory.myMessages.push(reply);
        }
      } catch (err) {
        console.error(`🤖 Reaction error for ${botState.name}:`, err.message);
      }
    }, delay);
  }
}

/**
 * Schedule periodic bot chatter during day phase.
 * Returns interval ID so it can be cleared.
 */
export function scheduleDayChatter(gameId, gameCode, io) {
  // Every 15-25 seconds, a random bot might speak
  const interval = setInterval(async () => {
    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game || game.phase !== 'DAY') {
      clearInterval(interval);
      return;
    }
    await triggerDayChat(gameId, gameCode, io);
  }, 15000 + Math.random() * 10000);

  return interval;
}

// ============================================
// MAFIA CHAT - Bots coordinate at night
// ============================================

export async function triggerMafiaChat(gameId, gameCode, io) {
  const bots = getGameBots(gameCode);
  if (bots.size === 0) return;

  const players = await prisma.gamePlayer.findMany({
    where: { gameId, alive: true },
    orderBy: { position: 'asc' },
  });

  for (const [botId, botState] of bots.entries()) {
    if (botState.role.faction !== 'MAFIA') continue;

    const botPlayer = players.find(p => p.id === botId);
    if (!botPlayer) continue;

    // 50% chance to say something in mafia chat
    if (Math.random() > 0.5) continue;

    const delay = 3000 + Math.random() * 8000;
    setTimeout(async () => {
      try {
        const targets = players.filter(p =>
          p.id !== botId && p.faction !== 'MAFIA' && p.alive
        );

        if (targets.length === 0) return;

        const target = targets[Math.floor(Math.random() * targets.length)];
        const messages = [
          `Vamos a por ${target.name}`,
          `${target.name} puede ser peligroso, matémoslo`,
          `Yo digo ${target.name}`,
          `¿Qué os parece ${target.name}?`,
          `${target.name} sospecha de nosotros`,
        ];
        const msg = messages[Math.floor(Math.random() * messages.length)];

        await sendBotMessage(gameId, gameCode, botId, botState.name, msg, 'MAFIA', io);
      } catch (err) {
        console.error(`🤖 Mafia chat error for ${botState.name}:`, err.message);
      }
    }, delay);
  }
}

// ============================================
// DECISION FUNCTIONS - Call Gemini or Fallback
// ============================================

async function decideNightAction(botState, alivePlayers, deadPlayers, game) {
  const { role, personality, memory, name } = botState;
  const targets = alivePlayers.filter(p => p.id !== botState.playerId);

  if (targets.length === 0) return null;

  // Build prompt for Gemini
  const prompt = buildNightActionPrompt(botState, targets, deadPlayers, game);

  const decision = await generateDecision(prompt, personality.style.temperature);

  if (decision?.target) {
    // Find player by name
    const targetPlayer = targets.find(
      p => p.name.toLowerCase() === decision.target.toLowerCase()
    );
    if (targetPlayer) {
      // Update suspicions from reasoning
      if (decision.reasoning) {
        memory.knownInfo.push(`Noche ${game.day}: ${decision.reasoning}`);
      }
      return targetPlayer.id;
    }
  }

  // Fallback: pick based on role
  return fallbackNightAction(botState, targets);
}

async function decideDayMessage(botState, players, recentMessages, game) {
  const { personality, memory, name, role } = botState;

  const prompt = buildDayChatPrompt(botState, players, recentMessages, game);

  const decision = await generateDecision(prompt, personality.style.temperature);

  if (decision?.message) {
    let msg = decision.message.substring(0, 280);
    // Apply personality tweaks
    msg = applyPersonalityStyle(msg, personality);
    return msg;
  }

  // Fallback: use phrase template
  return fallbackDayMessage(botState, players, game);
}

async function decideVote(botState, players, recentMessages, game) {
  const { personality, memory, name, role } = botState;
  const targets = players.filter(p => p.id !== botState.playerId);

  if (targets.length === 0) return null;

  const prompt = buildVotingPrompt(botState, targets, recentMessages, game);

  const decision = await generateDecision(prompt, personality.style.temperature);

  if (decision?.target) {
    const targetPlayer = targets.find(
      p => p.name.toLowerCase() === decision.target.toLowerCase()
    );
    if (targetPlayer) return targetPlayer.id;
  }

  // Fallback: vote for most suspicious or random
  return fallbackVote(botState, targets);
}

async function decideVerdict(botState, accusedId, players, recentMessages, game) {
  const accused = players.find(p => p.id === accusedId);
  if (!accused) return 'ABSTAIN';

  const { personality, memory, role } = botState;

  // If the accused is a Mafia ally, vote innocent
  if (role.faction === 'MAFIA' && accused.faction === 'MAFIA') {
    return 'INNOCENT';
  }

  const prompt = buildVerdictPrompt(botState, accused, players, recentMessages, game);

  const decision = await generateDecision(prompt, personality.style.temperature);

  if (decision?.verdict) {
    const v = decision.verdict.toUpperCase();
    if (['GUILTY', 'INNOCENT', 'ABSTAIN'].includes(v)) return v;
  }

  // Fallback
  const suspicion = memory.suspicions[accused.name] || 5;
  if (suspicion >= 7) return 'GUILTY';
  if (suspicion <= 3) return 'INNOCENT';
  return Math.random() > 0.5 ? 'GUILTY' : 'ABSTAIN';
}

// ============================================
// PROMPT BUILDERS
// ============================================

function buildNightActionPrompt(botState, targets, deadPlayers, game) {
  const { role, personality, memory, name } = botState;

  const roleGoals = {
    SHERIFF_CHECK: 'Investigar si un jugador es sospechoso o inocente.',
    INVESTIGATOR_CHECK: 'Investigar el rol exacto de un jugador.',
    CONSIGLIERE_CHECK: 'Descubrir el rol exacto de un jugador para la Mafia.',
    LOOKOUT_WATCH: 'Observar quién visita a un jugador.',
    TRACKER_TRACK: 'Rastrear a quién visita un jugador.',
    SPY_BUG: 'Espiar las actividades de un jugador.',
    HEAL: 'Curar a un jugador para protegerlo de ataques.',
    PROTECT: 'Proteger a un jugador (mueres si lo atacan).',
    KILL_SINGLE: 'Asesinar a un jugador enemigo.',
    KILL_RAMPAGE: 'Atacar con furia a un jugador y sus visitantes.',
    ROLEBLOCK: 'Bloquear la acción nocturna de un jugador.',
    ALERT: 'Activar alerta para matar a tus visitantes.',
    DOUSE: 'Rociar gasolina a un jugador para quemarlo después.',
  };

  const goal = roleGoals[role.nightActionType] || 'Realizar tu acción nocturna.';

  return `
Eres "${name}", un jugador de Town of Salem.
Tu rol: ${role.roleNameEs} (${role.roleName})
Tu facción: ${role.faction}
Es la noche ${game.day}.

TU OBJETIVO NOCTURNO: ${goal}

JUGADORES VIVOS (posibles objetivos):
${targets.map(p => `- ${p.name} (pos #${p.position})${memory.suspicions[p.name] ? ` [sospecha: ${memory.suspicions[p.name]}/10]` : ''}`).join('\n')}

JUGADORES MUERTOS:
${deadPlayers.map(p => `- ${p.name} (${p.roleName || '?'}, ${p.faction || '?'})`).join('\n') || 'Ninguno'}

TU INFORMACIÓN PREVIA:
${memory.knownInfo.slice(-5).join('\n') || 'Ninguna'}

TU PERSONALIDAD: ${personality.description}

Responde SOLO en JSON:
{
  "target": "nombre_del_jugador",
  "reasoning": "explicación breve de por qué"
}

REGLAS:
- Elige al jugador MÁS ESTRATÉGICO según tu rol y facción.
- Si eres Mafia, NO ataques a otros Mafia.
- Si eres Town investigativo, investiga a los más sospechosos.
- Si eres Doctor/Protector, protege a quien creas que será atacado.
`;
}

function buildDayChatPrompt(botState, players, recentMessages, game) {
  const { role, personality, memory, name, mood } = botState;
  const alivePlayers = players.filter(p => p.alive);
  const deadPlayers = players.filter(p => !p.alive);

  // Get names of other alive players for mention context
  const otherPlayers = alivePlayers.filter(p => p.name !== name).map(p => p.name);

  return `
Eres "${name}" en Town of Salem. Tu rol SECRETO: ${role.roleNameEs} (${role.faction}).
Es el día ${game.day}. Fase: ${game.phase}.

PERSONALIDAD: ${personality.description}
- Agresividad: ${personality.traits.aggression}/10
- Verbosidad: ${personality.traits.verbosity}/10
- Deducción: ${personality.traits.deduction}/10
- Estrés: ${mood.stress}/10

JUGADORES VIVOS: ${alivePlayers.map(p => p.name).join(', ')}
JUGADORES MUERTOS: ${deadPlayers.map(p => `${p.name}(${p.roleName || '?'})`).join(', ') || 'Ninguno'}

CONVERSACIÓN RECIENTE (IMPORTANTE - Lee y responde a lo que otros dicen):
${recentMessages.length > 0 ? recentMessages.map(m => `${m.author}: ${m.content}`).join('\n') : '(nadie ha hablado aún)'}

TUS MENSAJES PREVIOS: ${memory.myMessages.slice(-3).join(' | ') || 'Ninguno'}
TU INFO SECRETA: ${memory.knownInfo.slice(-3).join('; ') || 'Ninguna'}

Responde SOLO en JSON:
{
  "message": "tu mensaje (max 280 chars, en español)",
  "reasoning": "por qué dices esto"
}

REGLAS - MUY IMPORTANTE:
- NO repitas mensajes anteriores. Di algo NUEVO y DIFERENTE cada vez.
- RESPONDE o MENCIONA a otros jugadores si dijeron algo relevante (ej: "Estoy de acuerdo con Carlos", "No ${otherPlayers[0] || 'nadie'}, tú eres más sospechoso")
- Contribuye a la conversación de forma natural, como si fueras un jugador real
- Si alguien te acusó o mencionó, RESPONDE DIRECTAMENTE
- Menciona nombres de jugadores específicos cuando sea estratégico
- NO reveles tu rol real (a menos que sea muy estratégico para Town)
- Sé natural y coherente con tu personalidad
- ${personality.style.typos ? 'Puedes meter algún typo para parecer humano' : 'Escribe correctamente'}
- Si eres Mafia, miente y desvía sospechas hacia Town
- Máximo 280 caracteres en el mensaje
- NO uses emojis en tus mensajes (solo texto)
`;
}

function buildVotingPrompt(botState, targets, recentMessages, game) {
  const { role, personality, memory, name } = botState;

  return `
Eres "${name}" en Town of Salem. Tu rol: ${role.roleNameEs} (${role.faction}).
Es la fase de VOTACIÓN del día ${game.day}.

JUGADORES VIVOS (puedes nominar):
${targets.map(p => `- ${p.name}${memory.suspicions[p.name] ? ` [sospecha: ${memory.suspicions[p.name]}/10]` : ''}`).join('\n')}

ÚLTIMOS MENSAJES:
${recentMessages.slice(-8).map(m => `${m.author}: ${m.content}`).join('\n')}

TU INFO: ${memory.knownInfo.slice(-3).join('; ') || 'Ninguna'}
PERSONALIDAD: ${personality.description}

Responde SOLO en JSON:
{
  "target": "nombre_del_jugador_a_nominar",
  "reasoning": "por qué votas por este jugador"
}

REGLAS:
- Si eres Town, vota al más sospechoso de ser Mafia/evil.
- Si eres Mafia, vota a un Town para eliminarlo. NO votes a otro Mafia.
- Si eres Neutral, vota según tu objetivo personal.
- NO votes por ti mismo.
`;
}

function buildVerdictPrompt(botState, accused, players, recentMessages, game) {
  const { role, personality, memory, name } = botState;

  return `
Eres "${name}" en Town of Salem. Tu rol: ${role.roleNameEs} (${role.faction}).
${accused.name} está en JUICIO.

ACUSADO: ${accused.name}
TUS SOSPECHAS de este jugador: ${memory.suspicions[accused.name] || 5}/10

ÚLTIMOS MENSAJES (incluida defensa):
${recentMessages.slice(-5).map(m => `${m.author}: ${m.content}`).join('\n')}

PERSONALIDAD: ${personality.description}

Responde SOLO en JSON:
{
  "verdict": "GUILTY" o "INNOCENT" o "ABSTAIN",
  "reasoning": "por qué"
}

REGLAS:
- Si eres Town, vota GUILTY si crees que es evil.
- Si eres Mafia, vota INNOCENT si es Mafia, GUILTY si es Town peligroso.
- ABSTAIN si no tienes info suficiente.
`;
}

function buildDefensePrompt(botState, players, recentMessages, game) {
  const { role, personality, memory, name, mood } = botState;
  const alivePlayers = players.filter(p => p.alive);

  const fakeClaim = role.faction === 'MAFIA'
    ? (memory.myFakeClaim || 'Sheriff')
    : role.roleNameEs;

  return `
Eres "${name}" en Town of Salem. Tu rol SECRETO: ${role.roleNameEs} (${role.faction}).
¡ESTÁS EN JUICIO! Debes defenderte para sobrevivir.

JUGADORES VIVOS: ${alivePlayers.map(p => p.name).join(', ')}

ÚLTIMOS MENSAJES (acusaciones contra ti):
${recentMessages.slice(-5).map(m => `${m.author}: ${m.content}`).join('\n')}

PERSONALIDAD: ${personality.description}
ESTRÉS: ${mood.stress}/10

${role.faction === 'MAFIA'
  ? `IMPORTANTE: Eres Mafia. MIENTE. Reclama ser "${fakeClaim}". Desvía sospechas a otro jugador.`
  : `Eres ${role.roleNameEs} (Town). Defiéndete revelando info útil si es necesario.`}

Responde SOLO en JSON:
{
  "message": "tu defensa (max 280 chars, en español, convincente y emotiva)",
  "reasoning": "estrategia interna"
}

REGLAS:
- Sé convincente, tu vida depende de ello.
- NO admitas ser Mafia si lo eres.
- Puedes acusar a otro jugador para desviar atención.
- Máximo 280 caracteres.
`;
}

// ============================================
// FALLBACK DECISIONS (no AI)
// ============================================

function fallbackNightAction(botState, targets) {
  const { role, memory } = botState;
  const faction = role.faction;

  // Sort targets by suspicion
  const sorted = [...targets].sort((a, b) => {
    const sa = memory.suspicions[a.name] || 5;
    const sb = memory.suspicions[b.name] || 5;
    return sb - sa;
  });

  switch (role.nightActionType) {
    case 'KILL_SINGLE':
    case 'KILL_RAMPAGE':
      // Kill most suspicious for NK, or non-Mafia for Mafia
      if (faction === 'MAFIA') {
        const nonMafia = sorted.filter(p => p.faction !== 'MAFIA');
        return nonMafia.length > 0 ? nonMafia[0].id : sorted[0]?.id;
      }
      return sorted[0]?.id;

    case 'HEAL':
    case 'PROTECT':
      // Protect random Town or least suspicious
      const leastSus = [...targets].sort((a, b) => {
        const sa = memory.suspicions[a.name] || 5;
        const sb = memory.suspicions[b.name] || 5;
        return sa - sb;
      });
      return leastSus[0]?.id;

    case 'SHERIFF_CHECK':
    case 'INVESTIGATOR_CHECK':
    case 'CONSIGLIERE_CHECK':
    case 'LOOKOUT_WATCH':
    case 'TRACKER_TRACK':
    case 'SPY_BUG':
      // Investigate most suspicious
      return sorted[0]?.id;

    case 'ROLEBLOCK':
      // Roleblock most suspicious
      return sorted[0]?.id;

    default:
      // Random target
      return targets[Math.floor(Math.random() * targets.length)]?.id;
  }
}

function fallbackDayMessage(botState, players, game) {
  const { personality, memory } = botState;
  const templates = personality.style.phraseTemplates;
  const alivePlayers = players.filter(p => p.alive && p.id !== botState.playerId);

  if (alivePlayers.length === 0) return null;

  const randomPlayer = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
  let template = templates[Math.floor(Math.random() * templates.length)];

  // Replace placeholders
  template = template.replace('{player}', randomPlayer.name);
  template = template.replace('{day}', String(game.day));

  // Replace {info} with actual known info or generic text
  if (template.includes('{info}')) {
    const knownInfo = botState.memory.knownInfo.slice(-1)[0];
    template = template.replace('{info}', knownInfo || 'nada concreto aún');
  }

  return template;
}

function fallbackVote(botState, targets) {
  const { memory, role } = botState;

  // Sort by suspicion, vote for most suspicious
  const sorted = [...targets].sort((a, b) => {
    const sa = memory.suspicions[a.name] || 5;
    const sb = memory.suspicions[b.name] || 5;
    return sb - sa;
  });

  // Don't vote for Mafia allies
  if (role.faction === 'MAFIA') {
    const nonMafia = sorted.filter(p => p.faction !== 'MAFIA');
    if (nonMafia.length > 0) return nonMafia[0].id;
  }

  return sorted[0]?.id || targets[0]?.id;
}

// ============================================
// STYLE APPLICATION
// ============================================

function applyPersonalityStyle(message, personality) {
  let result = message;

  // Typos (10% chance of adding one)
  if (personality.style.typos && Math.random() < 0.1) {
    result = addRandomTypo(result);
  }

  // Emoji (20% chance of adding one)
  if (Math.random() < 0.2 && personality.style.emojis.length > 0) {
    const emoji = personality.style.emojis[
      Math.floor(Math.random() * personality.style.emojis.length)
    ];
    if (!result.includes(emoji)) {
      result = result + ' ' + emoji;
    }
  }

  return result;
}

function addRandomTypo(text) {
  if (text.length < 5) return text;
  const pos = Math.floor(Math.random() * (text.length - 2)) + 1;
  const typoTypes = ['swap', 'double', 'skip'];
  const type = typoTypes[Math.floor(Math.random() * typoTypes.length)];

  switch (type) {
    case 'swap':
      return text.slice(0, pos) + text[pos + 1] + text[pos] + text.slice(pos + 2);
    case 'double':
      return text.slice(0, pos) + text[pos] + text[pos] + text.slice(pos + 1);
    case 'skip':
      return text.slice(0, pos) + text.slice(pos + 1);
    default:
      return text;
  }
}

// ============================================
// ACTION EXECUTION
// ============================================

async function executeNightAction(gameId, playerId, targetId, io, gameCode) {
  const { submitNightAction } = await import('../gameEngine.js');
  const result = await submitNightAction(gameId, playerId, targetId, io, gameCode);
  if (result) {
    console.log(`🤖 Bot night action: ${result.actionType} → target`);
  }
}

async function sendBotMessage(gameId, gameCode, playerId, botName, content, channel, io) {
  const message = {
    id: `bot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    author: {
      id: playerId,
      name: botName,
      position: 0,
    },
    content,
    timestamp: new Date(),
    channel,
    isSystem: false,
    isBot: true,
  };

  // Get bot position
  const player = await prisma.gamePlayer.findUnique({ where: { id: playerId } });
  if (player) {
    message.author.position = player.position;
  }

  // Emit to appropriate room
  if (channel === 'MAFIA') {
    io.to(`${gameCode}:mafia`).emit('chat:message', message);
  } else if (channel === 'DEAD') {
    io.to(`${gameCode}:dead`).emit('chat:message', message);
  } else {
    io.to(gameCode).emit('chat:message', message);
  }

  // Save to game events for history
  await prisma.gameEvent.create({
    data: {
      gameId,
      type: 'BOT_CHAT',
      data: { botId: playerId, botName, content, channel },
      day: (await prisma.game.findUnique({ where: { id: gameId } }))?.day || 1,
      phase: 'DAY',
    },
  });
}

// ============================================
// HELPERS
// ============================================

async function getRecentMessages(gameId, count = 10) {
  const events = await prisma.gameEvent.findMany({
    where: {
      gameId,
      type: { in: ['CHAT_MESSAGE', 'BOT_CHAT'] },
    },
    orderBy: { timestamp: 'desc' },
    take: count,
  });

  return events
    .reverse()
    .map(e => ({
      author: e.data?.playerName || e.data?.botName || 'Sistema',
      content: e.data?.content || e.data?.message || '',
    }));
}

/**
 * Update bot suspicions based on investigation results
 */
export function updateBotSuspicion(gameCode, botPlayerId, targetName, suspicionDelta, info) {
  const bots = getGameBots(gameCode);
  const botState = bots.get(botPlayerId);
  if (!botState) return;

  const current = botState.memory.suspicions[targetName] || 5;
  botState.memory.suspicions[targetName] = Math.max(0, Math.min(10, current + suspicionDelta));

  if (info) {
    botState.memory.knownInfo.push(info);
  }
}
