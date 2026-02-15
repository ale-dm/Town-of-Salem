# 🤖 SISTEMA DE BOTS IA - Arquitectura Completa

> **📗 Implementación Completa con Código**  
> Este documento contiene la arquitectura detallada, triggers, timing, y código de implementación.  
> Para un overview básico del sistema, ver: **[BOT_SYSTEM.md](BOT_SYSTEM.md)**

## 📋 Índice
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Triggers y Cuándo Actúa](#triggers-y-cuándo-actúa)
- [Sistema de Decisiones](#sistema-de-decisiones)
- [Timing y Delays](#timing-y-delays)
- [Prompts Detallados](#prompts-detallados)
- [Mejoras Avanzadas](#mejoras-avanzadas)

---

## Arquitectura del Sistema

### **Componentes Principales**

```
┌─────────────────────────────────────────────┐
│           GAME ENGINE                        │
│  ┌─────────────────────────────────────┐   │
│  │    Bot Manager (Orquestador)        │   │
│  │  - Detecta eventos                  │   │
│  │  - Determina si bot debe actuar     │   │
│  │  - Coordina llamadas a IA           │   │
│  └─────────────────────────────────────┘   │
│                    ↓                         │
│  ┌─────────────────────────────────────┐   │
│  │    Decision Engine                  │   │
│  │  - Llama a Gemini API               │   │
│  │  - Parsea respuestas                │   │
│  │  - Valida acciones                  │   │
│  └─────────────────────────────────────┘   │
│                    ↓                         │
│  ┌─────────────────────────────────────┐   │
│  │    Action Executor                  │   │
│  │  - Ejecuta acción decidida          │   │
│  │  - Simula timing humano             │   │
│  │  - Añade typos (opcional)           │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## Triggers y Cuándo Actúa

### **Sistema de Triggers**

El bot decide actuar basándose en **eventos del juego**:

```typescript
// backend/src/bots/triggers.ts

enum BotTrigger {
  // FASE DÍA
  DAY_START = 'day_start',
  PLAYER_SPEAKS = 'player_speaks',
  PLAYER_NOMINATED = 'player_nominated',
  PLAYER_ON_TRIAL = 'player_on_trial',
  VOTING_PHASE = 'voting_phase',
  
  // FASE NOCHE
  NIGHT_START = 'night_start',
  NIGHT_ACTION_PROMPT = 'night_action_prompt',
  
  // SOCIAL
  MENTIONED_IN_CHAT = 'mentioned_in_chat',
  ACCUSED = 'accused',
  DEFENDED = 'defended',
  WHISPER_RECEIVED = 'whisper_received',
  
  // MAFIA ESPECÍFICO
  MAFIA_CHAT_MESSAGE = 'mafia_chat_message',
  MAFIA_DISCUSSION = 'mafia_discussion',
  
  // EVENTOS IMPORTANTES
  PLAYER_DIED = 'player_died',
  ROLE_REVEALED = 'role_revealed',
  INFORMATION_RECEIVED = 'information_received',
  
  // TEMPORIZADORES
  SILENCE_TOO_LONG = 'silence_too_long',
  RANDOM_COMMENT = 'random_comment'
}

interface TriggerContext {
  trigger: BotTrigger;
  gameState: GameState;
  recentMessages: Message[];
  botState: BotState;
  metadata?: any;
}
```

### **Decisión de Actuar**

```typescript
// backend/src/bots/BotManager.ts

class BotManager {
  async shouldBotAct(bot: Bot, trigger: BotTrigger, context: TriggerContext): Promise<boolean> {
    const { personality, roleState, gameState } = bot;
    
    // 1. TRIGGERS OBLIGATORIOS (siempre actúa)
    const MANDATORY_TRIGGERS = [
      BotTrigger.NIGHT_ACTION_PROMPT,    // Debe usar habilidad nocturna
      BotTrigger.VOTING_PHASE,           // Debe votar
      BotTrigger.ACCUSED,                // Debe defenderse si acusado
    ];
    
    if (MANDATORY_TRIGGERS.includes(trigger)) {
      return true;
    }
    
    // 2. TRIGGERS DE ALTA PRIORIDAD (muy probable que actúe)
    const HIGH_PRIORITY_TRIGGERS = [
      BotTrigger.MENTIONED_IN_CHAT,      // Le mencionaron
      BotTrigger.PLAYER_ON_TRIAL,        // Juicio importante
      BotTrigger.PLAYER_DIED,            // Muerte importante
      BotTrigger.INFORMATION_RECEIVED,   // Sheriff/Investigator result
    ];
    
    if (HIGH_PRIORITY_TRIGGERS.includes(trigger)) {
      // 80% probabilidad base + ajuste por personalidad
      const baseProbability = 0.8;
      const personalityModifier = this.getPersonalityModifier(personality, trigger);
      return Math.random() < (baseProbability + personalityModifier);
    }
    
    // 3. TRIGGERS SOCIALES (depende de personalidad)
    const SOCIAL_TRIGGERS = [
      BotTrigger.DAY_START,
      BotTrigger.PLAYER_SPEAKS,
      BotTrigger.SILENCE_TOO_LONG,
    ];
    
    if (SOCIAL_TRIGGERS.includes(trigger)) {
      return this.shouldBotSpeakSocially(bot, trigger, context);
    }
    
    // 4. TRIGGERS DE MAFIA
    if (trigger === BotTrigger.MAFIA_CHAT_MESSAGE) {
      return this.shouldRespondToMafia(bot, context);
    }
    
    return false;
  }
  
  private shouldBotSpeakSocially(bot: Bot, trigger: BotTrigger, context: TriggerContext): boolean {
    const { personality, lastSpokeAt, messagesCount } = bot;
    
    // Verificar cooldown (no hablar cada 5 segundos)
    const timeSinceLastSpeak = Date.now() - lastSpokeAt;
    if (timeSinceLastSpeak < 30000) { // 30 segundos mínimo
      return false;
    }
    
    // Personalidades habladoras (Agresivo, Sherlock)
    if (['aggressive', 'sherlock'].includes(personality.type)) {
      return Math.random() < 0.4; // 40% probabilidad
    }
    
    // Personalidades calladas (Silencioso, Cauteloso)
    if (['silent', 'cautious'].includes(personality.type)) {
      return Math.random() < 0.1; // 10% probabilidad
    }
    
    // Novato habla poco al inicio, más después
    if (personality.type === 'newbie') {
      const gameProgress = context.gameState.day / 7; // Normalizado
      return Math.random() < (0.15 + gameProgress * 0.2); // 15-35%
    }
    
    // Por defecto
    return Math.random() < 0.25; // 25% probabilidad
  }
  
  private shouldRespondToMafia(bot: Bot, context: TriggerContext): boolean {
    // Mafia siempre responde a preguntas directas
    const lastMessage = context.recentMessages[0];
    if (lastMessage?.content.includes(bot.name)) {
      return true;
    }
    
    // Mafia coordina - probabilidad alta
    if (context.gameState.phase === 'NIGHT') {
      return Math.random() < 0.6; // 60%
    }
    
    return Math.random() < 0.3; // 30%
  }
}
```

---

## Sistema de Decisiones

### **Flujo de Decisión Completo**

```typescript
// backend/src/bots/DecisionEngine.ts

class DecisionEngine {
  async makeDecision(bot: Bot, trigger: BotTrigger, context: TriggerContext): Promise<BotAction> {
    // 1. Construir contexto completo para la IA
    const aiContext = await this.buildAIContext(bot, context);
    
    // 2. Generar prompt específico según trigger
    const prompt = await this.buildPrompt(bot, trigger, aiContext);
    
    // 3. Llamar a Gemini API
    const aiResponse = await this.callGeminiAPI(prompt, bot.personality);
    
    // 4. Parsear y validar respuesta
    const action = await this.parseAndValidate(aiResponse, bot, context);
    
    // 5. Aplicar ajustes de personalidad
    const finalAction = await this.applyPersonalityTweaks(action, bot);
    
    return finalAction;
  }
  
  private async buildAIContext(bot: Bot, context: TriggerContext): Promise<AIContext> {
    const { gameState, recentMessages } = context;
    
    return {
      // Estado del juego
      day: gameState.day,
      phase: gameState.phase,
      alivePlayers: gameState.players.filter(p => p.alive),
      deadPlayers: gameState.players.filter(p => !p.alive),
      
      // Información del bot
      myRole: bot.role,
      myFaction: bot.faction,
      myName: bot.name,
      
      // Memoria del bot
      suspicions: bot.memory.suspicions,
      allies: bot.memory.allies,
      enemies: bot.memory.enemies,
      claims: bot.memory.roleClaims,
      
      // Chat reciente (últimos 10 mensajes)
      recentChat: recentMessages.slice(-10),
      
      // Información privada (investigaciones, etc)
      privateInfo: await this.getPrivateInfo(bot),
      
      // Estado emocional
      stress: bot.emotion.stress,
      confidence: bot.emotion.confidence,
    };
  }
  
  private async buildPrompt(bot: Bot, trigger: BotTrigger, context: AIContext): Promise<string> {
    // Seleccionar template según trigger
    switch (trigger) {
      case BotTrigger.DAY_START:
        return this.buildDayStartPrompt(bot, context);
      
      case BotTrigger.NIGHT_ACTION_PROMPT:
        return this.buildNightActionPrompt(bot, context);
      
      case BotTrigger.VOTING_PHASE:
        return this.buildVotingPrompt(bot, context);
      
      case BotTrigger.ACCUSED:
        return this.buildDefensePrompt(bot, context);
      
      case BotTrigger.PLAYER_SPEAKS:
        return this.buildResponsePrompt(bot, context);
      
      default:
        return this.buildGenericPrompt(bot, context);
    }
  }
}
```

### **Ejemplo: Prompt de Acción Nocturna**

```typescript
private buildNightActionPrompt(bot: Bot, context: AIContext): string {
  const { myRole, alivePlayers, suspicions, privateInfo } = context;
  
  return `
Eres ${bot.name}, un ${myRole} en Town of Salem.
Es la noche ${context.day}.

TU OBJETIVO: ${this.getRoleGoal(myRole)}

JUGADORES VIVOS:
${alivePlayers.map(p => `- ${p.name} ${this.getKnownInfo(p, bot)}`).join('\n')}

TUS SOSPECHAS:
${Object.entries(suspicions).map(([name, level]) => `- ${name}: ${level}/10`).join('\n')}

INFORMACIÓN QUE TIENES:
${privateInfo.map(info => `- ${info}`).join('\n')}

TU HABILIDAD: ${this.getRoleAbility(myRole)}

DECISIÓN REQUERIDA:
${this.getRoleActionPrompt(myRole)}

Responde SOLO en formato JSON:
{
  "target": "nombre_del_jugador",
  "reasoning": "breve explicación de por qué",
  "confidence": 1-10
}

IMPORTANTE:
- Sé estratégico basado en tus sospechas
- Considera información previa
- ${this.getPersonalityGuideline(bot.personality)}
`;
}

private getRoleActionPrompt(role: string): string {
  const prompts = {
    'Sheriff': '¿A quién quieres interrogar? Elige alguien sospechoso.',
    'Doctor': '¿A quién quieres curar? Considera proteger roles importantes o targets probables.',
    'Vigilante': '¿A quién quieres disparar? (Tienes X balas). CUIDADO: Si matas Town, te suicidas.',
    'Serial Killer': '¿A quién quieres asesinar? Recuerda que matas a tus visitantes.',
    'Arsonist': '¿Quieres rociar gasolina a alguien o quemar a todos los rociados?',
    'Godfather': '¿A quién ordenas asesinar? Coordina con tu Mafia.',
  };
  
  return prompts[role] || '¿Qué acción quieres realizar?';
}

private getPersonalityGuideline(personality: Personality): string {
  const guidelines = {
    'aggressive': 'Sé agresivo y directo. No dudes.',
    'paranoid': 'Desconfía de todos. Busca amenazas.',
    'sherlock': 'Analiza lógicamente. Busca patrones.',
    'newbie': 'Estás inseguro. Sigue a la mayoría.',
    'silent': 'Actúa sin explicar mucho.',
    'chaotic': 'Sé impredecible.',
  };
  
  return guidelines[personality.type] || 'Actúa según tu criterio.';
}
```

### **Ejemplo: Prompt de Chat Público**

```typescript
private buildResponsePrompt(bot: Bot, context: AIContext): string {
  const lastMessages = context.recentChat.slice(-5);
  
  return `
Eres ${bot.name}, rol secreto: ${context.myRole}.
Es el día ${context.day}.

ÚLTIMOS MENSAJES:
${lastMessages.map(m => `${m.author}: ${m.content}`).join('\n')}

TU SITUACIÓN:
- Estrés: ${context.stress}/10
- Confianza: ${context.confidence}/10
- Sospechan de ti: ${this.howSuspiciousAmI(bot)}

TU PERSONALIDAD: ${bot.personality.description}

¿Quieres responder? ¿Qué dirías?

Responde en JSON:
{
  "shouldSpeak": true/false,
  "message": "tu mensaje aquí (máximo 280 caracteres)",
  "tone": "casual|defensive|aggressive|analytical",
  "confidence": 1-10
}

REGLAS:
- NO reveles tu rol real (excepto si es estratégico)
- Sé consistente con mensajes anteriores
- ${this.getPersonalityGuideline(bot.personality)}
- Si estás estresado, muestra nerviosismo
`;
}
```

---

## Timing y Delays

### **Sistema de Delays Humanos**

```typescript
// backend/src/bots/TimingSimulator.ts

class TimingSimulator {
  /**
   * Calcula el delay antes de que el bot actúe
   * Simula tiempo de lectura + pensamiento + escritura
   */
  async calculateDelay(action: BotAction, context: TriggerContext): Promise<number> {
    const { messageLength, complexity, botPersonality } = action;
    
    // 1. Tiempo de lectura (leer contexto)
    const readingTime = this.calculateReadingTime(context);
    
    // 2. Tiempo de pensamiento
    const thinkingTime = this.calculateThinkingTime(complexity, botPersonality);
    
    // 3. Tiempo de escritura (si es mensaje de chat)
    const writingTime = messageLength 
      ? this.calculateWritingTime(messageLength, botPersonality)
      : 0;
    
    // 4. Variación aleatoria (±20%)
    const totalTime = readingTime + thinkingTime + writingTime;
    const variance = totalTime * 0.2;
    const finalDelay = totalTime + (Math.random() - 0.5) * 2 * variance;
    
    return Math.max(1000, finalDelay); // Mínimo 1 segundo
  }
  
  private calculateReadingTime(context: TriggerContext): number {
    // ~250 palabras por minuto = ~4 palabras por segundo
    const recentWords = context.recentMessages
      .slice(-5)
      .reduce((sum, msg) => sum + msg.content.split(' ').length, 0);
    
    return (recentWords / 4) * 1000; // Convertir a ms
  }
  
  private calculateThinkingTime(complexity: number, personality: Personality): number {
    // Base: 2-5 segundos según complejidad
    const baseTime = 2000 + (complexity * 1000);
    
    // Modificadores por personalidad
    const modifiers = {
      'aggressive': 0.7,   // Piensa rápido
      'paranoid': 1.3,     // Piensa mucho
      'sherlock': 1.5,     // Analiza todo
      'newbie': 1.8,       // Duda mucho
      'silent': 1.2,       // Piensa antes de hablar
      'chaotic': 0.8,      // Actúa impulsivo
    };
    
    const modifier = modifiers[personality.type] || 1.0;
    return baseTime * modifier;
  }
  
  private calculateWritingTime(messageLength: number, personality: Personality): number {
    // ~40 caracteres por segundo (typing speed promedio)
    const baseTime = (messageLength / 40) * 1000;
    
    // Modificadores
    const modifiers = {
      'aggressive': 1.2,   // Escribe rápido, errores
      'sherlock': 0.9,     // Escribe eficientemente
      'newbie': 1.5,       // Escribe lento
      'silent': 0.8,       // Mensajes cortos
    };
    
    const modifier = modifiers[personality.type] || 1.0;
    return baseTime * modifier;
  }
  
  /**
   * Simula "typing indicator" (está escribiendo...)
   */
  async simulateTyping(bot: Bot, duration: number): Promise<void> {
    // Mostrar indicador "Bot está escribiendo..."
    await this.showTypingIndicator(bot.id, true);
    
    // Esperar con pequeñas pausas (más realista)
    const chunks = Math.floor(duration / 1000); // Dividir en segundos
    for (let i = 0; i < chunks; i++) {
      await this.sleep(1000);
      
      // 10% probabilidad de pausa (pensando)
      if (Math.random() < 0.1) {
        await this.showTypingIndicator(bot.id, false);
        await this.sleep(500);
        await this.showTypingIndicator(bot.id, true);
      }
    }
    
    await this.showTypingIndicator(bot.id, false);
  }
}
```

### **Patrones de Timing por Situación**

```typescript
const TIMING_PATTERNS = {
  // Acción nocturna: rápido (ya sabe qué hacer)
  night_action: {
    min: 2000,   // 2 segundos
    max: 8000,   // 8 segundos
    complexity: 2
  },
  
  // Votación: medio (necesita pensar)
  voting: {
    min: 3000,   // 3 segundos
    max: 12000,  // 12 segundos
    complexity: 3
  },
  
  // Defensa propia: rápido (urgente)
  defense: {
    min: 2000,   // 2 segundos
    max: 6000,   // 6 segundos
    complexity: 2
  },
  
  // Mensaje casual: variable
  casual_message: {
    min: 3000,   // 3 segundos
    max: 20000,  // 20 segundos
    complexity: 3
  },
  
  // Análisis complejo (Sherlock): lento
  complex_analysis: {
    min: 10000,  // 10 segundos
    max: 30000,  // 30 segundos
    complexity: 5
  }
};
```

---

## Llamadas a Gemini API

### **Rate Limiting y Gestión**

```typescript
// backend/src/bots/GeminiService.ts

class GeminiService {
  private requestQueue: RequestQueue;
  private rateLimiter: RateLimiter;
  
  constructor() {
    // Gemini Free: 15 requests/min, 1500 requests/day
    this.rateLimiter = new RateLimiter({
      maxPerMinute: 15,
      maxPerDay: 1500
    });
    
    this.requestQueue = new RequestQueue();
  }
  
  async generateBotDecision(
    prompt: string,
    bot: Bot,
    priority: number = 5
  ): Promise<AIResponse> {
    // 1. Añadir a cola con prioridad
    const request = {
      prompt,
      bot,
      priority,
      timestamp: Date.now()
    };
    
    await this.requestQueue.enqueue(request);
    
    // 2. Esperar turno (respeta rate limit)
    await this.rateLimiter.waitForSlot();
    
    // 3. Hacer llamada
    try {
      const response = await this.callAPI(prompt, bot);
      return response;
    } catch (error) {
      // 4. Fallback si falla
      return this.generateFallbackDecision(bot, prompt);
    }
  }
  
  private async callAPI(prompt: string, bot: Bot): Promise<AIResponse> {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: bot.personality.temperature || 0.8,
        maxOutputTokens: 500,
        responseMimeType: 'application/json',
      }
    });
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    
    const text = result.response.text();
    return JSON.parse(text);
  }
  
  private generateFallbackDecision(bot: Bot, prompt: string): AIResponse {
    // Decisión simple sin IA (si API falla)
    if (prompt.includes('night action')) {
      return this.simplestNightAction(bot);
    }
    
    if (prompt.includes('voting')) {
      return this.simplestVote(bot);
    }
    
    // Por defecto: no hacer nada
    return { action: 'skip', reasoning: 'API unavailable' };
  }
}
```

### **Priorización de Requests**

```typescript
class RequestQueue {
  private queue: PriorityQueue<BotRequest>;
  
  /**
   * Prioridades:
   * 1 = Crítico (defensa propia, voting)
   * 3 = Alto (night action, acusación)
   * 5 = Normal (chat, análisis)
   * 7 = Bajo (comentario casual)
   */
  async enqueue(request: BotRequest): Promise<void> {
    this.queue.insert(request, request.priority);
  }
  
  async dequeue(): Promise<BotRequest> {
    return this.queue.extractMin();
  }
}
```

---

## Mejoras Avanzadas

### **1. Sistema de Memoria Persistente**

```typescript
interface BotMemory {
  // Memoria a corto plazo (solo partida actual)
  shortTerm: {
    suspicions: Map<string, number>;      // Jugador → nivel sospecha (0-10)
    allies: Set<string>;                   // Jugadores aliados
    roleClaims: Map<string, string>;      // Jugador → rol que claimó
    votingPatterns: Map<string, number[]>; // Jugador → historial votos
    interactions: Interaction[];           // Últimas 20 interacciones
  };
  
  // Memoria a largo plazo (entre partidas) - NUEVO
  longTerm: {
    playerStyles: Map<string, PlayerStyle>; // Estilo de juego por jugador
    successfulStrategies: Strategy[];        // Estrategias que funcionaron
    failedStrategies: Strategy[];            // Estrategias que fallaron
    rolePerformance: Map<string, Performance>; // Cómo juega cada rol
  };
}

// Ejemplo de uso:
async function rememberPlayerStyle(bot: Bot, player: string, game: Game): Promise<void> {
  const style = await analyzePlayerStyle(player, game);
  
  await prisma.botMemory.upsert({
    where: {
      botId_playerId: {
        botId: bot.id,
        playerId: player
      }
    },
    update: {
      aggressionLevel: style.aggression,
      trustworthiness: style.trust,
      analyticalSkill: style.analytical,
      timesPlayed: { increment: 1 }
    },
    create: {
      botId: bot.id,
      playerId: player,
      ...style
    }
  });
}
```

### **2. Aprendizaje por Refuerzo (Básico)**

```typescript
interface LearningSystem {
  // Después de cada partida
  async updateFromGame(bot: Bot, game: Game, result: 'WIN' | 'LOSS'): Promise<void> {
    const decisions = await getBot Decisions(bot, game);
    
    for (const decision of decisions) {
      // Si ganó, reforzar decisiones
      if (result === 'WIN') {
        await this.reinforceDecision(decision, +1);
      } else {
        // Si perdió, penalizar
        await this.reinforceDecision(decision, -0.5);
      }
    }
  };
  
  async reinforceDecision(decision: Decision, reward: number): Promise<void> {
    // Actualizar "confidence" en decisiones similares
    await prisma.botLearning.create({
      data: {
        botId: decision.botId,
        situationType: decision.type,
        action: decision.action,
        reward,
        context: decision.context
      }
    });
  };
  
  // Al tomar decisiones futuras, consultar aprendizaje
  async getLearnedPreference(bot: Bot, situation: string): Promise<number> {
    const learnings = await prisma.botLearning.findMany({
      where: {
        botId: bot.id,
        situationType: situation
      }
    });
    
    // Calcular promedio de rewards
    const avgReward = learnings.reduce((sum, l) => sum + l.reward, 0) / learnings.length;
    return avgReward;
  };
}
```

### **3. Sistema de "Tells" (Comportamiento Humano)**

```typescript
interface BotTells {
  // Patrones que delatan que es bot
  writingSpeed: {
    min: number;
    max: number;
    variance: number;
  };
  
  responsePatterns: {
    phraseFrequency: Map<string, number>;  // Evitar repetir frases
    lastUsedPhrases: string[];              // Últimas 10 frases usadas
  };
  
  typingErrors: {
    enabled: boolean;
    frequency: number;  // 0-1 (% de mensajes con typo)
    types: ['typo', 'autocorrect', 'emoji'];
  };
  
  behavioralQuirks: {
    capitalization: 'normal' | 'lowercase' | 'CAPS';  // Estilo de escritura
    punctuation: 'proper' | 'excessive' | 'minimal';  // ...!!! vs .
    emojiUsage: number;  // 0-1 (frecuencia)
  };
}

// Aplicar "tells" al mensaje
function makeMessageHuman(message: string, tells: BotTells): string {
  let result = message;
  
  // 1. Typos aleatorios
  if (tells.typingErrors.enabled && Math.random() < tells.typingErrors.frequency) {
    result = addTypo(result);
  }
  
  // 2. Ajustar capitalización
  if (tells.behavioralQuirks.capitalization === 'lowercase') {
    result = result.toLowerCase();
  }
  
  // 3. Añadir emoji ocasional
  if (Math.random() < tells.behavioralQuirks.emojiUsage) {
    result += ' ' + randomEmoji();
  }
  
  // 4. Ajustar puntuación
  if (tells.behavioralQuirks.punctuation === 'excessive') {
    result = result.replace(/\./g, '...');
    result = result.replace(/!/g, '!!!');
  }
  
  return result;
}
```

### **4. Detección de Contexto Avanzada**

```typescript
class AdvancedContextDetector {
  /**
   * Detecta situaciones complejas que requieren respuesta
   */
  async detectSituation(game: Game, bot: Bot): Promise<Situation[]> {
    const situations: Situation[] = [];
    
    // ¿Te están acusando indirectamente?
    if (await this.isBeingIndirectlyAccused(bot, game)) {
      situations.push({
        type: 'INDIRECT_ACCUSATION',
        urgency: 8,
        description: 'Alguien insinúa que eres sospechoso'
      });
    }
    
    // ¿Hay un patrón de votación contra ti?
    if (await this.detectVotingPattern(bot, game)) {
      situations.push({
        type: 'VOTING_PATTERN',
        urgency: 9,
        description: 'Múltiples jugadores votan contra ti consistentemente'
      });
    }
    
    // ¿Alguien está mintiendo sobre tu rol?
    if (await this.detectFalseRoleClaim(bot, game)) {
      situations.push({
        type: 'FALSE_CLAIM',
        urgency: 10,
        description: 'Alguien claimó tu rol o dice que te investigó'
      });
    }
    
    // ¿Hay silencio sospechoso? (nadie habla)
    if (await this.detectSuspiciousSilence(game)) {
      situations.push({
        type: 'SUSPICIOUS_SILENCE',
        urgency: 3,
        description: 'Nadie ha hablado en 60 segundos'
      });
    }
    
    return situations.sort((a, b) => b.urgency - a.urgency);
  }
  
  private async isBeingIndirectlyAccused(bot: Bot, game: Game): Promise<boolean> {
    const recentMessages = await getRecentMessages(game, 10);
    
    // Buscar menciones indirectas
    const indirectPhrases = [
      `${bot.name} está callado`,
      `sospecho de ${bot.name}`,
      `${bot.name} no ha dicho su rol`,
      `por qué ${bot.name}`,
    ];
    
    return recentMessages.some(msg => 
      indirectPhrases.some(phrase => 
        msg.content.toLowerCase().includes(phrase.toLowerCase())
      )
    );
  }
}
```

### **5. Multi-Bot Coordination (Para Mafia)**

```typescript
class MafiaCoordination {
  /**
   * Coordina acciones entre bots Mafia
   */
  async coordinateMafiaAction(mafiaBots: Bot[], game: Game): Promise<void> {
    // 1. Determinar quién habla en chat Mafia
    const speaker = this.selectMafiaSpeaker(mafiaBots);
    
    // 2. Decidir target en conjunto
    const suggestedTargets = await Promise.all(
      mafiaBots.map(bot => this.getBotTargetSuggestion(bot, game))
    );
    
    // 3. Llegar a consenso
    const finalTarget = this.reachConsensus(suggestedTargets);
    
    // 4. Comunicar decisión
    await this.announceMafiaDecision(speaker, finalTarget, game);
    
    // 5. Coordinar fake claims
    await this.coordinateFakeClaims(mafiaBots, game);
  }
  
  private async coordinateFakeClaims(mafiaBots: Bot[], game: Game): Promise<void> {
    const takenClaims = await getTakenRoleClaims(game);
    const availableClaims = TOWN_ROLES.filter(role => !takenClaims.includes(role));
    
    // Asignar fake claims sin conflictos
    for (const bot of mafiaBots) {
      if (!bot.memory.myFakeClaim) {
        const claim = availableClaims.shift();
        bot.memory.myFakeClaim = claim;
        
        // Actualizar en BD
        await updateBotMemory(bot.id, { fakeClaim: claim });
      }
    }
  }
}
```

### **6. Análisis de Sentimiento en Chat**

```typescript
class SentimentAnalyzer {
  /**
   * Analiza el "mood" del chat para ajustar comportamiento
   */
  async analyzeChatSentiment(messages: Message[]): Promise<ChatMood> {
    const sentiments = messages.map(msg => this.analyzeSentiment(msg.content));
    
    const avgTension = sentiments.reduce((sum, s) => sum + s.tension, 0) / sentiments.length;
    const avgAggression = sentiments.reduce((sum, s) => sum + s.aggression, 0) / sentiments.length;
    const avgConfusion = sentiments.reduce((sum, s) => sum + s.confusion, 0) / sentiments.length;
    
    return {
      tension: avgTension,        // 0-1 (qué tenso está el chat)
      aggression: avgAggression,  // 0-1 (qué agresivo)
      confusion: avgConfusion,    // 0-1 (qué confuso)
      chaos: this.detectChaos(messages),  // ¿Muchos hablando a la vez?
    };
  }
  
  /**
   * Ajustar comportamiento de bot según mood
   */
  adjustBotBehavior(bot: Bot, mood: ChatMood): void {
    // Si hay mucha tensión, bots más cautelosos
    if (mood.tension > 0.7) {
      bot.personality.aggression *= 0.7;
      bot.emotion.stress += 2;
    }
    
    // Si hay caos, bots callados esperan
    if (mood.chaos > 0.8) {
      bot.shouldWaitToSpeak = true;
    }
    
    // Si hay confusión, Sherlock habla más
    if (mood.confusion > 0.6 && bot.personality.type === 'sherlock') {
      bot.probabilityToSpeak *= 1.5;
    }
  }
}
```

---

## Checklist de Implementación

### **Fase 1: Sistema Básico**
- [ ] BotManager con triggers básicos
- [ ] Decisiones simples (night action, voting)
- [ ] Llamadas a Gemini con rate limiting
- [ ] Delays simul ados

### **Fase 2: Mejoras de Realismo**
- [ ] Typing indicators
- [ ] Delays variables por personalidad
- [ ] Sistema de "tells" (typos, etc)
- [ ] Detección de contexto avanzada

### **Fase 3: Inteligencia Avanzada**
- [ ] Memoria persistente entre partidas
- [ ] Aprendizaje básico (refuerzo)
- [ ] Coordinación Mafia
- [ ] Análisis de sentimiento

### **Fase 4: Optimización**
- [ ] Cache de decisiones comunes
- [ ] Fallbacks sin IA
- [ ] Pruebas de indistinguibilidad

---

**Última actualización**: Febrero 2026  
**Sistema completo**: ✅ Listo para implementar bots indistinguibles de humanos