# 💾 DATABASE SCHEMA - COMPLETO Y ACTUALIZADO

## Modelo Role - Todos los Campos Necesarios

```prisma
model Role {
  id              String   @id @default(cuid())
  
  // ============================================
  // INFORMACIÓN BÁSICA
  // ============================================
  nameEs          String   @unique  // "Asesino en Serie"
  nameEn          String   @unique  // "Serial Killer"
  slug            String   @unique  // "serial-killer" (para URLs)
  
  // Alineación
  factionId       String
  faction         Faction  @relation(fields: [factionId], references: [id])
  alignmentId     String
  alignment       Alignment @relation(fields: [alignmentId], references: [id])
  
  // ============================================
  // ESTADÍSTICAS DE COMBATE
  // ============================================
  attackValue     Int      @default(0)  // 0=None, 1=Basic, 2=Powerful, 3=Unstoppable
  defenseValue    Int      @default(0)  // 0=None, 1=Basic, 2=Powerful, 3=Invincible
  
  // Prioridad de acción (1-8, menor = primero)
  actionPriority  Int      @default(5)
  
  // ============================================
  // ATRIBUTOS ESPECIALES (Array de strings)
  // ============================================
  attributes      String[] @default([])
  // Opciones: 
  // - "Night Immune" (defensa básica de noche)
  // - "Detection Immune" (Sheriff lo ve inocente)
  // - "Roleblock Immune" (no puede ser bloqueado)
  // - "Control Immune" (Witch no puede controlarlo)
  // - "Unique" (solo 1 por partida)
  // - "Kills Visitors" (mata a quien lo visite)
  // - "Astral" (visitas invisibles a Lookout)
  // - "Rampage" (mata múltiples objetivos)
  
  // ============================================
  // INVESTIGACIÓN
  // ============================================
  sheriffResult        String?  // "Not Suspicious" | "Suspicious (Mafia)" | "Suspicious (Serial Killer)" | "Suspicious (Arsonist)" | "Suspicious (Werewolf)"
  investigatorGroup    String?  // "Doctor, Disguiser, Serial Killer, Potion Master"
  consigliereSees      String?  // Lo que ve Consigliere (normalmente igual que nameEn)
  
  // ============================================
  // HABILIDADES Y MECÁNICAS
  // ============================================
  
  // Tipo de acción nocturna principal
  nightActionType  NightActionType?
  
  // Configuración de habilidad (JSON)
  abilityConfig    Json     @default("{}")
  // Estructura según rol:
  // {
  //   // ===== LÍMITES DE USO =====
  //   usesPerGame: number | null,           // Ej: Vigilante 3 balas, Jailor 3 ejecuciones, null = ilimitado
  //   cooldown: number,                      // Turnos entre usos (0 = sin cooldown)
  //   chargesPerNight: number,               // Ej: Veteran 1 alerta por noche
  //   
  //   // ===== TARGETING =====
  //   mustTarget: boolean,                   // ¿Debe elegir target obligatoriamente?
  //   canTargetSelf: boolean,                // ¿Puede targetarse a sí mismo?
  //   requiresTwoTargets: boolean,           // Transporter necesita 2
  //   canTargetSameConsecutive: boolean,     // Doctor NO puede curar mismo 2 noches seguidas
  //   canTargetDead: boolean,                // Retributionist puede revivir muertos
  //   canTargetJailed: boolean,              // ¿Puede targetear a alguien en la cárcel?
  //   targetMustBeAlive: boolean,            // Target debe estar vivo
  //   
  //   // ===== COMPORTAMIENTO ESPECIAL =====
  //   hasPassiveAbility: boolean,            // SK mata visitantes (pasivo, siempre activo)
  //   hasModes: boolean,                     // SK tiene Normal/Cautious
  //   modes: string[],                       // ["normal", "cautious"]
  //   defaultMode: string,                   // "normal"
  //   
  //   // ===== AUTO-ACTIVACIÓN =====
  //   autoActivates: boolean,                // Psychic recibe visiones automáticas
  //   activationCondition: string,           // "even_nights" | "odd_nights" | "full_moon" | "when_infected_all"
  //   activationFrequency: number,           // Cada cuántos días (Werewolf cada 2)
  //   
  //   // ===== CONSECUENCIAS DE ACCIONES =====
  //   killsSelfIfKillsTown: boolean,         // Vigilante se suicida si mata Town
  //   losesAbilityIfKillsTown: boolean,      // Jailor pierde ejecutar si mata Town
  //   transformsOnCondition: string,         // "all_infected" → Plaguebearer → Pestilence
  //   transformsInto: string,                // "Pestilence"
  //   becomesOnTargetDeath: string,          // "Jester" (Executioner si su target muere)
  //   
  //   // ===== EFECTOS QUE APLICA =====
  //   appliesEffect: string,                 // "DOUSED" | "INFECTED" | "HEXED" | "POISONED" | "BLACKMAILED" | "FRAMED"
  //   effectDuration: number | null,         // Turnos que dura (null = permanente hasta acción)
  //   effectDelayedDeath: number,            // Poisoner: target muere después de X noches
  //   
  //   // ===== INTERACCIONES CON ROLEBLOCKERS =====
  //   diesIfRoleblocks: string[],            // Escort muere si bloquea a ["Serial Killer", "Werewolf"]
  //   dousesIfRoleblocked: boolean,          // Arsonist rocía al roleblocker
  //   killsRoleblocker: boolean,             // SK mata a Escort (modo normal)
  //   killsRoleblockerCondition: string,     // "mode_normal"
  //   
  //   // ===== HABILIDADES ESPECIALES =====
  //   canCleanCorpse: boolean,               // Janitor limpia rol
  //   cleanLimit: number,                    // 3 usos
  //   canForgeWill: boolean,                 // Forger falsifica testamento
  //   forgeLimit: number,                    // 3 usos
  //   canReveal: boolean,                    // Mayor se revela públicamente
  //   revealsOnDeath: boolean,               // Mayor revelado tiene restricciones
  //   canWhisperWhenRevealed: boolean,       // Mayor revelado NO puede whisper
  //   canBeHealedWhenRevealed: boolean,      // Mayor revelado NO puede ser curado
  //   voteWorthWhenRevealed: number,         // Mayor revelado vota × 3
  //   canSeance: boolean,                    // Medium hace seance
  //   seanceLimit: number,                   // 1 seance por juego
  //   
  //   // ===== VISITAS =====
  //   isAstralVisit: boolean,                // Lookout NO ve la visita
  //   visitsMultiple: boolean,               // Arsonist ignite visita a todos los doused
  //   visitsNobody: boolean,                 // Psychic no visita (visiones automáticas)
  //   
  //   // ===== DETECCIÓN =====
  //   appearsInnocent: boolean,              // Godfather aparece "Not Suspicious"
  //   appearsAs: string,                     // Disguiser aparece como su target
  //   framesTarget: boolean,                 // Framer hace que target aparezca culpable
  //   
  //   // ===== PROTECCIÓN =====
  //   selfProtectLimit: number,              // Doctor puede curarse 1 vez, BG vest 1 vez
  //   protectsPriority: number,              // Overrides actionPriority si es crítico
  //   canProtectFromUnstoppable: boolean,    // Normalmente false (solo Jailor jail)
  //   
  //   // ===== JAIL ESPECÍFICO (Jailor) =====
  //   jailBlocksAllActions: boolean,         // Prisionero no puede hacer nada
  //   jailPreventsVisits: boolean,           // Nadie puede visitar al prisionero
  //   canExecuteInJail: boolean,             // Puede ejecutar
  //   executionIsUnstoppable: boolean,       // Ejecución es Unstoppable
  //   
  //   // ===== VAMPIRE ESPECÍFICO =====
  //   convertsTarget: boolean,               // Vampire convierte a target
  //   conversionDelay: number,               // Tarda X noches en convertir
  //   immuneToConversion: boolean,           // Vampire Hunter es inmune
  //   
  //   // ===== PIRATE ESPECÍFICO =====
  //   requiresDuel: boolean,                 // Pirate hace duelo
  //   duelOptions: string[],                 // ["Sidestep", "Scimitar", "Rapier"]
  //   winsNeeded: number,                    // Pirate necesita 2 victorias
  // }
  
  // Inmunidades específicas (JSON)
  immunities       Json     @default("{}")
  // {
  //   roleblock: boolean,                    // Inmune a Escort/Consort
  //   control: boolean,                      // Inmune a Witch
  //   detection: boolean,                    // Inmune a Sheriff (aparece inocente)
  //   poison: boolean,                       // Inmune a Poisoner
  //   conversion: boolean,                   // Inmune a Vampire bite
  //   bleeding: boolean,                     // Inmune a Poisoner bleeding
  //   hex: boolean,                          // Inmune a Hex Master
  //   burn: boolean,                         // Inmune a Arsonist
  //   attack: boolean,                       // Night Immune (defensa en defenseValue)
  // }
  
  // Interacciones específicas con otros roles (JSON Array)
  specialInteractions Json  @default("[]")
  // [
  //   {
  //     withRole: "Escort",
  //     condition: "roleblocked",
  //     result: "KILLS_ROLEBLOCKER",
  //     applies: "mode_normal",              // Solo en modo normal (SK)
  //     priority: "immediate",
  //     message: "¡Alguien intentó bloquearte! Los has asesinado."
  //   },
  //   {
  //     withRole: "Jailor",
  //     condition: "jailed",
  //     result: "CANNOT_USE_ABILITY",
  //     priority: "blocks_all",
  //     message: "Estás en la cárcel. No puedes usar tu habilidad."
  //   },
  //   {
  //     withRole: "Doctor",
  //     condition: "visits",
  //     result: "VISITOR_DIES",
  //     applies: "always",
  //     message: "Has asesinado a un visitante."
  //   },
  //   {
  //     withRole: "Arsonist",
  //     condition: "roleblocked",
  //     result: "DOUSES_ROLEBLOCKER",
  //     message: "Alguien intentó bloquearte. Los has rociado con gasolina."
  //   },
  //   {
  //     withRole: "Transporter",
  //     condition: "transported",
  //     result: "ACTION_REDIRECTED",
  //     priority: 4,
  //     message: "Fuiste transportado a otra ubicación."
  //   },
  //   {
  //     withRole: "Bodyguard",
  //     condition: "protects_your_target",
  //     result: "BOTH_DIE",
  //     message: "Un Bodyguard protegió a tu target. Ambos murieron."
  //   },
  //   {
  //     withRole: "Crusader",
  //     condition: "protects_your_target",
  //     result: "RANDOM_VISITOR_DIES",
  //     message: "Un Crusader mató a alguien que visitó a tu target."
  //   },
  //   {
  //     withRole: "Plaguebearer",
  //     condition: "visits_infected",
  //     result: "GETS_INFECTED",
  //     spreadsTo: "all_visitors",
  //     message: "Visitaste a alguien infectado. Ahora estás infectado."
  //   }
  // ]
  
  // Win conditions (JSON)
  winConditions    Json     @default("{}")
  // {
  //   type: "FACTION_ELIMINATION",           // Tipo de victoria
  //   eliminateAll: ["MAFIA", "NEUTRAL_KILLING"], // Qué facciones eliminar
  //   surviveTownWin: false,                 // ¿Sobrevive si Town gana? (normalmente no)
  //   
  //   // O para neutrales:
  //   type: "CUSTOM",
  //   condition: "be_lynched",               // Jester
  //   
  //   // Executioner:
  //   condition: "target_lynched",
  //   targetType: "TOWN",                    // Target debe ser Town
  //   becomesIfTargetDies: "Jester",         // Se convierte si target muere de noche
  //   
  //   // Survivor:
  //   condition: "survive_to_end",
  //   canWinWithAny: true,
  //   
  //   // Serial Killer, Arsonist, Werewolf:
  //   condition: "be_last_alive",
  //   
  //   // Plaguebearer:
  //   condition: "transform_and_win",
  //   mustTransformTo: "Pestilence",
  //   thenCondition: "be_last_alive",
  //   
  //   // Witch:
  //   condition: "town_loses",
  //   canWinWith: ["MAFIA", "COVEN", "NEUTRAL_KILLING"],
  //   
  //   // Pirate:
  //   condition: "win_duels",
  //   winsNeeded: 2,
  //   thenSurvivesToEnd: true,
  //   
  //   // Guardian Angel:
  //   condition: "target_survives",
  //   targetAssignedAtStart: true,
  //   becomesIfTargetDies: "Survivor",
  //   
  //   // Vampire:
  //   condition: "convert_all_or_majority",
  //   formsTeam: true,
  // }
  
  // ============================================
  // TEXTOS Y UI
  // ============================================
  
  // Icono y color
  icon            String   // Emoji o path: "🔪" o "/icons/serial-killer.png"
  color           String   // Color hex para UI: "#8B0000"
  
  // Textos en español
  goalEs          String   @db.Text
  abilitiesEs     String   @db.Text  // Descripción completa de habilidades
  attributesListEs String[] @default([])  // Lista de atributos para UI
  // [
  //   "Tienes Defensa Básica",
  //   "Eres inmune a detección del Sheriff",
  //   "Matas a todos tus visitantes",
  //   "Si te bloquean (Escort/Consort), los matas a ellos"
  // ]
  
  // Textos en inglés
  goalEn          String   @db.Text
  abilitiesEn     String   @db.Text
  attributesListEn String[] @default([])
  
  // Tips y estrategias (JSON Array)
  strategyTips    Json     @default("[]")
  // [
  //   { 
  //     phase: "early_game",  // "early_game" | "mid_game" | "late_game"
  //     dayRange: [1, 3],
  //     tip: "No te expongas, deja que Town y Mafia se peleen entre sí."
  //   },
  //   { 
  //     phase: "mid_game",
  //     dayRange: [4, 6],
  //     tip: "Elimina roles clave como Jailor o Sheriff. Evita Escorts si es posible."
  //   },
  //   { 
  //     phase: "late_game",
  //     dayRange: [7, 99],
  //     tip: "Usa modo Normal. Mata agresivamente. Busca eliminar últimos Town/Mafia."
  //   },
  //   {
  //     phase: "general",
  //     tip: "Si te acusan, defiéndete claim un rol creíble. No claims Sheriff/Jailor."
  //   }
  // ]
  
  // Mensajes del juego (JSON)
  messages        Json     @default("{}")
  // {
  //   // Inicio
  //   onStart: "Eres un Asesino en Serie con sed de sangre que no se puede saciar.",
  //   onStartLong: "Tu objetivo es ser el último superviviente. Matas cada noche y eliminas a cualquiera que te visite.",
  //   
  //   // Acciones
  //   onKill: "Has asesinado a {target}. Era {role}.",
  //   onKillFailed: "Tu target tenía defensa. No pudiste matarlo.",
  //   onVisitorKilled: "Has asesinado a {visitor} cuando te visitó.",
  //   onRoleblocked: "¡Alguien intentó bloquearte! Los has asesinado.",
  //   onRoleblockedCautious: "Alguien te bloqueó. No realizaste ninguna acción.",
  //   onTargetImmune: "Tu target es inmune a tu ataque.",
  //   onJailed: "El Jailor te ha encarcelado. No puedes usar tu habilidad esta noche.",
  //   onTransported: "Fuiste transportado a otra ubicación.",
  //   onControlled: "Una Witch te controló y cambiaste tu target.",
  //   
  //   // Resultados
  //   onWin: "¡Has ganado! Eres el último superviviente.",
  //   onLoss: "Has perdido. {winner} ganó la partida.",
  //   onDeath: "Has muerto.",
  //   onLynched: "Fuiste ejecutado por el Town.",
  //   
  //   // Información recibida
  //   onInvestigationResult: "Tu target es {result}.",
  //   onAttacked: "¡Fuiste atacado pero sobreviviste!",
  //   onHealed: "¡Fuiste atacado pero un Doctor te curó!",
  //   onProtected: "¡Fuiste atacado pero un Bodyguard te protegió!",
  // }
  
  // ============================================
  // METADATA
  // ============================================
  
  difficulty      RoleDifficulty
  
  // Flags booleanos
  isUnique        Boolean  @default(false)  // Solo 1 por partida (Jailor, Mayor, Godfather)
  isEnabled       Boolean  @default(true)   // Habilitado en el juego
  requiresCoven   Boolean  @default(false)  // Solo disponible en modo Coven
  requiresVampire Boolean  @default(false)  // Solo disponible en modo Vampire
  
  // Categorías adicionales (tags)
  tags            String[] @default([])
  // ["killing", "investigative", "protective", "deception", "support", "chaos", "visiting", "non-visiting"]
  
  // Logros relacionados (JSON Array)
  achievements    Json     @default("[]")
  // [
  //   { 
  //     id: "crime_scene",
  //     nameEs: "Escena del Crimen",
  //     nameEn: "Crime Scene",
  //     descriptionEs: "Mata a 3 o más visitantes en una sola noche",
  //     condition: "kill_3_visitors_one_night",
  //     rarity: "rare"
  //   },
  //   { 
  //     id: "unstoppable",
  //     nameEs: "Imparable",
  //     nameEn: "Unstoppable",
  //     descriptionEs: "Gana una partida con 10 o más jugadores",
  //     condition: "win_with_10_plus_players",
  //     rarity: "epic"
  //   },
  //   {
  //     id: "psychopath",
  //     nameEs: "Psicópata",
  //     nameEn: "Psychopath",
  //     descriptionEs: "Mata al Mayor revelado",
  //     condition: "kill_revealed_mayor",
  //     rarity: "legendary"
  //   }
  // ]
  
  // ============================================
  // ESTADÍSTICAS Y BALANCE
  // ============================================
  
  // Win rates esperados (para balance)
  expectedWinRate Float    @default(0.5)
  // Town: 0.48-0.55
  // Mafia: 0.30-0.38
  // Neutral Killing: 0.15-0.22
  // Neutral Evil: 0.08-0.15
  // Neutral Benign: 0.40-0.60
  
  // Complejidad de implementación (para developers)
  implementationComplexity Int @default(5)  // 1-10
  // 1-3: Fácil (Sheriff, Doctor)
  // 4-6: Media (Investigator, Vigilante)
  // 7-8: Difícil (Transporter, Witch)
  // 9-10: Muy difícil (Retributionist, Plaguebearer)
  
  // Popularity (para stats)
  popularity      Float    @default(0.5)  // 0-1, actualizado con uso real
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // ============================================
  // RELACIONES
  // ============================================
  roleMechanics   RoleMechanic[]
  roleStats       RoleStats[]
  
  @@index([nameEs])
  @@index([nameEn])
  @@index([slug])
  @@index([factionId])
  @@index([alignmentId])
  @@index([nightActionType])
  @@index([isUnique])
  @@index([difficulty])
}

enum NightActionType {
  // ===== KILLING =====
  KILL_SINGLE              // Mafia, Vigilante, Serial Killer
  KILL_VISITORS            // Veteran, Serial Killer (pasivo)
  KILL_RAMPAGE             // Werewolf, Juggernaut (mata múltiples)
  EXECUTE                  // Jailor execution
  
  // ===== INVESTIGATION =====
  SHERIFF_CHECK            // Sheriff: Suspicious / Not Suspicious
  INVESTIGATOR_CHECK       // Investigator: Grupo de 3 roles
  LOOKOUT_WATCH            // Lookout: Ver visitantes
  TRACKER_TRACK            // Tracker: Ver a quién visitó
  SPY_BUG                  // Spy: Ver Mafia actions + chat
  CONSIGLIERE_CHECK        // Consigliere: Rol exacto
  PSYCHIC_VISION           // Psychic: Visiones automáticas
  
  // ===== PROTECTION =====
  HEAL                     // Doctor: Curar 1 ataque
  PROTECT                  // Bodyguard: Proteger + matar atacante
  PROTECT_VISITORS         // Crusader: Proteger + matar visitante aleatorio
  ALERT                    // Veteran: Matar TODOS los visitantes
  VEST                     // Survivor: Auto-protección
  TRAP                     // Trapper: Trampa que mata atacantes
  
  // ===== SUPPORT =====
  ROLEBLOCK                // Escort, Consort: Bloquear habilidad
  TRANSPORT                // Transporter: Intercambiar 2 jugadores
  JAIL                     // Jailor: Encarcelar (bloquea todo)
  REVIVE                   // Retributionist: Revivir Town muerto
  SEANCE                   // Medium: Hablar con muertos públicamente
  REVEAL                   // Mayor: Revelarse (voto ×3)
  
  // ===== DECEPTION =====
  FRAME                    // Framer: Hacer que target parezca Mafia
  DISGUISE                 // Disguiser: Cambiar rol aparente
  CLEAN                    // Janitor: Ocultar rol de muerto
  FORGE                    // Forger: Falsificar testamento
  BLACKMAIL                // Blackmailer: Silenciar de día
  HYPNOTIZE                // Hypnotist: Enviar mensaje falso
  
  // ===== SPECIAL =====
  DOUSE                    // Arsonist: Rociar gasolina
  IGNITE                   // Arsonist: Quemar a todos
  CLEAN_SELF               // Arsonist: Limpiarse gasolina
  INFECT                   // Plaguebearer: Infectar + propagar
  TRANSFORM                // Plaguebearer → Pestilence
  CONTROL                  // Witch: Controlar habilidad de otro
  HEX                      // Hex Master: Hexear (cuando todos hexed, ataque Unstoppable)
  POISON                   // Poisoner: Envenenar (muerte delayed)
  BITE                     // Vampire: Morder para convertir
  DUEL                     // Pirate: Desafiar a duelo
  PROTECT_TARGET           // Guardian Angel: Proteger target asignado
  REMEMBER                 // Amnesiac: Recordar rol de muerto
  STONE_GAZE               // Medusa: Petrificar visitantes
  REANIMATE                // Necromancer: Usar cadáver
  POTION                   // Potion Master: Usar poción (heal/attack/reveal)
  
  // ===== PASSIVE / AUTO =====
  NONE                     // Survivor (solo vest), algunos neutrales
  AUTOMATIC                // Psychic (visiones automáticas), Plaguebearer Pestilence
}

enum RoleDifficulty {
  EASY      // Sheriff, Doctor, Mafioso, Survivor
  MEDIUM    // Investigator, Escort, Bodyguard, Consigliere, Arsonist
  HARD      // Serial Killer, Vigilante, Disguiser, Blackmailer, Executioner
  EXPERT    // Jailor, Transporter, Witch, Retributionist, Plaguebearer, Potion Master
}
```

