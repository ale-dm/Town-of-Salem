# 🎭 ROLES COMPLETOS - Town of Salem + Coven

## 📋 Resumen Ejecutivo

**Total de Roles**: 53 roles jugables

### Por Facción:
- **Town**: 24 roles
- **Mafia**: 10 roles  
- **Coven**: 7 roles
- **Neutral**: 12 roles

### Por Dificultad:
- **Easy**: 12 roles
- **Medium**: 21 roles
- **Hard**: 13 roles
- **Expert**: 7 roles

---

## TOWN (24 roles) 🔵

### TOWN INVESTIGATIVE (6 roles)

#### 1. SHERIFF
**Alignment**: Town Investigative  
**Difficulty**: Easy  
**Attack**: None | **Defense**: None  
**Priority**: 7

**Ability**: Interroga a un jugador cada noche
**Results**:
- SOSPECHOSO: Mafia, Coven, Serial Killer, Werewolf (en luna llena)
- NO SOSPECHOSO: Town, otros Neutrales

**Excepciones**:
- Godfather → NO SOSPECHOSO (Detection Immune)
- Framed target → SOSPECHOSO
- Hexed target → "Your target is immune!"

**Investig

ator Group**: Sheriff, Executioner, Werewolf

---

#### 2. INVESTIGATOR
**Alignment**: Town Investigative  
**Difficulty**: Medium  
**Attack**: None | **Defense**: None  
**Priority**: 7

**Ability**: Investiga y obtiene lista de 3 posibles roles

**Investigation Results (11 grupos)**:
```typescript
const INVESTIGATOR_GROUPS = {
  1: ['Vigilante', 'Veteran', 'Mafioso', 'Pirate', 'Ambusher'],
  2: ['Lookout', 'Forger', 'Witch', 'Coven Leader'],
  3: ['Sheriff', 'Executioner', 'Werewolf', 'Poisoner'],
  4: ['Investigator', 'Consigliere', 'Mayor', 'Tracker', 'Plaguebearer'],
  5: ['Bodyguard', 'Godfather', 'Arsonist', 'Crusader'],
  6: ['Doctor', 'Disguiser', 'Serial Killer', 'Potion Master'],
  7: ['Escort', 'Transporter', 'Consort', 'Hypnotist'],
  8: ['Medium', 'Janitor', 'Retributionist', 'Necromancer', 'Trapper'],
  9: ['Framer', 'Vampire', 'Jester', 'Hex Master'],
  10: ['Spy', 'Blackmailer', 'Jailor', 'Guardian Angel'],
  11: ['Survivor', 'Vampire Hunter', 'Amnesiac', 'Medusa', 'Psychic', 'Pirate']
};
```

**Investigator Group**: Investigator, Consigliere, Mayor, Tracker, Plaguebearer

---

#### 3. LOOKOUT
**Alignment**: Town Investigative  
**Difficulty**: Medium  
**Attack**: None | **Defense**: None  
**Priority**: 7

**Ability**: Ve todos los que visitan a tu target esa noche

**Interacciones**:
- Ve a Transporter si transporta a tu target
- Ve a Disguiser visitando (antes de disfrazarse)
- NO ve a Astral visitantes (Plaguebearer con 4 infectados)
- Ve a Vampire mordiendo

**Investigator Group**: Lookout, Forger, Witch, Coven Leader

---

#### 4. SPY
**Alignment**: Town Investigative  
**Difficulty**: Hard  
**Attack**: None | **Defense**: None  
**Priority**: 7

**Ability**: 
- Ve quién visita a Mafia/Coven cada noche
- Puede leer el chat de Mafia (solo lectura)
- Ve si Mafia/Coven usa habilidad

**Versión Coven Mode**:
- NO puede leer chat de Coven (usan Necronomicon)
- Ve cuando Necronomicon es usado

**Investigator Group**: Spy, Blackmailer, Jailor, Guardian Angel

---

#### 5. PSYCHIC
**Alignment**: Town Investigative  
**Difficulty**: Medium  
**Attack**: None | **Defense**: None

