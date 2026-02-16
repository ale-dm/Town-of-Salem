# TODO: Implementación Completa de Roles

## 📊 Estado General
- **Total de Roles en el Juego**: 50
- **Roles con Estrategias Completas**: 2 (Bodyguard, Crusader)
- **Roles Sin Estrategias**: 48
- **Roles con Implementación Mecánica**: 40 ✅ (+1 Crusader)
- **Roles Sin Implementación Mecánica**: 10 ⬇️ (era 11)

---

## 🎯 PRIORIDAD 1: Roles Core (Más Jugados)

### Town Investigative
- [ ] **Sheriff** - Implementado ✅ | Estrategias ❌
  - Mecánica: SHERIFF_CHECK completo
  - Necesita: Estrategias Wiki (cuándo investigar, patrones de votación)
  
- [ ] **Investigator** - Implementado ✅ | Estrategias ❌
  - Mecánica: INVESTIGATOR_CHECK completo
  - Necesita: Estrategias Wiki (análisis grupos, combinar con Sheriff)
  
- [ ] **Lookout** - Implementado ✅ | Estrategias ❌
  - Mecánica: LOOKOUT_WATCH completo
  - Necesita: Estrategias Wiki (proteger targets importantes, patrones Mafia)
  
- [ ] **Spy** - Implementado ✅ | Estrategias ❌
  - Mecánica: SPY_BUG completo
  - Necesita: Estrategias Wiki (rastrear visitas Mafia, identificar killing roles)

### Town Protective
- [x] **Bodyguard** - Implementado ✅ | Estrategias ✅
  - Mecánica: PROTECT completo
  - Estrategias: 8 tips de Wiki implementados
  
- [ ] **Doctor** - Implementado ✅ | Estrategias ❌
  - Mecánica: HEAL completo
  - Necesita: Estrategias Wiki (curar patterns, auto-heal timing, cadena con BG)
  
- [x] **Crusader** - ✅ **IMPLEMENTADO (16/02/2026)**
  - Mecánica: PROTECT_VISITORS ✅ **IMPLEMENTADO** en gameEngine
  - nightActionType: PROTECT_VISITORS
  - Estrategias: ✅ **10 tips de Wiki implementados**
  - Implementación: Powerful Defense + mata visitante aleatorio (excluye Vampiros)
  - Wiki extraída: CRUSADER_WIKI_EXTRACTION.md
  - Testing: ⚠️ Pendiente

### Town Killing
- [ ] **Vigilante** - Implementado ✅ | Estrategias ❌
  - Mecánica: KILL_SINGLE completo + suicidio por guilt
  - Necesita: Estrategias Wiki (cuándo disparar, evitar kills Town)
  
- [ ] **Veteran** - Implementado ✅ | Estrategias ❌
  - Mecánica: ALERT completo
  - Necesita: Estrategias Wiki (timing alertas, bait strategies)
  
- [ ] **Vampire Hunter** - ❌ **IMPLEMENTACIÓN INCOMPLETA**
  - Mecánica: nightActionType KILL_VAMPIRES no tiene case en gameEngine
  - Necesita: Implementar detección + kill vampiros
  - Necesita: Estrategias Wiki

### Town Support
- [ ] **Escort** - Implementado ✅ | Estrategias ❌
  - Mecánica: ROLEBLOCK completo
  - Necesita: Estrategias Wiki (bloquear suspects, identificar NK por reacción)
  
- [ ] **Mayor** - Implementado ✅ | Estrategias ❌
  - Mecánica: Pasivo (reveal + 3 votos)
  - Necesita: Estrategias Wiki (cuándo revelar, cuándo ocultarse)
  
- [ ] **Transporter** - Implementado ✅ | Estrategias ❌
  - Mecánica: TRANSPORT completo (dual target, priority 2)
  - Necesita: Estrategias Wiki (swap protector targets, confundir Mafia)
  
- [ ] **Medium** - Implementado ✅ | Estrategias ❌
  - Mecánica: SEANCE completo
  - Necesita: Estrategias Wiki (obtener info de muertos, coordinar Town)
  
- [ ] **Retributionist** - ❌ **IMPLEMENTACIÓN INCOMPLETA**
  - Mecánica: nightActionType RESURRECT no tiene case en gameEngine
  - Necesita: Implementar resurrección de corpse
  - Necesita: Estrategias Wiki

