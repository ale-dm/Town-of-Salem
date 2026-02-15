// ============================================
// REST API ROUTES
// ============================================

import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

// Get all roles
router.get('/roles', async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      where: { isEnabled: true },
      include: {
        faction: true,
        alignment: true,
      },
      orderBy: [
        { faction: { name: 'asc' } },
        { alignment: { name: 'asc' } },
        { nameEn: 'asc' },
      ],
    });
    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// Get role by slug
router.get('/roles/:slug', async (req, res) => {
  try {
    const role = await prisma.role.findUnique({
      where: { slug: req.params.slug },
      include: {
        faction: true,
        alignment: true,
      },
    });

    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    res.json(role);
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({ error: 'Failed to fetch role' });
  }
});

// Create a new game
router.post('/games/create', async (req, res) => {
  try {
    const { hostName, settings } = req.body;

    // Generate unique 6-character code
    const code = generateGameCode();

    // Create game in database
    const game = await prisma.game.create({
      data: {
        code,
        status: 'WAITING',
        phase: 'DAY',
        day: 1,
        config: settings || {},
      },
    });

    res.json({
      gameId: game.id,
      code: game.code,
      joinUrl: `${process.env.FRONTEND_URL}/game/${game.code}`,
      status: game.status,
      createdAt: game.createdAt,
    });
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({ error: 'Failed to create game' });
  }
});

// Get game by code
router.get('/games/:code', async (req, res) => {
  try {
    const game = await prisma.game.findUnique({
      where: { code: req.params.code },
      include: {
        players: {
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    res.json(game);
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({ error: 'Failed to fetch game' });
  }
});

// ============================================
// UTILITY
// ============================================

function generateGameCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

export default router;
