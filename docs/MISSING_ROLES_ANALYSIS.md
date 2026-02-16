# Roles Sin Implementación Mecánica - Análisis Detallado

## 📋 Resumen Ejecutivo

**Total de Roles Sin Implementación**: 10 de 50 (20%)

**Categorías:**
- Town: 2 roles (Vampire Hunter, Retributionist)
- Mafia: 1 rol (Ambusher)
- Neutral: 4 roles (Amnesiac, Pirate, Plaguebearer, Pestilence)
- Coven: 2 roles (Necromancer, Potion Master)
- Vampire: 1 rol (Vampire - conversión)

**Recientemente Implementado:**
- ✅ Crusader (PROTECT_VISITORS) - Implementado en gameEngine.js

---

## 🔴 ALTA PRIORIDAD - Roles Populares

### 1. ✅ Crusader (Town Protective) - IMPLEMENTADO

**Estado Actual:**
- ✅ Definido en seed.js
- ✅ nightActionType: `PROTECT_VISITORS`
- ✅ **IMPLEMENTADO** en gameEngine.js (16/02/2026)
- ✅ **Estrategias: 10 tips de Wiki implementados**

**Mecánica Implementada:**
```javascript
case 'PROTECT_VISITORS': {
  // Protege al objetivo con Powerful Defense (nivel 2)
  // Mata a UN visitante ALEATORIO con Basic Attack
  // NO ataca Vampiros
  // El ataque ocurre SIEMPRE, incluso si target no fue atacado
  
  grantDefense(targetId, 2); // Powerful Defense
  crusaderProtected.set(targetId, crusaderId);
  // Post-processing: selecciona visitor aleatorio y aplica Basic Attack
}
```

**Complejidad:** Media (5/10)  
**Tiempo de Implementación:** ~4 horas  
**Estado:** ✅ **COMPLETO**

**Testing Checklist:**
- [ ] Crusader protege con Powerful Defense
- [ ] Crusader mata UN visitante aleatorio
- [ ] NO ataca Vampiros
- [ ] Ataca incluso si target no fue atacado
- [ ] Visitor con defense sobrevive
- [ ] Notificaciones correctas (crusader, target, visitor)

---

### 2. Vampire Hunter (Town Killing)

**Estado Actual:**
- ✅ Definido en seed.js
- ✅ nightActionType: `KILL_VAMPIRES`
- ❌ NO hay case `KILL_VAMPIRES` en gameEngine.js
- ❌ Sistema Vampire no implementado

**Mecánica a Implementar:**
```javascript
case 'KILL_VAMPIRES': {
  // Chequea si target es Vampire
  // Si es Vampire → mata (ataque Basic)
  // Si NO es Vampire → nada
  // Si Vampire Hunter visita Vampire, mata al Vampire
  // Si Vampire convierte VH, VH se vuelve Vigilante con balas
  
  // Auto-detecta Vampiros:
  // - Si Vampire muerde a alguien cerca, VH puede detectarlo
  
  // Lógica:
  // 1. Verificar si target.role.slug === 'vampire'
  // 2. Si sí → aplicar ataque Basic
  // 3. Si no → no hacer nada
  // 4. Mensaje: "Tu target era un Vampire" o "Tu target no era Vampire"
}
```

**Complejidad:** Alta (7/10) - Requiere sistema Vampire
**Tiempo Estimado:** 6-8 horas (incluyendo sistema Vampire básico)
**Dependencias:** 
- ⚠️ Sistema Vampire conversión (no implementado)
- Sistema de detección nocturna
**Archivos a Modificar:**
- `backend/src/gameEngine.js` - añadir case KILL_VAMPIRES + sistema Vampire
- `backend/prisma/schema.prisma` - posible campo `vampires` en Game

**Decisión:** Postponer hasta implementar sistema Vampire completo

---

### 3. Ambusher (Mafia Killing)

**Estado Actual:**
- ✅ Definido en seed.js
- ✅ nightActionType: `AMBUSH`
- ❌ NO hay case `AMBUSH` en gameEngine.js

**Mecánica a Implementar:**
```javascript
case 'AMBUSH': {
  // Acampa en casa del objetivo
  // Mata a TODOS los visitantes (excepto Mafia)
  // Si Mafia mata al objetivo, Ambusher también ataca corpse (confirma kill)
  // Attack: 1 (Basic)
  // Priority: 6 (después de Jailor, antes de kills)
  
  // Lógica:
  // 1. Marcar target como "ambushed"
  // 2. Al final de noche, obtener lista de visitors
  // 3. Filtrar Mafia allies
  // 4. Aplicar ataque Basic a TODOS los visitors
  // 5. Mensaje: "Emboscaste a X visitantes"
  // 6. Visitors ven: "Fuiste emboscado por la Mafia"
}
```

