// ============================================
// GAME ENGINE - Role Assignment, Day/Night Cycle, Actions
// ============================================

import { prisma } from './lib/prisma.js';
import {
  registerBots,
  unregisterBots,
  triggerNightActions,
  triggerDayChat,
  triggerVoting,
  triggerVerdict,
  triggerDefense,
  triggerMafiaChat,
  scheduleDayChatter,
  updateBotSuspicion,
} from './bots/botManager.js';

/**
 * Shuffle array in-place (Fisher-Yates)
 */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Join a dead player's socket to the dead chat room
 */
async function joinDeadRoom(gameCode, playerId, io) {
  try {
    const sockets = await io.in(gameCode).fetchSockets();
    for (const s of sockets) {
      const ci = getClientInfo(s.id);
      if (ci?.playerId === playerId) {
        s.join(`${gameCode}:dead`);
        break;
      }
    }
  } catch (err) {
    // Non-critical — bots don't have sockets
  }
}

// ============================================
// ROLE ASSIGNMENT
// ============================================

/**
 * Classic role list template based on player count
 * Returns an array of role "slots" - either specific roles or faction/alignment wildcards
 */
function getRoleSlots(playerCount) {
  // Base roles always present
  const slots = [];

  if (playerCount <= 5) {
    // Mini game (4-5 players)
    slots.push(
      { type: 'specific', slug: 'sheriff' },
      { type: 'specific', slug: 'doctor' },
      { type: 'faction', faction: 'Mafia' },
      { type: 'alignment', alignment: 'Town Killing' },
    );
    if (playerCount >= 5) {
      slots.push({ type: 'alignment', alignment: 'Neutral Benign' });
    }
  } else if (playerCount <= 9) {
    // Standard game (6-9 players)
    slots.push(
      { type: 'specific', slug: 'sheriff' },
      { type: 'specific', slug: 'doctor' },
      { type: 'specific', slug: 'jailor' },
      { type: 'alignment', alignment: 'Town Investigative' },
      { type: 'alignment', alignment: 'Town Support' },
      { type: 'specific', slug: 'godfather' },
    );
    if (playerCount >= 7) {
      slots.push({ type: 'specific', slug: 'mafioso' });
    }
    if (playerCount >= 8) {
      slots.push({ type: 'alignment', alignment: 'Neutral Killing' });
    }
    if (playerCount >= 9) {
      slots.push({ type: 'alignment', alignment: 'Neutral Evil' });
    }
  } else {
    // Full game (10-15 players)
    slots.push(
      { type: 'specific', slug: 'sheriff' },
      { type: 'specific', slug: 'jailor' },
      { type: 'specific', slug: 'doctor' },
      { type: 'alignment', alignment: 'Town Investigative' },
      { type: 'alignment', alignment: 'Town Protective' },
      { type: 'alignment', alignment: 'Town Support' },
      { type: 'alignment', alignment: 'Town Killing' },
      { type: 'specific', slug: 'godfather' },
      { type: 'specific', slug: 'mafioso' },
      { type: 'alignment', alignment: 'Mafia Deception' },
    );
    if (playerCount >= 11) {
      slots.push({ type: 'alignment', alignment: 'Neutral Killing' });
    }
    if (playerCount >= 12) {
      slots.push({ type: 'alignment', alignment: 'Neutral Evil' });
    }
    if (playerCount >= 13) {
      slots.push({ type: 'alignment', alignment: 'Mafia Support' });
    }
    if (playerCount >= 14) {
      slots.push({ type: 'alignment', alignment: 'Town Investigative' });
    }
    if (playerCount >= 15) {
      slots.push({ type: 'alignment', alignment: 'Neutral Benign' });
    }
  }

  return slots;
}

/**
 * Resolve a role slot to an actual role from the database
 */
async function resolveSlot(slot, usedSlugs) {
  if (slot.type === 'specific') {
    const role = await prisma.role.findUnique({
      where: { slug: slot.slug },
      include: { faction: true, alignment: true },
    });
    return role;
  }

  // Build query for wildcard slots
  const where = { isEnabled: true };

  if (slot.type === 'faction') {
    where.faction = { name: slot.faction };
  } else if (slot.type === 'alignment') {
    where.alignment = { name: slot.alignment };
  }

  const candidates = await prisma.role.findMany({
    where,
    include: { faction: true, alignment: true },
  });

  // Filter out already-used unique roles
  const available = candidates.filter(r => {
    if (r.isUnique && usedSlugs.has(r.slug)) return false;
    return true;
  });

  if (available.length === 0) {
    // Fallback: pick any Town role not yet used
    const fallback = await prisma.role.findMany({
      where: {
        isEnabled: true,
        faction: { name: 'Town' },
        slug: { notIn: Array.from(usedSlugs) },
      },
      include: { faction: true, alignment: true },
    });
    return fallback.length > 0 ? fallback[Math.floor(Math.random() * fallback.length)] : null;
  }

  return available[Math.floor(Math.random() * available.length)];
}

/**
 * Assign roles to all players in a game
 */
export async function assignRoles(gameId) {
  const game = await prisma.game.findUnique({ where: { id: gameId } });
  const players = await prisma.gamePlayer.findMany({
    where: { gameId },
    orderBy: { position: 'asc' },
  });

  // Use custom role list from config if available, otherwise use defaults
  const config = (game?.config && typeof game.config === 'object') ? game.config : {};
  const customRoleList = config.roleList;
  const slots = (Array.isArray(customRoleList) && customRoleList.length > 0)
    ? customRoleList.slice(0, players.length)
    : getRoleSlots(players.length);

  const shuffledPlayers = shuffle(players);
  const usedSlugs = new Set();
  const assignments = [];

  for (let i = 0; i < shuffledPlayers.length; i++) {
    const player = shuffledPlayers[i];
    const slot = slots[i] || { type: 'faction', faction: 'Town' }; // Extra players get Town

    const role = await resolveSlot(slot, usedSlugs);

    if (role) {
      usedSlugs.add(role.slug);
      assignments.push({
        playerId: player.id,
        roleName: role.nameEn,
        roleNameEs: role.nameEs,
        faction: role.faction.name.toUpperCase(),
        slug: role.slug,
        icon: role.icon,
        color: role.color,
        attackValue: role.attackValue,
        defenseValue: role.defenseValue,
        actionPriority: role.actionPriority,
        nightActionType: role.nightActionType,
        goalEs: role.goalEs,
        goalEn: role.goalEn,
        abilitiesEs: role.abilitiesEs,
        abilitiesEn: role.abilitiesEn,
      });

      await prisma.gamePlayer.update({
        where: { id: player.id },
        data: {
          roleName: role.nameEn,
          faction: role.faction.name.toUpperCase(),
          roleState: {
            slug: role.slug,
            icon: role.icon,
            color: role.color,
            attackValue: role.attackValue,
            defenseValue: role.defenseValue,
            actionPriority: role.actionPriority,
            nightActionType: role.nightActionType,
            usesRemaining: -1, // unlimited
            isRoleblocked: false,
            isProtected: false,
            isHealed: false,
            visitedBy: [],
          },
        },
      });
    }
  }

  return assignments;
}

// ============================================
// GAME PHASE MANAGEMENT
// ============================================

/** Active game timers: gameCode -> { timer, phase, day } */
const gameTimers = new Map();

/**
 * Start the game loop: assign roles, then begin Day 1 (greeting phase)
 */