---

## Ejemplo Completo: Serial Killer

```prisma
{
  // Básico
  nameEs: "Asesino en Serie",
  nameEn: "Serial Killer",
  slug: "serial-killer",
  factionId: "neutral_faction_id",
  alignmentId: "neutral_killing_alignment_id",
  
  // Combate
  attackValue: 1,  // Basic
  defenseValue: 1,  // Basic
  actionPriority: 6,
  
  // Atributos
  attributes: ["Night Immune", "Detection Immune", "Kills Visitors"],
  
  // Investigación
  sheriffResult: "Suspicious (Serial Killer)",
  investigatorGroup: "Doctor, Disguiser, Serial Killer, Potion Master",
  consigliereSees: "Serial Killer",
  
  // Tipo de acción
  nightActionType: "KILL_SINGLE",
  
  // Configuración
  abilityConfig: {
    // Targeting
    mustTarget: true,
    canTargetSelf: false,
    requiresTwoTargets: false,
    canTargetSameConsecutive: true,
    targetMustBeAlive: true,
    
    // Pasivo
    hasPassiveAbility: true,  // Mata visitantes
    
    // Modos
    hasModes: true,
    modes: ["normal", "cautious"],
    defaultMode: "normal",
    
    // Interacciones especiales
    killsRoleblocker: true,
    killsRoleblockerCondition: "mode_normal",
    
    // Visitas
    isAstralVisit: false,
  },
  
  // Inmunidades
  immunities: {
    roleblock: false,  // Puede ser bloqueado (pero mata al bloqueador en normal)
    control: false,
    detection: true,   // Sheriff lo ve como SK (no como inocente)
    attack: true,      // Basic defense
  },
  
  // Interacciones especiales
  specialInteractions: [
    {
      withRole: "Escort",
      condition: "roleblocked",
      result: "KILLS_ROLEBLOCKER",
      applies: "mode_normal",
      priority: "immediate",
      message: "¡Alguien intentó bloquearte! Los has asesinado."
    },
    {
      withRole: "Consort",
      condition: "roleblocked",
      result: "KILLS_ROLEBLOCKER",
      applies: "mode_normal",
      priority: "immediate",
      message: "¡Alguien intentó bloquearte! Los has asesinado."
    },
    {
      withRole: "Escort",
      condition: "roleblocked",
      result: "GETS_BLOCKED",
      applies: "mode_cautious",
      priority: "immediate",
      message: "Alguien te bloqueó. No realizaste ninguna acción."
    },
    {
      withRole: "Jailor",
      condition: "jailed",
      result: "CANNOT_USE_ABILITY",
      priority: "blocks_all",
      message: "Estás en la cárcel. No puedes asesinar a nadie."
    },
    {
      withRole: "Doctor",
      condition: "visits",
      result: "VISITOR_DIES",
      applies: "always",
      message: "Has asesinado a un visitante."
    },
    {
      withRole: "Lookout",
      condition: "visits",
      result: "VISITOR_DIES",
      applies: "always"
    },
    {
      withRole: "Bodyguard",
      condition: "protects_your_target",
      result: "BOTH_DIE",
      message: "Un Bodyguard protegió a tu target. Tú mataste al Bodyguard, pero él también te mató."
    },
    {
      withRole: "Transporter",
      condition: "transported",
      result: "ACTION_REDIRECTED",
      priority: 4
    }
  ],
  
  // Win conditions
  winConditions: {
    type: "CUSTOM",
    condition: "be_last_alive",
    mustEliminateAll: true,
  },
  
  // UI
  icon: "🔪",
  color: "#8B0000",
  
  // Textos
  goalEs: "Matar a todos los que se opongan a ti.",
  abilitiesEs: `Puedes elegir atacar a un jugador cada noche.

