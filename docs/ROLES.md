# 🎭 ROLES - Documentación Completa de Todos los Roles

## 📋 Índice

- [Town (Pueblo)](#town-pueblo)
  - [Town Investigative](#town-investigative)
  - [Town Protective](#town-protective)
  - [Town Killing](#town-killing)
  - [Town Support](#town-support)
- [Mafia](#mafia)
  - [Mafia Killing](#mafia-killing)
  - [Mafia Deception](#mafia-deception)
  - [Mafia Support](#mafia-support)
- [Neutral](#neutral)
  - [Neutral Evil](#neutral-evil)
  - [Neutral Killing](#neutral-killing)
  - [Neutral Benign](#neutral-benign)
- [Priorización para MVP](#priorización-para-mvp)
- [Matriz de Interacciones](#matriz-de-interacciones)

---

## TOWN (PUEBLO) 🔵

Objetivo: Eliminar toda la Mafia y amenazas neutrales

### TOWN INVESTIGATIVE 🔍

---

#### 1. SHERIFF

**Alignment**: Town Investigative  
**Prioridad de acción**: 7

**Habilidad**:
- Investiga a un jugador cada noche
- Detecta si es miembro de Mafia o Serial Killer
- No detecta otros roles neutrales

**Resultados**:
```
SOSPECHOSO: Godfather, Mafioso, otros Mafia, Serial Killer
NO SOSPECHOSO: Resto de roles
```

**Excepciones**:
- Godfather aparece como NO SOSPECHOSO
- Si target es Framed → aparece SOSPECHOSO

**Implementación**:
```javascript
function sheriffInvestigate(target) {
  // Godfather excepción
  if (target.role === 'GODFATHER') {
    return { result: 'NOT_SUSPICIOUS', message: 'Tu objetivo no es sospechoso.' };
  }
  
  // Framed por Framer
  if (target.framed) {
    return { result: 'SUSPICIOUS', message: '¡Tu objetivo es miembro de la Mafia o Serial Killer!' };
  }
  
  // Mafia o SK
  if (target.faction === 'MAFIA' || target.role === 'SERIAL_KILLER') {
    return { result: 'SUSPICIOUS', message: '¡Tu objetivo es miembro de la Mafia o Serial Killer!' };
  }
  
  return { result: 'NOT_SUSPICIOUS', message: 'Tu objetivo no es sospechoso.' };
}
```

**Notas de implementación**:
- Alta prioridad en investigación
- Información binaria (sí/no)
- Fácil de implementar en MVP

---

#### 2. INVESTIGATOR

**Alignment**: Town Investigative  
**Prioridad de acción**: 7

**Habilidad**:
- Investiga a un jugador cada noche
- Obtiene una lista de 3 posibles roles

**Grupos de roles**:
```javascript
const INVESTIGATOR_RESULTS = {
  GROUP_1: ['Sheriff', 'Executioner', 'Werewolf'],
  GROUP_2: ['Lookout', 'Forger'],
  GROUP_3: ['Doctor', 'Disguiser', 'Serial Killer'],
  GROUP_4: ['Investigator', 'Consigliere', 'Mayor'],
  GROUP_5: ['Bodyguard', 'Godfather', 'Arsonist'],
  GROUP_6: ['Escort', 'Transporter', 'Consort'],
  GROUP_7: ['Medium', 'Janitor', 'Retributionist'],
  GROUP_8: ['Vigilante', 'Veteran', 'Mafioso'],
  GROUP_9: ['Framer', 'Vampire', 'Jester'],
  GROUP_10: ['Spy', 'Blackmailer', 'Jailor'],
  GROUP_11: ['Survivor', 'Vampire Hunter', 'Amnesiac', 'Medusa'],
};
```

**Resultado**:
```
"Tu objetivo podría ser: Doctor, Disguiser o Serial Killer"
```

**Implementación**:
```javascript
function investigatorInvestigate(target) {
  const group = getRoleGroup(target.role);
  
  return {
    result: 'SUCCESS',
    possibleRoles: group,
    message: `Tu objetivo podría ser: ${group.join(', ')}`
  };
}
```

**Complejidad**: Media  
**Fase**: 2 (necesita tabla de grupos bien definida)

---

#### 3. LOOKOUT

**Alignment**: Town Investigative  
**Prioridad de acción**: 7

**Habilidad**:
- Vigila a un jugador cada noche
- Ve quién lo visitó

**Resultado**:
```
"Jugador 5 y Jugador 8 visitaron a Jugador 2"
```

**Implementación**:
```javascript
// Sistema de tracking de visitas
class VisitTracker {
  visits = new Map(); // target -> [visitors]
  
  recordVisit(visitor, target, action) {
    if (!this.isVisitingAction(action)) return;
    
    if (!this.visits.has(target)) {
      this.visits.set(target, []);
    }
    
    this.visits.get(target).push({
      visitor: visitor,
      role: visitor.role,
      timestamp: Date.now()
    });
  }
  
  isVisitingAction(action) {
    // Roles que "visitan"
    const VISITING_ACTIONS = [
      'SHERIFF_INVESTIGATE',
      'DOCTOR_HEAL',
      'MAFIA_KILL',
      'ESCORT_BLOCK',
      'CONSIGLIERE_INVESTIGATE',
      // ... etc
    ];
    
    return VISITING_ACTIONS.includes(action.type);
  }
  
  getVisitors(target) {
    return this.visits.get(target) || [];
  }
}

function lookoutWatch(lookout, target, visitTracker) {
  const visitors = visitTracker.getVisitors(target);
  
  return {
    result: 'SUCCESS',
    visitors: visitors.map(v => v.visitor.name),
    message: visitors.length > 0
      ? `${visitors.map(v => v.visitor.name).join(', ')} visitó/visitaron a ${target.name}`
      : `Nadie visitó a ${target.name}`
  };
}
```

**Complejidad**: Alta  
**Fase**: 2  
**Nota**: Requiere sistema completo de tracking de visitas

---

#### 4. SPY

**Alignment**: Town Investigative  
**Prioridad de acción**: 7

**Habilidad**:
- Ve quién visitó la Mafia
- Puede "escuchar" el chat de Mafia (solo lectura)
- Puede poner "bug" en alguien para ver quién lo visita

**Resultado**:
```
"La Mafia visitó a Jugador 3"
"Mafia dice: 'Matemos a Jugador 5 esta noche'"
```

**Implementación**:
```javascript
function spyAbility(spy, game) {
  const results = {
    mafiaVisits: [],
    mafiaChat: [],
    buggedVisits: []
  };
  
  // Ver visitas de Mafia
  const mafiaPlayers = game.players.filter(p => p.faction === 'MAFIA');
  mafiaPlayers.forEach(mafia => {
    const visits = visitTracker.getVisitsByPlayer(mafia);
    results.mafiaVisits.push(...visits);
  });
  
  // Acceso a chat de Mafia (solo lectura)
  const mafiaMessages = getChatMessages('MAFIA_CHANNEL', game.currentNight);
  results.mafiaChat = mafiaMessages;
  
  // Bug (si pusieron en alguien)
  if (spy.bugTarget) {
    const visitors = visitTracker.getVisitors(spy.bugTarget);
    results.buggedVisits = visitors;
  }
  
  return results;
}
```

**Complejidad**: Muy Alta  
**Fase**: 3  
**Nota**: Requiere acceso especial a canales de Mafia

---

#### 5. PSYCHIC

**Alignment**: Town Investigative  
**Prioridad de acción**: Automático (no elige target)

**Habilidad**:
- Visiones automáticas cada día
- Días pares: "2 de estos 3 son buenos"
- Días impares: "1 de estos 3 es malo"

**Resultado**:
```
Día 2 (par): "Dos de estos son buenos: Jugador 1, Jugador 5, Jugador 9"
Día 3 (impar): "Uno de estos es malo: Jugador 3, Jugador 7, Jugador 12"
```

**Implementación**:
```javascript
function generatePsychicVision(game, day) {
  const alive = game.players.filter(p => p.alive);
  
  if (day % 2 === 0) {
    // Día par: 2 buenos de 3
    const good = alive.filter(p => p.faction === 'TOWN');
    const evil = alive.filter(p => p.faction !== 'TOWN');
    
    const selectedGood = randomSample(good, 2);
    const selectedEvil = randomSample(evil, 1);
    
    return {
      type: 'GOOD_VISION',
      players: shuffle([...selectedGood, ...selectedEvil]),
      message: `Dos de estos son buenos: ${players.join(', ')}`
    };
  } else {
    // Día impar: 1 malo de 3
    const good = alive.filter(p => p.faction === 'TOWN');
    const evil = alive.filter(p => p.faction !== 'TOWN');
    
    const selectedGood = randomSample(good, 2);
    const selectedEvil = randomSample(evil, 1);
    
    return {
      type: 'EVIL_VISION',
      players: shuffle([...selectedGood, ...selectedEvil]),
      message: `Uno de estos es malo: ${players.join(', ')}`
    };
  }
}
```

**Complejidad**: Media  
**Fase**: 2

---

### TOWN PROTECTIVE 🛡️

---

#### 6. DOCTOR

**Alignment**: Town Protective  
**Prioridad de acción**: 3

**Habilidad**:
- Cura a un jugador cada noche
- Previene una muerte
- No puede curar al mismo jugador dos noches seguidas
- Auto-cura: 1 vez

**Implementación**:
```javascript
class Doctor {
  lastTarget = null;
  selfHealsRemaining = 1;
  
  canHeal(target) {
    // No puede curar al mismo jugador consecutivamente
    if (target.id === this.lastTarget?.id) {
      return { 
        allowed: false, 
        reason: 'No puedes curar al mismo jugador dos noches seguidas' 
      };
    }
    
    // Auto-cura solo 1 vez
    if (target.id === this.playerId && this.selfHealsRemaining === 0) {
      return { 
        allowed: false, 
        reason: 'Ya usaste tu auto-curación' 
      };
    }
    
    return { allowed: true };
  }
  
  heal(target) {
    if (target.id === this.playerId) {
      this.selfHealsRemaining--;
    }
    
    this.lastTarget = target;
    
    return {
      type: 'HEAL',
      target: target.id,
      priority: 3,
      effect: (gameState) => {
        // Marcar como protegido
        target.protected = true;
        target.protectionType = 'HEAL';
      }
    };
  }
}

// En resolución de noche
function resolveAttacks(attacks, protections) {
  attacks.forEach(attack => {
    const target = attack.target;
    
    if (target.protected && target.protectionType === 'HEAL') {
      // Ataque bloqueado
      notifyPlayer(target, "Fuiste atacado pero un Doctor te salvó!");
      
      // Doctor puede ser notificado
      const doctor = protections.find(p => p.target === target.id);
      if (doctor) {
        notifyPlayer(doctor.source, `Tu objetivo fue atacado pero lo salvaste!`);
      }
      
      return; // No muere
    }
    
    // Procesar muerte
    killPlayer(target, attack.method);
  });
}
```

**Complejidad**: Media  
**Fase**: 1 (MVP)  
**Nota**: Rol fundamental, implementar primero

---

#### 7. BODYGUARD

**Alignment**: Town Protective  
**Prioridad de acción**: 3

**Habilidad**:
- Protege a un jugador
- Si es atacado, BG mata al atacante y muere
- 1 chaleco antibalas (auto-protección)

**Implementación**:
```javascript
class Bodyguard {
  vestsRemaining = 1;
  
  protect(target) {
    const isSelf = target.id === this.playerId;
    
    if (isSelf && this.vestsRemaining === 0) {
      return { 
        allowed: false, 
        reason: 'No tienes chalecos restantes' 
      };
    }
    
    if (isSelf) {
      this.vestsRemaining--;
      return {
        type: 'SELF_PROTECT',
        effect: () => {
          this.player.nightImmune = true;
        }
      };
    }
    
    return {
      type: 'BODYGUARD_PROTECT',
      target: target.id,
      priority: 3,
      effect: (attackers) => {
        if (attackers.length > 0) {
          // BG muere
          killPlayer(this.player, 'BODYGUARD_SACRIFICE');
          
          // Atacante muere
          const attacker = attackers[0]; // Primer atacante
          killPlayer(attacker, 'KILLED_BY_BODYGUARD');
          
          // Target vive
          return { targetSurvives: true };
        }
      }
    };
  }
}
```

**Complejidad**: Media-Alta  
**Fase**: 2  
**Nota**: Requiere interacción compleja con atacantes

---

#### 8. CRUSADER

**Alignment**: Town Protective  
**Prioridad de acción**: 3

**Habilidad**:
- Protege a alguien matando a un visitante aleatorio
- PELIGRO: Puede matar Town (Doctor, Investigador, etc.)

**Implementación**:
```javascript
function crusaderProtect(crusader, target, visitors) {
  if (visitors.length === 0) {
    return { killed: null };
  }
  
  // Mata visitante aleatorio
  const randomVisitor = randomChoice(visitors);
  
  killPlayer(randomVisitor, 'KILLED_BY_CRUSADER');
  
  // Si el visitante era atacante, objetivo vive
  if (randomVisitor.action?.type === 'ATTACK') {
    return { 
      killed: randomVisitor,
      targetSaved: true 
    };
  }
  
  // Si era Town útil, mala suerte...
  return { 
    killed: randomVisitor,
    targetSaved: false 
  };
}
```

**Complejidad**: Alta  
**Fase**: 3  
**Nota**: Difícil de balancear

---

#### 9. TRAPPER

**Alignment**: Town Protective  
**Prioridad de acción**: 3

**Habilidad**:
- Pone trampa que tarda 1 noche en construirse
- Al activarse, mata atacantes

**Implementación**:
```javascript
class Trapper {
  traps = new Map(); // target -> {state: 'building'|'active', day}
  
  setTrap(target) {
    if (this.traps.has(target.id)) {
      return { 
        allowed: false, 
        reason: 'Ya hay una trampa allí' 
      };
    }
    
    // Trampa en construcción
    this.traps.set(target.id, {
      state: 'BUILDING',
      placedDay: currentDay
    });
    
    return {
      type: 'TRAP_BUILDING',
      message: 'Trampa puesta. Estará lista mañana.'
    };
  }
  
  updateTraps() {
    this.traps.forEach((trap, targetId) => {
      if (trap.state === 'BUILDING') {
        trap.state = 'ACTIVE';
      }
    });
  }
  
  checkTrap(target, attacker) {
    const trap = this.traps.get(target.id);
    
    if (trap && trap.state === 'ACTIVE') {
      // Trampa se activa
      killPlayer(attacker, 'KILLED_BY_TRAP');
      
      // Trampa se destruye
      this.traps.delete(target.id);
      
      // Target vive
      return { trapActivated: true, targetSaved: true };
    }
    
    return { trapActivated: false };
  }
}
```

**Complejidad**: Alta  
**Fase**: 3

---

### TOWN KILLING ⚔️

---

#### 10. VIGILANTE

**Alignment**: Town Killing  
**Prioridad de acción**: 5

**Habilidad**:
- Dispara a alguien de noche
- 3 balas total
- Si mata Town → se suicida de culpa

**Implementación**:
```javascript
class Vigilante {
  bullets = 3;
  guilty = false;
  
  shoot(target) {
    if (this.bullets === 0) {
      return { 
        allowed: false, 
        reason: 'No tienes balas' 
      };
    }
    
    if (this.guilty) {
      return { 
        allowed: false, 
        reason: 'Estás paralizado por la culpa' 
      };
    }
    
    this.bullets--;
    
    return {
      type: 'VIGILANTE_SHOOT',
      target: target.id,
      priority: 5,
      resolve: () => {
        killPlayer(target, 'SHOT_BY_VIGILANTE');
        
        // Verificar si era Town
        if (target.faction === 'TOWN') {
          this.guilty = true;
          
          // Vigilante se suicida siguiente día
          scheduleEvent('NEXT_DAY', () => {
            killPlayer(this.player, 'VIGILANTE_GUILT');
            broadcast({
              message: `${this.player.name} se suicidó de culpa por matar a un miembro del pueblo.`
            });
          });
        }
      }
    };
  }
}
```

**Complejidad**: Media  
**Fase**: 1 (MVP)  
**Nota**: Importante para Town, implementar temprano

---

#### 11. VETERAN

**Alignment**: Town Killing  
**Prioridad de acción**: 5

**Habilidad**:
- Se pone en alerta
- Mata a TODOS los visitantes
- 3 alertas totales

**Implementación**:
```javascript
class Veteran {
  alerts = 3;
  onAlert = false;
  
  goOnAlert() {
    if (this.alerts === 0) {
      return { 
        allowed: false, 
        reason: 'No tienes alertas restantes' 
      };
    }
    
    this.alerts--;
    this.onAlert = true;
    
    return {
      type: 'VETERAN_ALERT',
      priority: 5,
      resolve: (visitors) => {
        if (this.onAlert && visitors.length > 0) {
          // Mata a TODOS los visitantes
          visitors.forEach(visitor => {
            killPlayer(visitor, 'KILLED_BY_VETERAN');
          });
          
          return {
            killed: visitors.length,
            message: `¡Mataste a ${visitors.length} visitante(s)!`
          };
        }
      }
    };
  }
}
```

**Complejidad**: Media  
**Fase**: 2  
**Nota**: Puede matar aliados, requiere claridad

---

#### 12. VAMPIRE HUNTER

**Alignment**: Town Killing  

**Nota**: Solo con vampiros, skip para MVP

---

### TOWN SUPPORT 💼

---

#### 13. ESCORT

**Alignment**: Town Support  
**Prioridad de acción**: 2

**Habilidad**:
- Bloquea habilidad de alguien
- Si bloquea Serial Killer → muere

**Implementación**:
```javascript
class Escort {
  roleblock(target) {
    return {
      type: 'ROLEBLOCK',
      target: target.id,
      priority: 2,
      resolve: () => {
        // Marcar como bloqueado
        target.roleblocked = true;
        
        // Cancelar acción nocturna
        cancelNightAction(target);
        
        // Notificar
        notifyPlayer(target, "¡Fuiste bloqueado por una Escort!");
        notifyPlayer(this.player, `Bloqueaste a ${target.name}`);
        
        // Excepción: Serial Killer
        if (target.role === 'SERIAL_KILLER') {
          killPlayer(this.player, 'KILLED_BY_SERIAL_KILLER');
          notifyPlayer(target, "¡Una Escort intentó bloquearte pero la mataste!");
        }
      }
    };
  }
}
```

**Complejidad**: Media  
**Fase**: 2

---

#### 14. MAYOR

**Alignment**: Town Support  

**Habilidad**:
- Puede revelarse públicamente
- Su voto vale 3
- Ya no puede ser curado tras revelarse

**Implementación**:
```javascript
class Mayor {
  revealed = false;
  
  reveal() {
    if (this.revealed) {
      return { 
        allowed: false, 
        reason: 'Ya estás revelado' 
      };
    }
    
    this.revealed = true;
    
    // Anuncio público
    broadcast({
      type: 'MAYOR_REVEALED',
      player: this.player.name,
      message: `¡${this.player.name} se ha revelado como MAYOR!`
    });
    
    // Efectos
    this.player.voteWeight = 3;
    this.player.canBeHealed = false;
    
    return {
      success: true,
      message: 'Te has revelado. Tu voto ahora vale 3.'
    };
  }
}

// En sistema de votación
function countVotes(votes) {
  let total = 0;
  
  votes.forEach(vote => {
    const player = getPlayer(vote.playerId);
    const weight = player.revealed && player.role === 'MAYOR' ? 3 : 1;
    total += weight;
  });
  
  return total;
}
```

**Complejidad**: Baja  
**Fase**: 1 (MVP)

---

#### 15. MEDIUM

**Alignment**: Town Support  
**Prioridad de acción**: 7

**Habilidad**:
- Habla con 1 muerto cada noche
- Puede elegir con quién

**Implementación**:
```javascript
class Medium {
  async seance(deadPlayer) {
    // Crear canal privado temporal
    const seanceRoom = await createPrivateRoom({
      participants: [this.player.id, deadPlayer.id],
      duration: NIGHT_DURATION,
      type: 'SEANCE'
    });
    
    // Notificar a ambos
    notifyPlayer(this.player, {
      type: 'SEANCE_STARTED',
      with: deadPlayer.name,
      roomId: seanceRoom.id
    });
    
    notifyPlayer(deadPlayer, {
      type: 'CONTACTED_BY_MEDIUM',
      medium: this.player.name,
      roomId: seanceRoom.id
    });
    
    return {
      type: 'SEANCE',
      room: seanceRoom,
      duration: NIGHT_DURATION
    };
  }
}
```

**Complejidad**: Alta  
**Fase**: 2  
**Nota**: Requiere sistema de canales privados

---

#### 16. RETRIBUTIONIST

**Alignment**: Town Support  

**Habilidad**:
- Revive a un muerto (1 vez)
- Solo roles Town

**Implementación**:
```javascript
class Retributionist {
  used = false;
  
  revive(deadPlayer) {
    if (this.used) {
      return { 
        allowed: false, 
        reason: 'Ya usaste tu revivir' 
      };
    }
    
    if (deadPlayer.faction !== 'TOWN') {
      return { 
        allowed: false, 
        reason: 'Solo puedes revivir Town' 
      };
    }
    
    this.used = true;
    
    // Revivir
    deadPlayer.alive = true;
    deadPlayer.revivedBy = this.player.id;
    
    broadcast({
      type: 'PLAYER_REVIVED',
      player: deadPlayer.name,
      message: `¡${deadPlayer.name} ha sido revivido!`
    });
    
    return {
      success: true,
      revived: deadPlayer.name
    };
  }
}
```

**Complejidad**: Media  
**Fase**: 3  
**Nota**: Muy poderoso, balancear bien

---

#### 17. TRANSPORTER

**Alignment**: Town Support  
**Prioridad de acción**: 4

**Habilidad**:
- Intercambia 2 personas
- Redirige todas las acciones

**Implementación**:
```javascript
class Transporter {
  transport(player1, player2) {
    return {
      type: 'TRANSPORT',
      targets: [player1.id, player2.id],
      priority: 4,
      resolve: (allActions) => {
        // Redirigir acciones
        allActions.forEach(action => {
          if (action.target === player1.id) {
            action.target = player2.id;
            action.redirected = true;
          } else if (action.target === player2.id) {
            action.target = player1.id;
            action.redirected = true;
          }
        });
        
        // Notificar a transportados
        notifyPlayer(player1, "¡Fuiste transportado!");
        notifyPlayer(player2, "¡Fuiste transportado!");
        
        return {
          swapped: [player1.name, player2.name]
        };
      }
    };
  }
}
```

**Complejidad**: Muy Alta  
**Fase**: 3  
**Nota**: Puede romper el juego, implementar cuidadosamente

---

## MAFIA 🔴

Objetivo: Igualar o superar en número al Town

### MAFIA KILLING

---

#### 18. GODFATHER (GF)

**Alignment**: Mafia Killing  
**Prioridad de acción**: 6

**Habilidad**:
- Ordena kill de Mafia
- Inmune de noche
- Aparece inocente a Sheriff

**Implementación**:
```javascript
class Godfather {
  nightImmune = true;
  
  orderKill(target) {
    // En chat de Mafia, GF decide
    const mafioso = getMafioso();
    
    if (mafioso && mafioso.alive) {
      // Mafioso ejecuta
      return {
        type: 'MAFIA_KILL',
        executor: mafioso.id,
        orderedBy: this.player.id,
        target: target.id,
        priority: 6
      };
    } else {
      // GF mata personalmente
      return {
        type: 'MAFIA_KILL',
        executor: this.player.id,
        target: target.id,
        priority: 6
      };
    }
  }
  
  // Excepción Sheriff
  onInvestigate(investigator) {
    if (investigator.role === 'SHERIFF') {
      return {
        result: 'NOT_SUSPICIOUS',
        message: 'Tu objetivo no es sospechoso.'
      };
    }
    
    // Investigator ve correctamente
    return investigator.investigate(this.player);
  }
}
```

**Complejidad**: Media  
**Fase**: 1 (MVP)

---

#### 19. MAFIOSO

**Alignment**: Mafia Killing  

**Habilidad**:
- Ejecuta órdenes del GF
- Si GF muere, se vuelve GF

**Implementación**:
```javascript
class Mafioso {
  executeOrder(target) {
    const gf = getGodfather();
    
    if (!gf || !gf.alive) {
      // Promoción a GF
      promoteToGodfather(this.player);
      
      return {
        promoted: true,
        message: '¡Has sido promovido a Godfather!'
      };
    }
    
    // Ejecutar kill
    return {
      type: 'MAFIA_KILL',
      executor: this.player.id,
      target: target.id,
      priority: 6
    };
  }
}

function promoteToGodfather(mafioso) {
  mafioso.role = 'GODFATHER';
  mafioso.nightImmune = true;
  
  notifyPlayer(mafioso, {
    type: 'ROLE_CHANGE',
    newRole: 'GODFATHER',
    message: 'El Godfather ha muerto. Ahora eres el nuevo líder de la Mafia.'
  });
}
```

**Complejidad**: Baja  
**Fase**: 1 (MVP)

---

#### 20. AMBUSHER

**Alignment**: Mafia Killing  

**Habilidad**:
- Emboscada que mata visitantes
- Como Veteran pero para Mafia

**Complejidad**: Media  
**Fase**: 3

---

### MAFIA DECEPTION

---

#### 21. DISGUISER

**Alignment**: Mafia Deception  

**Habilidad**:
- Se disfraza como alguien
- Al morir, aparece con ese rol

**Implementación**:
```javascript
class Disguiser {
  disguise(target) {
    return {
      type: 'DISGUISE',
      target: target.id,
      resolve: () => {
        this.player.disguisedAs = target.role;
        
        // Si Disguiser muere esta noche
        this.player.onDeath = () => {
          return {
            displayRole: target.role,
            message: `${this.player.name} murió. Era ${target.role}.`
          };
        };
      }
    };
  }
}
```

**Complejidad**: Media  
**Fase**: 2

---

#### 22. FORGER

**Alignment**: Mafia Deception  

**Habilidad**:
- Falsifica testamento
- 3 usos

**Implementación**:
```javascript
class Forger {
  forges = 3;
  
  forgeWill(target, fakeWill) {
    if (this.forges === 0) {
      return { 
        allowed: false, 
        reason: 'No tienes falsificaciones restantes' 
      };
    }
    
    this.forges--;
    
    return {
      type: 'FORGE_WILL',
      target: target.id,
      fakeWill: fakeWill,
      resolve: () => {
        // Si target muere esta noche
        if (!target.alive) {
          target.will = fakeWill;
          target.willForged = true;
        }
      }
    };
  }
}
```

**Complejidad**: Baja  
**Fase**: 2

---

#### 23. FRAMER

**Alignment**: Mafia Deception  
**Prioridad de acción**: 8

**Habilidad**:
- Hace que alguien parezca Mafia
- Dura 1 noche

**Implementación**:
```javascript
class Framer {
  frame(target) {
    return {
      type: 'FRAME',
      target: target.id,
      priority: 8, // Antes de investigaciones
      resolve: () => {
        target.framed = true;
        
        // Solo dura esta noche
        scheduleEvent('DAWN', () => {
          target.framed = false;
        });
      }
    };
  }
}
```

**Complejidad**: Baja  
**Fase**: 2

---

#### 24. HYPNOTIST

**Alignment**: Mafia Deception  

**Habilidad**:
- Planta mensajes falsos

**Complejidad**: Alta  
**Fase**: 3

---

#### 25. JANITOR

**Alignment**: Mafia Deception  
**Prioridad de acción**: 8

**Habilidad**:
- Limpia rol de víctima
- 3 usos
- Janitor ve el rol real

**Implementación**:
```javascript
class Janitor {
  cleans = 3;
  
  clean(target) {
    if (this.cleans === 0) {
      return { 
        allowed: false, 
        reason: 'No tienes limpiezas restantes' 
      };
    }
    
    this.cleans--;
    
    return {
      type: 'CLEAN',
      target: target.id,
      priority: 8,
      resolve: () => {
        // Si target muere esta noche
        if (!target.alive) {
          // Janitor ve el rol
          notifyPlayer(this.player, {
            type: 'CLEAN_SUCCESS',
            targetRole: target.role,
            message: `Limpiaste a ${target.name}. Era ${target.role}.`
          });
          
          // Al anunciar muerte, rol oculto
          target.roleCleaned = true;
          
          return {
            cleaned: target.name,
            realRole: target.role
          };
        }
      }
    };
  }
}

// Al anunciar muertes
function announceDeath(player) {
  if (player.roleCleaned) {
    return {
      message: `${player.name} murió. Su rol fue limpiado por un Janitor.`,
      roleRevealed: false
    };
  }
  
  return {
    message: `${player.name} murió. Era ${player.role}.`,
    roleRevealed: true
  };
}
```

**Complejidad**: Media  
**Fase**: 2

---

### MAFIA SUPPORT

---

#### 26. BLACKMAILER

**Alignment**: Mafia Support  
**Prioridad de acción**: 8

**Habilidad**:
- Silencia a alguien de día
- No puede hablar en chat

**Implementación**:
```javascript
class Blackmailer {
  blackmail(target) {
    return {
      type: 'BLACKMAIL',
      target: target.id,
      priority: 8,
      resolve: () => {
        target.blackmailed = true;
        
        // Notificar en privado
        notifyPlayer(target, {
          type: 'BLACKMAILED',
          message: '⚫ Has sido chantajeado. No puedes hablar durante el día.'
        });
        
        // Durante el día
        scheduleEvent('DAY', () => {
          // Opción 1: Quitar permisos de escribir
          removeChannelPermissions(target, 'SEND_MESSAGES');
          
          // Opción 2: Borrar mensajes automáticamente
          onMessage(target, (msg) => {
            deleteMessage(msg);
            notifyPlayer(target, '⚫ Estás chantajeado.');
          });
        });
        
        // Al terminar día, quitar efecto
        scheduleEvent('NIGHT', () => {
          target.blackmailed = false;
        });
      }
    };
  }
}
```

**Complejidad**: Media  
**Fase**: 2  
**Nota**: Implementación web más fácil que Discord

---

#### 27. CONSIGLIERE

**Alignment**: Mafia Support  
**Prioridad de acción**: 7

**Habilidad**:
- Investiga rol EXACTO
- Comparte info con Mafia

**Implementación**:
```javascript
class Consigliere {
  investigate(target) {
    return {
      type: 'CONSIGLIERE_INVESTIGATE',
      target: target.id,
      priority: 7,
      resolve: () => {
        const result = {
          targetName: target.name,
          exactRole: target.role,
          faction: target.faction
        };
        
        // Notificar a Consigliere
        notifyPlayer(this.player, {
          type: 'INVESTIGATION_RESULT',
          result: `Tu objetivo es ${target.role}.`
        });
        
        // Compartir en chat de Mafia
        sendToMafiaChat({
          type: 'CONSIGLIERE_RESULT',
          from: this.player.name,
          target: target.name,
          role: target.role
        });
        
        return result;
      }
    };
  }
}
```

**Complejidad**: Baja  
**Fase**: 1 (MVP)

---

#### 28. CONSORT

**Alignment**: Mafia Support  

**Habilidad**:
- Escort de Mafia
- Bloquea roles

**Implementación**: Igual que Escort pero para Mafia

**Complejidad**: Media  
**Fase**: 2

---

## NEUTRAL ⚖️

### NEUTRAL EVIL

---

#### 29. JESTER

**Alignment**: Neutral Evil  

**Objetivo**: Ser ejecutado de día  
**Victoria**: Si ejecutado → puede matar a 1 votante

**Implementación**:
```javascript
class Jester {
  won = false;
  
  onExecuted(voters) {
    this.won = true;
    
    broadcast({
      type: 'JESTER_WIN',
      message: `¡${this.player.name} era el JESTER y ha ganado!`
    });
    
    // Elegir a quién matar
    const guiltyVoters = voters.filter(v => v.vote === 'GUILTY');
    
    if (guiltyVoters.length > 0) {
      return {
        canKill: true,
        options: guiltyVoters,
        message: 'Elige a quién atormentará tu espíritu esta noche.'
      };
    }
    
    return {
      canKill: false,
      message: 'Nadie votó culpable, no puedes matar a nadie.'
    };
  }
  
  haunt(victim) {
    scheduleEvent('NIGHT', () => {
      killPlayer(victim, 'HAUNTED_BY_JESTER');
      
      broadcast({
        message: `${victim.name} fue atormentado hasta la muerte por el Jester.`
      });
    });
  }
}
```

**Complejidad**: Media  
**Fase**: 1 (MVP)  
**Nota**: Rol divertido, implementar temprano

---

#### 30. EXECUTIONER

**Alignment**: Neutral Evil  

**Objetivo**: Conseguir que ejecuten a SU target  
**Victoria**: Si target ejecutado de día

**Implementación**:
```javascript
class Executioner {
  target = null;
  won = false;
  
  assignTarget(alivePlayers) {
    // Target aleatorio de Town (no especial)
    const validTargets = alivePlayers.filter(p => 
      p.faction === 'TOWN' && 
      !['MAYOR', 'JAILOR'].includes(p.role)
    );
    
    this.target = randomChoice(validTargets);
    
    notifyPlayer(this.player, {
      type: 'EXECUTIONER_TARGET',
      target: this.target.name,
      message: `Tu objetivo es conseguir que ejecuten a ${this.target.name}.`
    });
  }
  
  checkVictory(executed) {
    if (executed.id === this.target.id) {
      this.won = true;
      
      broadcast({
        type: 'EXECUTIONER_WIN',
        message: `¡${this.player.name} era Executioner y ha ganado!`
      });
      
      return true;
    }
    
    return false;
  }
  
  onTargetDeath(cause) {
    if (cause !== 'EXECUTION') {
      // Target murió de noche → convertirse en Jester
      this.player.role = 'JESTER';
      
      notifyPlayer(this.player, {
        type: 'ROLE_CHANGE',
        newRole: 'JESTER',
        message: 'Tu objetivo murió. Ahora eres Jester.'
      });
    }
  }
}
```

**Complejidad**: Media  
**Fase**: 1 (MVP)

---

#### 31. WITCH

**Alignment**: Neutral Evil  

**Habilidad**:
- Controla acción de alguien

**Implementación**:
```javascript
class Witch {
  control(player, newTarget) {
    return {
      type: 'WITCH_CONTROL',
      target: player.id,
      priority: 2, // Alta prioridad
      resolve: (actions) => {
        // Encontrar acción del jugador
        const playerAction = actions.find(a => a.source === player.id);
        
        if (playerAction) {
          // Cambiar objetivo
          playerAction.target = newTarget.id;
          playerAction.controlled = true;
          
          notifyPlayer(player, "¡Fuiste controlado por una Witch!");
          notifyPlayer(this.player, `Controlaste a ${player.name}`);
          
          return {
            controlled: player.name,
            newTarget: newTarget.name
          };
        }
      }
    };
  }
}
```

**Complejidad**: Muy Alta  
**Fase**: 3  
**Nota**: Difícil de implementar bien

---

### NEUTRAL KILLING

---

#### 32. SERIAL KILLER (SK)

**Alignment**: Neutral Killing  
**Prioridad de acción**: 6

**Habilidad**:
- Mata cada noche
- Si visitado → mata al visitante
- Inmunidad básica

**Implementación**:
```javascript
class SerialKiller {
  cautious = false; // Modo cauteloso
  
  kill(target) {
    return {
      type: 'SK_KILL',
      target: target.id,
      priority: 6,
      resolve: () => {
        if (!this.cautious) {
          killPlayer(target, 'MURDERED_BY_SERIAL_KILLER');
        }
        // Si cautious, solo se defiende
      }
    };
  }
  
  onVisited(visitor) {
    // Mata a quien lo visite
    if (visitor.role !== 'JAILOR') { // Jailor es excepción
      killPlayer(visitor, 'KILLED_BY_SERIAL_KILLER');
      
      notifyPlayer(this.player, {
        message: `${visitor.name} te visitó y lo mataste.`
      });
    }
  }
}
```

**Complejidad**: Media  
**Fase**: 1 (MVP)

---

#### 33. ARSONIST

**Alignment**: Neutral Killing  

**Habilidad**:
- Rocía gasolina (múltiples noches)
- Quema a todos los rociados a la vez

**Implementación**:
```javascript
class Arsonist {
  doused = new Set(); // IDs de jugadores rociados
  
  douse(target) {
    return {
      type: 'DOUSE',
      target: target.id,
      priority: 6,
      resolve: () => {
        this.doused.add(target.id);
        target.doused = true;
        
        notifyPlayer(this.player, {
          message: `Rociaste a ${target.name} con gasolina.`
        });
      }
    };
  }
  
  ignite() {
    return {
      type: 'IGNITE',
      priority: 6,
      resolve: () => {
        const victims = [];
        
        this.doused.forEach(playerId => {
          const player = getPlayer(playerId);
          if (player.alive) {
            killPlayer(player, 'BURNED_BY_ARSONIST');
            victims.push(player.name);
          }
        });
        
        // Limpiar rociados
        this.doused.clear();
        
        broadcast({
          message: `¡Un incendio ha consumido a ${victims.join(', ')}!`
        });
        
        return {
          victims: victims.length
        };
      }
    };
  }
}
```

**Complejidad**: Media  
**Fase**: 2

---

#### 34. WEREWOLF

**Alignment**: Neutral Killing  

**Habilidad**:
- Mata en luna llena (cada 2-3 noches)
- Mata objetivo + visitantes

**Complejidad**: Media  
**Fase**: 3

---

#### 35. JUGGERNAUT

**Alignment**: Neutral Killing  

**Habilidad**:
- Se vuelve más fuerte con cada kill

**Complejidad**: Alta  
**Fase**: 3

---

### NEUTRAL BENIGN

---

#### 36. SURVIVOR

**Alignment**: Neutral Benign  

**Objetivo**: Sobrevivir hasta el final  
**Victoria**: Gana con quien gane

**Implementación**:
```javascript
class Survivor {
  vests = 4;
  
  putOnVest() {
    if (this.vests === 0) {
      return { 
        allowed: false, 
        reason: 'No tienes chalecos restantes' 
      };
    }
    
    this.vests--;
    
    return {
      type: 'SURVIVOR_VEST',
      resolve: () => {
        this.player.nightImmune = true;
        
        notifyPlayer(this.player, {
          message: `Te pusiste el chaleco. Estás protegido. (${this.vests} restantes)`
        });
        
        // Solo dura esta noche
        scheduleEvent('DAWN', () => {
          this.player.nightImmune = false;
        });
      }
    };
  }
}
```

**Complejidad**: Baja  
**Fase**: 1 (MVP)

---

#### 37. AMNESIAC

**Alignment**: Neutral Benign  

**Habilidad**:
- Recuerda rol de un muerto
- Se convierte en ese rol

**Implementación**:
```javascript
class Amnesiac {
  remember(deadPlayer) {
    const newRole = deadPlayer.role;
    const newFaction = deadPlayer.faction;
    
    // Cambiar rol
    this.player.role = newRole;
    this.player.faction = newFaction;
    
    // Obtener habilidades del nuevo rol
    this.player.abilities = getRoleAbilities(newRole);
    
    broadcast({
      type: 'AMNESIAC_REMEMBERED',
      player: this.player.name,
      newRole: newRole,
      message: `${this.player.name} ha recordado que era ${newRole}!`
    });
    
    notifyPlayer(this.player, {
      type: 'ROLE_CHANGE',
      newRole: newRole,
      message: `Recordaste que eras ${newRole}.`
    });
    
    // Si es Mafia, unirse a chat
    if (newFaction === 'MAFIA') {
      addToMafiaChat(this.player);
    }
    
    return {
      success: true,
      newRole: newRole
    };
  }
}
```

**Complejidad**: Alta  
**Fase**: 3

---

#### 38. GUARDIAN ANGEL

**Alignment**: Neutral Benign  

**Objetivo**: Mantener vivo a 1 target  
**Habilidad**: 2 protecciones

**Implementación**:
```javascript
class GuardianAngel {
  target = null;
  protections = 2;
  
  assignTarget(players) {
    // Target aleatorio (Town o Neutral)
    this.target = randomChoice(players.filter(p => 
      p.faction !== 'MAFIA'
    ));
    
    notifyPlayer(this.player, {
      type: 'GA_TARGET',
      target: this.target.name,
      message: `Debes proteger a ${this.target.name}.`
    });
  }
  
  protect() {
    if (this.protections === 0) {
      return { 
        allowed: false, 
        reason: 'No tienes protecciones restantes' 
      };
    }
    
    this.protections--;
    
    return {
      type: 'GA_PROTECT',
      target: this.target.id,
      priority: 3,
      resolve: () => {
        this.target.protected = true;
        this.target.protectionType = 'GUARDIAN_ANGEL';
      }
    };
  }
  
  checkVictory(gameEnd) {
    if (this.target.alive && gameEnd) {
      return {
        won: true,
        message: 'Tu objetivo sobrevivió. ¡Has ganado!'
      };
    }
  }
  
  onTargetDeath() {
    // Convertirse en Survivor
    this.player.role = 'SURVIVOR';
    this.player.vests = 2;
    
    notifyPlayer(this.player, {
      type: 'ROLE_CHANGE',
      newRole: 'SURVIVOR',
      message: 'Tu objetivo murió. Ahora eres Survivor con 2 chalecos.'
    });
  }
}
```

**Complejidad**: Media  
**Fase**: 3

---

## 🎯 PRIORIZACIÓN PARA MVP

### Fase 1: Core Roles (10 roles)

**TOWN (6)**:
1. ✅ Sheriff - Fácil, investigación básica
2. ✅ Doctor - Fundamental, protección
3. ✅ Vigilante - Killing básico
4. ✅ Mayor - Simple, mecánica de voto
5. ✅ Investigator - Medio, grupos de roles
6. ✅ Bodyguard - Medio, protección con trade

**MAFIA (3)**:
7. ✅ Godfather - Líder, inmunidad
8. ✅ Mafioso - Ejecutor
9. ✅ Consigliere - Investigador Mafia

**NEUTRAL (2)**:
10. ✅ Serial Killer - NK básico
11. ✅ Jester - NE divertido
12. ✅ Survivor - NB simple

### Fase 2: Roles Intermedios (+12 roles)

**TOWN (7)**:
13. ✅ Jailor ⭐ - Complejo pero icónico
14. ✅ Lookout - Requiere sistema de visitas
15. ✅ Escort - Roleblock básico
16. ✅ Medium - Chat con muertos
17. ✅ Psychic - Visiones automáticas
18. ✅ Veteran - Killing defensivo
19. ✅ Retributionist - Revivir

**MAFIA (4)**:
20. ✅ Blackmailer - Silenciar
21. ✅ Framer - Engaño simple
22. ✅ Janitor - Limpiar roles
23. ✅ Consort - Roleblock Mafia

**NEUTRAL (2)**:
24. ✅ Executioner - Objetivo específico
25. ✅ Arsonist - NK con mecánica única

### Fase 3: Roles Avanzados (+13 roles)

**TOWN (6)**:
26. Spy - Acceso a Mafia
27. Crusader - Protección peligrosa
28. Trapper - Trampa con delay
29. Transporter - Redirección compleja
30. Vampire Hunter

**MAFIA (4)**:
31. Disguiser - Cambio de rol
32. Forger - Falsificar testamentos
33. Hypnotist - Mensajes falsos
34. Ambusher

**NEUTRAL (3)**:
35. Witch - Control
36. Werewolf - Killing periódico
37. Amnesiac - Cambio de rol
38. Guardian Angel
39. Juggernaut

---

## 📊 MATRIZ DE INTERACCIONES

### Prioridades de Acción (menor = primero)

```
1. Jailor Jail
2. Roleblock (Escort, Consort)
2. Witch Control
3. Protección (Doctor, BG, Crusader)
4. Transporter
5. Killing (Vigilante, Veteran)
6. Mafia Kill, SK, Arsonist
7. Investigación (Sheriff, Investigator, Lookout, Consigliere)
8. Deception (Framer, Janitor, Blackmailer)
```

### Inmunidades

| Rol | Inmune a |
|-----|----------|
| Godfather | Ataques nocturnos (excepto Jailor) |
| Serial Killer | Ataques directos |
| Werewolf | Ataques nocturnos (luna llena) |
| Veteran (alerta) | Todo |
| Survivor (vest) | Ataques |
| Arsonist | Investigación |

### Interacciones Especiales

**Doctor + Bodyguard en mismo target:**
- Ambos protegen
- Si atacado: Doctor salva, BG no muere

**Transporter + Cualquier acción:**
- Redirige TODO
- Puede causar accidentes (Vig mata a Town, Doctor cura a Mafia)

**Jailor + Cualquier rol:**
- Bloquea todo del encarcelado
- Inmunidad a ataques externos mientras en jail

**Witch + Roles con habilidades:**
- Puede hacer que Vigilante dispare a aliado
- Puede hacer que Doctor cure a Mafia
- No puede controlar a inmunes

---

## 🔧 NOTAS DE IMPLEMENTACIÓN

### Sistema de Prioridades

```javascript
class ActionResolver {
  async resolveNight(actions) {
    // Ordenar por prioridad
    const sorted = actions.sort((a, b) => a.priority - b.priority);
    
    const state = {
      blocked: [],
      protected: [],
      redirected: new Map(),
      killed: []
    };
    
    for (const action of sorted) {
      await this.resolveAction(action, state);
    }
    
    return state;
  }
  
  async resolveAction(action, state) {
    // Verificar si está bloqueado
    if (state.blocked.includes(action.source)) {
      return { cancelled: true };
    }
    
    // Aplicar redirecciones
    if (state.redirected.has(action.target)) {
      action.target = state.redirected.get(action.target);
    }
    
    // Ejecutar acción
    await action.execute(state);
  }
}
```

### Balance de Roles

**Reglas generales**:
- Town: 40-60% de jugadores
- Mafia: 25-35% de jugadores
- Neutral: 10-25% de jugadores

**Ejemplo 15 jugadores**:
```
8 Town (53%)
4 Mafia (27%)
3 Neutral (20%)
```

---

**Última actualización**: Febrero 2026  
**Versión**: 1.0
