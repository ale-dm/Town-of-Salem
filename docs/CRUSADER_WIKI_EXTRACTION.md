# Crusader - Información Extraída de Wiki

**Fuente**: https://town-of-salem.fandom.com/wiki/Crusader_(ToS)  
**Fecha Extracción**: 16 Febrero 2026  
**Estado**: ✅ Estrategias implementadas en seed.js

---

## 📊 Mecánicas Oficiales

### Información Básica
- **Alignment**: Town Protective
- **Attack**: None (auto) / Basic (a visitantes)
- **Defense**: None
- **Priority**: 3 (mismo que otros protectivos)
- **Unique**: No
- **Difficulty**: Hard

### Habilidades
**Acción Nocturna**: Proteger a otra persona (no puede protegerse a sí mismo)

**Efectos de Protección:**
- Otorga **Defensa Poderosa** (Powerful Defense) al objetivo
- Mata a **UN visitante ALEATORIO** con Ataque Básico
- El ataque a visitante ocurre **SIEMPRE**, incluso si el objetivo no fue atacado
- **NO ataca Vampiros** (pero bloquea su conversión)
- **NO ataca visitantes Astrales** (incluyendo Hex Master atacante)
- La protección **NO cura Veneno** (Poison)

**Notificaciones:**
- Crusader ve: "¡Tu objetivo fue atacado anoche!" (si target fue atacado)
- Crusader ve: "Atacaste a alguien que visitó tu objetivo!" (cuando mata visitante)
- Objetivo ve: "You were attacked but someone protected you!" (si fue atacado)
- Visitante muerto ve: "You were attacked by a Crusader!"
- Muerte pública: "(S)He was killed by a Crusader."

### Investigaciones
**Sheriff**: "Not Suspicious"  
**Investigator**: "Bodyguard, Godfather, Arsonist, or Crusader"  
**Consigliere**: "Your target is a divine protector. They must be a Crusader."

---

## 🎯 Estrategias de Wiki (10 Tips Implementados)

### 1. Early Game - Evitar Proteger
**Fase**: NIGHT | **Días**: 1-3  
**Tip**: "NO protejas early game: alto riesgo de matar Town aliados. Solo protege si mayoría son evils."

**Explicación Wiki**:
- High chance de matar fellow Townies early
- Excepción: si mayoría son evils (como en Coven Custom)

---

### 2. TP/LO Requests - Cuidado con Bait
**Fase**: NIGHT | **Días**: 1-99  
**Tip**: "Si alguien pide 'TP/LO': CUIDADO, puede haber otro TP. Solo protege si piden 'Crusader' específicamente. Watch Medusa bait D1."

**Explicación Wiki**:
- No proteger "TP/LO" request (matarás a otro TP)
- Solo proteger "Crusader request"
- Watch out: Medusa claims Crusader D1 como bait

---

### 3. Mayor Revelado - Target Prioritario
**Fase**: NIGHT | **Días**: 2-99  
**Tip**: "Mayor revelado: Protege CADA noche sin límite (a diferencia de Doctor). Matarás Blackmailers, Hex Masters, Pirates visitantes."

**Explicación Wiki**:
- A diferencia de Doctor, Crusader puede proteger Mayor CADA noche sin límite
- Matarás Blackmailers, Hex Masters, Pirates visitantes
- NO atacas Vampiros pero bloqueas su conversión
- **IMPORTANTE**: Asegúrate de ser único TP o declara públicamente (si no, matarás Lookout/BG/otro Crusader)

---

### 4. Confirmed Townies - Target Selection
**Fase**: NIGHT | **Días**: 1-99  
**Tip**: "Protege Townies confirmados con BAJA posibilidad de Lookout. Si otro TP los visita, lo matarás (coordina primero)."

**Explicación Wiki**:
- Proteger Townies confirmados con poca razón de ser visitados por otros Town
- Riesgo: matar otro TP que tuvo la misma idea

---

### 5. Coordinación Crusaders - Evitar Friendly Fire
**Fase**: DAY | **Días**: 1-99  
**Tip**: "Coordina con otros Crusaders: NUNCA ambos protejan mismo target (se matarán entre sí). Susurra quién protegerás."

**Explicación Wiki**:
- Si 2 Crusaders protegen mismo target → se matan entre sí
- Susurrar para coordinar
- En VIP mode: 1st claim va a VIP, 2nd claim al 1st, 3rd claim al 2nd (chain protección)

---

### 6. Late Game - Proteger Siempre
**Fase**: NIGHT | **Días**: 5-99  
**Tip**: "Late game/evils mayoría: Protege CADA noche. Necesitas otro TP en ti para sobrevivir (no tienes vest)."

**Explicación Wiki**:
- En endgame o evils mayoría: proteger EVERY night
- Necesitas otro TP en ti (no tienes self-heal como BG/Doctor)
- Alta chance de matar evils visitando