**Ability**: Recibe visiones automáticas
- **Noches Pares**: 2 de estos 3 jugadores son Good
- **Noches Impares**: 1 de estos 3 jugadores es Evil

**Investigator Group**: Survivor, Vampire Hunter, Amnesiac, Medusa, Psychic

---

#### 6. TRACKER
**Alignment**: Town Investigative  
**Difficulty**: Medium  
**Attack**: None | **Defense**: None  
**Priority**: 7

**Ability**: Rastrea a quién visita tu target esa noche

**Diferencia con Lookout**:
- Lookout: Ve quién VISITA a X
- Tracker: Ve a quién X VISITA

**Investigator Group**: Investigator, Consigliere, Mayor, Tracker, Plaguebearer

---

### TOWN PROTECTIVE (5 roles)

#### 7. DOCTOR
**Alignment**: Town Protective  
**Difficulty**: Easy  
**Attack**: None | **Defense**: None  
**Priority**: 3

**Ability**: Cura a un jugador, previniendo una muerte
- Puede curarse 1 vez a sí mismo
- NO puede curar al mismo jugador 2 noches seguidas
- Cura 1 ataque (Basic o Powerful)

**NO cura**:
- Ataques Unstoppable (Jailor execution, Arsonist)
- Guilt suicides (Vigilante)
- Lovers death
- Pestilence attack

**Investigator Group**: Doctor, Disguiser, Serial Killer, Potion Master

---

#### 8. BODYGUARD
**Alignment**: Town Protective  
**Difficulty**: Medium  
**Attack**: Powerful | **Defense**: None  
**Priority**: 3

**Ability**: Protege a un jugador
- Si es atacado: BG muere + Atacante muere
- Puede protegerse 1 vez con chaleco (solo previene, no mata)

**Investigator Group**: Bodyguard, Godfather, Arsonist, Crusader

---

#### 9. CRUSADER
**Alignment**: Town Protective  
**Difficulty**: Hard  
**Attack**: Basic | **Defense**: None  
**Priority**: 3

**Ability**: Protege a un jugador
- Mata a UN visitante aleatorio esa noche
- Protege si el visitante era atacante
- **Puede matar Town** si visitan (Doctor, etc)

**Investigator Group**: Bodyguard, Godfather, Arsonist, Crusader

---

#### 10. TRAPPER
**Alignment**: Town Protective  
**Difficulty**: Hard  
**Attack**: Powerful | **Defense**: None  
**Priority**: 3

**Ability**: Coloca trampa que tarda 1 noche en construirse
- Noche 1: Construyes trampa (no protege)
- Noche 2+: Trampa activa, mata atacantes

**Investigator Group**: Medium, Janitor, Retributionist, Necromancer, Trapper

---

#### 11. GUARDIAN ANGEL (Hybrid Town Protective/Neutral Benign)
**Alignment**: Neutral Benign → Town Protective  
**Difficulty**: Medium  
**Attack**: None | **Defense**: Basic  
**Priority**: 3

**Ability**: Protege a tu target asignado (2 veces)
- Si tu target muere → Te conviertes en Survivor con 2 chalecos
- Solo puede proteger a tu target específico

**Investigator Group**: Spy, Blackmailer, Jailor, Guardian Angel

---

### TOWN KILLING (4 roles)

#### 12. VIGILANTE
**Alignment**: Town Killing  
**Difficulty**: Hard  
**Attack**: Basic | **Defense**: None  
**Priority**: 5 (kill), 6 (guilt suicide)

**Ability**: 3 balas para disparar de noche
- Si matas Town → Te suicidas de culpa la noche siguiente
- Si matas immune → Pierdes bala

**Investigator Group**: Vigilante, Veteran, Mafioso, Pirate, Ambusher

---

#### 13. VETERAN
**Alignment**: Town Killing  
**Difficulty**: Medium  
**Attack**: Powerful | **Defense**: Basic (when on alert)  
**Priority**: 5

