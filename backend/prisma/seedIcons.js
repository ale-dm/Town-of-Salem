// Update all roles with icon paths and night action labels
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const roleIconData = {
  'sheriff': {
    iconImage: '/icons/roles/RoleIcon_Sheriff.webp',
    iconCircled: '/icons/roles/RoleIcon_Sheriff_Circled.webp',
    nightActionLabel: 'Interrogate',
    nightActionLabel2: null,
  },
  'investigator': {
    iconImage: '/icons/roles/RoleIcon_Investigator.webp',
    iconCircled: '/icons/roles/RoleIcon_Investigator_Circled.webp',
    nightActionLabel: 'Investigate',
    nightActionLabel2: null,
  },
  'doctor': {
    iconImage: '/icons/roles/RoleIcon_Doctor_1.webp',
    iconCircled: '/icons/roles/RoleIcon_Doctor_1_Circled.webp',
    nightActionLabel: 'Heal',
    nightActionLabel2: 'Self-Heal',
  },
  'vigilante': {
    iconImage: '/icons/roles/RoleIcon_Vigilante.webp',
    iconCircled: '/icons/roles/RoleIcon_Vigilante_Circled.webp',
    nightActionLabel: 'Kill',
    nightActionLabel2: null,
  },
  'jailor': {
    iconImage: null, // No icon file available
    iconCircled: null,
    nightActionLabel: 'Jail',
    nightActionLabel2: 'Execute',
  },
  'lookout': {
    iconImage: '/icons/roles/RoleIcon_Lookout.webp',
    iconCircled: '/icons/roles/RoleIcon_Lookout_Circled.webp',
    nightActionLabel: 'Watch',
    nightActionLabel2: null,
  },
  'spy': {
    iconImage: '/icons/roles/RoleIcon_Spy.webp',
    iconCircled: '/icons/roles/RoleIcon_Spy_Circled.webp',
    nightActionLabel: 'Bug',
    nightActionLabel2: null,
  },
  'psychic': {
    iconImage: '/icons/roles/RoleIcon_Psychic.webp',
    iconCircled: '/icons/roles/RoleIcon_Psychic_Circled.webp',
    nightActionLabel: 'Vision',
    nightActionLabel2: null,
  },
  'tracker': {
    iconImage: '/icons/roles/RoleIcon_Tracker.webp',
    iconCircled: '/icons/roles/RoleIcon_Tracker_Circled.webp',
    nightActionLabel: 'Track',
    nightActionLabel2: null,
  },
  'bodyguard': {
    iconImage: '/icons/roles/RoleIcon_Bodyguard.webp',
    iconCircled: '/icons/roles/RoleIcon_Bodyguard_Circled.webp',
    nightActionLabel: 'Protect',
    nightActionLabel2: null,
  },
  'crusader': {
    iconImage: '/icons/roles/RoleIcon_Crusader.webp',
    iconCircled: '/icons/roles/RoleIcon_Crusader_Circled.webp',
    nightActionLabel: 'Protect',
    nightActionLabel2: null,
  },
  'trapper': {
    iconImage: '/icons/roles/RoleIcon_Trapper.webp',
    iconCircled: '/icons/roles/RoleIcon_Trapper_Circled.webp',
    nightActionLabel: 'Trap',
    nightActionLabel2: null,
  },
  'guardian-angel': {
    iconImage: '/icons/roles/RoleIcon_GuardianAngel.webp',
    iconCircled: '/icons/roles/RoleIcon_GuardianAngel_Circled.webp',
    nightActionLabel: 'Protect',
    nightActionLabel2: null,
  },
  'veteran': {
    iconImage: '/icons/roles/RoleIcon_Veteran.webp',
    iconCircled: '/icons/roles/RoleIcon_Veteran_Circled.webp',
    nightActionLabel: null,
    nightActionLabel2: 'Alert',
  },
  'vampire-hunter': {
    iconImage: '/icons/roles/RoleIcon_VampireHunter.webp',
    iconCircled: '/icons/roles/RoleIcon_VampireHunter_Circled.webp',
    nightActionLabel: 'Stake',
    nightActionLabel2: null,
  },
  'escort': {
    iconImage: null,
    iconCircled: '/icons/roles/RoleIcon_Escort_Circled.webp',
    nightActionLabel: 'Roleblock',
    nightActionLabel2: null,
  },
  'mayor': {
    iconImage: '/icons/roles/RoleIcon_Mayor.webp',
    iconCircled: null,
    nightActionLabel: null,
    nightActionLabel2: null,
  },
  'medium': {
    iconImage: '/icons/roles/RoleIcon_Medium.webp',
    iconCircled: '/icons/roles/RoleIcon_Medium_Circled.webp',
    nightActionLabel: 'Séance',
    nightActionLabel2: null,
  },
  'retributionist': {
    iconImage: '/icons/roles/RoleIcon_Retributionist.webp',
    iconCircled: '/icons/roles/RoleIcon_Retributionist_Circled.webp',
    nightActionLabel: 'Revive',
    nightActionLabel2: null,
  },
  'transporter': {
    iconImage: '/icons/roles/RoleIcon_Transporter.webp',
    iconCircled: '/icons/roles/RoleIcon_Transporter_Circled.webp',
    nightActionLabel: 'Transport',
    nightActionLabel2: null,
  },
  'survivor': {
    iconImage: '/icons/roles/RoleIcon_Survivor.webp',
    iconCircled: '/icons/roles/RoleIcon_Survivor_Circled.webp',
    nightActionLabel: null,
    nightActionLabel2: 'Vest',
  },
  // ===== MAFIA =====
  'godfather': {
    iconImage: '/icons/roles/RoleIcon_Godfather.webp',
    iconCircled: '/icons/roles/RoleIcon_Godfather_Circled.webp',
    nightActionLabel: 'Kill',
    nightActionLabel2: null,
  },
  'mafioso': {
    iconImage: '/icons/roles/RoleIcon_Mafioso.webp',
    iconCircled: '/icons/roles/RoleIcon_Mafioso_Circled.webp',
    nightActionLabel: 'Kill',
    nightActionLabel2: null,
  },
  'ambusher': {
    iconImage: '/icons/roles/RoleIcon_Ambusher.webp',
    iconCircled: '/icons/roles/RoleIcon_Ambusher_Circled.webp',
    nightActionLabel: 'Ambush',
    nightActionLabel2: null,
  },
  'disguiser': {
    iconImage: '/icons/roles/RoleIcon_Disguiser.webp',
    iconCircled: '/icons/roles/RoleIcon_Disguiser_Circled.webp',
    nightActionLabel: 'Disguise',
    nightActionLabel2: null,
  },
  'forger': {
    iconImage: '/icons/roles/RoleIcon_Forger.webp',
    iconCircled: '/icons/roles/RoleIcon_Forger_Circled.webp',
    nightActionLabel: 'Forge',
    nightActionLabel2: null,
  },
  'framer': {
    iconImage: '/icons/roles/RoleIcon_Framer.webp',
    iconCircled: '/icons/roles/RoleIcon_Framer_Circled.webp',
    nightActionLabel: 'Frame',
    nightActionLabel2: null,
  },
  'hypnotist': {
    iconImage: '/icons/roles/RoleIcon_Hypnotist.webp',
    iconCircled: '/icons/roles/RoleIcon_Hypnotist_Circled.webp',
    nightActionLabel: 'Hypnotize',
    nightActionLabel2: null,
  },
  'janitor': {
    iconImage: '/icons/roles/RoleIcon_Janitor.webp',
    iconCircled: '/icons/roles/RoleIcon_Janitor_Circled.webp',
    nightActionLabel: 'Clean',
    nightActionLabel2: null,
  },
  'blackmailer': {
    iconImage: '/icons/roles/RoleIcon_Blackmailer.webp',
    iconCircled: '/icons/roles/RoleIcon_Blackmailer_Circled.webp',
    nightActionLabel: 'Blackmail',
    nightActionLabel2: null,
  },
  'consigliere': {
    iconImage: '/icons/roles/RoleIcon_Consigliere.webp',
    iconCircled: '/icons/roles/RoleIcon_Consigliere_Circled.webp',
    nightActionLabel: 'Investigate',
    nightActionLabel2: null,
  },
  'consort': {
    iconImage: null,
    iconCircled: '/icons/roles/RoleIcon_Consort_Circled.webp',
    nightActionLabel: 'Roleblock',
    nightActionLabel2: null,
  },
  // ===== NEUTRAL =====
  'serial-killer': {
    iconImage: '/icons/roles/RoleIcon_SerialKiller.webp',
    iconCircled: '/icons/roles/RoleIcon_SerialKiller_Circled.webp',
    nightActionLabel: 'Kill',
    nightActionLabel2: 'Cautious',
  },
  'arsonist': {
    iconImage: '/icons/roles/RoleIcon_Arsonist_1.webp',
    iconCircled: '/icons/roles/RoleIcon_Arsonist_2_Circled.webp',
    nightActionLabel: 'Douse',
    nightActionLabel2: 'Ignite',
  },
  'werewolf': {
    iconImage: '/icons/roles/RoleIcon_Werewolf.webp',
    iconCircled: '/icons/roles/RoleIcon_Werewolf_Circled.webp',
    nightActionLabel: 'Rampage',
    nightActionLabel2: null,
  },
  'jester': {
    iconImage: '/icons/roles/RoleIcon_Jester.webp',
    iconCircled: '/icons/roles/RoleIcon_Jester_Circled.webp',
    nightActionLabel: null,
    nightActionLabel2: null,
  },
  'executioner': {
    iconImage: '/icons/roles/RoleIcon_Executioner.webp',
    iconCircled: '/icons/roles/RoleIcon_Executioner_Circled.webp',
    nightActionLabel: null,
    nightActionLabel2: null,
  },
  'witch': {
    iconImage: '/icons/roles/RoleIcon_Witch.webp',
    iconCircled: '/icons/roles/RoleIcon_Witch_Circled.webp',
    nightActionLabel: 'Control',
    nightActionLabel2: null,
  },
  'amnesiac': {
    iconImage: '/icons/roles/RoleIcon_Amnesiac.webp',
    iconCircled: '/icons/roles/RoleIcon_Amnesiac_Circled.webp',
    nightActionLabel: 'Remember',
    nightActionLabel2: null,
  },
  'vampire': {
    iconImage: '/icons/roles/RoleIcon_Vampire.webp',
    iconCircled: '/icons/roles/RoleIcon_Vampire_Circled.webp',
    nightActionLabel: 'Bite',
    nightActionLabel2: null,
  },
  'juggernaut': {
    iconImage: '/icons/roles/RoleIcon_Juggernaut.webp',
    iconCircled: '/icons/roles/RoleIcon_Juggernaut_Circled.webp',
    nightActionLabel: 'Kill',
    nightActionLabel2: null,
  },
  'plaguebearer': {
    iconImage: '/icons/roles/RoleIcon_PlagueBearer_1.webp',
    iconCircled: '/icons/roles/RoleIcon_PlagueBearer_1_Circled.webp',
    nightActionLabel: 'Infect',
    nightActionLabel2: null,
  },
  'pirate': {
    iconImage: '/icons/roles/RoleIcon_Pirate.webp',
    iconCircled: '/icons/roles/RoleIcon_Pirate_Circled.webp',
    nightActionLabel: 'Duel',
    nightActionLabel2: null,
  },
  // ===== COVEN =====
  'coven-leader': {
    iconImage: '/icons/roles/RoleIcon_CovenLeader.webp',
    iconCircled: '/icons/roles/RoleIcon_CovenLeader_Circled.webp',
    nightActionLabel: 'Control',
    nightActionLabel2: null,
  },
  'hex-master': {
    iconImage: '/icons/roles/RoleIcon_HexMaster.webp',
    iconCircled: '/icons/roles/RoleIcon_HexMaster_Circled.webp',
    nightActionLabel: 'Hex',
    nightActionLabel2: null,
  },
  'medusa': {
    iconImage: '/icons/roles/RoleIcon_Medusa.webp',
    iconCircled: '/icons/roles/RoleIcon_Medusa_Circled.webp',
    nightActionLabel: 'Stone Gaze',
    nightActionLabel2: null,
  },
  'necromancer': {
    iconImage: '/icons/roles/RoleIcon_Necromancer.webp',
    iconCircled: '/icons/roles/RoleIcon_Necromancer_Circled.webp',
    nightActionLabel: 'Reanimate',
    nightActionLabel2: null,
  },
  'poisoner': {
    iconImage: '/icons/roles/RoleIcon_Poisoner.webp',
    iconCircled: '/icons/roles/RoleIcon_Poisoner_Circled.webp',
    nightActionLabel: 'Poison',
    nightActionLabel2: null,
  },
  'potion-master': {
    iconImage: '/icons/roles/RoleIcon_PotionMaster.webp',
    iconCircled: '/icons/roles/RoleIcon_PotionMaster_Circled.webp',
    nightActionLabel: 'Potion',
    nightActionLabel2: null,
  },
};

async function main() {
  console.log('🎨 Updating role icons and action labels...');

  let updated = 0;
  let notFound = 0;

  for (const [slug, data] of Object.entries(roleIconData)) {
    try {
      const result = await prisma.role.update({
        where: { slug },
        data: {
          iconImage: data.iconImage,
          iconCircled: data.iconCircled,
          nightActionLabel: data.nightActionLabel,
          nightActionLabel2: data.nightActionLabel2,
        },
      });
      console.log(`  ✅ ${result.nameEn} (${slug})`);
      updated++;
    } catch (e) {
      console.log(`  ⚠️ Role not found: ${slug}`);
      notFound++;
    }
  }

  console.log(`\n🎨 Done! Updated: ${updated}, Not found: ${notFound}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
