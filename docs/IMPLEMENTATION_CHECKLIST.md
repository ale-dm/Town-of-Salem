# ✅ IMPLEMENTATION CHECKLIST

## 📋 Guía de Implementación Paso a Paso

Esta checklist te guía a través de todo el proceso de desarrollo del Mafia Game.

---

## FASE 0: Setup Inicial (1-2 días)

### Repositorio y Estructura
- [ ] Crear repositorio en GitHub
- [ ] Inicializar proyecto con estructura de carpetas
- [ ] Configurar .gitignore
- [ ] Setup Vercel para frontend
- [ ] Setup Railway/Render para backend
- [ ] Setup Supabase para base de datos

### Base de Datos
- [ ] Copiar schema.prisma desde DATABASE.md
- [ ] Configurar DATABASE_URL
- [ ] Ejecutar `npx prisma migrate dev --name init`
- [ ] Copiar seed.ts completo con 53 roles
- [ ] Ejecutar `npx prisma db seed`
- [ ] Verificar que roles fueron creados correctamente

### Backend
- [ ] Inicializar proyecto Node.js
- [ ] Instalar dependencias (express, socket.io, prisma, gemini)
- [ ] Crear estructura de carpetas (src/socket, src/services, etc)
- [ ] Configurar .env con API keys
- [ ] Setup básico de Express
- [ ] Setup básico de Socket.io
- [ ] Endpoint de health check
- [ ] Probar conexión a BD

### Frontend
- [ ] Inicializar proyecto Next.js 14
- [ ] Instalar dependencias (tailwind, framer-motion, zustand, socket.io-client)
- [ ] Configurar Tailwind con tema medieval
- [ ] Setup Zustand store básico
- [ ] Crear hook useSocket
- [ ] Crear hook useOrientation
- [ ] Página de inicio básica
- [ ] Probar conexión a backend

---

## FASE 1: MVP - Lobby y Creación de Partidas (Semana 1)

### Lobby
- [ ] Diseño de pantalla lobby (portrait)
- [ ] Formulario "Crear Partida"
  - [ ] Generar código único de 6 caracteres
  - [ ] Seleccionar número de jugadores (4-15)
  - [ ] Seleccionar modo de juego
  - [ ] Role list según modo
- [ ] Formulario "Unirse a Partida"
  - [ ] Input código
  - [ ] Input nickname
  - [ ] Validación
- [ ] Lista de jugadores en espera
- [ ] Indicador de ready
- [ ] Botón iniciar (solo host)
- [ ] WebSocket: player_joined, player_left, game_started

### Base de Datos - Lobby
- [ ] Crear Game en BD
- [ ] Añadir GamePlayer cuando se une
- [ ] Actualizar estado de Game
- [ ] Eliminar partida si host abandona

---

## FASE 1: MVP - Asignación de Roles (Semana 1)

### Sistema de Roles
- [ ] Función getRoleList(playerCount, mode)
- [ ] Función resolveSlots(roleList) - Random → roles específicos
- [ ] Validación de role list (balance Town/Mafia)
- [ ] Barajar roles
- [ ] Asignar roles a jugadores
- [ ] Notificación privada de rol (Socket.io room por jugador)
- [ ] Crear chat de Mafia (room privado)

### Roles MVP (12 roles)
- [ ] Sheriff (investigación básica)
- [ ] Doctor (curación)
- [ ] Vigilante (3 balas)
- [ ] Mayor (voto x3, reveal)
- [ ] Investigator (grupos)
- [ ] Bodyguard (protección + chaleco)
- [ ] Godfather (inmune, ordena kill)
- [ ] Mafioso (ejecuta)
- [ ] Consigliere (rol exacto)
- [ ] Serial Killer (kill + mata visitantes)
- [ ] Jester (ejecutado día)
- [ ] Survivor (4 chalecos)

---

## FASE 1: MVP - Ciclo Día/Noche (Semana 2)

### Fase: Día
- [ ] Timer de día (5 minutos)
- [ ] Chat público (todos los vivos)
- [ ] Sistema de nominaciones
  - [ ] Jugador propone nominación
  - [ ] Necesita segundo
  - [ ] Votación (mayoría simple)
  - [ ] Si pasa → Juicio
- [ ] Día 1: No hay ejecución (votación solo práctica)