export async function startGameLoop(gameId, gameCode, io) {
  // 1. Assign roles
  const assignments = await assignRoles(gameId);

  // 2. Update game to PLAYING — start at DAY 1
  await prisma.game.update({
    where: { id: gameId },
    data: {
      status: 'PLAYING',
      phase: 'DAY',
      day: 1,
    },
  });

  // 3. Send role assignments to each player privately
  const sockets = await io.in(gameCode).fetchSockets();

  for (const s of sockets) {
    const assignment = assignments.find(a => {
      // Match by connected client's playerId
      const clientInfo = getClientInfo(s.id);
      return clientInfo && a.playerId === clientInfo.playerId;
    });

    if (assignment) {
      // Ensure abilities are always arrays
      const toArray = (v) => {
        if (Array.isArray(v)) return v;
        if (typeof v === 'string') return v.split('\n').map(s => s.trim()).filter(Boolean);
        return [];
      };
      s.emit('role:assigned', {
        roleName: assignment.roleName,
        roleNameEs: assignment.roleNameEs,
        faction: assignment.faction,
        icon: assignment.icon,
        color: assignment.color,
        goalEs: assignment.goalEs,
        goalEn: assignment.goalEn,
        abilitiesEs: toArray(assignment.abilitiesEs),
        abilitiesEn: toArray(assignment.abilitiesEn),
      });

      // Join Mafia players to the mafia chat room
      if (assignment.faction === 'MAFIA') {
        s.join(`${gameCode}:mafia`);
      }
    }
  }

  // 4. Broadcast game started — Day 1 greeting phase
  io.to(gameCode).emit('game:started', {
    phase: 'DAY',
    day: 1,
    message: '☀️ Día 1 - Los habitantes del pueblo se presentan...',
  });

  // 5. Create game event
  await prisma.gameEvent.create({
    data: {
      gameId,
      type: 'GAME_STARTED',
      data: { playerCount: assignments.length },
      day: 1,
      phase: 'DAY',
    },
  });

  // 6. Register bots with the Bot Manager
  const botPlayers = await prisma.gamePlayer.findMany({
    where: { gameId, isBot: true },
  });
  if (botPlayers.length > 0) {
    registerBots(gameCode, botPlayers, assignments);
    // Trigger bot day greetings for Day 1 (all bots greet immediately, no cooldown)
    setTimeout(() => triggerDayChat(gameId, gameCode, io, true), 2000);
    // Don't schedule additional chatter on Day 1 (too short)
  }

  // 7. Start Day 1 timer
  startPhaseTimer(gameId, gameCode, 'DAY', 1, io);

  console.log(`🎮 Game ${gameCode} started with ${assignments.length} players`);
  return assignments;
}

/**
 * Start a timer for the current phase
 */
function startPhaseTimer(gameId, gameCode, phase, day, io) {
  // Clear existing timer + interval
  const existing = gameTimers.get(gameCode);
  if (existing?.timer) clearTimeout(existing.timer);
  if (existing?.interval) clearInterval(existing.interval);

  // Phase durations (in seconds)
  const durations = {
    NIGHT: 45,
    DAY: 120,
    VOTING: 30,
    TRIAL: 20,
    DEFENSE: 15,
  };

  // Day 1 is special: only 20 seconds for greetings
  let duration;
  if (phase === 'DAY' && day === 1) {
    duration = 20;
  } else {
    duration = durations[phase] || 45;
  }
  let timeLeft = duration;

  // Emit initial timer value
  io.to(gameCode).emit('phase:timer', { timeLeft });

  // Tick every second
  const interval = setInterval(() => {
    timeLeft--;
    if (timeLeft >= 0) {
      io.to(gameCode).emit('phase:timer', { timeLeft });
    }
  }, 1000);

  // Set timer for auto-transition
  const timer = setTimeout(async () => {
    clearInterval(interval);
    await advancePhase(gameId, gameCode, io);
  }, duration * 1000);

  gameTimers.set(gameCode, { timer, interval, phase, day, gameId });

  // Setup jail room if NIGHT phase
  if (phase === 'NIGHT') {
    setupJailRoom(gameId, gameCode, day, io);
  }
}

/**
 * Setup jail room for prisoner and Jailor communication
 */
async function setupJailRoom(gameId, gameCode, day, io) {
  try {
    // Find JAIL action for this night
    const jailAction = await prisma.gameAction.findFirst({
      where: {
        gameId,
        night: day,
        actionType: 'JAIL',
      },
      include: {
        source: true,
        target: true,
      },
    });

    if (!jailAction || !jailAction.source || !jailAction.target) return;

    const jailorId = jailAction.sourceId;
    const prisonerId = jailAction.targetId;
    const jailRoom = `${gameCode}:jail:${day}`;

    // Find sockets for both players
    const sockets = await io.in(gameCode).fetchSockets();
    let jailorSocket = null;
    let prisonerSocket = null;

    for (const socket of sockets) {
      const clientInfo = getClientInfo(socket.id);
      if (clientInfo?.playerId === jailorId) {
        jailorSocket = socket;
      }
      if (clientInfo?.playerId === prisonerId) {
        prisonerSocket = socket;
      }
    }

    if (jailorSocket) {
      jailorSocket.join(jailRoom);
      jailorSocket.emit('jail:start', {
        role: 'JAILOR',
        prisonerId,
        prisonerName: jailAction.target.name,
        prisonerPosition: jailAction.target.position,
      });
    }

    if (prisonerSocket) {
      prisonerSocket.join(jailRoom);
      prisonerSocket.emit('jail:start', {
        role: 'PRISONER',
        jailorId,
      });
    }

    // Send initial system message
    const message = {
      id: `system-${Date.now()}`,
      author: { id: 'system', name: 'Sistema', position: 0 },
      content: '⚖️ Has sido encarcelado. Puedes hablar con el Jailor.',
      timestamp: new Date(),
      channel: 'JAIL',
      isSystem: true,
    };
    io.to(jailRoom).emit('jail:message', message);

    console.log(`⚖️ Jail room created: ${jailRoom} (Jailor ${jailAction.source.name}, Prisoner ${jailAction.target.name})`);
  } catch (error) {
    console.error('Error setting up jail room:', error);
  }
}

// ============================================
// VIGILANTE GUILT SUICIDE
// ============================================

/**
 * If a Vigilante killed a Town member, they die of guilt at the start of next day
 */
async function handleVigilanteSuicide(gameId, gameCode, io) {
  const vigilantes = await prisma.gamePlayer.findMany({
    where: { gameId, alive: true, roleName: { contains: 'Vigilante', mode: 'insensitive' } },
  });

  for (const vig of vigilantes) {
    const state = vig.roleState || {};
    if (state.guiltyKill) {
      // Vigilante suicides
      await prisma.gamePlayer.update({
        where: { id: vig.id },
        data: {
          alive: false,
          diedOnDay: (await prisma.game.findUnique({ where: { id: gameId } })).day,
          diedOnPhase: 'DAY',
          causeOfDeath: 'Se suicidó de culpa por matar a un miembro del pueblo',
          roleState: { ...state, guiltyKill: false },
        },
      });

      io.to(gameCode).emit('player:died', {
        playerId: vig.id,
        playerName: vig.name,
        position: vig.position,
        roleName: vig.roleName,
        faction: vig.faction,
        causeOfDeath: 'Se suicidó de culpa por matar a un miembro del pueblo',
        phase: 'DAY',
        will: vig.will || null,
        deathNote: null,
      });

      // Join dead room
      await joinDeadRoom(gameCode, vig.id, io);
    }
  }
}

// ============================================
// MAFIOSO PROMOTION
// ============================================

/**
 * If Godfather died, promote the Mafioso to Godfather
 */
async function handleMafiosoPromotion(gameId, gameCode, io) {
  // Check if there's a dead Godfather with no alive replacement
  const aliveGF = await prisma.gamePlayer.findFirst({
    where: { gameId, alive: true, roleName: { contains: 'Godfather', mode: 'insensitive' } },
  });

  if (!aliveGF) {
    // No living Godfather — promote first alive Mafioso
    const mafioso = await prisma.gamePlayer.findFirst({
      where: { gameId, alive: true, roleName: { contains: 'Mafioso', mode: 'insensitive' } },
    });

    if (mafioso) {
      // Look up the Godfather role from DB to get full stats
      const gfRole = await prisma.role.findFirst({
        where: { slug: 'godfather' },
        include: { faction: true },
      });

      const oldState = mafioso.roleState || {};
      await prisma.gamePlayer.update({
        where: { id: mafioso.id },
        data: {
          roleName: gfRole?.nameEn || 'Godfather',
          roleState: {
            ...oldState,
            slug: 'godfather',
            defenseValue: gfRole?.defenseValue ?? 1,
            attackValue: gfRole?.attackValue ?? 1,
            nightActionType: gfRole?.nightActionType || 'KILL_SINGLE',
            actionPriority: gfRole?.actionPriority ?? 6,
          },
        },
      });

      // Notify the promoted player
      const sockets = await io.in(gameCode).fetchSockets();
      const mafSocket = sockets.find(s => {
        const ci = getClientInfo(s.id);
        return ci?.playerId === mafioso.id;
      });
      if (mafSocket) {
        mafSocket.emit('night:result', {
          type: 'promotion',
          message: '👑 El Godfather ha muerto. ¡Ahora eres el nuevo líder de la Mafia!',
        });
      }

      console.log(`🔴 Mafioso "${mafioso.name}" promoted to Godfather in game ${gameCode}`);
    }
  }
}