**Complejidad:** Media-Alta (6/10)
**Tiempo Estimado:** 4-6 horas
**Dependencias:** Sistema visitantes ya existe
**Archivos a Modificar:**
- `backend/src/gameEngine.js` - añadir case AMBUSH (priority 6)
- Lógica similar a ALERT del Veteran pero con filtro Mafia

**Beneficios:**
- Rol Mafia importante para counter TI/TP spam
- Popularidad 0.55
- Añade profundidad a estrategia Mafia

---

## 🟡 MEDIA PRIORIDAD - Roles Especializados

### 4. Retributionist (Town Support)

**Estado Actual:**
- ✅ Definido en seed.js
- ✅ nightActionType: `RESURRECT`
- ❌ NO hay case `RESURRECT` en gameEngine.js

**Mecánica a Implementar:**
```javascript
case 'RESURRECT': {
  // Revive a un jugador muerto (1 uso)
  // Puede target cualquier cadáver (excepto cleaned por Janitor)
  // El resucitado regresa con su rol original
  // NO puede usar habilidad la noche que regresa
  
  // Lógica:
  // 1. Seleccionar de lista de deadPlayers
  // 2. Verificar que no fue cleaned
  // 3. Mover a livingPlayers
  // 4. Resetear estado (isAlive = true)
  // 5. Marcar como "resurrección inmune" por 1 noche
  // 6. Broadcast: "{Player} ha vuelto de entre los muertos"
}
```

**Complejidad:** Media-Alta (6/10)
**Tiempo Estimado:** 5-7 horas
**Dependencias:**
- Sistema de corpses (parcialmente existe)
- UI para seleccionar deadPlayers
**Archivos a Modificar:**
- `backend/src/gameEngine.js` - añadir case RESURRECT (priority alto)
- `frontend/components/GameBoard.tsx` - UI selector de muertos
- Socket events para lista de muertos elegibles

**Consideraciones:**
- Balance: ¿1 uso o 3?
- ¿Puede revivir unique roles (Jailor, Mayor)?
- ¿Cleaned bodies son elegibles?

---

### 5. Potion Master (Coven)

**Estado Actual:**
- ✅ Definido en seed.js
- ✅ nightActionType: `POTION`
- ❌ NO hay case `POTION` en gameEngine.js

**Mecánica a Implementar:**
```javascript
case 'POTION': {
  // 3 tipos de pociones (1 por noche, sin Necronomicon)
  // Con Necronomicon: 2 pociones por noche
  
  // Heal Potion: cura ataque (como Doctor)
  // Attack Potion: ataque Basic
  // Reveal Potion: ve el rol exacto (como Consigliere)
  
  // Lógica:
  // 1. Frontend envía { potionType: 'heal'|'attack'|'reveal', targetId }
  // 2. Con Necronomicon: envía array de 2 pociones
  // 3. Aplicar cada efecto según tipo
  // 4. Mensaje según tipo de poción
}
```

**Complejidad:** Media (5/10) - Múltiples modos
**Tiempo Estimado:** 4-6 horas
**Dependencias:**
- Sistema Necronomicon (¿existe?)
- UI selector de poción
**Archivos a Modificar:**
- `backend/src/gameEngine.js` - añadir case POTION (prioridades variables)
- `frontend/components/GameBoard.tsx` - UI selector de tipo poción
- Verificar sistema Necronomicon

---

### 6. Necromancer (Coven)

**Estado Actual:**
- ✅ Definido en seed.js
- ✅ nightActionType: `NECROMANCY`
- ❌ NO hay case `NECROMANCY` en gameEngine.js

**Mecánica a Implementar:**
```javascript
case 'NECROMANCY': {
  // Usa un corpse para replicar su habilidad
  // 3 usos por cadáver (o 1 uso según versión)
  // Con Necronomicon: control como Witch
  
  // Lógica:
  // 1. Seleccionar corpse de deadPlayers
  // 2. Verificar que corpse tenga habilidad usable
  // 3. Usar habilidad del corpse en target
  // 4. Ejemplo: usar Vigilante corpse para disparar
  // 5. Consume uso (3 usos per corpse)
}
```

