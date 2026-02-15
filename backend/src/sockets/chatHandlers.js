// ============================================
// SOCKET HANDLERS - CHAT (public, mafia, dead channels)
// ============================================

import { prisma } from '../lib/prisma.js';
import { triggerChatReaction } from '../bots/botManager.js';

/**
 * Register all chat-related socket handlers
 * @param {import('socket.io').Socket} socket
 * @param {import('socket.io').Server} io
 * @param {Map} connectedClients
 */
export function registerChatHandlers(socket, io, connectedClients) {
  socket.on('chat:message', async (data) => {
    try {
      const client = connectedClients.get(socket.id);
      if (!client || !client.playerId) return;

      const { content, channel = 'PUBLIC' } = data;

      // Get player and game info
      const player = await prisma.gamePlayer.findUnique({
        where: { id: client.playerId },
        include: { game: true },
      });

      if (!player) return;

      // Channel validation
      const isPlaying = player.game.status === 'PLAYING';
      let finalChannel = channel;

      if (isPlaying) {
        if (!player.alive) {
          finalChannel = 'DEAD';
        } else if (channel === 'MAFIA') {
          if (player.faction !== 'MAFIA' || player.game.phase !== 'NIGHT') {
            finalChannel = 'PUBLIC';
          }
        }
      }

      // Save message to database
      const message = await prisma.chatMessage.create({
        data: {
          gameId: player.gameId,
          authorId: player.id,
          content,
          day: player.game.day,
          phase: player.game.phase,
          channel: finalChannel,
        },
      });

      // Emit to appropriate room
      let room = client.gameCode;
      if (finalChannel === 'MAFIA') {
        room = `${client.gameCode}:mafia`;
      } else if (finalChannel === 'DEAD') {
        room = `${client.gameCode}:dead`;
      }

      io.to(room).emit('chat:message', {
        id: message.id,
        author: {
          id: player.id,
          name: player.name,
          position: player.position,
        },
        content: message.content,
        timestamp: message.timestamp,
        channel: finalChannel,
      });

      // Save to game events for bot context
      await prisma.gameEvent.create({
        data: {
          gameId: player.gameId,
          type: 'CHAT_MESSAGE',
          data: { playerName: player.name, content, channel: finalChannel },
          day: player.game.day,
          phase: player.game.phase,
        },
      }).catch(() => {}); // Non-critical

      // Trigger bot reactions to human messages
      if (finalChannel === 'PUBLIC' && !player.isBot) {
        triggerChatReaction(player.gameId, client.gameCode, { content, author: player.name }, io)
          .catch((err) => console.error('🤖 Bot reaction error:', err.message));
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });
}