**Ability**: 3 alertas - Mata a TODOS los visitantes
- Immune a roleblocks cuando alerta
- Detection Immune cuando alerta
- **Puede matar Town** (Doctor, Lookout, etc)

**Investigator Group**: Vigilante, Veteran, Mafioso, Pirate, Ambusher

---

#### 14. VAMPIRE HUNTER
**Alignment**: Town Killing  
**Difficulty**: Medium  
**Attack**: Basic | **Defense**: None  
**Priority**: 5

**Ability**: Detecta y mata Vampires
- Visitacapaz de detectar Vampires (como Sheriff)
- Si atacas Vampire → Lo matas
- Si Vampire muerde → Eres inmune y lo matas
- Si todos los Vampires mueren → Te conviertes en Vigilante con balas ilimitadas

**Investigator Group**: Survivor, Vampire Hunter, Amnesiac, Medusa, Psychic

---

#### 15. JAILOR (Hybrid Town Killing/Support)
**Alignment**: Town Support  
**Difficulty**: Expert  
**Attack**: Unstoppable (execution) | **Defense**: None  
**Priority**: 1 (jail), 4 (execution)

**Ability**: Encierra a alguien cada noche (chat privado 1v1)
- Prisionero NO puede usar habilidad
- Prisionero NO puede ser visitado (inmune a todo)
- Puedes ejecutar (3 usos)
- Si ejecutas Town → Pierdes habilidad de ejecutar permanentemente

**Atributos**: Unique, Roleblock Immune

**Investigator Group**: Spy, Blackmailer, Jailor, Guardian Angel

---

### TOWN SUPPORT (9 roles)

#### 16. ESCORT
**Alignment**: Town Support  
**Difficulty**: Medium  
**Attack**: None | **Defense**: None  
**Priority**: 2

**Ability**: Bloquea habilidad de un jugador
- Roleblocked player no puede usar habilidad
- Si bloqueas Serial Killer → Mueres
- Si bloqueas Werewolf en luna llena → Mueres

**Investigator Group**: Escort, Transporter, Consort, Hypnotist

---

#### 17. MAYOR
**Alignment**: Town Support  
**Difficulty**: Easy  
**Attack**: None | **Defense**: None

**Ability**: Puedes revelarte públicamente
- Tu voto vale 3
- Ya no puedes ser curado
- Ya no puedes ser susurrado

**Atributos**: Unique

**Investigator Group**: Investigator, Consigliere, Mayor, Tracker, Plaguebearer

---

#### 18. MEDIUM
**Alignment**: Town Support  
**Difficulty**: Easy  
**Attack**: None | **Defense**: None  
**Priority**: 0

**Ability**: Hablas con 1 jugador muerto cada noche (canal privado)
- No funciona Noche 1
- Puedes hacer seance

**Investigator Group**: Medium, Janitor, Retributionist, Necromancer, Trapper

---

#### 19. RETRIBUTIONIST
**Alignment**: Town Support  
**Difficulty**: Expert  
**Attack**: None | **Defense**: None  
**Priority**: 5 (revive)

**Ability**: Revive a un jugador Town muerto (1 vez)
- Jugador revivido recupera habilidades
- Jugador revivido conoce tu identidad

**Investigator Group**: Medium, Janitor, Retributionist, Necromancer, Trapper

---

#### 20. TRANSPORTER
**Alignment**: Town Support  
**Difficulty**: Expert  
**Attack**: None | **Defense**: None  
**Priority**: 4

**Ability**: Intercambia 2 jugadores (incluido tú)
- Todas las acciones se redirigen entre ellos
- Muy complejo de usar bien

**Investigator Group**: Escort, Transporter, Consort, Hypnotist

---

#### 21. MAYOR (Ya descrito arriba)

---

### TOWN SPECIAL (Ya descritos)
- Jailor
- Mayor

---

## MAFIA (10 roles) 🔴

### MAFIA KILLING (3 roles)

#### 22. GODFATHER
**Alignment**: Mafia Killing  
**Difficulty**: Easy  
**Attack**: Basic | **Defense**: Basic  
**Priority**: 6

