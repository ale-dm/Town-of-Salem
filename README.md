# 🎭 Mafia Game - Town of Salem Style

Un juego de deducción social tipo Town of Salem desarrollado con Next.js, React, Node.js y PostgreSQL.

## 📋 Descripción

**Mafia Game** es un clon completo de Town of Salem con 53 roles, sistema de bots IA inteligentes, 9 modos de juego y una interfaz medieval/gótica inmersiva. Diseñado para jugar con tus amigos en tiempo real.

### ✨ Características

- 🎭 **53 Roles Completos** - Town, Mafia, Neutral y Coven con mecánicas detalladas
- 🤖 **Bots IA** - Powered by Google Gemini 2.0 Flash (gratis)
- 🎮 **9 Modos de Juego** - Classic, Ranked, All Any, Rainbow, Coven, y más
- 🌐 **Multiplayer en Tiempo Real** - Socket.io para sincronización instantánea
- 📱 **Responsive** - Portrait para menús, Landscape para gameplay
- 🎨 **Tema Medieval** - UI inspirada en Town of Salem con animaciones suaves
- 💾 **Persistencia** - Stats, progresión y historial de partidas
- 🔄 **Sistema de Prioridades** - Resolución compleja de acciones nocturnas (1-8)

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 20+
- PostgreSQL 15+
- npm o yarn

### Instalación

