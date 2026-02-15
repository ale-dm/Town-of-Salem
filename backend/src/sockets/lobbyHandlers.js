// ============================================
// SOCKET HANDLERS - LOBBY (join, ready, bots, config, start)
// ============================================

import { prisma } from '../lib/prisma.js';
import { startGameLoop } from '../gameEngine.js';
import { getRandomPersonality, getRandomBotName } from '../bots/personalities.js';

/**
 * Register all lobby-related socket handlers
 * @param {import('socket.io').Socket} socket
 * @param {import('socket.io').Server} io
 * @param {Map} connectedClients
 */
export function registerLobbyHandlers(socket, io, connectedClients) {
  // ---- Join game room ----
  socket.on('game:join', async (data) => {
    try {
      const { code, playerName, userId } = data;

      const game = await prisma.game.findUnique({
        where: { code },
        include: { players: true },
      });

      if (!game) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      // Check if player already exists (for reconnection)
      let player = game.players.find((p) => {
        if (userId && p.userId) return p.userId === userId;
        return p.name === playerName && !p.isBot;
      });

      // If game is in progress, only allow reconnection
      if (game.status === 'PLAYING' || game.status === 'FINISHED') {
        if (!player) {
          socket.emit('error', { message: 'La partida ya ha comenzado. No puedes unirte.' });
          return;
        }
        // Reconnecting — restore full state
        socket.join(code);

        if (player.faction === 'MAFIA' && player.alive) {
          socket.join(`${code}:mafia`);
        }
        if (!player.alive) {
          socket.join(`${code}:dead`);
        }

        const client = connectedClients.get(socket.id);
        client.gameCode = code;
        client.playerId = player.id;

        // Send full game state
        socket.emit('game:state', {
          game: {
            code: game.code,
            status: game.status,
            phase: game.phase,
            day: game.day,
            config: game.config,
          },
          players: await prisma.gamePlayer.findMany({
            where: { gameId: game.id },
            orderBy: { position: 'asc' },
            select: {
              id: true,
              name: true,
              position: true,
              isHost: true,
              isReady: true,
              isBot: true,
              alive: true,
              roleName: true,
              faction: true,
            },
          }),
          yourPlayerId: player.id,
        });

        // Re-send role assignment if game is active
        if (game.status === 'PLAYING' && player.roleName) {
          const role = await prisma.role.findFirst({
            where: { nameEn: player.roleName },
            include: { faction: true },
          });

          if (role) {
            const toArray = (v) => {
              if (Array.isArray(v)) return v;
              if (typeof v === 'string') return v.split('\n').map((s) => s.trim()).filter(Boolean);
              return [];
            };
            socket.emit('role:assigned', {
              roleName: role.nameEn,
              roleNameEs: role.nameEs,
              faction: role.faction.name.toUpperCase(),
              icon: role.icon,
              color: role.color,
              goalEs: role.goalEs,
              goalEn: role.goalEn,
              abilitiesEs: toArray(role.abilitiesEs),
              abilitiesEn: toArray(role.abilitiesEn),
            });
          }
        }

        // Send recent chat messages
        const recentMessages = await prisma.chatMessage.findMany({
          where: { gameId: game.id },
          include: { author: { select: { id: true, name: true, position: true } } },
          orderBy: { timestamp: 'desc' },
          take: 50,
        });
        for (const msg of recentMessages.reverse()) {
          const canSee =
            msg.channel === 'PUBLIC' ||
            (msg.channel === 'MAFIA' && player.faction === 'MAFIA') ||
            (msg.channel === 'DEAD' && !player.alive);
          if (canSee) {
            socket.emit('chat:message', {
              id: msg.id,
              author: { id: msg.author.id, name: msg.author.name, position: msg.author.position },
              content: msg.content,
              timestamp: msg.timestamp,
              channel: msg.channel,
            });
          }
        }

        io.to(code).emit('player:reconnected', {
          playerId: player.id,
          playerName: player.name,
        });

        console.log(`🔄 Player ${playerName} reconnected to game ${code}`);
        return;
      }

      if (game.status !== 'WAITING' && game.status !== 'STARTING') {
        socket.emit('error', { message: 'Game already started' });
        return;
      }

      if (!player) {
        player = await prisma.gamePlayer.create({
          data: {
            gameId: game.id,
            userId: userId || null,
            name: playerName,
            position: game.players.length + 1,
            alive: true,
            isBot: false,
            isHost: game.players.length === 0,
            isReady: false,
            faction: 'TOWN',
            roleName: '',
          },
        });
      }

      socket.join(code);

      const client = connectedClients.get(socket.id);
      client.gameCode = code;
      client.playerId = player.id;

      io.to(code).emit('player:joined', {
        player: {
          id: player.id,
          name: player.name,
          isHost: player.isHost,
          isReady: player.isReady,
          position: player.position,
        },
        playerCount: game.players.length + 1,
      });

      socket.emit('game:state', {
        game: {
          code: game.code,
          status: game.status,
          phase: game.phase,
          day: game.day,
          config: game.config,
        },
        players: await prisma.gamePlayer.findMany({
          where: { gameId: game.id },
          orderBy: { position: 'asc' },
          select: {
            id: true,
            name: true,
            position: true,
            isHost: true,
            isReady: true,
            isBot: true,
            alive: true,
          },
        }),
        yourPlayerId: player.id,
      });

      console.log(`Player ${playerName} joined game ${code}`);
    } catch (error) {
      console.error('Error joining game:', error);
      socket.emit('error', { message: 'Failed to join game' });
    }
  });

  // ---- Player ready toggle ----
  socket.on('player:ready', async (data) => {
    try {
      const client = connectedClients.get(socket.id);
      if (!client || !client.playerId) return;

      const player = await prisma.gamePlayer.update({
        where: { id: client.playerId },
        data: { isReady: data.isReady },
      });

      io.to(client.gameCode).emit('player:ready', {
        playerId: player.id,
        isReady: player.isReady,
      });
    } catch (error) {
      console.error('Error toggling ready:', error);
    }
  });

  // ---- Add bot (host only) ----
  socket.on('game:add-bot', async (data) => {
    try {
      const client = connectedClients.get(socket.id);
      if (!client || !client.gameCode) return;

      const game = await prisma.game.findUnique({
        where: { code: client.gameCode },
        include: { players: true },
      });
      if (!game) return;

      const sender = game.players.find((p) => p.id === client.playerId);
      if (!sender || !sender.isHost) {
        socket.emit('error', { message: 'Solo el host puede añadir bots' });
        return;
      }

      const maxPlayers = game.config?.maxPlayers || 15;
      if (game.players.length >= maxPlayers) {
        socket.emit('error', { message: 'Partida llena' });
        return;
      }

      const usedNames = game.players.map((p) => p.name);
      const botName = data?.name || getRandomBotName(usedNames);
      const personality = getRandomPersonality();

      const botPlayer = await prisma.gamePlayer.create({
        data: {
          gameId: game.id,
          name: botName,
          isBot: true,
          isReady: true,
          isHost: false,
          position: game.players.length + 1,
          faction: 'TOWN',
          roleName: '',
          alive: true,
          botPersonalityId: personality.id,
        },
      });

      io.to(client.gameCode).emit('player:joined', {
        player: {
          id: botPlayer.id,
          name: botPlayer.name,
          position: botPlayer.position,
          isHost: false,
          isReady: true,
          isBot: true,
          alive: true,
        },
        playerCount: game.players.length + 1,
      });

      console.log(`🤖 Bot "${botName}" added to game ${client.gameCode}`);
    } catch (error) {
      console.error('Error adding bot:', error);
      socket.emit('error', { message: 'Error al añadir bot' });
    }
  });

  // ---- Remove bot (host only) ----
  socket.on('game:remove-bot', async (data) => {
    try {
      const client = connectedClients.get(socket.id);
      if (!client || !client.gameCode) return;

      const game = await prisma.game.findUnique({
        where: { code: client.gameCode },
        include: { players: true },
      });
      if (!game) return;

      const sender = game.players.find((p) => p.id === client.playerId);
      if (!sender || !sender.isHost) return;

      const botPlayer = game.players.find((p) => p.id === data.playerId && p.isBot);
      if (!botPlayer) return;

      await prisma.gamePlayer.delete({ where: { id: botPlayer.id } });

      io.to(client.gameCode).emit('player:left', {
        playerId: botPlayer.id,
        playerName: botPlayer.name,
      });

      console.log(`🤖 Bot "${botPlayer.name}" removed from game ${client.gameCode}`);
    } catch (error) {
      console.error('Error removing bot:', error);
    }
  });

  // ---- Update game config (host only) ----
  socket.on('game:config', async (data) => {
    try {
      const client = connectedClients.get(socket.id);
      if (!client || !client.gameCode) return;

      const game = await prisma.game.findUnique({
        where: { code: client.gameCode },
        include: { players: true },
      });
      if (!game) return;

      const player = game.players.find((p) => p.id === client.playerId);
      if (!player || !player.isHost) {
        socket.emit('error', { message: 'Only host can change config' });
        return;
      }

      const currentConfig = (typeof game.config === 'object' && game.config) || {};
      const newConfig = { ...currentConfig, ...data };

      await prisma.game.update({
        where: { id: game.id },
        data: { config: newConfig },
      });

      io.to(client.gameCode).emit('game:state', {
        ...game,
        config: newConfig,
      });

      console.log(`Game ${client.gameCode} config updated:`, Object.keys(data));
    } catch (error) {
      console.error('Error updating config:', error);
    }
  });

  // ---- Start game (host only) ----
  socket.on('game:start', async (data) => {
    try {
      const client = connectedClients.get(socket.id);
      if (!client || !client.gameCode) return;

      const game = await prisma.game.findUnique({
        where: { code: client.gameCode },
        include: { players: true },
      });

      if (!game) return;

      const player = game.players.find((p) => p.id === client.playerId);
      if (!player || !player.isHost) {
        socket.emit('error', { message: 'Only host can start the game' });
        return;
      }

      const minPlayers = game.config?.minPlayers || 4;
      if (game.players.length < minPlayers) {
        socket.emit('error', { message: `Need at least ${minPlayers} players` });
        return;
      }

      await prisma.game.update({
        where: { id: game.id },
        data: {
          status: 'STARTING',
          startedAt: new Date(),
        },
      });

      io.to(client.gameCode).emit('game:starting', {
        countdown: 5,
      });

      setTimeout(async () => {
        try {
          await startGameLoop(game.id, client.gameCode, io);
        } catch (err) {
          console.error('Error starting game loop:', err);
          io.to(client.gameCode).emit('error', { message: 'Error al iniciar el juego' });
        }
      }, 5000);

      console.log(`Game ${client.gameCode} starting...`);
    } catch (error) {
      console.error('Error starting game:', error);
      socket.emit('error', { message: 'Failed to start game' });
    }
  });
}
