# Mafia Game - Backend

Backend server for the Mafia/Town of Salem game with AI bot system.

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Real-time**: Socket.io
- **Database**: PostgreSQL 15+ with Prisma ORM
- **AI**: Google Gemini 2.0 Flash (free tier)

## Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Setup database**:
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database with roles
npm run prisma:seed
```

4. **Start development server**:
```bash
npm run dev
```

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.js            # Seed data (53 roles)
├── src/
│   ├── index.js           # Main entry point
│   ├── socket/            # Socket.io handlers
│   │   ├── gameEvents.js
│   │   └── chatEvents.js
│   ├── services/          # Business logic
│   │   ├── gameService.js
│   │   ├── roleService.js
│   │   ├── botService.js
│   │   └── actionResolver.js
│   ├── utils/            # Utilities
│   │   ├── gameCode.js
│   │   └── validators.js
│   └── config/           # Configuration
│       └── constants.js
└── package.json
```

## API Endpoints

### REST API
- `POST /api/games/create` - Create new game
- `POST /api/games/:code/join` - Join existing game
- `GET /api/games/:code` - Get game state
- `GET /api/roles` - Get all roles
- `GET /api/stats/:userId` - Get user stats

### WebSocket Events
- `game:created` - Game created
- `player:joined` - Player joined lobby
- `game:started` - Game started
- `phase:changed` - Day/Night phase changed
- `chat:message` - Chat message
- `action:performed` - Night action performed
- `vote:cast` - Vote cast
- `game:ended` - Game ended

## Environment Variables

See `.env.example` for all required environment variables.

## License

MIT
