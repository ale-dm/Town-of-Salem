# 🎯 TABLA MAESTRA DE PRIORIDADES - Orden de Resolución de Acciones

## Overview

Las acciones nocturnas se resuelven en **orden de prioridad** (1-8, menor = primero).

**Regla de oro**: Si dos acciones tienen la misma prioridad, se resuelven **simultáneamente** (orden aleatorio).

---

## Tabla Completa de Prioridades

### **Priority 1: JAIL (Mayor prioridad - bloquea todo)**

| Rol | Acción | nightActionType | Razón |
|-----|--------|----------------|-------|
| Jailor | Encarcelar | `JAIL` | Debe ocurrir ANTES que todo para bloquear acciones |

**Efectos**:
- Prisionero NO puede usar habilidad
- Prisionero NO puede ser visitado
- Jailor puede ejecutar (Unstoppable)

---

### **Priority 2: ROLEBLOCK y CONTROL**

| Rol | Acción | nightActionType | Razón |
|-----|--------|----------------|-------|
| Escort | Bloquear | `ROLEBLOCK` | Bloquea habilidades antes de que ocurran |
| Consort | Bloquear | `ROLEBLOCK` | Igual que Escort |
| Witch | Controlar | `CONTROL` | Redirige acciones antes de resolverlas |
| Pirate | Duelar | `DUEL` | Bloquea si gana el duelo |

**Interacciones especiales**:
- **Serial Killer** (modo Normal): Mata al roleblocker
- **Arsonist**: Rocía al roleblocker con gasolina
- **Werewolf**: Mata al roleblocker en luna llena

---

### **Priority 3: HEAL y PROTECT**

| Rol | Acción | nightActionType | Razón |
|-----|--------|----------------|-------|
| Doctor | Curar | `HEAL` | Debe ocurrir ANTES del ataque para salvarlo |
| Bodyguard | Proteger | `PROTECT` | Intercepta ataques |
| Crusader | Proteger | `PROTECT_VISITORS` | Intercepta y mata visitante aleatorio |
| Survivor | Vest | `VEST` | Auto-protección |
| Trapper | Trampa | `TRAP` | Trampa mata atacantes |
| Guardian Angel | Proteger | `PROTECT_TARGET` | Protege a su target asignado |

**Interacciones**:
- Doctor cura 1 ataque (Basic o Powerful)
- Bodyguard + atacante = ambos mueren
- Crusader mata visitante ALEATORIO (puede matar Doctor)

---

### **Priority 4: TRANSPORT**

| Rol | Acción | nightActionType | Razón |
|-----|--------|----------------|-------|
| Transporter | Intercambiar | `TRANSPORT` | Debe ocurrir ANTES de ataques para redirigir correctamente |

**Efectos**:
- TODAS las acciones se redirigen
- Ejemplo: Mafia ataca A, Transporter swapea A↔B, Mafia mata B

---

### **Priority 5: ALERT y KILLS_VISITORS (Pasivos)**

| Rol | Acción | nightActionType | Razón |
|-----|--------|----------------|-------|
| Veteran | Alerta | `ALERT` | Mata TODOS los visitantes (incluye Mafia, Doctor, etc) |
| Serial Killer | Pasivo | `KILL_VISITORS` | Mata visitantes automáticamente |
| Medusa | Petrificar | `STONE_GAZE` | Petrifica visitantes |

**Nota**: Estas son habilidades **pasivas** (siempre activas o activables).

---

### **Priority 6: ATAQUES DIRECTOS**

| Rol | Acción | nightActionType | Attack | Razón |
|-----|--------|----------------|--------|-------|
| Godfather | Ordenar kill | `KILL_SINGLE` | Basic | Líder Mafia |
| Mafioso | Ejecutar kill | `KILL_SINGLE` | Basic | Ejecutor Mafia |
| Vigilante | Disparar | `KILL_SINGLE` | Basic | Town Killing |
| Serial Killer | Asesinar | `KILL_SINGLE` | Basic | Target específico |
| Arsonist | Quemar todos | `IGNITE` | Unstoppable | Mata TODOS los rociados |
| Werewolf | Rampage | `KILL_RAMPAGE` | Powerful | Luna llena, mata múltiples |
| Juggernaut | Rampage | `KILL_RAMPAGE` | Powerful | Se fortalece con kills |
| Ambusher | Emboscar | `KILL_SINGLE` | Basic | Mata visitantes del target |
| Hex Master | Hex | `HEX` | - | Hexa (cuando todos hexed, ataque Unstoppable) |
| Poisoner | Envenenar | `POISON` | Basic | Muerte retardada (X noches) |
| Plaguebearer | Infectar | `INFECT` | - | Infecta + propaga |
| Vampire | Morder | `BITE` | - | Convierte (no mata directamente) |
| Necromancer | Reanimar | `REANIMATE` | Varía | Usa cadáver con su habilidad |

