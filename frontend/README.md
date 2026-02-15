# Mafia Game - Frontend

Frontend application for the Mafia/Town of Salem game built with Next.js 14.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Real-time**: Socket.io Client
- **Icons**: Lucide React

## Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Configure environment**:
```bash
cp .env.local.example .env.local
# Edit .env.local with your backend URL
```

3. **Run development server**:
```bash
npm run dev
```

4. **Open browser**:
```
http://localhost:3000
```

## Project Structure

```
frontend/
├── app/                    # Next.js 14 App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home/Lobby (portrait)
│   ├── game/
│   │   └── [code]/
│   │       └── page.tsx   # Gameplay (landscape)
│   ├── profile/
│   │   └── page.tsx       # User profile
│   └── bots/
│       └── page.tsx       # Bot configuration
├── components/            # React components
│   ├── game/             # Game-specific components
│   ├── lobby/            # Lobby components
│   └── ui/               # Reusable UI components
├── hooks/                # Custom React hooks
│   ├── useSocket.ts      # Socket.io hook
│   ├── useOrientation.ts # Screen orientation detection
│   └── useGame.ts        # Game state management
├── lib/                  # Utilities and helpers
│   ├── socket.ts         # Socket.io client setup
│   └── utils.ts          # Utility functions
├── store/                # Zustand stores
│   ├── gameStore.ts      # Game state store
│   └── userStore.ts      # User state store
├── styles/               # Global styles
│   └── globals.css       # Tailwind + custom styles
└── public/               # Static assets
    └── icons/            # Game icons and images
```

## Features

- ✅ Responsive design (Portrait for menus, Landscape for gameplay)
- ✅ Real-time multiplayer with Socket.io
- ✅ Role-based gameplay system
- ✅ AI bot system
- ✅ Medieval/gothic theme
- ✅ Smooth animations with Framer Motion
- ✅ Persistent game state with Zustand

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

See `.env.local.example` for all required environment variables.

## License

MIT
