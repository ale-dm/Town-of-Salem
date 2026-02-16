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
        iconImage: role.iconImage,
        iconCircled: role.iconCircled,
        color: role.color,
        attackValue: role.attackValue,
        defenseValue: role.defenseValue,
        actionPriority: role.actionPriority,
        nightActionType: role.nightActionType,
        nightActionLabel: role.nightActionLabel,
        nightActionLabel2: role.nightActionLabel2,
        goalEs: role.goalEs,
        goalEn: role.goalEn,
        abilitiesEs: role.abilitiesEs,
        abilitiesEn: role.abilitiesEn,
        attributesListEs: role.attributesListEs || [],
        attributesListEn: role.attributesListEn || [],
        strategyTips: role.strategyTips || [],
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
            immunities: role.immunities || {},
            usesRemaining: -1, // unlimited
            isRoleblocked: false,
            isProtected: false,
            isHealed: false,
            visitedBy: [],
            selfHealUsed: role.slug === 'doctor' ? false : undefined,
          },
        },
      });
    }
  }

  return assignments;
}

/**
 * Assign targets to Executioners
 * Target must be a Town member, cannot be Mayor or Jailor
 */
async function assignExecutionerTargets(gameId) {
  const executioners = await prisma.gamePlayer.findMany({
    where: {
      gameId,
      roleName: { contains: 'Executioner', mode: 'insensitive' },
    },
  });

  if (executioners.length === 0) return;

  // Get all Town players (excluding Mayor and Jailor)
  const townPlayers = await prisma.gamePlayer.findMany({
    where: {
      gameId,
      faction: 'TOWN',
      roleName: {
        notIn: ['Mayor', 'Jailor'],
      },
    },
  });

  if (townPlayers.length === 0) {
    console.warn('No valid Executioner targets found');
    return;
  }

  // Assign a random Town member as target to each Executioner
  for (const exe of executioners) {
    const target = townPlayers[Math.floor(Math.random() * townPlayers.length)];
    
    await prisma.gamePlayer.update({
      where: { id: exe.id },
      data: {
        roleState: {
          ...(exe.roleState || {}),
          executionerTargetId: target.id,
          executionerTargetName: target.name,
        },
      },
    });

    console.log(`⚖️ Executioner ${exe.name} assigned target: ${target.name}`);
  }
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

  // 1.5 Assign targets to Executioners
  await assignExecutionerTargets(gameId);

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

      // Get additional data for Executioner (target info)
      let executionerTarget = null;
      if (assignment.slug === 'executioner') {
        const player = await prisma.gamePlayer.findUnique({
          where: { id: assignment.playerId },
        });
        const roleState = player?.roleState || {};
        if (roleState.executionerTargetId) {
          const target = await prisma.gamePlayer.findUnique({
            where: { id: roleState.executionerTargetId },
            select: { id: true, name: true, position: true },
          });
          executionerTarget = target;
        }
      }

      s.emit('role:assigned', {
        roleName: assignment.roleName,
        roleNameEs: assignment.roleNameEs,
        faction: assignment.faction,
        slug: assignment.slug,
        icon: assignment.icon,
        iconImage: assignment.iconImage,
        iconCircled: assignment.iconCircled,
        color: assignment.color,
        attackValue: assignment.attackValue,
        defenseValue: assignment.defenseValue,
        nightActionLabel: assignment.nightActionLabel,
        nightActionLabel2: assignment.nightActionLabel2,
        goalEs: assignment.goalEs,
        goalEn: assignment.goalEn,
        abilitiesEs: toArray(assignment.abilitiesEs),
        abilitiesEn: toArray(assignment.abilitiesEn),
        attributesListEs: assignment.attributesListEs || [],
        attributesListEn: assignment.attributesListEn || [],
        executionerTarget: executionerTarget, // Only for Executioner
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
  await startPhaseTimer(gameId, gameCode, 'DAY', 1, io);

  console.log(`🎮 Game ${gameCode} started with ${assignments.length} players`);
  return assignments;
}

/**
 * Start a timer for the current phase
 */
async function startPhaseTimer(gameId, gameCode, phase, day, io) {
  // Clear existing timer + interval
  const existing = gameTimers.get(gameCode);
  if (existing?.timer) clearTimeout(existing.timer);
  if (existing?.interval) clearInterval(existing.interval);

  // Phase durations — read from game config, fallback to Town of Salem defaults
  const game = await prisma.game.findUnique({ where: { id: gameId } });
  const cfg = game?.config || {};
  const durations = {
    NIGHT: cfg.nightDuration || 37,
    DAY: cfg.dayDuration || 15,          // Day 1 only (greetings)
    DISCUSSION: cfg.discussionDuration || 45,   // Day 2+ discussion
    VOTING: cfg.votingDuration || 30,
    DEFENSE: cfg.defenseDuration || 20,
    JUDGEMENT: cfg.judgementDuration || 20,
    LAST_WORDS: cfg.lastWordsDuration || 7,
  };

  const duration = durations[phase] || 37;
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

  // Setup jail room if NIGHT phase + auto-jail Jailor's target
  if (phase === 'NIGHT') {
    await autoJailTarget(gameId, gameCode, day, io);
    setupJailRoom(gameId, gameCode, day, io);
  }

  // On Day 2+, reveal deaths before discussion starts
  if (phase === 'DISCUSSION' && day >= 2) {
    revealNightDeaths(gameId, gameCode, day, io);
  }
}

/**
 * Auto-jail the Jailor's selected target at the start of night
 */
async function autoJailTarget(gameId, gameCode, day, io) {
  try {
    // Find Jailor with a jailedTargetId in roleState
    const jailor = await prisma.gamePlayer.findFirst({
      where: {
        gameId,
        alive: true,
        roleName: { contains: 'Jailor', mode: 'insensitive' },
      },
    });

    if (!jailor || !jailor.roleState?.jailedTargetId) return;

    const targetId = jailor.roleState.jailedTargetId;
    const target = await prisma.gamePlayer.findUnique({ where: { id: targetId } });

    if (!target || !target.alive) {
      // Clear invalid target
      await prisma.gamePlayer.update({
        where: { id: jailor.id },
        data: { 
          roleState: { 
            ...jailor.roleState, 
            jailedTargetId: null 
          } 
        },
      });
      return;
    }

    // Create JAIL action for night resolution
    await prisma.gameAction.create({
      data: {
        gameId,
        sourceId: jailor.id,
        targetId,
        night: day,
        actionType: 'JAIL',
        priority: 1,
      },
    });

    console.log(`⚖️ Auto-jailed ${target.name} by Jailor ${jailor.name} on Night ${day}`);
  } catch (error) {
    console.error('Error auto-jailing target:', error);
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
 * Flow: NIGHT → DISCUSSION (Day2+ with death reveal) / DAY (Day1 greetings) → VOTING → DEFENSE → JUDGEMENT → [LAST_WORDS if guilty] → NIGHT
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
      // Resolve night actions, then go to day
      await resolveNightActions(gameId, gameCode, io);
      await handleVigilanteSuicide(gameId, gameCode, io);
      await handleMafiosoPromotion(gameId, gameCode, io);

      nextDay = day + 1;
      // Day 1 = greeting only (DAY phase), Day 2+ = DISCUSSION (with death reveal)
      nextPhase = nextDay === 1 ? 'DAY' : 'DISCUSSION';
      break;

    case 'DAY':
      // Day 1 greeting-only → straight to Night 1
      nextPhase = 'NIGHT';
      nextDay = day;
      break;

    case 'DISCUSSION':
      // Discussion ends → Voting
      nextPhase = 'VOTING';
      nextDay = day;
      break;

    case 'VOTING':
      // If no one was nominated, skip to night
      nextPhase = 'NIGHT';
      nextDay = day;
      break;

    case 'DEFENSE':
      // Defense ends → Judgement (voting guilty/innocent)
      nextPhase = 'JUDGEMENT';
      nextDay = day;
      break;

    case 'JUDGEMENT':
      // Judgement ends → resolve verdict
      await resolveTrialVerdict(gameId, gameCode, io);
      // Re-check if game ended from execution
      const postTrialGame = await prisma.game.findUnique({ where: { id: gameId } });
      if (!postTrialGame || postTrialGame.status !== 'PLAYING') return;

      // Check if verdict was guilty (LAST_WORDS was already transitioned in resolveTrialVerdict)
      // If LAST_WORDS was set, don't override
      const updatedGame = await prisma.game.findUnique({ where: { id: gameId } });
      if (updatedGame && updatedGame.phase === 'LAST_WORDS') {
        // resolveTrialVerdict already set phase to LAST_WORDS, just start timer
        await startPhaseTimer(gameId, gameCode, 'LAST_WORDS', day, io);
        return;
      }
      // If innocent, go to night
      nextPhase = 'NIGHT';
      nextDay = day;
      break;

    case 'LAST_WORDS':
      // Execute the player, then go to night
      await executeAfterLastWords(gameId, gameCode, io);
      const postExecGame = await prisma.game.findUnique({ where: { id: gameId } });
      if (!postExecGame || postExecGame.status !== 'PLAYING') return;
      nextPhase = 'NIGHT';
      nextDay = day;
      break;

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
    DAY: `☀️ Día ${nextDay} - ¡Bienvenidos al pueblo!`,
    DISCUSSION: `☀️ Día ${nextDay} - El pueblo despierta...`,
    NIGHT: '🌙 La noche cae sobre el pueblo...',
    VOTING: '🗳️ Es hora de votar. ¿Quién será enviado a juicio?',
    DEFENSE: '🛡️ El acusado puede defenderse.',
    JUDGEMENT: '⚖️ ¡Hora del juicio! Voten Culpable o Inocente.',
    LAST_WORDS: '💀 Últimas palabras antes de la ejecución...',
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
        // Day 1 greetings
        setTimeout(() => triggerDayChat(gameId, gameCode, io, true), 2000);
        break;
      case 'DISCUSSION':
        // Day 2+ discussion
        setTimeout(async () => {
          const { updateAllBotsSuspicions } = await import('./bots/botManager.js');
          const players = await prisma.gamePlayer.findMany({
            where: { gameId },
            select: { id: true, name: true, alive: true, faction: true },
          });
          updateAllBotsSuspicions(gameCode, { type: 'day_start', players });
          triggerDayChat(gameId, gameCode, io, false);
        }, 4000);
        scheduleDayChatter(gameId, gameCode, io);
        break;
      case 'VOTING':
        setTimeout(() => triggerVoting(gameId, gameCode, io), 3000);
        break;
      case 'DEFENSE': {
        // Bots defend themselves if on trial
        const defGame = await prisma.game.findUnique({ where: { id: gameId } });
        if (defGame) {
          const latestNom = await prisma.vote.findFirst({
            where: { gameId, day: defGame.day, voteType: 'NOMINATION' },
            orderBy: { timestamp: 'desc' },
          });
          if (latestNom) {
            setTimeout(() => triggerDefense(gameId, gameCode, latestNom.nomineeId, io), 2000);
          }
        }
        break;
      }
      case 'JUDGEMENT': {
        // Bots submit verdicts
        const judgGame = await prisma.game.findUnique({ where: { id: gameId } });
        if (judgGame) {
          const latestNom = await prisma.vote.findFirst({
            where: { gameId, day: judgGame.day, voteType: 'NOMINATION' },
            orderBy: { timestamp: 'desc' },
          });
          if (latestNom) {
            setTimeout(() => triggerVerdict(gameId, gameCode, latestNom.nomineeId, io), 3000);
          }
        }
        break;
      }
      case 'LAST_WORDS':
        // Nothing to do — only the accused speaks
        break;
    }
  } catch (err) {
    console.error('🤖 Bot trigger error:', err.message);
  }

  // Start next timer
  await startPhaseTimer(gameId, gameCode, nextPhase, nextDay, io);
}

// ============================================
// DEATH REVEAL SYSTEM (Day 2+)
// ============================================

/**
 * Reveal night deaths one by one with delays at the start of Discussion phase.
 * Each death shows: player name, role, testament, and cause of death.
 */
async function revealNightDeaths(gameId, gameCode, day, io) {
  try {
    // Find all players who died last night (night = day - 1, since day just incremented)
    const nightDeaths = await prisma.gamePlayer.findMany({
      where: {
        gameId,
        alive: false,
        diedOnPhase: 'NIGHT',
        diedOnDay: day - 1,
      },
      orderBy: { position: 'asc' },
    });

    if (nightDeaths.length === 0) {
      // No deaths — announce it
      io.to(gameCode).emit('death:reveal', {
        type: 'NO_DEATHS',
        message: '☀️ El pueblo despierta en paz. Nadie murió esta noche.',
      });
      return;
    }

    // Also check for Vigilante suicides (died on DAY phase of current day)
    const daySuicides = await prisma.gamePlayer.findMany({
      where: {
        gameId,
        alive: false,
        diedOnPhase: 'DAY',
        diedOnDay: day,
      },
      orderBy: { position: 'asc' },
    });

    const allDeaths = [...nightDeaths, ...daySuicides];

    // Reveal deaths one by one with 3.5 second delays
    for (let i = 0; i < allDeaths.length; i++) {
      const deadPlayer = allDeaths[i];

      // Check if executed by Jailor
      const executeAction = await prisma.gameAction.findFirst({
        where: {
          gameId,
          targetId: deadPlayer.id,
          night: day - 1,
          actionType: 'EXECUTE',
        },
        include: { source: true },
      });
      const executedByJailor = !!executeAction;
      const executionNote = executeAction?.metadata?.executionNote || null;

      // Get killer's death note if available (for non-Jailor kills)
      let deathNote = null;
      if (!executedByJailor) {
        const killAction = await prisma.gameAction.findFirst({
          where: {
            gameId,
            targetId: deadPlayer.id,
            night: day - 1,
            actionType: { in: ['KILL_SINGLE', 'KILL_RAMPAGE'] },
          },
          include: { source: true },
        });
        if (killAction?.source) {
          const killer = await prisma.gamePlayer.findUnique({
            where: { id: killAction.sourceId },
            select: { deathNote: true },
          });
          deathNote = killer?.deathNote || null;
        }
      }

      // Check if cleaned by Janitor
      const cleanAction = await prisma.gameAction.findFirst({
        where: {
          gameId,
          targetId: deadPlayer.id,
          night: day - 1,
          actionType: 'CLEAN',
        },
      });
      const isCleaned = !!cleanAction;

      setTimeout(() => {
        io.to(gameCode).emit('death:reveal', {
          type: 'DEATH',
          index: i + 1,
          total: allDeaths.length,
          playerId: deadPlayer.id,
          playerName: deadPlayer.name,
          position: deadPlayer.position,
          roleName: isCleaned ? '???' : deadPlayer.roleName,
          faction: isCleaned ? '???' : deadPlayer.faction,
          causeOfDeath: deadPlayer.causeOfDeath || 'Asesinado durante la noche',
          will: deadPlayer.will || null,
          deathNote: deathNote,
          executionNote: executionNote,
          executedByJailor,
          isCleaned,
        });
      }, i * 3500); // 3.5 seconds between each reveal
    }

    // Check if any Executioners had one of the dead players as their target
    // If so, convert them to Jester
    const executioners = await prisma.gamePlayer.findMany({
      where: {
        gameId,
        alive: true,
        roleName: { contains: 'Executioner', mode: 'insensitive' },
      },
    });

    for (const exe of executioners) {
      const roleState = exe.roleState || {};
      const targetId = roleState.executionerTargetId;
      
      // Check if their target died this night
      if (targetId && allDeaths.some(d => d.id === targetId)) {
        const deadTarget = allDeaths.find(d => d.id === targetId);
        
        // Convert Executioner to Jester
        const jesterRole = await prisma.role.findFirst({
          where: { slug: 'jester' },
        });

        if (jesterRole) {
          await prisma.gamePlayer.update({
            where: { id: exe.id },
            data: {
              roleName: jesterRole.nameEn,
              faction: 'NEUTRAL',
              roleState: {
                slug: 'jester',
                icon: jesterRole.icon,
                color: jesterRole.color,
                attackValue: jesterRole.attackValue || 0,
                defenseValue: jesterRole.defenseValue || 0,
                actionPriority: jesterRole.actionPriority || 0,
                nightActionType: jesterRole.nightActionType || 'NONE',
                immunities: jesterRole.immunities || {},
                usesRemaining: -1,
                convertedFromExecutioner: true,
              },
            },
          });

          io.to(gameCode).emit('executioner:converted', {
            executionerId: exe.id,
            executionerName: exe.name,
            targetName: deadTarget.name,
            message: `⚖️ ${exe.name} era un Executioner, pero su objetivo murió. Ahora es un Jester.`,
          });

          console.log(`⚖️ Executioner ${exe.name} converted to Jester (target ${deadTarget.name} died)`);
        }
      }
    }

    // Update bot suspicions based on revealed deaths
    const { updateAllBotsSuspicions } = await import('./bots/botManager.js');
    const players = await prisma.gamePlayer.findMany({
      where: { gameId },
      select: { id: true, name: true, alive: true, faction: true },
    });
    
    updateAllBotsSuspicions(gameCode, {
      type: 'death_reveal',
      deaths: allDeaths.map(d => ({
        playerName: d.name,
        roleName: d.roleName,
        faction: d.faction,
      })),
      players,
    });

    console.log(`💀 Revealing ${allDeaths.length} deaths in game ${gameCode} (Day ${day})`);
  } catch (error) {
    console.error('Error revealing deaths:', error);
  }
}

// ============================================
// LAST WORDS EXECUTION
// ============================================

/**
 * Execute the guilty player after Last Words phase ends.
 * Shows their role and testament to everyone.
 */
async function executeAfterLastWords(gameId, gameCode, io) {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: { players: true },
  });
  if (!game) return;

  // Find the accused from the latest nomination
  const lastNomination = await prisma.vote.findFirst({
    where: { gameId, day: game.day, voteType: 'NOMINATION' },
    orderBy: { timestamp: 'desc' },
  });
  if (!lastNomination) return;

  const accused = await prisma.gamePlayer.findUnique({
    where: { id: lastNomination.nomineeId },
  });
  if (!accused) return;

  // Check if accused is Jester - they win on lynch!
  const isJester = accused.roleName?.toLowerCase().includes('jester');

  // Kill the player
  await prisma.gamePlayer.update({
    where: { id: accused.id },
    data: {
      alive: false,
      diedOnDay: game.day,
      diedOnPhase: 'DAY',
      causeOfDeath: 'Ejecutado por el pueblo',
    },
  });

  // Emit execution with full reveal
  io.to(gameCode).emit('player:executed', {
    playerId: accused.id,
    playerName: accused.name,
    position: accused.position,
    roleName: accused.roleName,
    faction: accused.faction,
    will: accused.will || null,
    isJester,
  });

  // Join dead room
  await joinDeadRoom(gameCode, accused.id, io);

  // If Jester was lynched, they win and can haunt one guilty voter
  if (isJester) {
    // Get all players who voted guilty
    const guiltyVoters = await prisma.vote.findMany({
      where: {
        gameId,
        day: game.day,
        voteType: 'TRIAL',
        nomineeId: lastNomination.nomineeId,
        vote: 'GUILTY',
      },
      include: { voter: true },
    });

    const guiltyVotersList = guiltyVoters
      .filter(v => v.voter.alive) // Only alive voters can be haunted
      .map(v => ({
        id: v.voter.id,
        name: v.voter.name,
        position: v.voter.position,
      }));

    // Mark Jester as winner
    await prisma.gamePlayer.update({
      where: { id: accused.id },
      data: {
        roleState: {
          ...(accused.roleState || {}),
          hasWon: true,
          canHaunt: guiltyVotersList.length > 0,
        },
      },
    });

    // Notify Jester they won and can choose who to haunt
    io.to(gameCode).emit('jester:won', {
      jesterId: accused.id,
      jesterName: accused.name,
      guiltyVoters: guiltyVotersList,
      message: guiltyVotersList.length > 0
        ? '🎭 ¡El Jester ha ganado! Puede hauntar a uno de sus acusadores...'
        : '🎭 ¡El Jester ha ganado! (No hay acusadores vivos para hauntar)',
    });

    console.log(`🎭 Jester ${accused.name} won! Can haunt: ${guiltyVotersList.length} players`);
  }

  // Check if any Executioners had this player as their target (they win!)
  const executioners = await prisma.gamePlayer.findMany({
    where: {
      gameId,
      alive: true,
      roleName: { contains: 'Executioner', mode: 'insensitive' },
    },
  });

  for (const exe of executioners) {
    const roleState = exe.roleState || {};
    if (roleState.executionerTargetId === accused.id) {
      // Executioner wins!
      await prisma.gamePlayer.update({
        where: { id: exe.id },
        data: {
          roleState: {
            ...roleState,
            hasWon: true,
          },
        },
      });

      io.to(gameCode).emit('executioner:won', {
        executionerId: exe.id,
        executionerName: exe.name,
        targetName: accused.name,
        message: `⚖️ ¡${exe.name} (Executioner) ha ganado! Su objetivo ${accused.name} fue linchado.`,
      });

      console.log(`⚖️ Executioner ${exe.name} won! Target ${accused.name} was lynched.`);
    }
  }

  // Check win condition (only for non-Jester executions or after Jester individual win)
  const remainingPlayers = await prisma.gamePlayer.findMany({
    where: { gameId, alive: true },
  });
  const winner = checkWinCondition(remainingPlayers);
  if (winner) {
    await endGame(gameId, gameCode, winner, io);
  }
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
  const deaths = [];               // { playerId, killerPlayerId, causeOfDeath, attackValue, unstoppable }
  const healed = new Set();         // player IDs that were healed (for notification)
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
  const crusaderProtected = new Map(); // targetId -> crusaderId (Crusader protecting target)
  const transported = [];           // [{id1, id2}] transport swaps
  const grantedDefense = new Map(); // playerId -> max defense level granted this night
  const controlledTargets = new Map(); // playerId -> { newTargetId, witchId } (Witch control redirects)

  // Helper: grant defense to a player (keeps highest)
  const grantDefense = (playerId, level) => {
    const current = grantedDefense.get(playerId) || 0;
    if (level > current) grantedDefense.set(playerId, level);
  };

  // Helper: get effective defense for a player (max of natural + granted)
  const getEffectiveDefense = (playerId, naturalDefense) => {
    return Math.max(naturalDefense || 0, grantedDefense.get(playerId) || 0);
  };

  // Helper: apply transports to a target ID
  const applyTransports = (targetId) => {
    if (!targetId) return targetId;
    for (const swap of transported) {
      if (targetId === swap.id1) return swap.id2;
      if (targetId === swap.id2) return swap.id1;
    }
    return targetId;
  };

  // Helper: record a visit (with transport redirection)
  const recordVisit = (visitorId, visitorName, targetId) => {
    if (!targetId) return;
    // Apply transports: the visit is redirected
    const actualTarget = applyTransports(targetId);
    if (!visits.has(actualTarget)) visits.set(actualTarget, []);
    visits.get(actualTarget).push({ visitorId, visitorName });
    playerVisited.set(visitorId, actualTarget);
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

    // Apply Witch control: redirect action to new target
    if (controlledTargets.has(action.sourceId)) {
      const control = controlledTargets.get(action.sourceId);
      // Prevent witch self-visit: if new target would be the witch, block the action
      if (action.targetId === control.witchId || control.newTargetId === control.witchId) {
        roleblocked.add(action.sourceId);
        continue;
      }
      // Redirect the target to witch's chosen new target
      action.targetId = control.newTargetId;
      // Reload target info
      action.target = await prisma.gamePlayer.findUnique({ 
        where: { id: action.targetId }
      });
    }

    const sourceState = action.source.roleState || {};
    const targetState = action.target?.roleState || {};

    switch (action.actionType) {
      // ========== PRIORITY 1: JAIL ==========
      case 'JAIL': {
        if (action.targetId) {
          jailed.add(action.targetId);
          roleblocked.add(action.targetId); // Jailed also blocks their action
          grantDefense(action.targetId, 2); // Jail grants Powerful defense
          recordVisit(action.sourceId, action.source.name, action.targetId); // Jailor always visits
          results.push({ action, result: 'jailed', targetId: action.targetId });
          // Notify jailed player
          await sendResult(action.targetId, 'jailed', '⛓️ Fuiste encarcelado por el Jailor.');
        }
        break;
      }

      case 'EXECUTE': {
        // Jailor executes jailed player — Unstoppable attack
        if (action.targetId && jailed.has(action.targetId)) {
          // Check if victim is Town — if so, Jailor loses all remaining executions
          const victim = action.target;
          const isVictimTown = victim?.faction === 'TOWN';
          
          if (isVictimTown) {
            // Jailor loses ALL remaining executions
            await prisma.gamePlayer.update({
              where: { id: action.sourceId },
              data: { 
                roleState: { 
                  ...sourceState, 
                  executionsUsed: 3,
                  executionsLost: true,
                } 
              },
            });
            await sendResult(action.sourceId, 'execution_guilt', '💔 Ejecutaste a un miembro del Town. Has perdido todas tus ejecuciones.');
          }

          const executionNote = action.metadata?.executionNote || null;

          deaths.push({
            playerId: action.targetId,
            killerPlayerId: action.sourceId,
            causeOfDeath: 'Ejecutado por el Jailor',
            attackValue: 3,
            unstoppable: true,
            byJailor: true,
            executionNote,
          });
          results.push({ action, result: 'executed', targetId: action.targetId });
        }
        break;
      }

      case 'HAUNT': {
        // Jester haunts a guilty voter — Unstoppable attack
        if (action.targetId) {
          deaths.push({
            playerId: action.targetId,
            killerPlayerId: action.sourceId,
            causeOfDeath: 'Haunted por el Jester',
            attackValue: 3,
            unstoppable: true,
            byJester: true,
          });
          results.push({ action, result: 'haunted', targetId: action.targetId });
          await sendResult(action.targetId, 'haunted', '👻 ¡Fuiste haunted por el Jester!');
        }
        break;
      }

      // ========== PRIORITY 2: ROLEBLOCK & CONTROL ==========
      // ========== PRIORITY 2: TRANSPORT (early redirect) ==========
      case 'TRANSPORT': {
        // Transporter: swap two targets — all visitors are redirected
        if (action.targetId && action.target2Id) {
          // Cannot transport self
          if (action.sourceId === action.targetId || action.sourceId === action.target2Id) {
            await sendResult(action.sourceId, 'transport_failed', '❌ No puedes transportarte a ti mismo.');
            break;
          }

          // Cannot transport same person with themselves
          if (action.targetId === action.target2Id) {
            await sendResult(action.sourceId, 'transport_failed', '❌ No puedes transportar a alguien consigo mismo.');
            break;
          }

          // Cannot transport jailed targets
          if (jailed.has(action.targetId) || jailed.has(action.target2Id)) {
            await sendResult(action.sourceId, 'transport_failed', '⛓️ Uno de tus objetivos estaba en la cárcel, no pudiste transportarlos.');
            break;
          }

          // Check if targets are alive
          if (!action.target?.alive || !action.target2Id) {
            const target2 = await prisma.gamePlayer.findUnique({ where: { id: action.target2Id } });
            if (!action.target?.alive || !target2?.alive) {
              await sendResult(action.sourceId, 'transport_failed', '❌ Uno de tus objetivos no está disponible.');
              break;
            }
          }

          // Add to transported list - this causes all future visits to be swapped
          transported.push({ id1: action.targetId, id2: action.target2Id, transporterId: action.sourceId });
          
          // Transporter visits both targets
          recordVisit(action.sourceId, action.source.name, action.targetId);
          recordVisit(action.sourceId, action.source.name, action.target2Id);
          
          results.push({ 
            action, 
            result: 'transported', 
            targetId: action.targetId, 
            target2Id: action.target2Id 
          });
          
          // Notify transported targets at end of night
          await sendResult(action.targetId, 'transported', '🔄 Fuiste transportado a otra ubicación.');
          await sendResult(action.target2Id, 'transported', '🔄 Fuiste transportado a otra ubicación.');

          console.log(`🔄 Transporter ${action.source.name} swapped ${action.target.name} and target2`);
        }
        break;
      }

      case 'ROLEBLOCK': {
        if (action.targetId) {
          const targetImmunities = targetState.immunities || {};
          const targetRole = action.target?.roleName?.toLowerCase();

          // Transporter is roleblock immune
          if (targetRole === 'transporter') {
            results.push({ action, result: 'roleblock_immune', targetId: action.targetId });
            await sendResult(action.targetId, 'roleblock_immune', '🛡️ Eres inmune al bloqueo de roles.');
            break;
          }

          // Special interaction: roleblocking Serial Killer — SK kills the roleblocker
          if (targetRole === 'serial killer') {
            deaths.push({
              playerId: action.sourceId,
              killerPlayerId: action.targetId,
              causeOfDeath: 'Asesinado por el Serial Killer al intentar bloquearlo',
              attackValue: 1,
            });
            results.push({ action, result: 'sk_revenge', targetId: action.targetId });
          } else if (targetRole === 'arsonist') {
            // Special interaction: roleblocking Arsonist — Arsonist douses the roleblocker
            const arsonistState = targetState || {};
            const dousedList = arsonistState.dousedPlayers || [];
            if (!dousedList.includes(action.sourceId)) {
              dousedList.push(action.sourceId);
              await prisma.gamePlayer.update({
                where: { id: action.targetId },
                data: { roleState: { ...arsonistState, dousedPlayers: dousedList } },
              });
            }
            roleblocked.add(action.targetId);
            await sendResult(action.sourceId, 'doused_by_arsonist', '🛢️ Fuiste rociado con gasolina al intentar bloquear al Pirómano.');
            await sendResult(action.targetId, 'douse_roleblocker', '🔥 Tu roleblocker fue rociado con gasolina.');
            results.push({ action, result: 'arsonist_douse_rb', targetId: action.targetId });
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
        // Witch: redirect target's action to a new target
        if (action.targetId && action.target2Id) {
          const targetImmunities = targetState.immunities || {};
          const targetRole = action.target?.roleName?.toLowerCase();

          // Witch cannot control herself
          if (action.targetId === action.sourceId) {
            await sendResult(action.sourceId, 'control_failed', '❌ No puedes controlarte a ti misma.');
            break;
          }

          // Cannot control to make them visit you (self-visit protection)
          if (action.target2Id === action.sourceId) {
            await sendResult(action.sourceId, 'control_failed', '❌ No puedes forzar a alguien a visitarte.');
            break;
          }

          // Check if target is control immune
          if (targetRole === 'transporter' || targetImmunities.control) {
            // Target is control immune — Witch still sees role but can't redirect
            results.push({ action, result: 'control_immune', targetId: action.targetId });
            await sendResult(action.sourceId, 'control_failed', `⚔️ ${action.target.name} es inmune a tu control.`);
          } else {
            // Successfully control the target
            controlledTargets.set(action.targetId, { 
              newTargetId: action.target2Id, 
              witchId: action.sourceId 
            });
            results.push({ action, result: 'controlled', targetId: action.targetId, target2Id: action.target2Id });
            await sendResult(action.targetId, 'controlled', '🧙 Fuiste controlado por una bruja. Tu acción fue redirigida.');
          }
          
          recordVisit(action.sourceId, action.source.name, action.targetId);
          
          // Witch sees the target's role regardless of immunity
          await sendResult(action.sourceId, 'witch_info', `🧙 Tu objetivo es: ${action.target?.roleName || 'Desconocido'}`);
          
          // Special case: If controlling Veteran on alert, Witch dies
          if (targetRole === 'veteran' && alerted.has(action.targetId)) {
            deaths.push({
              playerId: action.sourceId,
              killerPlayerId: action.targetId,
              causeOfDeath: 'Asesinado al controlar a un Veterano en alerta',
              attackValue: 2, // Powerful attack
            });
            await sendResult(action.sourceId, 'witch_vet_alert', '💀 Controlaste a un Veterano en alerta - moriste.');
          }
        }
        break;
      }

      // ========== PRIORITY 3: HEAL & PROTECT ==========
      case 'HEAL': {
        if (action.targetId) {
          healed.add(action.targetId);
          grantDefense(action.targetId, 2); // Doctor grants Powerful defense
          recordVisit(action.sourceId, action.source.name, action.targetId);
          results.push({ action, result: 'healed', targetId: action.targetId });
        }
        break;
      }

      case 'PROTECT': {
        // Bodyguard: protects target. If target is attacked, BG + attacker both die
        if (action.targetId) {
          protected_.add(action.targetId);
          grantDefense(action.targetId, 2); // BG grants Powerful defense
          recordVisit(action.sourceId, action.source.name, action.targetId);
          results.push({ action, result: 'protected', targetId: action.targetId, bodyguardId: action.sourceId });
        }
        break;
      }

      case 'VEST': {
        // Survivor self-protection — Basic defense
        vested.add(action.sourceId);
        grantDefense(action.sourceId, 1); // Vest grants Basic defense
        results.push({ action, result: 'vested' });
        break;
      }

      case 'ALERT': {
        // Veteran: alert mode — kill all visitors + gain Basic defense
        alerted.add(action.sourceId);
        grantDefense(action.sourceId, 1); // Veteran gains Basic defense when alerting
        results.push({ action, result: 'alerted' });
        break;
      }

      case 'TRAP': {
        // Trapper: place trap on target — grants Powerful defense + kills first attacker
        if (action.targetId) {
          protected_.add(action.targetId);
          grantDefense(action.targetId, 2); // Trap grants Powerful defense
          recordVisit(action.sourceId, action.source.name, action.targetId);
          results.push({ action, result: 'trapped', targetId: action.targetId, trapperId: action.sourceId });
        }
        break;
      }

      case 'PROTECT_TARGET': {
        // Guardian Angel: protect assigned target — Powerful defense + healing
        if (action.targetId) {
          healed.add(action.targetId);
          protected_.add(action.targetId);
          grantDefense(action.targetId, 2); // GA grants Powerful defense
          results.push({ action, result: 'ga_protected', targetId: action.targetId });
        }
        break;
      }

      case 'PROTECT_VISITORS': {
        // Crusader: protect target with Powerful defense + kill one random visitor
        if (action.targetId) {
          grantDefense(action.targetId, 2); // Crusader grants Powerful defense
          recordVisit(action.sourceId, action.source.name, action.targetId);
          crusaderProtected.set(action.targetId, action.sourceId);
          results.push({ action, result: 'crusader_protecting', targetId: action.targetId, crusaderId: action.sourceId });
        }
        break;
      }

      // TRANSPORT moved to priority 2 (see above)

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
          const naturalDefense = targetState.defenseValue || 0;
          const effectiveDefense = getEffectiveDefense(action.targetId, naturalDefense);
          const isJailed = jailed.has(action.targetId);

          // Jailed targets get Powerful defense (2) and can't be visited
          if (isJailed) {
            results.push({ action, result: 'target_jailed' });
            await sendResult(action.sourceId, 'attack_failed', 'Tu objetivo estaba protegido y no pudiste alcanzarlo.');
            break;
          }

          // Godfather orders kills but doesn't visit if there's a Mafioso alive to execute it
          const isGodfather = action.source.roleName?.toLowerCase() === 'godfather';
          let godfatherDelegates = false;
          if (isGodfather) {
            // Check if Mafioso is alive
            const mafiosoAlive = await prisma.gamePlayer.findFirst({
              where: {
                gameId,
                alive: true,
                roleName: { equals: 'Mafioso', mode: 'insensitive' },
              },
            });
            godfatherDelegates = !!mafiosoAlive;
          }

          // Only record visit if not a delegating Godfather
          if (!godfatherDelegates) {
            recordVisit(action.sourceId, action.source.name, action.targetId);
          }

          if (attackValue > effectiveDefense) {
            // Check Bodyguard protection — BG counterattack has Powerful attack (2)
            if (protected_.has(action.targetId)) {
              const bgResult = results.find(r => r.result === 'protected' && r.targetId === action.targetId);
              if (bgResult) {
                deaths.push({
                  playerId: bgResult.bodyguardId,
                  killerPlayerId: action.sourceId,
                  causeOfDeath: 'Se sacrificó protegiendo a su objetivo',
                  attackValue: attackValue,
                });
                deaths.push({
                  playerId: action.sourceId,
                  killerPlayerId: bgResult.bodyguardId,
                  causeOfDeath: 'Asesinado por el Guardaespaldas',
                  attackValue: 2, // BG counterattack is Powerful
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
              attackValue: attackValue,
            });
            results.push({ action, result: 'killed', targetId: action.targetId });

            // Vigilante: track if killed a Town member
            if (action.source.roleName?.toLowerCase() === 'vigilante' && action.target.faction === 'TOWN') {
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
            // Attack failed — defense >= attack
            results.push({ action, result: 'attack_failed', targetId: action.targetId });
            await sendResult(action.sourceId, 'attack_failed', 'Tu objetivo sobrevivió a tu ataque.');
            if (healed.has(action.targetId)) {
              await sendResult(action.targetId, 'healed', '🏥 Fuiste atacado pero un Doctor te salvó la vida.');
              const healAction = actions.find(a => a.actionType === 'HEAL' && a.targetId === action.targetId);
              if (healAction) {
                await sendResult(healAction.sourceId, 'heal_success', '🏥 Tu objetivo fue atacado pero lo salvaste.');
              }
            } else if (crusaderProtected.has(action.targetId)) {
              await sendResult(action.targetId, 'protected', '🛡️ Fuiste atacado pero alguien te protegió.');
            } else if (vested.has(action.targetId)) {
              await sendResult(action.targetId, 'attack_survived', '🛡️ Tu chaleco te protegió del ataque.');
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
          const naturalDefense = targetState.defenseValue || 0;
          const effectiveDefense = getEffectiveDefense(action.targetId, naturalDefense);

          if (attackValue > effectiveDefense) {
            deaths.push({
              playerId: action.targetId,
              killerPlayerId: action.sourceId,
              causeOfDeath: `Destrozado por ${action.source.roleName}`,
              attackValue: attackValue,
            });
          } else {
            await sendResult(action.sourceId, 'attack_failed', 'Tu objetivo sobrevivió a tu ataque.');
            await sendResult(action.targetId, 'attack_survived', '🛡️ Alguien intentó atacarte pero tu defensa te protegió.');
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
          
          // Notify arsonist about douse success and total count
          await sendResult(action.sourceId, 'douse_success', `🛢️ Rociaste con gasolina a tu objetivo. Total rociados: ${dousedList.length}`);
          results.push({ action, result: 'doused', targetId: action.targetId });
        }
        break;
      }

      case 'IGNITE': {
        // Arsonist: ignite all doused players — Unstoppable attack
        const dousedList = sourceState.dousedPlayers || [];
        
        if (dousedList.length === 0) {
          await sendResult(action.sourceId, 'ignite_failed', '❌ No tienes a nadie rociado para encender.');
          break;
        }
        
        let ignitedCount = 0;
        for (const dousedId of dousedList) {
          const dousedPlayer = await prisma.gamePlayer.findUnique({ where: { id: dousedId } });
          if (dousedPlayer?.alive) {
            deaths.push({
              playerId: dousedId,
              killerPlayerId: action.sourceId,
              causeOfDeath: 'Quemado vivo por el Pirómano',
              attackValue: 3 // Unstoppable
            });
            ignitedCount++;
          }
        }
        
        // Clear doused list
        await prisma.gamePlayer.update({
          where: { id: action.sourceId },
          data: { roleState: { ...sourceState, dousedPlayers: [] } },
        });
        
        await sendResult(action.sourceId, 'ignite_success', `🔥 ¡Encendiste el fuego! ${ignitedCount} jugador(es) ardieron.`);
        results.push({ action, result: 'ignited', count: ignitedCount });
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
          const targetImmunities = targetState.immunities || {};

          let result;
          // Detection immune roles always appear Not Suspicious to Sheriff
          if (targetImmunities.detection) {
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
        // Bug counts as a visit (can trigger traps, be attacked by Veteran/Medusa)
        if (action.targetId) {
          recordVisit(action.sourceId, action.source.name, action.targetId);
          results.push({ 
            action, 
            result: 'bugged', 
            targetId: action.targetId, 
            targetName: action.target?.name,
            spyId: action.sourceId,
            spyRoleblocked: false,
            targetJailed: false
          });
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
        // Janitor: Clean target's body (3 uses)
        if (action.targetId) {
          const janitor = await prisma.gamePlayer.findUnique({ 
            where: { id: action.sourceId }
          });
          const janitorState = janitor?.roleState || {};
          const usesRemaining = janitorState.usesRemaining ?? 3;
          
          if (usesRemaining <= 0) {
            await sendResult(action.sourceId, 'clean', '🧹 No te quedan usos de limpieza.');
            return;
          }
          
          recordVisit(action.sourceId, action.source.name, action.targetId);
          
          // Store clean attempt - will verify if target died later
          results.push({ 
            action, 
            result: 'clean_attempted', 
            targetId: action.targetId,
            janitorId: action.sourceId,
            usesRemaining
          });
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
      if (visitor.visitorId === alertedId) continue;
      const alreadyDying = deaths.some(d => d.playerId === visitor.visitorId);
      if (!alreadyDying) {
        const alertedPlayer = await prisma.gamePlayer.findUnique({ where: { id: alertedId } });
        // Veteran has Powerful attack (2)
        deaths.push({
          playerId: visitor.visitorId,
          killerPlayerId: alertedId,
          causeOfDeath: `Asesinado al visitar a ${alertedPlayer?.roleName || 'un Veterano'}`,
          attackValue: 2, // Powerful attack
        });
      }
    }
  }

  // Rampage kills: kill all visitors to rampage targets
  const rampageResults = results.filter(r => r.result === 'rampage');
  for (const rr of rampageResults) {
    const rampageVisitors = visits.get(rr.targetId) || [];
    for (const visitor of rampageVisitors) {
      if (visitor.visitorId === rr.action.sourceId) continue;
      const alreadyDying = deaths.some(d => d.playerId === visitor.visitorId);
      if (!alreadyDying) {
        const rampageAttack = rr.action.source.roleState?.attackValue || 2;
        deaths.push({
          playerId: visitor.visitorId,
          killerPlayerId: rr.action.sourceId,
          causeOfDeath: `Destrozado por ${rr.action.source.roleName}`,
          attackValue: rampageAttack,
        });
      }
    }
  }

  // Crusader kills: kill ONE random visitor to protected targets
  for (const [targetId, crusaderId] of crusaderProtected) {
    const allVisitors = visits.get(targetId) || [];
    const crusaderVisitors = [];
    
    // Filter visitors asynchronously
    for (const v of allVisitors) {
      // Exclude the Crusader itself
      if (v.visitorId === crusaderId) continue;
      
      // Check if visitor is a Vampire (Crusader doesn't attack Vampires)
      const visitorPlayer = await prisma.gamePlayer.findUnique({ 
        where: { id: v.visitorId }
      });
      if (visitorPlayer?.roleName?.toLowerCase() === 'vampire') continue;
      
      // TODO: Exclude Astral visitors (Hex Master, etc.) when astral mechanics implemented
      // For now, we include all non-vampire visitors
      
      crusaderVisitors.push(v);
    }

    if (crusaderVisitors.length > 0) {
      // Select ONE random visitor
      const randomVisitor = crusaderVisitors[Math.floor(Math.random() * crusaderVisitors.length)];
      const alreadyDying = deaths.some(d => d.playerId === randomVisitor.visitorId);
      
      if (!alreadyDying) {
        // Check if visitor has defense (Basic attack = 1)
        const visitorPlayer = await prisma.gamePlayer.findUnique({ where: { id: randomVisitor.visitorId } });
        const visitorState = visitorPlayer?.roleState || {};
        const naturalDefense = visitorState.defenseValue || 0;
        const effectiveDefense = getEffectiveDefense(randomVisitor.visitorId, naturalDefense);
        
        if (1 > effectiveDefense) { // Basic attack (1) vs defense
          deaths.push({
            playerId: randomVisitor.visitorId,
            killerPlayerId: crusaderId,
            causeOfDeath: 'Asesinado por un Cruzado',
            attackValue: 1, // Basic attack
          });
          await sendResult(crusaderId, 'crusader_kill', '⚔️ Atacaste a alguien que visitó tu objetivo.');
        } else {
          // Visitor survived due to defense
          await sendResult(crusaderId, 'crusader_kill_failed', '⚔️ Atacaste a un visitante pero su defensa era demasiado fuerte.');
          await sendResult(randomVisitor.visitorId, 'attack_survived', '🛡️ Un Cruzado te atacó pero tu defensa te protegió.');
        }
      }
    }
    
    // Check if target was attacked (successful or blocked) and notify Crusader
    const targetWasAttacked = results.some(r => 
      (r.action?.actionType === 'KILL_SINGLE' || 
       r.action?.actionType === 'KILL_RAMPAGE' ||
       r.action?.actionType === 'KILL_UNSTOPPABLE') && 
      r.action?.targetId === targetId
    );
    if (targetWasAttacked) {
      await sendResult(crusaderId, 'crusader_protected', '⚔️ ¡Tu objetivo fue atacado anoche!');
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

  // Spy results - NEW MECHANICS (ToS Wiki)
  // Spies see:
  // 1. Number of Mafia/Coven who visit certain people each night (randomized order)
  // 2. Bug results: direct actions against target (attacks, roleblocks, transports, NOT investigative)
  const spyResults = results.filter(r => r.result === 'bugged');
  for (const sr of spyResults) {
    const spy = await prisma.gamePlayer.findUnique({ 
      where: { id: sr.spyId }
    });
    
    // Check if spy was roleblocked or jailed
    const spyRoleblocked = roleblocked.has(sr.spyId) || jailed.has(sr.spyId);
    
    // Check if target was jailed
    const targetJailed = jailed.has(sr.targetId);
    
    if (spyRoleblocked) {
      // Spy doesn't receive results if roleblocked or jailed
      continue;
    }
    
    if (targetJailed) {
      // Bug fails but spy is informed
      await sendResult(sr.spyId, 'spy', `🕵️ Tu objetivo fue encarcelado esta noche. El bug falló.`);
      // Spy still sees Mafia/Coven visits (continue to next section)
    } else {
      // Bug successful - show direct actions against target
      const bugVisitors = visits.get(sr.targetId) || [];
      const directActions = [];
      
      // Collect direct actions against the target (not investigative)
      for (const result of results) {
        if (result.action && result.action.targetId === sr.targetId) {
          const actionType = result.action.actionType;
          const actorName = result.action.source?.name || 'Alguien';
          
          // Only show non-investigative actions
          if (['KILL_SINGLE', 'RAMPAGE', 'ATTACK', 'HEAL', 'PROTECT', 
               'ROLEBLOCK', 'TRANSPORT', 'CLEAN', 'DISGUISE', 'DOUSE',
               'IGNITE', 'GUARD', 'TRAP', 'BLACKMAIL', 'CONTROL'].includes(actionType)) {
            
            // Don't reveal the actor name, just the action
            let actionDesc = '';
            if (['KILL_SINGLE', 'RAMPAGE', 'ATTACK'].includes(actionType)) {
              actionDesc = 'tu objetivo fue atacado';
            } else if (actionType === 'ROLEBLOCK') {
              actionDesc = 'tu objetivo fue bloqueado';
            } else if (actionType === 'TRANSPORT') {
              actionDesc = 'tu objetivo fue transportado';
            } else if (['HEAL', 'PROTECT', 'GUARD'].includes(actionType)) {
              actionDesc = 'tu objetivo fue protegido';
            } else if (actionType === 'CLEAN') {
              actionDesc = 'alguien intentó limpiar a tu objetivo';
            } else if (actionType === 'BLACKMAIL') {
              actionDesc = 'tu objetivo fue chantajeado';
            } else if (actionType === 'CONTROL') {
              actionDesc = 'tu objetivo fue controlado';
            } else {
              actionDesc = 'tu objetivo fue visitado con intención';
            }
            
            if (actionDesc) {
              directActions.push(actionDesc);
            }
          }
        }
      }
      
      // Send bug results
      if (directActions.length > 0) {
        const uniqueActions = [...new Set(directActions)];
        await sendResult(sr.spyId, 'spy', `🕵️ Bug: ${uniqueActions.join(', ')}.`);
      } else {
        await sendResult(sr.spyId, 'spy', `🕵️ No se detectaron acciones directas contra tu objetivo.`);
      }
    }
    
    // ALWAYS show Mafia/Coven visit counts (even if roleblocked from bug, but not if jailed)
    // Get all Mafia/Coven players
    const mafiaPlayers = await prisma.gamePlayer.findMany({
      where: { gameId, alive: true, faction: 'MAFIA' }
    });
    const covenPlayers = await prisma.gamePlayer.findMany({
      where: { gameId, alive: true, faction: 'COVEN' }
    });
    
    // Track who each Mafia/Coven member visited
    const mafiaVisits = new Map(); // targetId -> count
    const covenVisits = new Map(); // targetId -> count
    
    for (const mafiaPlayer of mafiaPlayers) {
      // Find actions by this mafia member
      const mafiaActions = results.filter(r => 
        r.action && r.action.sourceId === mafiaPlayer.id && r.action.targetId
      );
      
      for (const ma of mafiaActions) {
        const targetId = ma.action.targetId;
        mafiaVisits.set(targetId, (mafiaVisits.get(targetId) || 0) + 1);
      }
    }
    
    for (const covenPlayer of covenPlayers) {
      // Find actions by this coven member
      const covenActions = results.filter(r => 
        r.action && r.action.sourceId === covenPlayer.id && r.action.targetId
      );
      
      for (const ca of covenActions) {
        const targetId = ca.action.targetId;
        covenVisits.set(targetId, (covenVisits.get(targetId) || 0) + 1);
      }
    }
    
    // Prepare visit messages (randomized order)
    const visitMessages = [];
    
    // Add Mafia visits
    const mafiaVisitEntries = Array.from(mafiaVisits.entries());
    for (const [targetId, count] of mafiaVisitEntries) {
      const target = await prisma.gamePlayer.findUnique({ where: { id: targetId } });
      if (target) {
        visitMessages.push(`${count} ${count === 1 ? 'miembro de la Mafia' : 'miembros de la Mafia'} visitaron a ${target.name}`);
      }
    }
    
    // Add Coven visits
    const covenVisitEntries = Array.from(covenVisits.entries());
    for (const [targetId, count] of covenVisitEntries) {
      const target = await prisma.gamePlayer.findUnique({ where: { id: targetId } });
      if (target) {
        visitMessages.push(`${count} ${count === 1 ? 'miembro del Coven' : 'miembros del Coven'} visitaron a ${target.name}`);
      }
    }
    
    // Randomize order
    for (let i = visitMessages.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [visitMessages[i], visitMessages[j]] = [visitMessages[j], visitMessages[i]];
    }
    
    // Send visit information
    if (visitMessages.length > 0) {
      await sendResult(sr.spyId, 'spy', `🕵️ Visitas de la noche:\\n${visitMessages.join('\\n')}`);
    } else {
      await sendResult(sr.spyId, 'spy', `🕵️ No se detectaron visitas de Mafia/Coven esta noche.`);
    }
  }

  // Process Janitor cleans - verify if target actually died
  const cleanAttempts = results.filter(r => r.result === 'clean_attempted');
  for (const ca of cleanAttempts) {
    const targetDied = deaths.some(d => d.playerId === ca.targetId);
    
    if (targetDied) {
      // Target died - clean is successful
      cleaned.add(ca.targetId);
      
      // Get target's role and will for Janitor
      const target = await prisma.gamePlayer.findUnique({ 
        where: { id: ca.targetId },
        select: { name: true, roleName: true, faction: true, will: true }
      });
      
      // Update Janitor's roleState with last cleaned info
      const janitor = await prisma.gamePlayer.findUnique({ 
        where: { id: ca.janitorId },
        select: { roleState: true }
      });
      const janitorState = janitor?.roleState || {};
      const usesRemaining = janitorState.usesRemaining ?? 3;
      
      await prisma.gamePlayer.update({
        where: { id: ca.janitorId },
        data: { 
          roleState: { 
            ...janitorState, 
            usesRemaining: usesRemaining - 1,
            lastCleaned: {
              name: target?.name,
              role: target?.roleName,
              faction: target?.faction,
              night: game.day
            }
          } 
        },
      });
      
      // Send result to Janitor showing what they cleaned
      const willPreview = target?.will ? target.will.substring(0, 100) : 'Sin testamento';
      await sendResult(ca.janitorId, 'clean', `🧹 Limpiaste exitosamente a ${target?.name}.\n🎭 Rol: ${target?.roleName} (${target?.faction})\n📜 Testamento: ${willPreview}${target?.will && target.will.length > 100 ? '...' : ''}\n🧹 Usos restantes: ${usesRemaining - 1}`);
      
      results.push({ 
        action: ca.action, 
        result: 'cleaned', 
        targetId: ca.targetId,
        targetRole: target?.roleName
      });
    } else {
      // Target didn't die - wasted use
      const janitor = await prisma.gamePlayer.findUnique({ 
        where: { id: ca.janitorId },
        select: { roleState: true }
      });
      const janitorState = janitor?.roleState || {};
      const usesRemaining = janitorState.usesRemaining ?? 3;
      
      await prisma.gamePlayer.update({
        where: { id: ca.janitorId },
        data: { 
          roleState: { 
            ...janitorState, 
            usesRemaining: usesRemaining - 1
          } 
        },
      });
      
      await sendResult(ca.janitorId, 'clean', `🧹 Tu objetivo no murió. Uso desperdiciado.\n🧹 Usos restantes: ${usesRemaining - 1}`);
    }
  }

  // Check for poisoned players from previous night that weren't healed
  const allAlivePlayers = await prisma.gamePlayer.findMany({ where: { gameId, alive: true } });
  for (const p of allAlivePlayers) {
    const pState = p.roleState || {};
    if (pState.poisoned && !healed.has(p.id)) {
      // Poison is Powerful attack (2) - check if player has sufficient defense
      const naturalDefense = pState.defenseValue || 0;
      const effectiveDefense = getEffectiveDefense(p.id, naturalDefense);
      
      if (effectiveDefense >= 2) {
        // Survived poison due to defense
        await prisma.gamePlayer.update({
          where: { id: p.id },
          data: { roleState: { ...pState, poisoned: false, poisonedBy: null } },
        });
        await sendResult(p.id, 'attack_survived', '🛡️ Tu defensa te protegió del veneno.');
      } else {
        // Dies from poison
        deaths.push({
          playerId: p.id,
          killerPlayerId: pState.poisonedBy || null,
          causeOfDeath: 'Murió envenenado',
          attackValue: 2, // Poison attack value
        });
        // Clear poison
        await prisma.gamePlayer.update({
          where: { id: p.id },
          data: { roleState: { ...pState, poisoned: false, poisonedBy: null } },
        });
      }
    } else if (pState.poisoned && healed.has(p.id)) {
      // Healed from poison
      await prisma.gamePlayer.update({
        where: { id: p.id },
        data: { roleState: { ...pState, poisoned: false, poisonedBy: null } },
      });
      await sendResult(p.id, 'healed', '🏥 Fuiste curado del veneno.');
    }
  }

  // --- PASS 3: Process deaths with attack vs defense ---
  for (const death of deaths) {
    // Unstoppable attacks bypass ALL defense
    if (!death.unstoppable) {
      // Get the victim's effective defense (natural + granted from heal/vest/alert/trap)
      const victim = await prisma.gamePlayer.findUnique({ where: { id: death.playerId } });
      if (!victim?.alive) continue; // Already dead
      const victimState = victim.roleState || {};
      const naturalDefense = victimState.defenseValue || 0;
      const effectiveDefense = getEffectiveDefense(death.playerId, naturalDefense);
      const attackValue = death.attackValue || 1;

      // If defense >= attack, the victim survives
      if (effectiveDefense >= attackValue) {
        if (healed.has(death.playerId)) {
          await sendResult(death.playerId, 'healed', '🏥 Fuiste atacado pero un Doctor te salvó la vida.');
          const healAction = actions.find(a => a.actionType === 'HEAL' && a.targetId === death.playerId);
          if (healAction) {
            await sendResult(healAction.sourceId, 'heal_success', '🏥 Tu objetivo fue atacado pero lo salvaste.');
          }
        } else if (vested.has(death.playerId)) {
          await sendResult(death.playerId, 'attack_survived', '🛡️ Tu chaleco te protegió del ataque.');
        } else if (naturalDefense >= attackValue) {
          await sendResult(death.playerId, 'attack_survived', '🛡️ Tu defensa natural te protegió del ataque.');
        }
        continue; // Survived
      }
    } else {
      // Even unstoppable can't kill already dead
      const victim = await prisma.gamePlayer.findUnique({ where: { id: death.playerId } });
      if (!victim?.alive) continue;
    }

    const deadPlayer = await prisma.gamePlayer.update({
      where: { id: death.playerId },
      data: {
        alive: false,
        diedOnDay: game.day,
        diedOnPhase: 'NIGHT',
        causeOfDeath: death.causeOfDeath,
      },
    });

    // Check if executed by Jailor (execution note replaces testament)
    let executionNote = null;
    let executedByJailor = false;
    if (death.byJailor) {
      executedByJailor = true;
      executionNote = death.executionNote || null;
    }

    // Get killer's death note (only for non-Jailor kills)
    let killerDeathNote = null;
    if (!executedByJailor && death.killerPlayerId) {
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
      executionNote: executionNote,
      executedByJailor,
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

  // Clear Jailor's jailed target for next night (they must select again during the day)
  const jailor = await prisma.gamePlayer.findFirst({
    where: {
      gameId,
      alive: true,
      roleName: { contains: 'Jailor', mode: 'insensitive' },
    },
  });
  if (jailor && jailor.roleState?.jailedTargetId) {
    await prisma.gamePlayer.update({
      where: { id: jailor.id },
      data: {
        roleState: {
          ...jailor.roleState,
          jailedTargetId: null,
        },
      },
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
  const neutralKillerSlugs = ['serial-killer', 'arsonist', 'werewolf', 'juggernaut', 'plaguebearer', 'pestilence'];
  const neutralKillers = alivePlayers.filter(
    p => p.faction === 'NEUTRAL' && neutralKillerSlugs.includes(p.roleSlug?.toLowerCase?.())
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
    // GUILTY → transition to LAST_WORDS (execution happens after)
    io.to(gameCode).emit('trial:verdict', {
      result: 'GUILTY',
      playerId: lastNomination.nomineeId,
      playerName: accused?.name || 'Desconocido',
      position: accused?.position,
      guiltyCount,
      innocentCount,
    });

    // Set phase to LAST_WORDS
    await prisma.game.update({
      where: { id: gameId },
      data: { phase: 'LAST_WORDS' },
    });

    io.to(gameCode).emit('phase:change', {
      phase: 'LAST_WORDS',
      day: game.day,
      message: `💀 ${accused?.name || 'El acusado'} ha sido declarado culpable. Últimas palabras...`,
      accused: {
        id: lastNomination.nomineeId,
        name: accused?.name,
        position: accused?.position,
      },
    });
  } else {
    // INNOCENT / tie - Acquitted
    io.to(gameCode).emit('trial:verdict', {
      result: 'INNOCENT',
      playerId: lastNomination.nomineeId,
      playerName: accused?.name || 'Desconocido',
      guiltyCount,
      innocentCount,
    });

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

  // -- Doctor: can self-heal once per game --
  if (player.roleName?.toLowerCase() === 'doctor' && targetId === playerId) {
    if (roleState.selfHealUsed) return null; // Already used self-heal
    await prisma.gamePlayer.update({
      where: { id: playerId },
      data: { roleState: { ...roleState, selfHealUsed: true } },
    });
  }

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

  // Allow changing vote: delete previous vote if exists
  const existingVotes = await prisma.vote.findMany({
    where: { gameId, voterId, day: game.day, voteType: 'NOMINATION' },
  });
  if (existingVotes.length > 0) {
    // Delete previous vote to allow vote change
    await prisma.vote.deleteMany({
      where: { gameId, voterId, day: game.day, voteType: 'NOMINATION' },
    });
  }

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

  // Get all vote counts for all players
  const allVotes = await prisma.vote.findMany({
    where: { gameId, day: game.day, voteType: 'NOMINATION' },
    include: { nominee: true },
  });

  // Group votes by nominee
  const voteCountsByPlayer = {};
  allVotes.forEach(vote => {
    if (!voteCountsByPlayer[vote.nomineeId]) {
      voteCountsByPlayer[vote.nomineeId] = {
        playerId: vote.nomineeId,
        playerName: vote.nominee.name,
        voteCount: 0,
      };
    }
    voteCountsByPlayer[vote.nomineeId].voteCount++;
  });

  io.to(gameCode).emit('vote:cast', {
    voterId,
    voterName: voter?.name || 'Desconocido',
    nomineeId,
    nomineeName: nominee?.name || 'Desconocido',
    currentVotes,
    requiredVotes,
    voteWeight, // Indicate if this was a Mayor vote
    allVoteCounts: Object.values(voteCountsByPlayer), // Send all vote counts
  });

  // Check if majority reached
  if (currentVotes >= requiredVotes) {
    // Move to DEFENSE (accused defends themselves)
    await prisma.game.update({
      where: { id: gameId },
      data: { phase: 'DEFENSE' },
    });

    io.to(gameCode).emit('phase:change', {
      phase: 'DEFENSE',
      day: game.day,
      message: `🛡️ ${nominee?.name} ha sido enviado a juicio. Puede defenderse.`,
      accused: {
        id: nomineeId,
        name: nominee?.name,
        position: nominee?.position,
      },
    });

    // Clear existing timer and start defense timer
    const existingTimer = gameTimers.get(gameCode);
    if (existingTimer?.timer) clearTimeout(existingTimer.timer);
    if (existingTimer?.interval) clearInterval(existingTimer.interval);
    await startPhaseTimer(gameId, gameCode, 'DEFENSE', game.day, io);

    // Trigger bot defense if accused is a bot
    setTimeout(() => triggerDefense(gameId, gameCode, nomineeId, io), 2000);
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

  if (!game || game.phase !== 'JUDGEMENT') return null;

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

  // All alive players voted → resolve verdict early (clear JUDGEMENT timer)
  if (trialVotes.length >= totalVoters) {
    const existingTimer = gameTimers.get(gameCode);
    if (existingTimer?.timer) clearTimeout(existingTimer.timer);
    if (existingTimer?.interval) clearInterval(existingTimer.interval);

    // Resolve the trial verdict (handles GUILTY → LAST_WORDS or INNOCENT → acquittal)
    await resolveTrialVerdict(gameId, gameCode, io);

    // Check if game ended
    const postTrialGame = await prisma.game.findUnique({ where: { id: gameId } });
    if (!postTrialGame || postTrialGame.status !== 'PLAYING') return;

    // If GUILTY, resolveTrialVerdict set phase to LAST_WORDS → start that timer
    if (postTrialGame.phase === 'LAST_WORDS') {
      await startPhaseTimer(gameId, gameCode, 'LAST_WORDS', game.day, io);
      return;
    }

    // If INNOCENT → go to NIGHT
    await prisma.game.update({
      where: { id: gameId },
      data: { phase: 'NIGHT' },
    });

    io.to(gameCode).emit('phase:change', {
      phase: 'NIGHT',
      day: game.day,
      message: '🌙 La noche cae sobre el pueblo...',
    });

    await startPhaseTimer(gameId, gameCode, 'NIGHT', game.day, io);

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
