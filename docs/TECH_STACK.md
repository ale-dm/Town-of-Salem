# 🛠️ TECH STACK - Stack Técnico Completo

## 📋 Índice
- [Frontend Stack](#frontend-stack)
- [Backend Stack](#backend-stack)
- [Base de Datos](#base-de-datos)
- [AI/ML](#aiml)
- [DevOps](#devops)
- [Herramientas de Desarrollo](#herramientas-de-desarrollo)

---

## Frontend Stack

### **Framework: Next.js 14**
```json
{
  "next": "^14.1.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0"
}
```

**Por qué Next.js:**
- ✅ App Router moderno
- ✅ Server Components
- ✅ API Routes integradas
- ✅ Image optimization
- ✅ Deploy fácil en Vercel
- ✅ SSR/SSG/ISR flexible

**Estructura App Router:**
```
app/
├── layout.tsx              # Layout principal
├── page.tsx               # Home (lobby)
├── game/
│   └── [id]/
│       └── page.tsx       # Gameplay (landscape)
├── profile/
│   └── page.tsx          # Perfil (portrait)
└── bots/
    └── page.tsx          # Config bots (portrait)
```

---

### **Styling: Tailwind CSS**
```json
{
  "tailwindcss": "^3.4.0",
  "postcss": "^8.4.0",
  "autoprefixer": "^10.4.0"
}
```

**Configuración Tailwind:**
```javascript
// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'mafia-dark': '#0a0603',
        'mafia-wood': '#6b3410',
        'mafia-gold': '#ffd700',
        'mafia-blood': '#8b0000',
      },
      fontFamily: {
        'pirata': ['Pirata One', 'cursive'],
        'medieval': ['MedievalSharp', 'cursive'],
        'crimson': ['Crimson Text', 'serif'],
      },
      animation: {
        'flicker': 'flicker 2s infinite',
        'pulse-glow': 'pulseGlow 3s infinite',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.8 },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(255, 215, 0, 0.5)' },
        }
      }
    },
  },
  plugins: [],
}
```

---

### **Animations: Framer Motion**
```json
{
  "framer-motion": "^11.0.0"
}
```

**Uso:**
```typescript
// components/game/PlayerCard.tsx
import { motion } from 'framer-motion';

export function PlayerCard({ player }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.5 }}
      whileHover={{ scale: 1.05 }}
      className="player-card"
    >
      {/* content */}
    </motion.div>
  );
}
```

**Animaciones clave:**
- Transiciones página
- Hover effects en botones
- Día/Noche transitions
- Muerte de jugadores
- Aparición de mensajes
- Hoguera flickering

---

### **State Management: Zustand**
```json
{
  "zustand": "^4.5.0"
}
```

**Por qué Zustand vs Redux:**
- ✅ Más simple (menos boilerplate)
- ✅ Mejor TypeScript support
- ✅ Más pequeño (2kb vs 8kb)
- ✅ No necesita Provider
- ✅ DevTools integrado

**Store principal:**
```typescript
// lib/store.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface GameState {
  // Game state
  gameId: string | null;
  phase: 'DAY' | 'NIGHT' | 'VOTING' | 'TRIAL';
  players: Player[];
  myRole: Role | null;
  
  // UI state
  isSidebarOpen: boolean;
  selectedPlayer: string | null;
  
  // Actions
  setGameId: (id: string) => void;
  setPhase: (phase: string) => void;
  addPlayer: (player: Player) => void;
  // ... más acciones
}

export const useGameStore = create<GameState>()(
  devtools(
    persist(
      (set) => ({
        gameId: null,
        phase: 'DAY',
        players: [],
        myRole: null,
        isSidebarOpen: false,
        selectedPlayer: null,
        
        setGameId: (id) => set({ gameId: id }),
        setPhase: (phase) => set({ phase }),
        addPlayer: (player) => set((state) => ({
          players: [...state.players, player]
        })),
        // ... implementación
      }),
      { name: 'mafia-game' }
    )
  )
);
```

---

### **Real-time: Socket.io Client**
```json
{
  "socket.io-client": "^4.6.0"
}
```

**Socket Manager:**
```typescript
// lib/socket.ts
import { io, Socket } from 'socket.io-client';

class SocketManager {
  private socket: Socket | null = null;
  
  connect(gameId: string) {
    this.socket = io(process.env.NEXT_PUBLIC_API_URL!, {
      query: { gameId },
      transports: ['websocket'],
    });
    
    this.setupListeners();
  }
  
  private setupListeners() {
    this.socket?.on('phase_change', (data) => {
      useGameStore.getState().setPhase(data.phase);
    });
    
    this.socket?.on('player_joined', (player) => {
      useGameStore.getState().addPlayer(player);
    });
    
    this.socket?.on('chat_message', (message) => {
      // Handle message
    });
    
    // ... más eventos
  }
  
  emit(event: string, data: any) {
    this.socket?.emit(event, data);
  }
  
  disconnect() {
    this.socket?.disconnect();
  }
}

export const socketManager = new SocketManager();
```

**Hook personalizado:**
```typescript
// hooks/useSocket.ts
import { useEffect } from 'react';
import { socketManager } from '@/lib/socket';

export function useSocket(gameId: string) {
  useEffect(() => {
    socketManager.connect(gameId);
    
    return () => {
      socketManager.disconnect();
    };
  }, [gameId]);
  
  return {
    emit: socketManager.emit.bind(socketManager),
  };
}
```

---

### **UI Components: Shadcn/ui**
```json
{
  "@radix-ui/react-dialog": "^1.0.0",
  "@radix-ui/react-dropdown-menu": "^2.0.0",
  "@radix-ui/react-slider": "^1.1.0",
  "@radix-ui/react-switch": "^1.0.0",
  "@radix-ui/react-tabs": "^1.0.0",
  "@radix-ui/react-toast": "^1.1.0",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.1.0",
  "tailwind-merge": "^2.2.0"
}
```

**Componentes a usar:**
- Dialog (modales de acción nocturna)
- Dropdown Menu (opciones jugador)
- Slider (config bots)
- Switch (toggles)
- Tabs (perfil)
- Toast (notificaciones)

---

### **Icons: Lucide React**
```json
{
  "lucide-react": "^0.310.0"
}
```

**Uso:**
```typescript
import { Moon, Sun, Users, MessageCircle } from 'lucide-react';

<Moon className="w-6 h-6" /> // Fase noche
<Sun className="w-6 h-6" />  // Fase día
```

---

### **Forms: React Hook Form + Zod**
```json
{
  "react-hook-form": "^7.49.0",
  "zod": "^3.22.0",
  "@hookform/resolvers": "^3.3.0"
}
```

**Ejemplo:**
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const lobbySchema = z.object({
  playerName: z.string().min(3).max(20),
  gameCode: z.string().length(6).toUpperCase(),
});

export function JoinGameForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(lobbySchema),
  });
  
  const onSubmit = (data) => {
    // Join game
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('playerName')} />
      {errors.playerName && <span>{errors.playerName.message}</span>}
      {/* ... */}
    </form>
  );
}
```

---

### **Orientación de Pantalla Hook**
```typescript
// hooks/useOrientation.ts
import { useEffect, useState } from 'react';

export function useOrientation() {
  const [isLandscape, setIsLandscape] = useState(false);
  
  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);
  
  return { isLandscape };
}

// Uso en página de juego
export default function GamePage() {
  const { isLandscape } = useOrientation();
  
  if (!isLandscape) {
    return <RotateDevicePrompt />;
  }
  
  return <GameplayLandscape />;
}
```

---

## Backend Stack

### **Runtime: Node.js 20+**
```json
{
  "node": ">=20.0.0",
  "typescript": "^5.3.0"
}
```

---

### **Framework: Express.js**
```json
{
  "express": "^4.18.0",
  "cors": "^2.8.5",
  "helmet": "^7.1.0",
  "compression": "^1.7.4"
}
```

**Server setup:**
```typescript
// src/server.ts
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Socket.io
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  // Handle socket events
});

