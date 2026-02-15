# 🎮 GAME MODES - Modos de Juego y Configuraciones

## 📋 Índice
- [Modos de Juego](#modos-de-juego)
- [Role Lists por Modo](#role-lists-por-modo)
- [Sistema de Slots](#sistema-de-slots)
- [Configuraciones Específicas](#configuraciones-específicas)

---

## Modos de Juego

### **1. CLASSIC (4-15 jugadores)**

El modo clásico de Town of Salem.

**Configuración:**
```typescript
{
  minPlayers: 4,
  maxPlayers: 15,
  dayDuration: 300,      // 5 minutos
  nightDuration: 60,     // 1 minuto
  votingDuration: 90,    // 1.5 minutos
  discussionTime: 30,    // Defensa en juicio
  
  roleList: [
    // Se genera según número de jugadores
  ],
  
  features: {
    whispers: true,
    wills: true,
    deathNotes: true,
    jailorExecution: true,
  }
}
```

**Role Lists por Número de Jugadores:**

#### **4 Jugadores (Mínimo)**
```
1. Sheriff
2. Mafioso
3. Executioner
4. Random Town
```

#### **7 Jugadores**
```
1. Jailor
2. Town Investigative
3. Town Protective
4. Town Killing
5. Godfather
6. Random Mafia
7. Neutral Evil
```

#### **10 Jugadores**
```
1. Jailor
2. Town Investigative
3. Town Investigative
4. Town Protective
5. Town Killing
6. Town Support
7. Godfather
8. Mafioso
9. Random Mafia
10. Neutral Killing
```

#### **15 Jugadores (Clásico Completo)**
```
1. Jailor
2. Town Investigative
3. Town Investigative
4. Town Protective
5. Town Protective
6. Town Killing
7. Town Support
8. Town Support
9. Random Town
10. Godfather
11. Mafioso
12. Random Mafia
13. Random Mafia
14. Neutral Evil
15. Neutral Killing
```

---

### **2. RANKED PRACTICE (10-15 jugadores)**

Modo competitivo con role list fija balanceada.

**Role List (15 jugadores):**
```
1. Jailor
2. Town Investigative
3. Town Killing
4. Town Protective
5. Town Support
6. Town Support
7. Random Town
8. Random Town
9. Random Town
10. Godfather
11. Mafioso
12. Random Mafia
13. Neutral Killing
14. Neutral Evil
15. Neutral Benign/Chaos
```

**Configuración:**
```typescript
{
  minPlayers: 10,
  maxPlayers: 15,
  dayDuration: 180,     // 3 minutos (más rápido)
  nightDuration: 45,    // 45 segundos
  votingDuration: 60,   // 1 minuto
  
  features: {
    whispers: true,
    wills: true,
    deathNotes: true,
    jailorExecution: true,
  },
  
  restrictions: {
    duplicateRoles: false,    // No roles repetidos
    ensureBalance: true,      // Verificar balance Town/Mafia
  }
}
```

---

### **3. ALL ANY (4-15 jugadores)**

Roles completamente aleatorios. Cualquier cosa puede pasar.

**Role List:**
```
1-15: Any
```

**Posibles combinaciones locas:**
- 5 Godfathers
- 10 Jesters
- 8 Serial Killers
- 15 Mayors

**Configuración:**
```typescript
{
  minPlayers: 4,
  maxPlayers: 15,
  dayDuration: 300,
  nightDuration: 60,
  
  roleList: Array(playerCount).fill('Any'),
  
  features: {
    whispers: true,
    wills: true,
    deathNotes: true,
    allowDuplicateUniques: true,  // Permite múltiples Jailor, Mayor
  }
}
```

---

### **4. RAINBOW (15 jugadores)**

Cada slot es una categoría diferente.

**Role List:**
```
1. Town Investigative
2. Town Protective
3. Town Killing
4. Town Support
5. Town Government (Mayor/Jailor)
6. Random Town
7. Godfather
8. Mafioso
9. Mafia Deception
10. Mafia Support
11. Neutral Evil
12. Neutral Killing
13. Neutral Benign
14. Neutral Chaos
15. Random
```

---

### **5. DRACULA'S PALACE (Vampires vs Town)**

Modo especial con Vampires.

**Role List (15 jugadores):**
```
1. Vampire
2. Vampire
3. Vampire
4. Vampire
5-14. Random Town
15. Vampire Hunter
```

**Reglas especiales:**
- Vampires pueden convertir cada 2 noches
- Vampire Hunter detecta Vampires
- Si todos los Vampires mueren, Town gana

---

### **6. COVEN MODE (Coven vs Town)**

El Coven reemplaza a la Mafia. **Roles más poderosos**.

**Role List (15 jugadores):**
```
1. Jailor
2. Town Investigative
3. Town Investigative
4. Town Protective
5. Town Killing
6. Town Support
7. Town Support
8. Random Town
9. Random Town
10. Coven Leader (único)
11. Random Coven
12. Random Coven
13. Random Coven
14. Neutral Killing
15. Neutral Evil
```

**Coven Roles:**
- Coven Leader (único)
- Hex Master
- Poisoner
- Potion Master
- Medusa
- Necromancer

**Diferencias con Mafia:**
- Coven tiene el **Necronomicon** (libro mágico)
- Cuando hay solo 1 Coven, obtienen el libro
- El libro potencia sus habilidades
- No chat nocturno (usan el libro para coordinarse)

---

### **7. LOVERS MODE**

Modo especial con parejas.

**Configuración:**
```typescript
{
  roleList: ['Any'] * playerCount,
  
  specialRules: {
    lovers: true,  // Se asignan 2-3 parejas aleatorias
  }
}
```

**Reglas:**
- Al inicio, se forman parejas aleatorias
- Los lovers se conocen entre sí
- Si tu pareja muere, tú también mueres
- Pueden ser de diferentes facciones (drama!)

---

### **8. RAPID MODE (Partidas rápidas)**

Todo va más rápido.

**Configuración:**
```typescript
{
  minPlayers: 7,
  maxPlayers: 10,
  
  dayDuration: 120,     // 2 minutos
  nightDuration: 30,    // 30 segundos
  votingDuration: 45,   // 45 segundos
  discussionTime: 15,   // 15 segundos defensa
  
  roleList: [
    'Sheriff',
    'Doctor',
    'Vigilante',
    'Random Town',
    'Random Town',
    'Godfather',
    'Mafioso',
    'Random Mafia',
    'Serial Killer',
    'Jester'
  ]
}
```

---

### **9. CUSTOM MODE**

El host configura todo manualmente.

**Opciones disponibles:**
```typescript
interface CustomGameConfig {
  // Timers
  dayDuration: number;         // 60-600 segundos
  nightDuration: number;       // 30-180 segundos
  votingDuration: number;      // 30-180 segundos
  discussionTime: number;      // 15-60 segundos
  
  // Role List
  roleList: string[];          // Host elige cada slot
  
  // Features
  whispers: boolean;
  wills: boolean;
  deathNotes: boolean;
  jailorExecution: boolean;
  
  // Reglas
  allowDuplicateRoles: boolean;
  allowDuplicateUniques: boolean;
  dayOneLynching: boolean;     // Permitir ejecución D1
  
  // Victory conditions custom
  customWinConditions?: {
    townWinsAt?: number;       // Town gana al día X
    mafiaWinsAt?: number;
    drawAt?: number;           // Empate al día X
  };
}
```

---

## Sistema de Slots

### **Tipos de Slots**

```typescript
enum SlotType {
  // Roles específicos
  SPECIFIC_ROLE = 'Sheriff',
  
  // Categorías
  TOWN_INVESTIGATIVE = 'Town Investigative',
  TOWN_PROTECTIVE = 'Town Protective',
  TOWN_KILLING = 'Town Killing',
  TOWN_SUPPORT = 'Town Support',
  
  MAFIA_KILLING = 'Mafia Killing',
  MAFIA_DECEPTION = 'Mafia Deception',
  MAFIA_SUPPORT = 'Mafia Support',
  
  COVEN = 'Random Coven',
  
  NEUTRAL_EVIL = 'Neutral Evil',
  NEUTRAL_KILLING = 'Neutral Killing',
  NEUTRAL_BENIGN = 'Neutral Benign',
  NEUTRAL_CHAOS = 'Neutral Chaos',
  
  // Random
  RANDOM_TOWN = 'Random Town',
  RANDOM_MAFIA = 'Random Mafia',
  RANDOM_NEUTRAL = 'Random Neutral',
  RANDOM_COVEN = 'Random Coven',
  ANY = 'Any',
  
  // Especiales
  TOWN_GOVERNMENT = 'Town Government',  // Mayor o Jailor
  TOWN_POWER = 'Town Power',            // TI, TP, TK
  NEUTRAL_CHAOS_EVIL = 'Neutral Chaos/Evil',
}
```

### **Resolución de Slots**

```typescript
function resolveSlot(slotType: string, usedRoles: string[]): string {
  // Si es rol específico
  if (isSpecificRole(slotType)) {
    return slotType;
  }
  
  // Si es categoría, elegir rol aleatorio de esa categoría
  const availableRoles = getRolesByAlignment(slotType)
    .filter(role => !usedRoles.includes(role) || role.allowDuplicate);
  
  return randomChoice(availableRoles);
}

// Ejemplo:
resolveSlot('Town Investigative', [])
// Puede devolver: Sheriff, Investigator, Lookout, Spy, o Psychic

resolveSlot('Random Town', [])
// Puede devolver cualquier rol Town

resolveSlot('Any', [])
// Puede devolver literalmente cualquier rol
```

---

## Configuraciones Avanzadas

### **Balance Automático**

```typescript
function validateRoleList(roleList: string[]): ValidationResult {
  const resolved = roleList.map(slot => resolveSlot(slot, []));
  
  // Contar por facción
  const factions = {
    town: resolved.filter(r => getTownRoles().includes(r)).length,
    mafia: resolved.filter(r => getMafiaRoles().includes(r)).length,
    coven: resolved.filter(r => getCovenRoles().includes(r)).length,
    neutral: resolved.filter(r => getNeutralRoles().includes(r)).length,
  };
  
  // Reglas de balance
  const rules = {
    // Town debe ser 40-65%
    townBalance: factions.town / roleList.length >= 0.4 && 
                 factions.town / roleList.length <= 0.65,
    
    // Mafia/Coven debe ser 20-35%
    evilBalance: (factions.mafia + factions.coven) / roleList.length >= 0.2 &&
                 (factions.mafia + factions.coven) / roleList.length <= 0.35,
    
    // Debe haber un líder evil (Godfather o Coven Leader)
    hasLeader: resolved.includes('Godfather') || 
               resolved.includes('Coven Leader'),
    
    // No puede haber Mafia y Coven juntos
    noMixedEvil: !(factions.mafia > 0 && factions.coven > 0),
  };
  
  return {
    valid: Object.values(rules).every(r => r),
    rules,
    factions,
    warnings: generateWarnings(rules, factions),
  };
}
```

---

### **Role List Templates**

```typescript
const ROLE_LIST_TEMPLATES = {
  // 7 jugadores
  classic_7: [
    'Jailor',
    'Town Investigative',
    'Town Protective',
    'Town Killing',
    'Godfather',
    'Random Mafia',
    'Neutral Evil'
  ],
  
  // 10 jugadores
  classic_10: [
    'Jailor',
    'Town Investigative',
    'Town Investigative',
    'Town Protective',
    'Town Killing',
    'Town Support',
    'Godfather',
    'Mafioso',
    'Random Mafia',
    'Neutral Killing'
  ],
  
  // 15 jugadores - Classic
  classic_15: [
    'Jailor',
    'Town Investigative',
    'Town Investigative',
    'Town Protective',
    'Town Protective',
    'Town Killing',
    'Town Support',
    'Town Support',
    'Random Town',
    'Godfather',
    'Mafioso',
    'Random Mafia',
    'Random Mafia',
    'Neutral Evil',
    'Neutral Killing'
  ],
  
  // 15 jugadores - Coven
  coven_15: [
    'Jailor',
    'Town Investigative',
    'Town Investigative',
    'Town Protective',
    'Town Killing',
    'Town Support',
    'Town Support',
    'Random Town',
    'Random Town',
    'Coven Leader',
    'Random Coven',
    'Random Coven',
    'Random Coven',
    'Neutral Killing',
    'Neutral Evil'
  ],
  
  // Chaos
  all_any_15: Array(15).fill('Any'),
  
  // Solo killers
  killers_10: [
    'Vigilante',
    'Vigilante',
    'Veteran',
    'Vampire Hunter',
    'Random Town',
    'Godfather',
    'Mafioso',
    'Ambusher',
    'Serial Killer',
    'Arsonist'
  ],
};
```

---

### **Preset Configurations**

```typescript
const GAME_PRESETS = {
  beginner: {
    name: 'Principiantes',
    description: 'Roles simples para aprender',
    minPlayers: 7,
    maxPlayers: 10,
    dayDuration: 420,     // 7 minutos (más tiempo)
    nightDuration: 90,    // 1.5 minutos
    roleList: [
      'Sheriff',          // EASY
      'Doctor',           // EASY
      'Vigilante',        // Visible cuando dispara
      'Mayor',            // EASY
      'Escort',
      'Godfather',        // EASY
      'Mafioso',          // EASY
      'Framer',
      'Jester',
      'Survivor'
    ],
    features: {
      roleRevealOnDeath: true,  // Mostrar rol al morir
      hints: true,              // Tips durante juego
    }
  },
  
  intermediate: {
    name: 'Intermedio',
    description: 'Mix de roles fáciles y medios',
    minPlayers: 10,
    maxPlayers: 15,
    roleList: ROLE_LIST_TEMPLATES.classic_15,
  },
  
  expert: {
    name: 'Experto',
    description: 'Roles complejos, tiempos cortos',
    minPlayers: 10,
    maxPlayers: 15,
    dayDuration: 180,
    nightDuration: 45,
    roleList: [
      'Jailor',           // EXPERT
      'Spy',              // HARD
      'Lookout',          // Mucha info
      'Crusader',         // Puede matar Town
      'Transporter',      // EXPERT
      'Retributionist',   // EXPERT
      'Mayor',
      'Random Town',
      'Random Town',
      'Godfather',
      'Janitor',          // HARD
      'Disguiser',        // HARD
      'Blackmailer',
      'Witch',            // EXPERT
      'Serial Killer'
    ]
  },
  
  chaos: {
    name: 'Caos Total',
    description: 'Todo puede pasar',
    minPlayers: 4,
    maxPlayers: 15,
    roleList: ROLE_LIST_TEMPLATES.all_any_15,
    features: {
      allowDuplicateUniques: true,
      hideRoleList: true,  // No mostrar lista al inicio
    }
  },
};
```

---

## Reglas Especiales por Modo

### **Classic Mode**
- Role list visible al inicio
- Wills y death notes habilitados
- Jailor puede ejecutar (3 veces)
- Día 1 NO se puede ejecutar (solo votar guilty sin efecto)

### **Ranked Mode**
- Role list fija
- No duplicate roles (excepto Random slots)
- Penalización por abandonar
- Stats cuentan para ELO

### **All Any**
- Nadie sabe qué roles hay
- Pueden haber múltiples del mismo rol
- Máximo caos

### **Coven Mode**
- Necronomicon se activa cuando queda 1 Coven
- Coven no tiene chat nocturno directo
- Investigator results diferentes
- Coven roles más poderosos que Mafia

### **Lovers Mode**
- Parejas se forman al inicio
- Si uno muere, el otro también
- Pueden ser de facciones enemigas
- Ganan juntos o pierden juntos

---

## Implementación del Sistema

```typescript
interface GameMode {
  id: string;
  name: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  
  // Timers
  dayDuration: number;
  nightDuration: number;
  votingDuration: number;
  discussionTime: number;
  
  // Role list
  getRoleList: (playerCount: number) => string[];
  
  // Features
  features: {
    whispers: boolean;
    wills: boolean;
    deathNotes: boolean;
    jailorExecution: boolean;
    dayOneLynching: boolean;
    roleRevealOnDeath: boolean;
    allowDuplicateRoles: boolean;
    allowDuplicateUniques: boolean;
  };
  
  // Reglas especiales
  specialRules?: {
    necronomicon?: boolean;     // Coven mode
    vampires?: boolean;          // Vampire mode
    lovers?: boolean;            // Lovers mode
    hideRoleList?: boolean;      // All Any
  };
}

// Uso:
const game = await createGame({
  mode: 'classic',
  playerCount: 10,
});

// El sistema automáticamente:
// 1. Genera role list apropiada
// 2. Configura timers
// 3. Habilita features correctas
// 4. Aplica reglas especiales
```

---

**Última actualización**: Febrero 2026