/**
 * Advance to the next game phase
 */
async function advancePhase(gameId, gameCode, io) {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: { players: { where: { alive: true } } },
  });

  if (!game || game.status !== 'PLAYING') return;

  // Check if timer matches current game phase (prevent race conditions)
  const currentTimer = gameTimers.get(gameCode);
  if (currentTimer && currentTimer.phase !== game.phase) {
    console.log(`⏰ Timer phase mismatch: timer=${currentTimer.phase}, game=${game.phase}. Skipping advance.`);
    return;
  }

  const { phase, day } = game;
  let nextPhase, nextDay;

  switch (phase) {
    case 'NIGHT':
      // Resolve night actions, then go to DAY
      await resolveNightActions(gameId, gameCode, io);

      // -- Vigilante guilt suicide: killed a Town member last night --
      await handleVigilanteSuicide(gameId, gameCode, io);

      // -- Mafioso promotion: if Godfather died, promote Mafioso --
      await handleMafiosoPromotion(gameId, gameCode, io);

      nextPhase = 'DAY';
      nextDay = day + 1;
      break;
    case 'DAY':
      // Day 1 is greeting-only — skip voting, go to Night 1
      if (day === 1) {
        nextPhase = 'NIGHT';
        nextDay = day;
      } else {
        nextPhase = 'VOTING';
        nextDay = day;
      }
      break;
    case 'VOTING':
      // Check if someone was nominated
      nextPhase = 'DAY'; // Default back to day if no vote
      nextDay = day;
      break;
    case 'TRIAL':
      nextPhase = 'DEFENSE';
      nextDay = day;
      break;
    case 'DEFENSE': {
      // Execute verdict based on collected votes, then night
      await resolveTrialVerdict(gameId, gameCode, io);
      // Re-check if game ended from execution
      const postTrialGame = await prisma.game.findUnique({ where: { id: gameId } });
      if (!postTrialGame || postTrialGame.status !== 'PLAYING') return;
      nextPhase = 'NIGHT';
      nextDay = day;
      break;
    }
    default:
      nextPhase = 'NIGHT';
      nextDay = day;
  }

  // Check win condition
  const winner = checkWinCondition(game.players);
  if (winner) {
    await endGame(gameId, gameCode, winner, io);
    return;
  }

  // Update game
  await prisma.game.update({
    where: { id: gameId },
    data: { phase: nextPhase, day: nextDay },
  });

  // Emit phase change
  const phaseMessages = {
    DAY: `☀️ Día ${nextDay} - El pueblo despierta...`,
    NIGHT: '🌙 La noche cae sobre el pueblo...',
    VOTING: '🗳️ Es hora de votar. ¿Quién será enviado a juicio?',
    TRIAL: '⚖️ El acusado está en juicio.',
    DEFENSE: '🛡️ El acusado puede defenderse.',
  };

  io.to(gameCode).emit('phase:change', {
    phase: nextPhase,
    day: nextDay,
    message: phaseMessages[nextPhase] || '',
  });

  // Trigger bot actions for new phase
  try {
    switch (nextPhase) {
      case 'NIGHT':
        setTimeout(() => triggerNightActions(gameId, gameCode, io), 3000);
        setTimeout(() => triggerMafiaChat(gameId, gameCode, io), 2000);
        break;
      case 'DAY':
        // Day 2+ has normal chat behavior
        setTimeout(() => triggerDayChat(gameId, gameCode, io, false), 4000);
        scheduleDayChatter(gameId, gameCode, io);
        break;
      case 'VOTING':
        setTimeout(() => triggerVoting(gameId, gameCode, io), 3000);
        break;
      case 'TRIAL': {
        // Bots defend themselves if on trial, and submit verdicts
        const trialGame = await prisma.game.findUnique({ where: { id: gameId } });
        if (trialGame) {
          const latestNom = await prisma.vote.findFirst({
            where: { gameId, day: trialGame.day, voteType: 'NOMINATION' },
            orderBy: { timestamp: 'desc' },
          });
          if (latestNom) {
            setTimeout(() => triggerDefense(gameId, gameCode, latestNom.nomineeId, io), 2000);
            setTimeout(() => triggerVerdict(gameId, gameCode, latestNom.nomineeId, io), 6000);
          }
        }
        break;
      }
      case 'DEFENSE':
        // Bots submit verdicts during defense phase
        break;
    }
  } catch (err) {
    console.error('🤖 Bot trigger error:', err.message);
  }

  // Start next timer
  startPhaseTimer(gameId, gameCode, nextPhase, nextDay, io);
}

// ============================================
// INVESTIGATOR GROUPS (for INVESTIGATOR_CHECK)
// ============================================
const INVESTIGATOR_GROUPS = {
  GROUP_1: ['Sheriff', 'Executioner', 'Werewolf'],
  GROUP_2: ['Lookout', 'Forger'],
  GROUP_3: ['Doctor', 'Disguiser', 'Serial Killer'],
  GROUP_4: ['Investigator', 'Consigliere', 'Mayor'],
  GROUP_5: ['Bodyguard', 'Godfather', 'Arsonist'],
  GROUP_6: ['Escort', 'Transporter', 'Consort'],
  GROUP_7: ['Medium', 'Janitor', 'Retributionist'],
  GROUP_8: ['Vigilante', 'Veteran', 'Mafioso'],
  GROUP_9: ['Framer', 'Vampire', 'Jester'],
  GROUP_10: ['Spy', 'Blackmailer', 'Jailor'],
  GROUP_11: ['Survivor', 'Vampire Hunter', 'Amnesiac', 'Medusa'],
};

function getInvestigatorGroup(roleName) {
  for (const [, group] of Object.entries(INVESTIGATOR_GROUPS)) {
    if (group.some(r => r.toLowerCase() === roleName?.toLowerCase())) {
      return group;
    }
  }
  return [roleName || 'Unknown', 'Random Town', 'Random Neutral'];
}

// ============================================
// NIGHT ACTION RESOLUTION
// ============================================

/**
 * Resolve all pending night actions in priority order.
 * Implements the full priority system (P1-P8) with visit tracking.
 */