1. **Clonar repositorio** (ya lo tienes)
2. **Configurar Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Editar .env con tu configuración
   npm run prisma:migrate
   npm run prisma:seed
   npm run dev
   ```

3. **Configurar Frontend**
   ```bash
   cd frontend
   npm install
   cp .env.local.example .env.local
   # Editar .env.local
   npm run dev
   ```

4. **Abrir navegador**
   ```
   http://localhost:3000
   ```

📖 **Guía detallada**: Ver [QUICK_START.md](QUICK_START.md)

## 📚 Documentación

### Archivos Principales
- 📘 [QUICK_START.md](QUICK_START.md) - Guía de inicio rápido
- 📗 [DEVELOPMENT_STATUS.md](DEVELOPMENT_STATUS.md) - Estado actual del desarrollo
- 📙 [docs/README.md](docs/README.md) - Documentación completa del proyecto
- 📕 [docs/IMPLEMENTATION_CHECKLIST.md](docs/IMPLEMENTATION_CHECKLIST.md) - Guía de implementación paso a paso

### Documentación Técnica
- [docs/TECH_STACK.md](docs/TECH_STACK.md) - Stack técnico detallado
- [docs/DATABASE_SCHEMA_ROLE_COMPLETO.md](docs/DATABASE_SCHEMA_ROLE_COMPLETO.md) - Schema definitivo de roles
- [docs/ALL_ROLES.md](docs/ALL_ROLES.md) - 53 roles de Town of Salem
- [docs/GAME_FLOW.md](docs/GAME_FLOW.md) - Flujo completo de una partida
- [docs/PRIORITIES_TABLE.md](docs/PRIORITIES_TABLE.md) - Sistema de prioridades de acciones
- [docs/BOT_SYSTEM_ADVANCED.md](docs/BOT_SYSTEM_ADVANCED.md) - Sistema de IA para bots

## 🏗️ Stack Tecnológico

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI**: React 18 + TypeScript
- **Styling**: Tailwind CSS + Framer Motion
- **State**: Zustand
- **Real-time**: Socket.io Client

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Real-time**: Socket.io
- **Database**: PostgreSQL 15+ con Prisma ORM
- **AI**: Google Gemini 2.0 Flash

## 📁 Estructura del Proyecto

```
Town of Salem/
├── backend/              # Node.js + Express + Socket.io
│   ├── prisma/          # Schema y seed de BD
│   ├── src/             # Código fuente
│   └── package.json
│
├── frontend/            # Next.js 14 + React
│   ├── app/            # Next.js App Router
│   ├── components/     # Componentes React
│   ├── hooks/          # Custom hooks
│   ├── store/          # Zustand stores
│   └── package.json
│
├── docs/               # Documentación completa (23 archivos)
│   ├── README.md
│   ├── TECH_STACK.md
│   ├── ALL_ROLES.md
│   └── ...
│
├── QUICK_START.md      # Guía de inicio rápido
├── DEVELOPMENT_STATUS.md # Estado del proyecto
└── README.md           # Este archivo
```

## 🎮 Cómo Jugar

### Crear Partida
1. Ingresa tu nombre
2. Click en "Crear Partida"
3. Configura opciones (jugadores, roles, modo)
4. Comparte código de 6 dígitos
5. Iniciar cuando todos estén listos

### Unirse a Partida
1. Ingresa tu nombre
2. Ingresa código de 6 dígitos
3. Click en "Unirse a Partida"
4. Esperar a que el host inicie

## 🎯 Estado del Desarrollo

### ✅ Completado (Fase 0)
- Estructura de proyecto backend y frontend
- Prisma schema completo (53 roles)
- Express + Socket.io configurado
- Next.js con tema medieval
- Hooks personalizados (useSocket, useOrientation, useGame)
- Zustand stores (gameStore, userStore)
- Página principal (Home/Lobby)

### 🚧 En Progreso (Fase 1)
- Sistema de lobby completo
- Asignación de roles
- Ciclo día/noche
- Sistema de votaciones
- Chat en tiempo real

### 📋 Próximamente
- 40 roles adicionales
- Sistema de bots IA
- Modos de juego adicionales
- Assets visuales con IA
- Sistema de stats y progresión

Ver detalles en [DEVELOPMENT_STATUS.md](DEVELOPMENT_STATUS.md)

## 🤝 Contribuir

Este es un proyecto personal, pero las sugerencias y mejoras son bienvenidas.

### Añadir un Nuevo Rol

1. Agregar definición en `backend/prisma/seed.js`
2. Seguir el esquema en `docs/DATABASE_SCHEMA_ROLE_COMPLETO.md`
3. Ejecutar `npm run prisma:seed`
4. Implementar lógica en el game engine

### Reportar Bugs

Documenta:
- Pasos para reproducir
- Comportamiento esperado vs actual
- Screenshots si es posible
- Navegador y sistema operativo

## 📄 Licencia

MIT License - Ver [LICENSE](LICENSE) para detalles

## 🙏 Créditos

- **Inspirado por**: Town of Salem (BlankMediaGames)
- **Desarrollado con**: ❤️ y ☕
- **AI Asistido**: Google Gemini, Claude
- **Assets**: (Por implementar - DALL-E, Stable Diffusion)

## 📞 Enlaces Útiles

- [Town of Salem Wiki](https://town-of-salem.fandom.com/wiki/Town_of_Salem_Wiki)
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Socket.io Docs](https://socket.io/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 💡 Notas del Desarrollador

### Por qué este proyecto?
- Aprender desarrollo full-stack moderno
- Implementar un juego complejo con mecánicas de estado
- Experimentar con IA para bots
- Crear algo divertido para jugar con amigos

### Características Únicas
- **100% Data-Driven**: Todos los roles están en la BD, no hardcodeados
- **Sistema de Prioridades**: Las acciones se resuelven en orden (1-8)
- **IA Inteligente**: Bots con personalidades y estrategias únicas
- **Escalable**: Fácil agregar nuevos roles y mecánicas

### Tecnologías de Interés
- Next.js 14 App Router (RSC, Server Actions)
- Socket.io para real-time
- Prisma con PostgreSQL (schema complejo)
- Zustand para state management
- Framer Motion para animaciones

---

**¿Listo para comenzar?** 👉 Lee [QUICK_START.md](QUICK_START.md)

**¿Quieres desarrollar?** 👉 Lee [DEVELOPMENT_STATUS.md](DEVELOPMENT_STATUS.md)

**¿Necesitas ayuda?** 👉 Revisa la carpeta [docs/](docs/)

---

*Última actualización: Febrero 2026*

**Estado**: ✅ Fase 0 completada - Listo para MVP