**Complejidad:** Alta (8/10) - Requiere sistema de corpse abilities
**Tiempo Estimado:** 8-12 horas
**Dependencias:**
- Sistema corpse storage
- Replicación de casos de habilidades
- UI corpse selector
**Archivos a Modificar:**
- `backend/src/gameEngine.js` - añadir case NECROMANCY + corpse logic
- `frontend/components/GameBoard.tsx` - UI selector corpse + target
- Nueva tabla o campo para corpse tracking

**Decisión:** Postponer - muy complejo, baja prioridad

---

## 🟣 BAJA PRIORIDAD - Roles Únicos

### 7. Plaguebearer / Pestilence (Neutral Killing)

**Estado Actual:**
- ✅ Definidos en seed.js
- ✅ Plaguebearer nightActionType: `INFECT`
- ✅ Pestilence nightActionType: `KILL_RAMPAGE_UNSTOPPABLE`
- ❌ NO hay case `INFECT` en gameEngine.js
- ❌ NO hay sistema de transformación

**Mecánica a Implementar:**
```javascript
case 'INFECT': {
  // Plaguebearer infecta a jugadores
  // Infección se propaga a quien visita infectado
  // Cuando TODOS vivos están infectados → transforma a Pestilence
  
  // Lógica:
  // 1. Marcar target con { infected: true }
  // 2. Propagar infección:
  //    - Si visitor visita infectado → visitor se infecta
  // 3. Check al final de noche:
  //    - Si livingPlayers.every(p => p.infected) → transform
  // 4. Transformación:
  //    - Cambiar role a Pestilence
  //    - Attack: 3 (Unstoppable), Defense: 3 (Invincible)
  //    - nightActionType: KILL_RAMPAGE
}

case 'KILL_RAMPAGE_UNSTOPPABLE': {
  // Pestilence mata a target + todos sus visitantes
  // Ataque Imparable (ignora todo)
  // Inmune a todo (Invincible)
}
```

**Complejidad:** Alta (8/10) - Transformación + propagación
**Tiempo Estimado:** 10-15 horas
**Dependencias:**
- Sistema de transformación de roles
- Tracking de infección (new field en Player)
**Archivos a Modificar:**
- `backend/src/gameEngine.js` - INFECT + transformación
- `backend/prisma/schema.prisma` - campo infected
- Socket events para transformación broadcast

**Beneficios:**
- Rol NK único (popularidad 0.55)
- Mecánica compleja e interesante

---

### 8. Pirate (Neutral Chaos)

**Estado Actual:**
- ✅ Definido en seed.js
- ✅ nightActionType: `DUEL`
- ❌ NO hay case `DUEL` en gameEngine.js

**Mecánica a Implementar:**
```javascript
case 'DUEL': {
  // Minijuego rock-paper-scissors
  // Pirate selecciona: Cutlass, Pistol, Rapier
  // Target selecciona: Sidestep, Chainmail, Backpedal
  // Win condition: saquear 2 veces exitosamente
  
  // Lógica:
  // 1. Pirate selecciona movimiento
  // 2. Target (bot o player) selecciona contrato
  // 3. Resolver:
  //    - Cutlass vence Sidestep
  //    - Pistol vence Chainmail
  //    - Rapier vence Backpedal
  // 4. Si Pirate gana → roleblock + saqueo (marca 1 win)
  // 5. Si Target gana → Pirate no hace nada
  // 6. Check: si Pirate tiene 2 wins → Victory
}
```

**Complejidad:** Media-Alta (7/10) - Minijuego + UI interactiva
**Tiempo Estimado:** 10-15 horas (incluye UI compleja)
**Dependencias:**
- Sistema de minijuego
- UI interactiva para selección simultánea
- Bot AI para Pirate decisions
**Archivos a Modificar:**
- `backend/src/gameEngine.js` - añadir case DUEL + minigame logic
- `frontend/components/GameBoard.tsx` - UI duelo (rock-paper-scissors)
- Modal/popup para duelo
- Bot AI para selección inteligente

**Decisión:** Postponer - UI compleja, baja prioridad (popularidad 0.60)

---

### 9. Amnesiac (Neutral Benign)

**Estado Actual:**
- ✅ Definido en seed.js
- ✅ nightActionType: `REMEMBER`
- ❌ NO hay case `REMEMBER` en gameEngine.js

**Mecánica a Implementar:**
```javascript
case 'REMEMBER': {
  // Selecciona un cadáver
  // Se transforma en el rol del cadáver
  // Hereda win condition del nuevo rol
  // Pierde habilidades de Amnesiac
  
  // Lógica:
  // 1. Seleccionar corpse de deadPlayers
  // 2. Obtener role del corpse
  // 3. Cambiar player.roleId al nuevo rol
  // 4. Resetear abilityConfig (uses, etc)
  // 5. Broadcast: "{Player} ha recordado quién es"
  // 6. NO revelar el nuevo rol públicamente
}
```

