# 🎭 MAFIA GAME - Proyecto Iniciado

## ✅ Resumen del Desarrollo

Se ha completado exitosamente la **Fase 0: Setup Inicial** del proyecto Mafia Game (Town of Salem style).

### 📦 Estructura del Proyecto

```
Town of Salem/
├── docs/                          # 📚 Documentación completa (23 archivos)
│   ├── README.md
│   ├── TECH_STACK.md
│   ├── IMPLEMENTATION_CHECKLIST.md
│   ├── DATABASE_SCHEMA_ROLE_COMPLETO.md
│   ├── ALL_ROLES.md (53 roles)
│   ├── GAME_FLOW.md
│   ├── BOT_SYSTEM.md
│   └── ... (16 más)
│
├── backend/                       # 🔧 Backend (Node.js + Express + Socket.io)
│   ├── prisma/
│   │   ├── schema.prisma         # ✅ Schema completo con 53 roles
│   │   └── seed.js               # ✅ Seed con roles base
│   ├── src/
│   │   └── index.js              # ✅ Servidor Express + Socket.io listo
│   ├── package.json              # ✅ Dependencias configuradas
│   ├── .env.example
│   └── README.md
│
└── frontend/                      # 🎨 Frontend (Next.js 14 + React)
    ├── app/
    │   ├── layout.tsx            # ✅ Layout principal
    │   ├── page.tsx              # ✅ Home page (lobby)
    │   └── globals.css           # ✅ Estilos medievales
    ├── components/               # (Por implementar)
    ├── hooks/
    │   ├── useSocket.ts          # ✅ Hook de Socket.io
    │   ├── useOrientation.ts     # ✅ Detección de orientación
    │   └── useGame.ts            # ✅ Gestión de estado del juego
    ├── store/
    │   ├── gameStore.ts          # ✅ Zustand store (juego)
    │   └── userStore.ts          # ✅ Zustand store (usuario)
    ├── lib/
    │   ├── socket.ts             # ✅ Cliente Socket.io
    │   └── utils.ts              # ✅ Utilidades
    ├── tailwind.config.js        # ✅ Tema medieval
    ├── package.json              # ✅ Dependencias Next.js
    └── README.md
```

---

## 🎯 Completado

### ✅ Backend
- [x] Proyecto Node.js + Express inicializado
- [x] Socket.io configurado para tiempo real
- [x] Prisma ORM con PostgreSQL
- [x] Schema completo con:
  - 4 Facciones (Town, Mafia, Coven, Neutral)
  - 11 Alineaciones (TI, TP, TK, TS, MK, MD, MS, NE, NK, NB, NC, CE)
  - Modelo Role con 40+ campos (completo y data-driven)
  - Sistema de acciones, votaciones, chat
- [x] Seed file con roles base (13 roles de ejemplo)
- [x] REST API endpoints básicos (/api/roles, /api/games)
- [x] Socket.io events (game:join, chat:message, etc.)
- [x] Sistema de rooms para partidas

### ✅ Frontend
- [x] Next.js 14 con App Router
- [x] TypeScript configurado
- [x] Tailwind CSS con tema medieval/gótico
- [x] Paleta de colores medieval (madera, oro, sangre)
- [x] Animaciones con Framer Motion
- [x] Fonts personalizadas (Pirata One, MedievalSharp, Crimson Text)
- [x] Hooks personalizados:
  - `useSocket` - Conexión Socket.io con reconexión automática
  - `useOrientation` - Detección Portrait/Landscape
  - `useGame` - Gestión de estado del juego
- [x] Zustand stores:
  - `gameStore` - Estado de partida, jugadores, chat
  - `userStore` - Usuario, stats, deviceId persistente
- [x] Página principal (Home/Lobby)
- [x] Componentes medievales reutilizables
- [x] Sistema responsive (Portrait para menús, Landscape para juego)

---

## 📊 Tecnologías Implementadas

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Real-time**: Socket.io 4.8
- **Database**: PostgreSQL con Prisma ORM
- **Validación**: Manual (por implementar zod/joi)

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI**: React 18 + TypeScript
- **Styling**: Tailwind CSS 3.4
- **Animations**: Framer Motion 11
- **State**: Zustand 4.5
- **Real-time**: Socket.io Client 4.8
- **Icons**: Lucide React

---

## 📝 Próximos Pasos (Fase 1: MVP)

### Semana 1: Lobby y Creación de Partidas
- [ ] Componente de creación de partida
- [ ] Selector de modo de juego
- [ ] Configurador de role list
- [ ] Lista de jugadores en espera
- [ ] Botón "Ready" y cuenta regresiva
- [ ] QR code para unirse

### Semana 1-2: Asignación de Roles
- [ ] Función `getRoleList(playerCount, mode)`
- [ ] Función `resolveSlots(roleList)` - Resolver "Random", "Any"
- [ ] Validación de balance (Town ≥40%, Mafia ≥25%)
- [ ] Barajar y asignar roles
- [ ] Notificación privada de rol (Socket.io rooms)
- [ ] Crear chat de Mafia (room privado)