### Fase: Juicio
- [ ] Acusado puede defenderse (30 segundos)
- [ ] Solo acusado puede hablar
- [ ] Votación Guilty/Innocent/Abstain
- [ ] Mayoría decide
- [ ] Empate = Innocent
- [ ] Si Guilty → Ejecutar
  - [ ] Mostrar rol
  - [ ] Testamento
  - [ ] Jester win condition check

### Fase: Noche
- [ ] Timer de noche (60 segundos)
- [ ] Fade a negro (transición visual)
- [ ] Panel de acción nocturna
  - [ ] Modal con lista de targets
  - [ ] Botón confirmar
  - [ ] Botón cancelar/skip
- [ ] Chat de Mafia activo
- [ ] Recolectar todas las acciones
- [ ] Cuando timer termina → Procesar acciones

### Procesamiento de Acciones Nocturnas
- [ ] Ordenar por prioridad (1-8)
- [ ] Resolver Jailor jail (priority 1)
- [ ] Resolver roleblocks (priority 2)
- [ ] Resolver protecciones (priority 3)
- [ ] Resolver transportes (priority 4)
- [ ] Resolver kills (priority 5-6)
- [ ] Resolver investigaciones (priority 7)
- [ ] Resolver deceptions (priority 8)
- [ ] Aplicar efectos
- [ ] Determinar muertes
- [ ] Compilar resultados

### Transición a Día
- [ ] Anuncio de muertes
- [ ] Mostrar testamentos
- [ ] Mostrar roles (si no Janitor)
- [ ] Actualizar jugadores muertos en BD
- [ ] Enviar notificaciones privadas de resultados

---

## FASE 1: MVP - Condiciones de Victoria (Semana 2)

### Win Conditions
- [ ] Town: Mafia + NK eliminados
- [ ] Mafia: iguala o supera Town + NK eliminados
- [ ] Serial Killer: último vivo
- [ ] Survivor: sobrevivir hasta final
- [ ] Jester: ejecutado de día

### Fin de Partida
- [ ] Verificar win conditions después de cada muerte
- [ ] Anuncio de ganador
- [ ] Pantalla de victoria
  - [ ] Lista de jugadores con roles
  - [ ] Facción ganadora
  - [ ] Stats básicas
- [ ] Actualizar stats de jugadores en BD
- [ ] Actualizar UserStats
- [ ] Actualizar RoleStats

---

## FASE 1: MVP - Chat y Comunicación (Semana 3)

### Chat Público
- [ ] Input de mensaje
- [ ] Validación (max 280 chars)
- [ ] Enviar con Socket.io
- [ ] Mostrar mensajes en tiempo real
- [ ] Scroll automático
- [ ] Indicador "escribiendo..."
- [ ] Timestamps
- [ ] Autor destacado en color gold

### Chat Mafia
- [ ] Canal privado (Socket.io room)
- [ ] Solo visible para Mafia vivos
- [ ] Activo solo de noche
- [ ] Color rojo distintivo

### Susurros (Opcional MVP)
- [ ] Comando /whisper o botón
- [ ] Notificación pública "X susurra a Y"
- [ ] Contenido privado
- [ ] Spy puede interceptar

### Sistema de Mensajes
- [ ] Guardar en ChatMessage tabla
- [ ] Cargar últimos 50 mensajes al unirse
- [ ] Mensajes del sistema (muertes, fases)

---

## FASE 1: MVP - UI/UX Básico (Semana 3)

### Componentes Generales
- [ ] Button component (medieval style)
- [ ] Card component (wood texture)
- [ ] Modal component (overlay)
- [ ] Timer component (countdown)
- [ ] Avatar component (jugador)
- [ ] Toast notifications

### Pantalla de Juego (Landscape)
- [ ] Header (fase, día, timer)
- [ ] Town Square con hoguera
- [ ] Grid de jugadores (3x4)
  - [ ] Estados: vivo, muerto, nominado
  - [ ] Hover para info
  - [ ] Click para target
- [ ] Panel de rol (lateral derecho)
  - [ ] Icono rol
  - [ ] Descripción
  - [ ] Botón de acción
- [ ] Chat (lateral derecho abajo)
  - [ ] Mensajes
  - [ ] Input
- [ ] Stats bar (vivos, muertos, día)

### Prompt de Orientación
- [ ] Detectar orientación con useOrientation
- [ ] Si portrait → Mostrar mensaje "Gira tu dispositivo"
- [ ] Animación de rotación