**Complejidad:** Media (5/10)
**Tiempo Estimado:** 4-6 horas
**Dependencias:**
- Sistema corpse selection
- Sistema de transformación
- UI corpse selector
**Archivos a Modificar:**
- `backend/src/gameEngine.js` - añadir case REMEMBER
- `frontend/components/GameBoard.tsx` - UI selector corpse
- Verificar compatibilidad con unique roles

**Consideraciones:**
- ¿Puede recordar roles únicos (Jailor, Mayor)?
- ¿Hereda uses restantes (Vig bullets)?

---

### 10. Vampire (Neutral Chaos)

**Estado Actual:**
- ✅ Definido en seed.js
- ✅ nightActionType: `CONVERT`
- ❌ NO hay case `CONVERT` en gameEngine.js
- ❌ Sistema Vampire facción no implementado

**Mecánica a Implementar:**
```javascript
// SISTEMA VAMPIRE COMPLETO REQUERIDO

case 'CONVERT': {
  // Convierte a target en Vampire
  // Youngest Vampire hace la conversión (no Oldest)
  // Si target es Vampire Hunter → VH se vuelve Vigilante
  // Si Vampire es roleblocked → Vampire mata al roleblocker
  // Vampires forman facción independiente
  
  // Lógica:
  // 1. Determinar youngest Vampire (último convertido)
  // 2. Youngest intenta convertir
  // 3. Verificar si target es inmune
  // 4. Si VH → convertir VH a Vigilante
  // 5. Si Town → convertir a Vampire
  // 6. Añadir a facción Vampire
  // 7. Vampire facción win: eliminar Town + otros evils
}

// SISTEMA ADICIONAL:
// - Vampire chat nocturno
// - Youngest tracking
// - Vampire facción separada (no Neutral)
```

**Complejidad:** Muy Alta (9/10) - Sistema facción completo
**Tiempo Estimado:** 20-30 horas
**Dependencias:**
- Sistema de facción dinámica
- Chat Vampire nocturno
- Tracking youngest
- VH conversión a Vigilante
**Archivos a Modificar:**
- `backend/src/gameEngine.js` - caso CONVERT + sistema youngest
- `backend/prisma/schema.prisma` - posible Vampire faction tracking
- Chat system para Vampire faction
- Win condition checker para Vampire faction

**Decisión:** Postponer - ENORME complejidad, requiere refactor de facciones

---

## 📊 Matriz de Priorización

| Rol | Complejidad | Tiempo | Popularidad | Prioridad | Orden |
|-----|-------------|--------|-------------|-----------|-------|
| ✅ Crusader | 5/10 | 4h | 0.55 | ✅ HECHO | - |
| Ambusher | 6/10 | 4-6h | 0.55 | ⚠️ Alta | 1 |
| Retributionist | 6/10 | 5-7h | 0.50 | 🟡 Media | 2 |
| Potion Master | 5/10 | 4-6h | 0.65 | 🟡 Media | 3 |
| Amnesiac | 5/10 | 4-6h | 0.65 | 🟡 Media | 4 |
| Pirate | 7/10 | 10-15h | 0.60 | 🟢 Baja | 5 |
| Necromancer | 8/10 | 8-12h | 0.55 | 🟢 Baja | 6 |
| Plaguebearer | 8/10 | 10-15h | 0.55 | 🟢 Baja | 7 |
| Vampire Hunter | 7/10 | 6-8h | 0.60 | 🔴 Bloqueado* | 8 |
| Vampire | 9/10 | 20-30h | 0.70 | 🔴 Bloqueado* | 9 |

*Bloqueados hasta implementar sistema Vampire

---

## 🎯 Recomendación de Implementación

### Plan Sugerido:

**Fase 1 - Estrategias (AHORA)**
- Completar estrategias Wiki para 39 roles implementados
- Tiempo: 1-2 semanas
- Beneficio inmediato: Mejor AI bot

**Fase 2 - Quick Wins (después de estrategias)**
1. **Crusader** - 3-4 horas
2. **Ambusher** - 4-6 horas
3. **Amnesiac** - 4-6 horas

**Fase 3 - Roles Avanzados (futuro)**
4. **Retributionist** - requiere UI corpse selector
5. **Potion Master** - requiere UI multi-mode
6. **Pirate** - requiere minigame UI