### Unique Town
- [ ] **Jailor** - Implementado ✅ | Estrategias ❌
  - Mecánica: JAIL + EXECUTE completo
  - Necesita: Estrategias Wiki (jail suspects, execute timing, no matar confirmados)

---

## 🔴 PRIORIDAD 2: Mafia (Core Gameplay)

### Mafia Killing
- [ ] **Godfather** - Implementado ✅ | Estrategias ❌
  - Mecánica: KILL_SINGLE + inmunidad detección
  - Necesita: Estrategias Wiki (target priority, claim strategies)
  
- [ ] **Mafioso** - Implementado ✅ | Estrategias ❌
  - Mecánica: KILL_SINGLE + promoción a GF
  - Usuario proveyó mecánica: ejecuta órdenes GF, promovido si GF muere
  - Necesita: Estrategias Wiki (seguir órdenes, prepararse para liderazgo)
  
- [ ] **Ambusher** - ❌ **IMPLEMENTACIÓN INCOMPLETA**
  - Mecánica: nightActionType AMBUSH no tiene case en gameEngine
  - Descripción: mata visitantes de un target
  - Necesita: Implementar mecánica AMBUSH
  - Necesita: Estrategias Wiki

### Mafia Support
- [ ] **Consigliere** - Implementado ✅ | Estrategias ❌
  - Mecánica: CONSIGLIERE_CHECK completo (ve rol exacto)
  - Necesita: Estrategias Wiki (priorizar targets, compartir info Mafia)
  
- [ ] **Consort** - Implementado ✅ | Estrategias ❌
  - Mecánica: ROLEBLOCK completo (mismo que Escort)
  - Necesita: Estrategias Wiki (bloquear TP/Jailor, coordinar con kills)
  
- [ ] **Blackmailer** - Implementado ✅ | Estrategias ❌
  - Mecánica: BLACKMAIL completo
  - Necesita: Estrategias Wiki (silenciar confirmados, leer whispers)

### Mafia Deception
- [ ] **Framer** - Implementado ✅ | Estrategias ❌
  - Mecánica: FRAME completo
  - Necesita: Estrategias Wiki (incriminar Town importantes)
  
- [ ] **Disguiser** - Implementado ✅ | Estrategias ❌
  - Mecánica: DISGUISE completo
  - Necesita: Estrategias Wiki (disfraz estratégico, death swap)
  
- [ ] **Forger** - Implementado ✅ | Estrategias ❌
  - Mecánica: FORGE completo (3 usos)
  - Necesita: Estrategias Wiki (falsificar wills, crear confusion)
  
- [ ] **Janitor** - Implementado ✅ | Estrategias ❌
  - Mecánica: CLEAN completo (3 usos)
  - Necesita: Estrategias Wiki (limpiar roles clave, timing)
  
- [ ] **Hypnotist** - Implementado ✅ | Estrategias ❌
  - Mecánica: HYPNOTIZE completo
  - Necesita: Estrategias Wiki (mensajes falsos efectivos)

---

## ⚫ PRIORIDAD 3: Neutral Killing (Alta Complejidad)

- [ ] **Serial Killer** - Implementado ✅ | Estrategias ❌
  - Mecánica: KILL_SINGLE + modos (normal/cautious) + mata roleblocker
  - Necesita: Estrategias Wiki (modos, claiming, sobrevivir)
  
- [ ] **Arsonist** - Implementado ✅ | Estrategias ❌
  - Mecánica: DOUSE + IGNITE completo
  - Necesita: Estrategias Wiki (douse patterns, ignite timing)
  
- [ ] **Werewolf** - Implementado ✅ | Estrategias ❌
  - Mecánica: KILL_RAMPAGE (cada 2 noches)
  - Necesita: Estrategias Wiki (full moon timing, rampage targets)
  
- [ ] **Juggernaut** - Implementado ✅ | Estrategias ❌
  - Mecánica: KILL_SINGLE + escala con kills
  - Necesita: Estrategias Wiki (escalar rápido, survival early)
  
- [ ] **Plaguebearer/Pestilence** - ❌ **IMPLEMENTACIÓN INCOMPLETA**
  - Mecánica: nightActionType INFECT no tiene case en gameEngine
  - Transformación a Pestilence no implementada
  - Necesita: Implementar infección + transformación
  - Necesita: Estrategias Wiki (infect priority, transformación)