**Ability**: Ordena el asesinato de Mafia
- Si no hay Mafioso, mata tú mismo
- **Detection Immune**: Sheriff te ve inocente
- **Night Immune**: Defense Basic

**Atributos**: Unique, Detection Immune, Night Immune

**Investigator Group**: Bodyguard, Godfather, Arsonist, Crusader

---

#### 23. MAFIOSO
**Alignment**: Mafia Killing  
**Difficulty**: Easy  
**Attack**: Basic | **Defense**: None  
**Priority**: 6

**Ability**: Ejecuta órdenes del Godfather
- Si Godfather muere → Te conviertes en Godfather
- Promoción automática

**Investigator Group**: Vigilante, Veteran, Mafioso, Pirate, Ambusher

---

#### 24. AMBUSHER
**Alignment**: Mafia Killing  
**Difficulty**: Hard  
**Attack**: Basic | **Defense**: None  
**Priority**: 5

**Ability**: Emboscada - Mata a TODOS los visitantes de tu target
- Como Veteran pero de Mafia
- **Puede matar aliados Mafia** si visitan

**Investigator Group**: Vigilante, Veteran, Mafioso, Pirate, Ambusher

---

### MAFIA DECEPTION (4 roles)

#### 25. DISGUISER
**Alignment**: Mafia Deception  
**Difficulty**: Hard  
**Attack**: None | **Defense**: None  
**Priority**: 8

**Ability**: Disfrazarte como otro jugador
- Si mueres, apareces con el rol de tu target
- Si target muere, aparece con tu rol real

**Investigator Group**: Doctor, Disguiser, Serial Killer, Potion Master

---

#### 26. FORGER
**Alignment**: Mafia Deception  
**Difficulty**: Medium  
**Attack**: None | **Defense**: None  
**Priority**: 8

**Ability**: Falsifica testamento de tu target (3 usos)
- Si target muere esa noche → Se muestra tu testamento falso
- Solo Forger ve el testamento real

**Investigator Group**: Lookout, Forger, Witch, Coven Leader

---

#### 27. FRAMER
**Alignment**: Mafia Deception  
**Difficulty**: Medium  
**Attack**: None | **Defense**: None  
**Priority**: 8

**Ability**: Incrimina a un jugador
- Sheriff verá a tu target como SOSPECHOSO
- Investigator verá a tu target como Framer/Vampire/Jester/Hex Master
- Dura solo 1 noche

**Investigator Group**: Framer, Vampire, Jester, Hex Master

---

#### 28. HYPNOTIST
**Alignment**: Mafia Deception  
**Difficulty**: Hard  
**Attack**: None | **Defense**: None  
**Priority**: 8

**Ability**: Hipnotiza a un jugador
- Envía mensaje falso (eliges de una lista)
- Mensajes tipo: "Fuiste roleblocked", "Fuiste atacado pero curado", etc

**Investigator Group**: Escort, Transporter, Consort, Hypnotist

---

### MAFIA SUPPORT (3 roles)

#### 29. BLACKMAILER
**Alignment**: Mafia Support  
**Difficulty**: Medium  
**Attack**: None | **Defense**: None  
**Priority**: 8

**Ability**: Chantajea a un jugador
- Target no puede hablar durante el día
- Blackmailer lee susurros a/desde target

**Investigator Group**: Spy, Blackmailer, Jailor, Guardian Angel

---

#### 30. CONSIGLIERE
**Alignment**: Mafia Support  
**Difficulty**: Easy  
**Attack**: None | **Defense**: None  
**Priority**: 7

**Ability**: Investiga el rol EXACTO de un jugador
- Versión Mafia del Investigator pero exacta

**Investigator Group**: Investigator, Consigliere, Mayor, Tracker, Plaguebearer

---

#### 31. CONSORT
**Alignment**: Mafia Support  
**Difficulty**: Medium  
**Attack**: None | **Defense**: None  
**Priority**: 2

**Ability**: Roleblock (versión Mafia del Escort)
- Mismas interacciones que Escort

