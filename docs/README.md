# 🎭 MAFIA GAME - Documentación Completa (Actualizado)

## 📋 Índice
- [README.md](README.md) - Este archivo
- [TECH_STACK.md](docs/TECH_STACK.md) - Stack técnico completo
- [GAME_FLOW.md](docs/GAME_FLOW.md) - Flujo de juego
- [ROLES.md](docs/ROLES.md) - 38+ roles detallados
- [BOT_SYSTEM.md](docs/BOT_SYSTEM.md) - Sistema de IA para bots
- [UI_UX_DESIGN.md](docs/UI_UX_DESIGN.md) - Diseño visual
- [API_SPEC.md](docs/API_SPEC.md) - API y WebSockets
- [DATABASE.md](docs/DATABASE.md) - Esquema de base de datos

---

## 🎯 Visión del Proyecto

**Mafia Game** es un juego privado de deducción social tipo Town of Salem para **ti y tus amigos**, con sistema de bots IA inteligentes.

### 🎮 Características Principales

- 🌐 **Web App Moderna** - React + Next.js
- 📱 **Móvil Optimizado** - Portrait para menús, **Landscape para gameplay**
- 🤖 **Bots con IA** - Personalidades únicas + entrenamiento custom
- 🔥 **Tiempo Real** - Socket.io para sincronización
- 🎨 **Diseño Medieval** - Inspirado en Town of Salem
- 👥 **Privado** - Solo para tu grupo de amigos
- 💾 **Stats Persistentes** - Historial y progresión

---

## 🏗️ Stack Tecnológico

### Frontend
```
Framework: Next.js 14 (App Router)
UI Library: React 18
Styling: Tailwind CSS + Framer Motion
State: Zustand
Real-time: Socket.io-client
Icons: Lucide React
UI Components: Shadcn/ui + Custom
```

### Backend
```
Runtime: Node.js 20+
Framework: Express.js
Real-time: Socket.io
Database: PostgreSQL 15+
ORM: Prisma
AI: Google Gemini 2.0 Flash (gratis)
Cache: Redis (opcional)
```

### DevOps
```
Frontend: Vercel
Backend: Railway / Render
Database: Supabase / Railway
CI/CD: GitHub Actions
```

---

## 📱 Orientación de Pantalla

### **PORTRAIT MODE** 🔄 (Vertical)
Usado para:
- ✅ Lobby y creación de partida
- ✅ Perfil de usuario
- ✅ Configuración de bots
- ✅ Historial de partidas
- ✅ Stats y progresión

### **LANDSCAPE MODE** 🔄 (Horizontal)
Usado para:
- ✅ **GAMEPLAY PRINCIPAL**
- ✅ Plaza del pueblo expandida
- ✅ Chat lateral permanente
- ✅ Panel de rol siempre visible
- ✅ Lista de jugadores lateral
- ✅ Votaciones y juicios

**Razón**: En horizontal aprovechas mejor el espacio, ves más jugadores a la vez, chat + juego simultáneo, y es más cómodo para sesiones largas.

---

## 🎨 Diseño Visual

### Paleta Medieval/Gótica
```css
--bg-dark: #0a0603;
--wood: #6b3410;
--gold: #ffd700;
--blood: #8b0000;
--text: #e8d4b8;
```

### Tipografía
```
Display: Pirata One
Headers: Uncial Antiqua / MedievalSharp
Body: Crimson Text
```

### Animaciones
- Hoguera con flickering realista
- Transiciones día/noche
- Efectos de partículas (fuego, humo)
- Micro-interacciones en botones
- Smooth transitions con Framer Motion

---

## 📁 Estructura del Proyecto