httpServer.listen(4000, () => {
  console.log('Server running on port 4000');
});
```

---

### **Real-time: Socket.io**
```json
{
  "socket.io": "^4.6.0"
}
```

**Event structure:**
```typescript
// src/socket/events.ts
export const SOCKET_EVENTS = {
  // Connection
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  
  // Game
  CREATE_GAME: 'create_game',
  JOIN_GAME: 'join_game',
  START_GAME: 'start_game',
  
  // Phase
  PHASE_CHANGE: 'phase_change',
  DAY_START: 'day_start',
  NIGHT_START: 'night_start',
  
  // Actions
  NIGHT_ACTION: 'night_action',
  VOTE: 'vote',
  CHAT_MESSAGE: 'chat_message',
  
  // Results
  PLAYER_DIED: 'player_died',
  GAME_END: 'game_end',
} as const;
```

---

### **Database: PostgreSQL + Prisma**
```json
{
  "prisma": "^5.8.0",
  "@prisma/client": "^5.8.0",
  "pg": "^8.11.0"
}
```

**Prisma Schema:**
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  name      String
  level     Int      @default(1)
  xp        Int      @default(0)
  createdAt DateTime @default(now())
  
  games     GamePlayer[]
  stats     UserStats?
}

model Game {
  id          String      @id @default(cuid())
  code        String      @unique
  status      GameStatus  @default(WAITING)
  phase       GamePhase   @default(DAY)
  day         Int         @default(1)
  createdAt   DateTime    @default(now())
  startedAt   DateTime?
  endedAt     DateTime?
  
  players     GamePlayer[]
  messages    ChatMessage[]
  actions     GameAction[]
}

model GamePlayer {
  id          String   @id @default(cuid())
  gameId      String
  userId      String?
  name        String
  role        String
  faction     String
  alive       Boolean  @default(true)
  isBot       Boolean  @default(false)
  
  game        Game     @relation(fields: [gameId], references: [id])
  user        User?    @relation(fields: [userId], references: [id])
  
  @@index([gameId])
}

model UserStats {
  id              String @id @default(cuid())
  userId          String @unique
  totalGames      Int    @default(0)
  wins            Int    @default(0)
  townWins        Int    @default(0)
  mafiaWins       Int    @default(0)
  neutralWins     Int    @default(0)
  currentStreak   Int    @default(0)
  bestStreak      Int    @default(0)
  
  user            User   @relation(fields: [userId], references: [id])
}

enum GameStatus {
  WAITING
  STARTING
  PLAYING
  FINISHED
}

enum GamePhase {
  DAY
  NIGHT
  VOTING
  TRIAL
}
```