**Investigator Group**: Escort, Transporter, Consort, Hypnotist

---

## COVEN (7 roles) 🔮

**Nota**: Coven es más poderoso que Mafia. Obtienen **Necronomicon** cuando queda solo 1 Coven.

### COVEN EVIL (7 roles)

#### 32. COVEN LEADER
**Alignment**: Coven Evil  
**Difficulty**: Medium  
**Attack**: Basic | **Defense**: None  
**Priority**: 2

**Ability**: Controla a un jugador (como Witch)
- Con Necronomicon: Si target muere esa noche → Lo revives como Zombie bajo tu control

**Atributos**: Unique, Control Immune

**Investigator Group**: Lookout, Forger, Witch, Coven Leader

---

#### 33. HEX MASTER
**Alignment**: Coven Evil  
**Difficulty**: Hard  
**Attack**: Unstoppable (when hexing all) | **Defense**: None  
**Priority**: 8

**Ability**: Coloca hex a un jugador
- Cuando todos los vivos tienen hex → Atacas a todos (Unstoppable)
- Con Necronomicon: Hex es Astral (no te ve Lookout)

**Investigator Group**: Framer, Vampire, Jester, Hex Master

---

#### 34. MEDUSA
**Alignment**: Coven Evil  
**Difficulty**: Hard  
**Attack**: Powerful | **Defense**: None  
**Priority**: 5

**Ability**: Petrifica visitantes (como Veteran)
- Mata a TODOS los que te visiten
- Con Necronomicon: Puedes visitar y matar a alguien (como Mafioso)

**Investigator Group**: Survivor, Vampire Hunter, Amnesiac, Medusa, Psychic

---

#### 35. NECROMANCER
**Alignment**: Coven Evil  
**Difficulty**: Expert  
**Attack**: Varies | **Defense**: None  
**Priority**: Varies

**Ability**: Reanimacorpse muerto y usa su habilidad (3 usos)
- Puedes usar habilidad del cadáver en alguien
- Con Necronomicon: Usos ilimitados

**Investigator Group**: Medium, Janitor, Retributionist, Necromancer, Trapper

---

#### 36. POISONER
**Alignment**: Coven Evil  
**Difficulty**: Medium  
**Attack**: Unstoppable (delayed) | **Defense**: None  
**Priority**: 8 (poison), 6 (death)

**Ability**: Envenena a un jugador
- Target muere la noche SIGUIENTE
- Con Necronomicon: Matan inmediatamente (Unstoppable)

**Investigator Group**: Sheriff, Executioner, Werewolf, Poisoner

---

#### 37. POTION MASTER
**Alignment**: Coven Evil  
**Difficulty**: Expert  
**Attack**: Basic | **Defense**: Basic (reveal potion)  
**Priority**: 3 (heal), 5 (attack), 8 (reveal)

**Ability**: Tienes 3 pociones (puedes usar 1 por noche)
- Heal Potion: Cura a alguien (como Doctor)
- Attack Potion: Mata a alguien (Basic attack)
- Reveal Potion: Ve rol exacto de alguien + te da Defense Basic esa noche
- Con Necronomicon: Puedes usar 2 pociones por noche

**Investigator Group**: Doctor, Disguiser, Serial Killer, Potion Master

---

## NEUTRAL (12 roles) ⚪

### NEUTRAL EVIL (3 roles)

#### 38. JESTER
**Alignment**: Neutral Evil  
**Difficulty**: Hard  
**Attack**: Unstoppable (haunt) | **Defense**: None

**Win Condition**: Ser ejecutado de día
**Ability**: Si eres ejecutado → Puedes matar a 1 votante guilty esa noche

**Investigator Group**: Framer, Vampire, Jester, Hex Master

---

#### 39. EXECUTIONER
**Alignment**: Neutral Evil  
**Difficulty**: Medium  
**Attack**: None | **Defense**: Basic

**Win Condition**: Que ejecuten a tu target (Town asignado)
**Cambio**: Si tu target muere de noche → Te conviertes en Jester

