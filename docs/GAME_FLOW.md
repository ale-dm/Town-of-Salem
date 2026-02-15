# 🎮 GAME FLOW - Flujo Completo de una Partida

## 📋 Tabla de Contenidos
- [1. Preparación y Lobby](#1-preparación-y-lobby)
- [2. Asignación de Roles](#2-asignación-de-roles)
- [3. Ciclo de Juego](#3-ciclo-de-juego)
- [4. Fase de Noche](#4-fase-de-noche)
- [5. Fase de Día](#5-fase-de-día)
- [6. Sistema de Votación](#6-sistema-de-votación)
- [7. Condiciones de Victoria](#7-condiciones-de-victoria)
- [8. Gestión de Estados](#8-gestión-de-estados)
- [9. Características Especiales](#9-características-especiales)

---

## 1. Preparación y Lobby

### 1.1 Creación de Partida

**Host crea la partida:**
```javascript
// Request
POST /api/games/create
{
  "hostName": "Juan",
  "settings": {
    "minPlayers": 7,
    "maxPlayers": 15,
    "dayDuration": 300,      // 5 minutos en segundos
    "nightDuration": 60,     // 1 minuto
    "votingDuration": 90,    // 1.5 minutos
    "discussionDuration": 45, // 45 segundos
    "roleList": [
      "Jailor", "Sheriff", "Doctor", "Vigilante",
      "Godfather", "Mafioso", "Consigliere",
      "Serial Killer", "Jester", "Survivor",
      "Random Town", "Random Town", "Random Mafia",
      "Any", "Any"
    ]
  }
}

// Response
{
  "gameId": "ABC123",
  "joinUrl": "https://mafiagame.com/play/ABC123",
  "status": "WAITING",
  "createdAt": "2026-02-13T10:30:00Z"
}
```

**Estados del lobby:**
```
WAITING → Esperando jugadores
READY   → Suficientes jugadores, puede empezar
STARTING → Cuenta regresiva (10 seg)
PLAYING → Partida en curso
FINISHED → Partida terminada
```

### 1.2 Unirse a la Partida

**Flujo de unión:**
```javascript
// 1. Jugador escanea QR o entra al link
GET /play/ABC123

// 2. Página pide nickname
// 3. Request de unión
POST /api/games/ABC123/join
{
  "playerName": "María",
  "deviceId": "uuid-v4-here" // Para reconexiones
}

// 4. WebSocket connection
ws://api.mafiagame.com/games/ABC123
```

**Límites y validaciones:**
- Nickname: 3-20 caracteres, únicos en la partida
- Max 15 jugadores (configurable)
- No se puede unir si partida ya empezó
- Reconexión permitida si se desconectó

### 1.3 Configuración Pre-Partida

**Panel del host:**
```
┌────────────────────────────────┐
│ CONFIGURACIÓN DE PARTIDA       │
├────────────────────────────────┤
│ Jugadores: 8/15                │
│ ✅ Juan (Host)                 │
│ ✅ María                       │
│ ✅ Carlos                      │
│ ... (5 más)                    │
│                                │
│ [CONFIGURAR ROLES]             │
│ [INICIAR PARTIDA] ⚠️ Min 7     │
└────────────────────────────────┘
```

**Configurador de roles:**
```
TOWN (mínimo 40%):
☑️ Jailor
☑️ Sheriff
☑️ Doctor
☑️ Vigilante
☐ Mayor
☐ Escort
⬜ Random Town x2

MAFIA (mínimo 25%):
☑️ Godfather
☑️ Mafioso
☐ Consigliere
⬜ Random Mafia x1

NEUTRAL (máximo 35%):
☑️ Serial Killer
☑️ Jester
☐ Executioner
⬜ Any x2
```

---

## 2. Asignación de Roles

### 2.1 Algoritmo de Asignación

```javascript
function assignRoles(players, roleList) {
  // 1. Resolver "Random" y "Any"
  const resolvedRoles = resolveRandomRoles(roleList, players.length);
  
  // 2. Validar balance (Town >= 40%, Mafia >= 25%)
  validateBalance(resolvedRoles);
  
  // 3. Barajar roles
  const shuffledRoles = shuffle(resolvedRoles);
  
  // 4. Asignar a jugadores
  const assignments = players.map((player, index) => ({
    playerId: player.id,
    role: shuffledRoles[index],
    faction: getRoleFaction(shuffledRoles[index]),
    abilities: getRoleAbilities(shuffledRoles[index])
  }));
  
  // 5. Asignar objetivos especiales (Executioner, Guardian Angel)
  assignSpecialTargets(assignments);
  
  return assignments;
}
```

### 2.2 Notificación de Roles

**Mensaje privado a cada jugador:**
```
┌─────────────────────────────────────┐
│ 🎭 TU ROL                           │
├─────────────────────────────────────┤
│                                     │
│       🩺 DOCTOR                     │
│                                     │
│ Facción: 🔵 TOWN PROTECTIVE         │
│                                     │
│ Objetivo:                           │
│ Elimina a toda la Mafia y          │
│ amenazas neutrales                  │
│                                     │
│ Habilidad:                          │
│ Cada noche puedes curar a           │
│ un jugador. Si es atacado,          │
│ lo salvarás de la muerte.           │
│                                     │
│ • Usos ilimitados                   │
│ • Auto-cura: 1 vez                  │
│ • Prioridad: Media                  │
│                                     │
│ ⚠️ No puedes curar al mismo         │
│    jugador 2 noches seguidas        │
│                                     │
│ Atributos:                          │
│ • Si visitas al Serial Killer,      │
│   podrías morir                     │
│                                     │
│ [ENTENDIDO]                         │
└─────────────────────────────────────┘
```

**Para roles con información especial:**

```javascript
// MAFIA - Ve a sus compañeros
if (role.faction === "MAFIA") {
  const mafiaMembers = assignments
    .filter(a => a.faction === "MAFIA")
    .map(a => ({ name: a.playerName, role: a.role }));
  
  sendPrivateMessage(player, {
    type: "MAFIA_MEMBERS",
    members: mafiaMembers
  });
}

// EXECUTIONER - Se le asigna target
if (role.name === "EXECUTIONER") {
  const target = getRandomTownMember(assignments);
  
  sendPrivateMessage(player, {
    type: "EXECUTIONER_TARGET",
    target: target.playerName
  });
}
```

---

## 3. Ciclo de Juego

### 3.1 Estructura General

```
INICIO
  ↓
DÍA 1 (Discusión sin votación)
  ↓
NOCHE 1
  ↓
DÍA 2 (Discusión + Votación)
  ↓
NOCHE 2
  ↓
... (Repite hasta condición de victoria)
  ↓
PANTALLA DE VICTORIA
```

### 3.2 Transiciones de Fase

```javascript
class GamePhaseManager {
  phases = {
    DAY: {
      duration: 300, // 5 minutos
      allowChat: true,
      allowVoting: true,
      allowNightActions: false
    },
    NIGHT: {
      duration: 60,  // 1 minuto
      allowChat: false, // Solo Mafia entre ellos
      allowVoting: false,
      allowNightActions: true
    },
    VOTING: {
      duration: 90,
      allowChat: false,
      allowVoting: true,
      allowNightActions: false
    },
    TRIAL: {
      duration: 45,
      allowChat: true, // Solo el acusado
      allowVoting: true, // Guilty/Innocent
      allowNightActions: false
    }
  };
  
  async transitionTo(newPhase) {
    // 1. Cerrar fase actual
    await this.closeCurrentPhase();
    
    // 2. Procesar acciones pendientes
    await this.processActions();
    
    // 3. Aplicar efectos
    await this.applyEffects();
    
    // 4. Notificar resultados
    await this.announceResults();
    
    // 5. Verificar victoria
    if (this.checkVictoryCondition()) {
      return this.endGame();
    }
    
    // 6. Iniciar nueva fase
    await this.startNewPhase(newPhase);
    
    // 7. Iniciar timer
    this.startPhaseTimer();
  }
}
```

---

## 4. Fase de Noche

### 4.1 Inicio de la Noche

**Transición visual:**
```javascript
// Frontend
function transitionToNight() {
  // 1. Animación de fade
  fadeToBlack(1000);
  
  // 2. Cambiar fondo
  setBackground('night-sky');
  
  // 3. Sonido ambiente
  playSound('night-ambient.mp3');
  
  // 4. Mostrar luna y estrellas
  showNightElements();
  
  // 5. Notificación
  showNotification({
    title: "🌙 La noche ha caído...",
    message: "Es hora de actuar",
    duration: 3000
  });
  
  // 6. Abrir panel de acción si tienes habilidad
  if (player.hasNightAbility) {
    openActionPanel();
  }
}
```

### 4.2 Acciones Nocturnas

**Panel de acción (ejemplo Doctor):**
```
┌─────────────────────────────────┐
│ 🌙 NOCHE 2                      │
│ ⏱️ 0:45 restantes               │
├─────────────────────────────────┤
│ 🩺 DOCTOR                       │
│                                 │
│ Elige a quién curar:            │
│                                 │
│ ┌───────────────────────────┐  │
│ │ 🟢 Jugador 1              │  │
│ │ 🟢 Jugador 2              │  │
│ │ 🟢 Jugador 3              │  │
│ │ 🟢 Jugador 5 ⚠️ (ayer)    │  │
│ │ 🟢 Jugador 7              │  │
│ │ 🟢 Tú mismo (1 uso) ⭐     │  │
│ └───────────────────────────┘  │
│                                 │
│ ⚠️ No puedes curar a Jugador 5  │
│    (lo curaste anoche)          │
│                                 │
│ [CONFIRMAR] [SALTAR TURNO]      │
└─────────────────────────────────┘
```

### 4.3 Sistema de Prioridades

**Orden de resolución (de mayor a menor prioridad):**

```javascript
const ACTION_PRIORITY = {
  // Control y bloqueo
  JAILOR_JAIL: 1,          // Más alta - Bloquea todo
  ESCORT_BLOCK: 2,
  CONSORT_BLOCK: 2,
  WITCH_CONTROL: 2,
  
  // Protección
  BODYGUARD_PROTECT: 3,
  DOCTOR_HEAL: 3,
  CRUSADER_PROTECT: 3,
  
  // Transporte/Redirección
  TRANSPORTER_SWAP: 4,
  
  // Ataques
  VIGILANTE_SHOOT: 5,
  VETERAN_ALERT: 5,
  MAFIA_KILL: 6,
  SERIAL_KILLER_KILL: 6,
  ARSONIST_IGNITE: 6,
  
  // Investigación
  SHERIFF_INVESTIGATE: 7,
  INVESTIGATOR_INVESTIGATE: 7,
  LOOKOUT_WATCH: 7,
  CONSIGLIERE_INVESTIGATE: 7,
  
  // Otros
  BLACKMAILER_BLACKMAIL: 8,
  FRAMER_FRAME: 8,
  DISGUISER_DISGUISE: 8,
  JANITOR_CLEAN: 8,
  FORGER_FORGE: 8
};
```

### 4.4 Procesamiento de Acciones

```javascript
class NightActionProcessor {
  async processNight(actions) {
    const results = {
      deaths: [],
      protections: [],
      blocks: [],
      investigations: [],
      effects: []
    };
    
    // 1. FASE DE BLOQUEO
    const blockedPlayers = this.processBlocks(actions);
    
    // 2. FASE DE REDIRECCIÓN
    const redirectedActions = this.processRedirects(actions, blockedPlayers);
    
    // 3. FASE DE PROTECCIÓN
    const protectedPlayers = this.processProtections(redirectedActions);
    
    // 4. FASE DE ATAQUE
    const attackResults = this.processAttacks(
      redirectedActions,
      protectedPlayers,
      blockedPlayers
    );
    
    // 5. FASE DE INVESTIGACIÓN
    const investigationResults = this.processInvestigations(
      redirectedActions,
      blockedPlayers
    );
    
    // 6. FASE DE EFECTOS ESPECIALES
    const specialEffects = this.processSpecialEffects(redirectedActions);
    
    // 7. COMPILAR RESULTADOS
    return this.compileResults({
      attackResults,
      investigationResults,
      specialEffects
    });
  }
  
  processAttacks(actions, protected, blocked) {
    const deaths = [];
    const attacks = actions.filter(a => a.type === 'ATTACK');
    
    // Agrupar ataques por objetivo
    const attacksByTarget = groupBy(attacks, 'target');
    
    for (const [target, targetAttacks] of Object.entries(attacksByTarget)) {
      // ¿Está protegido?
      if (protected.includes(target)) {
        this.recordProtectionSuccess(target);
        continue;
      }
      
      // ¿El atacante fue bloqueado?
      const validAttacks = targetAttacks.filter(
        a => !blocked.includes(a.source)
      );
      
      if (validAttacks.length > 0) {
        // Determinar ataque con más prioridad
        const finalAttack = this.getHighestPriorityAttack(validAttacks);
        
        // Registrar muerte
        deaths.push({
          victim: target,
          killer: finalAttack.source,
          method: finalAttack.method
        });
        
        // Efectos secundarios (ej: Bodyguard mata atacante)
        this.processSideEffects(finalAttack, deaths);
      }
    }
    
    return deaths;
  }
}
```

### 4.5 Mecánicas Especiales

**JAILOR - Chat Privado:**

```javascript
// Cuando Jailor encierra a alguien
async function jailPlayer(jailor, prisoner) {
  // 1. Crear sala de chat temporal
  const jailRoom = await createPrivateRoom({
    participants: [jailor.id, prisoner.id],
    duration: nightDuration,
    type: 'JAIL'
  });
  
  // 2. Notificar a ambos
  await notifyPlayer(jailor, {
    type: 'JAIL_CREATED',
    prisoner: prisoner.name,
    roomId: jailRoom.id
  });
  
  await notifyPlayer(prisoner, {
    type: 'JAILED',
    message: 'Has sido encarcelado por el Jailor. Defiéndete.'
  });
  
  // 3. Bloquear habilidad del prisionero
  blockNightAction(prisoner.id);
  
  // 4. Dar opción de ejecución al Jailor
  giveExecutionOption(jailor, prisoner, jailRoom);
}

// Panel del Jailor
function JailorPanel({ prisoner }) {
  return (
    <div className="jail-panel">
      <h2>🔒 Prisión - Noche {currentNight}</h2>
      <p>Has encarcelado a: <strong>{prisoner.name}</strong></p>
      
      <ChatBox 
        messages={jailMessages}
        onSend={sendJailMessage}
        placeholder="Habla con el prisionero..."
      />
      
      <div className="execution-controls">
        <button 
          onClick={() => executePrisoner(prisoner)}
          className="execute-btn"
          disabled={executionsRemaining === 0}
        >
          ⚔️ EJECUTAR ({executionsRemaining} restantes)
        </button>
        
        <button 
          onClick={() => releasePrisoner(prisoner)}
          className="release-btn"
        >
          ✅ LIBERAR
        </button>
      </div>
      
      <Timer duration={nightDuration} />
    </div>
  );
}
```

**LOOKOUT - Sistema de Visitas:**

```javascript
function trackVisits(actions) {
  const visits = {};
  
  // Registrar todas las acciones que implican "visitar"
  const visitingActions = actions.filter(a => 
    VISITING_ROLES.includes(a.role)
  );
  
  for (const action of visitingActions) {
    if (!visits[action.target]) {
      visits[action.target] = [];
    }
    
    visits[action.target].push({
      visitor: action.source,
      role: action.role, // Solo Lookout ve esto
      time: action.timestamp
    });
  }
  
  return visits;
}

// Resultado para Lookout
{
  target: "Jugador 3",
  visitors: [
    "Jugador 5", // Doctor
    "Jugador 8", // Consigliere
    "Jugador 12" // Mafia
  ]
}
```

### 4.6 Fin de la Noche

**Compilación de resultados:**

```javascript
function compileNightResults(processed) {
  return {
    deaths: processed.deaths.map(d => ({
      victim: d.victim,
      cause: d.method,
      willMessage: getWill(d.victim),
      revealRole: !wasCleanedByJanitor(d.victim)
    })),
    
    protections: processed.protections.map(p => ({
      protected: p.target,
      protector: p.source,
      notifyProtector: true,
      notifyProtected: shouldNotify(p.type)
    })),
    
    investigations: processed.investigations,
    
    blocks: processed.blocks,
    
    conversions: processed.conversions, // Vampiro, etc.
    
    specialEvents: processed.special
  };
}
```

---

## 5. Fase de Día

### 5.1 Amanecer - Anuncio de Resultados

**Transición visual:**

```javascript
function transitionToDay() {
  // 1. Fade a luz
  fadeToLight(1500);
  
  // 2. Sonido de campanas/gallo
  playSound('rooster.mp3');
  
  // 3. Cambiar fondo
  setBackground('day-town-square');
  
  // 4. Anunciar resultados
  announceNightResults();
}
```

**Mensaje de resultados:**

```
┌───────────────────────────────────────┐
│ ☀️ AMANECE EL DÍA 2                   │
├───────────────────────────────────────┤
│                                       │
│ Anoche murieron:                      │
│                                       │
│ 💀 Jugador 3 - SHERIFF                │
│    Causa: Asesinado por la Mafia      │
│    Testamento: "Jugador 5 es          │
│    sospechoso. Investigué anoche."    │
│                                       │
│ 💀 Jugador 8 - CIUDADANO              │
│    Causa: Ejecutado por el Jailor     │
│    [Sin testamento]                   │
│                                       │
│ ─────────────────────────────────     │
│                                       │
│ 🟢 Jugadores vivos: 13/15             │
│ 💀 Muertos: 2                         │
│                                       │
│ ⏱️ Tienes 5:00 para discutir          │
│                                       │
│ [CONTINUAR]                           │
└───────────────────────────────────────┘
```

### 5.2 Discusión

**Chat principal:**

```
┌─────────────────────────────────────┐
│ 💬 CHAT DEL PUEBLO - Día 2          │
│ ⏱️ 4:23 restantes                   │
├─────────────────────────────────────┤
│                                     │
│ Jugador 5: Jugador 3 me investigó   │
│ anoche y pensó que soy malo...      │
│ pero soy Doctor!                    │
│                              14:30  │
│                                     │
│ Jugador 7: ¿Y si eres Godfather?    │
│ Ellos parecen inocentes al Sheriff  │
│                              14:31  │
│                                     │
│ Jugador 12: Yo vi a Jugador 10      │
│ visitar a Jugador 3 anoche          │
│                              14:32  │
│                                     │
│ Jugador 10: Claro, soy Escort y     │
│ lo bloqueé                          │
│                              14:33  │
│                                     │
│ [Escribe mensaje...]        [ENVIAR]│
└─────────────────────────────────────┘

⚠️ Jugador 6 está siendo chantajeado y no puede hablar
```

**Sistema de mensajes especiales:**

```javascript
// Mensajes del sistema
SYSTEM_MESSAGES = {
  PLAYER_LEFT: "{player} ha abandonado la partida",
  PLAYER_AFKED: "{player} está AFK (votará aleatorio)",
  BLACKMAILED: "⚫ {player} ha sido silenciado",
  MAYOR_REVEALED: "🎖️ {player} se ha revelado como MAYOR",
  MARSHAL_REVEALED: "⚖️ {player} se ha revelado como MARSHAL"
};

// Susurros (opcional)
function whisper(from, to, message) {
  // Visible para todos que están susurrando pero no el contenido
  broadcastToAll({
    type: 'WHISPER_NOTIFICATION',
    from: from.name,
    to: to.name
  });
  
  // Contenido solo para los dos
  sendToPlayers([from, to], {
    type: 'WHISPER_MESSAGE',
    from: from.name,
    message: message
  });
}
```

---

## 6. Sistema de Votación

### 6.1 Nominación

**Proceso:**

```
1. Jugador propone nominar a otro
2. Necesita "segundo" (otra persona apoya)
3. Si consigue segundo → votación abierta
4. Sino → nominación descartada
```

**UI de nominación:**

```
┌─────────────────────────────────────┐
│ ⚖️ NOMINACIÓN                        │
├─────────────────────────────────────┤
│ Jugador 7 propone ejecutar a:       │
│                                     │
│        👤 Jugador 5                 │
│                                     │
│ ¿Apoyas esta nominación?            │
│                                     │
│ [✅ SECUNDAR]    [❌ RECHAZAR]      │
│                                     │
│ Tiempo: 0:15                        │
└─────────────────────────────────────┘
```

### 6.2 Votación para Juicio

**Cuenta de votos:**

```javascript
function countVotesForTrial() {
  const livingPlayers = getLivingPlayers();
  const votesNeeded = Math.floor(livingPlayers.length / 2) + 1;
  
  return {
    votesFor: votes.filter(v => v.vote === 'YES').length,
    votesAgainst: votes.filter(v => v.vote === 'NO').length,
    abstained: livingPlayers.length - votes.length,
    needed: votesNeeded,
    passed: votesFor >= votesNeeded
  };
}
```

**Panel de votación:**

```
┌─────────────────────────────────────┐
│ 🗳️ VOTACIÓN - ¿Juicio a Jugador 5?  │
├─────────────────────────────────────┤
│                                     │
│ ████████░░ 8/13 votos (Necesario: 7)│
│                                     │
│ A FAVOR:                            │
│ ✅ Jugador 1, Jugador 3, Jugador 7  │
│ ✅ Jugador 9, Jugador 10, Jugador 11│
│ ✅ Jugador 12, Jugador 13           │
│                                     │
│ EN CONTRA:                          │
│ ❌ Jugador 2, Jugador 4             │
│                                     │
│ ABSTENCIONES:                       │
│ ⚪ Jugador 6, Jugador 8, Jugador 14 │
│                                     │
│ [TU VOTO]                           │
│ [✅ A FAVOR]  [❌ EN CONTRA]        │
│                                     │
│ ⏱️ 0:35 restantes                   │
└─────────────────────────────────────┘
```

**Casos especiales:**

```javascript
// Mayor revelado - Voto x3
if (voter.role === 'MAYOR' && voter.revealed) {
  voteWeight = 3;
  displayVote = `✅ ${voter.name} (x3)`;
}

// Doomed - No puede votar su último día
if (voter.doomed) {
  blockVote(voter);
  showMessage("Estás condenado, no puedes votar");
}

// AFK - Voto aleatorio
if (voter.afk) {
  castRandomVote(voter);
}
```

### 6.3 Juicio

**Fase de defensa:**

```
┌─────────────────────────────────────┐
│ ⚖️ JUICIO - Jugador 5 en el estrado │
├─────────────────────────────────────┤
│                                     │
│ Jugador 5 tiene 30 segundos para    │
│ defenderse:                         │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Jugador 5: Soy Doctor! Anoche   │ │
│ │ salvé a Jugador 2. Él puede     │ │
│ │ confirmarlo. No me ejecuten!    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ⏱️ 0:18 restantes                   │
│                                     │
│ [Solo Jugador 5 puede escribir]    │
└─────────────────────────────────────┘
```

**Votación final (Culpable/Inocente):**

```
┌─────────────────────────────────────┐
│ ⚖️ VEREDICTO - Jugador 5            │
├─────────────────────────────────────┤
│                                     │
│ ¿Cuál es tu veredicto?              │
│                                     │
│        [⚔️ CULPABLE]                │
│                                     │
│        [🛡️ INOCENTE]                │
│                                     │
│        [⚪ ABSTENCIÓN]               │
│                                     │
│ ⏱️ 0:45 para votar                  │
│                                     │
│ ─────────────────────────────────   │
│                                     │
│ Votos actuales:                     │
│ ⚔️ Culpable: 7                      │
│ 🛡️ Inocente: 4                      │
│ ⚪ Abstención: 2                     │
│                                     │
└─────────────────────────────────────┘
```

**Resolución:**

```javascript
function resolveTrialVote(votes) {
  const guilty = votes.filter(v => v === 'GUILTY').length;
  const innocent = votes.filter(v => v === 'INNOCENT').length;
  
  // Empate = Inocente
  if (guilty <= innocent) {
    return {
      verdict: 'INNOCENT',
      executed: false,
      message: `${accused.name} fue declarado INOCENTE (${guilty} culpable, ${innocent} inocente)`
    };
  }
  
  // Mayoría culpable = Ejecución
  return {
    verdict: 'GUILTY',
    executed: true,
    role: accused.role,
    message: `${accused.name} fue EJECUTADO. Su rol era: ${accused.role}`,
    
    // Jester gana si es ejecutado
    jesterWin: accused.role === 'JESTER',
    
    // Executioner gana si su target fue ejecutado
    executionerWin: checkExecutionerTarget(accused)
  };
}
```

**Efecto Jester:**

```javascript
// Si Jester es ejecutado
if (executed.role === 'JESTER') {
  showMessage("¡El Jester ha ganado!");
  
  // Jester elige a quién matar
  const guiltyVoters = votes.filter(v => v.vote === 'GUILTY');
  
  await showJesterChoice(jester, guiltyVoters);
  
  // Esa persona muere esa noche
  scheduleNightDeath(jesterChoice);
}
```

---

## 7. Condiciones de Victoria

### 7.1 Verificación Continua

```javascript
function checkVictoryCondition(gameState) {
  const alive = gameState.players.filter(p => p.alive);
  
  const factions = {
    town: alive.filter(p => p.faction === 'TOWN'),
    mafia: alive.filter(p => p.faction === 'MAFIA'),
    serialKiller: alive.filter(p => p.role === 'SERIAL_KILLER'),
    arsonist: alive.filter(p => p.role === 'ARSONIST'),
    werewolf: alive.filter(p => p.role === 'WEREWOLF'),
    survivor: alive.filter(p => p.role === 'SURVIVOR'),
    neutral: alive.filter(p => 
      ['JESTER', 'EXECUTIONER', 'GUARDIAN_ANGEL'].includes(p.role)
    )
  };
  
  // TOWN GANA
  if (factions.town.length > 0 && 
      factions.mafia.length === 0 &&
      factions.serialKiller.length === 0 &&
      factions.arsonist.length === 0 &&
      factions.werewolf.length === 0) {
    return {
      winner: 'TOWN',
      survivors: [...factions.town, ...factions.survivor]
    };
  }
  
  // MAFIA GANA
  if (factions.mafia.length >= factions.town.length &&
      factions.serialKiller.length === 0 &&
      factions.arsonist.length === 0 &&
      factions.werewolf.length === 0) {
    return {
      winner: 'MAFIA',
      survivors: [...factions.mafia, ...factions.survivor]
    };
  }
  
  // SERIAL KILLER GANA
  if (factions.serialKiller.length > 0 &&
      alive.length === 1) {
    return {
      winner: 'SERIAL_KILLER',
      survivors: factions.serialKiller
    };
  }
  
  // ARSONIST GANA
  if (factions.arsonist.length > 0 &&
      alive.length === 1) {
    return {
      winner: 'ARSONIST',
      survivors: factions.arsonist
    };
  }
  
  // Continúa el juego
  return null;
}
```

### 7.2 Pantalla de Victoria

```
┌─────────────────────────────────────────┐
│        🏆 ¡VICTORIA DEL PUEBLO!         │
├─────────────────────────────────────────┤
│                                         │
│     Día 7 - La paz ha sido restaurada   │
│                                         │
│ ═══════════════════════════════════     │
│                                         │
│ GANADORES (Town + Aliados):             │
│                                         │
│ ✅ Jugador 1  - Jailor                  │
│ ✅ Jugador 2  - Doctor                  │
│ ✅ Jugador 5  - Vigilante               │
│ ✅ Jugador 9  - Sheriff                 │
│ ✅ Jugador 14 - Survivor                │
│                                         │
│ PERDEDORES (Mafia):                     │
│                                         │
│ ❌ Jugador 3  - Godfather (D5)          │
│ ❌ Jugador 7  - Mafioso (N4)            │
│ ❌ Jugador 10 - Consigliere (D6)        │
│                                         │
│ OTROS:                                  │
│                                         │
│ ❌ Jugador 8  - Serial Killer (N5)      │
│ ✅ Jugador 11 - Jester (Ganó D3) 🎉     │
│ ❌ Jugador 13 - Executioner (Target D2) │
│                                         │
│ ─────────────────────────────────────   │
│                                         │
│ ESTADÍSTICAS:                           │
│ • Duración: 42 minutos                  │
│ • Noches jugadas: 6                     │
│ • Ejecuciones: 3                        │
│ • MVP: Jugador 1 (Jailor)               │
│                                         │
│ [VER RESUMEN] [NUEVA PARTIDA] [SALIR]   │
└─────────────────────────────────────────┘
```

---

## 8. Gestión de Estados

### 8.1 Modelo de Datos

```typescript
interface GameState {
  gameId: string;
  status: GameStatus;
  currentPhase: Phase;
  currentDay: number;
  phaseTimer: number;
  
  players: Player[];
  deadPlayers: Player[];
  
  chatHistory: Message[];
  nightActions: Action[];
  
  votes: Vote[];
  currentNominee: string | null;
  onTrial: string | null;
  
  settings: GameSettings;
}

interface Player {
  id: string;
  name: string;
  role: Role;
  faction: Faction;
  alive: boolean;
  
  // Estado temporal
  jailed: boolean;
  roleblocked: boolean;
  protected: boolean;
  doused: boolean;
  blackmailed: boolean;
  
  // Habilidades
  abilities: Ability[];
  usesRemaining: Map<string, number>;
  
  // Meta
  joinedAt: Date;
  lastAction: Date;
  afk: boolean;
}

interface Action {
  playerId: string;
  type: ActionType;
  target: string | null;
  priority: number;
  night: number;
}
```

### 8.2 Persistencia

```javascript
// Guardar estado cada cambio importante
async function saveGameState(gameId, state) {
  await db.games.update({
    where: { id: gameId },
    data: {
      state: JSON.stringify(state),
      updatedAt: new Date()
    }
  });
  
  // También en Redis para acceso rápido
  await redis.set(
    `game:${gameId}:state`,
    JSON.stringify(state),
    'EX',
    3600 // 1 hora de TTL
  );
}

// Recuperar en caso de crash
async function recoverGameState(gameId) {
  // Intentar desde Redis primero
  const cached = await redis.get(`game:${gameId}:state`);
  if (cached) return JSON.parse(cached);
  
  // Fallback a base de datos
  const game = await db.games.findUnique({
    where: { id: gameId }
  });
  
  return JSON.parse(game.state);
}
```

---

## 9. Características Especiales

### 9.1 Sistema de Testamentos

```javascript
// Jugador escribe testamento
function saveWill(playerId, content) {
  updatePlayer(playerId, {
    will: {
      content: content,
      lastUpdated: new Date()
    }
  });
}

// Se muestra al morir
function announceWill(player) {
  if (player.will && player.will.content) {
    return {
      hasWill: true,
      content: player.will.content,
      forged: player.willForged // Forger puede cambiar esto
    };
  }
  
  return { hasWill: false };
}
```

**UI de testamento:**

```
┌─────────────────────────────────┐
│ 📜 TU TESTAMENTO                │
├─────────────────────────────────┤
│ Se revelará cuando mueras       │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Soy Sheriff.                │ │
│ │                             │ │
│ │ N1: Investigué a Jugador 5  │ │
│ │ Resultado: No suspicious    │ │
│ │                             │ │
│ │ N2: Investigué a Jugador 8  │ │
│ │ Resultado: MAFIA!           │ │
│ │                             │ │
│ │ Si muero, Jugador 8 es malo │ │
│ └─────────────────────────────┘ │
│                                 │
│ Caracteres: 145/500             │
│                                 │
│ [GUARDAR]                       │
└─────────────────────────────────┘
```

### 9.2 Susurros

```javascript
// Habilitar/deshabilitar según configuración
if (gameSettings.allowWhispers) {
  enableWhisperSystem();
}

function sendWhisper(from, to, message) {
  // Notificar a todos que hay susurro
  broadcast({
    type: 'WHISPER_PUBLIC',
    from: from.name,
    to: to.name,
    timestamp: Date.now()
  });
  
  // Contenido privado
  sendPrivateMessage([from, to], {
    type: 'WHISPER_CONTENT',
    from: from.name,
    message: message,
    timestamp: Date.now()
  });
  
  // Spy puede verlo
  const spies = getPlayersWithRole('SPY');
  if (spies.length > 0) {
    sendToPlayers(spies, {
      type: 'SPY_INTERCEPT',
      from: from.name,
      to: to.name,
      message: message
    });
  }
}
```

### 9.3 Notas Personales

```
┌─────────────────────────────────┐
│ 📝 NOTAS PERSONALES             │
├─────────────────────────────────┤
│ Solo tú las ves                 │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ SOSPECHOSOS:                │ │
│ │ - Jugador 5: Muy callado    │ │
│ │ - Jugador 8: Defendió a 5   │ │
│ │                             │ │
│ │ CONFIRMADOS TOWN:           │ │
│ │ - Jugador 2: Doctor (me     │ │
│ │   curó anoche)              │ │
│ │                             │ │
│ │ MAFIA PROBABLE:             │ │
│ │ - Jugador 10 + Jugador 11   │ │
│ │   (votaron juntos siempre)  │ │
│ └─────────────────────────────┘ │
│                                 │
│ [AUTO-GUARDAR]                  │
└─────────────────────────────────┘
```

### 9.4 Sistema de Death Notes

```javascript
// Solo para killers (Mafia, SK, Arsonist)
function leaveDeathNote(killer, victim, note) {
  if (!KILLING_ROLES.includes(killer.role)) {
    throw new Error('Solo roles asesinos pueden dejar notas');
  }
  
  storeDeathNote(victim, {
    content: note,
    author: killer.role, // No revela quién, solo el tipo
    night: currentNight
  });
}

// Al anunciar muerte
function announceDeath(victim) {
  const deathNote = getDeathNote(victim);
  
  return {
    victim: victim.name,
    role: victim.role,
    cause: getCauseOfDeath(victim),
    deathNote: deathNote ? {
      content: deathNote.content,
      signature: getSignature(deathNote.author)
    } : null
  };
}
```

---

## 10. Manejo de Casos Especiales

### 10.1 Desconexiones

```javascript
async function handlePlayerDisconnect(playerId) {
  const player = getPlayer(playerId);
  
  // Marcar como desconectado
  player.connected = false;
  player.disconnectedAt = Date.now();
  
  // Esperar 60 segundos para reconexión
  setTimeout(async () => {
    if (!player.connected) {
      // Aún desconectado
      if (gameState.currentPhase === 'NIGHT' && player.hasNightAbility) {
        // Acción aleatoria o skip
        performRandomAction(player);
      }
      
      if (gameState.currentPhase === 'VOTING') {
        // Voto aleatorio
        castRandomVote(player);
      }
      
      // Marcar AFK
      player.afk = true;
      
      // Notificar a otros
      broadcast({
        type: 'PLAYER_AFK',
        player: player.name
      });
    }
  }, 60000);
}

async function handlePlayerReconnect(playerId) {
  const player = getPlayer(playerId);
  
  player.connected = true;
  player.afk = false;
  
  // Enviar estado actual
  sendGameState(player);
  
  broadcast({
    type: 'PLAYER_RECONNECTED',
    player: player.name
  });
}
```

### 10.2 Empates

```javascript
function handleStalemate() {
  // Si pasan 10 días sin muerte
  if (currentDay >= 10 && daysWithoutDeath >= 5) {
    return {
      draw: true,
      reason: 'STALEMATE',
      message: 'El pueblo ha llegado a un punto muerto. Empate.',
      winners: getAllAlivePlayers()
    };
  }
  
  // Si solo quedan roles inmunes
  const alive = getAlivePlayers();
  const allImmune = alive.every(p => isNightImmune(p.role));
  
  if (allImmune && alive.length <= 3) {
    return {
      draw: true,
      reason: 'ALL_IMMUNE',
      message: 'Todos los supervivientes son inmunes. Empate.',
      winners: alive
    };
  }
  
  return null;
}
```

### 10.3 Abandono de Host

```javascript
async function handleHostLeave(gameId, hostId) {
  const game = getGame(gameId);
  
  if (game.status === 'WAITING') {
    // En lobby - cancelar partida
    cancelGame(gameId);
    notifyAllPlayers('El host abandonó. Partida cancelada.');
  } else {
    // En juego - transferir host
    const newHost = getNextEligibleHost(game);
    
    game.hostId = newHost.id;
    
    notifyAllPlayers({
      type: 'NEW_HOST',
      newHost: newHost.name
    });
    
    sendPrivateMessage(newHost, {
      type: 'YOU_ARE_HOST',
      message: 'Ahora eres el host. Puedes pausar/cancelar la partida.'
    });
  }
}
```

---

## 📊 Diagramas de Flujo

Ver archivos en `/diagrams/`:
- `game-lifecycle.png` - Ciclo de vida completo
- `night-resolution.png` - Resolución de acciones nocturnas
- `voting-flow.png` - Proceso de votación
- `role-interactions.png` - Interacciones entre roles

---

**Última actualización**: Febrero 2026  
**Versión**: 1.0  
**Autor**: Equipo Mafia Game