---

### **AI: Google Gemini**
```json
{
  "@google/generative-ai": "^0.2.0"
}
```

**Service:**
```typescript
// src/services/geminiService.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 500,
        responseMimeType: 'application/json',
      }
    });
  }
  
  async generateBotDecision(context: GameContext, personality: BotPersonality) {
    const prompt = this.buildPrompt(context, personality);
    
    try {
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      
      return JSON.parse(result.response.text());
    } catch (error) {
      console.error('Gemini API error:', error);
      return this.fallbackDecision();
    }
  }
  
  private buildPrompt(context: GameContext, personality: BotPersonality): string {
    // Ver BOT_SYSTEM.md para prompt completo
  }
}
```

---

### **Cache: Redis (Opcional)**
```json
{
  "redis": "^4.6.0"
}
```

**Para caché de:**
- Game states (rápido acceso)
- Bot decisions (evitar llamadas repetidas)
- Player sessions

---

## DevOps

### **Frontend Deployment: Vercel**
```bash
# vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "env": {
    "NEXT_PUBLIC_API_URL": "@api-url"
  }
}
```

---

### **Backend Deployment: Railway / Render**
```bash
# railway.toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm run start"
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
```

---

### **Database: Supabase / Railway**
```bash
# Conexión PostgreSQL
DATABASE_URL="postgresql://user:pass@host:5432/mafia_game?schema=public"
```

---

## Herramientas de Desarrollo

### **Linting**
```json
{
  "eslint": "^8.56.0",
  "eslint-config-next": "14.1.0",
  "prettier": "^3.2.0"
}
```

### **Testing**
```json
{
  "vitest": "^1.2.0",
  "@testing-library/react": "^14.1.0",
  "@testing-library/jest-dom": "^6.2.0"
}
```

### **TypeScript**
```json
{
  "typescript": "^5.3.0",
  "@types/node": "^20.11.0",
  "@types/react": "^18.2.0"
}
```

---

## Package.json Completo

### **Frontend**
```json
{
  "name": "mafia-game-frontend",
  "version": "2.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "framer-motion": "^11.0.0",
    "zustand": "^4.5.0",
    "socket.io-client": "^4.6.0",
    "lucide-react": "^0.310.0",
    "tailwindcss": "^3.4.0",
    "react-hook-form": "^7.49.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "@radix-ui/react-dialog": "^1.0.0",
    "@radix-ui/react-slider": "^1.1.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.0",
    "eslint": "^8.56.0",
    "eslint-config-next": "14.1.0"
  }
}
```

### **Backend**
```json
{
  "name": "mafia-game-backend",
  "version": "2.0.0",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "prisma:generate": "prisma generate",
    "prisma:push": "prisma db push"
  },
  "dependencies": {
    "express": "^4.18.0",
    "socket.io": "^4.6.0",
    "@google/generative-ai": "^0.2.0",
    "@prisma/client": "^5.8.0",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    "dotenv": "^16.4.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/node": "^20.11.0",
    "@types/express": "^4.17.0",
    "tsx": "^4.7.0",
    "prisma": "^5.8.0"
  }
}
```

---

**Última actualización**: Febrero 2026
