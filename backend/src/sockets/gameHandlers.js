// ============================================
// SOCKET HANDLERS - GAME (night actions, voting, testament, deathnote)
// ============================================

import { prisma } from '../lib/prisma.js';
import { submitNightAction, submitVote, submitVerdict } from '../gameEngine.js';

/**
 * Register all gameplay-related socket handlers
 * @param {import('socket.io').Socket} socket
 * @param {import('socket.io').Server} io
 * @param {Map} connectedClients
 */
export function registerGameHandlers(socket, io, connectedClients) {
  // ---- Testament update ----
  socket.on('testament:update', async (data) => {
    try {
      const client = connectedClients.get(socket.id);
      if (!client?.playerId) return;

      const text = (data.text || '').slice(0, 500);
      await prisma.gamePlayer.update({
        where: { id: client.playerId },
        data: { will: text },
      });
      socket.emit('testament:saved', { text });
    } catch (error) {
      console.error('Error saving testament:', error);
    }
  });

  // ---- Death note update ----
  socket.on('deathnote:update', async (data) => {
    try {
      const client = connectedClients.get(socket.id);
      if (!client?.playerId) return;

      const text = (data.text || '').slice(0, 200);
      await prisma.gamePlayer.update({
        where: { id: client.playerId },
        data: { deathNote: text },
      });
      socket.emit('deathnote:saved', { text });
    } catch (error) {
      console.error('Error saving deathnote:', error);
    }
  });

  // ---- Night action ----
  socket.on('action:night', async (data) => {
    try {
      const client = connectedClients.get(socket.id);
      if (!client?.playerId || !client?.gameCode) return;

      const game = await prisma.game.findUnique({ where: { code: client.gameCode } });
      if (!game || game.phase !== 'NIGHT') {
        socket.emit('error', { message: 'No es de noche' });
        return;
      }

      // Get target names for feedback
      let targetName = 'alguien';
      let target2Name = null;

      if (data.targetId) {
        const targetPlayer = await prisma.gamePlayer.findUnique({
          where: { id: data.targetId },
          select: { name: true },
        });
        targetName = targetPlayer?.name || 'alguien';
      }

      if (data.target2Id) {
        const target2Player = await prisma.gamePlayer.findUnique({
          where: { id: data.target2Id },
          select: { name: true },
        });
        target2Name = target2Player?.name || null;
      }

      const result = await submitNightAction(game.id, client.playerId, data.targetId, io, client.gameCode, data.target2Id);
      if (result) {
        const actionMessages = {
          SHERIFF_CHECK: `🔍 Has decidido investigar a ${targetName}`,
          INVESTIGATOR_CHECK: `🔎 Has decidido investigar a ${targetName}`,
          LOOKOUT_WATCH: `👁️ Has decidido vigilar a ${targetName}`,
          TRACKER_TRACK: `🐾 Has decidido rastrear a ${targetName}`,
          SPY_BUG: `🕵️ Has colocado un micrófono en ${targetName}`,
          CONSIGLIERE_CHECK: `🎯 Has decidido descubrir el rol de ${targetName}`,
          HEAL: `🏥 Has decidido curar a ${targetName}`,
          PROTECT: `🛡️ Has decidido proteger a ${targetName}`,
          KILL_SINGLE: `🔪 Has decidido atacar a ${targetName}`,
          KILL_RAMPAGE: `🐺 Vas a arrasar la casa de ${targetName}`,
          ROLEBLOCK: `🚫 Has decidido bloquear a ${targetName}`,
          CONTROL: `🧙 Has decidido controlar a ${targetName}`,
          DOUSE: `🛢️ Has rociado con gasolina a ${targetName}`,
          IGNITE: `🔥 ¡Vas a encender el fuego!`,
          FRAME: `🖼️ Has enmarcado a ${targetName}`,
          BLACKMAIL: `🤐 Has chantajeado a ${targetName}`,
          CLEAN: `🧹 Has decidido limpiar a ${targetName}`,
          JAIL: `⛓️ Has encarcelado a ${targetName}`,
          ALERT: `⚠️ Estás en alerta esta noche`,
          VEST: `🦺 Te has puesto el chaleco antibalas`,
          TRANSPORT: target2Name
            ? `🔄 Vas a intercambiar a ${targetName} con ${target2Name}`
            : `🔄 Has decidido transportar a ${targetName}`,
          POISON: `☠️ Has envenenado a ${targetName}`,
          HEX: `🔮 Has hechizado a ${targetName}`,
        };

        const stagingMessage = actionMessages[result.actionType] || `✅ Acción confirmada contra ${targetName}`;

        socket.emit('action:confirmed', {
          actionType: result.actionType,
          targetId: result.targetId,
          target2Id: result.target2Id,
          targetName,
          target2Name,
          message: stagingMessage,
          canChange: true,
        });
      } else {
        socket.emit('error', { message: 'No puedes realizar esta acción' });
      }
    } catch (error) {
      console.error('Error submitting night action:', error);
      socket.emit('error', { message: 'Error al realizar acción' });
    }
  });

  // ---- Vote to nominate ----
  socket.on('vote:nominate', async (data) => {
    try {
      const client = connectedClients.get(socket.id);
      if (!client?.playerId || !client?.gameCode) return;

      const game = await prisma.game.findUnique({ where: { code: client.gameCode } });
      if (!game || game.phase !== 'VOTING') {
        socket.emit('error', { message: 'No es momento de votar' });
        return;
      }

      await submitVote(game.id, client.playerId, data.nomineeId, client.gameCode, io);
    } catch (error) {
      console.error('Error submitting vote:', error);
    }
  });

  // ---- Trial verdict ----
  socket.on('vote:verdict', async (data) => {
    try {
      const client = connectedClients.get(socket.id);
      if (!client?.playerId || !client?.gameCode) return;

      const game = await prisma.game.findUnique({ where: { code: client.gameCode } });
      if (!game || (game.phase !== 'TRIAL' && game.phase !== 'DEFENSE')) {
        socket.emit('error', { message: 'No es momento de dar veredicto' });
        return;
      }

      await submitVerdict(game.id, client.playerId, data.verdict, client.gameCode, io);
    } catch (error) {
      console.error('Error submitting verdict:', error);
    }
  });
}