---

## 🟣 PRIORIDAD 4: Neutral Evil

- [ ] **Jester** - Implementado ✅ | Estrategias ❌
  - Mecánica: NONE + HAUNT completo (lynched win condition)
  - Necesita: Estrategias Wiki (acting suspicious, fake claims, haunt choice)
  
- [ ] **Executioner** - Implementado ✅ | Estrategias ❌
  - Mecánica: Target asignado + conversión Jester
  - Necesita: Estrategias Wiki (push target, fake evidence, pivot si muere)
  
- [ ] **Witch** - Implementado ✅ | Estrategias ❌
  - Mecánica: CONTROL completo (dual target)
  - Necesita: Estrategias Wiki (control tactics, survivor condition)

---

## 🟢 PRIORIDAD 5: Neutral Benign/Chaos

- [ ] **Survivor** - Implementado ✅ | Estrategias ❌
  - Mecánica: VEST completo (4 usos)
  - Necesita: Estrategias Wiki (vest timing, claiming, voting)
  
- [ ] **Amnesiac** - ❌ **IMPLEMENTACIÓN INCOMPLETA**
  - Mecánica: nightActionType REMEMBER no tiene case en gameEngine
  - Necesita: Implementar selección de corpse + transformación
  - Necesita: Estrategias Wiki
  
- [ ] **Guardian Angel** - Implementado ✅ | Estrategias ❌
  - Mecánica: PROTECT_TARGET completo (2 usos, target asignado)
  - Necesita: Estrategias Wiki (proteger timing, conversión Survivor)
  
- [ ] **Pirate** - ❌ **IMPLEMENTACIÓN INCOMPLETA**
  - Mecánica: nightActionType DUEL no tiene case en gameEngine
  - Necesita: Implementar duelo rock-paper-scissors
  - Necesita: Estrategias Wiki

---

## 🟪 PRIORIDAD 6: Coven (Expansión)

- [ ] **Coven Leader** - Implementado ✅ | Estrategias ❌
  - Mecánica: CONTROL completo (mismo que Witch)
  - Necesita: Estrategias Wiki (Necronomicon, control Coven)
  
- [ ] **Hex Master** - Implementado ✅ | Estrategias ❌
  - Mecánica: HEX completo
  - Necesita: Estrategias Wiki (hex all win condition)
  
- [ ] **Medusa** - Implementado ✅ | Estrategias ❌
  - Mecánica: STONE_GAZE completo (petrifica visitantes)
  - Necesita: Estrategias Wiki (bait strategies, Necronomicon)
  
- [ ] **Poisoner** - Implementado ✅ | Estrategias ❌
  - Mecánica: POISON completo
  - Necesita: Estrategias Wiki (poison timing, Necronomicon)
  
- [ ] **Necromancer** - ❌ **IMPLEMENTACIÓN INCOMPLETA**
  - Mecánica: nightActionType NECROMANCY no tiene case en gameEngine
  - Necesita: Implementar uso de corpses para acciones
  - Necesita: Estrategias Wiki
  
- [ ] **Potion Master** - ❌ **IMPLEMENTACIÓN INCOMPLETA**
  - Mecánica: nightActionType POTION multi-mode no tiene case en gameEngine
  - Necesita: Implementar 3 pociones (Heal/Attack/Reveal)
  - Necesita: Estrategias Wiki

---

## 🩸 PRIORIDAD 7: Vampire (Expansión Especial)

- [ ] **Vampire** - ❌ **IMPLEMENTACIÓN INCOMPLETA**
  - Mecánica: nightActionType CONVERT no tiene case en gameEngine
  - Necesita: Implementar conversión + sistema de youngest vampire
  - Necesita: Estrategias Wiki
  
- [ ] **Vampire Hunter** - ❌ **IMPLEMENTACIÓN INCOMPLETA** (duplicado arriba)

---

## 📋 Resumen de Implementación Mecánica

