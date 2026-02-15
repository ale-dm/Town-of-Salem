# 🤖 BOT SYSTEM - Sistema de IA Completo

> **📘 Guía Básica del Sistema de Bots**  
> Este documento cubre el overview y arquitectura general.  
> Para implementación completa con código detallado, triggers, timing y mejoras avanzadas, ver: **[BOT_SYSTEM_ADVANCED.md](BOT_SYSTEM_ADVANCED.md)**

## 📋 Índice
- [Overview](#overview)
- [Arquitectura IA](#arquitectura-ia)
- [Personalidades Predefinidas](#personalidades-predefinidas)
- [Sistema de Entrenamiento Custom](#sistema-de-entrenamiento-custom)
- [Prompts y Decisiones](#prompts-y-decisiones)
- [Timing y Comportamiento](#timing-y-comportamiento)
- [Implementación Técnica](#implementación-técnica)

---

## Overview

Sistema de bots con IA basado en **Google Gemini 2.0 Flash** (gratis) que genera comportamiento humano realista.

### **Características Clave**
- ✅ 6 personalidades predefinidas
- ✅ Entrenamiento custom con tu estilo
- ✅ Memoria conversacional (solo partida actual)
- ✅ Emociones dinámicas
- ✅ Timing realista (no instantáneo)
- ✅ Typos y errores humanos
- ✅ Adaptación durante partida
- ✅ 100% gratis (Gemini API)

---

## Arquitectura IA

```
┌─────────────────────────────────────┐
│     Google Gemini 2.0 Flash         │
│       (gemini-2.0-flash-exp)        │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│       Bot Decision Engine            │
│  - Construye prompts contextuales   │
│  - Gestiona timing                  │
│  - Aplica personalidad              │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│        Game Context                  │
│  - Estado actual (día, fase)        │
│  - Chat reciente (10 msgs)          │
│  - Roles conocidos                  │
│  - Memoria intra-partida            │
└─────────────────────────────────────┘
              ↓
        Decision JSON
        ↓
   Execute Action
```

---

## Personalidades Predefinidas

### **1. 😰 PARANOICO**
```typescript
{
  id: 'paranoid',
  name: 'Bot Paranoico',
  avatar: '😰',
  traits: {
    aggression: 7,
    paranoia: 10,
    verbosity: 8,
    deduction: 5,
    emotional: 8,
    riskTaking: 3,
    trustworthy: 2,
    leadership: 4
  },
  style: {
    phraseTemplates: [
      "No me fío de {player}",
      "{player} es muy sospechoso...",
      "¿Por qué tan callado {player}?",
      "Esto no puede ser coincidencia"
    ],
    typos: false,
    emojis: ['😰', '👀', '🤔', '⚠️']
  }
}
```

**Comportamiento:**
- Acusa frecuentemente
- Desconfía de todos
- Vota rápido por nervios
- Cambia de opinión fácilmente

---

### **2. 😡 AGRESIVO**
```typescript
{
  id: 'aggressive',
  name: 'Bot Agresivo',
  avatar: '😡',
  traits: {
    aggression: 10,
    paranoia: 7,
    verbosity: 9,
    deduction: 6,
    emotional: 9,
    riskTaking: 9,
    trustworthy: 5,
    leadership: 8
  },
  style: {
    phraseTemplates: [
      "EJECUTAD A {player} YA",
      "{player} es mafia 100%",
      "Si no votáis sois tontos",
      "No hay tiempo que perder"
    ],
    typos: true,
    emojis: ['😡', '💀', '⚔️', '🔥']
  }
}
```

**Comportamiento:**
- Lidera votaciones
- Acusa fuertemente
- Usa mayúsculas
- Impaciente

---

### **3. 🕵️ SHERLOCK**
```typescript
{
  id: 'sherlock',
  name: 'Bot Sherlock',
  avatar: '🕵️',
  traits: {
    aggression: 5,
    paranoia: 6,
    verbosity: 7,
    deduction: 10,
    emotional: 3,
    riskTaking: 5,
    trustworthy: 6,
    leadership: 9
  },
  style: {
    phraseTemplates: [
      "Observad el patrón...",
      "Si analizamos D{day}...",
      "{player} votó igual que el mafia",
      "Deducción: {player} probable mafia"
    ],
    typos: false,
    emojis: ['🕵️', '📊', '🧠', '🔍']
  }
}
```

**Comportamiento:**
- Analítico
- Referencias a días anteriores
- Menciona patrones de voto
- Calmado y lógico

---

### **4. 🤷 NOVATO**
```typescript
{
  id: 'newbie',
  name: 'Bot Novato',
  avatar: '🤷',
  traits: {
    aggression: 3,
    paranoia: 5,
    verbosity: 4,
    deduction: 3,
    emotional: 6,
    riskTaking: 2,
    trustworthy: 8,
    leadership: 2
  },
  style: {
    phraseTemplates: [
      "No sé a quién votar...",
      "¿Qué hago?",
      "¿Alguien tiene info?",
      "Voto lo que votéis vosotros"
    ],
    typos: true,
    emojis: ['🤷', '😅', '🤔']
  }
}
```

**Comportamiento:**
- Inseguro
- Pide ayuda
- Sigue a mayoría
- Callado inicialmente

---

### **5. 😶 SILENCIOSO**
```typescript
{
  id: 'silent',
  name: 'Bot Silencioso',
  avatar: '😶',
  traits: {
    aggression: 2,
    paranoia: 5,
    verbosity: 1,
    deduction: 7,
    emotional: 2,
    riskTaking: 4,
    trustworthy: 7,
    leadership: 1
  },
  style: {
    phraseTemplates: [
      "Voto {player}",
      "Ok",
      "...",
      "Sí"
    ],
    typos: false,
    emojis: ['😶', '👍']
  }
}
```

**Comportamiento:**
- Muy pocas palabras
- Observa sin comentar
- Vota estratégicamente
- No lidera

---

### **6. 🎲 CAÓTICO**
```typescript
{
  id: 'chaotic',
  name: 'Bot Caótico',
  avatar: '🎲',
  traits: {
    aggression: randomInt(3, 8),  // Cambia cada partida
    paranoia: randomInt(3, 8),
    verbosity: randomInt(3, 8),
    deduction: randomInt(2, 6),
    emotional: randomInt(5, 9),
    riskTaking: 8,
    trustworthy: 4,
    leadership: randomInt(2, 7)
  },
  style: {
    phraseTemplates: [
      // Genera frases aleatorias con IA
    ],
    typos: true,
    emojis: ['🎲', '🎪', '🃏', '💥']
  }
}
```

**Comportamiento:**
- Impredecible
- Cambia estrategia mid-game
- Vota random a veces
- Divertido

---

## Sistema de Entrenamiento Custom

### **Fase 1: Recolección de Datos**

```typescript
interface PlayerTrainingData {
  userId: string;
  
  // Datos agregados
  totalGames: number;
  messagesCollected: Message[];  // 100-200 samples
  actionsHistory: Action[];
  
  // Patrones extraídos
  avgMessagesPerGame: number;
  avgMessageLength: number;
  commonWords: Map<string, number>;
  sentimentScore: number;  // -1 a 1
  
  // Por rol
  rolePreferences: {
    [role: string]: {
      winRate: number;
      timesPlayed: number;
      typicalBehavior: string[];
    }
  };
  
  // Social
  accusesOften: boolean;
  defendsAccused: boolean;
  formsAlliances: boolean;
  trustsEasily: boolean;
}
```

### **Fase 2: Generación de Perfil con IA**

```typescript
async function generateCustomBot(userId: string) {
  const data = await getTrainingData(userId);
  
  if (data.totalGames < 10) {
    throw new Error('Necesitas 10+ partidas');
  }
  
  // Prompt para Gemini
  const prompt = `
Analiza estos datos de un jugador de Mafia y crea su perfil:

ESTADÍSTICAS:
- ${data.totalGames} partidas
- ${data.avgMessagesPerGame} msgs/partida
- Palabras comunes: ${Array.from(data.commonWords.entries()).slice(0, 20)}

MENSAJES DE EJEMPLO:
${data.messagesCollected.slice(0, 50).map(m => `- "${m.content}"`).join('\n')}

PATRONES DE JUEGO:
- Acusa frecuentemente: ${data.accusesOften}
- Defiende acusados: ${data.defendsAccused}
- Forma alianzas: ${data.formsAlliances}

Genera JSON:
{
  "traits": { /* valores 0-10 */ },
  "styleDescription": "descripción de su estilo",
  "phraseTemplates": [/* 10 frases típicas */],
  "behaviorNotes": "cómo juega"
}
`;

  const result = await gemini.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json'
    }
  });
  
  const profile = JSON.parse(result.response.text());
  
  // Guardar bot custom
  await db.customBots.create({
    data: {
      userId,
      name: `Bot ${userName}`,
      profile,
      trainingData: data
    }
  });
  
  return profile;
}
```

---

## Prompts y Decisiones

### **Estructura del Prompt**

```typescript
function buildPrompt(context: GameContext, personality: BotPersonality): string {
  return `
# CONTEXTO DEL JUEGO

Eres "${personality.name}", un jugador con esta personalidad:
- Agresividad: ${personality.traits.aggression}/10
- Paranoia: ${personality.traits.paranoia}/10
- Verbosidad: ${personality.traits.verbosity}/10
- Deducción: ${personality.traits.deduction}/10

## TU ROL
- Rol: ${context.myRole.name}
- Facción: ${context.myFaction}
- Objetivo: ${context.roleObjective}
- Habilidad: ${context.roleAbility}

## ESTADO ACTUAL
- Fase: ${context.phase}
- Día: ${context.day}
- Jugadores vivos: ${context.playersAlive.map(p => p.name).join(', ')}
- Jugadores muertos: ${context.playersDead.map(p => `${p.name} (${p.role})`).join(', ')}

## CHAT RECIENTE (últimos 10 mensajes)
${context.recentMessages.map(m => `${m.author}: ${m.content}`).join('\n')}

## TU MEMORIA (esta partida)
- Tus mensajes anteriores: ${context.botMemory.myMessages.slice(-5).join('; ')}
- Sospechas actuales: ${Array.from(context.botMemory.suspicions.entries()).map(([p, s]) => `${p}: ${s}/10`).join(', ')}
- Aliados detectados: ${context.botMemory.allies.join(', ')}
- Estado emocional: Confianza ${context.mood.confidence}/10, Estrés ${context.mood.stress}/10

## REGLAS DE COMPORTAMIENTO
${generateBehaviorRules(personality)}

---

DECIDE TU ACCIÓN. Responde SOLO con JSON:

{
  "action": "SPEAK" | "VOTE" | "NIGHT_ACTION" | "WAIT",
  "target": "nombre_jugador" (si aplica),
  "message": "tu mensaje" (si SPEAK, max 280 chars),
  "reasoning": "por qué haces esto (interno)"
}

IMPORTANTE:
- Mensaje natural y coherente con tu personalidad
- Usa frases de tu estilo: ${personality.style.phraseTemplates.slice(0, 3).join(', ')}
${personality.style.typos ? '- Puedes meter algún typo' : '- Escribe sin typos'}
- Emojis: ${personality.style.emojis.join(' ')}
- NO repitas mensajes del chat exactos
`;
}
```

### **Respuesta del Bot**

```json
{
  "action": "SPEAK",
  "target": null,
  "message": "Jugador5 está muy callado, típico de mafia 👀",
  "reasoning": "Jugador5 no ha hablado en 5 mensajes, mi paranoia es alta (10/10), debo acusarlo"
}
```

---

## Timing y Comportamiento

### **Sistema de Triggers**

```typescript
class BotDecisionEngine {
  shouldAct(context: GameContext): boolean {
    // SIEMPRE actuar si:
    if (context.directlyMentioned) return true;
    if (context.phase === 'TRIAL' && context.onTrial === this.botId) return true;
    if (context.phase === 'NIGHT' && this.hasNightAbility()) return true;
    
    // Probabilístico por verbosity
    const talkChance = this.personality.traits.verbosity / 10;
    
    // No hablar si:
    if (context.day === 1 && this.quietEarlyGame) {
      return Math.random() < 0.1;
    }
    
    // Hablar si han pasado >5 mensajes sin participar
    const messagesSinceLastTalk = context.messagesSinceMyLastMessage;
    if (messagesSinceLastTalk > 5) {
      return Math.random() < talkChance;
    }
    
    // Hablar si detecta acusación
    const lastMessage = context.recentMessages[0];
    if (lastMessage.content.includes(this.botName)) {
      return true;
    }
    
    return false;
  }
}
```

### **Delays Realistas**

```typescript
function calculateResponseDelay(
  personality: BotPersonality,
  context: GameContext
): number {
  let delay = 5000; // Base 5 segundos
  
  // Factores que afectan:
  
  // 1. Complejidad del último mensaje
  const lastMessage = context.recentMessages[0];
  const complexity = lastMessage.content.length / 50;
  delay += complexity * 1000;
  
  // 2. Mencionado directamente → responde rápido
  if (context.directlyMentioned) {
    delay *= 0.3;
  }
  
  // 3. Personalidad
  if (personality.traits.leadership > 7) {
    delay *= 0.5; // Líderes rápidos
  }
  
  if (personality.traits.verbosity < 4) {
    delay *= 2; // Callados tardan más
  }
  
  // 4. Estado emocional
  if (context.mood.stress > 7) {
    delay *= 0.6; // Estrés = respuestas rápidas
  }
  
  // 5. Randomness ±30%
  delay *= (0.7 + Math.random() * 0.6);
  
  return delay;
}
```

### **Typing Indicator**

```typescript
async function sendBotMessage(bot: Bot, message: string, gameId: string) {
  // 1. Mostrar "está escribiendo..."
  io.to(gameId).emit('player_typing', { player: bot.name });
  
  // 2. Delay realista
  const typingTime = message.length * (50 + Math.random() * 30);
  await delay(typingTime);
  
  // 3. Enviar mensaje
  io.to(gameId).emit('chat_message', {
    author: bot.name,
    content: message,
    isBot: true,
    timestamp: Date.now()
  });
}
```

---

## Implementación Técnica

### **Bot Manager Service**

```typescript
// src/services/botManager.ts
import { GeminiService } from './geminiService';

export class BotManager {
  private gemini: GeminiService;
  private activeDecisions = new Map<string, Promise<BotDecision>>();
  
  constructor() {
    this.gemini = new GeminiService();
  }
  
  async processBotTurn(bot: Bot, game: Game) {
    // Rate limiting
    if (!this.canActNow(bot.id)) return;
    
    // Build context
    const context = this.buildGameContext(bot, game);
    
    // Check if should act
    if (!this.shouldAct(context, bot.personality)) return;
    
    // Get decision from AI
    const decision = await this.gemini.generateBotDecision(
      context,
      bot.personality
    );
    
    // Execute action
    await this.executeDecision(bot, decision, game);
    
    // Update memory
    this.updateBotMemory(bot, decision, context);
  }
  
  private buildGameContext(bot: Bot, game: Game): GameContext {
    return {
      gameId: game.id,
      phase: game.phase,
      day: game.day,
      
      myRole: bot.role,
      myFaction: bot.faction,
      
      playersAlive: game.players.filter(p => p.alive),
      playersDead: game.players.filter(p => !p.alive),
      
      recentMessages: game.chatHistory.slice(-10),
      
      botMemory: bot.memory,
      mood: bot.mood,
      
      directlyMentioned: this.isMentioned(bot, game.chatHistory),
    };
  }
  
  private async executeDecision(
    bot: Bot,
    decision: BotDecision,
    game: Game
  ) {
    switch (decision.action) {
      case 'SPEAK':
        await this.sendMessage(bot, decision.message!, game);
        break;
        
      case 'VOTE':
        await this.castVote(bot, decision.target!, game);
        break;
        
      case 'NIGHT_ACTION':
        await this.useAbility(bot, decision.target!, game);
        break;
    }
  }
  
  private updateBotMemory(
    bot: Bot,
    decision: BotDecision,
    context: GameContext
  ) {
    // Add to message history
    if (decision.message) {
      bot.memory.myMessages.push(decision.message);
    }
    
    // Update suspicions based on action
    if (decision.target) {
      const currentSuspicion = bot.memory.suspicions.get(decision.target) || 5;
      bot.memory.suspicions.set(
        decision.target,
        decision.action === 'VOTE' ? currentSuspicion + 2 : currentSuspicion
      );
    }
    
    // Update mood
    this.updateMood(bot, context);
  }
  
  private updateMood(bot: Bot, context: GameContext) {
    // Increase stress if nominated
    if (context.nominated === bot.name) {
      bot.mood.stress += 3;
      bot.mood.confidence -= 2;
    }
    
    // Decay stress over time
    if (context.phase === 'DAY') {
      bot.mood.stress = Math.max(0, bot.mood.stress - 1);
    }
  }
}
```

---

## Rate Limiting

```typescript
class BotRateLimiter {
  private lastActions = new Map<string, number>();
  private readonly MIN_INTERVAL = 30000; // 30 seg entre acciones
  
  canAct(botId: string): boolean {
    const lastAction = this.lastActions.get(botId);
    
    if (!lastAction) return true;
    
    const timeSince = Date.now() - lastAction;
    return timeSince > this.MIN_INTERVAL;
  }
  
  recordAction(botId: string) {
    this.lastActions.set(botId, Date.now());
  }
}
```

---

## Límites API Gemini (Gratis)

```
15 requests/minuto
1,500 requests/día
1M tokens/minuto

Estimación por partida (30 min, 3 bots):
- ~50 decisiones por bot
- ~150 requests totales
- ~75k tokens

Partidas posibles/día: ~50-70 ✅
```

---

**Última actualización**: Febrero 2026
