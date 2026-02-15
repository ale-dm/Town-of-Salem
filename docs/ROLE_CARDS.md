# 🎴 ROLE CARDS - Tarjetas de Rol Completas

## 📋 Índice
- [Estructura de Tarjeta](#estructura-de-tarjeta)
- [Datos Completos por Rol](#datos-completos-por-rol)
- [Implementación en UI](#implementación-en-ui)
- [Componente React](#componente-react)

---

## Estructura de Tarjeta

### **Información que se Muestra (Town of Salem Style)**

Basado en la imagen, cada tarjeta de rol incluye:

```typescript
interface RoleCard {
  // Header
  roleName: string;           // "MAYOR"
  roleIcon: string;           // Icono/emoji del rol
  
  // Faction & Alignment
  alignment: string;          // "Town (Support)"
  
  // Goal (Objetivo de victoria)
  goal: string;               // "Hang every criminal and evildoer"
  
  // Abilities (Habilidades)
  abilities: string;          // Descripción de qué puede hacer
  
  // Attributes (Atributos especiales)
  attributes: string[];       // Lista de propiedades únicas
  
  // Sheriff Results
  sheriffResult?: string;     // "Not Suspicious" / "Suspicious"
  
  // Investigator Results
  investigatorResult?: string; // Lista de posibles roles
}
```

---

## Datos Completos por Rol

### **TOWN INVESTIGATIVE**

#### **SHERIFF**
```typescript
{
  roleName: "SHERIFF",
  roleIcon: "⭐",
  alignment: "Town (Investigative)",
  
  goal: "Lynch every criminal and evildoer.",
  
  abilities: `
Check one person each night for suspicious activity.

You will know if your target is a member of the Mafia or a Serial Killer.
  `,
  
  attributes: [
    "If you find a Serial Killer, they will kill you instead.",
    "The Godfather will appear to be \"not suspicious\".",
    "Arsonist, Werewolf, Survivor, Executioner, and Jester appear to be \"not suspicious\"."
  ],
  
  sheriffResult: "Not Suspicious",
  investigatorResult: "Sheriff, Executioner, or Werewolf"
}
```

#### **INVESTIGATOR**
```typescript
{
  roleName: "INVESTIGATOR",
  roleIcon: "🔍",
  alignment: "Town (Investigative)",
  
  goal: "Lynch every criminal and evildoer.",
  
  abilities: `
Investigate one person each night for a clue to their role.

You will receive a list of 3 possible roles your target could be.
  `,
  
  attributes: [
    "A Framer can make an innocent person appear to be a member of the Mafia.",
    "A Disguiser can make themselves appear as any role."
  ],
  
  sheriffResult: "Not Suspicious",
  investigatorResult: "Investigator, Consigliere, or Mayor"
}
```

#### **LOOKOUT**
```typescript
{
  roleName: "LOOKOUT",
  roleIcon: "🔭",
  alignment: "Town (Investigative)",
  
  goal: "Lynch every criminal and evildoer.",
  
  abilities: `
Watch one person at night to see who visits them.

You will receive a list of everyone who visits your target.
  `,
  
  attributes: [
    "A Transporter can change who visits your target.",
    "You will not see yourself if you are transported."
  ],
  
  sheriffResult: "Not Suspicious",
  investigatorResult: "Lookout or Forger"
}
```

#### **SPY**
```typescript
{
  roleName: "SPY",
  roleIcon: "🕵️",
  alignment: "Town (Investigative)",
  
  goal: "Lynch every criminal and evildoer.",
  
  abilities: `
You may bug a player's house to see what happens to them that night.

You will see who the Mafia visited.
You will see whispers to and from the Mafia.
  `,
  
  attributes: [
    "You will know who the Mafia attempted to kill.",
    "You will see Mafia chat (Coven mode: No Mafia chat visible)"
  ],
  
  sheriffResult: "Not Suspicious",
  investigatorResult: "Spy, Blackmailer, or Jailor"
}
```

#### **PSYCHIC**
```typescript
{
  roleName: "PSYCHIC",
  roleIcon: "🔮",
  alignment: "Town (Investigative)",
  
  goal: "Lynch every criminal and evildoer.",
  
  abilities: `
Receive visions every night.

On even nights: You will have a vision of 3 players, at least 2 of them are Good.
On odd nights: You will have a vision of 3 players, at least 1 of them is Evil.
  `,
  
  attributes: [
    "Your visions are always accurate.",
    "Good roles: Town, Survivor, Guardian Angel protecting Town",
    "Evil roles: Mafia, Coven, Neutral Killing, Neutral Evil, Guardian Angel protecting Evil"
  ],
  
  sheriffResult: "Not Suspicious",
  investigatorResult: "Psychic, Survivor, Vampire Hunter, or Amnesiac"
}
```

#### **TRACKER**
```typescript
{
  roleName: "TRACKER",
  roleIcon: "🧭",
  alignment: "Town (Investigative)",
  
  goal: "Lynch every criminal and evildoer.",
  
  abilities: `
Track one person at night to see who they visit.

You will receive a message telling you who your target visited.
  `,
  
  attributes: [
    "If your target does not visit anyone, you will be told they stayed home.",
    "A Transporter can change who your target visits."
  ],
  
  sheriffResult: "Not Suspicious",
  investigatorResult: "Tracker, Investigator, Consigliere, or Mayor"
}
```

---

### **TOWN PROTECTIVE**

#### **DOCTOR**
```typescript
{
  roleName: "DOCTOR",
  roleIcon: "⚕️",
  alignment: "Town (Protective)",
  
  goal: "Lynch every criminal and evildoer.",
  
  abilities: `
Heal one person each night, preventing them from dying.

You may only heal yourself once.
  `,
  
  attributes: [
    "You will know if your target is attacked.",
    "You cannot heal the same person two nights in a row.",
    "A healed target will not know they were attacked or healed."
  ],
  
  sheriffResult: "Not Suspicious",
  investigatorResult: "Doctor, Disguiser, or Serial Killer"
}
```

#### **BODYGUARD**
```typescript
{
  roleName: "BODYGUARD",
  roleIcon: "🛡️",
  alignment: "Town (Protective)",
  
  goal: "Lynch every criminal and evildoer.",
  
  abilities: `
Protect one person from death each night.

If your target is attacked, you and the attacker will both die.
You may vest yourself once for Basic Defense.
  `,
  
  attributes: [
    "If you successfully protect someone, you will kill the attacker.",
    "You cannot be roleblocked.",
    "Your self-vest does NOT kill attackers."
  ],
  
  sheriffResult: "Not Suspicious",
  investigatorResult: "Bodyguard, Godfather, or Arsonist"
}
```

#### **CRUSADER**
```typescript
{
  roleName: "CRUSADER",
  roleIcon: "⚔️",
  alignment: "Town (Protective)",
  
  goal: "Lynch every criminal and evildoer.",
  
  abilities: `
Protect one person from death each night.

You will attack one random person who visits your target.
  `,
  
  attributes: [
    "You have a Basic Attack.",
    "You may kill Town members if they visit your target.",
    "You will not attack a target you are protecting."
  ],
  
  sheriffResult: "Not Suspicious",
  investigatorResult: "Crusader, Bodyguard, Godfather, or Arsonist"
}
```

---

### **TOWN KILLING**

#### **VIGILANTE**
```typescript
{
  roleName: "VIGILANTE",
  roleIcon: "🔫",
  alignment: "Town (Killing)",
  
  goal: "Lynch every criminal and evildoer.",
  
  abilities: `
Choose to take justice into your own hands and shoot someone.

You have 3 bullets.
If you shoot a Town member, you will commit suicide over the guilt.
  `,
  
  attributes: [
    "You have a Basic Attack.",
    "You cannot shoot on the first night.",
    "If you shoot a Town member, you will commit suicide the following night."
  ],
  
  sheriffResult: "Not Suspicious",
  investigatorResult: "Vigilante, Veteran, or Mafioso"
}
```

#### **VETERAN**
```typescript
{
  roleName: "VETERAN",
  roleIcon: "🪖",
  alignment: "Town (Killing)",
  
  goal: "Lynch every criminal and evildoer.",
  
  abilities: `
Decide if you will go on alert and kill anyone who visits you.

You have 3 alerts.
While on alert, you have Basic Defense and kill all visitors with a Powerful Attack.
  `,
  
  attributes: [
    "You cannot be roleblocked while on alert.",
    "You are Detection Immune while on alert.",
    "You may accidentally kill Town members who visit you."
  ],
  
  sheriffResult: "Not Suspicious (Detection Immune while on alert)",
  investigatorResult: "Vigilante, Veteran, or Mafioso"
}
```

#### **VAMPIRE HUNTER**
```typescript
{
  roleName: "VAMPIRE HUNTER",
  roleIcon: "🧄",
  alignment: "Town (Killing)",
  
  goal: "Lynch every criminal and evildoer.",
  
  abilities: `
Check for Vampires each night.

If you find a Vampire, you will attack them.
If a Vampire tries to bite you, you will attack them instead.
  `,
  
  attributes: [
    "If all Vampires are dead, you become a Vigilante with unlimited bullets.",
    "You have a Basic Attack.",
    "You are immune to Vampire bites."
  ],
  
  sheriffResult: "Not Suspicious",
  investigatorResult: "Vampire Hunter, Psychic, Survivor, or Amnesiac"
}
```

---

### **TOWN SUPPORT**

#### **MAYOR**
```typescript
{
  roleName: "MAYOR",
  roleIcon: "👑",
  alignment: "Town (Support)",
  
  goal: "Lynch every criminal and evildoer.",
  
  abilities: `
You may reveal yourself as the Mayor of the Town.

Once you have revealed yourself as Mayor, your vote counts as 3 votes.
You may not be healed once you have revealed yourself.
  `,
  
  attributes: [
    "Once you have revealed yourself as Mayor, your vote counts as 3 votes.",
    "You may not be healed once you have revealed yourself.",
    "Once revealed, you can't whisper or be whispered to."
  ],
  
  sheriffResult: "Not Suspicious",
  investigatorResult: "Mayor, Investigator, or Consigliere"
}
```

#### **ESCORT**
```typescript
{
  roleName: "ESCORT",
  roleIcon: "💃",
  alignment: "Town (Support)",
  
  goal: "Lynch every criminal and evildoer.",
  
  abilities: `
Distract someone each night.

Roleblocking a Serial Killer will result in your death.
Roleblocking a Werewolf on a Full Moon will result in your death.
  `,
  
  attributes: [
    "You prevent your target from using their ability.",
    "You will know if your target was roleblocked.",
    "Roleblock immune roles: Jailor, Veteran (on alert), Transporter, Witch"
  ],
  
  sheriffResult: "Not Suspicious",
  investigatorResult: "Escort, Transporter, or Consort"
}
```

#### **MEDIUM**
```typescript
{
  roleName: "MEDIUM",
  roleIcon: "👻",
  alignment: "Town (Support)",
  
  goal: "Lynch every criminal and evildoer.",
  
  abilities: `
Speak with the dead at night.

You can speak to one dead person each night starting Night 2.
During the day, you can perform a séance to speak publicly with the dead.
  `,
  
  attributes: [
    "You cannot speak with the dead on Night 1.",
    "You can only perform one séance per game.",
    "When you séance, the dead's chat is visible to everyone the next day."
  ],
  
  sheriffResult: "Not Suspicious",
  investigatorResult: "Medium, Janitor, or Retributionist"
}
```

#### **RETRIBUTIONIST**
```typescript
{
  roleName: "RETRIBUTIONIST",
  roleIcon: "⚰️",
  alignment: "Town (Support)",
  
  goal: "Lynch every criminal and evildoer.",
  
  abilities: `
Revive a dead Town member.

You may revive one dead Town member once per game.
The revived player will know you revived them.
  `,
  
  attributes: [
    "You can only revive once per game.",
    "The revived player regains all their abilities.",
    "You cannot revive a cleaned player (Janitor)."
  ],
  
  sheriffResult: "Not Suspicious",
  investigatorResult: "Retributionist, Medium, or Janitor"
}
```

#### **TRANSPORTER**
```typescript
{
  roleName: "TRANSPORTER",
  roleIcon: "🔄",
  alignment: "Town (Support)",
  
  goal: "Lynch every criminal and evildoer.",
  
  abilities: `
Choose two people to transport at night.

All actions on target A will affect target B, and vice versa.
You may transport yourself.
  `,
  
  attributes: [
    "You are roleblock immune if you transport yourself.",
    "You will know if you were transported.",
    "You cannot be controlled by a Witch."
  ],
  
  sheriffResult: "Not Suspicious",
  investigatorResult: "Transporter, Escort, or Consort"
}
```

#### **JAILOR**
```typescript
{
  roleName: "JAILOR",
  roleIcon: "⛓️",
  alignment: "Town (Support)",
  
  goal: "Lynch every criminal and evildoer.",
  
  abilities: `
Choose one person during the day to Jail for the night.

You may anonymously talk with your prisoner.
You may choose to execute your prisoner (3 executions).
If you execute a Town member, you will lose your executions.
  `,
  
  attributes: [
    "You are roleblock immune.",
    "Your prisoner cannot perform their night ability.",
    "Your prisoner cannot be targeted by anyone at night.",
    "You have 3 executions.",
    "Executions are an Unstoppable Attack.",
    "If you execute a Town member, you permanently lose the ability to execute."
  ],
  
  sheriffResult: "Not Suspicious",
  investigatorResult: "Jailor, Spy, or Blackmailer"
}
```

---

### **MAFIA KILLING**

#### **GODFATHER**
```typescript
{
  roleName: "GODFATHER",
  roleIcon: "👑",
  alignment: "Mafia (Killing)",
  
  goal: "Kill anyone that will not submit to the Mafia.",
  
  abilities: `
You may choose to attack a player each night.

If there is a Mafioso, they will attack the target instead of you.
  `,
  
  attributes: [
    "You have Basic Defense.",
    "You appear to be \"not suspicious\" to the Sheriff.",
    "You cannot be roleblocked.",
    "If the Mafioso dies, you will attack your target directly."
  ],
  
  sheriffResult: "Not Suspicious (Detection Immune)",
  investigatorResult: "Godfather, Bodyguard, or Arsonist"
}
```

#### **MAFIOSO**
```typescript
{
  roleName: "MAFIOSO",
  roleIcon: "🔪",
  alignment: "Mafia (Killing)",
  
  goal: "Kill anyone that will not submit to the Mafia.",
  
  abilities: `
Carry out the Godfather's orders.

You will attack the Godfather's target.
If the Godfather dies, you will become the Godfather.
  `,
  
  attributes: [
    "You have a Basic Attack.",
    "If the Godfather dies, you will be promoted to Godfather.",
    "You can be roleblocked."
  ],
  
  sheriffResult: "Suspicious (Mafia)",
  investigatorResult: "Mafioso, Vigilante, or Veteran"
}
```

---

### **MAFIA DECEPTION**

#### **FRAMER**
```typescript
{
  roleName: "FRAMER",
  roleIcon: "🖼️",
  alignment: "Mafia (Deception)",
  
  goal: "Kill anyone that will not submit to the Mafia.",
  
  abilities: `
Choose someone to frame each night.

If your target is investigated by a Sheriff, they will appear to be a member of the Mafia.
If your target is investigated by an Investigator, they will appear as Framer, Vampire, or Jester.
  `,
  
  attributes: [
    "Your framing only lasts one night.",
    "You can frame the same person multiple nights.",
    "You cannot frame yourself or other Mafia members."
  ],
  
  sheriffResult: "Suspicious (Mafia)",
  investigatorResult: "Framer, Vampire, or Jester"
}
```

#### **JANITOR**
```typescript
{
  roleName: "JANITOR",
  roleIcon: "🧹",
  alignment: "Mafia (Deception)",
  
  goal: "Kill anyone that will not submit to the Mafia.",
  
  abilities: `
Choose a person to clean each night.

If your target dies, their role and Last Will will be hidden from the Town.
You will see the cleaned player's role and Last Will.
You may only clean 3 times.
  `,
  
  attributes: [
    "You have 3 cleans.",
    "Only you will see the cleaned player's role and Last Will.",
    "Cleaned roles cannot be revived by a Retributionist."
  ],
  
  sheriffResult: "Suspicious (Mafia)",
  investigatorResult: "Janitor, Medium, or Retributionist"
}
```

---

### **NEUTRAL EVIL**

#### **JESTER**
```typescript
{
  roleName: "JESTER",
  roleIcon: "🃏",
  alignment: "Neutral (Evil)",
  
  goal: "Get yourself lynched by any means necessary.",
  
  abilities: `
Trick the Town into voting you up for trial.

If you are lynched, you may haunt one of your guilty voters the following night.
  `,
  
  attributes: [
    "If you are lynched, you win!",
    "You may kill one person who voted guilty the night after you are lynched.",
    "Your attack is Unstoppable.",
    "You cannot be killed at night."
  ],
  
  sheriffResult: "Not Suspicious",
  investigatorResult: "Jester, Framer, or Vampire"
}
```

#### **EXECUTIONER**
```typescript
{
  roleName: "EXECUTIONER",
  roleIcon: "⚖️",
  alignment: "Neutral (Evil)",
  
  goal: "Get your target lynched at any cost.",
  
  abilities: `
You are given a target at the start of the game.

If your target is lynched, you win!
If your target dies at night, you become a Jester.
  `,
  
  attributes: [
    "You have Basic Defense.",
    "Your target is always a Town member.",
    "If your target dies at night, you become a Jester."
  ],
  
  sheriffResult: "Not Suspicious",
  investigatorResult: "Executioner, Sheriff, or Werewolf"
}
```

---

### **NEUTRAL KILLING**

#### **SERIAL KILLER**
```typescript
{
  roleName: "SERIAL KILLER",
  roleIcon: "🔪",
  alignment: "Neutral (Killing)",
  
  goal: "Kill everyone who would oppose you.",
  
  abilities: `
You may choose to attack a player each night.

If you are roleblocked, you will attack the roleblocker instead.
You may choose to be cautious and not kill roleblockers.
  `,
  
  attributes: [
    "You have Basic Defense.",
    "You are Detection Immune to Sheriff.",
    "You kill anyone who visits you (Lookout, Doctor, etc).",
    "If you are roleblocked, you will attack the Escort/Consort (unless cautious)."
  ],
  
  sheriffResult: "Suspicious (Serial Killer)",
  investigatorResult: "Serial Killer, Doctor, or Disguiser"
}
```

#### **ARSONIST**
```typescript
{
  roleName: "ARSONIST",
  roleIcon: "🔥",
  alignment: "Neutral (Killing)",
  
  goal: "Live to see everyone burn.",
  
  abilities: `
You may douse someone in gasoline or ignite all doused targets.

Dousing: Douse one player per night.
Igniting: Kill all doused players.
  `,
  
  attributes: [
    "You have Basic Defense.",
    "Your ignite is an Unstoppable Attack.",
    "If you are roleblocked, you will douse your roleblocker.",
    "You can clean gasoline off yourself at night."
  ],
  
  sheriffResult: "Suspicious (Arsonist)",
  investigatorResult: "Arsonist, Bodyguard, or Godfather"
}
```

---

## Implementación en UI

### **Componente RoleCard React**

```tsx
// components/game/RoleCard.tsx
import { motion } from 'framer-motion';
import { getRoleData } from '@/lib/roles';

interface RoleCardProps {
  roleName: string;
  variant?: 'full' | 'compact';
}

export function RoleCard({ roleName, variant = 'full' }: RoleCardProps) {
  const role = getRoleData(roleName);
  
  if (!role) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="role-card"
    >
      {/* Header */}
      <div className="role-card-header">
        <div className="role-icon">{role.icon}</div>
        <h2 className="role-name">{role.name}</h2>
        <p className="role-alignment">{role.alignment}</p>
      </div>
      
      {/* Goal */}
      <div className="role-section">
        <h3 className="section-title">Goal</h3>
        <p className="section-content">{role.goal}</p>
      </div>
      
      {/* Abilities */}
      <div className="role-section">
        <h3 className="section-title">Abilities</h3>
        <p className="section-content whitespace-pre-line">{role.abilities}</p>
      </div>
      
      {/* Attributes */}
      {role.attributes && role.attributes.length > 0 && (
        <div className="role-section">
          <h3 className="section-title">Attributes</h3>
          <ul className="attributes-list">
            {role.attributes.map((attr, i) => (
              <li key={i} className="attribute-item">
                - {attr}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Investigation Results (Optional - solo visible para algunos roles) */}
      {variant === 'full' && (
        <>
          {role.sheriffResult && (
            <div className="role-section">
              <h3 className="section-title">Sheriff Result</h3>
              <p className="section-content">{role.sheriffResult}</p>
            </div>
          )}
          
          {role.investigatorResult && (
            <div className="role-section">
              <h3 className="section-title">Investigator Result</h3>
              <p className="section-content">{role.investigatorResult}</p>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
```

### **CSS Styling (Tailwind + Custom)**

```css
/* styles/role-card.css */
.role-card {
  @apply bg-gradient-to-b from-wood-dark to-wood;
  @apply border-4 border-gold;
  @apply rounded-xl;
  @apply p-6;
  @apply shadow-2xl;
  @apply max-w-md;
}

.role-card-header {
  @apply text-center mb-6 pb-4;
  @apply border-b-2 border-gold/50;
}

.role-icon {
  @apply text-6xl mb-2;
  filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5));
}

.role-name {
  @apply font-pirata text-4xl text-gold;
  @apply mb-1;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.role-alignment {
  @apply font-medieval text-sm;
  @apply text-blue-300;
}

.role-section {
  @apply mb-4 pb-3;
  @apply border-b border-wood-dark/50;
}

.role-section:last-child {
  @apply border-b-0;
}

.section-title {
  @apply font-almendra text-lg text-gold;
  @apply mb-2;
  @apply flex items-center gap-2;
}

.section-title::before {
  content: '⚔';
  @apply text-base;
}

.section-content {
  @apply font-crimson text-sm text-text;
  @apply leading-relaxed;
}

.attributes-list {
  @apply space-y-1;
}

.attribute-item {
  @apply font-crimson text-xs text-text/90;
  @apply pl-2;
}
```

---

## Schema de Base de Datos (Actualización)

```prisma
// Actualizar modelo Role en DATABASE.md

model Role {
  // ... campos existentes
  
  // Datos para tarjeta de rol
  goal              String    @db.Text  // Objetivo de victoria
  abilities         String    @db.Text  // Descripción habilidades
  attributesList    String[]            // Array de atributos
  
  // Resultados de investigación
  sheriffResult     String?             // "Not Suspicious" / "Suspicious (Mafia)"
  investigatorGroup String?             // "Sheriff, Executioner, Werewolf"
  
  // ... resto de campos
}
```

### **Seed Update**

```typescript
// Actualizar seed para incluir goal, abilities, attributesList

await prisma.role.create({
  data: {
    name: 'Sheriff',
    // ... otros campos
    
    goal: "Lynch every criminal and evildoer.",
    
    abilities: `Check one person each night for suspicious activity.

You will know if your target is a member of the Mafia or a Serial Killer.`,
    
    attributesList: [
      "If you find a Serial Killer, they will kill you instead.",
      "The Godfather will appear to be \"not suspicious\".",
      "Arsonist, Werewolf, Survivor, Executioner, and Jester appear to be \"not suspicious\"."
    ],
    
    sheriffResult: "Not Suspicious",
    investigatorGroup: "Sheriff, Executioner, or Werewolf",
  }
});
```

---

## Checklist de Implementación

### **Fase 1: MVP (12 roles)**
- [ ] Crear datos completos de tarjetas para 12 roles MVP
- [ ] Componente RoleCard.tsx
- [ ] Styling CSS/Tailwind
- [ ] Integrar en UI de juego

### **Fase 2: Roles Completos (53 roles)**
- [ ] Datos de tarjetas para todos los 53 roles
- [ ] Variante compact para sidebar
- [ ] Variante full para modal/overlay
- [ ] Animaciones Framer Motion

### **Fase 3: Features Avanzadas**
- [ ] Tooltip hover en grid de jugadores
- [ ] Modal expandido al click
- [ ] Búsqueda de roles (role list)
- [ ] Comparación de roles (side-by-side)

---

**Última actualización**: Febrero 2026