async function resolveNightActions(gameId, gameCode, io) {
  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) return [];

  const actions = await prisma.gameAction.findMany({
    where: { gameId, night: game.day },
    include: { source: true, target: true },
    orderBy: { priority: 'asc' },
  });

  const results = [];
  const deaths = [];
  const healed = new Set();         // player IDs that were healed
  const protected_ = new Set();     // player IDs protected by Bodyguard
  const roleblocked = new Set();    // player IDs that were roleblocked
  const jailed = new Set();         // player IDs in jail
  const framed = new Set();         // player IDs framed by Framer
  const blackmailed = new Set();    // player IDs blackmailed
  const doused = new Set();         // player IDs doused this night
  const cleaned = new Set();        // player IDs cleaned by Janitor (hide role on death)
  const visits = new Map();         // targetId -> [{ visitorId, visitorName }]
  const playerVisited = new Map();  // sourceId -> targetId (for Tracker)
  const vested = new Set();         // player IDs with active vest
  const alerted = new Set();        // player IDs on alert (Veteran)
  const transported = [];           // [{id1, id2}] transport swaps

  // Helper: record a visit
  const recordVisit = (visitorId, visitorName, targetId) => {
    if (!targetId) return;
    if (!visits.has(targetId)) visits.set(targetId, []);
    visits.get(targetId).push({ visitorId, visitorName });
    playerVisited.set(visitorId, targetId);
  };

  // Helper: send private result to a player
  const sendResult = async (playerId, type, message, extra = {}) => {
    const sockets = await io.in(gameCode).fetchSockets();
    const targetSocket = sockets.find(s => {
      const ci = getClientInfo(s.id);
      return ci?.playerId === playerId;
    });
    if (targetSocket) {
      targetSocket.emit('night:result', { type, message, ...extra });
    }
  };

  // --- PASS 1: Resolve in priority order ---
  for (const action of actions) {
    if (!action.source.alive) continue;

    // Jailed players can't act (except Jailor themselves)
    if (jailed.has(action.sourceId) && action.actionType !== 'JAIL' && action.actionType !== 'EXECUTE') continue;
    // Roleblocked players can't act
    if (roleblocked.has(action.sourceId)) continue;

    const sourceState = action.source.roleState || {};
    const targetState = action.target?.roleState || {};

    switch (action.actionType) {
      // ========== PRIORITY 1: JAIL ==========
      case 'JAIL': {
        if (action.targetId) {
          jailed.add(action.targetId);
          roleblocked.add(action.targetId); // Jailed also blocks their action
          results.push({ action, result: 'jailed', targetId: action.targetId });
          // Notify jailed player
          await sendResult(action.targetId, 'jailed', '⛓️ Fuiste encarcelado por el Jailor.');
        }
        break;
      }

      case 'EXECUTE': {
        // Jailor executes jailed player — Unstoppable attack
        if (action.targetId && jailed.has(action.targetId)) {
          deaths.push({
            playerId: action.targetId,
            killerPlayerId: action.sourceId,
            causeOfDeath: 'Ejecutado por el Jailor',
            unstoppable: true,
          });
          results.push({ action, result: 'executed', targetId: action.targetId });
        }
        break;
      }

      // ========== PRIORITY 2: ROLEBLOCK & CONTROL ==========
      case 'ROLEBLOCK': {
        if (action.targetId) {
          // Special interaction: roleblocking Serial Killer — SK kills the roleblocker
          const targetRole = action.target?.roleName?.toLowerCase();
          if (targetRole === 'serial killer') {
            deaths.push({
              playerId: action.sourceId,
              killerPlayerId: action.targetId,
              causeOfDeath: 'Asesinado por el Serial Killer al intentar bloquearlo',
            });
            results.push({ action, result: 'killed_by_sk' });
          } else {
            roleblocked.add(action.targetId);
            results.push({ action, result: 'roleblocked', targetId: action.targetId });
            await sendResult(action.targetId, 'roleblocked', '🚫 Fuiste bloqueado esta noche. No pudiste realizar tu acción.');
          }
          recordVisit(action.sourceId, action.source.name, action.targetId);
        }
        break;
      }

      case 'CONTROL': {
        // Witch: redirect target's action to a new target (target2Id stores the redirect destination)
        if (action.targetId) {
          roleblocked.add(action.targetId); // Original action is blocked
          recordVisit(action.sourceId, action.source.name, action.targetId);
          results.push({ action, result: 'controlled', targetId: action.targetId });
          await sendResult(action.targetId, 'controlled', '🧙 Fuiste controlado por una bruja. Tu acción fue redirigida.');
          // Witch sees the target's role
          await sendResult(action.sourceId, 'witch_info', `🧙 Tu objetivo es: ${action.target?.roleName || 'Desconocido'}`);
        }
        break;
      }

      // ========== PRIORITY 3: HEAL & PROTECT ==========
      case 'HEAL': {
        if (action.targetId) {
          healed.add(action.targetId);
          recordVisit(action.sourceId, action.source.name, action.targetId);
          results.push({ action, result: 'healed', targetId: action.targetId });
        }
        break;
      }

      case 'PROTECT': {
        // Bodyguard: protects target. If target is attacked, BG + attacker both die
        if (action.targetId) {
          protected_.add(action.targetId);
          recordVisit(action.sourceId, action.source.name, action.targetId);
          results.push({ action, result: 'protected', targetId: action.targetId, bodyguardId: action.sourceId });
        }
        break;
      }

      case 'VEST': {
        // Survivor self-protection
        vested.add(action.sourceId);
        results.push({ action, result: 'vested' });
        break;
      }

      case 'ALERT': {
        // Veteran: alert mode — kill all visitors
        alerted.add(action.sourceId);
        results.push({ action, result: 'alerted' });
        break;
      }

      case 'TRAP': {
        // Trapper: place trap on target — kills first attacker
        if (action.targetId) {
          protected_.add(action.targetId);
          recordVisit(action.sourceId, action.source.name, action.targetId);
          results.push({ action, result: 'trapped', targetId: action.targetId, trapperId: action.sourceId });
        }
        break;
      }

      case 'PROTECT_TARGET': {
        // Guardian Angel: protect assigned target
        if (action.targetId) {
          healed.add(action.targetId);
          protected_.add(action.targetId);
          results.push({ action, result: 'ga_protected', targetId: action.targetId });
        }
        break;
      }

      // ========== PRIORITY 4: TRANSPORT ==========
      case 'TRANSPORT': {
        // Transporter: swap two targets — all actions redirect
        if (action.targetId && action.target2Id) {
          transported.push({ id1: action.targetId, id2: action.target2Id });
          recordVisit(action.sourceId, action.source.name, action.targetId);
          recordVisit(action.sourceId, action.source.name, action.target2Id);
          results.push({ action, result: 'transported', targetId: action.targetId, target2Id: action.target2Id });
          await sendResult(action.targetId, 'transported', '🔄 Fuiste transportado a otra ubicación.');
          await sendResult(action.target2Id, 'transported', '🔄 Fuiste transportado a otra ubicación.');
        }
        break;
      }

      // ========== PRIORITY 5: PASSIVE KILLS ==========
      case 'KILL_VISITORS': {
        // Serial Killer passive — kills whoever visits them (set, resolved later)
        alerted.add(action.sourceId); // Reuse alert logic
        results.push({ action, result: 'kill_visitors_active' });
        break;
      }

      case 'STONE_GAZE': {
        // Medusa: petrify all visitors
        alerted.add(action.sourceId);
        results.push({ action, result: 'stone_gaze_active' });
        break;
      }

      // ========== PRIORITY 6: ATTACKS ==========
      case 'KILL_SINGLE': {
        if (action.target && action.target.alive) {
          const attackValue = sourceState.attackValue || 1;
          const defenseValue = targetState.defenseValue || 0;
          const isJailed = jailed.has(action.targetId);

          // Jailed targets can't be visited
          if (isJailed) {
            results.push({ action, result: 'target_jailed' });
            await sendResult(action.sourceId, 'attack_failed', 'Tu objetivo estaba protegido y no pudiste alcanzarlo.');
            break;
          }

          recordVisit(action.sourceId, action.source.name, action.targetId);

          if (attackValue > defenseValue && !healed.has(action.targetId) && !vested.has(action.targetId)) {
            // Check Bodyguard protection
            if (protected_.has(action.targetId)) {
              // Find the bodyguard who protected
              const bgResult = results.find(r => r.result === 'protected' && r.targetId === action.targetId);
              if (bgResult) {
                // BG and attacker die, target survives
                deaths.push({
                  playerId: bgResult.bodyguardId,
                  killerPlayerId: action.sourceId,
                  causeOfDeath: 'Se sacrificó protegiendo a su objetivo',
                });
                deaths.push({
                  playerId: action.sourceId,
                  killerPlayerId: bgResult.bodyguardId,
                  causeOfDeath: 'Asesinado por el Guardaespaldas',
                });
                results.push({ action, result: 'blocked_by_bodyguard', targetId: action.targetId });
                await sendResult(action.targetId, 'protected', '🛡️ Alguien intentó atacarte pero tu Guardaespaldas te salvó.');
                break;
              }
            }

            deaths.push({
              playerId: action.targetId,
              killerPlayerId: action.sourceId,
              causeOfDeath: `Asesinado por ${action.source.roleName}`,
            });
            results.push({ action, result: 'killed', targetId: action.targetId });

            // Vigilante: track if killed a Town member
            if (action.source.roleName?.toLowerCase() === 'vigilante' && action.target.faction === 'TOWN') {
              // Mark vigilante for suicide next day
              await prisma.gamePlayer.update({
                where: { id: action.sourceId },
                data: {
                  roleState: {
                    ...sourceState,
                    guiltyKill: true,
                  },
                },
              });
            }
          } else {
            // Attack failed (healed or defense > attack)
            results.push({ action, result: 'attack_failed', targetId: action.targetId });
            await sendResult(action.sourceId, 'attack_failed', 'Tu objetivo sobrevivió a tu ataque.');
            if (healed.has(action.targetId)) {
              await sendResult(action.targetId, 'healed', '🏥 Fuiste atacado pero un Doctor te salvó la vida.');
              // Notify the healer
              const healAction = actions.find(a => a.actionType === 'HEAL' && a.targetId === action.targetId);
              if (healAction) {
                await sendResult(healAction.sourceId, 'heal_success', '🏥 Tu objetivo fue atacado pero lo salvaste.');
              }
            } else {
              await sendResult(action.targetId, 'attack_survived', '🛡️ Alguien intentó atacarte pero tu defensa te protegió.');
            }
          }
        }
        break;
      }

      case 'KILL_RAMPAGE': {
        // Werewolf/Juggernaut: kill target + all visitors to target
        if (action.target && action.target.alive) {
          recordVisit(action.sourceId, action.source.name, action.targetId);
          const attackValue = sourceState.attackValue || 2; // Powerful
          const defenseValue = targetState.defenseValue || 0;

          if (attackValue > defenseValue && !healed.has(action.targetId)) {
            deaths.push({
              playerId: action.targetId,
              killerPlayerId: action.sourceId,
              causeOfDeath: `Destrozado por ${action.source.roleName}`,
            });
          }
          // Visitors to this target will be killed in post-processing
          results.push({ action, result: 'rampage', targetId: action.targetId });
        }
        break;
      }

      case 'DOUSE': {
        // Arsonist: douse target with gasoline
        if (action.targetId) {
          doused.add(action.targetId);
          recordVisit(action.sourceId, action.source.name, action.targetId);

          // Track doused players in arsonist's roleState
          const dousedList = sourceState.dousedPlayers || [];
          if (!dousedList.includes(action.targetId)) {
            dousedList.push(action.targetId);
            await prisma.gamePlayer.update({
              where: { id: action.sourceId },
              data: { roleState: { ...sourceState, dousedPlayers: dousedList } },
            });
          }
          results.push({ action, result: 'doused', targetId: action.targetId });
        }
        break;
      }

      case 'IGNITE': {
        // Arsonist: ignite all doused players — Unstoppable attack
        const dousedList = sourceState.dousedPlayers || [];
        for (const dousedId of dousedList) {
          const dousedPlayer = await prisma.gamePlayer.findUnique({ where: { id: dousedId } });
          if (dousedPlayer?.alive) {
            deaths.push({
              playerId: dousedId,
              killerPlayerId: action.sourceId,
              causeOfDeath: 'Quemado vivo por el Pirómano',
              unstoppable: true,
            });
          }
        }
        // Clear doused list
        await prisma.gamePlayer.update({
          where: { id: action.sourceId },
          data: { roleState: { ...sourceState, dousedPlayers: [] } },
        });
        results.push({ action, result: 'ignited', count: dousedList.length });
        break;
      }

      case 'POISON': {
        // Poisoner: target dies next night unless healed
        if (action.targetId) {
          recordVisit(action.sourceId, action.source.name, action.targetId);
          const tState = action.target?.roleState || {};
          await prisma.gamePlayer.update({
            where: { id: action.targetId },
            data: { roleState: { ...tState, poisoned: true, poisonedBy: action.sourceId } },
          });
          results.push({ action, result: 'poisoned', targetId: action.targetId });
        }
        break;
      }

      case 'HEX': {
        // Hex Master: hex target
        if (action.targetId) {
          recordVisit(action.sourceId, action.source.name, action.targetId);
          const hexedList = sourceState.hexedPlayers || [];
          if (!hexedList.includes(action.targetId)) {
            hexedList.push(action.targetId);
            await prisma.gamePlayer.update({
              where: { id: action.sourceId },
              data: { roleState: { ...sourceState, hexedPlayers: hexedList } },
            });
          }
          results.push({ action, result: 'hexed', targetId: action.targetId });
        }
        break;
      }

      // ========== PRIORITY 7: INVESTIGATIONS ==========
      case 'SHERIFF_CHECK': {
        if (action.target) {
          recordVisit(action.sourceId, action.source.name, action.targetId);
          const role = await prisma.role.findFirst({
            where: { nameEn: action.target.roleName },
          });

          let result;
          // Godfather exception: always appears Not Suspicious
          if (action.target.roleName?.toLowerCase() === 'godfather') {
            result = 'Not Suspicious';
          } else if (framed.has(action.targetId)) {
            result = 'Suspicious';
          } else {
            result = role?.sheriffResult || 'Not Suspicious';
          }

          await sendResult(action.sourceId, 'investigation', `🔍 Tu objetivo parece: ${result}`, { target: action.target.name });

          // Update bot suspicion
          if (action.source.isBot) {
            const suspDelta = result === 'Not Suspicious' ? -3 : 4;
            const info = `Sheriff N${game.day}: ${action.target.name} es ${result}`;
            updateBotSuspicion(gameCode, action.sourceId, action.target.name, suspDelta, info);
          }
          results.push({ action, result });
        }
        break;
      }

      case 'INVESTIGATOR_CHECK': {
        if (action.target) {
          recordVisit(action.sourceId, action.source.name, action.targetId);
          const group = getInvestigatorGroup(action.target.roleName);
          const message = `🔎 Tu objetivo podría ser: ${group.join(', ')}`;
          await sendResult(action.sourceId, 'investigation', message, { target: action.target.name });

          if (action.source.isBot) {
            const info = `Investigator N${game.day}: ${action.target.name} podría ser ${group.join('/')}`;
            updateBotSuspicion(gameCode, action.sourceId, action.target.name, 0, info);
          }
          results.push({ action, result: 'investigated', group });
        }
        break;
      }

      case 'LOOKOUT_WATCH': {
        // Lookout: see who visited target — resolved in post-processing
        if (action.targetId) {
          recordVisit(action.sourceId, action.source.name, action.targetId);
          results.push({ action, result: 'watching', targetId: action.targetId, lookoutId: action.sourceId });
        }
        break;
      }

      case 'TRACKER_TRACK': {
        // Tracker: see who target visited — resolved in post-processing
        if (action.targetId) {
          results.push({ action, result: 'tracking', targetId: action.targetId, trackerId: action.sourceId });
        }
        break;
      }

      case 'SPY_BUG': {
        // Spy: bug a player to see who visits them
        if (action.targetId) {
          results.push({ action, result: 'bugged', targetId: action.targetId, spyId: action.sourceId });
        }
        break;
      }

      case 'CONSIGLIERE_CHECK': {
        // Consigliere: sees exact role
        if (action.target) {
          recordVisit(action.sourceId, action.source.name, action.targetId);
          const exactRole = action.target.roleName || 'Desconocido';
          await sendResult(action.sourceId, 'investigation', `🎯 Tu objetivo es exactamente: ${exactRole}`, { target: action.target.name });

          if (action.source.isBot) {
            const info = `Consigliere N${game.day}: ${action.target.name} es ${exactRole}`;
            updateBotSuspicion(gameCode, action.sourceId, action.target.name, 0, info);
          }
          results.push({ action, result: 'consig_checked', role: exactRole });
        }
        break;
      }

      case 'PSYCHIC_VISION': {
        // Psychic: automatic vision
        const allPlayers = await prisma.gamePlayer.findMany({
          where: { gameId, alive: true },
        });
        const isEven = game.day % 2 === 0;
        const town = allPlayers.filter(p => p.faction === 'TOWN' && p.id !== action.sourceId);
        const evil = allPlayers.filter(p => p.faction !== 'TOWN' && p.id !== action.sourceId);

        if (isEven && town.length >= 2) {
          // Even night: "2 of these 3 are good"
          const good = shuffle(town).slice(0, 2);
          const bad = evil.length > 0 ? [shuffle(evil)[0]] : [shuffle(town)[0]];
          const vision = shuffle([...good, ...bad]);
          const names = vision.map(p => p.name).join(', ');
          await sendResult(action.sourceId, 'psychic', `🔮 Dos de estos son buenos: ${names}`);
        } else if (evil.length >= 1) {
          // Odd night: "1 of these 3 is evil"
          const bad = [shuffle(evil)[0]];
          const good = shuffle(town).slice(0, 2);
          const vision = shuffle([...bad, ...good]);
          const names = vision.map(p => p.name).join(', ');
          await sendResult(action.sourceId, 'psychic', `🔮 Uno de estos es malo: ${names}`);
        }
        results.push({ action, result: 'vision' });
        break;
      }

      // ========== PRIORITY 8: DECEPTION ==========
      case 'FRAME': {
        if (action.targetId) {
          framed.add(action.targetId);
          recordVisit(action.sourceId, action.source.name, action.targetId);
          results.push({ action, result: 'framed', targetId: action.targetId });
        }
        break;
      }

      case 'DISGUISE': {
        if (action.targetId) {
          recordVisit(action.sourceId, action.source.name, action.targetId);
          results.push({ action, result: 'disguised', targetId: action.targetId });
        }
        break;
      }

      case 'CLEAN': {
        if (action.targetId) {
          cleaned.add(action.targetId);
          recordVisit(action.sourceId, action.source.name, action.targetId);
          results.push({ action, result: 'cleaned', targetId: action.targetId });
        }
        break;
      }

      case 'FORGE': {
        if (action.targetId) {
          recordVisit(action.sourceId, action.source.name, action.targetId);
          // Forger changes the will of the dead target
          results.push({ action, result: 'forged', targetId: action.targetId });
        }
        break;
      }

      case 'BLACKMAIL': {
        if (action.targetId) {
          blackmailed.add(action.targetId);
          recordVisit(action.sourceId, action.source.name, action.targetId);
          results.push({ action, result: 'blackmailed', targetId: action.targetId });
          await sendResult(action.targetId, 'blackmailed', '🤐 Has sido chantajeado. No podrás hablar mañana.');
        }
        break;
      }

      case 'HYPNOTIZE': {
        if (action.targetId) {
          recordVisit(action.sourceId, action.source.name, action.targetId);
          // Send a misleading message to target
          const fakeMessages = [
            '🏥 Fuiste curado anoche.',
            '🔍 Alguien te investigó anoche.',
            '🛡️ Un Guardaespaldas te protegió anoche.',
            '🔄 Fuiste transportado a otra ubicación.',
          ];
          const fakeMsg = fakeMessages[Math.floor(Math.random() * fakeMessages.length)];
          await sendResult(action.targetId, 'hypnotized', fakeMsg);
          results.push({ action, result: 'hypnotized', targetId: action.targetId });
        }
        break;
      }

      case 'SEANCE': {
        // Medium: communicate with a dead player
        results.push({ action, result: 'seance', targetId: action.targetId });
        break;
      }

      default:
        results.push({ action, result: 'no_effect' });
        break;
    }

    // Mark action as processed
    await prisma.gameAction.update({
      where: { id: action.id },
      data: { success: !roleblocked.has(action.sourceId) && !jailed.has(action.sourceId) },
    });
  }

  // --- PASS 2: Post-processing ---

  // Veteran/SK alert kills: kill all visitors to alerted players
  for (const alertedId of alerted) {
    const alertVisitors = visits.get(alertedId) || [];
    for (const visitor of alertVisitors) {
      // Don't kill self
      if (visitor.visitorId === alertedId) continue;
      const alreadyDying = deaths.some(d => d.playerId === visitor.visitorId);
      if (!alreadyDying) {
        const alertedPlayer = await prisma.gamePlayer.findUnique({ where: { id: alertedId } });
        deaths.push({
          playerId: visitor.visitorId,
          killerPlayerId: alertedId,
          causeOfDeath: `Asesinado al visitar a ${alertedPlayer?.roleName || 'un Veterano'}`,
        });
      }
    }
  }

  // Rampage kills: kill all visitors to rampage targets
  const rampageResults = results.filter(r => r.result === 'rampage');
  for (const rr of rampageResults) {
    const rampageVisitors = visits.get(rr.targetId) || [];
    for (const visitor of rampageVisitors) {
      if (visitor.visitorId === rr.action.sourceId) continue; // Don't kill self
      const alreadyDying = deaths.some(d => d.playerId === visitor.visitorId);
      if (!alreadyDying) {
        deaths.push({
          playerId: visitor.visitorId,
          killerPlayerId: rr.action.sourceId,
          causeOfDeath: `Destrozado por ${rr.action.source.roleName}`,
        });
      }
    }
  }

  // Lookout results: send who visited the watched player
  const lookoutResults = results.filter(r => r.result === 'watching');
  for (const lr of lookoutResults) {
    const watchers = visits.get(lr.targetId) || [];
    const visitorNames = watchers
      .filter(v => v.visitorId !== lr.lookoutId) // Don't list self
      .map(v => v.visitorName);

    if (visitorNames.length > 0) {
      await sendResult(lr.lookoutId, 'lookout', `👁️ ${visitorNames.join(', ')} visitó a tu objetivo.`);
    } else {
      await sendResult(lr.lookoutId, 'lookout', '👁️ Nadie visitó a tu objetivo esta noche.');
    }
  }

  // Tracker results: send who the tracked player visited
  const trackerResults = results.filter(r => r.result === 'tracking');
  for (const tr of trackerResults) {
    const visitedId = playerVisited.get(tr.targetId);
    if (visitedId) {
      const visitedPlayer = await prisma.gamePlayer.findUnique({ where: { id: visitedId } });
      await sendResult(tr.trackerId, 'tracker', `🐾 Tu objetivo visitó a ${visitedPlayer?.name || 'alguien'}.`);
    } else {
      await sendResult(tr.trackerId, 'tracker', '🐾 Tu objetivo se quedó en casa esta noche.');
    }
  }

  // Spy results: similar to Lookout
  const spyResults = results.filter(r => r.result === 'bugged');
  for (const sr of spyResults) {
    const bugVisitors = visits.get(sr.targetId) || [];
    const visitorNames = bugVisitors.map(v => v.visitorName);
    if (visitorNames.length > 0) {
      await sendResult(sr.spyId, 'spy', `🕵️ ${visitorNames.join(', ')} visitó a tu objetivo.`);
    } else {
      await sendResult(sr.spyId, 'spy', '🕵️ Nadie visitó a tu objetivo esta noche.');
    }
  }

  // Check for poisoned players from previous night that weren't healed
  const allAlivePlayers = await prisma.gamePlayer.findMany({ where: { gameId, alive: true } });
  for (const p of allAlivePlayers) {
    const pState = p.roleState || {};
    if (pState.poisoned && !healed.has(p.id)) {
      deaths.push({
        playerId: p.id,
        killerPlayerId: pState.poisonedBy || null,
        causeOfDeath: 'Murió envenenado',
      });
      // Clear poison
      await prisma.gamePlayer.update({
        where: { id: p.id },
        data: { roleState: { ...pState, poisoned: false, poisonedBy: null } },
      });
    } else if (pState.poisoned && healed.has(p.id)) {
      // Healed from poison
      await prisma.gamePlayer.update({
        where: { id: p.id },
        data: { roleState: { ...pState, poisoned: false, poisonedBy: null } },
      });
      await sendResult(p.id, 'healed', '🏥 Fuiste curado del veneno.');
    }
  }

  // --- PASS 3: Process deaths ---
  for (const death of deaths) {
    // Unstoppable ignores healing and vests
    if (!death.unstoppable) {
      if (healed.has(death.playerId)) continue; // Was healed
      if (vested.has(death.playerId)) continue;  // Had vest active
    }

    // Avoid double-death
    const alreadyDead = await prisma.gamePlayer.findUnique({ where: { id: death.playerId } });
    if (!alreadyDead?.alive) continue;

    const deadPlayer = await prisma.gamePlayer.update({
      where: { id: death.playerId },
      data: {
        alive: false,
        diedOnDay: game.day,
        diedOnPhase: 'NIGHT',
        causeOfDeath: death.causeOfDeath,
      },
    });

    // Get killer's death note
    let killerDeathNote = null;
    if (death.killerPlayerId) {
      const killer = await prisma.gamePlayer.findUnique({
        where: { id: death.killerPlayerId },
        select: { deathNote: true },
      });
      killerDeathNote = killer?.deathNote || null;
    }

    // If cleaned by Janitor, hide role info
    const isCleaned = cleaned.has(death.playerId);

    io.to(gameCode).emit('player:died', {
      playerId: deadPlayer.id,
      playerName: deadPlayer.name,
      position: deadPlayer.position,
      roleName: isCleaned ? '???' : deadPlayer.roleName,
      faction: isCleaned ? '???' : deadPlayer.faction,
      causeOfDeath: death.causeOfDeath,
      phase: 'NIGHT',
      will: deadPlayer.will || null,
      deathNote: killerDeathNote || null,
    });

    // Join dead player to the dead chat room
    await joinDeadRoom(gameCode, death.playerId, io);
  }

  // Store blackmailed players in game state for day phase restriction
  if (blackmailed.size > 0) {
    const currentGame = await prisma.game.findUnique({ where: { id: gameId } });
    const config = (currentGame?.config && typeof currentGame.config === 'object') ? currentGame.config : {};
    await prisma.game.update({
      where: { id: gameId },
      data: { config: { ...config, blackmailedPlayers: Array.from(blackmailed) } },
    });
  }

  return results;
}