**Investigator Group**: Sheriff, Executioner, Werewolf, Poisoner

---

#### 40. WITCH
**Alignment**: Neutral Evil  
**Difficulty**: Expert  
**Attack**: None | **Defense**: Basic  
**Priority**: 2

**Win Condition**: Sobrevivir hasta que Town pierda
**Ability**: Controla a un jugador para usar su habilidad en otro
- Requieres 2 targets
- Muy complejo

**Atributos**: Control Immune

**Investigator Group**: Lookout, Forger, Witch, Coven Leader

---

### NEUTRAL KILLING (5 roles)

#### 41. SERIAL KILLER
**Alignment**: Neutral Killing  
**Difficulty**: Hard  
**Attack**: Basic | **Defense**: Basic  
**Priority**: 6

**Win Condition**: Último superviviente
**Ability**: Mata cada noche + Mata visitantes
- Si eres roleblocked → Matas al roleblocker
- Modo Cautious: No matas roleblockers (pierdes inmunidad)

**Atributos**: Night Immune (Basic), Detection Immune (roleblock immune)

**Investigator Group**: Doctor, Disguiser, Serial Killer, Potion Master

---

#### 42. ARSONIST
**Alignment**: Neutral Killing  
**Difficulty**: Hard  
**Attack**: Unstoppable (ignite) | **Defense**: Basic  
**Priority**: 6 (douse/ignite), 8 (clean)

**Win Condition**: Último superviviente
**Ability**: 
- Rocía gasolina (Douse) o Quema a todos (Ignite)
- Si eres roleblocked → Rocieas al roleblocker
- Puedes limpiarte la gasolina

**Atributos**: Night Immune (Basic)

**Investigator Group**: Bodyguard, Godfather, Arsonist, Crusader

---

#### 43. WEREWOLF
**Alignment**: Neutral Killing  
**Difficulty**: Medium  
**Attack**: Powerful | **Defense**: Basic  
**Priority**: 6

**Win Condition**: Último superviviente
**Ability**: Cada Full Moon (cada 2 noches) mata a target + visitantes
- En Full Moon: Matas visitantes + tu target
- Rampage attack: Mata a muchos

**Atributos**: Night Immune (Basic), Detection Immune (Full Moon)

**Investigator Group**: Sheriff, Executioner, Werewolf, Poisoner

---

#### 44. JUGGERNAUT
**Alignment**: Neutral Killing  
**Difficulty**: Hard  
**Attack**: Powerful → Unstoppable | **Defense**: Basic  
**Priority**: 6

**Win Condition**: Último superviviente
**Ability**: Escala poder con cada kill
- 1st kill: Powerful attack cada noche
- 2nd kill: Unstoppable attack
- 3rd kill: Rampage (mata visitantes también)

**Atributos**: Night Immune (Basic)

**Investigator Group**: Vigilante, Veteran, Mafioso, Pirate, Ambusher

---

#### 45. PLAGUEBEARER → PESTILENCE
**Alignment**: Neutral Killing  
**Difficulty**: Expert  
**Attack**: Powerful → Unstoppable | **Defense**: None → Invincible  
**Priority**: 6

**Win Condition**: Transformarte en Pestilence → Último superviviente

**Fase 1: Plaguebearer**
- Infecta a jugadores
- Si visitas infectado → Todos sus visitantes se infectan
- Cuando TODOS los vivos están infectados → Te transformas

**Fase 2: Pestilence**
- Attack: Unstoppable
- Defense: Invincible (inmune a TODO)
- Matas a todos tus visitantes
- Astral (invisible a Lookout)

**Investigator Group**: Investigator, Consigliere, Mayor, Tracker, Plaguebearer

---

### NEUTRAL CHAOS (1 rol)

#### 46. PIRATE
**Alignment**: Neutral Chaos  
**Difficulty**: Medium  
**Attack**: Powerful (duel win) | **Defense**: None  
**Priority**: 6

