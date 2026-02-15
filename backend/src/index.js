// ============================================
// SERVER ENTRY POINT
// ============================================

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma.js';
import { setConnectedClients } from './gameEngine.js';
import apiRoutes from './routes/api.js';
import { registerAllHandlers } from './sockets/index.js';

// Load environment variables
dotenv.config();

// Re-export prisma for backward compatibility
export { prisma };

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: 'connected',
  });
});

// REST API routes
app.use('/api', apiRoutes);

// Socket.IO connection handling
const connectedClients = new Map();
setConnectedClients(connectedClients);

io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  connectedClients.set(socket.id, {
    socketId: socket.id,
    gameCode: null,
    playerId: null,
    connectedAt: new Date(),
  });

  registerAllHandlers(socket, io, connectedClients);
});

// Start server
const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`
    🚀 Server running on port ${PORT}
    📡 Socket.IO ready
    💾 Database connected
    🎮 Mafia Game API ready
  `);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down gracefully...');
  await prisma.$disconnect();
  httpServer.close();
  process.exit(0);
});