// ============================================
// WIN CONDITION CHECK
// ============================================

/**
 * Check if any faction has won
 */
function checkWinCondition(alivePlayers) {
  const townAlive = alivePlayers.filter(p => p.faction === 'TOWN').length;
  const mafiaAlive = alivePlayers.filter(p => p.faction === 'MAFIA').length;
  const neutralKillers = alivePlayers.filter(
    p => p.faction === 'NEUTRAL' && p.roleState?.nightActionType?.includes('KILL')
  ).length;

  // Mafia wins: mafia >= town + neutralKillers
  if (mafiaAlive > 0 && mafiaAlive >= townAlive + neutralKillers) {
    return 'MAFIA';
  }

  // Town wins: all evils are dead
  if (mafiaAlive === 0 && neutralKillers === 0) {
    return 'TOWN';
  }

  // Serial Killer/Arsonist wins solo
  if (neutralKillers > 0 && townAlive === 0 && mafiaAlive === 0) {
    return 'NEUTRAL';
  }

  // Draw: everyone dead
  if (alivePlayers.length === 0) {
    return 'DRAW';
  }

  return null; // Game continues
}

/**
 * End the game
 */
async function endGame(gameId, gameCode, winner, io) {
  // Clear timer + interval
  const existing = gameTimers.get(gameCode);
  if (existing?.timer) clearTimeout(existing.timer);
  if (existing?.interval) clearInterval(existing.interval);
  gameTimers.delete(gameCode);

  // Update game
  await prisma.game.update({
    where: { id: gameId },
    data: {
      status: 'FINISHED',
      winnerFaction: winner,
      endedAt: new Date(),
    },
  });

  // Get all players with roles for reveal
  const players = await prisma.gamePlayer.findMany({
    where: { gameId },
    orderBy: { position: 'asc' },
  });

  const winnerNames = {
    TOWN: '🏘️ ¡El Pueblo gana!',
    MAFIA: '🔪 ¡La Mafia gana!',
    NEUTRAL: '💀 ¡Los Neutrales ganan!',
    DRAW: '☠️ ¡Empate! Todos murieron...',
  };

  // Separate winners and losers
  const winningPlayers = [];
  const losingPlayers = [];
  
  for (const p of players) {
    const playerData = {
      id: p.id,
      name: p.name,
      roleName: p.roleName || 'Desconocido',
      faction: p.faction || 'UNKNOWN',
    };
    
    if (winner === 'DRAW') {
      losingPlayers.push(playerData);
    } else if (p.faction === winner) {
      winningPlayers.push(playerData);
    } else {
      losingPlayers.push(playerData);
    }
  }

  io.to(gameCode).emit('game:ended', {
    winner,
    message: winnerNames[winner] || 'Fin del juego',
    winningPlayers,
    losingPlayers,
    players: players.map(p => ({
      id: p.id,
      name: p.name,
      position: p.position,
      roleName: p.roleName,
      faction: p.faction,
      alive: p.alive,
      roleState: p.roleState,
    })),
  });

  await prisma.gameEvent.create({
    data: {
      gameId,
      type: 'GAME_ENDED',
      data: { winner, playerCount: players.length },
      day: (await prisma.game.findUnique({ where: { id: gameId } })).day,
      phase: 'DAY',
    },
  });

  // Clean up bots
  unregisterBots(gameCode);

  console.log(`🏁 Game ${gameCode} ended. Winner: ${winner}`);
}

