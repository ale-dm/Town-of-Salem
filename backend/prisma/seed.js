// Seed data for Mafia Game Database
// Based on ALL_ROLES.md and DATABASE_SCHEMA_ROLE_COMPLETO.md

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ============================================
  // STEP 1: Create Factions
  // ============================================
  console.log('📦 Creating factions...');

  const townFaction = await prisma.faction.upsert({
    where: { name: 'Town' },
    update: {},
    create: {
      name: 'Town',
      color: '#4169e1',
      description: 'Los ciudadanos del pueblo que buscan eliminar a la Mafia y criaturas malignas.'
    }
  });

  const mafiaFaction = await prisma.faction.upsert({
    where: { name: 'Mafia' },
    update: {},
    create: {
      name: 'Mafia',
      color: '#8b0000',
      description: 'Una organización criminal que busca tomar control del pueblo.'
    }
  });

  const neutralFaction = await prisma.faction.upsert({
    where: { name: 'Neutral' },
    update: {},
    create: {
      name: 'Neutral',
      color: '#808080',
      description: 'Individuos con objetivos propios que no pertenecen a ningún bando.'
    }
  });

  const covenFaction = await prisma.faction.upsert({
    where: { name: 'Coven' },
    update: {},
    create: {
      name: 'Coven',
      color: '#9932cc',
      description: 'Un aquelarre de brujas oscuras con poderes sobrenaturales.'
    }
  });

  console.log('✅ Factions created');

  // ============================================
  // STEP 2: Create Alignments
  // ============================================
  console.log('📦 Creating alignments...');

  // Town Alignments
  const townInvestigative = await prisma.alignment.upsert({
    where: { factionId_name: { factionId: townFaction.id, name: 'Town Investigative' } },
    update: {},
    create: {
      factionId: townFaction.id,
      name: 'Town Investigative',
      shortName: 'TI',
      description: 'Roles que investigan a otros jugadores para encontrar a los malos.'
    }
  });

  const townProtective = await prisma.alignment.upsert({
    where: { factionId_name: { factionId: townFaction.id, name: 'Town Protective' } },
    update: {},
    create: {
      factionId: townFaction.id,
      name: 'Town Protective',
      shortName: 'TP',
      description: 'Roles que protegen a otros jugadores de ataques.'
    }
  });

  const townKilling = await prisma.alignment.upsert({
    where: { factionId_name: { factionId: townFaction.id, name: 'Town Killing' } },
    update: {},
    create: {
      factionId: townFaction.id,
      name: 'Town Killing',
      shortName: 'TK',
      description: 'Roles del pueblo que pueden matar de noche.'
    }
  });

  const townSupport = await prisma.alignment.upsert({
    where: { factionId_name: { factionId: townFaction.id, name: 'Town Support' } },
    update: {},
    create: {
      factionId: townFaction.id,
      name: 'Town Support',
      shortName: 'TS',
      description: 'Roles que dan soporte al pueblo con habilidades especiales.'
    }
  });

  // Mafia Alignments
  const mafiaKilling = await prisma.alignment.upsert({
    where: { factionId_name: { factionId: mafiaFaction.id, name: 'Mafia Killing' } },
    update: {},
    create: {
      factionId: mafiaFaction.id,
      name: 'Mafia Killing',
      shortName: 'MK',
      description: 'Mafiosos que ejecutan asesinatos.'
    }
  });

  const mafiaDeception = await prisma.alignment.upsert({
    where: { factionId_name: { factionId: mafiaFaction.id, name: 'Mafia Deception' } },
    update: {},
    create: {
      factionId: mafiaFaction.id,
      name: 'Mafia Deception',
      shortName: 'MD',
      description: 'Mafiosos que engañan y confunden a los investigadores.'
    }
  });

  const mafiaSupport = await prisma.alignment.upsert({
    where: { factionId_name: { factionId: mafiaFaction.id, name: 'Mafia Support' } },
    update: {},
    create: {
      factionId: mafiaFaction.id,
      name: 'Mafia Support',
      shortName: 'MS',
      description: 'Mafiosos que apoyan al equipo con información y bloqueos.'
    }
  });

  // Neutral Alignments
  const neutralEvil = await prisma.alignment.upsert({
    where: { factionId_name: { factionId: neutralFaction.id, name: 'Neutral Evil' } },
    update: {},
    create: {
      factionId: neutralFaction.id,
      name: 'Neutral Evil',
      shortName: 'NE',
      description: 'Neutrales con objetivos malignos.'
    }
  });

  const neutralKilling = await prisma.alignment.upsert({
    where: { factionId_name: { factionId: neutralFaction.id, name: 'Neutral Killing' } },
    update: {},
    create: {
      factionId: neutralFaction.id,
      name: 'Neutral Killing',
      shortName: 'NK',
      description: 'Asesinos solitarios que buscan ser los últimos supervivientes.'
    }
  });

  const neutralBenign = await prisma.alignment.upsert({
    where: { factionId_name: { factionId: neutralFaction.id, name: 'Neutral Benign' } },
    update: {},
    create: {
      factionId: neutralFaction.id,
      name: 'Neutral Benign',
      shortName: 'NB',
      description: 'Neutrales que solo buscan sobrevivir.'
    }
  });

  const neutralChaos = await prisma.alignment.upsert({
    where: { factionId_name: { factionId: neutralFaction.id, name: 'Neutral Chaos' } },
    update: {},
    create: {
      factionId: neutralFaction.id,
      name: 'Neutral Chaos',
      shortName: 'NC',
      description: 'Neutrales que crean caos con objetivos únicos.'
    }
  });

  // Coven Alignment
  const covenEvil = await prisma.alignment.upsert({
    where: { factionId_name: { factionId: covenFaction.id, name: 'Coven Evil' } },
    update: {},
    create: {
      factionId: covenFaction.id,
      name: 'Coven Evil',
      shortName: 'CE',
      description: 'Brujas oscuras con poderes mágicos mortales.'
    }
  });

  console.log('✅ Alignments created');

  // ============================================
  // STEP 3: Create Roles
  // ============================================
  console.log('📦 Creating roles (53 total)...');

  // ========== TOWN INVESTIGATIVE ==========

  await prisma.role.upsert({
    where: { slug: 'sheriff' },
    update: {},
    create: {
      nameEs: 'Sheriff',
      nameEn: 'Sheriff',
      slug: 'sheriff',
      factionId: townFaction.id,
      alignmentId: townInvestigative.id,
      attackValue: 0,
      defenseValue: 0,
      actionPriority: 7,
      attributes: [],
      sheriffResult: null, // Sheriff no puede investigarse a sí mismo
      investigatorGroup: 'Sheriff, Executioner, Werewolf, Poisoner',
      consigliereSees: 'Sheriff',
      nightActionType: 'SHERIFF_CHECK',
      abilityConfig: {
        mustTarget: true,
        canTargetSelf: false,
        targetMustBeAlive: true,
      },
      immunities: {},
      specialInteractions: [],
      winConditions: {
        type: 'FACTION_ELIMINATION',
        eliminateAll: ['MAFIA', 'COVEN', 'NEUTRAL_KILLING']
      },
      icon: '🎖️',
      color: '#FFD700',
      goalEs: 'Ejecutar a todos los criminales y criaturas malignas.',
      abilitiesEs: 'Interroga a un jugador cada noche para determinar si es sospechoso.',
      attributesListEs: ['Ver si un jugador es sospechoso'],
      goalEn: 'Lynch every criminal and evildoer.',
      abilitiesEn: 'Interrogate one person each night for suspicious activity.',
      attributesListEn: ['Check if a player is suspicious'],
      strategyTips: [
        { phase: 'early_game', dayRange: [1, 3], tip: 'Investiga a los jugadores más callados o sospechosos.' },
        { phase: 'mid_game', dayRange: [4, 6], tip: 'Comparte resultados con el pueblo cuando tengas evidencia sólida.' },
        { phase: 'late_game', dayRange: [7, 99], tip: 'Coordina con otros roles de investigación para confirmar malos.' }
      ],
      messages: {
        onStart: 'Eres el Sheriff del pueblo. Tu deber es encontrar a los criminales.',
        onInvestigationResult: 'Tu target parece {result}.',
      },
      difficulty: 'EASY',
      isUnique: false,
      isEnabled: true,
      requiresCoven: false,
      requiresVampire: false,
      tags: ['investigative', 'visiting'],
      achievements: [],
      expectedWinRate: 0.52,
      implementationComplexity: 3,
      popularity: 0.80
    }
  });

  await prisma.role.upsert({
    where: { slug: 'investigator' },
    update: {},
    create: {
      nameEs: 'Investigador',
      nameEn: 'Investigator',
      slug: 'investigator',
      factionId: townFaction.id,
      alignmentId: townInvestigative.id,
      attackValue: 0,
      defenseValue: 0,
      actionPriority: 7,
      attributes: [],
      sheriffResult: 'Not Suspicious',
      investigatorGroup: 'Investigator, Consigliere, Mayor, Tracker, Plaguebearer',
      consigliereSees: 'Investigator',
      nightActionType: 'INVESTIGATOR_CHECK',
      abilityConfig: {
        mustTarget: true,
        canTargetSelf: false,
        targetMustBeAlive: true,
      },
      immunities: {},
      specialInteractions: [],
      winConditions: {
        type: 'FACTION_ELIMINATION',
        eliminateAll: ['MAFIA', 'COVEN', 'NEUTRAL_KILLING']
      },
      icon: '🔍',
      color: '#87CEEB',
      goalEs: 'Ejecutar a todos los criminales y criaturas malignas.',
      abilitiesEs: 'Investiga un jugador cada noche para obtener una lista de posibles roles.',
      attributesListEs: ['Ver grupo de 3-5 posibles roles'],
      goalEn: 'Lynch every criminal and evildoer.',
      abilitiesEn: 'Investigate one person each night for a clue to their role.',
      attributesListEn: ['Learn a list of 3-5 possible roles'],
      strategyTips: [
        { phase: 'early_game', dayRange: [1, 3], tip: 'Guarda tus resultados y busca patrones.' },
        { phase: 'mid_game', dayRange: [4, 6], tip: 'Combina resultados con Sheriff para confirmar malos.' },
        { phase: 'late_game', dayRange: [7, 99], tip: 'Revela tu rol y comparte toda tu información.' }
      ],
      messages: {
        onStart: 'Eres un Investigador experimentado. Busca pistas sobre los roles de otros.',
        onInvestigationResult: 'Tu target podría ser {result}.',
      },
      difficulty: 'MEDIUM',
      isUnique: false,
      isEnabled: true,
      requiresCoven: false,
      requiresVampire: false,
      tags: ['investigative', 'visiting'],
      achievements: [],
      expectedWinRate: 0.53,
      implementationComplexity: 4,
      popularity: 0.75
    }
  });

  // Continue with more roles... (This is getting very long)
  // For brevity, I'll create key roles and show the pattern

  // ========== TOWN PROTECTIVE ==========

  await prisma.role.upsert({
    where: { slug: 'doctor' },
    update: {},
    create: {
      nameEs: 'Doctor',
      nameEn: 'Doctor',
      slug: 'doctor',
      factionId: townFaction.id,
      alignmentId: townProtective.id,
      attackValue: 0,
      defenseValue: 0,
      actionPriority: 3,
      attributes: [],
      sheriffResult: 'Not Suspicious',
      investigatorGroup: 'Doctor, Disguiser, Serial Killer, Potion Master',
      consigliereSees: 'Doctor',
      nightActionType: 'HEAL',
      abilityConfig: {
        mustTarget: true,
        canTargetSelf: true,
        selfProtectLimit: 1,
        canTargetSameConsecutive: false,
        targetMustBeAlive: true,
      },
      immunities: {},
      specialInteractions: [
        {
          withRole: 'Serial Killer',
          condition: 'visits',
          result: 'VISITOR_DIES',
          applies: 'always',
          message: 'Fuiste asesinado por el Serial Killer.'
        }
      ],
      winConditions: {
        type: 'FACTION_ELIMINATION',
        eliminateAll: ['MAFIA', 'COVEN', 'NEUTRAL_KILLING']
      },
      icon: '💊',
      color: '#90EE90',
      goalEs: 'Ejecutar a todos los criminales y criaturas malignas.',
      abilitiesEs: 'Cura a un jugador cada noche, previniendo una muerte. Puedes curarte una vez.',
      attributesListEs: ['Curar un ataque Basic o Powerful', 'Autosanarse 1 vez'],
      goalEn: 'Lynch every criminal and evildoer.',
      abilitiesEn: 'Heal one person each night, preventing them from dying. You may only heal yourself once.',
      attributesListEn: ['Heal one Basic or Powerful attack', 'Self-heal once'],
      strategyTips: [
        { phase: 'early_game', dayRange: [1, 3], tip: 'Protege a jugadores que hablan mucho o se revelan como roles importantes.' },
        { phase: 'mid_game', dayRange: [4, 6], tip: 'Alterna entre proteger roles confirmados.' },
        { phase: 'late_game', dayRange: [7, 99], tip: 'Protege siempre a roles únicos como Jailor o Mayor revelado.' }
      ],
      messages: {
        onStart: 'Eres un Doctor hábil. Tu misión es salvar vidas.',
        onHealSuccess: '¡Tu target fue atacado pero lo salvaste!',
        onKill: 'No pudiste salvar a tu target.',
      },
      difficulty: 'EASY',
      isUnique: false,
      isEnabled: true,
      requiresCoven: false,
      requiresVampire: false,
      tags: ['protective', 'visiting', 'support'],
      achievements: [],
      expectedWinRate: 0.54,
      implementationComplexity: 3,
      popularity: 0.85
    }
  });

  // ========== TOWN KILLING ==========

  await prisma.role.upsert({
    where: { slug: 'vigilante' },
    update: {},
    create: {
      nameEs: 'Vigilante',
      nameEn: 'Vigilante',
      slug: 'vigilante',
      factionId: townFaction.id,
      alignmentId: townKilling.id,
      attackValue: 1,
      defenseValue: 0,
      actionPriority: 6,
      attributes: [],
      sheriffResult: 'Not Suspicious',
      investigatorGroup: 'Vigilante, Veteran, Mafioso, Pirate, Ambusher',
      consigliereSees: 'Vigilante',
      nightActionType: 'KILL_SINGLE',
      abilityConfig: {
        usesPerGame: 3,
        mustTarget: true,
        canTargetSelf: false,
        targetMustBeAlive: true,
        killsSelfIfKillsTown: true,
      },
      immunities: {},
      specialInteractions: [],
      winConditions: {
        type: 'FACTION_ELIMINATION',
        eliminateAll: ['MAFIA', 'COVEN', 'NEUTRAL_KILLING']
      },
      icon: '🔫',
      color: '#FF8C00',
      goalEs: 'Ejecutar a todos los criminales y criaturas malignas.',
      abilitiesEs: 'Dispara a un jugador de noche. Tienes 3 balas. Si matas a un Town, te suicidarás de culpa.',
      attributesListEs: ['3 balas para disparar', 'Si matas Town, te suicidas'],
      goalEn: 'Lynch every criminal and evildoer.',
      abilitiesEn: 'Choose to take justice into your own hands and shoot someone. You have 3 bullets.',
      attributesListEn: ['3 bullets to shoot', 'Guilt suicide if you kill Town'],
      strategyTips: [
        { phase: 'early_game', dayRange: [1, 3], tip: 'No dispares al azar. Espera evidencia sólida.' },
        { phase: 'mid_game', dayRange: [4, 6], tip: 'Dispara solo si estás 90% seguro que es malo.' },
        { phase: 'late_game', dayRange: [7, 99], tip: 'Usa tus balas de forma agresiva pero calculada.' }
      ],
      messages: {
        onStart: 'Eres un Vigilante. Tienes 3 balas  para matar criminales.',
        onKill: 'Has disparado a {target}. Era {role}.',
        onKillTown: 'Has matado a un Town... Te suicidarás de culpa.',
      },
      difficulty: 'HARD',
      isUnique: false,
      isEnabled: true,
      requiresCoven: false,
      requiresVampire: false,
      tags: ['killing', 'visiting', 'limited-uses'],
      achievements: [],
      expectedWinRate: 0.48,
      implementationComplexity: 5,
      popularity: 0.70
    }
  });

  // ========== TOWN SUPPORT ==========

  await prisma.role.upsert({
    where: { slug: 'jailor' },
    update: {},
    create: {
      nameEs: 'Carcelero',
      nameEn: 'Jailor',
      slug: 'jailor',
      factionId: townFaction.id,
      alignmentId: townSupport.id,
      attackValue: 3, // Unstoppable execution
      defenseValue: 0,
      actionPriority: 1, // Jail is priority 1
      attributes: ['Unique', 'Roleblock Immune'],
      sheriffResult: 'Not Suspicious',
      investigatorGroup: 'Spy, Blackmailer, Jailor, Guardian Angel',
      consigliereSees: 'Jailor',
      nightActionType: 'JAIL',
      abilityConfig: {
        mustTarget: true,
        canTargetSelf: false,
        targetMustBeAlive: true,
        jailBlocksAllActions: true,
        jailPreventsVisits: true,
        canExecuteInJail: true,
        executionIsUnstoppable: true,
        usesPerGame: 3, // 3 executions
        losesAbilityIfKillsTown: true,
      },
      immunities: {
        roleblock: true,
      },
      specialInteractions: [],
      winConditions: {
        type: 'FACTION_ELIMINATION',
        eliminateAll: ['MAFIA', 'COVEN', 'NEUTRAL_KILLING']
      },
      icon: '⚖️',
      color: '#FFD700',
      goalEs: 'Ejecutar a todos los criminales y criaturas malignas.',
      abilitiesEs: 'Encierra a un jugador cada noche en un chat privado. Puedes ejecutarlo (3 veces). Si ejecutas Town, pierdes la habilidad de ejecutar.',
      attributesListEs: [
        'Encarcelar a alguien cada noche',
        'Ejecutar prisionero (Unstoppable, 3 usos)',
        'Prisionero no puede usar habilidad ni ser visitado',
        'Inmune a roleblock'
      ],
      goalEn: 'Lynch every criminal and evildoer.',
      abilitiesEn: 'Choose one person during the day to jail at night. You may decide to execute them.',
      attributesListEn: [
        'Jail someone each night',
        'Execute prisoner (Unstoppable, 3 uses)',
        'Prisoner cannot use ability or be visited',
        'Roleblock immune'
      ],
      strategyTips: [
        { phase: 'early_game', dayRange: [1, 3], tip: 'Usa el jail para obtener claims y reads. No ejecutes sin evidencia.' },
        { phase: 'mid_game', dayRange: [4, 6], tip: 'Ejecuta solo si estás 100% seguro. Perder ejecuciones duele.' },
        { phase: 'late_game', dayRange: [7, 99], tip: 'Jail a los sospechosos confirmados y ejecuta sin piedad.' }
      ],
      messages: {
        onStart: 'Eres el Jailor. Tu palabra es ley en este pueblo.',
        onJail: 'Has encarcelado a {target}.',
        onExecute: 'Has ejecutado a {target}. Era {role}.',
        onExecuteTown: 'Has ejecutado a un Town... Ya no puedes ejecutar más.',
      },
      difficulty: 'EXPERT',
      isUnique: true,
      isEnabled: true,
      requiresCoven: false,
      requiresVampire: false,
      tags: ['support', 'killing', 'visiting', 'unique', 'powerful'],
      achievements: [],
      expectedWinRate: 0.58,
      implementationComplexity: 8,
      popularity: 0.95
    }
  });

  // ========== MAFIA KILLING ==========

  await prisma.role.upsert({
    where: { slug: 'godfather' },
    update: {},
    create: {
      nameEs: 'Padrino',
      nameEn: 'Godfather',
      slug: 'godfather',
      factionId: mafiaFaction.id,
      alignmentId: mafiaKilling.id,
      attackValue: 1,
      defenseValue: 1,
      actionPriority: 6,
      attributes: ['Unique', 'Detection Immune', 'Night Immune'],
      sheriffResult: 'Not Suspicious', // Detection Immune!
      investigatorGroup: 'Bodyguard, Godfather, Arsonist, Crusader',
      consigliereSees: 'Godfather',
      nightActionType: 'KILL_SINGLE',
      abilityConfig: {
        mustTarget: true,
        canTargetSelf: false,
        targetMustBeAlive: true,
        appearsInnocent: true,
      },
      immunities: {
        detection: true,
        attack: true, // Basic defense
      },
      specialInteractions: [],
      winConditions: {
        type: 'FACTION_ELIMINATION',
        eliminateAll: ['TOWN', 'NEUTRAL_KILLING'],
        condition: 'mafia_equals_or_outnumbers'
      },
      icon: '👔',
      color: '#8B0000',
      goalEs: 'Matar a todos los que se opongan a la Mafia.',
      abilitiesEs: 'Ordenas el asesinato de Mafia cada noche. Si no hay Mafioso, matas tú mismo.',
      attributesListEs: [
        'Ordenas el kill de Mafia',
        'Inmune a detección del Sheriff',
        'Defensa Básica de noche'
      ],
      goalEn: 'Kill anyone that will not submit to the Mafia.',
      abilitiesEn: 'Choose to attack a person each night. If there is a Mafioso, they will attack instead.',
      attributesListEn: [
        'Order Mafia kills',
        'Detection immune to Sheriff',
        'Basic defense at night'
      ],
      strategyTips: [
        { phase: 'early_game', dayRange: [1, 3], tip: 'Elimina roles de investigación primero (Sheriff, Lookout).' },
        { phase: 'mid_game', dayRange: [4, 6], tip: 'Busca matar Jailor y roles únicos del Town.' },
        { phase: 'late_game', dayRange: [7, 99], tip: 'Coordina con Mafia para asegurar mayoría.' }
      ],
      messages: {
        onStart: 'Eres el Godfather de la Mafia. Tu palabra es absoluta.',
        onKill: 'La Mafia ha asesinado a {target}.',
        onKillFailed: 'Tu target tenía defensa.',
      },
      difficulty: 'EASY',
      isUnique: true,
      isEnabled: true,
      requiresCoven: false,
      requiresVampire: false,
      tags: ['killing', 'visiting', 'mafia', 'unique', 'powerful'],
      achievements: [],
      expectedWinRate: 0.35,
      implementationComplexity: 4,
      popularity: 0.90
    }
  });

  await prisma.role.upsert({
    where: { slug: 'mafioso' },
    update: {},
    create: {
      nameEs: 'Mafioso',
      nameEn: 'Mafioso',
      slug: 'mafioso',
      factionId: mafiaFaction.id,
      alignmentId: mafiaKilling.id,
      attackValue: 1,
      defenseValue: 0,
      actionPriority: 6,
      attributes: [],
      sheriffResult: 'Suspicious (Mafia)',
      investigatorGroup: 'Vigilante, Veteran, Mafioso, Pirate, Ambusher',
      consigliereSees: 'Mafioso',
      nightActionType: 'KILL_SINGLE',
      abilityConfig: {
        mustTarget: false, // Godfather ordena
        targetMustBeAlive: true,
        transformsInto: 'Godfather', // Si Godfather muere
      },
      immunities: {},
      specialInteractions: [],
      winConditions: {
        type: 'FACTION_ELIMINATION',
        eliminateAll: ['TOWN', 'NEUTRAL_KILLING'],
        condition: 'mafia_equals_or_outnumbers'
      },
      icon: '🔪',
      color: '#8B0000',
      goalEs: 'Matar a todos los que se opongan a la Mafia.',
      abilitiesEs: 'Ejecutas las órdenes del Godfather. Si el Godfather muere, te conviertes en el nuevo Godfather.',
      attributesListEs: ['Ejecutar asesinatos ordenados por Godfather', 'Promoción a Godfather si muere'],
      goalEn: 'Kill anyone that will not submit to the Mafia.',
      abilitiesEn: 'Carry out the Godfather\'s orders. You will become the Godfather if they die.',
      attributesListEn: ['Execute kills ordered by Godfather', 'Promoted to Godfather on death'],
      strategyTips: [
        { phase: 'general', tip: 'Sigue las órdenes del Godfather y mantente callado de día.' },
        { phase: 'mid_game', dayRange: [4, 6], tip: 'Si eres promovido a Godfather, toma el liderazgo.' }
      ],
      messages: {
        onStart: 'Eres un Mafioso. Ejecuta las órdenes del Godfather sin cuestionarlas.',
        onKill: 'Has asesinado a {target} por orden del Godfather.',
        onPromoted: '¡Te has convertido en el nuevo Godfather!',
      },
      difficulty: 'EASY',
      isUnique: false,
      isEnabled: true,
      requiresCoven: false,
      requiresVampire: false,
      tags: ['killing', 'visiting', 'mafia'],
      achievements: [],
      expectedWinRate: 0.34,
      implementationComplexity: 3,
      popularity: 0.80
    }
  });

  // ========== NEUTRAL EVIL ==========

  await prisma.role.upsert({
    where: { slug: 'jester' },
    update: {},
    create: {
      nameEs: 'Bufón',
      nameEn: 'Jester',
      slug: 'jester',
      factionId: neutralFaction.id,
      alignmentId: neutralEvil.id,
      attackValue: 3, // Unstoppable haunt
      defenseValue: 0,
      actionPriority: 6,
      attributes: [],
      sheriffResult: 'Not Suspicious',
      investigatorGroup: 'Framer, Vampire, Jester, Hex Master',
      consigliereSees: 'Jester',
      nightActionType: 'NONE',
      abilityConfig: {
        mustTarget: false,
      },
      immunities: {},
      specialInteractions: [],
      winConditions: {
        type: 'CUSTOM',
        condition: 'be_lynched',
      },
      icon: '🤡',
      color: '#FF69B4',
      goalEs: 'Conseguir que te ejecuten durante el día.',
      abilitiesEs: 'Si eres ejecutado durante el día, puedes elegir matar a uno de los que votaron culpable.',
      attributesListEs: ['Matar a un guilty voter si eres ejecutado', 'Ganas si te ejecutan de día'],
      goalEn: 'Get yourself lynched by any means necessary.',
      abilitiesEn: 'If you are lynched, you may choose to kill one guilty voter the following night.',
      attributesListEn: ['Kill one guilty voter if lynched', 'Win if lynched during the day'],
      strategyTips: [
        { phase: 'early_game', dayRange: [1, 3], tip: 'Actúa sospechoso pero no demasiado obvio.' },
        { phase: 'mid_game', dayRange: [4, 6], tip: 'Haz claims falsos y contradictorios.' },
        { phase: 'late_game', dayRange: [7, 99], tip: 'Confiesa ser malo cuando haya mayoría de votantes.' }
      ],
      messages: {
        onStart: 'Eres el Jester. Tu objetivo es engañar al pueblo para que te ejecuten.',
        onWin: '¡Has ganado! El pueblo cayó en tu trampa.',
        onHaunt: 'Eliges atormentar a {target}.',
      },
      difficulty: 'HARD',
      isUnique: false,
      isEnabled: true,
      requiresCoven: false,
      requiresVampire: false,
      tags: ['chaos', 'deception', 'neutral'],
      achievements: [],
      expectedWinRate: 0.12,
      implementationComplexity: 5,
      popularity: 0.75
    }
  });

  // ========== NEUTRAL KILLING ==========

  await prisma.role.upsert({
    where: { slug: 'serial-killer' },
    update: {},
    create: {
      nameEs: 'Asesino en Serie',
      nameEn: 'Serial Killer',
      slug: 'serial-killer',
      factionId: neutralFaction.id,
      alignmentId: neutralKilling.id,
      attackValue: 1,
      defenseValue: 1,
      actionPriority: 6,
      attributes: ['Night Immune', 'Kills Visitors'],
      sheriffResult: 'Suspicious (Serial Killer)',
      investigatorGroup: 'Doctor, Disguiser, Serial Killer, Potion Master',
      consigliereSees: 'Serial Killer',
      nightActionType: 'KILL_SINGLE',
      abilityConfig: {
        mustTarget: true,
        canTargetSelf: false,
        targetMustBeAlive: true,
        hasPassiveAbility: true,
        hasModes: true,
        modes: ['normal', 'cautious'],
        defaultMode: 'normal',
        killsRoleblocker: true,
        killsRoleblockerCondition: 'mode_normal',
      },
      immunities: {
        attack: true, // Basic defense
      },
      specialInteractions: [
        {
          withRole: 'Escort',
          condition: 'roleblocked',
          result: 'KILLS_ROLEBLOCKER',
          applies: 'mode_normal',
          priority: 'immediate',
          message: '¡Alguien intentó bloquearte! Los has asesinado.'
        },
        {
          withRole: 'Consort',
          condition: 'roleblocked',
          result: 'KILLS_ROLEBLOCKER',
          applies: 'mode_normal',
          priority: 'immediate',
          message: '¡Alguien intentó bloquearte! Los has asesinado.'
        },
        {
          withRole: 'Escort',
          condition: 'roleblocked',
          result: 'GETS_BLOCKED',
          applies: 'mode_cautious',
          priority: 'immediate',
          message: 'Alguien te bloqueó. No realizaste ninguna acción.'
        },
        {
          withRole: 'Jailor',
          condition: 'jailed',
          result: 'CANNOT_USE_ABILITY',
          priority: 'blocks_all',
          message: 'Estás en la cárcel. No puedes asesinar a nadie.'
        }
      ],
      winConditions: {
        type: 'CUSTOM',
        condition: 'be_last_alive'
      },
      icon: '🔪',
      color: '#8B0000',
      goalEs: 'Matar a todos los que se opongan a ti.',
      abilitiesEs: 'Asesinas a un jugador cada noche. Matas a cualquiera que te visite. Tienes modo Normal y Cauteloso.',
      attributesListEs: [
        'Defensa Básica',
        'Matas a todos tus visitantes',
        'Modo Normal: Matas a roleblockers',
        'Modo Cauteloso: Pierdes inmunidad si te bloquean'
      ],
      goalEn: 'Kill everyone who would oppose you.',
      abilitiesEn: 'Choose to attack a person each night. You kill anyone who visits you. You have Normal and Cautious modes.',
      attributesListEn: [
        'Basic defense',
        'Kill all visitors',
        'Normal mode: Kill roleblockers',
        'Cautious mode: Lose immunity if roleblocked'
      ],
      strategyTips: [
        { phase: 'early_game', dayRange: [1, 3], tip: 'No te expongas. Mata sin patrón obvio.' },
        { phase: 'mid_game', dayRange: [4, 6], tip: 'Elimina roles clave (Jailor, Sheriff). Evita Escorts.' },
        { phase: 'late_game', dayRange: [7, 99], tip: 'Usa modo Normal. Mata agresivamente.' }
      ],
      messages: {
        onStart: 'Eres un Asesino en Serie con sed de sangre insaciable.',
        onKill: 'Has asesinado a {target}. Era {role}.',
        onKillFailed: 'Tu target tenía defensa.',
        onVisitorKilled: 'Has asesinado a {visitor} cuando te visitó.',
        onRoleblocked: '¡Alguien intentó bloquearte! Los has asesinado.',
        onRoleblockedCautious: 'Alguien te bloqueó. No realizaste ninguna acción.',
      },
      difficulty: 'HARD',
      isUnique: false,
      isEnabled: true,
      requiresCoven: false,
      requiresVampire: false,
      tags: ['killing', 'visiting', 'night-immune', 'dangerous'],
      achievements: [
        {
          id: 'crime_scene',
          nameEs: 'Escena del Crimen',
          nameEn: 'Crime Scene',
          descriptionEs: 'Mata a 3 o más visitantes en una sola noche',
          condition: 'kill_3_visitors_one_night',
          rarity: 'rare'
        }
      ],
      expectedWinRate: 0.18,
      implementationComplexity: 7,
      popularity: 0.65
    }
  });

  // ========== NEUTRAL BENIGN ==========

  await prisma.role.upsert({
    where: { slug: 'survivor' },
    update: {},
    create: {
      nameEs: 'Superviviente',
      nameEn: 'Survivor',
      slug: 'survivor',
      factionId: neutralFaction.id,
      alignmentId: neutralBenign.id,
      attackValue: 0,
      defenseValue: 1, // Basic when vested
      actionPriority: 3,
      attributes: [],
      sheriffResult: 'Not Suspicious',
      investigatorGroup: 'Survivor, Vampire Hunter, Amnesiac, Medusa, Psychic',
      consigliereSees: 'Survivor',
      nightActionType: 'VEST',
      abilityConfig: {
        mustTarget: false,
        canTargetSelf: true,
        usesPerGame: 4,
      },
      immunities: {},
      specialInteractions: [],
      winConditions: {
        type: 'CUSTOM',
        condition: 'survive_to_end',
        canWinWithAny: true
      },
      icon: '🛡️',
      color: '#C0C0C0',
      goalEs: 'Sobrevivir hasta el final.',
      abilitiesEs: 'Tienes 4 chalecos antibalas que te dan Defensa Básica por una noche.',
      attributesListEs: ['4 chalecos antibalas (Defensa Básica)', 'Ganas con cualquier facción'],
      goalEn: 'Live to see the end of the game.',
      abilitiesEn: 'Put on a bulletproof vest at night, granting Basic defense. You have 4 uses.',
      attributesListEn: ['4 bulletproof vests (Basic defense)', 'Win with any faction'],
      strategyTips: [
        { phase: 'early_game', dayRange: [1, 3], tip: 'Guarda tus chalecos para late game.' },
        { phase: 'mid_game', dayRange: [4, 6], tip: 'Apoya a la facción que vaya ganando.' },
        { phase: 'late_game', dayRange: [7, 99], tip: 'Usa chalecos cuando seas sospechoso.' }
      ],
      messages: {
        onStart: 'Eres un Superviviente. Tu única misión es sobrevivir.',
        onVest: 'Te has puesto un chaleco antibalas.',
        onAttacked: '¡Fuiste atacado pero tu chaleco te salvó!',
      },
      difficulty: 'EASY',
      isUnique: false,
      isEnabled: true,
      requiresCoven: false,
      requiresVampire: false,
      tags: ['survivor', 'protective', 'neutral'],
      achievements: [],
      expectedWinRate: 0.45,
      implementationComplexity: 2,
      popularity: 0.60
    }
  });

  console.log(' (Base roles created - Total: 10 key roles)');

  // ========== ADDITIONAL TOWN INVESTIGATIVE ==========
  
  await prisma.role.upsert({
    where: { slug: 'lookout' },
    update: {},
    create: {
      nameEs: 'Vigía', nameEn: 'Lookout', slug: 'lookout',
      factionId: townFaction.id, alignmentId: townInvestigative.id,
      attackValue: 0, defenseValue: 0, actionPriority: 7,
      attributes: [], sheriffResult: 'Not Suspicious',
      investigatorGroup: 'Lookout, Forger, Witch, Coven Leader',
      consigliereSees: 'Lookout', nightActionType: 'LOOKOUT_WATCH',
      abilityConfig: { mustTarget: true, canTargetSelf: false, targetMustBeAlive: true },
      immunities: {}, specialInteractions: [],
      winConditions: { type: 'FACTION_ELIMINATION', eliminateAll: ['MAFIA', 'COVEN', 'NEUTRAL_KILLING'] },
      icon: '👁️', color: '#87CEEB',
      goalEs: 'Ejecutar a todos los criminales y criaturas malignas.',
      abilitiesEs: 'Vigila a un jugador cada noche para ver quién lo visita.',
      attributesListEs: ['Ver quién visita a tu objetivo'], goalEn: 'Lynch every criminal and evildoer.',
      abilitiesEn: 'Watch a player at night to see who visits them.',
      attributesListEn: ['See who visits your target'],
      strategyTips: [], messages: { onStart: 'Eres el Vigía. Observa quién visita a los demás.' },
      difficulty: 'MEDIUM', isUnique: false, isEnabled: true,
      requiresCoven: false, requiresVampire: false,
      tags: ['investigative', 'visiting'], achievements: [],
      expectedWinRate: 0.50, implementationComplexity: 4, popularity: 0.75
    }
  });

  await prisma.role.upsert({
    where: { slug: 'spy' },
    update: {},
    create: {
      nameEs: 'Espía', nameEn: 'Spy', slug: 'spy',
      factionId: townFaction.id, alignmentId: townInvestigative.id,
      attackValue: 0, defenseValue: 0, actionPriority: 7,
      attributes: [], sheriffResult: 'Not Suspicious',
      investigatorGroup: 'Spy, Blackmailer, Jailor, Guardian Angel',
      consigliereSees: 'Spy', nightActionType: 'SPY_BUG',
      abilityConfig: { mustTarget: false, canTargetSelf: false },
      immunities: {}, specialInteractions: [
        { trigger: 'NIGHT_START', condition: 'ALWAYS', effect: 'SEE_MAFIA_VISITS' }
      ],
      winConditions: { type: 'FACTION_ELIMINATION', eliminateAll: ['MAFIA', 'COVEN', 'NEUTRAL_KILLING'] },
      icon: '🕵️', color: '#4682B4',
      goalEs: 'Ejecutar a todos los criminales y criaturas malignas.',
      abilitiesEs: 'Puedes ver los visitantes de la Mafia y leer su chat nocturno.',
      attributesListEs: ['Ver visitantes de Mafia', 'Leer chat de Mafia'],
      goalEn: 'Lynch every criminal and evildoer.',
      abilitiesEn: 'You can see Mafia visits and read their night chat.',
      attributesListEn: ['See Mafia visits', 'Read Mafia chat'],
      strategyTips: [], messages: { onStart: 'Eres el Espía. Intercepta las comunicaciones de la Mafia.' },
      difficulty: 'HARD', isUnique: false, isEnabled: true,
      requiresCoven: false, requiresVampire: false,
      tags: ['investigative'], achievements: [],
      expectedWinRate: 0.48, implementationComplexity: 5, popularity: 0.65
    }
  });

  await prisma.role.upsert({
    where: { slug: 'psychic' },
    update: {},
    create: {
      nameEs: 'Psíquica', nameEn: 'Psychic', slug: 'psychic',
      factionId: townFaction.id, alignmentId: townInvestigative.id,
      attackValue: 0, defenseValue: 0, actionPriority: 7,
      attributes: [], sheriffResult: 'Not Suspicious',
      investigatorGroup: 'Survivor, Vampire Hunter, Amnesiac, Medusa, Psychic',
      consigliereSees: 'Psychic', nightActionType: 'PSYCHIC_VISION',
      abilityConfig: { mustTarget: false, isAutomatic: true },
      immunities: {}, specialInteractions: [],
      winConditions: { type: 'FACTION_ELIMINATION', eliminateAll: ['MAFIA', 'COVEN', 'NEUTRAL_KILLING'] },
      icon: '🔮', color: '#DA70D6',
      goalEs: 'Ejecutar a todos los criminales y criaturas malignas.',
      abilitiesEs: 'Noches impares: 1 de 3 nombres es malvado. Noches pares: 2 de 3 nombres son buenos.',
      attributesListEs: ['Visiones automáticas cada noche'],
      goalEn: 'Lynch every criminal and evildoer.',
      abilitiesEn: 'Odd nights: 1 of 3 names is evil. Even nights: 2 of 3 names are good.',
      attributesListEn: ['Automatic visions each night'],
      strategyTips: [], messages: { onStart: 'Eres la Psíquica. Recibes visiones del más allá.' },
      difficulty: 'MEDIUM', isUnique: false, isEnabled: true,
      requiresCoven: false, requiresVampire: false,
      tags: ['investigative'], achievements: [],
      expectedWinRate: 0.50, implementationComplexity: 4, popularity: 0.70
    }
  });

  await prisma.role.upsert({
    where: { slug: 'tracker' },
    update: {},
    create: {
      nameEs: 'Rastreador', nameEn: 'Tracker', slug: 'tracker',
      factionId: townFaction.id, alignmentId: townInvestigative.id,
      attackValue: 0, defenseValue: 0, actionPriority: 7,
      attributes: [], sheriffResult: 'Not Suspicious',
      investigatorGroup: 'Investigator, Consigliere, Mayor, Tracker, Plaguebearer',
      consigliereSees: 'Tracker', nightActionType: 'TRACKER_TRACK',
      abilityConfig: { mustTarget: true, canTargetSelf: false, targetMustBeAlive: true },
      immunities: {}, specialInteractions: [],
      winConditions: { type: 'FACTION_ELIMINATION', eliminateAll: ['MAFIA', 'COVEN', 'NEUTRAL_KILLING'] },
      icon: '🐾', color: '#8FBC8F',
      goalEs: 'Ejecutar a todos los criminales y criaturas malignas.',
      abilitiesEs: 'Rastrea a un jugador cada noche para ver a quién visita.',
      attributesListEs: ['Ver a quién visita tu objetivo'],
      goalEn: 'Lynch every criminal and evildoer.',
      abilitiesEn: 'Track a player at night to see who they visit.',
      attributesListEn: ['See who your target visits'],
      strategyTips: [], messages: { onStart: 'Eres el Rastreador. Sigue los pasos de los sospechosos.' },
      difficulty: 'MEDIUM', isUnique: false, isEnabled: true,
      requiresCoven: false, requiresVampire: false,
      tags: ['investigative', 'visiting'], achievements: [],
      expectedWinRate: 0.50, implementationComplexity: 4, popularity: 0.65
    }
  });

  // ========== ADDITIONAL TOWN PROTECTIVE ==========

  await prisma.role.upsert({
    where: { slug: 'bodyguard' },
    update: {},
    create: {
      nameEs: 'Guardaespaldas', nameEn: 'Bodyguard', slug: 'bodyguard',
      factionId: townFaction.id, alignmentId: townProtective.id,
      attackValue: 2, defenseValue: 0, actionPriority: 3,
      attributes: [], sheriffResult: 'Not Suspicious',
      investigatorGroup: 'Bodyguard, Godfather, Arsonist, Crusader',
      consigliereSees: 'Bodyguard', nightActionType: 'PROTECT',
      abilityConfig: { mustTarget: true, canTargetSelf: false, selfVests: 1 },
      immunities: {}, specialInteractions: [
        { trigger: 'TARGET_ATTACKED', condition: 'PROTECTING', effect: 'BOTH_DIE' }
      ],
      winConditions: { type: 'FACTION_ELIMINATION', eliminateAll: ['MAFIA', 'COVEN', 'NEUTRAL_KILLING'] },
      icon: '🛡️', color: '#228B22',
      goalEs: 'Ejecutar a todos los criminales y criaturas malignas.',
      abilitiesEs: 'Protege a un jugador cada noche. Si es atacado, tú y el atacante mueren. 1 chaleco.',
      attributesListEs: ['Proteger objetivo', 'Contra-ataque al atacante', '1 auto-protección'],
      goalEn: 'Lynch every criminal and evildoer.',
      abilitiesEn: 'Protect a player at night. If attacked, you and attacker both die. 1 vest.',
      attributesListEn: ['Protect target', 'Counter-attack attacker', '1 self-protection'],
      strategyTips: [], messages: { onStart: 'Eres el Guardaespaldas. Protege al pueblo con tu vida.' },
      difficulty: 'MEDIUM', isUnique: false, isEnabled: true,
      requiresCoven: false, requiresVampire: false,
      tags: ['protective', 'visiting', 'killing'], achievements: [],
      expectedWinRate: 0.45, implementationComplexity: 5, popularity: 0.70
    }
  });

  await prisma.role.upsert({
    where: { slug: 'crusader' },
    update: {},
    create: {
      nameEs: 'Cruzado', nameEn: 'Crusader', slug: 'crusader',
      factionId: townFaction.id, alignmentId: townProtective.id,
      attackValue: 1, defenseValue: 0, actionPriority: 3,
      attributes: [], sheriffResult: 'Not Suspicious',
      investigatorGroup: 'Bodyguard, Godfather, Arsonist, Crusader',
      consigliereSees: 'Crusader', nightActionType: 'PROTECT_VISITORS',
      abilityConfig: { mustTarget: true, canTargetSelf: false },
      immunities: {}, specialInteractions: [
        { trigger: 'TARGET_VISITED', condition: 'PROTECTING', effect: 'KILL_RANDOM_VISITOR' }
      ],
      winConditions: { type: 'FACTION_ELIMINATION', eliminateAll: ['MAFIA', 'COVEN', 'NEUTRAL_KILLING'] },
      icon: '⚔️', color: '#C0C0C0',
      goalEs: 'Ejecutar a todos los criminales y criaturas malignas.',
      abilitiesEs: 'Protege a un jugador y mata a un visitante aleatorio (puede matar aliados).',
      attributesListEs: ['Proteger objetivo', 'Mata visitante aleatorio'],
      goalEn: 'Lynch every criminal and evildoer.',
      abilitiesEn: 'Protect a player and kill a random visitor (can kill allies).',
      attributesListEn: ['Protect target', 'Kill random visitor'],
      strategyTips: [], messages: { onStart: 'Eres el Cruzado. Protege con espada en mano.' },
      difficulty: 'HARD', isUnique: false, isEnabled: true,
      requiresCoven: false, requiresVampire: false,
      tags: ['protective', 'visiting', 'killing'], achievements: [],
      expectedWinRate: 0.48, implementationComplexity: 6, popularity: 0.55
    }
  });

  await prisma.role.upsert({
    where: { slug: 'trapper' },
    update: {},
    create: {
      nameEs: 'Trampero', nameEn: 'Trapper', slug: 'trapper',
      factionId: townFaction.id, alignmentId: townProtective.id,
      attackValue: 2, defenseValue: 0, actionPriority: 3,
      attributes: [], sheriffResult: 'Not Suspicious',
      investigatorGroup: 'Medium, Janitor, Retributionist, Necromancer, Trapper',
      consigliereSees: 'Trapper', nightActionType: 'TRAP',
      abilityConfig: { mustTarget: true, canTargetSelf: false, buildTime: 1 },
      immunities: {}, specialInteractions: [],
      winConditions: { type: 'FACTION_ELIMINATION', eliminateAll: ['MAFIA', 'COVEN', 'NEUTRAL_KILLING'] },
      icon: '🪤', color: '#8B4513',
      goalEs: 'Ejecutar a todos los criminales y criaturas malignas.',
      abilitiesEs: 'Coloca una trampa (1 noche construir). Mata atacantes del objetivo.',
      attributesListEs: ['Trampa necesita 1 noche', 'Mata atacantes'],
      goalEn: 'Lynch every criminal and evildoer.',
      abilitiesEn: 'Set a trap (1 night to build). Kills attackers of the target.',
      attributesListEn: ['Trap needs 1 night', 'Kills attackers'],
      strategyTips: [], messages: { onStart: 'Eres el Trampero. Coloca trampas mortales.' },
      difficulty: 'HARD', isUnique: false, isEnabled: true,
      requiresCoven: false, requiresVampire: false,
      tags: ['protective', 'killing'], achievements: [],
      expectedWinRate: 0.45, implementationComplexity: 5, popularity: 0.50
    }
  });

  await prisma.role.upsert({
    where: { slug: 'guardian-angel' },
    update: {},
    create: {
      nameEs: 'Ángel Guardián', nameEn: 'Guardian Angel', slug: 'guardian-angel',
      factionId: neutralFaction.id, alignmentId: neutralBenign.id,
      attackValue: 0, defenseValue: 1, actionPriority: 3,
      attributes: ['Unique Target'], sheriffResult: 'Not Suspicious',
      investigatorGroup: 'Spy, Blackmailer, Jailor, Guardian Angel',
      consigliereSees: 'Guardian Angel', nightActionType: 'PROTECT_TARGET',
      abilityConfig: { mustTarget: true, canTargetSelf: false, uses: 2, assignTarget: true },
      immunities: {}, specialInteractions: [
        { trigger: 'TARGET_DIES', condition: 'ALWAYS', effect: 'BECOME_SURVIVOR' }
      ],
      winConditions: { type: 'KEEP_TARGET_ALIVE' },
      icon: '👼', color: '#FFFFFF',
      goalEs: 'Mantener con vida a tu protegido hasta el final.',
      abilitiesEs: 'Protege a tu objetivo asignado 2 veces. Si muere, te conviertes en Superviviente.',
      attributesListEs: ['2 protecciones', 'Se convierte en Survivor si target muere'],
      goalEn: 'Keep your target alive until the end.',
      abilitiesEn: 'Protect your assigned target 2 times. Become Survivor if target dies.',
      attributesListEn: ['2 protections', 'Becomes Survivor if target dies'],
      strategyTips: [], messages: { onStart: 'Eres el Ángel Guardián. Protege a tu objetivo.' },
      difficulty: 'MEDIUM', isUnique: false, isEnabled: true,
      requiresCoven: false, requiresVampire: false,
      tags: ['protective', 'neutral'], achievements: [],
      expectedWinRate: 0.40, implementationComplexity: 5, popularity: 0.60
    }
  });

  // ========== ADDITIONAL TOWN KILLING ==========

  await prisma.role.upsert({
    where: { slug: 'veteran' },
    update: {},
    create: {
      nameEs: 'Veterano', nameEn: 'Veteran', slug: 'veteran',
      factionId: townFaction.id, alignmentId: townKilling.id,
      attackValue: 2, defenseValue: 1, actionPriority: 5,
      attributes: ['Alert'], sheriffResult: 'Not Suspicious',
      investigatorGroup: 'Vigilante, Veteran, Mafioso, Pirate, Ambusher',
      consigliereSees: 'Veteran', nightActionType: 'ALERT',
      abilityConfig: { mustTarget: false, canTargetSelf: true, uses: 3 },
      immunities: { detection: true, roleblock: true },
      specialInteractions: [
        { trigger: 'VISITED_WHILE_ALERT', condition: 'ALERT_ACTIVE', effect: 'KILL_ALL_VISITORS' }
      ],
      winConditions: { type: 'FACTION_ELIMINATION', eliminateAll: ['MAFIA', 'COVEN', 'NEUTRAL_KILLING'] },
      icon: '🎖️', color: '#556B2F',
      goalEs: 'Ejecutar a todos los criminales y criaturas malignas.',
      abilitiesEs: '3 alertas. Mata a TODOS los visitantes durante la alerta. Inmune a detección y bloqueo.',
      attributesListEs: ['3 alertas', 'Mata todos los visitantes', 'Inmune a detección y roleblock'],
      goalEn: 'Lynch every criminal and evildoer.',
      abilitiesEn: '3 alerts. Kill ALL visitors during alert. Detection and roleblock immune.',
      attributesListEn: ['3 alerts', 'Kill all visitors', 'Detection and roleblock immune'],
      strategyTips: [], messages: { onStart: 'Eres el Veterano. Usa tus alertas sabiamente.' },
      difficulty: 'MEDIUM', isUnique: false, isEnabled: true,
      requiresCoven: false, requiresVampire: false,
      tags: ['killing', 'protective'], achievements: [],
      expectedWinRate: 0.52, implementationComplexity: 5, popularity: 0.80
    }
  });

  await prisma.role.upsert({
    where: { slug: 'vampire-hunter' },
    update: {},
    create: {
      nameEs: 'Cazador de Vampiros', nameEn: 'Vampire Hunter', slug: 'vampire-hunter',
      factionId: townFaction.id, alignmentId: townKilling.id,
      attackValue: 1, defenseValue: 0, actionPriority: 5,
      attributes: [], sheriffResult: 'Not Suspicious',
      investigatorGroup: 'Survivor, Vampire Hunter, Amnesiac, Medusa, Psychic',
      consigliereSees: 'Vampire Hunter', nightActionType: 'KILL_SINGLE',
      abilityConfig: { mustTarget: true, canTargetSelf: false },
      immunities: { vampire: true },
      specialInteractions: [
        { trigger: 'ALL_VAMPIRES_DEAD', condition: 'GAME', effect: 'BECOME_VIGILANTE' }
      ],
      winConditions: { type: 'FACTION_ELIMINATION', eliminateAll: ['MAFIA', 'COVEN', 'NEUTRAL_KILLING'] },
      icon: '🧛‍♂️', color: '#DC143C',
      goalEs: 'Eliminar todos los vampiros.',
      abilitiesEs: 'Detecta y mata vampiros. Si todos los vampiros mueren, te conviertes en Vigilante.',
      attributesListEs: ['Detecta vampiros', 'Mata vampiros', 'Se convierte en Vigilante'],
      goalEn: 'Eliminate all vampires.',
      abilitiesEn: 'Detect and kill vampires. Becomes Vigilante if all vampires die.',
      attributesListEn: ['Detect vampires', 'Kill vampires', 'Becomes Vigilante'],
      strategyTips: [], messages: { onStart: 'Eres el Cazador de Vampiros.' },
      difficulty: 'MEDIUM', isUnique: false, isEnabled: true,
      requiresCoven: false, requiresVampire: true,
      tags: ['killing', 'investigative'], achievements: [],
      expectedWinRate: 0.50, implementationComplexity: 4, popularity: 0.55
    }
  });

  // ========== ADDITIONAL TOWN SUPPORT ==========

  await prisma.role.upsert({
    where: { slug: 'escort' },
    update: {},
    create: {
      nameEs: 'Escort', nameEn: 'Escort', slug: 'escort',
      factionId: townFaction.id, alignmentId: townSupport.id,
      attackValue: 0, defenseValue: 0, actionPriority: 2,
      attributes: [], sheriffResult: 'Not Suspicious',
      investigatorGroup: 'Escort, Transporter, Consort, Hypnotist',
      consigliereSees: 'Escort', nightActionType: 'ROLEBLOCK',
      abilityConfig: { mustTarget: true, canTargetSelf: false },
      immunities: {},
      specialInteractions: [
        { trigger: 'ROLEBLOCK_SK', condition: 'TARGET_IS_SK', effect: 'DIE' },
        { trigger: 'ROLEBLOCK_WW', condition: 'FULL_MOON', effect: 'DIE' }
      ],
      winConditions: { type: 'FACTION_ELIMINATION', eliminateAll: ['MAFIA', 'COVEN', 'NEUTRAL_KILLING'] },
      icon: '💃', color: '#FF69B4',
      goalEs: 'Ejecutar a todos los criminales y criaturas malignas.',
      abilitiesEs: 'Bloquea la habilidad de un jugador cada noche. Mueres si bloqueas al SK o WW.',
      attributesListEs: ['Bloquea habilidades', 'Muere si bloquea SK/WW'],
      goalEn: 'Lynch every criminal and evildoer.',
      abilitiesEn: 'Block a player\'s ability each night. Die if you block SK or WW.',
      attributesListEn: ['Block abilities', 'Die if blocking SK/WW'],
      strategyTips: [], messages: { onStart: 'Eres la Escort. Bloquea a los sospechosos.' },
      difficulty: 'MEDIUM', isUnique: false, isEnabled: true,
      requiresCoven: false, requiresVampire: false,
      tags: ['support', 'visiting'], achievements: [],
      expectedWinRate: 0.48, implementationComplexity: 4, popularity: 0.65
    }
  });

  await prisma.role.upsert({
    where: { slug: 'mayor' },
    update: {},
    create: {
      nameEs: 'Alcalde', nameEn: 'Mayor', slug: 'mayor',
      factionId: townFaction.id, alignmentId: townSupport.id,
      attackValue: 0, defenseValue: 0, actionPriority: 0,
      attributes: ['Unique'], sheriffResult: 'Not Suspicious',
      investigatorGroup: 'Investigator, Consigliere, Mayor, Tracker, Plaguebearer',
      consigliereSees: 'Mayor', nightActionType: 'NONE',
      abilityConfig: { dayAbility: true, reveal: true, voteMultiplier: 3 },
      immunities: {},
      specialInteractions: [
        { trigger: 'REVEAL', condition: 'DAY_PHASE', effect: 'VOTE_X3_NO_HEAL' }
      ],
      winConditions: { type: 'FACTION_ELIMINATION', eliminateAll: ['MAFIA', 'COVEN', 'NEUTRAL_KILLING'] },
      icon: '🏛️', color: '#FFD700',
      goalEs: 'Ejecutar a todos los criminales y criaturas malignas.',
      abilitiesEs: 'Revélate públicamente: tu voto cuenta x3. No puedes ser curado ni susurrar tras revelarte.',
      attributesListEs: ['Voto x3 tras revelarse', 'No puede ser curado revelado'],
      goalEn: 'Lynch every criminal and evildoer.',
      abilitiesEn: 'Reveal yourself: vote counts x3. Can\'t be healed or whispered after reveal.',
      attributesListEn: ['Vote x3 after reveal', 'Can\'t be healed when revealed'],
      strategyTips: [], messages: { onStart: 'Eres el Alcalde. Usa tu influencia sabiamente.' },
      difficulty: 'EASY', isUnique: true, isEnabled: true,
      requiresCoven: false, requiresVampire: false,
      tags: ['support', 'unique'], achievements: [],
      expectedWinRate: 0.55, implementationComplexity: 3, popularity: 0.75
    }
  });

  await prisma.role.upsert({
    where: { slug: 'medium' },
    update: {},
    create: {
      nameEs: 'Médium', nameEn: 'Medium', slug: 'medium',
      factionId: townFaction.id, alignmentId: townSupport.id,
      attackValue: 0, defenseValue: 0, actionPriority: 0,
      attributes: [], sheriffResult: 'Not Suspicious',
      investigatorGroup: 'Medium, Janitor, Retributionist, Necromancer, Trapper',
      consigliereSees: 'Medium', nightActionType: 'SEANCE',
      abilityConfig: { mustTarget: true, canTargetSelf: false, targetMustBeDead: true },
      immunities: {}, specialInteractions: [],
      winConditions: { type: 'FACTION_ELIMINATION', eliminateAll: ['MAFIA', 'COVEN', 'NEUTRAL_KILLING'] },
      icon: '🕯️', color: '#9370DB',
      goalEs: 'Ejecutar a todos los criminales y criaturas malignas.',
      abilitiesEs: 'Habla con un muerto cada noche. Puedes hacer una sesión para comunicar su mensaje.',
      attributesListEs: ['Habla con muertos', 'Séance con el pueblo'],
      goalEn: 'Lynch every criminal and evildoer.',
      abilitiesEn: 'Talk to a dead player each night. Can séance to relay their message.',
      attributesListEn: ['Talk to the dead', 'Séance with the town'],
      strategyTips: [], messages: { onStart: 'Eres el Médium. Los muertos te hablan.' },
      difficulty: 'EASY', isUnique: false, isEnabled: true,
      requiresCoven: false, requiresVampire: false,
      tags: ['support'], achievements: [],
      expectedWinRate: 0.45, implementationComplexity: 4, popularity: 0.55
    }
  });

  await prisma.role.upsert({
    where: { slug: 'retributionist' },
    update: {},
    create: {
      nameEs: 'Retribucionista', nameEn: 'Retributionist', slug: 'retributionist',
      factionId: townFaction.id, alignmentId: townSupport.id,
      attackValue: 0, defenseValue: 0, actionPriority: 5,
      attributes: ['Unique'], sheriffResult: 'Not Suspicious',
      investigatorGroup: 'Medium, Janitor, Retributionist, Necromancer, Trapper',
      consigliereSees: 'Retributionist', nightActionType: 'REVIVE',
      abilityConfig: { mustTarget: true, canTargetSelf: false, uses: 1, targetMustBeDead: true, targetFaction: 'Town' },
      immunities: {}, specialInteractions: [],
      winConditions: { type: 'FACTION_ELIMINATION', eliminateAll: ['MAFIA', 'COVEN', 'NEUTRAL_KILLING'] },
      icon: '⚡', color: '#FFD700',
      goalEs: 'Ejecutar a todos los criminales y criaturas malignas.',
      abilitiesEs: 'Revive a un miembro muerto del pueblo (1 uso).',
      attributesListEs: ['1 revivir', 'Solo Town'],
      goalEn: 'Lynch every criminal and evildoer.',
      abilitiesEn: 'Revive a dead Town member (1 use).',
      attributesListEn: ['1 revive', 'Town only'],
      strategyTips: [], messages: { onStart: 'Eres el Retribucionista. Trae de vuelta a un aliado.' },
      difficulty: 'EXPERT', isUnique: true, isEnabled: true,
      requiresCoven: false, requiresVampire: false,
      tags: ['support', 'unique'], achievements: [],
      expectedWinRate: 0.55, implementationComplexity: 7, popularity: 0.70
    }
  });

  await prisma.role.upsert({
    where: { slug: 'transporter' },
    update: {},
    create: {
      nameEs: 'Transportador', nameEn: 'Transporter', slug: 'transporter',
      factionId: townFaction.id, alignmentId: townSupport.id,
      attackValue: 0, defenseValue: 0, actionPriority: 4,
      attributes: [], sheriffResult: 'Not Suspicious',
      investigatorGroup: 'Escort, Transporter, Consort, Hypnotist',
      consigliereSees: 'Transporter', nightActionType: 'TRANSPORT',
      abilityConfig: { mustTarget: true, canTargetSelf: true, dualTarget: true },
      immunities: { roleblock: true }, specialInteractions: [],
      winConditions: { type: 'FACTION_ELIMINATION', eliminateAll: ['MAFIA', 'COVEN', 'NEUTRAL_KILLING'] },
      icon: '🚗', color: '#DAA520',
      goalEs: 'Ejecutar a todos los criminales y criaturas malignas.',
      abilitiesEs: 'Intercambia dos jugadores. Todas las acciones dirigidas a ellos se redirigen.',
      attributesListEs: ['Intercambia 2 jugadores', 'Redirige todas las acciones'],
      goalEn: 'Lynch every criminal and evildoer.',
      abilitiesEn: 'Swap two players. All actions targeting them are redirected.',
      attributesListEn: ['Swap 2 players', 'Redirect all actions'],
      strategyTips: [], messages: { onStart: 'Eres el Transportador. Mueve jugadores estratégicamente.' },
      difficulty: 'EXPERT', isUnique: false, isEnabled: true,
      requiresCoven: false, requiresVampire: false,
      tags: ['support', 'visiting'], achievements: [],
      expectedWinRate: 0.50, implementationComplexity: 8, popularity: 0.60
    }
  });

  // ========== MAFIA KILLING ==========

  await prisma.role.upsert({
    where: { slug: 'ambusher' },
    update: {},
    create: {
      nameEs: 'Emboscador', nameEn: 'Ambusher', slug: 'ambusher',
      factionId: mafiaFaction.id, alignmentId: mafiaKilling.id,
      attackValue: 1, defenseValue: 0, actionPriority: 5,
      attributes: [], sheriffResult: 'Suspicious (Mafia)',
      investigatorGroup: 'Vigilante, Veteran, Mafioso, Pirate, Ambusher',
      consigliereSees: 'Ambusher', nightActionType: 'KILL_VISITORS',
      abilityConfig: { mustTarget: true, canTargetSelf: false },
      immunities: {}, specialInteractions: [],
      winConditions: { type: 'FACTION_DOMINATION', factionMustEqual: ['TOWN'] },
      icon: '🗡️', color: '#8B0000',
      goalEs: 'Eliminar a todo el que se oponga a la Mafia.',
      abilitiesEs: 'Embosca a un objetivo. Mata a TODOS los visitantes (puede matar aliados Mafia).',
      attributesListEs: ['Mata visitantes del objetivo', 'Puede matar aliados'],
      goalEn: 'Kill anyone who opposes the Mafia.',
      abilitiesEn: 'Ambush a target. Kill ALL visitors (can kill Mafia allies).',
      attributesListEn: ['Kill target visitors', 'Can kill allies'],
      strategyTips: [], messages: { onStart: 'Eres el Emboscador. Prepara emboscadas mortales.' },
      difficulty: 'HARD', isUnique: false, isEnabled: true,
      requiresCoven: false, requiresVampire: false,
      tags: ['killing', 'mafia'], achievements: [],
      expectedWinRate: 0.50, implementationComplexity: 5, popularity: 0.55
    }
  });

  // ========== MAFIA DECEPTION ==========

  await prisma.role.upsert({
    where: { slug: 'disguiser' },
    update: {},
    create: {
      nameEs: 'Disfrazador', nameEn: 'Disguiser', slug: 'disguiser',
      factionId: mafiaFaction.id, alignmentId: mafiaDeception.id,
      attackValue: 0, defenseValue: 0, actionPriority: 8,
      attributes: [], sheriffResult: 'Suspicious (Mafia)',
      investigatorGroup: 'Doctor, Disguiser, Serial Killer, Potion Master',
      consigliereSees: 'Disguiser', nightActionType: 'DISGUISE',
      abilityConfig: { mustTarget: true, canTargetSelf: true },
      immunities: {}, specialInteractions: [],
      winConditions: { type: 'FACTION_DOMINATION', factionMustEqual: ['TOWN'] },
      icon: '🎭', color: '#800080',
      goalEs: 'Eliminar a todo el que se oponga a la Mafia.',
      abilitiesEs: 'Disfrazarte como otro jugador. Si mueres, aparecerás como el objetivo.',
      attributesListEs: ['Disfraz nocturno', 'Intercambia apariencia al morir'],
      goalEn: 'Kill anyone who opposes the Mafia.',
      abilitiesEn: 'Disguise yourself as another player. If you die, you appear as the target.',
      attributesListEn: ['Night disguise', 'Swap appearance on death'],
      strategyTips: [], messages: { onStart: 'Eres el Disfrazador. Engaña al pueblo.' },
      difficulty: 'HARD', isUnique: false, isEnabled: true,
      requiresCoven: false, requiresVampire: false,
      tags: ['deception', 'mafia', 'visiting'], achievements: [],
      expectedWinRate: 0.48, implementationComplexity: 6, popularity: 0.50
    }
  });

  await prisma.role.upsert({
    where: { slug: 'forger' },
    update: {},
    create: {
      nameEs: 'Falsificador', nameEn: 'Forger', slug: 'forger',
      factionId: mafiaFaction.id, alignmentId: mafiaDeception.id,
      attackValue: 0, defenseValue: 0, actionPriority: 8,
      attributes: [], sheriffResult: 'Suspicious (Mafia)',
      investigatorGroup: 'Lookout, Forger, Witch, Coven Leader',
      consigliereSees: 'Forger', nightActionType: 'FORGE',
      abilityConfig: { mustTarget: true, canTargetSelf: false, uses: 3 },
      immunities: {}, specialInteractions: [],
      winConditions: { type: 'FACTION_DOMINATION', factionMustEqual: ['TOWN'] },
      icon: '📝', color: '#DAA520',
      goalEs: 'Eliminar a todo el que se oponga a la Mafia.',
      abilitiesEs: 'Falsifica el testamento de un jugador (3 usos). Se muestra al morir.',
      attributesListEs: ['3 falsificaciones', 'Reemplaza testamento'],
      goalEn: 'Kill anyone who opposes the Mafia.',
      abilitiesEn: 'Forge a player\'s will (3 uses). Shown on death.',
      attributesListEn: ['3 forgeries', 'Replace will'],
      strategyTips: [], messages: { onStart: 'Eres el Falsificador. Crea testamentos falsos.' },
      difficulty: 'MEDIUM', isUnique: false, isEnabled: true,
      requiresCoven: false, requiresVampire: false,
      tags: ['deception', 'mafia', 'visiting'], achievements: [],
      expectedWinRate: 0.48, implementationComplexity: 4, popularity: 0.55
    }
  });

  await prisma.role.upsert({
    where: { slug: 'framer' },
    update: {},
    create: {
      nameEs: 'Incriminador', nameEn: 'Framer', slug: 'framer',
      factionId: mafiaFaction.id, alignmentId: mafiaDeception.id,
      attackValue: 0, defenseValue: 0, actionPriority: 8,
      attributes: [], sheriffResult: 'Suspicious (Mafia)',
      investigatorGroup: 'Framer, Vampire, Jester, Hex Master',
      consigliereSees: 'Framer', nightActionType: 'FRAME',
      abilityConfig: { mustTarget: true, canTargetSelf: false },
      immunities: {}, specialInteractions: [],
      winConditions: { type: 'FACTION_DOMINATION', factionMustEqual: ['TOWN'] },
      icon: '🖼️', color: '#FF4500',
      goalEs: 'Eliminar a todo el que se oponga a la Mafia.',
      abilitiesEs: 'Incrimina a un jugador. Sheriff lo ve sospechoso. Investigator ve el grupo del Framer.',
      attributesListEs: ['Incrimina jugador', 'Dura 1 noche'],
      goalEn: 'Kill anyone who opposes the Mafia.',
      abilitiesEn: 'Frame a player. Sheriff sees Suspicious. Investigator sees Framer group.',
      attributesListEn: ['Frame player', 'Lasts 1 night'],
      strategyTips: [], messages: { onStart: 'Eres el Incriminador. Incrimina a los inocentes.' },
      difficulty: 'MEDIUM', isUnique: false, isEnabled: true,
      requiresCoven: false, requiresVampire: false,
      tags: ['deception', 'mafia', 'visiting'], achievements: [],
      expectedWinRate: 0.48, implementationComplexity: 4, popularity: 0.50
    }
  });

  await prisma.role.upsert({
    where: { slug: 'hypnotist' },
    update: {},
    create: {
      nameEs: 'Hipnotista', nameEn: 'Hypnotist', slug: 'hypnotist',
      factionId: mafiaFaction.id, alignmentId: mafiaDeception.id,
      attackValue: 0, defenseValue: 0, actionPriority: 8,
      attributes: [], sheriffResult: 'Suspicious (Mafia)',
      investigatorGroup: 'Escort, Transporter, Consort, Hypnotist',
      consigliereSees: 'Hypnotist', nightActionType: 'HYPNOTIZE',
      abilityConfig: { mustTarget: true, canTargetSelf: false },
      immunities: {}, specialInteractions: [],
      winConditions: { type: 'FACTION_DOMINATION', factionMustEqual: ['TOWN'] },
      icon: '🌀', color: '#9400D3',
      goalEs: 'Eliminar a todo el que se oponga a la Mafia.',
      abilitiesEs: 'Envía un mensaje falso de notificación al objetivo para confundirlo.',
      attributesListEs: ['Envía notificación falsa', 'Confunde investigadores'],
      goalEn: 'Kill anyone who opposes the Mafia.',
      abilitiesEn: 'Send a fake notification message to the target to confuse them.',
      attributesListEn: ['Send fake notification', 'Confuse investigators'],
      strategyTips: [], messages: { onStart: 'Eres el Hipnotista. Engaña con mensajes falsos.' },
      difficulty: 'HARD', isUnique: false, isEnabled: true,
      requiresCoven: false, requiresVampire: false,
      tags: ['deception', 'mafia', 'visiting'], achievements: [],
      expectedWinRate: 0.48, implementationComplexity: 4, popularity: 0.45
    }
  });

  // ========== MAFIA SUPPORT ==========

  await prisma.role.upsert({
    where: { slug: 'janitor' },
    update: {},
    create: {
      nameEs: 'Conserje', nameEn: 'Janitor', slug: 'janitor',
      factionId: mafiaFaction.id, alignmentId: mafiaDeception.id,
      attackValue: 0, defenseValue: 0, actionPriority: 8,
      attributes: [], sheriffResult: 'Suspicious (Mafia)',
      investigatorGroup: 'Medium, Janitor, Retributionist, Necromancer, Trapper',
      consigliereSees: 'Janitor', nightActionType: 'CLEAN',
      abilityConfig: { mustTarget: true, canTargetSelf: false, uses: 3 },
      immunities: {}, specialInteractions: [],
      winConditions: { type: 'FACTION_DOMINATION', factionMustEqual: ['TOWN'] },
      icon: '🧹', color: '#696969',
      goalEs: 'Eliminar a todo el que se oponga a la Mafia.',
      abilitiesEs: 'Limpia el cadáver del objetivo de la Mafia (3 usos). Oculta su rol y testamento.',
      attributesListEs: ['3 limpiezas', 'Oculta rol y testamento'],
      goalEn: 'Kill anyone who opposes the Mafia.',
      abilitiesEn: 'Clean the Mafia kill target (3 uses). Hides role and will.',
      attributesListEn: ['3 cleans', 'Hide role and will'],
      strategyTips: [], messages: { onStart: 'Eres el Conserje. Limpia las evidencias.' },
      difficulty: 'MEDIUM', isUnique: false, isEnabled: true,
      requiresCoven: false, requiresVampire: false,
      tags: ['deception', 'mafia', 'visiting'], achievements: [],
      expectedWinRate: 0.50, implementationComplexity: 4, popularity: 0.65
    }
  });

  await prisma.role.upsert({
    where: { slug: 'blackmailer' },
    update: {},
    create: {
      nameEs: 'Chantajista', nameEn: 'Blackmailer', slug: 'blackmailer',
      factionId: mafiaFaction.id, alignmentId: mafiaSupport.id,
      attackValue: 0, defenseValue: 0, actionPriority: 8,
      attributes: [], sheriffResult: 'Suspicious (Mafia)',
      investigatorGroup: 'Spy, Blackmailer, Jailor, Guardian Angel',
      consigliereSees: 'Blackmailer', nightActionType: 'BLACKMAIL',
      abilityConfig: { mustTarget: true, canTargetSelf: false },
      immunities: {}, specialInteractions: [],
      winConditions: { type: 'FACTION_DOMINATION', factionMustEqual: ['TOWN'] },
      icon: '🤐', color: '#2F4F4F',
      goalEs: 'Eliminar a todo el que se oponga a la Mafia.',
      abilitiesEs: 'Chantajea a un jugador para que no pueda hablar durante el día. Lee susurros.',
      attributesListEs: ['Silencia de día', 'Lee susurros'],
      goalEn: 'Kill anyone who opposes the Mafia.',
      abilitiesEn: 'Blackmail a player so they can\'t speak during the day. Read whispers.',
      attributesListEn: ['Silence during day', 'Read whispers'],
      strategyTips: [], messages: { onStart: 'Eres el Chantajista. Silencia a los problemas.' },
      difficulty: 'MEDIUM', isUnique: false, isEnabled: true,
      requiresCoven: false, requiresVampire: false,
      tags: ['support', 'mafia', 'visiting'], achievements: [],
      expectedWinRate: 0.50, implementationComplexity: 4, popularity: 0.60
    }
  });

  await prisma.role.upsert({
    where: { slug: 'consigliere' },
    update: {},
    create: {
      nameEs: 'Consigliere', nameEn: 'Consigliere', slug: 'consigliere',
      factionId: mafiaFaction.id, alignmentId: mafiaSupport.id,
      attackValue: 0, defenseValue: 0, actionPriority: 7,
      attributes: [], sheriffResult: 'Suspicious (Mafia)',
      investigatorGroup: 'Investigator, Consigliere, Mayor, Tracker, Plaguebearer',
      consigliereSees: 'Consigliere', nightActionType: 'CONSIGLIERE_CHECK',
      abilityConfig: { mustTarget: true, canTargetSelf: false, targetMustBeAlive: true },
      immunities: {}, specialInteractions: [],
      winConditions: { type: 'FACTION_DOMINATION', factionMustEqual: ['TOWN'] },
      icon: '🕴️', color: '#2F4F4F',
      goalEs: 'Eliminar a todo el que se oponga a la Mafia.',
      abilitiesEs: 'Investiga a un jugador para conocer su rol exacto.',
      attributesListEs: ['Ve el rol exacto'],
      goalEn: 'Kill anyone who opposes the Mafia.',
      abilitiesEn: 'Investigate a player to learn their exact role.',
      attributesListEn: ['See exact role'],
      strategyTips: [], messages: { onStart: 'Eres el Consigliere. Descubre los roles enemigos.' },
      difficulty: 'EASY', isUnique: false, isEnabled: true,
      requiresCoven: false, requiresVampire: false,
      tags: ['support', 'mafia', 'investigative', 'visiting'], achievements: [],
      expectedWinRate: 0.52, implementationComplexity: 3, popularity: 0.70
    }
  });

  await prisma.role.upsert({
    where: { slug: 'consort' },
    update: {},
    create: {
      nameEs: 'Consorte', nameEn: 'Consort', slug: 'consort',
      factionId: mafiaFaction.id, alignmentId: mafiaSupport.id,
      attackValue: 0, defenseValue: 0, actionPriority: 2,
      attributes: [], sheriffResult: 'Suspicious (Mafia)',
      investigatorGroup: 'Escort, Transporter, Consort, Hypnotist',
      consigliereSees: 'Consort', nightActionType: 'ROLEBLOCK',
      abilityConfig: { mustTarget: true, canTargetSelf: false },
      immunities: {},
      specialInteractions: [
        { trigger: 'ROLEBLOCK_SK', condition: 'TARGET_IS_SK', effect: 'DIE' }
      ],
      winConditions: { type: 'FACTION_DOMINATION', factionMustEqual: ['TOWN'] },
      icon: '💋', color: '#FF1493',
      goalEs: 'Eliminar a todo el que se oponga a la Mafia.',
      abilitiesEs: 'Bloquea la habilidad de un jugador cada noche (Escort de Mafia).',
      attributesListEs: ['Bloquea habilidades', 'Muere si bloquea SK'],
      goalEn: 'Kill anyone who opposes the Mafia.',
      abilitiesEn: 'Block a player\'s ability each night (Mafia Escort).',
      attributesListEn: ['Block abilities', 'Die if blocking SK'],
      strategyTips: [], messages: { onStart: 'Eres la Consorte. Bloquea a los enemigos de la Mafia.' },
      difficulty: 'MEDIUM', isUnique: false, isEnabled: true,
      requiresCoven: false, requiresVampire: false,
      tags: ['support', 'mafia', 'visiting'], achievements: [],
      expectedWinRate: 0.50, implementationComplexity: 4, popularity: 0.60
    }
  });

  // ========== COVEN ROLES ==========

  await prisma.role.upsert({
    where: { slug: 'coven-leader' },
    update: {},
    create: {
      nameEs: 'Líder del Aquelarre', nameEn: 'Coven Leader', slug: 'coven-leader',
      factionId: covenFaction.id, alignmentId: covenEvil.id,
      attackValue: 1, defenseValue: 0, actionPriority: 2,
      attributes: ['Unique', 'Control Immune'], sheriffResult: 'Suspicious (Coven)',
      investigatorGroup: 'Lookout, Forger, Witch, Coven Leader',
      consigliereSees: 'Coven Leader', nightActionType: 'CONTROL',
      abilityConfig: { mustTarget: true, canTargetSelf: false, dualTarget: true },
      immunities: { control: true }, specialInteractions: [
        { trigger: 'NECRONOMICON', condition: 'LAST_COVEN', effect: 'REVIVE_ZOMBIE' }
      ],
      winConditions: { type: 'FACTION_DOMINATION', factionMustEqual: ['TOWN', 'MAFIA'] },
      icon: '🧙‍♀️', color: '#9932CC',
      goalEs: 'Eliminar a todos los que se oponen al Aquelarre.',
      abilitiesEs: 'Controla a un jugador para usar su habilidad en otro. Necronomicón: revive como zombie.',
      attributesListEs: ['Control de jugador', 'Inmune a control', 'Necronomicón: zombie'],
      goalEn: 'Kill everyone who opposes the Coven.',
      abilitiesEn: 'Control a player to use their ability on another. Necronomicon: revive as zombie.',
      attributesListEn: ['Player control', 'Control immune', 'Necronomicon: zombie'],
      strategyTips: [], messages: { onStart: 'Eres la Líder del Aquelarre.' },
      difficulty: 'MEDIUM', isUnique: true, isEnabled: true,
      requiresCoven: true, requiresVampire: false,
      tags: ['coven', 'control'], achievements: [],
      expectedWinRate: 0.45, implementationComplexity: 7, popularity: 0.65
    }
  });

  await prisma.role.upsert({
    where: { slug: 'hex-master' },
    update: {},
    create: {
      nameEs: 'Maestra Hex', nameEn: 'Hex Master', slug: 'hex-master',
      factionId: covenFaction.id, alignmentId: covenEvil.id,
      attackValue: 3, defenseValue: 0, actionPriority: 8,
      attributes: [], sheriffResult: 'Suspicious (Coven)',
      investigatorGroup: 'Framer, Vampire, Jester, Hex Master',
      consigliereSees: 'Hex Master', nightActionType: 'HEX',
      abilityConfig: { mustTarget: true, canTargetSelf: false },
      immunities: {}, specialInteractions: [
        { trigger: 'ALL_HEXED', condition: 'ALL_LIVING', effect: 'UNSTOPPABLE_KILL_ALL' }
      ],
      winConditions: { type: 'FACTION_DOMINATION', factionMustEqual: ['TOWN', 'MAFIA'] },
      icon: '🔮', color: '#8B008B',
      goalEs: 'Eliminar a todos los que se oponen al Aquelarre.',
      abilitiesEs: 'Maldice jugadores. Cuando todos están malditos: mata a todos (Imparable).',
      attributesListEs: ['Maldice jugadores', 'Kill masivo cuando todos malditos'],
      goalEn: 'Kill everyone who opposes the Coven.',
      abilitiesEn: 'Hex players. When all living are hexed: kill all (Unstoppable).',
      attributesListEn: ['Hex players', 'Mass kill when all hexed'],
      strategyTips: [], messages: { onStart: 'Eres la Maestra Hex. Maldice a todos.' },
      difficulty: 'HARD', isUnique: false, isEnabled: true,
      requiresCoven: true, requiresVampire: false,
      tags: ['coven', 'killing'], achievements: [],
      expectedWinRate: 0.42, implementationComplexity: 6, popularity: 0.55
    }
  });

  await prisma.role.upsert({
    where: { slug: 'medusa' },
    update: {},
    create: {
      nameEs: 'Medusa', nameEn: 'Medusa', slug: 'medusa',
      factionId: covenFaction.id, alignmentId: covenEvil.id,
      attackValue: 2, defenseValue: 0, actionPriority: 5,
      attributes: [], sheriffResult: 'Suspicious (Coven)',
      investigatorGroup: 'Survivor, Vampire Hunter, Amnesiac, Medusa, Psychic',
      consigliereSees: 'Medusa', nightActionType: 'STONE_GAZE',
      abilityConfig: { mustTarget: false, canTargetSelf: true },
      immunities: {}, specialInteractions: [],
      winConditions: { type: 'FACTION_DOMINATION', factionMustEqual: ['TOWN', 'MAFIA'] },
      icon: '🐍', color: '#006400',
      goalEs: 'Eliminar a todos los que se oponen al Aquelarre.',
      abilitiesEs: 'Petrifica (mata) a todos los visitantes. Necronomicón: puede visitar y matar.',
      attributesListEs: ['Mata visitantes', 'Necronomicón: visitar y matar'],
      goalEn: 'Kill everyone who opposes the Coven.',
      abilitiesEn: 'Petrify (kill) all visitors. Necronomicon: can visit and kill.',
      attributesListEn: ['Kill visitors', 'Necronomicon: visit and kill'],
      strategyTips: [], messages: { onStart: 'Eres Medusa. Petrifica a tus enemigos.' },
      difficulty: 'HARD', isUnique: false, isEnabled: true,
      requiresCoven: true, requiresVampire: false,
      tags: ['coven', 'killing'], achievements: [],
      expectedWinRate: 0.45, implementationComplexity: 5, popularity: 0.60
    }
  });

  await prisma.role.upsert({
    where: { slug: 'necromancer' },
    update: {},
    create: {
      nameEs: 'Nigromante', nameEn: 'Necromancer', slug: 'necromancer',
      factionId: covenFaction.id, alignmentId: covenEvil.id,
      attackValue: 0, defenseValue: 0, actionPriority: 5,
      attributes: [], sheriffResult: 'Suspicious (Coven)',
      investigatorGroup: 'Medium, Janitor, Retributionist, Necromancer, Trapper',
      consigliereSees: 'Necromancer', nightActionType: 'REANIMATE',
      abilityConfig: { mustTarget: true, canTargetSelf: false, uses: 3, targetMustBeDead: true },
      immunities: {}, specialInteractions: [],
      winConditions: { type: 'FACTION_DOMINATION', factionMustEqual: ['TOWN', 'MAFIA'] },
      icon: '💀', color: '#4B0082',
      goalEs: 'Eliminar a todos los que se oponen al Aquelarre.',
      abilitiesEs: 'Reanima un cadáver y usa su habilidad (3 usos). Necronomicón: ilimitado.',
      attributesListEs: ['3 reanimaciones', 'Usa habilidad del cadáver'],
      goalEn: 'Kill everyone who opposes the Coven.',
      abilitiesEn: 'Reanimate a corpse and use its ability (3 uses). Necronomicon: unlimited.',
      attributesListEn: ['3 reanimations', 'Use corpse ability'],
      strategyTips: [], messages: { onStart: 'Eres la Nigromante. Los muertos son tu arma.' },
      difficulty: 'EXPERT', isUnique: false, isEnabled: true,
      requiresCoven: true, requiresVampire: false,
      tags: ['coven', 'support'], achievements: [],
      expectedWinRate: 0.42, implementationComplexity: 8, popularity: 0.55
    }
  });

  await prisma.role.upsert({
    where: { slug: 'poisoner' },
    update: {},
    create: {
      nameEs: 'Envenenadora', nameEn: 'Poisoner', slug: 'poisoner',
      factionId: covenFaction.id, alignmentId: covenEvil.id,
      attackValue: 3, defenseValue: 0, actionPriority: 8,
      attributes: [], sheriffResult: 'Suspicious (Coven)',
      investigatorGroup: 'Sheriff, Executioner, Werewolf, Poisoner',
      consigliereSees: 'Poisoner', nightActionType: 'POISON',
      abilityConfig: { mustTarget: true, canTargetSelf: false, delayedKill: true },
      immunities: {}, specialInteractions: [],
      winConditions: { type: 'FACTION_DOMINATION', factionMustEqual: ['TOWN', 'MAFIA'] },
      icon: '☠️', color: '#32CD32',
      goalEs: 'Eliminar a todos los que se oponen al Aquelarre.',
      abilitiesEs: 'Envenena a un jugador (muere la noche siguiente). Necronomicón: muerte instantánea.',
      attributesListEs: ['Veneno retardado', 'Necronomicón: instantáneo'],
      goalEn: 'Kill everyone who opposes the Coven.',
      abilitiesEn: 'Poison a player (dies next night). Necronomicon: instant kill.',
      attributesListEn: ['Delayed poison', 'Necronomicon: instant'],
      strategyTips: [], messages: { onStart: 'Eres la Envenenadora. El veneno es tu arte.' },
      difficulty: 'MEDIUM', isUnique: false, isEnabled: true,
      requiresCoven: true, requiresVampire: false,
      tags: ['coven', 'killing'], achievements: [],
      expectedWinRate: 0.45, implementationComplexity: 5, popularity: 0.60
    }
  });

  await prisma.role.upsert({
    where: { slug: 'potion-master' },
    update: {},
    create: {
      nameEs: 'Maestra de Pociones', nameEn: 'Potion Master', slug: 'potion-master',
      factionId: covenFaction.id, alignmentId: covenEvil.id,
      attackValue: 1, defenseValue: 1, actionPriority: 3,
      attributes: [], sheriffResult: 'Suspicious (Coven)',
      investigatorGroup: 'Doctor, Disguiser, Serial Killer, Potion Master',
      consigliereSees: 'Potion Master', nightActionType: 'POTION',
      abilityConfig: { mustTarget: true, canTargetSelf: false, potions: ['HEAL', 'ATTACK', 'REVEAL'] },
      immunities: {}, specialInteractions: [],
      winConditions: { type: 'FACTION_DOMINATION', factionMustEqual: ['TOWN', 'MAFIA'] },
      icon: '🧪', color: '#FF6347',
      goalEs: 'Eliminar a todos los que se oponen al Aquelarre.',
      abilitiesEs: '3 pociones (Curar/Atacar/Revelar), 1 por noche. Necronomicón: 2 por noche.',
      attributesListEs: ['3 tipos de poción', '1 por noche', 'Necronomicón: 2/noche'],
      goalEn: 'Kill everyone who opposes the Coven.',
      abilitiesEn: '3 potions (Heal/Attack/Reveal), 1 per night. Necronomicon: 2 per night.',
      attributesListEn: ['3 potion types', '1 per night', 'Necronomicon: 2/night'],
      strategyTips: [], messages: { onStart: 'Eres la Maestra de Pociones. Elige tu brebaje.' },
      difficulty: 'EXPERT', isUnique: false, isEnabled: true,
      requiresCoven: true, requiresVampire: false,
      tags: ['coven', 'versatile'], achievements: [],
      expectedWinRate: 0.45, implementationComplexity: 7, popularity: 0.65
    }
  });

  // ========== ADDITIONAL NEUTRAL ROLES ==========

  await prisma.role.upsert({
    where: { slug: 'executioner' },
    update: {},
    create: {
      nameEs: 'Verdugo', nameEn: 'Executioner', slug: 'executioner',
      factionId: neutralFaction.id, alignmentId: neutralEvil.id,
      attackValue: 0, defenseValue: 1, actionPriority: 0,
      attributes: [], sheriffResult: 'Not Suspicious',
      investigatorGroup: 'Sheriff, Executioner, Werewolf, Poisoner',
      consigliereSees: 'Executioner', nightActionType: 'NONE',
      abilityConfig: { assignTarget: true, targetFaction: 'Town' },
      immunities: { attack: true },
      specialInteractions: [
        { trigger: 'TARGET_DIES_NIGHT', condition: 'ALWAYS', effect: 'BECOME_JESTER' }
      ],
      winConditions: { type: 'GET_TARGET_LYNCHED' },
      icon: '⚖️', color: '#808080',
      goalEs: 'Lograr que tu objetivo sea ejecutado por el pueblo.',
      abilitiesEs: 'Tienes un objetivo Town asignado. Logra que sea linchado. Si muere de noche, te conviertes en Jester.',
      attributesListEs: ['Objetivo asignado', 'Inmune a ataques', 'Conversión a Jester'],
      goalEn: 'Get your target lynched by the Town.',
      abilitiesEn: 'You have a Town target. Get them lynched. If they die at night, become Jester.',
      attributesListEn: ['Assigned target', 'Attack immune', 'Converts to Jester'],
      strategyTips: [], messages: { onStart: 'Eres el Verdugo. Tu objetivo debe morir en la horca.' },
      difficulty: 'MEDIUM', isUnique: false, isEnabled: true,
      requiresCoven: false, requiresVampire: false,
      tags: ['neutral', 'evil'], achievements: [],
      expectedWinRate: 0.35, implementationComplexity: 5, popularity: 0.70
    }
  });

  await prisma.role.upsert({
    where: { slug: 'witch' },
    update: {},
    create: {
      nameEs: 'Bruja', nameEn: 'Witch', slug: 'witch',
      factionId: neutralFaction.id, alignmentId: neutralEvil.id,
      attackValue: 0, defenseValue: 1, actionPriority: 2,
      attributes: ['Control Immune'], sheriffResult: 'Suspicious (Witch)',
      investigatorGroup: 'Lookout, Forger, Witch, Coven Leader',
      consigliereSees: 'Witch', nightActionType: 'CONTROL',
      abilityConfig: { mustTarget: true, canTargetSelf: false, dualTarget: true },
      immunities: { control: true },
      specialInteractions: [],
      winConditions: { type: 'SURVIVE_TOWN_LOSES' },
      icon: '🧹', color: '#800080',
      goalEs: 'Sobrevivir hasta que el pueblo pierda.',
      abilitiesEs: 'Controla a un jugador para usar su habilidad en otro objetivo.',
      attributesListEs: ['Control nocturno', 'Inmune a control', 'Ve el rol del controlado'],
      goalEn: 'Survive until Town loses.',
      abilitiesEn: 'Control a player to use their ability on another target.',
      attributesListEn: ['Night control', 'Control immune', 'See controlled player role'],
      strategyTips: [], messages: { onStart: 'Eres la Bruja. Controla a los demás.' },
      difficulty: 'EXPERT', isUnique: false, isEnabled: true,
      requiresCoven: false, requiresVampire: false,
      tags: ['neutral', 'evil', 'control'], achievements: [],
      expectedWinRate: 0.35, implementationComplexity: 6, popularity: 0.65
    }
  });

  await prisma.role.upsert({
    where: { slug: 'arsonist' },
    update: {},
    create: {
      nameEs: 'Pirómano', nameEn: 'Arsonist', slug: 'arsonist',
      factionId: neutralFaction.id, alignmentId: neutralKilling.id,
      attackValue: 3, defenseValue: 1, actionPriority: 6,
      attributes: ['Detection Immune'], sheriffResult: 'Not Suspicious',
      investigatorGroup: 'Bodyguard, Godfather, Arsonist, Crusader',
      consigliereSees: 'Arsonist', nightActionType: 'DOUSE',
      abilityConfig: { mustTarget: true, canTargetSelf: true, dualAction: ['DOUSE', 'IGNITE'] },
      immunities: { detection: true },
      specialInteractions: [
        { trigger: 'ROLEBLOCKED', condition: 'ALWAYS', effect: 'DOUSE_ROLEBLOCKER' }
      ],
      winConditions: { type: 'LAST_ALIVE' },
      icon: '🔥', color: '#FF4500',
      goalEs: 'Ser el último en pie. Ver arder el mundo.',
      abilitiesEs: 'Rocía con gasolina o Enciende a todos los rociados (kill masivo Imparable).',
      attributesListEs: ['Rociar o Encender', 'Mata todos los rociados', 'Inmune a detección'],
      goalEn: 'Be the last one standing.',
      abilitiesEn: 'Douse a player or Ignite all doused targets (Unstoppable mass kill).',
      attributesListEn: ['Douse or Ignite', 'Kill all doused', 'Detection immune'],
      strategyTips: [], messages: { onStart: 'Eres el Pirómano. Que el mundo arda.' },
      difficulty: 'HARD', isUnique: false, isEnabled: true,
      requiresCoven: false, requiresVampire: false,
      tags: ['neutral', 'killing'], achievements: [],
      expectedWinRate: 0.30, implementationComplexity: 6, popularity: 0.70
    }
  });

  await prisma.role.upsert({
    where: { slug: 'werewolf' },
    update: {},
    create: {
      nameEs: 'Hombre Lobo', nameEn: 'Werewolf', slug: 'werewolf',
      factionId: neutralFaction.id, alignmentId: neutralKilling.id,
      attackValue: 2, defenseValue: 1, actionPriority: 6,
      attributes: [], sheriffResult: 'Suspicious (Werewolf)',
      investigatorGroup: 'Sheriff, Executioner, Werewolf, Poisoner',
      consigliereSees: 'Werewolf', nightActionType: 'KILL_RAMPAGE',
      abilityConfig: { mustTarget: true, canTargetSelf: true, fullMoonOnly: true },
      immunities: {},
      specialInteractions: [
        { trigger: 'FULL_MOON', condition: 'EVERY_2_NIGHTS', effect: 'RAMPAGE_TARGET_AND_VISITORS' }
      ],
      winConditions: { type: 'LAST_ALIVE' },
      icon: '🐺', color: '#8B4513',
      goalEs: 'Ser el último en pie.',
      abilitiesEs: 'Luna llena (cada 2 noches): ataca objetivo y mata a todos sus visitantes.',
      attributesListEs: ['Ataca cada 2 noches', 'Mata visitantes del objetivo'],
      goalEn: 'Be the last one standing.',
      abilitiesEn: 'Full Moon (every 2 nights): attack target and kill all visitors.',
      attributesListEn: ['Attack every 2 nights', 'Kill target visitors'],
      strategyTips: [], messages: { onStart: 'Eres el Hombre Lobo. La luna llena es tu aliada.' },
      difficulty: 'MEDIUM', isUnique: false, isEnabled: true,
      requiresCoven: false, requiresVampire: false,
      tags: ['neutral', 'killing'], achievements: [],
      expectedWinRate: 0.30, implementationComplexity: 5, popularity: 0.75
    }
  });

  await prisma.role.upsert({
    where: { slug: 'juggernaut' },
    update: {},
    create: {
      nameEs: 'Juggernaut', nameEn: 'Juggernaut', slug: 'juggernaut',
      factionId: neutralFaction.id, alignmentId: neutralKilling.id,
      attackValue: 2, defenseValue: 1, actionPriority: 6,
      attributes: [], sheriffResult: 'Suspicious',
      investigatorGroup: 'Vigilante, Veteran, Mafioso, Pirate, Ambusher',
      consigliereSees: 'Juggernaut', nightActionType: 'KILL_SINGLE',
      abilityConfig: { mustTarget: true, canTargetSelf: false, scalesWithKills: true },
      immunities: {},
      specialInteractions: [
        { trigger: 'KILL_1', effect: 'ATTACK_UNSTOPPABLE' },
        { trigger: 'KILL_2', effect: 'RAMPAGE' },
        { trigger: 'KILL_3', effect: 'FULL_RAMPAGE_IMMUNE' }
      ],
      winConditions: { type: 'LAST_ALIVE' },
      icon: '💪', color: '#B22222',
      goalEs: 'Ser el último en pie.',
      abilitiesEs: 'Mata cada noche. Escala con kills: 1°=Imparable, 2°=Rampage, 3°=Full Rampage + Inmune.',
      attributesListEs: ['Escala con kills', 'Cada vez más poderoso'],
      goalEn: 'Be the last one standing.',
      abilitiesEn: 'Kill each night. Scales: 1st=Unstoppable, 2nd=Rampage, 3rd=Full Rampage+Immune.',
      attributesListEn: ['Scales with kills', 'Grows stronger'],
      strategyTips: [], messages: { onStart: 'Eres el Juggernaut. Cada muerte te hace más fuerte.' },
      difficulty: 'HARD', isUnique: false, isEnabled: true,
      requiresCoven: false, requiresVampire: false,
      tags: ['neutral', 'killing'], achievements: [],
      expectedWinRate: 0.25, implementationComplexity: 6, popularity: 0.60
    }
  });

  await prisma.role.upsert({
    where: { slug: 'plaguebearer' },
    update: {},
    create: {
      nameEs: 'Portador de la Plaga', nameEn: 'Plaguebearer', slug: 'plaguebearer',
      factionId: neutralFaction.id, alignmentId: neutralKilling.id,
      attackValue: 2, defenseValue: 0, actionPriority: 6,
      attributes: [], sheriffResult: 'Suspicious',
      investigatorGroup: 'Investigator, Consigliere, Mayor, Tracker, Plaguebearer',
      consigliereSees: 'Plaguebearer', nightActionType: 'INFECT',
      abilityConfig: { mustTarget: true, canTargetSelf: false, transforms: 'pestilence' },
      immunities: {},
      specialInteractions: [
        { trigger: 'ALL_INFECTED', condition: 'ALL_LIVING', effect: 'TRANSFORM_PESTILENCE' }
      ],
      winConditions: { type: 'LAST_ALIVE' },
      icon: '🦠', color: '#556B2F',
      goalEs: 'Infectar a todos y transformarte en Pestilencia.',
      abilitiesEs: 'Infecta cada noche. Cuando todos están infectados, te transformas en Pestilencia (Imparable + Invencible).',
      attributesListEs: ['Infecta jugadores', 'Transforma en Pestilencia'],
      goalEn: 'Infect everyone and become Pestilence.',
      abilitiesEn: 'Infect each night. When all infected, transform to Pestilence (Unstoppable+Invincible).',
      attributesListEn: ['Infect players', 'Transform to Pestilence'],
      strategyTips: [], messages: { onStart: 'Eres el Portador de la Plaga. Infecta a todos.' },
      difficulty: 'EXPERT', isUnique: false, isEnabled: true,
      requiresCoven: false, requiresVampire: false,
      tags: ['neutral', 'killing', 'transform'], achievements: [],
      expectedWinRate: 0.25, implementationComplexity: 8, popularity: 0.55
    }
  });

  await prisma.role.upsert({
    where: { slug: 'pestilence' },
    update: {},
    create: {
      nameEs: 'Pestilencia', nameEn: 'Pestilence', slug: 'pestilence',
      factionId: neutralFaction.id, alignmentId: neutralKilling.id,
      attackValue: 3, defenseValue: 3, actionPriority: 5,
      attributes: ['Unique', 'Unstoppable', 'Invincible'], sheriffResult: 'Suspicious',
      investigatorGroup: 'Pestilence',
      consigliereSees: 'Pestilence', nightActionType: 'KILL_RAMPAGE',
      abilityConfig: { mustTarget: true, canTargetSelf: true, isTransformation: true },
      immunities: { attack: true, roleblock: true, control: true, detection: true },
      specialInteractions: [],
      winConditions: { type: 'LAST_ALIVE' },
      icon: '☣️', color: '#556B2F',
      goalEs: 'Ser el último en pie. Destruir a todos.',
      abilitiesEs: 'Forma final del Portador. Ataque Imparable + Defensa Invencible. Rampage cada noche.',
      attributesListEs: ['Imparable', 'Invencible', 'Rampage cada noche'],
      goalEn: 'Be the last one standing. Destroy everyone.',
      abilitiesEn: 'Final form of Plaguebearer. Unstoppable Attack + Invincible Defense. Rampage every night.',
      attributesListEn: ['Unstoppable', 'Invincible', 'Rampage every night'],
      strategyTips: [], messages: { onStart: 'Te has transformado en Pestilencia. Destruye todo.' },
      difficulty: 'EXPERT', isUnique: true, isEnabled: true,
      requiresCoven: false, requiresVampire: false,
      tags: ['neutral', 'killing', 'transformation'], achievements: [],
      expectedWinRate: 0.60, implementationComplexity: 3, popularity: 0.50
    }
  });

  await prisma.role.upsert({
    where: { slug: 'pirate' },
    update: {},
    create: {
      nameEs: 'Pirata', nameEn: 'Pirate', slug: 'pirate',
      factionId: neutralFaction.id, alignmentId: neutralChaos.id,
      attackValue: 2, defenseValue: 0, actionPriority: 6,
      attributes: [], sheriffResult: 'Suspicious',
      investigatorGroup: 'Vigilante, Veteran, Mafioso, Pirate, Ambusher',
      consigliereSees: 'Pirate', nightActionType: 'DUEL',
      abilityConfig: { mustTarget: true, canTargetSelf: false, duelMechanic: true },
      immunities: {},
      specialInteractions: [],
      winConditions: { type: 'WIN_DUELS', duelsNeeded: 2 },
      icon: '🏴‍☠️', color: '#DAA520',
      goalEs: 'Ganar 2 duelos.',
      abilitiesEs: 'Desafía a un objetivo cada noche. Duelo RPS: Esquivar/Cimitarra/Estocada.',
      attributesListEs: ['Duelos RPS', 'Ganar 2 para victoria'],
      goalEn: 'Win 2 duels.',
      abilitiesEn: 'Challenge a target each night. RPS duel: Sidestep/Scimitar/Rapier.',
      attributesListEn: ['RPS duels', 'Win 2 for victory'],
      strategyTips: [], messages: { onStart: 'Eres el Pirata. Gana tus duelos.' },
      difficulty: 'MEDIUM', isUnique: false, isEnabled: true,
      requiresCoven: false, requiresVampire: false,
      tags: ['neutral', 'chaos', 'killing'], achievements: [],
      expectedWinRate: 0.35, implementationComplexity: 5, popularity: 0.55
    }
  });

  await prisma.role.upsert({
    where: { slug: 'amnesiac' },
    update: {},
    create: {
      nameEs: 'Amnésico', nameEn: 'Amnesiac', slug: 'amnesiac',
      factionId: neutralFaction.id, alignmentId: neutralBenign.id,
      attackValue: 0, defenseValue: 0, actionPriority: 0,
      attributes: [], sheriffResult: 'Not Suspicious',
      investigatorGroup: 'Survivor, Vampire Hunter, Amnesiac, Medusa, Psychic',
      consigliereSees: 'Amnesiac', nightActionType: 'REMEMBER',
      abilityConfig: { mustTarget: true, canTargetSelf: false, uses: 1, targetMustBeDead: true },
      immunities: {},
      specialInteractions: [],
      winConditions: { type: 'REMEMBER_AND_WIN' },
      icon: '❓', color: '#B0C4DE',
      goalEs: 'Recordar quién eras y cumplir ese objetivo.',
      abilitiesEs: 'Recuerda el rol de un jugador muerto y te conviertes en ese rol (1 uso).',
      attributesListEs: ['1 uso', 'Se convierte en el rol recordado'],
      goalEn: 'Remember who you were and fulfill that goal.',
      abilitiesEn: 'Remember a dead player\'s role and become that role (1 use).',
      attributesListEn: ['1 use', 'Become the remembered role'],
      strategyTips: [], messages: { onStart: 'Eres el Amnésico. No recuerdas quién eres.' },
      difficulty: 'MEDIUM', isUnique: false, isEnabled: true,
      requiresCoven: false, requiresVampire: false,
      tags: ['neutral', 'benign', 'transform'], achievements: [],
      expectedWinRate: 0.40, implementationComplexity: 6, popularity: 0.65
    }
  });

  await prisma.role.upsert({
    where: { slug: 'vampire' },
    update: {},
    create: {
      nameEs: 'Vampiro', nameEn: 'Vampire', slug: 'vampire',
      factionId: neutralFaction.id, alignmentId: neutralChaos.id,
      attackValue: 1, defenseValue: 0, actionPriority: 6,
      attributes: [], sheriffResult: 'Suspicious (Vampire)',
      investigatorGroup: 'Framer, Vampire, Jester, Hex Master',
      consigliereSees: 'Vampire', nightActionType: 'BITE',
      abilityConfig: { mustTarget: true, canTargetSelf: false, cooldown: 2 },
      immunities: {},
      specialInteractions: [
        { trigger: 'BITE_VH', condition: 'TARGET_IS_VH', effect: 'DIE' }
      ],
      winConditions: { type: 'CONVERT_ALL' },
      icon: '🧛', color: '#8B0000',
      goalEs: 'Convertir a todos los vivos en vampiros.',
      abilitiesEs: 'Muerde cada 2 noches para convertir. Muere si muerde al Cazador de Vampiros.',
      attributesListEs: ['Convierte jugadores', 'Cada 2 noches', 'VH lo mata'],
      goalEn: 'Convert all living players to Vampires.',
      abilitiesEn: 'Bite every 2 nights to convert. Die if you bite Vampire Hunter.',
      attributesListEn: ['Convert players', 'Every 2 nights', 'VH kills you'],
      strategyTips: [], messages: { onStart: 'Eres un Vampiro. Expande tu clan.' },
      difficulty: 'MEDIUM', isUnique: false, isEnabled: true,
      requiresCoven: false, requiresVampire: true,
      tags: ['neutral', 'chaos', 'vampire'], achievements: [],
      expectedWinRate: 0.35, implementationComplexity: 7, popularity: 0.65
    }
  });

  const roleCount = await prisma.role.count();
  console.log(`✅ All roles created (Total: ${roleCount})`);

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n🌱 Seed completed successfully!');
  console.log(`
    ✅ Factions: 4
    ✅ Alignments: 11
    ✅ Roles: ${roleCount}
    
    📝 All roles are now seeded and ready to use.
  `);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