Tienes 2 modos:
• Modo Normal: Si te bloquean (Escort/Consort), atacas al bloqueador
• Modo Cauteloso: Si te bloquean, no atacas (pero pierdes inmunidad esa noche)

Matas automáticamente a cualquiera que te visite.`,
  
  attributesListEs: [
    "Tienes Defensa Básica",
    "Eres inmune a detección del Sheriff (te ve como Serial Killer)",
    "Matas a todos tus visitantes",
    "Si te bloquean en modo Normal, matas al bloqueador",
    "Si te bloquean en modo Cauteloso, pierdes inmunidad esa noche"
  ],
  
  // Estrategias
  strategyTips: [
    {
      phase: "early_game",
      dayRange: [1, 3],
      tip: "No te expongas. Deja que Town y Mafia se peleen. Mata sin patrón obvio."
    },
    {
      phase: "mid_game",
      dayRange: [4, 6],
      tip: "Elimina roles clave (Jailor, Sheriff, Investigator). Evita Escorts si puedes."
    },
    {
      phase: "late_game",
      dayRange: [7, 99],
      tip: "Usa modo Normal. Mata agresivamente. Busca eliminar últimos Town/Mafia."
    },
    {
      phase: "general",
      tip: "Si te acusan, claim Doctor o Bodyguard. NO claims Sheriff/Jailor (fácil de verificar)."
    }
  ],
  
  // Mensajes
  messages: {
    onStart: "Eres un Asesino en Serie con sed de sangre que no se puede saciar.",
    onKill: "Has asesinado a {target}. Era {role}.",
    onKillFailed: "Tu target tenía defensa. No pudiste matarlo.",
    onVisitorKilled: "Has asesinado a {visitor} cuando te visitó.",
    onRoleblocked: "¡Alguien intentó bloquearte! Los has asesinado.",
    onRoleblockedCautious: "Alguien te bloqueó. No realizaste ninguna acción.",
    onJailed: "El Jailor te ha encarcelado. No puedes usar tu habilidad esta noche.",
    onWin: "¡Has ganado! Eres el último superviviente.",
  },
  
  // Metadata
  difficulty: "HARD",
  isUnique: false,
  isEnabled: true,
  requiresCoven: false,
  
  tags: ["killing", "visiting", "night-immune", "dangerous"],
  
  // Logros
  achievements: [
    {
      id: "crime_scene",
      nameEs: "Escena del Crimen",
      descriptionEs: "Mata a 3 o más visitantes en una sola noche",
      condition: "kill_3_visitors_one_night",
      rarity: "rare"
    },
    {
      id: "unstoppable",
      nameEs: "Imparable",
      descriptionEs: "Gana una partida con 10 o más jugadores como Serial Killer",
      condition: "win_with_10_plus_players",
      rarity: "epic"
    }
  ],
  
  // Balance
  expectedWinRate: 0.18,
  implementationComplexity: 7,
  popularity: 0.65
}
```

---

## Ventajas de Este Schema

### **1. Sin Hardcodear**
```typescript
// ANTES (hardcoded):
if (role === "Serial Killer") {
  if (mode === "normal" && roleblocked) {
    killRoleblocker();
  }
}

// AHORA (data-driven):
const interaction = role.specialInteractions.find(i => 
  i.withRole === "Escort" && 
  i.condition === "roleblocked" &&
  i.applies === currentMode
);

if (interaction) {
  executeInteraction(interaction);
}
```

### **2. Fácil Añadir Roles Nuevos**
Solo necesitas llenar el JSON, no tocar código.

### **3. Balance Fácil**
Cambiar `attackValue` de 1 a 2 en la BD, no en el código.

### **4. A/B Testing**
Puedes probar diferentes configuraciones sin redesplegar.

### **5. Traducción Fácil**
Todos los textos están en la BD, separados por idioma.

---

**Última actualización**: Febrero 2026  
**Total campos en Role**: 40+ campos  
**100% data-driven**: ✅ Sin hardcodear mecánicas