// ============================================
// TRIAL VERDICT RESOLUTION (when timer expires)
// ============================================

/**
 * Resolve the trial verdict based on votes collected so far.
 * Called when DEFENSE phase timer expires.
 */
async function resolveTrialVerdict(gameId, gameCode, io) {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: { players: { where: { alive: true } } },
  });
  if (!game) return;

  // Find the accused
  const lastNomination = await prisma.vote.findFirst({
    where: { gameId, day: game.day, voteType: 'NOMINATION' },
    orderBy: { timestamp: 'desc' },
  });
  if (!lastNomination) return;

  // Get trial votes
  const trialVotes = await prisma.vote.findMany({
    where: { gameId, day: game.day, voteType: 'TRIAL', nomineeId: lastNomination.nomineeId },
  });

  const guiltyCount = trialVotes.filter(v => v.vote === 'GUILTY').length;
  const innocentCount = trialVotes.filter(v => v.vote === 'INNOCENT').length;

  const accused = await prisma.gamePlayer.findUnique({
    where: { id: lastNomination.nomineeId },
  });

  if (guiltyCount > innocentCount) {
    // GUILTY - Execute
    await prisma.gamePlayer.update({
      where: { id: lastNomination.nomineeId },
      data: {
        alive: false,
        diedOnDay: game.day,
        diedOnPhase: 'DAY',
        causeOfDeath: 'Ejecutado por el pueblo',
      },
    });

    io.to(gameCode).emit('player:executed', {
      playerId: lastNomination.nomineeId,
      playerName: accused?.name || 'Desconocido',
      position: accused?.position,
      roleName: accused?.roleName,
      faction: accused?.faction,
      will: accused?.will || null,
      guiltyCount,
      innocentCount,
    });

    // Join dead room
    await joinDeadRoom(gameCode, lastNomination.nomineeId, io);

    // Check win condition
    const remainingPlayers = await prisma.gamePlayer.findMany({
      where: { gameId, alive: true },
    });
    const winner = checkWinCondition(remainingPlayers);
    if (winner) {
      await endGame(gameId, gameCode, winner, io);
    }
  } else {
    // INNOCENT / tie - Acquitted
    io.to(gameCode).emit('player:acquitted', {
      playerId: lastNomination.nomineeId,
      playerName: accused?.name || 'Desconocido',
      guiltyCount,
      innocentCount,
    });
  }
}