---

### 7. Roleblock/Control Targets - Counter Evil Support
**Fase**: NIGHT | **Días**: 2-99  
**Tip**: "Target roleblocked/blackmailed repetidamente: Protégelo. Alta chance de matar Blackmailer/Consort/Coven Leader (aunque CL con Necronomicon sobrevive)."

**Explicación Wiki**:
- Si alguien es roleblocked/blackmailed/controlled repetidamente → protégelo
- Alta chance de matar Blackmailer/Consort/Coven Leader
- **Limitación**: Coven Leader con Necronomicon sobrevive (Basic Defense)
- También fallas contra roles con defense (Arsonist, Serial Killer cautious, etc.)

---

### 8. Dead Player Protection - Counter Janitor/Forger
**Fase**: NIGHT | **Días**: 1-99  
**Tip**: "Jugador que left el día anterior: Protégelo para matar Janitor/Forger/Ambusher visitando corpse (cuidado: Ambusher te mata si eres único visitante no-Mafia)."

**Explicación Wiki**:
- Proteger a quien murió ese día/noche → matar Janitor/Forger/Ambusher
- **CUIDADO**: Si Ambusher está allí y eres único visitante no-Mafia → mueres con otros visitantes

---

### 9. Doctor/Crusader Chain - Invulnerabilidad Mutua
**Fase**: GENERAL | **Días**: 1-99  
**Tip**: "Cadena con Doctor/otro Crusader: Mutua protección = casi invulnerables. Solo Arsonist rompe combo (elimínalos primero)."

**Explicación Wiki**:
- Crusader + Doctor = protección mutua → casi invulnerables
- Crusader + Crusader = también funciona (se protegen mutuamente)
- **NO funciona con BG**: porque no puedes mantener invulnerabilidad persistente (Astral Attacks o Ambusher rompen combo)
- **Único threat**: Arsonist (ignite masivo) → eliminar primero

---

### 10. No Self-Heal - Cuidado al Revelar
**Fase**: DAY | **Días**: 1-99  
**Tip**: "NO reveles temprano si no estás seguro de otros TPs (no tienes vest/self-heal como BG/Doctor). Eres vulnerable sin backup."

**Explicación Wiki**:
- A diferencia de BG (1 vest) y Doctor (self-heal 1x), Crusader NO tiene self-protection
- Ser cauteloso al revelar temprano
- Necesitas backup para sobrevivir

---

## 🎮 Mecánicas de Juego Avanzadas

### Protection Level
- **Powerful Defense** = nivel 2 (protege de Powerful Attacks)
- Igual que Doctor's heal
- Protege de Bodyguard counterattack
- Protege de Veteran/Medusa visitor kills
- **NO cura Poison** (importante diferencia con Doctor)

### Attack Mechanics
- **Basic Attack** = nivel 1 (mata roles sin defense)
- Selección **ALEATORIA** entre TODOS los visitantes
- Ocurre **INCLUSO si target no fue atacado**
- Ignora Vampires (no los ataca, pero bloquea conversión)
- Ignora Astral visitors (Hex Master, por ejemplo)

### Visitor Filtering
**SÍ ataca:**
- Town roles (Doctor, Lookout, Bodyguard, Sheriff, etc.)
- Mafia roles (Mafioso, Consigliere, Consort, Janitor, etc.)
- Neutral Killing (Serial Killer, Arsonist, Werewolf, etc.)
- Neutral Evil/Chaos (Witch, Executioner, Pirate, etc.)

**NO ataca:**
- Vampires (exclusión específica)
- Astral visitors (Hex Master siendo el más notable)

---

## 📝 Mensajes del Rol

### Implementados en seed.js

```javascript
messages: { 
  onStart: 'Eres un protector divino con habilidades de combate inigualables.',
  onProtectSuccess: 'Protegiste a tu objetivo de un ataque.',
  onKillVisitor: 'Atacaste a alguien que visitó tu objetivo.',
  onTargetAttacked: '¡Tu objetivo fue atacado anoche!'
}
```

### Mensajes Adicionales del Juego Original

**Al Crusader:**
- "Your target was attacked last night!" (cuando target atacado)
- "You attacked someone visiting your target!" (cuando mata visitante)

**Al Target Protegido:**
- "You were attacked but someone protected you!" 

**Al Visitante Muerto:**
- "You were attacked by a Crusader!"

**Death Message Público:**
- "(S)He was killed by a Crusader."
- "(S)He was also killed by a Crusader." (múltiples muertes)

---

## 🔧 Configuración Técnica en seed.js