### Animaciones Básicas
- [ ] Fade día/noche
- [ ] Slide in mensajes
- [ ] Pulse en nominado
- [ ] Hoguera flickering (CSS)

---

## FASE 1: MVP - Sistema de Bots (Semana 4)

### Bots Predefinidos (3 bots)
- [ ] Bot Paranoico (traits: paranoia=10, aggression=7)
- [ ] Bot Agresivo (traits: aggression=10, leadership=8)
- [ ] Bot Sherlock (traits: deduction=10, verbosity=7)

### Integración Gemini
- [ ] Setup @google/generative-ai
- [ ] Configurar API key
- [ ] Servicio GeminiService
- [ ] Función buildPrompt(context, personality)
- [ ] Función generateBotDecision()
- [ ] Rate limiting (15 req/min)
- [ ] Fallback si API falla

### Bot Manager
- [ ] Clase BotManager
- [ ] Función shouldAct(context) - triggers
- [ ] Función processBotTurn(bot, game)
- [ ] Función executeDecision(decision)
- [ ] Timing realista (delays)
- [ ] Typing indicator

### Bot Memory
- [ ] Memoria intra-partida
- [ ] Suspicions map
- [ ] Allies list
- [ ] Mood (confidence, stress)
- [ ] Reset al empezar partida

---

## FASE 2: Roles Avanzados (Semanas 5-6)

### Roles Fase 2 (12 roles adicionales)
- [ ] Jailor (chat privado 1v1, ejecuciones)
  - [ ] Socket.io room privado
  - [ ] Bloquea habilidad prisionero
  - [ ] Ejecutar (3 usos)
  - [ ] Penalización si mata Town
- [ ] Lookout (ve visitantes)
  - [ ] VisitTracker
  - [ ] Lista de visitantes
- [ ] Escort (roleblock)
  - [ ] Bloquea habilidad
  - [ ] Muerte si bloquea SK
- [ ] Medium (habla con muertos)
  - [ ] Canal privado con 1 muerto
- [ ] Psychic (visiones automáticas)
- [ ] Veteran (3 alertas, mata todos)
- [ ] Retributionist (revive Town)
- [ ] Blackmailer (silencia de día)
  - [ ] Quitar permisos escribir
- [ ] Framer (hace parecer Mafia)
- [ ] Janitor (limpia rol, 3 usos)
- [ ] Consort (roleblock Mafia)
- [ ] Executioner (target specific)
  - [ ] Asignar target Town
  - [ ] Conversión a Jester si target muere
- [ ] Arsonist (douse + ignite)

### Sistema de Prioridades Completo
- [ ] Implementar orden 1-8
- [ ] Jailor bloquea TODO
- [ ] Roleblock antes de kills
- [ ] Protección antes de kills
- [ ] Transport redirige TODO

### Interacciones Complejas
- [ ] Doctor + BG mismo target
- [ ] Transporter mecánica completa
- [ ] Jailor immunity
- [ ] Witch control
- [ ] SK mata visitantes

---

## FASE 2: Features Adicionales (Semana 7)

### Testamentos
- [ ] Input de testamento (500 chars)
- [ ] Guardar en BD
- [ ] Mostrar al morir
- [ ] Forger puede falsificar

### Death Notes
- [ ] Killers pueden dejar nota
- [ ] Mostrar con muerte

### Notas Privadas
- [ ] Bloc de notas personal
- [ ] Auto-guardado
- [ ] Solo visible para jugador

### Stats Post-Partida
- [ ] Actualizar UserStats
- [ ] Actualizar RoleStats
- [ ] Racha actual
- [ ] Win rate

### Historial
- [ ] Guardar partidas finalizadas
- [ ] Pantalla de historial
- [ ] Últimas 20 partidas
- [ ] Filtros (ganadas, rol, facción)

---

## FASE 3: Coven + Roles Finales (Semanas 8-9)

### Coven Roles (7 roles)
- [ ] Coven Leader (control + revive zombie)
- [ ] Hex Master (hex everyone)
- [ ] Medusa (petrify visitors)
- [ ] Necromancer (usa cadáveres)
- [ ] Poisoner (delayed kill)
- [ ] Potion Master (3 pociones)

### Sistema Necronomicon
- [ ] Detectar cuando queda 1 Coven
- [ ] Activar Necronomicon
- [ ] Potenciar habilidades
- [ ] No chat nocturno (libro para coordinarse)

