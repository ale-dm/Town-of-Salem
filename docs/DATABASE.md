# 💾 DATABASE - Esquema de Base de Datos Completo

## 📋 Índice
- [Análisis de Datos](#análisis-de-datos)
- [Elección de Base de Datos](#elección-de-base-de-datos)
- [Esquema Prisma Completo](#esquema-prisma-completo)
- [Índices y Optimizaciones](#índices-y-optimizaciones)
- [Queries Comunes](#queries-comunes)
- [Migraciones](#migraciones)

---

## Análisis de Datos

### **Datos a Almacenar**

Basado en la documentación completa, necesitamos almacenar:

#### **1. Usuarios**
- ID, nombre, email (opcional)
- Nivel, XP, progresión
- Fecha de creación
- Configuración personal

#### **2. Partidas**
- ID, código único
- Estado (WAITING, PLAYING, FINISHED)
- Fase actual (DAY, NIGHT, VOTING, TRIAL)
- Día actual
- Configuración (timers, roles)
- Timestamps (creado, iniciado, finalizado)
- Ganador (facción)

#### **3. Jugadores en Partida**
- Relación User ↔ Game
- Nombre anónimo (cada partida)
- Rol asignado
- Facción
- Vivo/muerto
- Si es bot o humano
- Stats de la partida

#### **4. Mensajes de Chat**
- Partida, autor, contenido
- Timestamp
- Tipo (público, mafia, privado)
- Canal (si aplica)

#### **5. Acciones Nocturnas**
- Partida, noche, jugador
- Tipo de acción
- Target (si aplica)
- Resultado
- Prioridad

#### **6. Votaciones**
- Partida, día, fase
- Votante, nominado
- Tipo (juicio, ejecución)
- Timestamp

#### **7. Stats de Usuario**
- Total partidas, victorias
- Win rate por facción
- Stats por rol
- Rachas (actual, mejor)
- Precisión de votos
- Tiempo jugado

#### **8. Bots Personalizados**
- Usuario dueño
- Perfil de personalidad (JSON)
- Datos de entrenamiento
- Fecha creación, última actualización
- Partidas jugadas

#### **9. Historial de Entrenamiento**
- Usuario, partida
- Mensajes recopilados
- Acciones recopiladas
- Patrones detectados

---

## Elección de Base de Datos

### **PostgreSQL 15+ (RECOMENDADO) ✅**

**Por qué PostgreSQL:**

✅ **Relacional**: Estructura clara de datos relacionados  
✅ **JSONB**: Perfecto para datos dinámicos (config partida, perfil bot)  
✅ **Performance**: Excelente con índices bien diseñados  
✅ **Prisma support**: First-class support  
✅ **Gratis en Supabase/Railway**: Hosting gratuito  
✅ **Transacciones ACID**: Crítico para acciones simultáneas  
✅ **Full-text search**: Para buscar en chat/historial  

**Alternativas descartadas:**

❌ **MongoDB**: Innecesario, datos son relacionales  
❌ **MySQL**: PostgreSQL es superior (JSONB, arrays, etc)  
❌ **SQLite**: No apto para múltiples conexiones concurrentes  
❌ **Redis solo**: No es DB primaria, solo cache  

**Redis como Cache (Opcional):**
- Cache de game states activos
- Sessions
- Bot decisions recientes

---

## Esquema Prisma Completo

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// ROLES Y ALINEACIONES (Town of Salem)
// ============================================

model Faction {
  id          String   @id @default(cuid())
  name        String   @unique // "Town", "Mafia", "Neutral"
  color       String   // "#4169e1", "#8b0000", "#808080"
  description String   @db.Text
  
  // Relaciones
  alignments  Alignment[]
  
  @@index([name])
}

model Alignment {
  id          String   @id @default(cuid())
  
  // Relación con facción
  factionId   String
  faction     Faction  @relation(fields: [factionId], references: [id])
  
  // Info
  name        String   // "Town Investigative", "Mafia Deception", etc.
  shortName   String   // "TI", "MD", etc.
  description String   @db.Text
  
  // Relaciones
  roles       Role[]
  
  @@unique([factionId, name])
  @@index([factionId])
}

// ============================================
// NOTA IMPORTANTE: Schema Completo de Role
// ============================================
// Este es un schema SIMPLIFICADO para referencia rápida.
// Para el schema COMPLETO y definitivo con 40+ campos, ver:
// → docs/DATABASE_SCHEMA_ROLE_COMPLETO.md
//
// El schema completo incluye:
// - nameEs/nameEn/slug (multiidioma)
// - abilityConfig con 50+ propiedades
// - immunities completas
// - specialInteractions detalladas
// - winConditions custom
// - messages por rol
// - strategyTips
// - achievements
//
// Usar DATABASE_SCHEMA_ROLE_COMPLETO.md como referencia definitiva.
// ============================================

model Role {
  id              String    @id @default(cuid())
  
  // Relación con alignment y faction
  alignmentId     String
  alignment       Alignment @relation(fields: [alignmentId], references: [id])
  factionId       String
  faction         Faction   @relation(fields: [factionId], references: [id])
  
  // Info básica (usar nameEs/nameEn en schema completo)
  name            String    @unique // "Sheriff", "Doctor", "Godfather"
  displayName     String    // Nombre para mostrar
  description     String    @db.Text
  
  // Habilidad
  abilityName     String
  abilityDesc     String    @db.Text
  nightActionType NightActionType?  // Tipo de acción nocturna
  
  // Atributos
  attributes      Json      @default("[]")
  // ["Detection Immune", "Role Block Immune", "Night Immune", etc.]
  
  // Mecánicas de combate
  attackValue     Int       @default(0)  // 0=None, 1=Basic, 2=Powerful, 3=Unstoppable
  defenseValue    Int       @default(0)  // 0=None, 1=Basic, 2=Powerful, 3=Invincible
  
  // Prioridad de acción (1-8, menor = primero)
  actionPriority  Int       @default(5)
  
  // Investigación
  sheriffResult       String?  // "Suspicious" / "Not Suspicious"
  investigatorGroup   String?  // "Doctor, Disguiser, Serial Killer"
  
  // Config específica (ver schema completo para estructura detallada)
  config          Json      @default("{}")
  // {
  //   usesPerGame: 3,        // Ej: Vigilante 3 balas
  //   mustTarget: true,      // Debe elegir target cada noche
  //   canTargetSelf: false,  // Restricción
  //   cooldown: 0,           // Turnos de cooldown
  //   hasPassiveAbility: boolean,
  //   hasModes: boolean,
  //   killsSelfIfKillsTown: boolean,
  //   appliesEffect: string,
  //   etc... (ver DATABASE_SCHEMA_ROLE_COMPLETO.md)
  // }
  
  // Interacciones especiales
  specialInteractions Json  @default("[]")
  // Ver DATABASE_SCHEMA_ROLE_COMPLETO.md para estructura completa
  
  // Metadata
  difficulty      RoleDifficulty @default(MEDIUM)
  isUnique        Boolean   @default(false) // Solo 1 por partida
  enabled         Boolean   @default(true)
  
  @@index([alignmentId])
  @@index([factionId])
  @@index([name])
  @@index([nightActionType])
}

enum RoleDifficulty {
  EASY      // Sheriff, Doctor, Mafioso, Survivor
  MEDIUM    // Investigator, Escort, Bodyguard, Consigliere
  HARD      // Serial Killer, Vigilante, Disguiser, Arsonist
  EXPERT    // Jailor, Transporter, Witch, Retributionist
}

enum NightActionType {
  // KILLING
  KILL_SINGLE              // Mafia, Vigilante, Serial Killer
  KILL_VISITORS            // Veteran, Serial Killer (pasivo)
  KILL_RAMPAGE             // Werewolf, Juggernaut
  EXECUTE                  // Jailor execution
  
  // INVESTIGATION
  SHERIFF_CHECK            // Sheriff: Suspicious/Not Suspicious
  INVESTIGATOR_CHECK       // Investigator: Grupo de 3 roles
  LOOKOUT_WATCH            // Lookout: Ver visitantes
  TRACKER_TRACK            // Tracker: Ver a quién visitó
  SPY_BUG                  // Spy: Ver Mafia actions + chat
  CONSIGLIERE_CHECK        // Consigliere: Rol exacto
  PSYCHIC_VISION           // Psychic: Visiones automáticas
  
  // PROTECTION
  HEAL                     // Doctor: Curar 1 ataque
  PROTECT                  // Bodyguard: Proteger + matar atacante
  PROTECT_VISITORS         // Crusader: Proteger + matar visitante aleatorio
  ALERT                    // Veteran: Matar TODOS los visitantes
  VEST                     // Survivor: Auto-protección
  TRAP                     // Trapper: Trampa que mata atacantes
  
  // SUPPORT
  ROLEBLOCK                // Escort, Consort: Bloquear habilidad
  TRANSPORT                // Transporter: Intercambiar 2 jugadores
  JAIL                     // Jailor: Encarcelar (bloquea todo)
  REVIVE                   // Retributionist: Revivir Town muerto
  SEANCE                   // Medium: Hablar con muertos
  REVEAL                   // Mayor: Revelarse (voto ×3)
  
  // DECEPTION
  FRAME                    // Framer: Hacer target parezca Mafia
  DISGUISE                 // Disguiser: Cambiar rol aparente
  CLEAN                    // Janitor: Ocultar rol de muerto
  FORGE                    // Forger: Falsificar testamento
  BLACKMAIL                // Blackmailer: Silenciar de día
  HYPNOTIZE                // Hypnotist: Enviar mensaje falso
  
  // SPECIAL
  DOUSE                    // Arsonist: Rociar gasolina
  IGNITE                   // Arsonist: Quemar a todos
  CLEAN_SELF               // Arsonist: Limpiarse gasolina
  INFECT                   // Plaguebearer: Infectar + propagar
  TRANSFORM                // Plaguebearer → Pestilence
  CONTROL                  // Witch: Controlar habilidad
  HEX                      // Hex Master: Hexear
  POISON                   // Poisoner: Envenenar (muerte delayed)
  BITE                     // Vampire: Morder para convertir
  DUEL                     // Pirate: Desafiar a duelo
  PROTECT_TARGET           // Guardian Angel: Proteger target
  REMEMBER                 // Amnesiac: Recordar rol
  STONE_GAZE               // Medusa: Petrificar visitantes
  REANIMATE                // Necromancer: Usar cadáver
  POTION                   // Potion Master: Poción (heal/attack/reveal)
  
  // PASSIVE
  NONE                     // Sin acción activa
  AUTOMATIC                // Acción automática
}

// ============================================
// USUARIOS Y AUTENTICACIÓN
// ============================================

model User {
  id        String   @id @default(cuid())
  name      String
  email     String?  @unique
  
  // Progresión
  level     Int      @default(1)
  xp        Int      @default(0)
  
  // Metadata
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  lastSeen  DateTime @default(now())
  
  // Relaciones
  gamePlayers        GamePlayer[]
  stats              UserStats?
  customBots         CustomBot[]
  trainingData       TrainingData[]
  
  @@index([email])
}

// ============================================
// PARTIDAS
// ============================================

model Game {
  id          String      @id @default(cuid())
  code        String      @unique // Código de 6 caracteres para unirse
  
  // Estado
  status      GameStatus  @default(WAITING)
  phase       GamePhase   @default(DAY)
  day         Int         @default(1)
  
  // Configuración
  config      Json        @default("{}")
  // {
  //   minPlayers: 7,
  //   maxPlayers: 15,
  //   dayDuration: 300,
  //   nightDuration: 60,
  //   votingDuration: 90,
  //   roleList: ["Sheriff", "Doctor", ...]
  // }
  
  // Resultado
  winner      Faction?    // TOWN, MAFIA, NEUTRAL
  
  // Timestamps
  createdAt   DateTime    @default(now())
  startedAt   DateTime?
  endedAt     DateTime?
  
  // Relaciones
  players     GamePlayer[]
  messages    ChatMessage[]
  actions     GameAction[]
  votes       Vote[]
  events      GameEvent[]
  
  @@index([code])
  @@index([status])
  @@index([createdAt])
}

enum GameStatus {
  WAITING      // Esperando jugadores
  STARTING     // Cuenta regresiva
  PLAYING      // En curso
  FINISHED     // Terminada
}

enum GamePhase {
  DAY          // Discusión
  NIGHT        // Acciones nocturnas
  VOTING       // Votación para juicio
  TRIAL        // Juicio (defensa + veredicto)
}

enum Faction {
  TOWN
  MAFIA
  NEUTRAL
}

// ============================================
// JUGADORES EN PARTIDA
// ============================================

model GamePlayer {
  id          String   @id @default(cuid())
  
  // Relaciones
  gameId      String
  game        Game     @relation(fields: [gameId], references: [id], onDelete: Cascade)
  
  userId      String?
  user        User?    @relation(fields: [userId], references: [id])
  
  // Identidad en partida (anónima)
  name        String   // Nombre elegido para esta partida
  
  // Rol
  role        String   // "Sheriff", "Doctor", etc.
  faction     Faction
  
  // Estado
  alive       Boolean  @default(true)
  diedOnDay   Int?
  causeOfDeath String?
  
  // Bot
  isBot       Boolean  @default(false)
  botPersonalityId String?
  
  // Stats de partida
  messagesCount     Int @default(0)
  votesCount        Int @default(0)
  correctVotes      Int @default(0)
  nightActionsCount Int @default(0)
  
  // Metadata
  joinedAt    DateTime @default(now())
  
  // Relaciones
  messagesSent    ChatMessage[] @relation("MessageAuthor")
  actionsPerformed GameAction[]  @relation("ActionSource")
  actionsReceived  GameAction[]  @relation("ActionTarget")
  votesBy         Vote[]        @relation("Voter")
  votesAgainst    Vote[]        @relation("Nominee")
  
  @@unique([gameId, userId]) // Un usuario solo puede estar 1 vez por partida
  @@index([gameId])
  @@index([userId])
  @@index([isBot])
}

// ============================================
// CHAT
// ============================================

model ChatMessage {
  id          String      @id @default(cuid())
  
  // Relaciones
  gameId      String
  game        Game        @relation(fields: [gameId], references: [id], onDelete: Cascade)
  
  authorId    String
  author      GamePlayer  @relation("MessageAuthor", fields: [authorId], references: [id])
  
  // Contenido
  content     String      @db.Text
  
  // Contexto
  day         Int
  phase       GamePhase
  channel     ChatChannel @default(PUBLIC)
  
  // Metadata
  timestamp   DateTime    @default(now())
  
  @@index([gameId, timestamp])
  @@index([authorId])
}

enum ChatChannel {
  PUBLIC       // Chat visible para todos los vivos
  MAFIA        // Solo Mafia
  DEAD         // Solo muertos (espectadores)
  JAIL         // Jailor + prisionero
  WHISPER      // Susurro privado
}

// ============================================
// ACCIONES NOCTURNAS
// ============================================

model GameAction {
  id          String   @id @default(cuid())
  
  // Relaciones
  gameId      String
  game        Game     @relation(fields: [gameId], references: [id], onDelete: Cascade)
  
  sourceId    String
  source      GamePlayer @relation("ActionSource", fields: [sourceId], references: [id])
  
  targetId    String?
  target      GamePlayer? @relation("ActionTarget", fields: [targetId], references: [id])
  
  // Acción
  night       Int
  actionType  ActionType
  
  // Resultado
  success     Boolean  @default(false)
  blocked     Boolean  @default(false)
  redirected  Boolean  @default(false)
  result      Json?    // Datos específicos del resultado
  
  // Metadata
  priority    Int      // Para resolver orden de acciones
  timestamp   DateTime @default(now())
  
  @@index([gameId, night])
  @@index([sourceId])
}

enum ActionType {
  // Investigación
  SHERIFF_INVESTIGATE
  INVESTIGATOR_INVESTIGATE
  LOOKOUT_WATCH
  SPY_BUG
  
  // Protección
  DOCTOR_HEAL
  BODYGUARD_PROTECT
  CRUSADER_PROTECT
  
  // Killing
  MAFIA_KILL
  VIGILANTE_SHOOT
  VETERAN_ALERT
  SK_KILL
  ARSONIST_DOUSE
  ARSONIST_IGNITE
  
  // Support
  ESCORT_BLOCK
  JAILOR_JAIL
  JAILOR_EXECUTE
  TRANSPORTER_SWAP
  
  // Deception
  FRAMER_FRAME
  DISGUISER_DISGUISE
  FORGER_FORGE
  JANITOR_CLEAN
  
  // Neutral
  JESTER_HAUNT
  WITCH_CONTROL
}

// ============================================
// VOTACIONES
// ============================================

model Vote {
  id          String   @id @default(cuid())
  
  // Relaciones
  gameId      String
  game        Game     @relation(fields: [gameId], references: [id], onDelete: Cascade)
  
  voterId     String
  voter       GamePlayer @relation("Voter", fields: [voterId], references: [id])
  
  nomineeId   String
  nominee     GamePlayer @relation("Nominee", fields: [nomineeId], references: [id])
  
  // Contexto
  day         Int
  voteType    VoteType
  
  // Voto
  vote        VoteChoice
  
  // Metadata
  timestamp   DateTime @default(now())
  
  @@index([gameId, day])
  @@index([voterId])
}

enum VoteType {
  NOMINATION   // Votar para poner en juicio
  GUILTY       // Votar culpable/inocente en juicio
}

enum VoteChoice {
  YES
  NO
  GUILTY
  INNOCENT
  ABSTAIN
}

// ============================================
// EVENTOS DE PARTIDA
// ============================================

model GameEvent {
  id          String   @id @default(cuid())
  
  // Relaciones
  gameId      String
  game        Game     @relation(fields: [gameId], references: [id], onDelete: Cascade)
  
  // Evento
  day         Int
  phase       GamePhase
  eventType   EventType
  
  // Datos del evento (JSON flexible)
  data        Json
  // Ejemplos:
  // - PLAYER_DIED: { playerId, role, cause }
  // - PLAYER_EXECUTED: { playerId, role, votes }
  // - PHASE_CHANGE: { from, to }
  // - ROLE_REVEALED: { playerId, role }
  
  // Metadata
  timestamp   DateTime @default(now())
  
  @@index([gameId, day])
}

enum EventType {
  GAME_STARTED
  PHASE_CHANGE
  PLAYER_DIED
  PLAYER_EXECUTED
  PLAYER_REVIVED
  ROLE_REVEALED
  MAYOR_REVEALED
  JESTER_WIN
  GAME_ENDED
}

// ============================================
// ESTADÍSTICAS DE USUARIO
// ============================================

model UserStats {
  id              String @id @default(cuid())
  
  // Relación
  userId          String @unique
  user            User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Stats generales
  totalGames      Int    @default(0)
  wins            Int    @default(0)
  losses          Int    @default(0)
  
  // Por facción
  townGames       Int    @default(0)
  townWins        Int    @default(0)
  mafiaGames      Int    @default(0)
  mafiaWins       Int    @default(0)
  neutralGames    Int    @default(0)
  neutralWins     Int    @default(0)
  
  // Rachas
  currentStreak   Int    @default(0)
  bestStreak      Int    @default(0)
  
  // Combate
  totalKills      Int    @default(0)
  totalDeaths     Int    @default(0)
  survivalRate    Float  @default(0)
  
  // Social
  totalMessages   Int    @default(0)
  totalVotes      Int    @default(0)
  correctVotes    Int    @default(0)
  
  // Tiempo
  minutesPlayed   Int    @default(0)
  
  // Metadata
  lastUpdated     DateTime @updatedAt
}

// ============================================
// ESTADÍSTICAS POR ROL
// ============================================

model RoleStats {
  id              String @id @default(cuid())
  
  // Relación
  userId          String
  role            String
  
  // Stats
  timesPlayed     Int    @default(0)
  wins            Int    @default(0)
  losses          Int    @default(0)
  
  // Específicas del rol
  specificStats   Json   @default("{}")
  // Ejemplos:
  // Doctor: { healsSuccessful, healsFailed }
  // Sheriff: { mafiaFound, investigations }
  // Vigilante: { correctKills, townKills }
  
  // Metadata
  lastPlayed      DateTime @updatedAt
  
  @@unique([userId, role])
  @@index([userId])
}

// ============================================
// BOTS PERSONALIZADOS
// ============================================

model CustomBot {
  id              String   @id @default(cuid())
  
  // Relación
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  
  // Info
  name            String
  avatar          String   @default("🤖")
  
  // Personalidad (generada por IA)
  personality     Json
  // {
  //   traits: { aggression: 7, paranoia: 5, ... },
  //   style: { phraseTemplates: [...], emojis: [...] },
  //   behavior: "descripción del estilo"
  // }
  
  // Datos de entrenamiento
  trainingData    Json
  // {
  //   totalGames: 20,
  //   messagesSample: [...],
  //   actionsHistory: [...],
  //   patterns: { ... }
  // }
  
  // Stats
  timesUsed       Int      @default(0)
  wins            Int      @default(0)
  
  // Metadata
  createdAt       DateTime @default(now())
  lastRetrained   DateTime @default(now())
  
  @@index([userId])
}

// ============================================
// DATOS DE ENTRENAMIENTO
// ============================================

model TrainingData {
  id              String   @id @default(cuid())
  
  // Relación
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  
  gameId          String
  
  // Datos recopilados
  messages        Json     // Array de mensajes
  actions         Json     // Array de acciones
  votes           Json     // Array de votos
  
  // Análisis
  patterns        Json?    // Patrones detectados por IA
  
  // Metadata
  collectedAt     DateTime @default(now())
  
  @@index([userId])
  @@index([gameId])
}

// ============================================
// ÍNDICES ADICIONALES
// ============================================

// Los índices están definidos en cada modelo con @@index
```

---

## Índices y Optimizaciones

### **Índices Críticos (Ya incluidos)**

```prisma
// Games
@@index([code])          // Buscar partida por código
@@index([status])        // Filtrar activas/finalizadas
@@index([createdAt])     // Historial cronológico

// GamePlayers
@@index([gameId])        // Jugadores de una partida
@@index([userId])        // Partidas de un usuario
@@index([isBot])         // Filtrar bots

// ChatMessages
@@index([gameId, timestamp])  // Chat de partida ordenado
@@index([authorId])           // Mensajes de un jugador

// GameActions
@@index([gameId, night])  // Acciones de una noche
@@index([sourceId])       // Acciones de un jugador

// Votes
@@index([gameId, day])    // Votos de un día
@@index([voterId])        // Votos de un jugador

// GameEvents
@@index([gameId, day])    // Eventos de un día
```

### **Optimizaciones PostgreSQL**

```sql
-- Full-text search en mensajes
CREATE INDEX chat_content_fts ON "ChatMessage" 
USING gin(to_tsvector('spanish', content));

-- Partial index para partidas activas
CREATE INDEX games_active_idx ON "Game" (status) 
WHERE status IN ('WAITING', 'PLAYING');

-- Index compuesto para queries comunes
CREATE INDEX game_player_lookup ON "GamePlayer" (gameId, userId, alive);
```

---

## Queries Comunes

### **1. Crear Partida**

```typescript
const game = await prisma.game.create({
  data: {
    code: generateCode(), // "ABC123"
    config: {
      minPlayers: 7,
      maxPlayers: 15,
      dayDuration: 300,
      nightDuration: 60,
      roleList: ["Sheriff", "Doctor", "Godfather", ...]
    }
  }
});
```

### **2. Unirse a Partida**

```typescript
const gamePlayer = await prisma.gamePlayer.create({
  data: {
    gameId: gameId,
    userId: userId,
    name: "Jugador Anónimo",
    role: "PENDING", // Se asigna al empezar
    faction: "TOWN", // Se asigna al empezar
  }
});
```

### **3. Obtener Estado de Partida**

```typescript
const gameState = await prisma.game.findUnique({
  where: { code: "ABC123" },
  include: {
    players: {
      where: { alive: true },
      select: {
        id: true,
        name: true,
        role: true,
        alive: true,
        isBot: true,
      }
    },
    messages: {
      where: { 
        channel: 'PUBLIC',
        day: currentDay 
      },
      orderBy: { timestamp: 'asc' },
      take: 50,
    }
  }
});
```

### **4. Registrar Acción Nocturna**

```typescript
await prisma.gameAction.create({
  data: {
    gameId: gameId,
    sourceId: playerId,
    targetId: targetId,
    night: currentNight,
    actionType: 'DOCTOR_HEAL',
    priority: 3,
  }
});
```

### **5. Actualizar Stats Post-Partida**

```typescript
await prisma.$transaction([
  // Actualizar UserStats
  prisma.userStats.update({
    where: { userId },
    data: {
      totalGames: { increment: 1 },
      wins: winner ? { increment: 1 } : undefined,
      townWins: winner && faction === 'TOWN' ? { increment: 1 } : undefined,
      currentStreak: winner ? { increment: 1 } : 0,
    }
  }),
  
  // Actualizar RoleStats
  prisma.roleStats.upsert({
    where: { 
      userId_role: { userId, role: 'SHERIFF' } 
    },
    update: {
      timesPlayed: { increment: 1 },
      wins: winner ? { increment: 1 } : undefined,
    },
    create: {
      userId,
      role: 'SHERIFF',
      timesPlayed: 1,
      wins: winner ? 1 : 0,
    }
  })
]);
```

### **6. Obtener Historial de Jugador**

```typescript
const history = await prisma.gamePlayer.findMany({
  where: { userId },
  include: {
    game: {
      select: {
        code: true,
        status: true,
        winner: true,
        createdAt: true,
      }
    }
  },
  orderBy: {
    game: {
      createdAt: 'desc'
    }
  },
  take: 20,
});
```

### **7. Generar Bot Custom**

```typescript
// Recopilar datos de entrenamiento
const trainingData = await prisma.trainingData.findMany({
  where: { userId },
  select: {
    messages: true,
    actions: true,
    votes: true,
  }
});

// Crear bot (después de análisis IA)
await prisma.customBot.create({
  data: {
    userId,
    name: `Bot ${userName}`,
    personality: aiGeneratedPersonality,
    trainingData: aggregatedData,
  }
});
```

### **8. Obtener Roles por Facción/Alignment**

```typescript
// Obtener todos los roles de Town Investigative
const townInvestigativeRoles = await prisma.role.findMany({
  where: {
    alignment: {
      name: 'Town Investigative'
    }
  },
  include: {
    alignment: {
      include: {
        faction: true
      }
    }
  }
});

// Obtener todos los roles de Mafia
const mafiaRoles = await prisma.role.findMany({
  where: {
    alignment: {
      faction: {
        name: 'Mafia'
      }
    }
  }
});

// Obtener roles por dificultad
const easyRoles = await prisma.role.findMany({
  where: {
    difficulty: 'EASY',
    enabled: true
  },
  include: {
    alignment: {
      include: {
        faction: true
      }
    }
  }
});
```

### **9. Generar Role List para Partida**

```typescript
// Crear role list balanceada (ejemplo: 15 jugadores)
async function generateRoleList(playerCount: number) {
  // Proporción típica de Town of Salem:
  // Town: 40-60%
  // Mafia: 25-35%
  // Neutral: 10-20%
  
  const townCount = Math.floor(playerCount * 0.5); // 7-8
  const mafiaCount = Math.floor(playerCount * 0.27); // 4
  const neutralCount = playerCount - townCount - mafiaCount; // 3-4
  
  // Obtener roles aleatorios de cada facción
  const townRoles = await prisma.role.findMany({
    where: {
      alignment: {
        faction: { name: 'Town' }
      },
      enabled: true
    },
    take: townCount,
    // Shuffle con raw query o en memoria
  });
  
  const mafiaRoles = await prisma.role.findMany({
    where: {
      alignment: {
        faction: { name: 'Mafia' }
      },
      enabled: true
    },
    take: mafiaCount,
  });
  
  const neutralRoles = await prisma.role.findMany({
    where: {
      alignment: {
        faction: { name: 'Neutral' }
      },
      enabled: true
    },
    take: neutralCount,
  });
  
  // Asegurar que hay un Godfather
  const hasGodfather = mafiaRoles.some(r => r.name === 'Godfather');
  if (!hasGodfather) {
    const godfather = await prisma.role.findUnique({
      where: { name: 'Godfather' }
    });
    mafiaRoles[0] = godfather!;
  }
  
  return [...townRoles, ...mafiaRoles, ...neutralRoles];
}
```

### **10. Asignar Roles a Jugadores**

```typescript
async function assignRoles(gameId: string) {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: { players: true }
  });
  
  if (!game) throw new Error('Game not found');
  
  // Obtener role list de config
  const roleNames = game.config.roleList as string[];
  
  // Obtener roles completos
  const roles = await prisma.role.findMany({
    where: {
      name: { in: roleNames }
    },
    include: {
      alignment: {
        include: { faction: true }
      }
    }
  });
  
  // Barajar roles
  const shuffledRoles = roles.sort(() => Math.random() - 0.5);
  
  // Asignar a jugadores
  const updates = game.players.map((player, index) => {
    const role = shuffledRoles[index];
    return prisma.gamePlayer.update({
      where: { id: player.id },
      data: {
        role: role.name,
        faction: role.alignment.faction.name as Faction,
      }
    });
  });
  
  await prisma.$transaction(updates);
}
```

### **11. Obtener Info Completa de un Rol**

```typescript
async function getRoleDetails(roleName: string) {
  return await prisma.role.findUnique({
    where: { name: roleName },
    include: {
      alignment: {
        include: {
          faction: true
        }
      }
    }
  });
}

// Uso:
const sheriffInfo = await getRoleDetails('Sheriff');
console.log(sheriffInfo);
/*
{
  name: 'Sheriff',
  displayName: 'Sheriff',
  description: 'Investiga jugadores...',
  abilityName: 'Interrogate',
  abilityDesc: 'Interroga a un jugador...',
  actionPriority: 7,
  attackValue: 0,
  defenseValue: 0,
  attributes: [],
  investigatorGroup: 'Sheriff, Executioner, Werewolf',
  config: { mustTarget: true, canTargetSelf: false },
  difficulty: 'EASY',
  alignment: {
    name: 'Town Investigative',
    shortName: 'TI',
    faction: {
      name: 'Town',
      color: '#4169e1'
    }
  }
}
*/
```

### **12. Búsqueda de Roles**

```typescript
// Buscar roles por nombre o descripción
async function searchRoles(query: string) {
  return await prisma.role.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { displayName: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ]
    },
    include: {
      alignment: {
        include: { faction: true }
      }
    }
  });
}

// Buscar roles con ataque poderoso
const powerfulAttackers = await prisma.role.findMany({
  where: {
    attackValue: { gte: 2 } // Powerful o Unstoppable
  }
});

// Buscar roles inmunes
const immuneRoles = await prisma.role.findMany({
  where: {
    defenseValue: { gte: 1 }
  }
});
```

---

## Migraciones

### **Setup Inicial**

```bash
# 1. Instalar Prisma
npm install prisma @prisma/client

# 2. Inicializar
npx prisma init

# 3. Configurar DATABASE_URL en .env
DATABASE_URL="postgresql://user:password@localhost:5432/mafia_game"

# 4. Crear schema.prisma (copiar el de arriba)

# 5. Generar migración inicial
npx prisma migrate dev --name init

# 6. Generar Prisma Client
npx prisma generate
```

### **Seed Inicial (IMPORTANTE)**

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // ============================================
  // FACCIONES
  // ============================================
  
  const townFaction = await prisma.faction.create({
    data: {
      name: 'Town',
      color: '#4169e1',
      description: 'Los ciudadanos del pueblo. Deben eliminar a toda la Mafia y amenazas neutrales.',
    }
  });
  
  const mafiaFaction = await prisma.faction.create({
    data: {
      name: 'Mafia',
      color: '#8b0000',
      description: 'La organización criminal. Deben igualar o superar en número al Town.',
    }
  });
  
  const neutralFaction = await prisma.faction.create({
    data: {
      name: 'Neutral',
      color: '#808080',
      description: 'Jugadores independientes con objetivos únicos.',
    }
  });
  
  // ============================================
  // ALIGNMENTS (Alineaciones)
  // ============================================
  
  // TOWN ALIGNMENTS
  const townInvestigative = await prisma.alignment.create({
    data: {
      factionId: townFaction.id,
      name: 'Town Investigative',
      shortName: 'TI',
      description: 'Roles que investigan y detectan enemigos.',
    }
  });
  
  const townProtective = await prisma.alignment.create({
    data: {
      factionId: townFaction.id,
      name: 'Town Protective',
      shortName: 'TP',
      description: 'Roles que protegen a otros jugadores de ataques.',
    }
  });
  
  const townKilling = await prisma.alignment.create({
    data: {
      factionId: townFaction.id,
      name: 'Town Killing',
      shortName: 'TK',
      description: 'Roles que pueden matar directamente a otros.',
    }
  });
  
  const townSupport = await prisma.alignment.create({
    data: {
      factionId: townFaction.id,
      name: 'Town Support',
      shortName: 'TS',
      description: 'Roles que apoyan al pueblo de diversas formas.',
    }
  });
  
  // MAFIA ALIGNMENTS
  const mafiaKilling = await prisma.alignment.create({
    data: {
      factionId: mafiaFaction.id,
      name: 'Mafia Killing',
      shortName: 'MK',
      description: 'Roles que ejecutan los asesinatos de la Mafia.',
    }
  });
  
  const mafiaDeception = await prisma.alignment.create({
    data: {
      factionId: mafiaFaction.id,
      name: 'Mafia Deception',
      shortName: 'MD',
      description: 'Roles que engañan y manipulan investigaciones.',
    }
  });
  
  const mafiaSupport = await prisma.alignment.create({
    data: {
      factionId: mafiaFaction.id,
      name: 'Mafia Support',
      shortName: 'MS',
      description: 'Roles que apoyan las operaciones de la Mafia.',
    }
  });
  
  // NEUTRAL ALIGNMENTS
  const neutralEvil = await prisma.alignment.create({
    data: {
      factionId: neutralFaction.id,
      name: 'Neutral Evil',
      shortName: 'NE',
      description: 'Roles neutrales con objetivos maliciosos.',
    }
  });
  
  const neutralKilling = await prisma.alignment.create({
    data: {
      factionId: neutralFaction.id,
      name: 'Neutral Killing',
      shortName: 'NK',
      description: 'Asesinos solitarios que deben eliminar a todos.',
    }
  });
  
  const neutralBenign = await prisma.alignment.create({
    data: {
      factionId: neutralFaction.id,
      name: 'Neutral Benign',
      shortName: 'NB',
      description: 'Roles neutrales que solo buscan sobrevivir.',
    }
  });
  
  // ============================================
  // ROLES - TOWN INVESTIGATIVE
  // ============================================
  
  await prisma.role.create({
    data: {
      alignmentId: townInvestigative.id,
      name: 'Sheriff',
      displayName: 'Sheriff',
      description: 'Investiga jugadores para detectar mafiosos y asesinos.',
      abilityName: 'Interrogate',
      abilityDesc: 'Interroga a un jugador cada noche para determinar si es sospechoso.',
      actionPriority: 7,
      investigatorGroup: 'Sheriff, Executioner, Werewolf',
      config: {
        mustTarget: true,
        canTargetSelf: false,
      },
      difficulty: 'EASY',
    }
  });
  
  await prisma.role.create({
    data: {
      alignmentId: townInvestigative.id,
      name: 'Investigator',
      displayName: 'Investigator',
      description: 'Investiga jugadores para averiguar posibles roles.',
      abilityName: 'Investigate',
      abilityDesc: 'Investiga a un jugador y obtén una lista de posibles roles.',
      actionPriority: 7,
      investigatorGroup: 'Investigator, Consigliere, Mayor',
      config: {
        mustTarget: true,
        canTargetSelf: false,
      },
      difficulty: 'MEDIUM',
    }
  });
  
  await prisma.role.create({
    data: {
      alignmentId: townInvestigative.id,
      name: 'Lookout',
      displayName: 'Lookout',
      description: 'Vigila a jugadores para ver quién los visita.',
      abilityName: 'Watch',
      abilityDesc: 'Vigila a un jugador y ve todos los que lo visitan esa noche.',
      actionPriority: 7,
      investigatorGroup: 'Lookout, Forger',
      config: {
        mustTarget: true,
        canTargetSelf: false,
      },
      difficulty: 'MEDIUM',
    }
  });
  
  await prisma.role.create({
    data: {
      alignmentId: townInvestigative.id,
      name: 'Spy',
      displayName: 'Spy',
      description: 'Espía las conversaciones y acciones de la Mafia.',
      abilityName: 'Bug',
      abilityDesc: 'Ve quién visita la Mafia y puede escuchar su chat.',
      actionPriority: 7,
      investigatorGroup: 'Spy, Blackmailer, Jailor',
      config: {
        mustTarget: false,
      },
      difficulty: 'HARD',
    }
  });
  
  // ============================================
  // ROLES - TOWN PROTECTIVE
  // ============================================
  
  await prisma.role.create({
    data: {
      alignmentId: townProtective.id,
      name: 'Doctor',
      displayName: 'Doctor',
      description: 'Cura a jugadores, salvándolos de ataques.',
      abilityName: 'Heal',
      abilityDesc: 'Cura a un jugador cada noche, previniendo una muerte.',
      actionPriority: 3,
      investigatorGroup: 'Doctor, Disguiser, Serial Killer',
      config: {
        mustTarget: true,
        canTargetSelf: true,
        selfTargetLimit: 1,
      },
      difficulty: 'EASY',
    }
  });
  
  await prisma.role.create({
    data: {
      alignmentId: townProtective.id,
      name: 'Bodyguard',
      displayName: 'Bodyguard',
      description: 'Protege a jugadores, muriendo en su lugar si es necesario.',
      abilityName: 'Protect',
      abilityDesc: 'Protege a un jugador. Si es atacado, tú y el atacante morís.',
      actionPriority: 3,
      attackValue: 2, // Powerful
      investigatorGroup: 'Bodyguard, Godfather, Arsonist',
      config: {
        mustTarget: true,
        canTargetSelf: true,
        selfTargetGivesVest: true,
      },
      difficulty: 'MEDIUM',
    }
  });
  
  // ============================================
  // ROLES - TOWN KILLING
  // ============================================
  
  await prisma.role.create({
    data: {
      alignmentId: townKilling.id,
      name: 'Vigilante',
      displayName: 'Vigilante',
      description: 'Dispara a sospechosos de noche.',
      abilityName: 'Shoot',
      abilityDesc: 'Dispara a alguien de noche. Si matas Town, te suicidas de culpa.',
      actionPriority: 5,
      attackValue: 1, // Basic
      investigatorGroup: 'Vigilante, Veteran, Mafioso',
      config: {
        usesPerGame: 3,
        mustTarget: false,
        canTargetSelf: false,
      },
      difficulty: 'HARD',
    }
  });
  
  await prisma.role.create({
    data: {
      alignmentId: townKilling.id,
      name: 'Veteran',
      displayName: 'Veteran',
      description: 'Veterano de guerra que se pone en alerta.',
      abilityName: 'Alert',
      abilityDesc: 'Ponte en alerta y mata a TODOS los visitantes.',
      actionPriority: 5,
      attackValue: 2, // Powerful
      defenseValue: 2, // Powerful (cuando en alerta)
      attributes: ['Detection Immune (when on alert)'],
      investigatorGroup: 'Vigilante, Veteran, Mafioso',
      config: {
        usesPerGame: 3,
        mustTarget: false,
      },
      difficulty: 'MEDIUM',
    }
  });
  
  // ============================================
  // ROLES - TOWN SUPPORT
  // ============================================
  
  await prisma.role.create({
    data: {
      alignmentId: townSupport.id,
      name: 'Escort',
      displayName: 'Escort',
      description: 'Distrae jugadores, bloqueando sus habilidades.',
      abilityName: 'Roleblock',
      abilityDesc: 'Bloquea la habilidad de un jugador por la noche.',
      actionPriority: 2,
      investigatorGroup: 'Escort, Transporter, Consort',
      config: {
        mustTarget: true,
        canTargetSelf: false,
      },
      difficulty: 'MEDIUM',
    }
  });
  
  await prisma.role.create({
    data: {
      alignmentId: townSupport.id,
      name: 'Mayor',
      displayName: 'Mayor',
      description: 'Líder del pueblo con voto triple.',
      abilityName: 'Reveal',
      abilityDesc: 'Revélate públicamente. Tu voto vale 3 pero no puedes ser curado.',
      actionPriority: 0,
      attributes: ['Can reveal', 'Vote weight 3 when revealed'],
      investigatorGroup: 'Investigator, Consigliere, Mayor',
      config: {
        mustTarget: false,
      },
      difficulty: 'EASY',
      isUnique: true,
    }
  });
  
  await prisma.role.create({
    data: {
      alignmentId: townSupport.id,
      name: 'Medium',
      displayName: 'Medium',
      description: 'Habla con los muertos.',
      abilityName: 'Seance',
      abilityDesc: 'Habla con un jugador muerto cada noche.',
      actionPriority: 7,
      investigatorGroup: 'Medium, Janitor, Retributionist',
      config: {
        mustTarget: true,
      },
      difficulty: 'EASY',
    }
  });
  
  await prisma.role.create({
    data: {
      alignmentId: townSupport.id,
      name: 'Transporter',
      displayName: 'Transporter',
      description: 'Intercambia dos jugadores de posición.',
      abilityName: 'Transport',
      abilityDesc: 'Intercambia dos jugadores, redirigiendo acciones entre ellos.',
      actionPriority: 4,
      investigatorGroup: 'Escort, Transporter, Consort',
      config: {
        mustTarget: true,
        requiresTwoTargets: true,
        canTargetSelf: true,
      },
      difficulty: 'EXPERT',
    }
  });
  
  // ============================================
  // ROLES - MAFIA KILLING
  // ============================================
  
  await prisma.role.create({
    data: {
      alignmentId: mafiaKilling.id,
      name: 'Godfather',
      displayName: 'Godfather',
      description: 'Líder de la Mafia, inmune de noche.',
      abilityName: 'Order',
      abilityDesc: 'Ordena el asesinato de la Mafia cada noche.',
      actionPriority: 6,
      attackValue: 1, // Basic
      defenseValue: 1, // Basic
      attributes: ['Detection Immune', 'Night Immune'],
      investigatorGroup: 'Bodyguard, Godfather, Arsonist',
      config: {
        mustTarget: true,
      },
      difficulty: 'EASY',
      isUnique: true,
    }
  });
  
  await prisma.role.create({
    data: {
      alignmentId: mafiaKilling.id,
      name: 'Mafioso',
      displayName: 'Mafioso',
      description: 'Ejecutor de la Mafia.',
      abilityName: 'Execute',
      abilityDesc: 'Ejecuta las órdenes del Godfather. Si muere, te conviertes en GF.',
      actionPriority: 6,
      attackValue: 1, // Basic
      investigatorGroup: 'Vigilante, Veteran, Mafioso',
      config: {
        mustTarget: true,
      },
      difficulty: 'EASY',
    }
  });
  
  // ============================================
  // ROLES - MAFIA DECEPTION
  // ============================================
  
  await prisma.role.create({
    data: {
      alignmentId: mafiaDeception.id,
      name: 'Framer',
      displayName: 'Framer',
      description: 'Incrimina a jugadores inocentes.',
      abilityName: 'Frame',
      abilityDesc: 'Haz que un jugador parezca sospechoso a investigadores.',
      actionPriority: 8,
      investigatorGroup: 'Framer, Vampire, Jester',
      config: {
        mustTarget: true,
        canTargetSelf: false,
      },
      difficulty: 'MEDIUM',
    }
  });
  
  await prisma.role.create({
    data: {
      alignmentId: mafiaDeception.id,
      name: 'Janitor',
      displayName: 'Janitor',
      description: 'Limpia escenas del crimen.',
      abilityName: 'Clean',
      abilityDesc: 'Limpia el rol de un jugador muerto, haciéndolo desconocido.',
      actionPriority: 8,
      investigatorGroup: 'Medium, Janitor, Retributionist',
      config: {
        usesPerGame: 3,
        mustTarget: true,
      },
      difficulty: 'HARD',
    }
  });
  
  await prisma.role.create({
    data: {
      alignmentId: mafiaDeception.id,
      name: 'Forger',
      displayName: 'Forger',
      description: 'Falsifica testamentos.',
      abilityName: 'Forge',
      abilityDesc: 'Reescribe el testamento de un jugador si muere esa noche.',
      actionPriority: 8,
      investigatorGroup: 'Lookout, Forger',
      config: {
        usesPerGame: 3,
        mustTarget: true,
      },
      difficulty: 'MEDIUM',
    }
  });
  
  // ============================================
  // ROLES - MAFIA SUPPORT
  // ============================================
  
  await prisma.role.create({
    data: {
      alignmentId: mafiaSupport.id,
      name: 'Blackmailer',
      displayName: 'Blackmailer',
      description: 'Chantajea jugadores para silenciarlos.',
      abilityName: 'Blackmail',
      abilityDesc: 'Silencia a un jugador, impidiéndole hablar de día.',
      actionPriority: 8,
      investigatorGroup: 'Spy, Blackmailer, Jailor',
      config: {
        mustTarget: true,
      },
      difficulty: 'MEDIUM',
    }
  });
  
  await prisma.role.create({
    data: {
      alignmentId: mafiaSupport.id,
      name: 'Consigliere',
      displayName: 'Consigliere',
      description: 'Investiga el rol exacto de jugadores.',
      abilityName: 'Investigate',
      abilityDesc: 'Investiga a un jugador y averigua su rol exacto.',
      actionPriority: 7,
      investigatorGroup: 'Investigator, Consigliere, Mayor',
      config: {
        mustTarget: true,
      },
      difficulty: 'EASY',
    }
  });
  
  await prisma.role.create({
    data: {
      alignmentId: mafiaSupport.id,
      name: 'Consort',
      displayName: 'Consort',
      description: 'Versión Mafia del Escort.',
      abilityName: 'Roleblock',
      abilityDesc: 'Bloquea la habilidad de un jugador.',
      actionPriority: 2,
      investigatorGroup: 'Escort, Transporter, Consort',
      config: {
        mustTarget: true,
      },
      difficulty: 'MEDIUM',
    }
  });
  
  // ============================================
  // ROLES - NEUTRAL EVIL
  // ============================================
  
  await prisma.role.create({
    data: {
      alignmentId: neutralEvil.id,
      name: 'Jester',
      displayName: 'Jester',
      description: 'Quiere ser ejecutado de día.',
      abilityName: 'Haunt',
      abilityDesc: 'Si eres ejecutado, puedes matar a un votante esa noche.',
      actionPriority: 0,
      attributes: ['Wins if lynched'],
      investigatorGroup: 'Framer, Vampire, Jester',
      config: {
        mustTarget: false,
      },
      difficulty: 'HARD',
    }
  });
  
  await prisma.role.create({
    data: {
      alignmentId: neutralEvil.id,
      name: 'Executioner',
      displayName: 'Executioner',
      description: 'Debe conseguir que ejecuten a tu objetivo.',
      abilityName: 'None',
      abilityDesc: 'Consigue que ejecuten a tu objetivo Town.',
      actionPriority: 0,
      attributes: ['Has a target', 'Becomes Jester if target dies at night'],
      investigatorGroup: 'Sheriff, Executioner, Werewolf',
      config: {
        hasTarget: true,
      },
      difficulty: 'MEDIUM',
    }
  });
  
  await prisma.role.create({
    data: {
      alignmentId: neutralEvil.id,
      name: 'Witch',
      displayName: 'Witch',
      description: 'Controla las acciones de otros jugadores.',
      abilityName: 'Control',
      abilityDesc: 'Controla a un jugador para que use su habilidad en quien tú elijas.',
      actionPriority: 2,
      attributes: ['Control Immune'],
      investigatorGroup: 'Framer, Vampire, Jester',
      config: {
        mustTarget: true,
        requiresTwoTargets: true,
      },
      difficulty: 'EXPERT',
    }
  });
  
  // ============================================
  // ROLES - NEUTRAL KILLING
  // ============================================
  
  await prisma.role.create({
    data: {
      alignmentId: neutralKilling.id,
      name: 'Serial Killer',
      displayName: 'Serial Killer',
      description: 'Asesino solitario que mata cada noche.',
      abilityName: 'Kill',
      abilityDesc: 'Mata a un jugador cada noche. Matas a quien te visite.',
      actionPriority: 6,
      attackValue: 1, // Basic
      defenseValue: 1, // Basic
      attributes: ['Night Immune', 'Kills visitors'],
      investigatorGroup: 'Doctor, Disguiser, Serial Killer',
      config: {
        mustTarget: true,
        canGoOnAlert: true,
      },
      difficulty: 'HARD',
    }
  });
  
  await prisma.role.create({
    data: {
      alignmentId: neutralKilling.id,
      name: 'Arsonist',
      displayName: 'Arsonist',
      description: 'Rocía gasolina y quema a todos a la vez.',
      abilityName: 'Douse/Ignite',
      abilityDesc: 'Rocía gasolina o quema a todos los rociados.',
      actionPriority: 6,
      attackValue: 3, // Unstoppable
      defenseValue: 1, // Basic
      attributes: ['Night Immune'],
      investigatorGroup: 'Bodyguard, Godfather, Arsonist',
      config: {
        mustTarget: false,
        hasTwoActions: true,
      },
      difficulty: 'HARD',
    }
  });
  
  await prisma.role.create({
    data: {
      alignmentId: neutralKilling.id,
      name: 'Werewolf',
      displayName: 'Werewolf',
      description: 'Hombre lobo que mata en luna llena.',
      abilityName: 'Maul',
      abilityDesc: 'En luna llena, mata a tu objetivo y a todos sus visitantes.',
      actionPriority: 6,
      attackValue: 2, // Powerful
      defenseValue: 1, // Basic
      attributes: ['Night Immune', 'Kills every full moon (every other night)'],
      investigatorGroup: 'Sheriff, Executioner, Werewolf',
      config: {
        mustTarget: true,
        cooldown: 1,
      },
      difficulty: 'MEDIUM',
    }
  });
  
  // ============================================
  // ROLES - NEUTRAL BENIGN
  // ============================================
  
  await prisma.role.create({
    data: {
      alignmentId: neutralBenign.id,
      name: 'Survivor',
      displayName: 'Survivor',
      description: 'Solo quiere sobrevivir.',
      abilityName: 'Vest',
      abilityDesc: 'Ponte un chaleco antibalas para protegerte de ataques.',
      actionPriority: 3,
      defenseValue: 1, // Basic (con vest)
      attributes: ['Wins with anyone'],
      investigatorGroup: 'Survivor, Vampire Hunter, Amnesiac',
      config: {
        usesPerGame: 4,
        mustTarget: false,
      },
      difficulty: 'EASY',
    }
  });
  
  await prisma.role.create({
    data: {
      alignmentId: neutralBenign.id,
      name: 'Amnesiac',
      displayName: 'Amnesiac',
      description: 'Recuerda el rol de un jugador muerto.',
      abilityName: 'Remember',
      abilityDesc: 'Elige el rol de un jugador muerto y conviértete en ese rol.',
      actionPriority: 0,
      investigatorGroup: 'Survivor, Vampire Hunter, Amnesiac',
      config: {
        usesPerGame: 1,
        mustTarget: true,
      },
      difficulty: 'MEDIUM',
    }
  });
  
  // ============================================
  // ROLE ESPECIAL - JAILOR (Único)
  // ============================================
  
  await prisma.role.create({
    data: {
      alignmentId: townSupport.id,
      name: 'Jailor',
      displayName: 'Jailor',
      description: 'Encarcela y ejecuta sospechosos.',
      abilityName: 'Jail/Execute',
      abilityDesc: 'Encierra a alguien de noche. Puedes ejecutarlo. 3 ejecuciones.',
      actionPriority: 1, // Máxima prioridad
      attackValue: 3, // Unstoppable (execution)
      attributes: ['Roleblock Immune', 'Unique'],
      investigatorGroup: 'Spy, Blackmailer, Jailor',
      config: {
        mustTarget: true,
        usesPerGame: 3, // 3 ejecuciones
        isUnique: true,
      },
      difficulty: 'EXPERT',
      isUnique: true,
    }
  });
  
  console.log('✅ Seed completado: Facciones, Alignments y 35+ Roles creados');
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
```

```bash
# Ejecutar seed
npx prisma db seed
```

---

## Consideraciones Adicionales

### **1. Soft Deletes**

Si quieres mantener historial completo:

```prisma
model Game {
  // ... campos existentes
  deletedAt DateTime?
  
  @@index([deletedAt])
}
```

### **2. Backup y Snapshots**

```sql
-- Backup completo
pg_dump mafia_game > backup_$(date +%Y%m%d).sql

-- Restaurar
psql mafia_game < backup_20260214.sql
```

### **3. Particionamiento (Futuro)**

Si creces mucho, particionar tabla `Game` por fecha:

```sql
CREATE TABLE games_2026 PARTITION OF "Game"
FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
```

### **4. Redis Cache (Opcional)**

```typescript
// Cache de game states activos
await redis.set(
  `game:${gameId}:state`,
  JSON.stringify(gameState),
  'EX', 3600 // 1 hora TTL
);

// Invalidar al cambiar
await redis.del(`game:${gameId}:state`);
```

---

## Resumen de Decisiones

| Aspecto | Decisión | Razón |
|---------|----------|-------|
| **BD Principal** | PostgreSQL 15+ | Relacional, JSONB, Prisma support |
| **ORM** | Prisma | Type-safe, migraciones, DX excelente |
| **Hosting** | Supabase / Railway | Gratis, fácil setup |
| **Cache** | Redis (opcional) | Para game states activos |
| **Backup** | pg_dump diario | Seguridad |
| **Índices** | Compuestos estratégicos | Performance |

---

## Estructura Visual de Roles

```
┌─────────────────────────────────────────────────────┐
│                   FACCIONES (3)                      │
└─────────────────────────────────────────────────────┘
           │              │              │
      ┌────▼────┐    ┌───▼───┐    ┌────▼────┐
      │  TOWN   │    │ MAFIA │    │ NEUTRAL │
      │ #4169e1 │    │#8b0000│    │ #808080 │
      └────┬────┘    └───┬───┘    └────┬────┘
           │             │               │
    ┌──────┴──────┐  ┌──┴───┐  ┌────────┴────────┐
    │             │  │      │  │                 │
┌───▼──┐  ┌───▼──┐ ┌▼──┐ ┌─▼─┐ ┌▼──┐ ┌──▼──┐ ┌─▼──┐
│  TI  │  │  TP  │ │MK │ │MD │ │NE │ │ NK  │ │ NB │
│(4-5) │  │(3-4) │ │(2)│ │(4)│ │(3)│ │(4)  │ │(2) │
└───┬──┘  └───┬──┘ └┬──┘ └─┬─┘ └┬──┘ └──┬──┘ └─┬──┘
    │         │     │     │    │      │      │
┌───▼───┐ ┌──▼──┐ ┌▼─┐ ┌─▼┐ ┌─▼┐ ┌──▼─┐ ┌──▼──┐
│Sheriff│ │Doctor│ │GF│ │Framer│ │Jest│ │ SK │Surviv│
│Invest.│ │BG   │ │Maf│ │Janit.│ │Exe │ │Arso│Amnes │
│Look   │ │Crusa│ │Amb│ │Forger│ │Witc│ │WW  │Guard │
│Spy    │ │Trap │ │   │ │Hypno │ │    │ │Jug │      │
│Psychic│ │     │ │   │ │Disgu │ │    │ │    │      │
└───────┘ └─────┘ └───┘ └────┘ └────┘ └────┘ └─────┘

┌───▼───┐  ┌──▼──┐
│  TK   │  │ TS  │
│(2-3)  │  │(5-6)│
└───┬───┘  └──┬──┘
    │         │
┌───▼───┐ ┌──▼────┐
│Vigil  │ │Escort │
│Veteran│ │Mayor  │
│VH     │ │Medium │
│       │ │Retri  │
│       │ │Trans  │
│       │ │Jailor │
└───────┘ └───────┘

┌───▼───┐
│  MS   │
│ (3)   │
└───┬───┘
    │
┌───▼────┐
│Blackm. │
│Consig. │
│Consort │
└────────┘

Leyenda:
TI = Town Investigative     MK = Mafia Killing      NE = Neutral Evil
TP = Town Protective        MD = Mafia Deception    NK = Neutral Killing
TK = Town Killing           MS = Mafia Support      NB = Neutral Benign
TS = Town Support
```

---

## Estadísticas de Roles Implementados

```typescript
// Resumen total:
const roleStats = {
  totalRoles: 35,
  byFaction: {
    Town: 20,      // 57%
    Mafia: 10,     // 29%
    Neutral: 5     // 14%
  },
  byAlignment: {
    'Town Investigative': 5,
    'Town Protective': 4,
    'Town Killing': 3,
    'Town Support': 8,
    'Mafia Killing': 2,
    'Mafia Deception': 4,
    'Mafia Support': 4,
    'Neutral Evil': 3,
    'Neutral Killing': 4,
    'Neutral Benign': 3
  },
  byDifficulty: {
    'EASY': 8,
    'MEDIUM': 14,
    'HARD': 8,
    'EXPERT': 5
  },
  unique: 3  // Jailor, Mayor, Godfather
};
```

---

## Queries Avanzadas

### **Obtener Role List Recomendada**

```typescript
// Para 15 jugadores - Lista balanceada tipo Town of Salem
async function getRecommendedRoleList() {
  return {
    town: [
      'Jailor',      // TS (único)
      'Sheriff',     // TI
      'Investigator',// TI
      'Lookout',     // TI
      'Doctor',      // TP
      'Bodyguard',   // TP
      'Vigilante',   // TK
      'Escort',      // TS
      'Medium'       // TS
    ],
    mafia: [
      'Godfather',   // MK (único)
      'Mafioso',     // MK
      'Consigliere', // MS
      'Consort',     // MS
      'Framer'       // MD
    ],
    neutral: [
      'Serial Killer', // NK
    ]
  };
}

// Total: 9 Town + 5 Mafia + 1 NK = 15 jugadores
```

### **Role Compatibility Check**

```typescript
// Verificar que role list es válida
async function validateRoleList(roleNames: string[]) {
  const roles = await prisma.role.findMany({
    where: { name: { in: roleNames } },
    include: {
      alignment: {
        include: { faction: true }
      }
    }
  });
  
  // Verificar que hay un Godfather si hay Mafia
  const mafiaRoles = roles.filter(r => r.alignment.faction.name === 'Mafia');
  const hasGodfather = mafiaRoles.some(r => r.name === 'Godfather');
  
  if (mafiaRoles.length > 0 && !hasGodfather) {
    return {
      valid: false,
      error: 'Debe haber un Godfather si hay roles Mafia'
    };
  }
  
  // Verificar roles únicos no duplicados
  const uniqueRoles = roles.filter(r => r.isUnique);
  const uniqueNames = uniqueRoles.map(r => r.name);
  const duplicates = uniqueNames.filter((name, index) => 
    uniqueNames.indexOf(name) !== index
  );
  
  if (duplicates.length > 0) {
    return {
      valid: false,
      error: `Roles únicos duplicados: ${duplicates.join(', ')}`
    };
  }
  
  // Verificar balance (Town debe ser ~50%)
  const townCount = roles.filter(r => r.alignment.faction.name === 'Town').length;
  const townPercent = townCount / roles.length;
  
  if (townPercent < 0.4 || townPercent > 0.65) {
    return {
      valid: false,
      warning: `Town debería ser 40-65% (actual: ${(townPercent*100).toFixed(0)}%)`
    };
  }
  
  return {
    valid: true,
    stats: {
      total: roles.length,
      town: townCount,
      mafia: roles.filter(r => r.alignment.faction.name === 'Mafia').length,
      neutral: roles.filter(r => r.alignment.faction.name === 'Neutral').length,
    }
  };
}
```

---

## Variables de Entorno

```bash
# .env
DATABASE_URL="postgresql://user:pass@host:5432/mafia_game?schema=public"

# Opcional para Redis
REDIS_URL="redis://localhost:6379"
```

---

**Última actualización**: Febrero 2026  
**Versión del Schema**: 1.0.0