### ✅ Roles con Implementación Completa (40)
Sheriff, Investigator, Doctor, Vigilante, Jailor, Godfather, Mafioso, Jester, Serial Killer, Survivor, Lookout, Spy, Psychic, Tracker, Bodyguard, **Crusader**, Trapper, Guardian Angel, Veteran, Escort, Mayor, Medium, Transporter, Disguiser, Forger, Framer, Hypnotist, Janitor, Blackmailer, Consigliere, Consort, Coven Leader, Hex Master, Medusa, Poisoner, Executioner, Witch, Arsonist, Werewolf, Juggernaut

### ❌ Roles Sin Implementación Mecánica (10)
1. **Vampire Hunter** - KILL_VAMPIRES no implementado
2. **Retributionist** - RESURRECT no implementado
3. **Ambusher** - AMBUSH no implementado
4. **Necromancer** - NECROMANCY no implementado
5. **Potion Master** - POTION multi-mode no implementado
6. **Plaguebearer** - INFECT no implementado
7. **Pestilence** - Transformación no implementada
8. **Pirate** - DUEL no implementado
9. **Amnesiac** - REMEMBER no implementado
10. **Vampire** - CONVERT no implementado

---

## 🎯 Plan de Acción Recomendado

### Fase 1: Estrategias (1-2 semanas)
**Añadir estrategias Wiki a los 39 roles con implementación completa**

**Orden sugerido por impacto:**
1. **Town Core** (8 roles): Sheriff, Doctor, Jailor, Investigator, Lookout, Escort, Mayor, Vigilante
2. **Mafia Core** (5 roles): Godfather, Mafioso, Consigliere, Consort, Framer
3. **Town Protective** (4 roles): Trapper, Guardian Angel, Veteran, Transporter
4. **Neutral Evil** (3 roles): Jester, Executioner, Witch
5. **Neutral Killing** (4 roles): Serial Killer, Arsonist, Werewolf, Juggernaut
6. **Mafia Deception** (4 roles): Disguiser, Forger, Janitor, Hypnotist
7. **Town Investigative** (3 roles): Spy, Psychic, Tracker
8. **Neutral Benign** (2 roles): Survivor, Guardian Angel
9. **Mafia Support** (1 rol): Blackmailer
10. **Coven** (5 roles): Coven Leader, Hex Master, Medusa, Poisoner

### Fase 2: Implementaciones Críticas (2-3 semanas)
**Roles más jugados sin implementación:**
1. **Crusader** - Town Protective popular
2. **Vampire Hunter** - Necesario para modo Vampire
3. **Retributionist** - Town Support único
4. **Ambusher** - Mafia Killing importante

### Fase 3: Implementaciones Avanzadas (3-4 semanas)
**Roles complejos:**
5. **Potion Master** - Versatilidad Coven
6. **Plaguebearer/Pestilence** - Transformación NK
7. **Necromancer** - Mecánica corpses Coven
8. **Pirate** - Mecánica duelo única
9. **Amnesiac** - Transformación flexible
10. **Vampire** - Sistema conversión + youngest

---

## 📝 Formato de Estrategias

**Cada rol debe tener 5-10 tips según este formato:**

```javascript
strategyTips: [
  {
    phase: 'NIGHT' | 'DAY' | 'GENERAL',
    dayRange: [inicio, fin], // [1,1] = solo D1, [1,99] = siempre
    tip: 'Consejo específico y accionable en español'
  }
]
```

**Ejemplo (Bodyguard ya implementado):**
- 8 tips cubriendo: N1 priority, Mayor protection, Doctor chain, pattern prediction, vest survival, claiming, target selection, mechanics

---

## 🔗 Referencias

- Wiki Town of Salem: https://town-of-salem.fandom.com/wiki/
- Cada rol tiene sección "Strategy" con tips de community
- Usuario proveyó mecánicas Mafioso/Godfather como referencia

---

## ✅ Checklist por Rol

Para completar cada rol:
- [ ] Extraer estrategias de Wiki
- [ ] Traducir al español
- [ ] Formatear en estructura JSON con phase + dayRange
- [ ] Añadir 5-10 tips (priorizar early/late game differentiation)
- [ ] Actualizar seed.js con nuevo strategyTips array
- [ ] Ejecutar `npx prisma db seed`
- [ ] Verificar en prompts de bot (console.log en buildNightActionPrompt)
- [ ] Testear con bot usando ese rol

---

**Última Actualización**: 2025-02-16  
**Estado**: Bodyguard ✅ | Crusader ✅ | 48 roles restantes ❌
