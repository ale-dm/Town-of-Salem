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
      strategyTips: assignment.strategyTips || [],
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

  // Check if Godfather is alive (Mafioso defers to Godfather)
  const godfatherAlive = alivePlayers.some(
    p => p.roleName?.toLowerCase() === 'godfather'
  );

  console.log(`🌙 Night ${game.day}: ${bots.size} bots, ${alivePlayers.length} alive players`);

  for (const [botId, botState] of bots.entries()) {
    const botPlayer = players.find(p => p.id === botId);
    if (!botPlayer || !botPlayer.alive) {
      console.log(`  ⏭️  ${botState.name} - ${!botPlayer ? 'not found' : 'dead'}`);
      continue;
    }

    const actionType = botState.role.nightActionType;
    if (!actionType || actionType === 'NONE' || actionType === 'AUTOMATIC') {
      console.log(`  ⏭️  ${botState.name} (${botState.role.roleName}) - no night action (${actionType || 'undefined'})`);
      continue;
    }

    // Mafioso doesn't pick targets if Godfather is alive (GF delegates the kill)
    const isMafioso = botState.role.roleName?.toLowerCase() === 'mafioso';
    if (isMafioso && godfatherAlive) {
      console.log(`  ⏭️  ${botState.name} (Mafioso) - defers to Godfather`);
      continue;
    }

    console.log(`  🎯 ${botState.name} (${botState.role.roleName}) - ${actionType}`);

    // Delay to simulate thinking (2-8 seconds)
    const delay = 2000 + Math.random() * 6000;
    setTimeout(async () => {
      try {
        const targetResult = await decideNightAction(botState, alivePlayers, deadPlayers, game);
        if (targetResult) {
          console.log(`    ✅ ${botState.name} selected target(s)`);
          
          // Handle dual-target roles (Transporter)
          if (typeof targetResult === 'object' && targetResult.targetId) {
            await executeNightAction(gameId, botId, targetResult.targetId, io, gameCode, targetResult.target2Id);
          } else {
            // Single target
            await executeNightAction(gameId, botId, targetResult, io, gameCode);
          }
        } else {
          console.log(`    ⚠️  ${botState.name} failed to select target`);
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
    if (!game || (game.phase !== 'DAY' && game.phase !== 'DISCUSSION')) {
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
  let targets = alivePlayers.filter(p => p.id !== botState.playerId);

  // Mafia killers should never target other Mafia members
  const isKillAction = ['KILL_SINGLE', 'KILL_RAMPAGE'].includes(role.nightActionType);
  if (isKillAction && role.faction === 'MAFIA') {
    targets = targets.filter(p => p.faction !== 'MAFIA');
  }

  if (targets.length === 0) {
    console.log(`    ⚠️  ${name}: No valid targets`);
    return null;
  }

  // Try Gemini first if available
  try {
    const prompt = buildNightActionPrompt(botState, targets, deadPlayers, game);
    const decision = await generateDecision(prompt, personality.style.temperature);

    if (decision?.target) {
      // Handle dual-target roles (Transporter, Witch)
      if ((role.nightActionType === 'TRANSPORT' || role.nightActionType === 'CONTROL') && decision.target2) {
        const targetPlayer1 = targets.find(
          p => p.name.toLowerCase() === decision.target.toLowerCase()
        );
        const targetPlayer2 = targets.find(
          p => p.name.toLowerCase() === decision.target2.toLowerCase()
        );
        
        if (targetPlayer1 && targetPlayer2 && targetPlayer1.id !== targetPlayer2.id) {
          // Update suspicions from reasoning
          if (decision.reasoning) {
            memory.knownInfo.push(`Noche ${game.day}: ${decision.reasoning}`);
          }
          console.log(`    🎯 ${name}: Gemini selected ${targetPlayer1.name} & ${targetPlayer2.name}`);
          return { targetId: targetPlayer1.id, target2Id: targetPlayer2.id };
        }
      }
      
      // Single target roles
      const targetPlayer = targets.find(
        p => p.name.toLowerCase() === decision.target.toLowerCase()
      );
      if (targetPlayer) {
        // Update suspicions from reasoning
        if (decision.reasoning) {
          memory.knownInfo.push(`Noche ${game.day}: ${decision.reasoning}`);
        }
        console.log(`    🎯 ${name}: Gemini selected ${targetPlayer.name}`);
        return targetPlayer.id;
      }
    }
  } catch (error) {
    console.log(`    ⚠️  ${name}: Gemini error - ${error.message}`);
  }

  // Fallback: pick based on role
  console.log(`    🎲 ${name}: Using fallback logic`);
  const fallbackResult = fallbackNightAction(botState, targets);
  
  // Handle dual-target roles (Transporter, Witch)
  if (fallbackResult && typeof fallbackResult === 'object' && fallbackResult.targetId) {
    return fallbackResult; // Returns {targetId, target2Id}
  }
  
  return fallbackResult; // Returns single targetId or null
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

  // Fallback to generic messages when Gemini unavailable
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

/**
 * Filter strategy tips relevant to current phase and day
 */
function getRelevantStrategyTips(strategyTips, phase, currentDay) {
  if (!Array.isArray(strategyTips) || strategyTips.length === 0) {
    return [];
  }

  return strategyTips.filter(tip => {
    // Check if tip applies to current phase (or GENERAL)
    if (tip.phase !== phase && tip.phase !== 'GENERAL') {
      return false;
    }

    // Check if current day is within dayRange
    const [minDay, maxDay] = tip.dayRange || [1, 99];
    if (currentDay < minDay || currentDay > maxDay) {
      return false;
    }

    return true;
  }).slice(0, 3); // Limit to 3 most relevant tips
}

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
    DOUSE: 'Rociar gasolina a un jugador para quemarlo después, o Encender a todos los rociados.',
    CLEAN: 'Limpiar el cuerpo del target que la Mafia mata esta noche (oculta su rol y testamento).',
    TRANSPORT: 'Intercambiar dos jugadores - TODAS las visitas se redirigen entre ellos.',
    CONTROL: 'Controlar a un jugador para forzarlo a usar su habilidad en un nuevo objetivo.',
  };

  const goal = roleGoals[role.nightActionType] || 'Realizar tu acción nocturna.';

  // Strategic hints based on role
  let strategyHint = '';
  if (role.faction === 'MAFIA' && ['KILL_SINGLE', 'KILL_RAMPAGE'].includes(role.nightActionType)) {
    strategyHint = `\n\nESTRATEGIA MAFIA (MUY IMPORTANTE):
- DEBES atacar a jugadores Town/Neutral, NUNCA a Mafia
- Prioriza roles poderosos: Jailor, Doctor, Sheriff, Investigator, Escort
- Evita jugadores en posiciones bajas que probablemente sean VT (Vanilla Town)
- Si alguien se reveló Jailor/Mayor, es objetivo PRIORITARIO
- Considera quién ha estado muy activo o ha dado mucha información
- Si hay jugadores silenciosos, probablemente sean neutrales o menos peligrosos
- Varía tus objetivos entre días para no ser predecible`;
  } else if (role.faction === 'TOWN' && role.nightActionType === 'SHERIFF_CHECK') {
    strategyHint = `\n\nESTRATEGIA SHERIFF:
- Investiga a jugadores que hayan estado agresivos o poco cooperativos
- Prioriza jugadores que otros han mencionado como sospechosos
- Evita revisar a quien ya sabes que es Town (por claims verificados)
- Investiga a jugadores silenciosos que no han dado información`;
  } else if (role.faction === 'TOWN' && role.nightActionType === 'HEAL') {
    strategyHint = `\n\nESTRATEGIA DOCTOR:
- Protege a jugadores que han revelado roles importantes (Jailor, Mayor, Sheriff)
- Protege a quien pienses que la Mafia querrá eliminar
- Varía tus objetivos para no ser predecible
- Si alguien ha dado mucha información útil, protégelo`;
  } else if (role.nightActionType === 'ROLEBLOCK') {
    strategyHint = `\n\nESTRATEGIA ESCORT:
- Bloquea a jugadores sospechosos de ser Mafia Killing
- Si alguien actuó agresivo de día, bloquéalo de noche
- CUIDADO: Si bloqueas Serial Killer, te matará`;
  } else if (role.nightActionType === 'CLEAN') {
    strategyHint = `\n\nESTRATEGIA JANITOR (CRÍTICO):
- Solo tienes 3 usos - úsalos sabiamente
- DEBES elegir al MISMO target que la Mafia matará esta noche
- Prioriza limpiar roles investigativos confirmados (Sheriff, Lookout, Spy, Investigator)
- Limpia también Jailor, Doctor, Escort - roles poderosos del Town
- Si alguien reveló su rol importantes, es objetivo PRIORITARIO para limpiar
- NO desperdicies usos en roles poco importantes (VT, Medium)
- Coordina mentalmente con quien la Mafia probablemente ataque
- Si quedan pocos usos, guárdalos para roles MUY importantes
- La limpieza SOLO funciona si el target muere esa noche - si no muere, pierdes el uso`;
  } else if (role.nightActionType === 'TRANSPORT') {
    strategyHint = `\n\nESTRATEGIA TRANSPORTER (CRITICO):
- DEBES elegir DOS jugadores - se intercambiaran todas las visitas entre ellos
- ESTRATEGIA PRINCIPAL: Proteger a Town importantes transportandolos con sospechosos
- Si hay un Jailor/Mayor/Sheriff confirmado, transportalo con un sospechoso para salvar su vida
- Los killers que intenten matar al Town importante mataran al sospechoso en su lugar
- CUIDADO: Tambien redirige heals y protecciones - puedes causar que Town mate Town
- NO transportes al azar - siempre ten un objetivo claro (proteger alguien o confundir evils)
- Util contra Mafia: Si sospechas quien mataran, transportalo con un evil
- Util de dia: Puedes confundir investigadores haciendo que visiten al jugador equivocado
- Evita transportar demasiado temprano (dia 1-2) - espera a tener informacion
- NO puedes transportarte a ti mismo ni transportar personas en la carcel
- Coordina mentalmente: Si hay Doctor, no transportes a quien probablemente curen
- Late game: Transporta confirmed Town con el ultimo sospechoso para ganar`;
  } else if (role.nightActionType === 'CONTROL') {
    strategyHint = `\n\nESTRATEGIA WITCH (CRITICO):
- DEBES elegir DOS jugadores: (1) quien controlar, (2) nuevo objetivo para su accion
- Tu OBJETIVO: Sobrevivir hasta que el Town pierda - NO ganas con Mafia/NK, solo cuando Town pierde
- ESTRATEGIA PRINCIPAL: Controlar roles poderosos para causar caos y debilitar al Town
- Prioriza controlar KILLERS (Vigilante, Mafia, SK, Veteran) para eliminar Town
- Tambien util: controlar investigadores para hacerlos investigar a aliados (waste action)
- Controla Jailor para ejecutar Town confirmados o hacerlo desperdiciar ejecucion
- NO puedes forzar a nadie a visitarte (proteccion anti-witch)
- VERAS el rol del jugador que controles (sin importar si es inmune)
- CUIDADO: Si controlas Veterano en alerta, MUERES
- Transporter y algunos roles son control immune - no los puedes redirigir pero ves su rol
- CLAIM TIPS: Puedes claim Spy (ves visitas) o Lookout (ves quien visita)
- No te reveles muy temprano - eres fragil (solo Basic defense)
- Late game: Controla al ultimo killer para eliminar Town y ganar
- Puedes controlar Mafia para matar otros evils - no eres Mafia, solo quieres que Town pierda`;
  } else if (role.nightActionType === 'DOUSE') {
    // Check roleState for doused count
    const arsonistState = role.roleState || {};
    const dousedCount = (arsonistState.dousedPlayers || []).length;
    
    strategyHint = `\n\nESTRATEGIA ARSONIST (CRITICO):
- Tienes DOS acciones: DOUSE (rociar con gasolina) o IGNITE (quemar a TODOS los rociados)
- ESTADO ACTUAL: Tienes ${dousedCount} jugador(es) rociado(s) con gasolina
- ESTRATEGIA PRINCIPAL: Dousear multiples targets antes de ignitar para maximizar muertes
- TIMING OPTIMO: Ignita cuando tengas 3-5+ jugadores doused
- El douse es SILENCIOSO - nadie sabe que fue doused hasta que enciendes
- IGNITE mata con ataque Unstoppable (atraviesa TODA defensa, incluso Jailor/Doctor)
- Si eres roleblocked mientras douseas, DOUSEAS AL ROLEBLOCKER automaticamente
- Tienes Basic defense - puedes sobrevivir algunos ataques
- Sheriff te ve "Not Suspicious" (Detection Immune)
- WIN CONDITION: Debes ser el ULTIMO VIVO (mata a todos)
- CLAIM TIPS: Puedes claim Bodyguard, Godfather si Sheriff te chequea
- NO dousees al azar - prioriza roles activos/poderosos primero
- Late game: Ignita cuando quedan pocos vivos para asegurar multi-kill
- Puedes dousear a ti mismo si quieres (estrategia suicida vs otros NK)
- DECISION: Si tienes ${dousedCount >= 3 ? 'SUFICIENTES doused, considera IGNITAR' : 'POCOS doused, sigue DOUSEANDO'}`;
  }

  // Context about recent deaths
  const recentDeaths = deadPlayers.slice(-2);
  let deathContext = '';
  if (recentDeaths.length > 0) {
    deathContext = `\n\nMUERTES RECIENTES (analiza patrones):\n${recentDeaths.map(p => `- ${p.name} era ${p.roleName || '?'} (${p.faction || '?'})`).join('\n')}`;
  }

  // Get relevant strategy tips for this phase and day
  const relevantTips = getRelevantStrategyTips(role.strategyTips, 'NIGHT', game.day);
  let strategySection = '';
  if (relevantTips.length > 0) {
    strategySection = `\n\nESTRATEGIAS EXPERTAS PARA TU ROL (${role.roleNameEs}):\n${relevantTips.map(t => `- ${t.tip}`).join('\n')}`;
  }

  return `
Eres "${name}", un jugador experimentado de Town of Salem.
Tu rol: ${role.roleNameEs} (${role.roleName})
Tu facción: ${role.faction}
Noche ${game.day}.

TU OBJETIVO NOCTURNO: ${goal}${strategyHint}${strategySection}${deathContext}

JUGADORES VIVOS (analiza estratégicamente):
${role.nightActionType === 'TRANSPORT' ? `Responde SOLO en JSON válido:
{
  "target": "nombre_exacto_del_primer_jugador",
  "target2": "nombre_exacto_del_segundo_jugador",
  "reasoning": "explicación estratégica de tu decisión"
}

IMPORTANTE: Como Transporter, DEBES elegir DOS jugadores diferentes (target y target2).` : `Responde SOLO en JSON válido:
{
  "target": "nombre_exacto_del_jugador",
  "reasoning": "explicación estratégica de tu decisión"
}`}).join('\n')}

JUGADORES MUERTOS:
${deadPlayers.map(p => `- ${p.name} era ${p.roleName || '?'} (${p.faction || '?'})`).join('\n') || 'Ninguno aún'}

TU INFORMACIÓN ACUMULADA:
${memory.knownInfo.slice(-5).join('\n') || 'Ninguna información específica aún'}

TU PERSONALIDAD: ${personality.description}

Responde SOLO en JSON válido:
{
  "target": "nombre_exacto_del_jugador",
  "reasoning": "explicación estratégica de tu decisión"
}

REGLAS CRÍTICAS:
- Si eres MAFIA con KILL: Ataca a Town poderosos, JAMÁS a Mafia
- Si eres TOWN investigativo: Investiga a los MÁS sospechosos o activos
- Si eres DOCTOR/BODYGUARD: Protege a roles revelados importantes o líderes
- Si eres ESCORT: Bloquea a sospechosos de ser killers
- NO elijas al azar - PIENSA ESTRATÉGICAMENTE según tu rol
- Considera quién ha hablado mucho vs quién ha estado silencioso
- El "target" debe ser EXACTAMENTE uno de los nombres de la lista
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

  // Analyze who spoke and what they said
  const activeSpeakers = new Set();
  const accusations = [];
  recentMessages.slice(-10).forEach(msg => {
    activeSpeakers.add(msg.author);
    if (msg.content.toLowerCase().includes('sospecho') || 
        msg.content.toLowerCase().includes('voto') ||
        msg.content.toLowerCase().includes('creo que')) {
      accusations.push(`${msg.author}: "${msg.content}"`);
    }
  });

  let strategyContext = '';
  if (role.faction === 'MAFIA') {
    strategyContext = `\n\nESTRATEGIA MAFIA:\n- OBJETIVO: Eliminar Town poderosos sin exponerte\n- Vota a jugadores Town que parezcan importantes o han dado información\n- EVITA votar a otros Mafia (${targets.filter(t => t.faction === 'MAFIA').map(t => t.name).join(', ')})\n- Únete a votaciones populares para no destacar\n- Si te acusaron, vota a quien te acusó para crear confusión\n- Prioriza jugadores callados sobre los muy activos (menos riesgo)`;
  } else if (role.faction === 'TOWN') {
    strategyContext = `\n\nESTRATEGIA TOWN:\n- OBJETIVO: Encontrar y linchar Mafia/Neutrals malignos\n- Vota a quien haya estado callado o evasivo\n- Vota a quien defienda a jugadores sospechosos\n- Considera votar a quien otros acusaron con buenas razones\n- Si eres rol investigativo y sabes info, úsala estratégicamente`;
  } else {
    strategyContext = `\n\nESTRATEGIA NEUTRAL:\n- Vota según tu objetivo personal\n- Si eres Jester, intenta que te linchen sin ser obvio\n- Si eres Executioner, vota a tu target o ayuda a crear caos\n- Si eres Serial Killer, elimina amenazas Town`;
  }

  const conversationContext = accusations.length > 0 
    ? `\n\nACUSACIONES RECIENTES:\n${accusations.slice(-5).join('\n')}`
    : '\n\nNo hubo acusaciones específicas en la conversación.';

  return `
Eres "${name}" en Town of Salem. Tu rol SECRETO: ${role.roleNameEs} (${role.faction}).
Fase de VOTACIÓN - Día ${game.day}. Debes elegir a QUIÉN NOMINAR para juicio.${strategyContext}

JUGADORES DISPONIBLES PARA NOMINAR:
${targets.map(p => {
  const suspicion = memory.suspicions[p.name] || 5;
  const claim = memory.roleClaims[p.name];
  const isMafiaAlly = role.faction === 'MAFIA' && p.faction === 'MAFIA';
  const wasActive = activeSpeakers.has(p.name);
  return `- ${p.name} (pos #${p.position})${isMafiaAlly ? ' [ALIADO MAFIA - NO VOTAR]' : ''} [sospecha: ${suspicion}/10]${claim ? ` [claim: ${claim}]` : ''}${wasActive ? ' [habló activamente]' : ' [silencioso]'}`;
}).join('\n')}${conversationContext}

TU INFO SECRETA: ${memory.knownInfo.slice(-3).join('; ') || 'Ninguna aún'}
PERSONALIDAD: ${personality.description}

Responde SOLO en JSON válido:
{
  "target": "nombre_exacto_del_jugador",
  "reasoning": "razón estratégica sólida (max 100 chars)"
}

REGLAS CRÍTICAS:
- NO votes al azar - piensa estratégicamente según tu facción
- Si eres MAFIA: NO votes a otros Mafia, vota a Town importantes
- Si eres TOWN: Vota a los MÁS sospechosos o silenciosos
- Considera quién ha acusado a quién
- NO votes por ti mismo (${name})
- Varía tus objetivos - NO siempre al jugador #1
- El "target" debe ser EXACTAMENTE uno de los nombres listados
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

  // Initialize suspicions for players without them (start with neutral 5)
  targets.forEach(t => {
    if (!(t.name in memory.suspicions)) {
      // Randomize initial suspicion slightly (4-6) to avoid always picking player 1
      memory.suspicions[t.name] = 4 + Math.random() * 2;
    }
  });

  // Sort targets by suspicion (descending for most suspicious)
  const sorted = [...targets].sort((a, b) => {
    const sa = memory.suspicions[a.name] || 5;
    const sb = memory.suspicions[b.name] || 5;
    return sb - sa;
  });

  let chosenTarget = null;

  switch (role.nightActionType) {
    case 'KILL_SINGLE':
    case 'KILL_RAMPAGE':
      // Kill most suspicious for NK, or strategic Town target for Mafia
      if (faction === 'MAFIA') {
        const nonMafia = sorted.filter(p => p.faction !== 'MAFIA');
        if (nonMafia.length === 0) {
          console.log(`    ⚠️  ${botState.name}: No non-Mafia targets found`);
          return null;
        }
        
        // Prioritize middle positions (avoid pos 1 which might be important)
        // Pick from top 3 most suspicious non-Mafia
        const topTargets = nonMafia.slice(0, Math.min(3, nonMafia.length));
        chosenTarget = topTargets[Math.floor(Math.random() * topTargets.length)];
        
        console.log(`🤖 ${botState.name} (Mafia) targeting ${chosenTarget.name} for kill (fallback)`);
      } else {
        // Non-Mafia killers target most suspicious
        chosenTarget = sorted[0];
        console.log(`🤖 ${botState.name} (NK) targeting ${chosenTarget.name} for kill (fallback)`);
      }
      break;

    case 'HEAL':
    case 'PROTECT':
      // Protect least suspicious (likely Town ally) or random from middle
      const leastSus = [...targets].sort((a, b) => {
        const sa = memory.suspicions[a.name] || 5;
        const sb = memory.suspicions[b.name] || 5;
        return sa - sb;
      });
      // Pick from least suspicious 3
      const protectTargets = leastSus.slice(0, Math.min(3, leastSus.length));
      chosenTarget = protectTargets[Math.floor(Math.random() * protectTargets.length)];
      console.log(`🤖 ${botState.name} protecting ${chosenTarget?.name} (fallback)`);
      break;

    case 'SHERIFF_CHECK':
    case 'INVESTIGATOR_CHECK':
    case 'CONSIGLIERE_CHECK':
    case 'LOOKOUT_WATCH':
    case 'TRACKER_TRACK':
    case 'SPY_BUG':
      // Investigate most suspicious (top 3)
      const investigateTargets = sorted.slice(0, Math.min(3, sorted.length));
      chosenTarget = investigateTargets[Math.floor(Math.random() * investigateTargets.length)];
      console.log(`🤖 ${botState.name} investigating ${chosenTarget?.name} (fallback)`);
      break;

    case 'ROLEBLOCK':
      // Roleblock most suspicious (likely killer)
      chosenTarget = sorted[0];
      console.log(`🤖 ${botState.name} roleblocking ${chosenTarget?.name} (fallback)`);
      break;

    case 'DOUSE':
      // Arsonist: Douse players to build up for ignite
      // Strategy: Douse multiple targets before igniting (maximize kills)
      const arsonistState = role.roleState || {};
      const dousedPlayers = arsonistState.dousedPlayers || [];
      
      // If we have doused 3+ players, consider igniting (50% chance)
      if (dousedPlayers.length >= 3 && Math.random() > 0.5) {
        console.log(`🤖 ${botState.name} (Arsonist) deciding to IGNITE ${dousedPlayers.length} doused (fallback)`);
        return null; // Need to handle IGNITE action differently
      }
      
      // Continue dousing - prioritize active/powerful players
      const notDoused = targets.filter(t => !dousedPlayers.includes(t.id));
      if (notDoused.length > 0) {
        // Douse most active/suspicious (likely Town power roles)
        const douseTarget = notDoused[Math.floor(Math.random() * Math.min(3, notDoused.length))];
        console.log(`🤖 ${botState.name} (Arsonist) dousing ${douseTarget?.name} (${dousedPlayers.length + 1} total) (fallback)`);
        chosenTarget = douseTarget;
      } else {
        // All targets doused, time to ignite
        console.log(`🤖 ${botState.name} (Arsonist) all doused, should IGNITE (fallback)`);
        return null; // IGNITE
      }
      break;

    case 'CLEAN':
      // Janitor: Clean the Mafia kill target
      // Strategy: Clean investigative roles or confirmed Town roles to hide info
      if (faction === 'MAFIA') {
        // Prioritize targets that are likely to die tonight (coordinated with Mafia kill)
        // In fallback, we can't know exactly who Mafia will kill, so pick strategic targets
        const nonMafia = sorted.filter(p => p.faction !== 'MAFIA');
        
        // Prioritize cleaning suspected Town roles (higher suspicion = less likely Town, so inverse)
        const likelyTown = [...nonMafia].sort((a, b) => {
          const sa = memory.suspicions[a.name] || 5;
          const sb = memory.suspicions[b.name] || 5;
          return sa - sb; // Lower suspicion first (more likely Town)
        });
        
        // Pick from top 3 most likely Town members
        const cleanTargets = likelyTown.slice(0, Math.min(3, likelyTown.length));
        chosenTarget = cleanTargets[Math.floor(Math.random() * cleanTargets.length)];
        console.log(`🤖 ${botState.name} (Janitor) planning to clean ${chosenTarget?.name} (fallback)`);
      } else {
        chosenTarget = sorted[Math.floor(Math.random() * sorted.length)];
        console.log(`🤖 ${botState.name} targeting ${chosenTarget?.name} for CLEAN (fallback)`);
      }
      break;

    case 'TRANSPORT':
      // Transporter: Swap two targets to protect Town and confuse evils
      // Strategy: Transport a suspected Town with a suspected evil to redirect kills
      if (targets.length >= 2) {
        const faction = botState.faction || role.faction;
        
        // Strategy 1: Protect likely Town member by swapping with suspected evil
        const likelyTown = [...targets].sort((a, b) => {
          const sa = memory.suspicions[a.name] || 5;
          const sb = memory.suspicions[b.name] || 5;
          return sa - sb; // Lower suspicion = more likely Town
        });
        
        const likelyEvil = [...targets].sort((a, b) => {
          const sa = memory.suspicions[a.name] || 5;
          const sb = memory.suspicions[b.name] || 5;
          return sb - sa; // Higher suspicion = more likely evil
        });
        
        // Pick from top 3 likely Town
        const townTargets = likelyTown.slice(0, Math.min(3, likelyTown.length));
        const target1 = townTargets[Math.floor(Math.random() * townTargets.length)];
        
        // Pick from top 3 likely evil (must be different from target1)
        const evilTargets = likelyEvil.filter(t => t.id !== target1.id).slice(0, Math.min(3, likelyEvil.length));
        const target2 = evilTargets[Math.floor(Math.random() * evilTargets.length)];
        
        if (target1 && target2) {
          console.log(`🤖 ${botState.name} (Transporter) swapping ${target1.name} with ${target2.name} (fallback)`);
          return { targetId: target1.id, target2Id: target2.id };
        }
      }
      // If can't find 2 targets, pick 2 random
      if (targets.length >= 2) {
        const shuffled = [...targets].sort(() => Math.random() - 0.5);
        console.log(`🤖 ${botState.name} (Transporter) swapping ${shuffled[0].name} with ${shuffled[1].name} (random)`);
        return { targetId: shuffled[0].id, target2Id: shuffled[1].id };
      }
      break;

    case 'CONTROL':
      // Witch: Control a player to use their ability on a new target
      // Strategy: Control killers/investigatives to benefit the Witch (disrupt Town)
      if (targets.length >= 2) {
        // Identify suspected killers or powerful roles (high activity, confirmed claims)
        const suspectedPowerRoles = [...targets].filter(p => {
          const claim = memory.roleClaims[p.name];
          // Look for killer claims or very active players
          const isKillerClaim = claim && (claim.includes('Vigilante') || claim.includes('Veteran') || claim.includes('Jailor'));
          const isVeryActive = (memory.suspicions[p.name] || 5) >= 6;
          return isKillerClaim || isVeryActive;
        });
        
        // If we found suspected power roles, control one of them
        let targetToControl;
        if (suspectedPowerRoles.length > 0) {
          targetToControl = suspectedPowerRoles[Math.floor(Math.random() * suspectedPowerRoles.length)];
        } else {
          // Otherwise, control most suspicious (likely evil, can mess with their plans)
          const sortedSus = [...targets].sort((a, b) => {
            const sa = memory.suspicions[a.name] || 5;
            const sb = memory.suspicions[b.name] || 5;
            return sb - sa;
          });
          targetToControl = sortedSus[0];
        }
        
        // Choose redirect target: ideally someone who would hurt Town
        // If controlling suspected evil, redirect to Town
        // If controlling suspected Town, redirect to other Town (waste their action)
        const controlSuspicion = memory.suspicions[targetToControl.name] || 5;
        let redirectTarget;
        
        if (controlSuspicion >= 6) {
          // Controlling suspected evil - redirect to Town (help them kill Town)
          const likelyTown = [...targets].filter(t => t.id !== targetToControl.id && (memory.suspicions[t.name] || 5) < 5);
          if (likelyTown.length > 0) {
            redirectTarget = likelyTown[Math.floor(Math.random() * likelyTown.length)];
          }
        } else {
          // Controlling suspected Town - redirect to other Town or self (waste action)
          const otherTown = [...targets].filter(t => t.id !== targetToControl.id && (memory.suspicions[t.name] || 5) < 5);
          if (otherTown.length > 0) {
            redirectTarget = otherTown[Math.floor(Math.random() * otherTown.length)];
          }
        }
        
        // Fallback: random redirect
        if (!redirectTarget) {
          const others = targets.filter(t => t.id !== targetToControl.id);
          redirectTarget = others[Math.floor(Math.random() * others.length)];
        }
        
        if (targetToControl && redirectTarget) {
          console.log(`🤖 ${botState.name} (Witch) controlling ${targetToControl.name} to target ${redirectTarget.name} (fallback)`);
          return { targetId: targetToControl.id, target2Id: redirectTarget.id };
        }
      }
      break;

    default:
      // Generic: pick random from middle 50%
      const midStart = Math.floor(sorted.length * 0.25);
      const midEnd = Math.ceil(sorted.length * 0.75);
      const midTargets = sorted.slice(midStart, midEnd);
      if (midTargets.length > 0) {
        chosenTarget = midTargets[Math.floor(Math.random() * midTargets.length)];
        console.log(`🤖 ${botState.name} targeting ${chosenTarget?.name} (generic fallback)`);
      } else {
        chosenTarget = sorted[Math.floor(Math.random() * sorted.length)];
        console.log(`🤖 ${botState.name} targeting ${chosenTarget?.name} (random fallback)`);
      }
  }

  return chosenTarget?.id || null;
}

function fallbackDayMessage(botState, players, game) {
  const { memory, role, name, personality } = botState;
  const currentDay = game.day || 1;
  const alivePlayers = players.filter(p => p.alive && p.id !== botState.playerId);
  
  // Don't spam - 30% chance to speak
  if (Math.random() > 0.3) return null;

  const templates = {
    day1: [
      "Buenos días a todos.",
      "Espero que encuentren al culpable pronto.",
      "Hay que estar atentos.",
      "¿Alguien tiene información?",
      "Mantengamos la calma.",
    ],
    discussion: [
      "Deberíamos votar con cuidado.",
      "¿Alguien actuó sospechosamente anoche?",
      "Necesitamos más información antes de votar.",
      "Tengan cuidado con quien confían.",
      "Los evils están entre nosotros.",
    ],
    voting: [
      "Mi voto está decidido.",
      "Hay que elegir sabiamente.",
      "Alguien debe hablar ahora.",
      "El tiempo se acaba.",
    ],
    suspicious: [
      `${memory.suspicions && Object.keys(memory.suspicions).length > 0 ? 
        Object.keys(memory.suspicions).sort((a,b) => {
          const sa = memory.suspicions[a] || 5;
          const sb = memory.suspicions[b] || 5;
          return sb - sa;
        })[0] : alivePlayers[Math.floor(Math.random() * alivePlayers.length)]?.name || 'alguien'} me parece sospechoso.`,
      "Alguien está mintiendo aquí.",
      "No confío en cierta persona.",
      "Algo no cuadra.",
    ],
    defensive: [
      "Yo soy Town.",
      "No tengo nada que ocultar.",
      "Estoy ayudando al pueblo.",
      "Mi rol es importante.",
    ],
    lateGame: [
      "Quedan pocos, hay que acertar.",
      "Esta decisión es crucial.",
      "No podemos equivocarnos ahora.",
      "Es hora de revelar información.",
    ]
  };

  // Select template pool based on context
  let pool = templates.discussion;
  
  if (currentDay === 1) {
    pool = templates.day1;
  } else if (currentDay >= 5 || alivePlayers.length <= 5) {
    pool = templates.lateGame;
  } else if (game.phase === 'VOTING') {
    pool = templates.voting;
  } else if (Math.random() > 0.5 && Object.keys(memory.suspicions || {}).length > 0) {
    pool = templates.suspicious;
  }

  // 20% chance to be defensive if Mafia
  if (role.faction === 'MAFIA' && Math.random() > 0.8) {
    pool = templates.defensive;
  }

  const message = pool[Math.floor(Math.random() * pool.length)];
  return message || null;
}

function fallbackVote(botState, targets) {
  const { memory, role } = botState;

  // Initialize suspicions if not present (randomize slightly)
  targets.forEach(t => {
    if (!(t.name in memory.suspicions)) {
      memory.suspicions[t.name] = 4 + Math.random() * 2; // 4-6 range
    }
  });

  // Sort by suspicion (descending)
  const sorted = [...targets].sort((a, b) => {
    const sa = memory.suspicions[a.name] || 5;
    const sb = memory.suspicions[b.name] || 5;
    return sb - sa;
  });

  // Don't vote for Mafia allies if you're Mafia
  let candidates = sorted;
  if (role.faction === 'MAFIA') {
    const nonMafia = sorted.filter(p => p.faction !== 'MAFIA');
    if (nonMafia.length > 0) {
      candidates = nonMafia;
    }
  }

  // Pick from top 3 most suspicious (add randomness)
  const topCandidates = candidates.slice(0, Math.min(3, candidates.length));
  const chosen = topCandidates[Math.floor(Math.random() * topCandidates.length)];
  
  console.log(`🤖 ${botState.name} voting for ${chosen?.name} (fallback, suspicion: ${memory.suspicions[chosen?.name] || 5})`);
  
  return chosen?.id || targets[0]?.id;
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
// NIGHT ACTION EXECUTION
// ============================================

async function executeNightAction(gameId, playerId, targetId, io, gameCode, target2Id = null) {
  const { submitNightAction } = await import('../gameEngine.js');
  const result = await submitNightAction(gameId, playerId, targetId, io, gameCode, target2Id);
  if (result) {
    console.log(`Bot night action: ${result.actionType} to target(s)`);
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
  const currentGame = await prisma.game.findUnique({ where: { id: gameId } });
  await prisma.gameEvent.create({
    data: {
      gameId,
      type: 'BOT_CHAT',
      data: { botId: playerId, botName, content, channel },
      day: currentGame?.day || 1,
      phase: currentGame?.phase || 'DAY',
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

/**
 * Update all bots' suspicions based on game events (deaths, behavior)
 * Call this when deaths are revealed or important info is shared
 */
export function updateAllBotsSuspicions(gameCode, eventData) {
  const bots = getGameBots(gameCode);
  if (bots.size === 0) return;

  const { type, deaths, players } = eventData;

  for (const [botId, botState] of bots.entries()) {
    // Initialize suspicions for all players if not present
    if (players) {
      players.forEach(p => {
        if (p.id !== botId && !(p.name in botState.memory.suspicions)) {
          // Start with slight randomization (4-6) to avoid always same target
          botState.memory.suspicions[p.name] = 4 + Math.random() * 2;
        }
      });
    }

    // Update based on death reveals
    if (type === 'death_reveal' && deaths) {
      deaths.forEach(death => {
        const victimName = death.playerName;
        const victimRole = death.roleName;
        const victimFaction = death.faction;

        // If a Town role died, slightly increase suspicion on all unknowns
        if (victimFaction === 'TOWN') {
          players?.forEach(p => {
            if (p.alive && p.id !== botId) {
              const current = botState.memory.suspicions[p.name] || 5;
              // Slight increase for everyone (0.5), more deaths = more paranoia
              botState.memory.suspicions[p.name] = Math.min(10, current + 0.5);
            }
          });
        }

        // If Mafia died and bot is Town, decrease suspicion slightly on active players
        if (victimFaction === 'MAFIA' && botState.role.faction === 'TOWN') {
          players?.forEach(p => {
            if (p.alive && p.id !== botId) {
              const current = botState.memory.suspicions[p.name] || 5;
              botState.memory.suspicions[p.name] = Math.max(0, current - 0.3);
            }
          });
        }

        // Store the death info
        botState.memory.knownInfo.push(
          `${victimName} murió - era ${victimRole} (${victimFaction})`
        );
      });
    }

    // Randomly adjust suspicions slightly each day to create variety
    if (type === 'day_start' && players) {
      players.forEach(p => {
        if (p.alive && p.id !== botId && p.name in botState.memory.suspicions) {
          // Random walk: +/- 0.3
          const delta = (Math.random() - 0.5) * 0.6;
          botState.memory.suspicions[p.name] = Math.max(0, Math.min(10,
            botState.memory.suspicions[p.name] + delta
          ));
        }
      });
    }
  }

  console.log(`🤖 Updated suspicions for ${bots.size} bots based on: ${type}`);
}

