// ============================================
// SOCKET HANDLER REGISTRY
// Centralizes registration of all socket handler modules
// ============================================

import { registerLobbyHandlers } from './lobbyHandlers.js';
import { registerGameHandlers } from './gameHandlers.js';
import { registerChatHandlers } from './chatHandlers.js';
import { registerRoleHandlers } from './roleHandlers.js';

/**
 * Register all socket handlers for a connected client
 * @param {import('socket.io').Socket} socket
 * @param {import('socket.io').Server} io
 * @param {Map} connectedClients
 */
export function registerAllHandlers(socket, io, connectedClients) {
  registerLobbyHandlers(socket, io, connectedClients);
  registerGameHandlers(socket, io, connectedClients);
  registerChatHandlers(socket, io, connectedClients);
  registerRoleHandlers(socket, io, connectedClients);

  // ---- Disconnect ----
  socket.on('disconnect', () => {
    const client = connectedClients.get(socket.id);
    if (client && client.gameCode) {
      io.to(client.gameCode).emit('player:disconnected', {
        playerId: client.playerId,
      });
    }
    connectedClients.delete(socket.id);
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
}