```javascript
{
  nameEs: 'Cruzado',
  nameEn: 'Crusader',
  slug: 'crusader',
  factionId: townFaction.id,
  alignmentId: townProtective.id,
  attackValue: 1, // Basic attack a visitantes
  defenseValue: 0, // Sin defense propia
  actionPriority: 3, // Priority de protección
  attributes: ['Protection Killing'],
  nightActionType: 'PROTECT_VISITORS',
  abilityConfig: { 
    mustTarget: true, 
    canTargetSelf: false,
    targetMustBeAlive: true,
    attacksRandomVisitor: true,
    doesNotAttackVampires: true,
    doesNotAttackAstral: true,
    protectionLevel: 2 // Powerful Defense
  },
  specialInteractions: [
    { 
      trigger: 'TARGET_VISITED', 
      condition: 'PROTECTING', 
      effect: 'KILL_RANDOM_VISITOR',
      excludeRoles: ['vampire'],
      excludeAstral: true
    },
    {
      trigger: 'TARGET_ATTACKED',
      condition: 'PROTECTING',
      effect: 'GRANT_POWERFUL_DEFENSE'
    }
  ],
  strategyTips: [ /* 10 tips implementados */ ]
}
```

---

## 🎲 Interacciones Especiales

### vs Ambusher
- Si ambos visitan mismo target → trade (mutual kill)
- Fair trade: Mafia pierde killer > Town pierde TP
- **CUIDADO**: Si Ambusher + eres único visitante non-Mafia → mueres

### vs Medusa
- Crusader protege de Medusa stone gaze (Powerful Defense)
- Crusader NO mata Medusa (Astral visitor)
- **Warning**: Medusa claims "Crusader" D1 como bait

### vs Vampire
- Crusader NO ataca Vampires
- Crusader SÍ bloquea conversión (Powerful Defense)
- Vampire NO muere al visitar

### vs Coven Leader
- Crusader mata CL visitante (Basic Attack)
- **PERO**: CL con Necronomicon sobrevive (Basic Defense)
- CL drained target es protegido (Powerful Defense)

### vs Arsonist
- Crusader NO mata Arsonist visitante (Basic Defense)
- Arsonist Ignite MATA a Crusader (Unstoppable Attack)
- Arsonist es main threat para Doctor/Crusader chain

### vs Serial Killer
- Crusader mata SK visitante si SK en modo normal
- SK cautious tiene Basic Defense → sobrevive
- SK roleblocked que mata roleblocker: Crusader NO lo salva (priority issue)

---

## 📈 Stats y Balance

```javascript
difficulty: 'HARD',
expectedWinRate: 0.48,
implementationComplexity: 6,
popularity: 0.55
```

**Razón de Dificultad HARD:**
- Puede matar aliados fácilmente
- Requiere coordinación con otros TPs
- No self-heal = vulnerable
- Timing crucial (early game vs late game)
- Mecánicas complejas (Vampire/Astral exclusions)

---

## 🚀 Estado de Implementación

### ✅ Completado en seed.js
- [x] 10 estrategias de Wiki implementadas
- [x] Mecánicas actualizadas (Powerful Defense, exclusions)
- [x] Mensajes del rol
- [x] specialInteractions detalladas
- [x] abilityConfig completo

### ✅ Completado en gameEngine.js (16/02/2026)
- [x] Implementar case 'PROTECT_VISITORS' en gameEngine (priority 3)
- [x] Lógica de Powerful Defense (nivel 2)
- [x] Selección aleatoria de visitante
- [x] Exclusión de Vampires
- [x] Exclusión de Crusader mismo (no se mata a sí mismo)
- [x] Mensajes diferenciados (target attacked vs visitor killed)
- [x] Defense check para visitante (puede sobrevivir con defense)
- [x] Notificación al target cuando es protegido de ataque

### ⚠️ Testing Necesario
- [ ] Crusader protege y mata visitante aleatorio
- [ ] Powerful Defense bloquea Powerful Attacks
- [ ] NO ataca Vampires (cuando Vampire implementado)
- [ ] Mata Town allies (friendly fire)
- [ ] Crusader vs Ambusher trade
- [ ] Crusader vs Medusa (protege pero no mata - Astral)
- [ ] Crusader vs CL con Necronomicon (CL sobrevive)
- [ ] Doctor/Crusader chain invulnerability
- [ ] Visitante con Basic Defense sobrevive ataque de Crusader
- [ ] Múltiples visitantes: solo uno muere (random selection)

---

## 🔗 Referencias

**Wiki Original**: https://town-of-salem.fandom.com/wiki/Crusader_(ToS)  
**Secciones Consultadas**:
- Mechanics
- Strategy
- Messages
- Trivia
- Special Interactions

**Archivos Modificados**:
- `backend/prisma/seed.js` - Crusader role con 10 estrategias
- `docs/CRUSADER_WIKI_EXTRACTION.md` - Este documento

---

**Última Actualización**: 16 Febrero 2026  
**Estrategias**: ✅ 10/10 implementadas  
**Mecánicas**: ✅ IMPLEMENTADAS en gameEngine.js  
**Testing**: ⚠️ Pendiente