// ============================================
// NIGHT ACTION SUBMISSION
// ============================================

/**
 * Submit a night action for a player
 */
export async function submitNightAction(gameId, playerId, targetId, io, gameCode, target2Id = null) {
  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game || game.phase !== 'NIGHT') return null;

  const player = await prisma.gamePlayer.findUnique({ where: { id: playerId } });
  if (!player || !player.alive) return null;

  const roleState = player.roleState || {};
  let actionType = roleState.nightActionType || 'NONE';

  if (actionType === 'NONE') return null;

  // -- Transporter: requires 2 targets --
  if (actionType === 'TRANSPORT' && (!targetId || !target2Id)) {
    return null; // Need both targets
  }

  // -- Vigilante: check bullets --
  if (player.roleName?.toLowerCase() === 'vigilante') {
    const bullets = roleState.usesRemaining ?? 3;
    if (bullets <= 0) return null; // No bullets left
    if (roleState.guiltyKill) return null; // Paralyzed by guilt

    // Decrement bullets
    await prisma.gamePlayer.update({
      where: { id: playerId },
      data: { roleState: { ...roleState, usesRemaining: bullets - 1 } },
    });
  }

  // -- Godfather: delegate kill to Mafioso if present --
  let actualSourceId = playerId;
  if (player.roleName?.toLowerCase() === 'godfather') {
    const mafioso = await prisma.gamePlayer.findFirst({
      where: {
        gameId,
        alive: true,
        roleName: { contains: 'Mafioso', mode: 'insensitive' },
      },
    });
    if (mafioso) {
      // Mafioso executes the kill, Godfather stays home (harder to find by Lookout)
      actualSourceId = mafioso.id;
    }
  }

  // Upsert: replace existing action for this player this night
  const existing = await prisma.gameAction.findFirst({
    where: { gameId, sourceId: actualSourceId, night: game.day },
  });

  if (existing) {
    await prisma.gameAction.update({
      where: { id: existing.id },
      data: {
        targetId,
        target2Id,
        actionType,
        priority: roleState.actionPriority || 5,
      },
    });
  } else {
    await prisma.gameAction.create({
      data: {
        gameId,
        sourceId: actualSourceId,
        targetId,
        target2Id,
        night: game.day,
        actionType,
        priority: roleState.actionPriority || 5,
      },
    });
  }

  return { actionType, targetId, target2Id };
}

