// ============================================
// SOCKET HANDLERS - ROLE-SPECIFIC (Mayor, Jailor, etc.)
// ============================================

import { prisma } from '../lib/prisma.js';

/**
 * Register all role-specific socket handlers
 * @param {import('socket.io').Socket} socket
 * @param {import('socket.io').Server} io
 * @param {Map} connectedClients
 */
export function registerRoleHandlers(socket, io, connectedClients) {
  // ---- Jailor: Select jail target during DAY ----
  socket.on('jailor:jail', async (data) => {
    try {
      const client = connectedClients.get(socket.id);
      if (!client?.playerId || !client?.gameCode) return;

      const player = await prisma.gamePlayer.findUnique({ where: { id: client.playerId } });
      const game = await prisma.game.findUnique({ where: { code: client.gameCode } });
      if (!player || !game) return;

      if (player.roleName?.toLowerCase() !== 'jailor') {
        socket.emit('error', { message: 'No eres el Jailor' });
        return;
      }

      // Jailor can only select during DAY, DISCUSSION, or VOTING
      if (!['DAY', 'DISCUSSION', 'VOTING'].includes(game.phase)) {
        socket.emit('error', { message: 'Solo puedes encarcelar durante el día' });
        return;
      }

      const { targetId } = data;
      if (!targetId) return;

      const target = await prisma.gamePlayer.findUnique({ where: { id: targetId } });
      if (!target || !target.alive || target.id === player.id) {
        socket.emit('error', { message: 'Objetivo inválido' });
        return;
      }

      const roleState = player.roleState || {};
      const executionsRemaining = 3 - (roleState.executionsUsed || 0);

      await prisma.gamePlayer.update({
        where: { id: player.id },
        data: { roleState: { ...roleState, jailedTargetId: targetId } },
      });

      socket.emit('jailor:jail:confirmed', {
        targetId,
        targetName: target.name,
        targetPosition: target.position,
        executionsRemaining,
      });

      console.log(`⚖️ Jailor ${player.name} selected ${target.name} for jail in game ${client.gameCode}`);
    } catch (error) {
      console.error('Error selecting jail target:', error);
      socket.emit('error', { message: 'Error al seleccionar objetivo' });
    }
  });

  // ---- Mayor reveal ----
  socket.on('mayor:reveal', async () => {
    try {
      const client = connectedClients.get(socket.id);
      if (!client?.playerId || !client?.gameCode) return;

      const player = await prisma.gamePlayer.findUnique({ where: { id: client.playerId } });
      if (!player || !player.alive) return;

      if (player.roleName?.toLowerCase() !== 'mayor') {
        socket.emit('error', { message: 'No eres el Mayor' });
        return;
      }

      const roleState = player.roleState || {};
      if (roleState.revealed) {
        socket.emit('error', { message: 'Ya te has revelado' });
        return;
      }

      await prisma.gamePlayer.update({
        where: { id: client.playerId },
        data: { roleState: { ...roleState, revealed: true } },
      });

      io.to(client.gameCode).emit('mayor:revealed', {
        playerId: client.playerId,
        playerName: player.name,
        position: player.position,
      });

      const message = {
        id: `system-${Date.now()}`,
        author: { id: 'system', name: 'Sistema', position: 0 },
        content: `🎖️ ${player.name} se ha revelado como Mayor. Su voto ahora cuenta x3.`,
        timestamp: new Date(),
        channel: 'PUBLIC',
        isSystem: true,
      };
      io.to(client.gameCode).emit('chat:message', message);

      console.log(`🎖️ Mayor ${player.name} revealed in game ${client.gameCode}`);
    } catch (error) {
      console.error('Error revealing mayor:', error);
      socket.emit('error', { message: 'Error al revelarse' });
    }
  });

  // ---- Jailor: Chat with prisoner ----
  socket.on('jail:chat', async (data) => {
    try {
      const client = connectedClients.get(socket.id);
      if (!client?.playerId || !client?.gameCode) return;

      const { content } = data;
      if (!content || content.length > 500) return;

      const player = await prisma.gamePlayer.findUnique({ where: { id: client.playerId } });
      const game = await prisma.game.findUnique({ where: { code: client.gameCode } });
      if (!player || !game || game.phase !== 'NIGHT') return;

      // Find the jail action for this night
      const jailAction = await prisma.gameAction.findFirst({
        where: {
          gameId: game.id,
          night: game.day,
          actionType: 'JAIL',
        },
        include: {
          source: true,
          target: true,
        },
      });

      if (!jailAction) return;

      const isJailor = player.id === jailAction.sourceId;
      const isPrisoner = player.id === jailAction.targetId;

      if (!isJailor && !isPrisoner) return;

      const jailRoom = `${client.gameCode}:jail:${game.day}`;

      const message = {
        id: `jail-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        author: {
          id: player.id,
          name: isJailor ? '⚖️ Jailor' : player.name,
          position: player.position,
        },
        content,
        timestamp: new Date(),
        channel: 'JAIL',
        isSystem: false,
      };

      io.to(jailRoom).emit('jail:message', message);

      await prisma.gameEvent.create({
        data: {
          gameId: game.id,
          type: 'JAIL_CHAT',
          data: {
            jailorId: jailAction.sourceId,
            prisonerId: jailAction.targetId,
            sender: player.id,
            content,
          },
          day: game.day,
          phase: 'NIGHT',
        },
      });
    } catch (error) {
      console.error('Error in jail chat:', error);
    }
  });

  // ---- Jailor: Execute prisoner ----
  socket.on('jail:execute', async (data) => {
    try {
      const client = connectedClients.get(socket.id);
      if (!client?.playerId || !client?.gameCode) return;

      const player = await prisma.gamePlayer.findUnique({ where: { id: client.playerId } });
      const game = await prisma.game.findUnique({ where: { code: client.gameCode } });
      if (!player || !game || game.phase !== 'NIGHT') return;

      if (player.roleName?.toLowerCase() !== 'jailor') {
        socket.emit('error', { message: 'No eres el Jailor' });
        return;
      }

      const roleState = player.roleState || {};
      const executionsUsed = roleState.executionsUsed || 0;

      if (executionsUsed >= 3) {
        socket.emit('error', { message: 'Ya no te quedan ejecuciones' });
        return;
      }

      const targetId = roleState.jailedTargetId;
      if (!targetId) {
        socket.emit('error', { message: 'No hay nadie encarcelado' });
        return;
      }

      const existingExecute = await prisma.gameAction.findFirst({
        where: {
          gameId: game.id,
          sourceId: player.id,
          night: game.day,
          actionType: 'EXECUTE',
        },
      });

      if (existingExecute) {
        socket.emit('error', { message: 'Ya decidiste ejecutar' });
        return;
      }

      // Get execution reasons from data (array of selected reasons)
      // Available reasons:
      // 1. "No reason specified."
      // 2. "They are known to be an evildoer."
      // 3. "Their confession was contradictory."
      // 4. "They are possessed and talking nonsense."
      // 5. "They are too quiet or won't respond to questioning."
      // 6. "They are an outsider that might turn against us."
      // 7. "I'm using my own discretion."
      const executionReasons = data?.executionReasons || [];
      const executionNote = executionReasons.length > 0 
        ? executionReasons.join('\n') 
        : 'No reason specified.';

      await prisma.gameAction.create({
        data: {
          gameId: game.id,
          sourceId: player.id,
          targetId: targetId,
          night: game.day,
          actionType: 'EXECUTE',
          priority: 1,
          metadata: { executionNote },
        },
      });

      await prisma.gamePlayer.update({
        where: { id: player.id },
        data: { roleState: { ...roleState, executionsUsed: executionsUsed + 1 } },
      });

      socket.emit('jail:execute:confirmed', {
        targetId,
        executionsRemaining: 2 - executionsUsed,
      });

      const jailRoom = `${client.gameCode}:jail:${game.day}`;
      const message = {
        id: `system-${Date.now()}`,
        author: { id: 'system', name: 'Sistema', position: 0 },
        content: '⚖️ El Jailor ha decidido ejecutarte.',
        timestamp: new Date(),
        channel: 'JAIL',
        isSystem: true,
      };
      io.to(jailRoom).emit('jail:message', message);

      console.log(`⚖️ Jailor executing prisoner in game ${client.gameCode}`);
    } catch (error) {
      console.error('Error executing prisoner:', error);
      socket.emit('error', { message: 'Error al ejecutar' });
    }
  });

  // ---- Jester: Haunt a guilty voter after being lynched ----
  socket.on('jester:haunt', async (data) => {
    try {
      const client = connectedClients.get(socket.id);
      if (!client?.playerId || !client?.gameCode) return;

      const player = await prisma.gamePlayer.findUnique({ where: { id: client.playerId } });
      const game = await prisma.game.findUnique({ where: { code: client.gameCode } });
      if (!player || !game) return;

      // Jester must be dead and have won
      if (player.alive) {
        socket.emit('error', { message: 'Aún estás vivo' });
        return;
      }

      if (player.roleName?.toLowerCase() !== 'jester') {
        socket.emit('error', { message: 'No eres el Jester' });
        return;
      }

      const roleState = player.roleState || {};
      if (!roleState.hasWon) {
        socket.emit('error', { message: 'No has ganado aún' });
        return;
      }

      if (roleState.hauntedTargetId) {
        socket.emit('error', { message: 'Ya elegiste a quién hauntar' });
        return;
      }

      const { targetId } = data;
      if (!targetId) return;

      // Verify target voted guilty
      const guiltyVote = await prisma.vote.findFirst({
        where: {
          gameId: game.id,
          day: player.diedOnDay,
          voteType: 'TRIAL',
          nomineeId: player.id,
          voterId: targetId,
          vote: 'GUILTY',
        },
      });

      if (!guiltyVote) {
        socket.emit('error', { message: 'Este jugador no votó culpable' });
        return;
      }

      const target = await prisma.gamePlayer.findUnique({ where: { id: targetId } });
      if (!target || !target.alive) {
        socket.emit('error', { message: 'Objetivo inválido o muerto' });
        return;
      }

      // Save haunt target and create HAUNT action for next night
      await prisma.gamePlayer.update({
        where: { id: player.id },
        data: { roleState: { ...roleState, hauntedTargetId: targetId } },
      });

      // Create HAUNT action (will be processed at night)
      await prisma.gameAction.create({
        data: {
          gameId: game.id,
          sourceId: player.id,
          targetId: targetId,
          night: game.day, // Same day's night
          actionType: 'HAUNT',
          priority: 1, // High priority, unstoppable attack
        },
      });

      socket.emit('jester:haunt:confirmed', {
        targetId,
        targetName: target.name,
        targetPosition: target.position,
      });

      io.to(client.gameCode).emit('jester:haunt:selected', {
        jesterName: player.name,
        message: `🎭 ${player.name} ha elegido su venganza...`,
      });

      console.log(`🎭 Jester ${player.name} will haunt ${target.name} in game ${client.gameCode}`);
    } catch (error) {
      console.error('Error haunting target:', error);
      socket.emit('error', { message: 'Error al hauntar' });
    }
  });
}