**Win Condition**: Ganar 2 duelos exitosos
**Ability**: Desafías a alguien a duelo (3 opciones: Sidestep, Scimitar, Rapier)
- Si ganas el duelo → Roleblock + atacas (Powerful)
- Si pierdes → Te roleblockean a ti

**Investigator Group**: Vigilante, Veteran, Mafioso, Pirate, Ambusher

---

### NEUTRAL BENIGN (3 roles)

#### 47. SURVIVOR
**Alignment**: Neutral Benign  
**Difficulty**: Easy  
**Attack**: None | **Defense**: Basic (with vest)

**Win Condition**: Sobrevivir hasta el final (gana con quien gane)
**Ability**: 4 chalecos antibalas (Basic defense)

**Investigator Group**: Survivor, Vampire Hunter, Amnesiac, Medusa, Psychic

---

#### 48. AMNESIAC
**Alignment**: Neutral Benign  
**Difficulty**: Medium  
**Attack**: None | **Defense**: None

**Win Condition**: Recordar un rol
**Ability**: Recuerda el rol de un jugador muerto → Te conviertes en ese rol
- Cambias de facción según el rol
- Solo 1 uso

**Investigator Group**: Survivor, Vampire Hunter, Amnesiac, Medusa, Psychic

---

#### 49. GUARDIAN ANGEL (Ya descrito en Town Protective)

---

### NEUTRAL VAMPIRE (2 roles)

#### 50. VAMPIRE
**Alignment**: Neutral Vampire  
**Difficulty**: Medium  
**Attack**: Basic | **Defense**: None  
**Priority**: 6

**Win Condition**: Convertir a todos en Vampires
**Ability**: Muerde a alguien cada 2 noches → Se convierte en Vampire
- No puedes convertir Vampire Hunter
- Formáis un equipo separado

**Investigator Group**: Framer, Vampire, Jester, Hex Master

---

#### 51. VAMPIRE HUNTER (Ya descrito en Town Killing)

---

## MATRIZ DE INTERACCIONES COMPLETA

### Attack vs Defense

```
┌────────────────┬──────┬───────┬────────────┬──────────────┐
│                │ None │ Basic │ Powerful   │ Invincible   │
├────────────────┼──────┼───────┼────────────┼──────────────┤
│ None           │  -   │  -    │     -      │      -       │
│ Basic          │  ✓   │  ✗    │     ✗      │      ✗       │
│ Powerful       │  ✓   │  ✓    │     ✗      │      ✗       │
│ Unstoppable    │  ✓   │  ✓    │     ✓      │      ✗       │
└────────────────┴──────┴───────┴────────────┴──────────────┘

✓ = Mata
✗ = No mata
```

### Roleblock Interactions

**Roles bloqueados mueren:**
- Serial Killer (mata al roleblocker)
- Werewolf en Full Moon (mata al roleblocker)

**Roles immune a roleblock:**
- Jailor (Roleblock Immune)
- Veteran (cuando alerta)
- Transporter (si se transporta a sí mismo)
- Witch (Control Immune)
- Coven Leader (Control Immune)

### Astral Visits (Invisibles a Lookout)

- Plaguebearer infectando
- Hex Master con Necronomicon
- Pestilence

### Detection Immune

**Aparecen NO SOSPECHOSO a Sheriff:**
- Godfather
- Executioner
- Jester
- Hex Master
- Coven Leader

### Priority Order (1-8)

```
1. Jailor (jail)
2. Escort/Consort/Witch/Coven Leader (roleblock/control)
3. Doctor/Bodyguard/Crusader/Trapper/Potion Master (protect)
4. Transporter (swap) / Jailor (execute)
5. Killing roles (Vigilante, Veteran, Ambusher, Medusa, etc)
6. Mafia/Coven kill, SK, Arsonist, WW, Pirate
7. Investigative roles (Sheriff, Investigator, Lookout, Spy, etc)
8. Deception (Framer, Disguiser, Forger, Janitor, etc)
```

---

**Última actualización**: Febrero 2026  
**Total de roles**: 51 únicos + variantes