**Fase 4 - Sistema Vampire (largo plazo)**
- Diseñar facción dinámica
- Implementar Vampire + Vampire Hunter juntos
- Requiere refactor significativo

**Postponer Indefinidamente:**
- Necromancer (muy complejo, baja popularidad)
- Plaguebearer/Pestilence (transformación compleja, baja popularidad)

---

## 📝 Notas de Implementación

### Crusader - Detalles Técnicos

```javascript
// En gameEngine.js, dentro de resolveNightActions()

case 'PROTECT_VISITORS': {
  // Priority 3 (mismo que PROTECT/HEAL/TRAP)
  const sourcePlayer = players.find(p => p.id === action.sourceId);
  const targetPlayer = players.find(p => p.id === action.targetId);
  
  if (!targetPlayer || targetPlayer.isRoleblocked) {
    results.push({ action, result: 'failed_roleblocked' });
    break;
  }
  
  // Aplicar protección básica
  protected.set(action.targetId, {
    sourceId: action.sourceId,
    type: 'crusader',
    level: 1 // Basic defense
  });
  
  results.push({ 
    action, 
    result: 'protecting',
    protectedId: action.targetId 
  });
  break;
}

// Más tarde, al resolver visitantes:
// Si target fue visitado:
const crusaderAction = nightActions.find(
  a => a.type === 'PROTECT_VISITORS' && a.targetId === visitedPlayerId
);

if (crusaderAction) {
  const visitors = getVisitors(visitedPlayerId, nightActions);
  if (visitors.length > 0) {
    // Seleccionar visitante aleatorio
    const randomVisitor = visitors[Math.floor(Math.random() * visitors.length)];
    
    // Aplicar ataque Basic (attackValue: 1)
    applyAttack(randomVisitor.id, crusaderAction.sourceId, 1);
    
    // Mensajes
    messages.push({
      playerId: crusaderAction.sourceId,
      text: 'Mataste a un visitante mientras protegías a tu objetivo.',
      type: 'crusader_kill'
    });
    
    messages.push({
      playerId: randomVisitor.id,
      text: 'Fuiste asesinado por un Crusader.',
      type: 'death_crusader'
    });
  }
}
```

### Ambusher - Detalles Técnicos

```javascript
case 'AMBUSH': {
  // Priority 6 (mismo que killing roles)
  // Similar a Veteran ALERT pero filtra Mafia
  
  const sourcePlayer = players.find(p => p.id === action.sourceId);
  const targetPlayer = players.find(p => p.id === action.targetId);
  
  if (!targetPlayer) {
    results.push({ action, result: 'failed_invalid_target' });
    break;
  }
  
  // Marcar como emboscado
  ambushes.set(action.targetId, action.sourceId);
  
  results.push({ 
    action, 
    result: 'ambush_set',
    targetId: action.targetId 
  });
  break;
}

// Al final de resolución:
ambushes.forEach((ambusherId, targetId) => {
  const visitors = getVisitors(targetId, nightActions);
  const ambusher = players.find(p => p.id === ambusherId);
  
  if (ambusher && ambusher.role.faction === 'MAFIA') {
    // Filtrar Mafia allies
    const nonMafiaVisitors = visitors.filter(v => {
      const visitor = players.find(p => p.id === v.id);
      return visitor && visitor.role.faction !== 'MAFIA';
    });
    
    // Matar a todos los visitantes no-Mafia
    nonMafiaVisitors.forEach(visitor => {
      applyAttack(visitor.id, ambusherId, 1); // Basic attack
      
      messages.push({
        playerId: visitor.id,
        text: 'Fuiste emboscado por la Mafia.',
        type: 'death_ambush'
      });
    });
    
    if (nonMafiaVisitors.length > 0) {
      messages.push({
        playerId: ambusherId,
        text: `Emboscaste a ${nonMafiaVisitors.length} visitante(s).`,
        type: 'ambush_success'
      });
    }
  }
});
```

---

## 🚀 Próximos Pasos

1. ✅ **Completar documento TODO** (este archivo)
2. ✅ **Implementar Crusader** (HECHO - 16/02/2026)
3. ⏭️ **Implementar Ambusher** (siguiente quick win)
4. ⏭️ **Implementar Amnesiac** (quick win)
5. ⏭️ **Testear Crusader** en juego real con bots
6. ⏭️ **Añadir estrategias** a más roles (Sheriff, Doctor, Jailor)

---

**Última Actualización**: 2026-02-16  
**Roles Analizados**: 11/11  
**Roles Implementados**: Crusader ✅  
**Tiempo Total Estimado (restantes)**: ~90-140 horas para implementación completa