### Semana 2: Ciclo Día/Noche
- [ ] Sistema de fases (DAY → VOTING → TRIAL → NIGHT)
- [ ] Timers configurables
- [ ] Chat público (día)
- [ ] Panel de acciones nocturnas
- [ ] Sistema de votaciones
- [ ] Juicio con defensa
- [ ] Procesamiento de acciones nocturnas (prioridades 1-8)

### Semana 3: Chat y Victoria
- [ ] Sistema de chat completo
- [ ] Susurros (opcional)
- [ ] Testamentos
- [ ] Notas de muerte
- [ ] Win conditions
- [ ] Pantalla de victoria
- [ ] Guardar stats en BD

---

## 🚀 Cómo Ejecutar

### Backend
```bash
cd backend
npm install

# Configurar .env con DATABASE_URL
cp .env.example .env
# Editar .env con tu DB y API keys

# Generar Prisma Client
npm run prisma:generate

# Crear base de datos
npm run prisma:migrate

# Poblar roles
npm run prisma:seed

# Iniciar servidor
npm run dev
```

### Frontend
```bash
cd frontend
npm install

# Configurar variables de entorno
cp .env.local.example .env.local
# Editar .env.local con URL del backend

# Iniciar desarrollo
npm run dev
```

### Acceso
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Backend Health: http://localhost:3001/health

---

## 📚 Documentación de Referencia

Los siguientes documentos contienen toda la información necesaria:

### Arquitectura y Setup
- [README.md](docs/README.md) - Overview del proyecto
- [TECH_STACK.md](docs/TECH_STACK.md) - Stack técnico detallado
- [IMPLEMENTATION_CHECKLIST.md](docs/IMPLEMENTATION_CHECKLIST.md) - Guía paso a paso

### Base de Datos y Roles
- [DATABASE.md](docs/DATABASE.md) - Schema de BD simplificado
- [DATABASE_SCHEMA_ROLE_COMPLETO.md](docs/DATABASE_SCHEMA_ROLE_COMPLETO.md) - ⭐ Schema definitivo
- [ALL_ROLES.md](docs/ALL_ROLES.md) - 53 roles completos de Town of Salem
- [ROLES.md](docs/ROLES.md) - Implementación de 38 roles prioritarios

### Mecánicas de Juego
- [GAME_FLOW.md](docs/GAME_FLOW.md) - Flujo completo de una partida
- [GAME_MODES.md](docs/GAME_MODES.md) - 9 modos de juego
- [PRIORITIES_TABLE.md](docs/PRIORITIES_TABLE.md) - ⭐ Sistema de prioridades (1-8)
- [ACTION_STAGING_SYSTEM.md](docs/ACTION_STAGING_SYSTEM.md) - Resolución de acciones

### Sistema de Bots
- [BOT_SYSTEM.md](docs/BOT_SYSTEM.md) - Sistema básico de IA
- [BOT_SYSTEM_ADVANCED.md](docs/BOT_SYSTEM_ADVANCED.md) - ⭐ Implementación avanzada

### UI/UX y Assets
- [UI_UX_DESIGN.md](docs/UI_UX_DESIGN.md) - Diseño visual y UX
- [VISUAL_ASSETS.md](docs/VISUAL_ASSETS.md) - Sistema de 360+ imágenes
- [ROLE_CARDS.md](docs/ROLE_CARDS.md) - Tarjetas de rol

---

## 🎮 Estado Actual

### ✅ Funcionando
- Servidor backend con Express y Socket.io
- Base de datos PostgreSQL con Prisma
- Schema completo de 53 roles (data-driven)
- Frontend con Next.js 14 y tema medieval
- Sistema de estado con Zustand
- Conexión tiempo real Socket.io
- Hooks personalizados (socket, orientation, game)
- Página de inicio con crear/unirse a partida

### 🚧 En Progreso
- Asignación de roles
- Ciclo día/noche
- Sistema de votaciones
- Chat completo

### 📋 Por Hacer
- Sistema de bots con IA
- 40 roles restantes
- Modos de juego adicionales
- Assets visuales
- Sistema de stats y progresión
- Deployment

---

## 💡 Notas Importantes

### Base de Datos
- El schema de `Role` está completo con 40+ campos
- Es 100% data-driven (no hardcodear mecánicas)
- El seed incluye 13 roles de ejemplo
- Agregar los 40 roles restantes siguiendo el mismo patrón

### Real-time
- Socket.io configurado con rooms por partida
- Reconexión automática
- Events definidos (game:join, player:ready, chat:message, etc.)

### Orientación
- Portrait: Lobby, perfil, configuración
- Landscape: Gameplay principal
- Hook `useOrientation` detecta automáticamente

### Tema Visual
- Colores medievales/góticos
- Animaciones suaves con Framer Motion
- Tipografías personalizadas

---

## 🎯 Objetivo del Proyecto

Crear un clon funcional de **Town of Salem** con:
- 53 roles con mecánicas completas
- Sistema de bots IA con Google Gemini
- 9 modos de juego
- UI medieval/gótica inmersiva
- Multiplayer en tiempo real
- 100% gratis para ti y tus amigos

---

**Estado**: ✅ Fase 0 completada - Listo para comenzar Fase 1 (MVP)

**Última actualización**: Febrero 2026