**Notas**:
- Vigilante se suicida si mata Town
- Arsonist ignite = Unstoppable (mata a TODOS, ignora defensa)
- Werewolf solo ataca luna llena (cada 2 noches)

---

### **Priority 7: INVESTIGATIVE**

| Rol | Acción | nightActionType | Resultado |
|-----|--------|----------------|-----------|
| Sheriff | Interrogar | `SHERIFF_CHECK` | Suspicious / Not Suspicious |
| Investigator | Investigar | `INVESTIGATOR_CHECK` | Grupo de 3 roles |
| Lookout | Vigilar | `LOOKOUT_WATCH` | Lista de visitantes |
| Tracker | Rastrear | `TRACKER_TRACK` | A quién visitó el target |
| Spy | Espiar | `SPY_BUG` | Ve Mafia actions + puede ver susurros |
| Consigliere | Investigar | `CONSIGLIERE_CHECK` | Rol EXACTO |
| Psychic | Visión | `PSYCHIC_VISION` | Visión automática (bueno/malo) |
| Potion Master | Revelar | `POTION` | Puede revelar rol (o heal/attack) |

**Nota**: Investigación ocurre DESPUÉS de muertes para evitar resultados incorrectos.

---

### **Priority 8: DECEPTION (Última prioridad)**

| Rol | Acción | nightActionType | Efecto |
|-----|--------|----------------|--------|
| Framer | Enmarcar | `FRAME` | Target aparece "Suspicious" a Sheriff |
| Disguiser | Disfrazarse | `DISGUISE` | Cambia su rol aparente al del target |
| Janitor | Limpiar | `CLEAN` | Oculta rol de cadáver |
| Forger | Falsificar | `FORGE` | Cambia testamento del target |
| Blackmailer | Chantajear | `BLACKMAIL` | Target no puede hablar de día |
| Hypnotist | Hipnotizar | `HYPNOTIZE` | Envía mensaje falso al target |

**Nota**: Deception ocurre ÚLTIMO para no interferir con otras acciones.

---

## Casos Especiales

### **Acciones Automáticas (No requieren target)**

| Rol | Acción | nightActionType | Cuándo |
|-----|--------|----------------|--------|
| Psychic | Visiones | `AUTOMATIC` | Noches pares/impares |
| Plaguebearer | Infectar | `AUTOMATIC` | Después de Pestilence transform |
| Amnesiac | - | `NONE` | Solo puede recordar rol (1 vez) |

---

### **Acciones con Múltiples Modos**

| Rol | Modo | Prioridad |
|-----|------|-----------|
| Serial Killer | Normal | P6 (kill) + P5 (pasivo) |
| Serial Killer | Cautious | P6 (kill), NO pasivo |
| Arsonist | Douse | P6 |
| Arsonist | Ignite | P6 |
| Jailor | Jail | P1 |
| Jailor | Execute | P1 (dentro del jail) |

---

## Ejemplos de Resolución

### **Ejemplo 1: Doctor vs Mafia**

```
NOCHE 3:
- Doctor (P3): Cura a Juan
- Godfather (P6): Ordena matar a Juan

RESOLUCIÓN:
1. P3: Doctor aplica HEAL effect a Juan
2. P6: Godfather ataca a Juan (Basic attack)
3. Sistema verifica: Juan tiene HEAL → Ataque BLOQUEADO
4. Resultado: Juan sobrevive, Doctor recibe mensaje "Tu target fue atacado pero lo salvaste"
```

### **Ejemplo 2: Transporter vs Mafia**

```
NOCHE 5:
- Transporter (P4): Swapea Juan ↔ Pedro
- Godfather (P6): Ordena matar a Juan

RESOLUCIÓN:
1. P4: Transporter swapea posiciones
2. P6: Godfather ataca a Juan → Acción se REDIRIGE a Pedro
3. Resultado: Pedro muere (no Juan)
```

### **Ejemplo 3: Serial Killer vs Escort**

```
NOCHE 2:
- Serial Killer (P6 modo Normal): Intenta matar a María
- Escort (P2): Bloquea a Serial Killer

RESOLUCIÓN:
1. P2: Escort aplica ROLEBLOCK a SK
2. SK verifica interacción especial: "Escort" + "roleblocked" → KILLS_ROLEBLOCKER
3. SK mata a Escort (Priority P2 immediate)
4. SK NO mata a María (estaba bloqueado, pero mató al bloqueador)
5. Resultado: Escort muere, María sobrevive
```