```
mafia-game/
├── frontend/                 # Next.js App
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx         # Home/Lobby
│   │   ├── game/
│   │   │   └── [id]/
│   │   │       └── page.tsx # Gameplay (landscape)
│   │   ├── profile/
│   │   │   └── page.tsx     # Perfil (portrait)
│   │   └── bots/
│   │       └── page.tsx     # Config bots (portrait)
│   ├── components/
│   │   ├── game/
│   │   │   ├── TownSquare.tsx
│   │   │   ├── PlayerGrid.tsx
│   │   │   ├── RolePanel.tsx
│   │   │   └── ChatBox.tsx
│   │   ├── bots/
│   │   │   ├── BotCard.tsx
│   │   │   ├── PersonalitySlider.tsx
│   │   │   └── TrainingProgress.tsx
│   │   └── ui/
│   │       └── (shadcn components)
│   ├── lib/
│   │   ├── socket.ts        # Socket.io client
│   │   ├── store.ts         # Zustand store
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── useGame.ts
│   │   ├── useSocket.ts
│   │   └── useOrientation.ts
│   └── styles/
│       └── globals.css
│
├── backend/                  # Node.js API
│   ├── src/
│   │   ├── server.ts
│   │   ├── socket/
│   │   │   ├── gameSocket.ts
│   │   │   └── handlers/
│   │   ├── services/
│   │   │   ├── gameEngine.ts
│   │   │   ├── botEngine.ts
│   │   │   └── geminiService.ts
│   │   ├── models/
│   │   │   └── (Prisma models)
│   │   └── utils/
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
│
└── docs/                     # Documentación
    ├── TECH_STACK.md
    ├── GAME_FLOW.md
    ├── ROLES.md
    ├── BOT_SYSTEM.md
    └── API_SPEC.md
```

---

## 🤖 Sistema de Bots (Mejorado)

### **Bots Predefinidos**
1. 😰 **Paranoico** - Desconfía de todos
2. 😡 **Agresivo** - Acusa y vota rápido
3. 🕵️ **Sherlock** - Analítico y lógico
4. 🤷 **Novato** - Inseguro y sigue mayoría
5. 😶 **Silencioso** - Observa y vota estratégico
6. 🎲 **Caótico** - Impredecible

### **Bots Personalizados**
- Entrena con datos de 10+ partidas
- IA analiza tu estilo con Gemini
- Crea bot que imita tu forma de jugar
- Se actualiza automáticamente

### **IA Features**
- Memoria conversacional (solo partida actual)
- Análisis de patrones sociales
- Emociones dinámicas (stress, confianza)
- Timing realista (no responde instantáneo)
- Typos y errores humanos opcionales
- Adaptación durante la partida

---

## 🎮 Integraciones Opcionales

### **Discord Integration (Recomendado)** 🎙️

Arquitectura híbrida: Web app + Discord bot para VOZ

**Características:**
- ✅ VOZ gratis (vs WebRTC complejo/costoso)
- ✅ Canales dinámicos por facción
  - DÍA: Todos en "🏛️ Plaza del Pueblo"
  - NOCHE: Mafia en "🔴 Mafia Chat", Town silenciados
  - Muertos en "💀 Espectadores"
- ✅ Notificaciones automáticas
- ✅ Comandos: `/mafia crear`, `/mafia unirse`

**Por qué híbrido:**
- Web app = UI superior + landscape mode
- Discord = VOZ gratis + organización automática
- **Costo: $0** (vs WebRTC que es complejo)

**Documentación completa**: [docs/DISCORD_INTEGRATION.md](docs/DISCORD_INTEGRATION.md)

---

## 🎮 Modos de Juego

### **Clásico**
- 7-15 jugadores (humanos + bots)
- Lista de roles balanceada
- Duración: ~25 min

### **Rápido**
- Días/noches más cortos
- 7-10 jugadores
- Duración: ~12 min

### **Custom**
- Elige roles manualmente
- Ajusta timers
- Reglas personalizadas

---

## 📊 Sistema de Progresión

### **Para cada jugador:**
- ✅ Nivel y XP
- ✅ Stats por facción
- ✅ Win rate por rol
- ✅ Historial de partidas
- ✅ Mejores rachas
- ✅ Achievements simples

### **NO incluye** (too much para amigos):
- ❌ Rankings globales
- ❌ Sistema de monedas
- ❌ Tienda
- ❌ Battle pass
- ❌ Clanes/guilds
- ❌ Ranked competitivo

---

## 🚀 Quick Start

### **Desarrollo Local**

```bash
# 1. Clonar repo
git clone <repo-url>
cd mafia-game

# 2. Backend
cd backend
npm install
cp .env.example .env
# Configurar GEMINI_API_KEY, DATABASE_URL
npx prisma generate
npx prisma db push
npm run dev
# Server en http://localhost:4000

# 3. Frontend (nueva terminal)
cd frontend
npm install
cp .env.local.example .env.local
# Configurar NEXT_PUBLIC_API_URL
npm run dev
# App en http://localhost:3000

# 4. Jugar
# Abrir http://localhost:3000 en móvil o navegador
# Crear partida
# Añadir bots
# ¡Jugar!
```

### **Configurar Gemini API (Gratis)**

```bash
# 1. Ir a https://aistudio.google.com/app/apikey
# 2. Crear API key
# 3. Añadir a backend/.env:
GEMINI_API_KEY=tu_api_key_aqui

# Límites gratuitos:
# - 1,500 requests/día
# - 15 requests/minuto
# Suficiente para ~50 partidas/día
```

