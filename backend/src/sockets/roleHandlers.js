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
  socket.on('jail:execute', async () => {
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
        socket.emit('error', { message: 'Ya usaste tus 3 ejecuciones' });
        return;
      }

      const jailAction = await prisma.gameAction.findFirst({
        where: {
          gameId: game.id,
          sourceId: player.id,
          night: game.day,
          actionType: 'JAIL',
        },
      });

      if (!jailAction || !jailAction.targetId) {
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

      await prisma.gameAction.create({
        data: {
          gameId: game.id,
          sourceId: player.id,
          targetId: jailAction.targetId,
          night: game.day,
          actionType: 'EXECUTE',
          priority: 1,
        },
      });

      await prisma.gamePlayer.update({
        where: { id: player.id },
        data: { roleState: { ...roleState, executionsUsed: executionsUsed + 1 } },
      });

      socket.emit('jail:execute:confirmed', {
        targetId: jailAction.targetId,
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
}
