# ⚙️ CONFIGURACIONES DE PARTIDA - 4 a 15 Jugadores

## 📋 Índice
- [Configuraciones por Número de Jugadores](#configuraciones-por-número-de-jugadores)
- [Balance y Probabilidades de Victoria](#balance-y-probabilidades-de-victoria)
- [Role Lists Detalladas](#role-lists-detalladas)

---

## Principios de Balance

### **Proporciones Recomendadas**

```
Town:    50-60% de los jugadores
Mafia:   25-33% de los jugadores
Neutral: 10-20% de los jugadores

Fórmulas:
- Town = ceil(jugadores * 0.5)
- Mafia = ceil(jugadores * 0.27)
- Neutral = jugadores - Town - Mafia
```

---

## Configuraciones por Número de Jugadores

### **IMPORTANTE: Sistema de Slots**

Las configuraciones usan **slots de grupos** en lugar de roles específicos:
- **Rol Específico**: "Jailor" - Siempre será Jailor
- **Grupo**: "Town Investigative" - Puede ser Sheriff, Investigator, Lookout, Spy, Psychic o Tracker
- **Random Town**: Cualquier rol Town
- **Any**: Cualquier rol del juego

---

### **4 JUGADORES (Mínimo Absoluto)**

**Role List:**
```
1. Town Investigative    (Sheriff, Investigator, Lookout, Spy, Psychic, Tracker)
2. Town Protective       (Doctor, Bodyguard, Crusader, Trapper)
3. Mafioso              (Específico - único Mafia)
4. Neutral Evil         (Jester, Executioner, Witch)
```

**Balance:**
- Town: 2 (50%)
- Mafia: 1 (25%)
- Neutral: 1 (25%)

**Duración estimada:** 5-10 minutos

**Notas:**
- Sin Godfather (solo 1 Mafia)
- Muy rápido, ideal para tutorial
- Neutral puede decidir ganador

---

### **5 JUGADORES**

**Role List:**
```
1. Town Investigative
2. Town Protective
3. Town Killing         (Vigilante, Veteran, Vampire Hunter)
4. Mafioso
5. Neutral Benign       (Survivor, Amnesiac, Guardian Angel)
```

**Balance:**
- Town: 3 (60%)
- Mafia: 1 (20%)
- Neutral: 1 (20%)

**Duración estimada:** 8-12 minutos

---

### **6 JUGADORES**

**Role List:**
```
1. Town Investigative
2. Town Protective
3. Town Killing
4. Godfather           (Específico - líder Mafia OBLIGATORIO)
5. Mafioso
6. Neutral Evil
```

**Balance:**
- Town: 3 (50%)
- Mafia: 2 (33%)
- Neutral: 1 (17%)

**Duración estimada:** 10-15 minutos

**Notas:**
- Primera config con Godfather (obligatorio cuando hay 2+ Mafia)

---

### **7 JUGADORES (Mínimo Recomendado)**

**Role List Classic:**
```
1. Jailor              (Específico - ÚNICO, rol clave de Town)
2. Town Investigative
3. Town Protective
4. Town Killing
5. Godfather           (Específico - OBLIGATORIO)
6. Mafia Support       (Consigliere, Consort, Blackmailer)
7. Neutral Evil
```

**Balance:**
- Town: 4 (57%)
- Mafia: 2 (29%)
- Neutral: 1 (14%)

**Duración estimada:** 15-20 minutos

**Probabilidad de victoria:**
- Town: 55%
- Mafia: 35%
- Neutral: 10%

---

### **8 JUGADORES**

**Role List:**
```
1. Jailor              (Específico)
2. Town Investigative
3. Town Protective
4. Town Support        (Escort, Medium, Mayor, Retributionist, Transporter)
5. Godfather           (Específico)
6. Mafioso
7. Mafia Deception     (Disguiser, Forger, Framer, Hypnotist, Janitor)
8. Neutral Evil
```

**Balance:**
- Town: 4 (50%)
- Mafia: 3 (37.5%)
- Neutral: 1 (12.5%)

**Duración estimada:** 18-25 minutos

---

### **9 JUGADORES**

**Role List:**
```
1. Jailor              (Específico)
2. Town Investigative
3. Town Investigative  (2 roles investigativos)
4. Town Protective
5. Town Support
6. Godfather           (Específico)
7. Mafioso
8. Random Mafia        (Cualquier rol Mafia excepto Godfather)
9. Neutral Killing     (Serial Killer, Arsonist, Werewolf, Juggernaut, Plaguebearer)
```

**Balance:**
- Town: 5 (55.5%)
- Mafia: 3 (33%)
- Neutral: 1 (11.5%)

**Duración estimada:** 20-30 minutos

**Notas:**
- Neutral Killing cambia dinámicas (puede matar Town y Mafia)

---

### **10 JUGADORES**

**Role List Classic:**
```
1. Jailor              (Específico)
2. Town Investigative
3. Town Investigative
4. Town Protective
5. Town Protective     (2 protectores)
6. Town Killing
7. Godfather           (Específico)
8. Mafioso
9. Random Mafia
10. Neutral Killing
```

**Balance:**
- Town: 6 (60%)
- Mafia: 3 (30%)
- Neutral: 1 (10%)

**Duración estimada:** 25-35 minutos

**Probabilidad de victoria:**
- Town: 50%
- Mafia: 32%
- Neutral Killing: 18%

---

### **11 JUGADORES**

**Role List:**
```
1. Jailor              (Específico)
2. Town Investigative
3. Town Investigative
4. Town Protective
5. Town Killing
6. Town Support
7. Random Town         (Cualquier rol Town)
8. Godfather           (Específico)
9. Mafioso
10. Random Mafia
11. Neutral Evil
```

**Balance:**
- Town: 7 (63.6%)
- Mafia: 3 (27.3%)
- Neutral: 1 (9.1%)

**Duración estimada:** 25-35 minutos

---

### **12 JUGADORES**

**Role List:**
```
1. Jailor              (Específico)
2. Town Investigative
3. Town Investigative
4. Town Protective
5. Town Protective
6. Town Killing
7. Town Support
8. Godfather           (Específico)
9. Mafioso
10. Random Mafia
11. Random Mafia       (4 Mafia total)
12. Neutral Evil
```

**Balance:**
- Town: 7 (58.3%)
- Mafia: 4 (33.3%)
- Neutral: 1 (8.3%)

**Duración estimada:** 30-40 minutos

**Notas:**
- 4 Mafia = poder significativo
- Crucial tener buenos investigadores

---

### **13 JUGADORES**

**Role List:**
```
1. Jailor              (Específico)
2. Town Investigative
3. Town Investigative
4. Town Investigative  (3 investigadores)
5. Town Protective
6. Town Killing
7. Town Support
8. Town Support
9. Godfather           (Específico)
10. Mafioso
11. Random Mafia
12. Random Mafia
13. Neutral Killing
```

**Balance:**
- Town: 8 (61.5%)
- Mafia: 4 (30.8%)
- Neutral: 1 (7.7%)

**Duración estimada:** 30-45 minutos

---

### **14 JUGADORES**

**Role List:**
```
1. Jailor              (Específico)
2. Town Investigative
3. Town Investigative
4. Town Protective
5. Town Protective
6. Town Protective     (3 protectores)
7. Town Killing
8. Town Support
9. Random Town
10. Godfather          (Específico)
11. Mafioso
12. Random Mafia
13. Random Mafia
14. Neutral Chaos      (Pirate, Vampire, Plaguebearer)
```

**Balance:**
- Town: 9 (64.3%)
- Mafia: 4 (28.6%)
- Neutral: 1 (7.1%)

**Duración estimada:** 35-50 minutos

---

### **15 JUGADORES (Classic Completo)**

**Role List Classic:**
```
1. Jailor              (Específico - ÚNICO)
2. Town Investigative
3. Town Investigative
4. Town Protective
5. Town Protective
6. Town Killing
7. Town Support
8. Town Support
9. Random Town
10. Godfather          (Específico - ÚNICO)
11. Mafioso
12. Random Mafia
13. Random Mafia
14. Neutral Evil
15. Neutral Killing
```

**Balance:**
- Town: 9 (60%)
- Mafia: 4 (26.7%)
- Neutral: 2 (13.3%)

**Duración estimada:** 35-50 minutos

**Probabilidad de victoria:**
- Town: 48%
- Mafia: 32%
- Neutral Evil: 8%
- Neutral Killing: 12%

**Notas:**
- Configuración clásica estándar de Town of Salem
- Muy balanceada
- Múltiples estrategias posibles

---

## Sistema de Slots Detallado

### **Tipos de Slots**

```typescript
enum SlotType {
  // ROLES ESPECÍFICOS (siempre el mismo rol)
  JAILOR = "Jailor",               // ÚNICO - rol clave Town
  GODFATHER = "Godfather",         // ÚNICO - líder Mafia (obligatorio si 2+ Mafia)
  MAFIOSO = "Mafioso",             // Ejecutor Mafia
  MAYOR = "Mayor",                 // ÚNICO - voto triple
  
  // GRUPOS DE ROLES (aleatorio dentro del grupo)
  TOWN_INVESTIGATIVE = "Town Investigative",
  TOWN_PROTECTIVE = "Town Protective",
  TOWN_KILLING = "Town Killing",
  TOWN_SUPPORT = "Town Support",
  
  MAFIA_KILLING = "Mafia Killing",
  MAFIA_DECEPTION = "Mafia Deception",
  MAFIA_SUPPORT = "Mafia Support",
  
  NEUTRAL_EVIL = "Neutral Evil",
  NEUTRAL_KILLING = "Neutral Killing",
  NEUTRAL_BENIGN = "Neutral Benign",
  NEUTRAL_CHAOS = "Neutral Chaos",
  
  // RANDOMS (muy amplios)
  RANDOM_TOWN = "Random Town",     // Cualquier Town
  RANDOM_MAFIA = "Random Mafia",   // Cualquier Mafia (excepto GF si ya hay uno)
  RANDOM_NEUTRAL = "Random Neutral",
  ANY = "Any"                      // Literalmente cualquier rol
}
```

### **Roles por Grupo**

```typescript
const ROLE_GROUPS = {
  "Town Investigative": [
    "Sheriff",
    "Investigator", 
    "Lookout",
    "Spy",
    "Psychic",
    "Tracker"
  ],
  
  "Town Protective": [
    "Doctor",
    "Bodyguard",
    "Crusader",
    "Trapper"
  ],
  
  "Town Killing": [
    "Vigilante",
    "Veteran",
    "Vampire Hunter"
  ],
  
  "Town Support": [
    "Escort",
    "Mayor",        // ÚNICO
    "Medium",
    "Retributionist",
    "Transporter"
  ],
  
  "Mafia Killing": [
    "Godfather",    // ÚNICO
    "Mafioso",
    "Ambusher"
  ],
  
  "Mafia Deception": [
    "Disguiser",
    "Forger",
    "Framer",
    "Hypnotist",
    "Janitor"
  ],
  
  "Mafia Support": [
    "Blackmailer",
    "Consigliere",
    "Consort"
  ],
  
  "Neutral Evil": [
    "Executioner",
    "Jester",
    "Witch"
  ],
  
  "Neutral Killing": [
    "Serial Killer",
    "Arsonist",
    "Werewolf",
    "Juggernaut",
    "Plaguebearer"  // Se transforma en Pestilence
  ],
  
  "Neutral Benign": [
    "Survivor",
    "Amnesiac",
    "Guardian Angel"
  ],
  
  "Neutral Chaos": [
    "Pirate",
    "Vampire",
    "Plaguebearer"
  ]
};
```

### **Reglas de Asignación**

```typescript
// Reglas al resolver slots
const ASSIGNMENT_RULES = {
  // Si hay 2+ Mafia, uno DEBE ser Godfather
  mafiaRequiresGodfather: (mafiaCount: number) => mafiaCount >= 2,
  
  // Roles únicos solo pueden aparecer 1 vez
  uniqueRoles: ["Jailor", "Mayor", "Godfather"],
  
  // Si hay slot "Random Mafia" y no hay Godfather, puede salir GF
  randomMafiaCanBeGodfather: true,
  
  // Prioridad de asignación
  assignmentOrder: [
    "SPECIFIC_ROLES",    // Primero roles específicos (Jailor, Godfather)
    "UNIQUE_SLOTS",      // Luego slots que requieren únicos
    "GROUP_SLOTS",       // Grupos normales
    "RANDOM_SLOTS"       // Por último, randoms
  ]
};
```

---

## Resolución de Slots (Algoritmo)

```typescript
// backend/src/services/roleAssignment.ts

async function resolveRoleList(
  roleList: string[],
  playerCount: number
): Promise<string[]> {
  const resolvedRoles: string[] = [];
  const usedUniqueRoles: Set<string> = new Set();
  
  // 1. Verificar si hay Godfather explícito
  const hasExplicitGodfather = roleList.includes("Godfather");
  const mafiaCount = roleList.filter(slot => 
    slot.includes("Mafia") || slot === "Godfather"
  ).length;
  
  // 2. Procesar cada slot
  for (const slot of roleList) {
    // Rol específico
    if (isSpecificRole(slot)) {
      resolvedRoles.push(slot);
      if (isUniqueRole(slot)) {
        usedUniqueRoles.add(slot);
      }
      continue;
    }
    
    // Grupo de roles
    if (isRoleGroup(slot)) {
      const availableRoles = ROLE_GROUPS[slot].filter(role => 
        !usedUniqueRoles.has(role)
      );
      
      const chosen = randomChoice(availableRoles);
      resolvedRoles.push(chosen);
      
      if (isUniqueRole(chosen)) {
        usedUniqueRoles.add(chosen);
      }
      continue;
    }
    
    // Random Mafia
    if (slot === "Random Mafia") {
      // Si no hay Godfather y hay 2+ Mafia, forzar Godfather en primer Random Mafia
      if (!hasExplicitGodfather && 
          mafiaCount >= 2 && 
          !usedUniqueRoles.has("Godfather")) {
        resolvedRoles.push("Godfather");
        usedUniqueRoles.add("Godfather");
        continue;
      }
      
      // Si no, rol Mafia aleatorio
      const mafiaRoles = [
        ...ROLE_GROUPS["Mafia Killing"],
        ...ROLE_GROUPS["Mafia Deception"],
        ...ROLE_GROUPS["Mafia Support"]
      ].filter(role => !usedUniqueRoles.has(role));
      
      const chosen = randomChoice(mafiaRoles);
      resolvedRoles.push(chosen);
      
      if (isUniqueRole(chosen)) {
        usedUniqueRoles.add(chosen);
      }
      continue;
    }
    
    // Random Town
    if (slot === "Random Town") {
      const townRoles = [
        ...ROLE_GROUPS["Town Investigative"],
        ...ROLE_GROUPS["Town Protective"],
        ...ROLE_GROUPS["Town Killing"],
        ...ROLE_GROUPS["Town Support"]
      ].filter(role => !usedUniqueRoles.has(role));
      
      const chosen = randomChoice(townRoles);
      resolvedRoles.push(chosen);
      
      if (isUniqueRole(chosen)) {
        usedUniqueRoles.add(chosen);
      }
      continue;
    }
    
    // Any (cualquier rol)
    if (slot === "Any") {
      const allRoles = getAllRoles().filter(role => 
        !usedUniqueRoles.has(role)
      );
      
      const chosen = randomChoice(allRoles);
      resolvedRoles.push(chosen);
      
      if (isUniqueRole(chosen)) {
        usedUniqueRoles.add(chosen);
      }
      continue;
    }
  }
  
  return resolvedRoles;
}

function isSpecificRole(slot: string): boolean {
  return ["Jailor", "Godfather", "Mafioso", "Mayor"].includes(slot);
}

function isRoleGroup(slot: string): boolean {
  return slot in ROLE_GROUPS;
}

function isUniqueRole(role: string): boolean {
  return ["Jailor", "Mayor", "Godfather"].includes(role);
}

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getAllRoles(): string[] {
  return Object.values(ROLE_GROUPS).flat();
}
```

---

## Variantes de Modo

### **Modo Coven (15 jugadores)**

```
1. Jailor              (Específico)
2. Town Investigative
3. Town Investigative
4. Town Protective
5. Town Killing
6. Town Support
7. Town Support
8. Random Town
9. Random Town
10. Coven Leader       (Específico - ÚNICO, reemplaza Godfather)
11. Random Coven       (Hex Master, Medusa, Necromancer, Poisoner, Potion Master)
12. Random Coven
13. Random Coven
14. Neutral Killing
15. Neutral Evil
```

**Notas Coven:**
- Coven Leader es obligatorio (como Godfather)
- Roles Coven más poderosos que Mafia
- Necronomicon cuando queda 1 Coven
- Sin chat nocturno (usan libro)

### **Modo All Any (4-15 jugadores)**

```
1-15: Any
```

**Reglas especiales:**
- NO hay límite de roles únicos (pueden haber 5 Jailors)
- Completamente aleatorio
- Puede salir 15 Jesters
- Máximo caos

### **Modo Rainbow (15 jugadores)**

```
1. Town Investigative
2. Town Protective
3. Town Killing
4. Town Support
5. Town Government     (Jailor o Mayor)
6. Random Town
7. Godfather           (Específico)
8. Mafioso
9. Mafia Deception
10. Mafia Support
11. Neutral Evil
12. Neutral Killing
13. Neutral Benign
14. Neutral Chaos
15. Any
```

**Nota:** Cada slot es una categoría diferente.

---

## Configuración en Base de Datos

```prisma
model GameConfig {
  id              String   @id @default(cuid())
  playerCount     Int      // 4-15
  mode            String   // "classic", "coven", "all-any", "rainbow"
  
  // Role list con SLOTS (no roles resueltos)
  roleSlots       String[] 
  // Ejemplo: ["Jailor", "Town Investigative", "Random Mafia", "Neutral Evil"]
  
  // Roles resueltos (se genera al iniciar partida)
  resolvedRoles   String[]?
  // Ejemplo: ["Jailor", "Sheriff", "Consigliere", "Jester"]
  
  // Metadata
  createdAt       DateTime @default(now())
}
```

### **Seed de Configuraciones**

```typescript
const GAME_CONFIGS = [
  {
    playerCount: 7,
    mode: "classic",
    roleSlots: [
      "Jailor",
      "Town Investigative",
      "Town Protective",
      "Town Killing",
      "Godfather",
      "Mafia Support",
      "Neutral Evil"
    ]
  },
  
  {
    playerCount: 10,
    mode: "classic",
    roleSlots: [
      "Jailor",
      "Town Investigative",
      "Town Investigative",
      "Town Protective",
      "Town Protective",
      "Town Killing",
      "Godfather",
      "Mafioso",
      "Random Mafia",
      "Neutral Killing"
    ]
  },
  
  {
    playerCount: 15,
    mode: "classic",
    roleSlots: [
      "Jailor",
      "Town Investigative",
      "Town Investigative",
      "Town Protective",
      "Town Protective",
      "Town Killing",
      "Town Support",
      "Town Support",
      "Random Town",
      "Godfather",
      "Mafioso",
      "Random Mafia",
      "Random Mafia",
      "Neutral Evil",
      "Neutral Killing"
    ]
  },
  
  {
    playerCount: 15,
    mode: "all-any",
    roleSlots: Array(15).fill("Any")
  }
];
```

---

**Última actualización**: Febrero 2026