---

## 📱 Responsive Design

### **Mobile (Portrait)**
```
Max-width: 430px
└── Lobby
└── Perfil
└── Configuración
└── Historial
```

### **Mobile (Landscape) - GAMEPLAY**
```
Min-aspect-ratio: 16/9
┌─────────┬──────────────────┬──────────┐
│ Players │   Town Square    │   Chat   │
│  List   │                  │          │
│         │    🔥 Hoguera    │  Msgs    │
│ 👤 Juan │                  │  Live    │
│ 👤 María│    Players       │          │
│ 💀 Pedro│    Grid          │  [Input] │
│ ...     │                  │          │
│         │   Role Panel     │          │
│ Stats   │   [Action Btn]   │  [Send]  │
└─────────┴──────────────────┴──────────┘
```

### **Tablet/Desktop**
```
1024px+: Layout extendido, más info visible
```

---

## 🎯 Roadmap

### **Fase 1: MVP** (4-6 semanas)
- [x] Documentación completa
- [ ] Backend básico (Express + Socket.io)
- [ ] Frontend básico (Next.js + Tailwind)
- [ ] Sistema de lobbies
- [ ] 10 roles básicos
- [ ] Ciclo día/noche funcional
- [ ] Chat en tiempo real
- [ ] Votaciones
- [ ] 3 bots predefinidos

### **Fase 2: Bots IA** (2-3 semanas)
- [ ] Integración Gemini API
- [ ] 6 personalidades de bots
- [ ] Sistema de memoria intra-partida
- [ ] Timing realista
- [ ] Configuración de personalidad

### **Fase 3: Features Avanzadas** (2-3 semanas)
- [ ] 25+ roles adicionales
- [ ] Jailor con chat privado
- [ ] Sistema de entrenamiento custom
- [ ] Replays de partidas
- [ ] Stats y progresión

### **Fase 4: Polish** (Ongoing)
- [ ] Animaciones Framer Motion
- [ ] Efectos de sonido
- [ ] Mejoras UX
- [ ] Optimizaciones
- [ ] Testing con amigos

---

## 🎨 Librerías Frontend

### **UI/Styling**
```json
{
  "tailwindcss": "^3.4.0",
  "framer-motion": "^11.0.0",
  "lucide-react": "^0.310.0",
  "@radix-ui/react-*": "latest",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.1.0",
  "tailwind-merge": "^2.2.0"
}
```

### **State/Data**
```json
{
  "zustand": "^4.5.0",
  "socket.io-client": "^4.6.0",
  "react-hook-form": "^7.49.0",
  "zod": "^3.22.0"
}
```

### **Animations/Effects**
```json
{
  "framer-motion": "^11.0.0",
  "react-use": "^17.4.0",
  "use-sound": "^4.0.1"
}
```

---

## 🤝 Contribución

Este es un proyecto privado para amigos, pero si quieres:
1. Fork el repo
2. Crea branch (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add: Amazing Feature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Abre Pull Request

---

## 📄 Licencia

MIT License - Ver [LICENSE](LICENSE)

---

## 🎮 Para Tus Amigos

**Cómo unirse:**
1. Abre `mafiagame.com` en el móvil
2. Usa código de partida: `ABC123`
3. Elige nickname
4. ¡Juega!

**Consejos:**
- Pon el móvil en **horizontal** cuando empiece la partida
- Activa "no molestar" para evitar notificaciones
- Carga el móvil antes (partidas ~25 min)
- Mejor con WiFi que con datos

---

## 🐛 Troubleshooting

### El juego no carga
```bash
# Verificar que backend esté corriendo
curl http://localhost:4000/health

# Verificar conexión WebSocket
# Abrir DevTools → Network → WS
# Debe ver conexión activa
```

### Bots no responden
```bash
# Verificar API key de Gemini
echo $GEMINI_API_KEY

# Ver logs de backend
npm run dev --verbose

# Límites: 15 req/min, 1500 req/día
```

### Orientación no cambia
```javascript
// Forzar landscape en página de juego
// Ya implementado en useOrientation hook
// Si no funciona, revisar permisos del navegador
```

---

## 📞 Contacto

- **Issues**: [GitHub Issues]()
- **Discord**: [Server privado]()
- **Email**: tu@email.com

---

**Última actualización**: Febrero 2026  
**Versión**: 2.0.0  
**Estado**: En desarrollo activo 🚧