### Neutral Killing Finales
- [ ] Werewolf (full moon)
- [ ] Juggernaut (escala poder)
- [ ] Plaguebearer → Pestilence
  - [ ] Infectar
  - [ ] Transformación
  - [ ] Invincible

### Neutral Benign/Chaos
- [ ] Amnesiac (recuerda rol)
- [ ] Guardian Angel (protege target)
- [ ] Pirate (duelos)
- [ ] Vampire + Vampire Hunter

### Investigator Groups
- [ ] Actualizar para 53 roles
- [ ] 11 grupos completos

---

## FASE 3: Bots Avanzados (Semana 10)

### Personalidades Adicionales (3 más)
- [ ] Bot Novato
- [ ] Bot Silencioso
- [ ] Bot Caótico

### Entrenamiento Custom
- [ ] Recolectar datos de partidas (opt-in)
- [ ] Tabla TrainingData
- [ ] Después de 10 partidas → Crear bot
- [ ] Prompt para generar perfil
- [ ] Guardar CustomBot en BD

### Mejoras de Bot
- [ ] Análisis de patrones sociales
- [ ] Emociones dinámicas (mood)
- [ ] Typos realistas
- [ ] Errores intencionales
- [ ] Meta-memoria (simple)

---

## FASE 4: Polish y Optimización (Semanas 11-12)

### Animaciones Framer Motion
- [ ] Transiciones de página
- [ ] Día/noche (fadeToNight, fadeToDay)
- [ ] Aparición de jugadores
- [ ] Muerte de jugador
- [ ] Mensajes (slideInMessage)
- [ ] Hoguera avanzada (flicker multi-stage)

### Efectos de Sonido (Opcional)
- [ ] Ambient (crickets, fire crackling)
- [ ] Death bell
- [ ] Vote thud
- [ ] Rooster (día)
- [ ] Owl (noche)
- [ ] Message whoosh

### Performance
- [ ] Lazy loading
- [ ] Memoization (React.memo)
- [ ] Virtual scrolling en chat
- [ ] Optimizar re-renders
- [ ] Compresión de assets

### Testing
- [ ] Unit tests (roles, acciones)
- [ ] Integration tests (flujo partida)
- [ ] E2E tests (Playwright)
- [ ] Load testing (Socket.io)

### Bug Fixes
- [ ] Desconexiones/reconexiones
- [ ] Race conditions
- [ ] Memory leaks
- [ ] Edge cases en roles

---

## EXTRAS (Opcional)

### Modo Vampires
- [ ] Vampire y Vampire Hunter
- [ ] Conversión cada 2 noches
- [ ] Chat de Vampires

### Modo Lovers
- [ ] Asignar parejas al inicio
- [ ] Si uno muere → otro también
- [ ] Pueden ser facciones diferentes

### Replays
- [ ] Grabar todas las acciones
- [ ] Player por pantalla de replay
- [ ] Timeline navegable
- [ ] Ver desde diferentes perspectivas

### PWA
- [ ] Service Worker
- [ ] Manifest.json
- [ ] Offline support
- [ ] Install prompt
- [ ] Notificaciones push

---

## 📊 Progreso Estimado

| Fase | Duración | Funcionalidad | Roles |
|------|----------|---------------|-------|
| 0 | 1-2 días | Setup | 0 |
| 1 | 4 semanas | MVP completo | 12 |
| 2 | 3 semanas | Roles avanzados | 24 |
| 3 | 3 semanas | Coven + todos los roles | 51 |
| 4 | 2 semanas | Polish | 51 |
| **Total** | **12-14 semanas** | **Juego completo** | **53 roles** |

---

## ✅ Criterios de Completitud

### MVP (Fase 1)
- [ ] 4 jugadores pueden jugar una partida completa
- [ ] 12 roles funcionando correctamente
- [ ] Ciclo día/noche funcional
- [ ] Votaciones y ejecuciones
- [ ] Chat en tiempo real
- [ ] 3 bots con IA
- [ ] Win conditions correctas

### Completo (Fase 4)
- [ ] 53 roles implementados
- [ ] 9 modos de juego
- [ ] Todas las interacciones funcionan
- [ ] Bots inteligentes
- [ ] UI pulida con animaciones
- [ ] Mobile-friendly (landscape)
- [ ] Sin bugs críticos
- [ ] Performance óptimo

---

**Última actualización**: 14 Febrero 2026