// ============================================
// VOTING SYSTEM
// ============================================

/**
 * Submit a vote to nominate a player
 */
export async function submitVote(gameId, voterId, nomineeId, gameCode, io) {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: { players: { where: { alive: true } } },
  });
  if (!game || game.phase !== 'VOTING') return null;

  // Get voter info to check if Mayor revealed
  const voter = await prisma.gamePlayer.findUnique({ where: { id: voterId } });
  const voterRoleState = voter?.roleState || {};
  const isMayorRevealed = voter?.roleName?.toLowerCase() === 'mayor' && voterRoleState.revealed;
  
  // Mayor's vote counts as 3 votes
  const voteWeight = isMayorRevealed ? 3 : 1;

  // Create vote(s) - Mayor creates 3 votes
  for (let i = 0; i < voteWeight; i++) {
    await prisma.vote.create({
      data: {
        gameId,
        voterId,
        nomineeId,
        day: game.day,
        voteType: 'NOMINATION',
        vote: 'GUILTY',
      },
    });
  }

  // Count votes for this nominee
  const votes = await prisma.vote.findMany({
    where: { gameId, nomineeId, day: game.day, voteType: 'NOMINATION' },
  });

  const nominee = await prisma.gamePlayer.findUnique({ where: { id: nomineeId } });

  const currentVotes = votes.length;
  const requiredVotes = Math.ceil(game.players.length / 2);

  io.to(gameCode).emit('vote:cast', {
    voterId,
    voterName: voter?.name || 'Desconocido',
    nomineeId,
    nomineeName: nominee?.name || 'Desconocido',
    currentVotes,
    requiredVotes,
    voteWeight, // Indicate if this was a Mayor vote
  });

  // Check if majority reached
  if (currentVotes >= requiredVotes) {
    // Move to TRIAL
    await prisma.game.update({
      where: { id: gameId },
      data: { phase: 'TRIAL' },
    });

    io.to(gameCode).emit('phase:change', {
      phase: 'TRIAL',
      day: game.day,
      message: `⚖️ ${nominee?.name} ha sido enviado a juicio.`,
      accused: {
        id: nomineeId,
        name: nominee?.name,
        position: nominee?.position,
      },
    });

    // Clear existing timer and start trial timer
    const existingTimer = gameTimers.get(gameCode);
    if (existingTimer?.timer) clearTimeout(existingTimer.timer);
    if (existingTimer?.interval) clearInterval(existingTimer.interval);
    startPhaseTimer(gameId, gameCode, 'TRIAL', game.day, io);

    // Trigger bot defense if accused is a bot, then verdicts
    setTimeout(() => triggerDefense(gameId, gameCode, nomineeId, io), 2000);
    setTimeout(() => triggerVerdict(gameId, gameCode, nomineeId, io), 6000);
  }

  return { voteCount: currentVotes, majority: requiredVotes };
}

/**
 * Submit a trial verdict (guilty/innocent/abstain)
 */
export async function submitVerdict(gameId, voterId, verdict, gameCode, io) {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: { players: { where: { alive: true } } },
  });

  if (!game || (game.phase !== 'TRIAL' && game.phase !== 'DEFENSE')) return null;

  // Find the accused (latest nomination)
  const lastNomination = await prisma.vote.findFirst({
    where: { gameId, day: game.day, voteType: 'NOMINATION' },
    orderBy: { timestamp: 'desc' },
  });

  if (!lastNomination) return null;

  await prisma.vote.create({
    data: {
      gameId,
      voterId,
      nomineeId: lastNomination.nomineeId,
      day: game.day,
      voteType: 'TRIAL',
      vote: verdict, // GUILTY, INNOCENT, ABSTAIN
    },
  });

  // Count trial votes
  const trialVotes = await prisma.vote.findMany({
    where: { gameId, day: game.day, voteType: 'TRIAL', nomineeId: lastNomination.nomineeId },
  });

  const guiltyCount = trialVotes.filter(v => v.vote === 'GUILTY').length;
  const innocentCount = trialVotes.filter(v => v.vote === 'INNOCENT').length;
  const totalVoters = game.players.filter(p => p.id !== lastNomination.nomineeId).length;

  // Get voter info for display
  const voter = await prisma.gamePlayer.findUnique({ where: { id: voterId } });

  io.to(gameCode).emit('verdict:update', {
    voterId,
    voterName: voter?.name || 'Desconocido',
    verdict,
    guiltyCount,
    innocentCount,
    abstainCount: trialVotes.filter(v => v.vote === 'ABSTAIN').length,
    totalVoters,
    voted: trialVotes.length,
  });

  // Check if all alive players have voted (excluding accused)
  if (trialVotes.length >= totalVoters) {
    const accused = await prisma.gamePlayer.findUnique({
      where: { id: lastNomination.nomineeId },
    });

    if (guiltyCount > innocentCount) {
      // GUILTY - Execute
      await prisma.gamePlayer.update({
        where: { id: lastNomination.nomineeId },
        data: {
          alive: false,
          diedOnDay: game.day,
          diedOnPhase: 'DAY',
          causeOfDeath: 'Ejecutado por el pueblo',
        },
      });

      io.to(gameCode).emit('player:executed', {
        playerId: lastNomination.nomineeId,
        playerName: accused?.name,
        position: accused?.position,
        roleName: accused?.roleName,
        faction: accused?.faction,
        will: accused?.will || null,
        guiltyCount,
        innocentCount,
      });

      // Join dead room
      await joinDeadRoom(gameCode, lastNomination.nomineeId, io);

      // Check win condition after execution
      const remainingPlayers = await prisma.gamePlayer.findMany({
        where: { gameId, alive: true },
      });
      const winner = checkWinCondition(remainingPlayers);
      if (winner) {
        await endGame(gameId, gameCode, winner, io);
        return;
      }
    } else {
      // INNOCENT - Acquitted
      io.to(gameCode).emit('player:acquitted', {
        playerId: lastNomination.nomineeId,
        playerName: accused?.name || 'Desconocido',
        guiltyCount,
        innocentCount,
      });
    }

    // Transition to NIGHT
    await prisma.game.update({
      where: { id: gameId },
      data: { phase: 'NIGHT' },
    });

    io.to(gameCode).emit('phase:change', {
      phase: 'NIGHT',
      day: game.day,
      message: '🌙 La noche cae sobre el pueblo...',
    });

    const existingTimer2 = gameTimers.get(gameCode);
    if (existingTimer2?.timer) clearTimeout(existingTimer2.timer);
    if (existingTimer2?.interval) clearInterval(existingTimer2.interval);
    startPhaseTimer(gameId, gameCode, 'NIGHT', game.day, io);

    // Trigger bot night actions
    setTimeout(() => triggerNightActions(gameId, gameCode, io), 3000);
    setTimeout(() => triggerMafiaChat(gameId, gameCode, io), 2000);
  }
}

// ============================================
// HELPER - Access connectedClients from index.js
// ============================================

let _connectedClients = null;

export function setConnectedClients(clients) {
  _connectedClients = clients;
}

function getClientInfo(socketId) {
  return _connectedClients?.get(socketId) || null;
}

export { advancePhase, checkWinCondition };
