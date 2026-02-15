# 🎮 DISCORD INTEGRATION - Integración Completa

## 📋 Índice
- [Overview](#overview)
- [Sistema Híbrido Web + Discord](#sistema-híbrido-web--discord)
- [Canales de Voz Dinámicos](#canales-de-voz-dinámicos)
- [Implementación Bot](#implementación-bot)
- [Comandos Slash](#comandos-slash)

---

## Overview

### **¿Por Qué Discord?**

**Ventajas BRUTALES**:

✅ **Voz Gratis**: No necesitas WebRTC  
✅ **Ya lo Usan**: Tus amigos ya tienen Discord  
✅ **Canales Dinámicos**: Crear/destruir automáticamente  
✅ **Mobile App**: Funciona perfecto en móvil  
✅ **Notificaciones**: Push notifications nativas  

---

## Sistema Híbrido (Web + Discord) ⭐ RECOMENDADO

Lo mejor de ambos mundos.

```
WEB APP                    DISCORD
├── UI Visual        ←→    ├── Voz (gratis)
├── Votaciones            ├── Canales automáticos
├── Chat texto            ├── Mafia voice (noche)
├── Stats                 ├── Town voice (día)
└── Role cards            └── Dead voice
```

**Flujo**:
1. Web: UI, votaciones, acciones
2. Discord: Solo VOZ
3. Bot mueve jugadores automáticamente

---

## Canales de Voz Dinámicos

### **Estructura**

```
Discord Server
├── 🔊 Town Square (DÍA)
├── 🔊 Mafia (NOCHE - solo Mafia)
├── 🔊 Graveyard (Muertos)
└── 🔊 Jail (Jailor 1v1)
```

### **Código - Crear Canales**

```javascript
import { Client, ChannelType } from 'discord.js';

async function createGameChannels(gameId, guildId) {
  const guild = client.guilds.cache.get(guildId);
  
  // Town Voice
  const townChannel = await guild.channels.create({
    name: `🏘️ Town - Game ${gameId}`,
    type: ChannelType.GuildVoice,
    userLimit: 15,
  });
  
  // Mafia Voice (privado)
  const mafiaChannel = await guild.channels.create({
    name: `🔴 Mafia - Game ${gameId}`,
    type: ChannelType.GuildVoice,
    permissionOverwrites: [{
      id: guild.id,
      deny: ['ViewChannel'],
    }],
  });
  
  return { townChannel, mafiaChannel };
}
```

### **Mover Jugadores por Fase**

```javascript
async function handlePhaseChange(phase, players) {
  if (phase === 'DAY') {
    // Todos a Town
    for (const player of players.filter(p => p.alive)) {
      const member = await guild.members.fetch(player.discordId);
      await member.voice.setChannel(townChannel);
      await member.voice.setMute(false);
    }
  }
  
  if (phase === 'NIGHT') {
    // Mafia a su canal
    const mafia = players.filter(p => p.faction === 'Mafia' && p.alive);
    for (const player of mafia) {
      const member = await guild.members.fetch(player.discordId);
      await member.voice.setChannel(mafiaChannel);
    }
    
    // Town muteado
    const town = players.filter(p => p.faction !== 'Mafia' && p.alive);
    for (const player of town) {
      const member = await guild.members.fetch(player.discordId);
      await member.voice.setMute(true); // Silencio!
    }
  }
}
```

---

## Implementación Bot

### **Setup Básico**

```bash
npm install discord.js @discordjs/voice
```

```javascript
// bot.js
import { Client, GatewayIntentBits } from 'discord.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
  ]
});

client.on('ready', () => {
  console.log(`✅ Bot: ${client.user.tag}`);
});

client.login(process.env.DISCORD_BOT_TOKEN);
```

### **Crear Bot en Discord**

1. https://discord.com/developers/applications
2. New Application → "Mafia Bot"
3. Bot → Add Bot → Copy Token
4. OAuth2 → Permissions:
   - Manage Channels
   - Move Members
   - Mute Members
5. Invitar a tu server

---

## Comandos Slash

```javascript
import { SlashCommandBuilder } from 'discord.js';

// Comando /mafia crear
const createCommand = new SlashCommandBuilder()
  .setName('mafia')
  .setDescription('Crear partida')
  .addIntegerOption(option =>
    option
      .setName('jugadores')
      .setDescription('Número (4-15)')
      .setMinValue(4)
      .setMaxValue(15)
      .setRequired(true)
  );

client.on('interactionCreate', async interaction => {
  if (interaction.commandName === 'mafia') {
    const count = interaction.options.getInteger('jugadores');
    
    // Crear partida
    const game = await createGame({ playerCount: count });
    
    await interaction.reply({
      embeds: [{
        title: '🎮 Partida Creada',
        description: `Link: https://mafiagame.com/join/${game.code}`,
        color: 0x00FF00,
      }]
    });
  }
});
```

---

## Configuración .env

```bash
DISCORD_BOT_TOKEN=MTIz...xyz
DISCORD_CLIENT_ID=123456789
DISCORD_GUILD_ID=987654321
```

---

## Checklist

- [ ] Crear bot en Discord
- [ ] Instalar Discord.js
- [ ] Crear canales dinámicos
- [ ] Mover jugadores por fase
- [ ] Comandos slash
- [ ] Integrar con backend

---

**Recomendación**: Sistema híbrido (Web + Discord). Mejor UX y gratis. 🎮