### **Ejemplo 4: Veteran Alert vs Mafia + Doctor**

```
NOCHE 4:
- Veteran (P5): Activa ALERT
- Doctor (P3): Intenta curar a Veteran
- Mafioso (P6): Intenta matar a Veteran

RESOLUCIÓN:
1. P3: Doctor VISITA a Veteran
2. P5: Veteran en ALERT → Mata TODOS los visitantes
3. Doctor MUERE (visitó a Veteran en alert)
4. P6: Mafioso VISITA a Veteran
5. P5: Veteran mata a Mafioso también
6. Resultado: Doctor + Mafioso muertos, Veteran vive
```

### **Ejemplo 5: Arsonist Ignite**

```
NOCHE 6:
- Arsonist (P6): IGNITE (tiene 3 jugadores rociados)
- Doctor (P3): Cura a Juan (uno de los rociados)

RESOLUCIÓN:
1. P3: Doctor aplica HEAL a Juan
2. P6: Arsonist ignite → Ataque UNSTOPPABLE (lvl 3)
3. Sistema verifica: UNSTOPPABLE ignora HEAL
4. Resultado: Todos los rociados mueren (incluido Juan)
```

---

## Interacciones Complejas

### **Jailor vs Todo**

Jailor tiene **PRIORIDAD ABSOLUTA**:
- Jail (P1) bloquea TODAS las acciones del prisionero
- Prisionero NO puede ser visitado
- Execution es Unstoppable (ignora TODA defensa)

```
Prioridades que Jailor BLOQUEA:
✓ P2: Roleblock, Control
✓ P3: Heal, Protect
✓ P5: Alert, Kills Visitors
✓ P6: Ataques
✓ P7: Investigación
✓ P8: Deception

Jailor es el HARD COUNTER de todos.
```

### **Transporter Chaos**

Transporter (P4) redirige TODO:
- Ataques
- Curaciones
- Investigaciones
- Roleblocks
- Incluso otros Transporters

```
Si hay 2 Transporters:
T1 swapea A↔B
T2 swapea B↔C

Resultado: A→B, B→C, C→A (rotación circular)
Sistema debe resolver TODOS los swaps antes de aplicar acciones.
```

---

## Tabla Resumen (Quick Reference)

| Priority | Categoría | Roles |
|----------|-----------|-------|
| 1 | JAIL | Jailor |
| 2 | BLOCK/CONTROL | Escort, Consort, Witch, Pirate |
| 3 | HEAL/PROTECT | Doctor, BG, Crusader, Survivor, Trapper, GA |
| 4 | TRANSPORT | Transporter |
| 5 | ALERT/PASSIVE | Veteran, Serial Killer, Medusa |
| 6 | ATTACKS | Mafia, Vigilante, SK, Arsonist, Werewolf, etc |
| 7 | INVESTIGATE | Sheriff, Investigator, Lookout, Tracker, Spy, etc |
| 8 | DECEPTION | Framer, Disguiser, Janitor, Forger, Blackmailer |

---

## Implementación en Código

```typescript
// backend/src/services/NightResolver.ts

async function resolveNightActions(gameId: string, night: number) {
  // Obtener TODAS las acciones locked
  const actions = await prisma.gameAction.findMany({
    where: {
      gameId,
      night,
      status: 'LOCKED'
    },
    include: {
      sourcePlayer: true,
      targetPlayer: true
    }
  });
  
  // Agrupar por prioridad
  const actionsByPriority = groupBy(actions, 'priority');
  
  // Resolver en orden 1-8
  for (let priority = 1; priority <= 8; priority++) {
    const actionsAtThisPriority = actionsByPriority[priority] || [];
    
    // Resolver todas las acciones de esta prioridad
    for (const action of actionsAtThisPriority) {
      await resolveAction(action);
    }
  }
  
  // Generar resultados
  await generateNightResults(gameId, night);
}

function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((acc, item) => {
    const group = String(item[key]);
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}
```

---

## Verificación de Prioridades

Cuando añadas un rol nuevo, verifica:

1. ✅ ¿Bloquea otras acciones? → P1-2
2. ✅ ¿Previene muerte? → P3
3. ✅ ¿Redirige acciones? → P4
4. ✅ ¿Es habilidad pasiva? → P5
5. ✅ ¿Es ataque directo? → P6
6. ✅ ¿Es investigación? → P7
7. ✅ ¿Es engaño/ocultación? → P8

---

**Última actualización**: Febrero 2026  
**Total de roles con prioridad**: 45+ roles  
**Sistema de resolución**: ✅ Completo y balanceado