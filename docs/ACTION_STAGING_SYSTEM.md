# 🎯 SISTEMA DE ACCIONES - Staging y UI Interactiva

## 📋 Índice
- [Overview del Sistema](#overview-del-sistema)
- [Estados de Acción](#estados-de-acción)
- [UI de Selección](#ui-de-selección)
- [Sistema de Staging](#sistema-de-staging)
- [Confirmación y Cambios](#confirmación-y-cambios)
- [Implementación Completa](#implementación-completa)

---

## Overview del Sistema

### **Cómo Funciona en Town of Salem**

```
NOCHE EMPIEZA
    ↓
Usuario ve lista de jugadores
    ↓
Click en jugador → "Has decidido matar a Juan" (mensaje privado)
    ↓
Jugador queda STAGED (pendiente)
    ↓
Usuario puede cambiar: Click en Pedro → "Has decidido matar a Pedro"
    ↓
Botón "Confirmar" o esperar fin de noche
    ↓
NOCHE TERMINA → Acción se EJECUTA
```

---

## Estados de Acción

### **Ciclo de Vida de una Acción**

```typescript
enum ActionStatus {
  NOT_SELECTED = 'not_selected',     // Usuario no ha elegido nada
  STAGED = 'staged',                  // Usuario eligió, pero puede cambiar
  CONFIRMED = 'confirmed',            // Usuario confirmó (opcional)
  LOCKED = 'locked',                  // Noche terminó, no puede cambiar
  PROCESSING = 'processing',          // Se está ejecutando
  EXECUTED = 'executed',              // Ya ejecutada
  CANCELLED = 'cancelled'             // Cancelada (jugador murió antes)
}

interface PlayerAction {
  id: string;
  gameId: string;
  night: number;
  
  // Jugador que realiza la acción
  playerId: string;
  playerName: string;
  role: string;
  
  // Target(s)
  targetId: string | null;
  target2Id: string | null;  // Para Transporter
  
  // Estado
  status: ActionStatus;
  
  // Timestamps
  stagedAt: Date | null;      // Cuándo eligió
  confirmedAt: Date | null;   // Cuándo confirmó
  lockedAt: Date | null;      // Cuándo se bloqueó (fin de noche)
  executedAt: Date | null;    // Cuándo se ejecutó
  
  // Historial de cambios
  changeHistory: ActionChange[];
  
  // Metadata
  canChange: boolean;         // ¿Puede cambiar aún?
  needsConfirmation: boolean; // ¿Requiere confirmación explícita?
}

interface ActionChange {
  timestamp: Date;
  previousTarget: string | null;
  newTarget: string | null;
  reason: string;  // "user_changed" | "target_died" | "target_jailed"
}
```

---

## UI de Selección

### **Componente de Lista de Jugadores con Acciones**

```tsx
// components/game/NightActionPanel.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NightActionPanelProps {
  players: Player[];
  myRole: Role;
  currentAction: PlayerAction | null;
  onSelectTarget: (targetId: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function NightActionPanel({
  players,
  myRole,
  currentAction,
  onSelectTarget,
  onConfirm,
  onCancel
}: NightActionPanelProps) {
  const [stagedTarget, setStagedTarget] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Sincronizar con acción actual del servidor
  useEffect(() => {
    if (currentAction?.status === 'STAGED') {
      setStagedTarget(currentAction.targetId);
    }
  }, [currentAction]);
  
  const handlePlayerClick = async (targetId: string) => {
    // Validar si puede targetear este jugador
    const validation = validateTarget(targetId, myRole, players);
    if (!validation.valid) {
      showError(validation.reason);
      return;
    }
    
    // Stage la acción (enviar al servidor)
    setStagedTarget(targetId);
    await onSelectTarget(targetId);
    
    // Mostrar mensaje privado
    showPrivateMessage(getActionMessage(myRole, targetId));
  };
  
  const canTargetPlayer = (player: Player): boolean => {
    // Reglas según rol
    const config = myRole.abilityConfig;
    
    // ¿Está muerto?
    if (!player.alive && !config.canTargetDead) return false;
    
    // ¿Es él mismo?
    if (player.id === myPlayerId && !config.canTargetSelf) return false;
    
    // ¿Está en la cárcel?
    if (player.isJailed && !config.canTargetJailed) return false;
    
    // ¿Ya lo targeté anoche?
    if (config.canTargetSameConsecutive === false) {
      if (lastNightTarget === player.id) return false;
    }
    
    return true;
  };
  
  return (
    <div className="night-action-panel">
      {/* Header */}
      <div className="action-header">
        <h3>{myRole.nameEs}</h3>
        <p className="action-prompt">
          {getActionPrompt(myRole)}
        </p>
      </div>
      
      {/* Lista de jugadores */}
      <div className="player-list">
        {players.map(player => (
          <PlayerActionButton
            key={player.id}
            player={player}
            isTargeted={stagedTarget === player.id}
            canTarget={canTargetPlayer(player)}
            onClick={() => handlePlayerClick(player.id)}
          />
        ))}
      </div>
      
      {/* Botones de control */}
      <div className="action-controls">
        {stagedTarget && (
          <>
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={onConfirm}
              className="btn-confirm"
            >
              Confirmar
            </motion.button>
            
            <button
              onClick={() => {
                setStagedTarget(null);
                onCancel();
              }}
              className="btn-cancel"
            >
              Cancelar
            </button>
          </>
        )}
      </div>
      
      {/* Timer de noche */}
      <NightTimer 
        onTimeEnd={() => {
          // Auto-confirmar al terminar el tiempo
          if (stagedTarget) {
            onConfirm();
          }
        }}
      />
    </div>
  );
}
```

### **Botón de Jugador con Estados**

```tsx
// components/game/PlayerActionButton.tsx
interface PlayerActionButtonProps {
  player: Player;
  isTargeted: boolean;
  canTarget: boolean;
  onClick: () => void;
}

function PlayerActionButton({ 
  player, 
  isTargeted, 
  canTarget, 
  onClick 
}: PlayerActionButtonProps) {
  return (
    <motion.button
      className={cn(
        'player-action-btn',
        isTargeted && 'targeted',
        !canTarget && 'disabled',
        !player.alive && 'dead'
      )}
      onClick={onClick}
      disabled={!canTarget}
      whileHover={canTarget ? { scale: 1.02 } : {}}
      whileTap={canTarget ? { scale: 0.98 } : {}}
    >
      {/* Avatar */}
      <div className="player-avatar">
        <img src={player.avatar} alt={player.name} />
        {!player.alive && <div className="death-overlay">💀</div>}
      </div>
      
      {/* Nombre */}
      <div className="player-name">
        {player.name}
        {player.isJailed && <span className="jail-icon">⛓️</span>}
      </div>
      
      {/* Indicador de target */}
      <AnimatePresence>
        {isTargeted && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="target-indicator"
          >
            🎯
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Tooltip */}
      {!canTarget && (
        <div className="tooltip">
          {getDisabledReason(player)}
        </div>
      )}
    </motion.button>
  );
}

function getDisabledReason(player: Player): string {
  if (!player.alive) return "Este jugador está muerto";
  if (player.isJailed) return "Este jugador está en la cárcel";
  if (player.isMe) return "No puedes targetarte a ti mismo";
  if (player.wasLastTarget) return "No puedes targetear al mismo jugador dos noches seguidas";
  return "No puedes targetear a este jugador";
}
```

---

## Sistema de Staging

### **Backend - Gestión de Acciones Staged**

```typescript
// backend/src/services/ActionStagingService.ts

class ActionStagingService {
  /**
   * Stage una acción (usuario eligió target)
   */
  async stageAction(
    playerId: string,
    targetId: string,
    night: number,
    gameId: string
  ): Promise<PlayerAction> {
    // 1. Verificar si ya tiene una acción staged esta noche
    const existingAction = await prisma.playerAction.findFirst({
      where: {
        playerId,
        night,
        gameId,
        status: { in: ['NOT_SELECTED', 'STAGED'] }
      }
    });
    
    // 2. Si existe, actualizar (cambio de target)
    if (existingAction) {
      // Guardar cambio en historial
      const changeHistory = (existingAction.changeHistory as ActionChange[]) || [];
      changeHistory.push({
        timestamp: new Date(),
        previousTarget: existingAction.targetId,
        newTarget: targetId,
        reason: 'user_changed'
      });
      
      // Actualizar
      const updated = await prisma.playerAction.update({
        where: { id: existingAction.id },
        data: {
          targetId,
          status: 'STAGED',
          stagedAt: new Date(),
          changeHistory
        }
      });
      
      // Notificar al usuario
      await this.sendPrivateMessage(playerId, {
        type: 'ACTION_CHANGED',
        message: this.getChangeMessage(existingAction, updated)
      });
      
      return updated;
    }
    
    // 3. Si no existe, crear nueva
    const action = await prisma.playerAction.create({
      data: {
        gameId,
        playerId,
        night,
        targetId,
        status: 'STAGED',
        stagedAt: new Date(),
        canChange: true,
        needsConfirmation: false,  // Opcional
        changeHistory: []
      }
    });
    
    // Notificar al usuario
    await this.sendPrivateMessage(playerId, {
      type: 'ACTION_STAGED',
      message: this.getStageMessage(action)
    });
    
    // Broadcast a otros jugadores (solo que "está preparando acción")
    await this.notifyOthers(gameId, playerId, 'preparing_action');
    
    return action;
  }
  
  /**
   * Confirmar acción (opcional, dependiendo del rol)
   */
  async confirmAction(actionId: string): Promise<PlayerAction> {
    const action = await prisma.playerAction.update({
      where: { id: actionId },
      data: {
        status: 'CONFIRMED',
        confirmedAt: new Date(),
        canChange: false  // Ya no puede cambiar
      }
    });
    
    await this.sendPrivateMessage(action.playerId, {
      type: 'ACTION_CONFIRMED',
      message: '✅ Tu acción ha sido confirmada.'
    });
    
    return action;
  }
  
  /**
   * Cancelar acción staged
   */
  async cancelAction(actionId: string): Promise<void> {
    await prisma.playerAction.update({
      where: { id: actionId },
      data: {
        targetId: null,
        status: 'NOT_SELECTED',
        stagedAt: null
      }
    });
    
    const action = await prisma.playerAction.findUnique({
      where: { id: actionId }
    });
    
    await this.sendPrivateMessage(action.playerId, {
      type: 'ACTION_CANCELLED',
      message: 'Has cancelado tu acción.'
    });
  }
  
  /**
   * Bloquear todas las acciones al terminar la noche
   */
  async lockAllActions(gameId: string, night: number): Promise<void> {
    // Obtener todas las acciones staged/confirmed
    const actions = await prisma.playerAction.findMany({
      where: {
        gameId,
        night,
        status: { in: ['STAGED', 'CONFIRMED'] }
      }
    });
    
    // Bloquear todas
    await prisma.playerAction.updateMany({
      where: {
        gameId,
        night,
        status: { in: ['STAGED', 'CONFIRMED'] }
      },
      data: {
        status: 'LOCKED',
        lockedAt: new Date(),
        canChange: false
      }
    });
    
    // Notificar a usuarios
    for (const action of actions) {
      await this.sendPrivateMessage(action.playerId, {
        type: 'ACTION_LOCKED',
        message: '🔒 La noche ha terminado. Tu acción se ejecutará ahora.'
      });
    }
  }
  
  /**
   * Generar mensajes según rol y acción
   */
  private getStageMessage(action: PlayerAction): string {
    const role = getRoleData(action.role);
    const target = getPlayerName(action.targetId);
    
    const messages = {
      'Sheriff': `Has decidido interrogar a ${target}.`,
      'Doctor': `Has decidido curar a ${target}.`,
      'Vigilante': `Has decidido disparar a ${target}.`,
      'Serial Killer': `Has decidido asesinar a ${target}.`,
      'Godfather': `Has ordenado asesinar a ${target}.`,
      'Arsonist': `Has decidido rociar gasolina a ${target}.`,
      'Jailor': `Has decidido encarcelar a ${target}.`,
      'Escort': `Has decidido bloquear a ${target}.`,
      'Transporter': `Has decidido transportar a ${target} con ${action.target2Name}.`,
    };
    
    return messages[role.nameEn] || `Has seleccionado a ${target}.`;
  }
  
  private getChangeMessage(
    oldAction: PlayerAction, 
    newAction: PlayerAction
  ): string {
    const oldTarget = getPlayerName(oldAction.targetId);
    const newTarget = getPlayerName(newAction.targetId);
    const role = getRoleData(newAction.role);
    
    const messages = {
      'Sheriff': `Has cambiado tu decisión. Ahora interrogarás a ${newTarget} en lugar de ${oldTarget}.`,
      'Doctor': `Has cambiado tu decisión. Ahora curarás a ${newTarget} en lugar de ${oldTarget}.`,
      'Vigilante': `Has cambiado tu decisión. Ahora dispararás a ${newTarget} en lugar de ${oldTarget}.`,
      'Serial Killer': `Has cambiado de target. Ahora asesinarás a ${newTarget}.`,
    };
    
    return messages[role.nameEn] || 
           `Has decidido no targetear a ${oldTarget}. Ahora targetearás a ${newTarget}.`;
  }
  
  private async sendPrivateMessage(
    playerId: string, 
    message: { type: string; message: string }
  ): Promise<void> {
    // Enviar via Socket.io a la room del jugador
    const playerRoom = `player:${playerId}`;
    io.to(playerRoom).emit('private_message', {
      type: message.type,
      content: message.message,
      timestamp: new Date(),
      style: 'system'  // Estilo especial para mensajes del sistema
    });
    
    // Guardar en BD (opcional, para historial)
    await prisma.privateMessage.create({
      data: {
        playerId,
        type: message.type,
        content: message.message,
        timestamp: new Date()
      }
    });
  }
}
```

---

## Confirmación y Cambios

### **Validación de Cambios**

```typescript
// backend/src/services/ActionValidator.ts

class ActionValidator {
  /**
   * Validar si el jugador puede cambiar su acción
   */
  async canChangeAction(action: PlayerAction): Promise<ValidationResult> {
    // 1. Verificar estado
    if (action.status === 'LOCKED') {
      return {
        valid: false,
        reason: 'La noche ha terminado. No puedes cambiar tu acción.'
      };
    }
    
    if (action.status === 'CONFIRMED' && !action.canChange) {
      return {
        valid: false,
        reason: 'Ya confirmaste tu acción. No puedes cambiarla.'
      };
    }
    
    // 2. Verificar si el jugador sigue vivo
    const player = await getPlayer(action.playerId);
    if (!player.alive) {
      return {
        valid: false,
        reason: 'Estás muerto. No puedes realizar acciones.'
      };
    }
    
    // 3. Verificar si está jailed (Jailor bloquea acciones)
    if (player.isJailed) {
      return {
        valid: false,
        reason: 'Estás en la cárcel. No puedes usar tu habilidad.'
      };
    }
    
    // 4. Verificar límite de usos
    const role = getRoleData(player.role);
    const config = role.abilityConfig;
    
    if (config.usesPerGame) {
      const usesLeft = await getUsesLeft(player.id, role.nameEn);
      if (usesLeft <= 0) {
        return {
          valid: false,
          reason: `No te quedan usos de tu habilidad.`
        };
      }
    }
    
    return { valid: true };
  }
  
  /**
   * Validar si puede targetear a un jugador específico
   */
  async canTargetPlayer(
    playerId: string,
    targetId: string,
    role: Role
  ): Promise<ValidationResult> {
    const target = await getPlayer(targetId);
    const config = role.abilityConfig;
    
    // 1. ¿Target está muerto?
    if (!target.alive && !config.canTargetDead) {
      return {
        valid: false,
        reason: 'No puedes targetear a jugadores muertos.'
      };
    }
    
    // 2. ¿Es él mismo?
    if (targetId === playerId && !config.canTargetSelf) {
      // Excepción: Doctor puede curarse 1 vez
      if (role.nameEn === 'Doctor') {
        const selfHealUsed = await hasSelfHealUsed(playerId);
        if (selfHealUsed) {
          return {
            valid: false,
            reason: 'Ya usaste tu auto-curación.'
          };
        }
      } else {
        return {
          valid: false,
          reason: 'No puedes targetarte a ti mismo.'
        };
      }
    }
    
    // 3. ¿Es el mismo que anoche?
    if (config.canTargetSameConsecutive === false) {
      const lastTarget = await getLastNightTarget(playerId);
      if (lastTarget === targetId) {
        return {
          valid: false,
          reason: 'No puedes targetear al mismo jugador dos noches seguidas.'
        };
      }
    }
    
    // 4. ¿Está en la cárcel?
    if (target.isJailed && !config.canTargetJailed) {
      return {
        valid: false,
        reason: 'No puedes targetear a alguien en la cárcel.'
      };
    }
    
    return { valid: true };
  }
}
```

---

## Implementación Completa

### **Socket.io Events**

```typescript
// backend/src/sockets/nightActions.ts

io.on('connection', (socket) => {
  
  // Cliente: Usuario eligió un target
  socket.on('stage_action', async (data: {
    playerId: string;
    targetId: string;
    target2Id?: string;  // Para Transporter
    gameId: string;
    night: number;
  }) => {
    try {
      // Validar
      const validation = await actionValidator.canTargetPlayer(
        data.playerId,
        data.targetId,
        playerRole
      );
      
      if (!validation.valid) {
        socket.emit('action_error', {
          message: validation.reason
        });
        return;
      }
      
      // Stage la acción
      const action = await actionStagingService.stageAction(
        data.playerId,
        data.targetId,
        data.night,
        data.gameId
      );
      
      // Responder al cliente
      socket.emit('action_staged', {
        action,
        message: 'Tu acción ha sido preparada.'
      });
      
      // Actualizar UI de otros jugadores (sin revelar details)
      socket.to(`game:${data.gameId}`).emit('player_action_status', {
        playerId: data.playerId,
        hasAction: true,
        confirmed: false
      });
      
    } catch (error) {
      socket.emit('action_error', {
        message: 'Error al preparar tu acción.'
      });
    }
  });
  
  // Cliente: Usuario confirmó su acción
  socket.on('confirm_action', async (data: {
    actionId: string;
  }) => {
    const action = await actionStagingService.confirmAction(data.actionId);
    
    socket.emit('action_confirmed', {
      action,
      message: '✅ Acción confirmada.'
    });
  });
  
  // Cliente: Usuario canceló su acción
  socket.on('cancel_action', async (data: {
    actionId: string;
  }) => {
    await actionStagingService.cancelAction(data.actionId);
    
    socket.emit('action_cancelled', {
      message: 'Has cancelado tu acción.'
    });
  });
  
  // Server: Noche terminó, bloquear todas las acciones
  socket.on('night_end', async (data: {
    gameId: string;
    night: number;
  }) => {
    // Bloquear todas las acciones staged
    await actionStagingService.lockAllActions(data.gameId, data.night);
    
    // Notificar a todos
    io.to(`game:${data.gameId}`).emit('night_ending', {
      message: 'La noche está terminando...'
    });
    
    // Esperar 3 segundos (transición)
    await sleep(3000);
    
    // Ejecutar todas las acciones
    await nightResolver.resolveNightActions(data.gameId, data.night);
    
    // Notificar resultados
    io.to(`game:${data.gameId}`).emit('night_results', {
      deaths: [...],
      results: [...]
    });
  });
});
```

### **Frontend - Zustand Store**

```typescript
// stores/nightActionStore.ts
import create from 'zustand';

interface NightActionState {
  currentAction: PlayerAction | null;
  stagedTarget: string | null;
  canChange: boolean;
  
  // Actions
  stageAction: (targetId: string) => Promise<void>;
  confirmAction: () => Promise<void>;
  cancelAction: () => Promise<void>;
  
  // Listeners
  onActionStaged: (action: PlayerAction) => void;
  onActionConfirmed: () => void;
  onActionLocked: () => void;
}

export const useNightActionStore = create<NightActionState>((set, get) => ({
  currentAction: null,
  stagedTarget: null,
  canChange: true,
  
  stageAction: async (targetId: string) => {
    const { currentAction } = get();
    
    // Emitir evento via Socket.io
    socket.emit('stage_action', {
      playerId: myPlayerId,
      targetId,
      gameId: currentGameId,
      night: currentNight
    });
    
    // Actualizar estado local (optimista)
    set({ stagedTarget: targetId });
  },
  
  confirmAction: async () => {
    const { currentAction } = get();
    
    if (!currentAction) return;
    
    socket.emit('confirm_action', {
      actionId: currentAction.id
    });
  },
  
  cancelAction: async () => {
    const { currentAction } = get();
    
    if (!currentAction) return;
    
    socket.emit('cancel_action', {
      actionId: currentAction.id
    });
    
    set({ 
      stagedTarget: null,
      currentAction: null
    });
  },
  
  onActionStaged: (action: PlayerAction) => {
    set({ 
      currentAction: action,
      stagedTarget: action.targetId,
      canChange: action.canChange
    });
    
    // Mostrar mensaje privado
    showPrivateMessage(action.message);
  },
  
  onActionConfirmed: () => {
    set({ canChange: false });
    showPrivateMessage('✅ Tu acción ha sido confirmada.');
  },
  
  onActionLocked: () => {
    set({ canChange: false });
    showPrivateMessage('🔒 La noche ha terminado.');
  }
}));

// Listeners Socket.io
socket.on('action_staged', (data) => {
  useNightActionStore.getState().onActionStaged(data.action);
});

socket.on('action_confirmed', () => {
  useNightActionStore.getState().onActionConfirmed();
});

socket.on('night_ending', () => {
  useNightActionStore.getState().onActionLocked();
});
```

---

## Casos Especiales

### **1. Transporter (2 targets)**

```tsx
function TransporterActionPanel() {
  const [target1, setTarget1] = useState<string | null>(null);
  const [target2, setTarget2] = useState<string | null>(null);
  
  const handleSelectTarget1 = (id: string) => {
    setTarget1(id);
    if (target2) {
      // Si ya tiene 2, hacer stage
      stageAction(id, target2);
    }
  };
  
  const handleSelectTarget2 = (id: string) => {
    if (id === target1) {
      showError('No puedes transportar a alguien consigo mismo');
      return;
    }
    
    setTarget2(id);
    if (target1) {
      stageAction(target1, id);
    }
  };
  
  return (
    <div>
      <p>Elige 2 jugadores para transportar:</p>
      <PlayerList 
        onSelect={!target1 ? handleSelectTarget1 : handleSelectTarget2}
        disabledIds={target1 ? [target1] : []}
      />
      
      {target1 && target2 && (
        <div className="transport-preview">
          {getPlayerName(target1)} ↔️ {getPlayerName(target2)}
        </div>
      )}
    </div>
  );
}
```

### **2. Arsonist (Douse vs Ignite)**

```tsx
function ArsonistActionPanel() {
  const [mode, setMode] = useState<'douse' | 'ignite'>('douse');
  const [dousedPlayers, setDousedPlayers] = useState<string[]>([]);
  
  return (
    <div>
      {/* Selector de modo */}
      <div className="mode-selector">
        <button 
          onClick={() => setMode('douse')}
          className={mode === 'douse' ? 'active' : ''}
        >
          🪔 Rociar Gasolina
        </button>
        <button 
          onClick={() => setMode('ignite')}
          className={mode === 'ignite' ? 'active' : ''}
        >
          🔥 Quemar a Todos ({dousedPlayers.length} rociados)
        </button>
      </div>
      
      {mode === 'douse' ? (
        <PlayerList 
          onSelect={(id) => stageAction(id, 'douse')}
          highlightIds={dousedPlayers}  // Mostrar quiénes ya están rociados
        />
      ) : (
        <div className="ignite-confirmation">
          <p>⚠️ ¿Seguro que quieres quemar a todos?</p>
          <p>Esto matará a: {dousedPlayers.map(getPlayerName).join(', ')}</p>
          <button onClick={() => stageAction(null, 'ignite')}>
            🔥 Confirmar Ignite
          </button>
        </div>
      )}
    </div>
  );
}
```

### **3. Serial Killer (Modos Normal/Cautious)**

```tsx
function SerialKillerActionPanel() {
  const [mode, setMode] = useState<'normal' | 'cautious'>('normal');
  
  return (
    <div>
      {/* Selector de modo */}
      <div className="mode-toggle">
        <label>
          <input 
            type="radio" 
            checked={mode === 'normal'}
            onChange={() => setMode('normal')}
          />
          Modo Normal (matas a roleblockers)
        </label>
        <label>
          <input 
            type="radio" 
            checked={mode === 'cautious'}
            onChange={() => setMode('cautious')}
          />
          Modo Cauteloso (no matas roleblockers, pierdes inmunidad)
        </label>
      </div>
      
      <PlayerList 
        onSelect={(id) => stageAction(id, mode)}
      />
    </div>
  );
}
```

---

## Mensajes Privados del Sistema

### **Tipos de Mensajes**

```typescript
const PRIVATE_MESSAGES = {
  // Staging
  ACTION_STAGED: {
    Sheriff: "Has decidido interrogar a {target}.",
    Doctor: "Has decidido curar a {target}.",
    Vigilante: "Has decidido disparar a {target}. Te quedan {bullets} balas.",
    'Serial Killer': "Has decidido asesinar a {target}.",
    Arsonist_Douse: "Has decidido rociar gasolina a {target}.",
    Arsonist_Ignite: "Has decidido quemar a todos los rociados ({count} jugadores).",
  },
  
  // Cambios
  ACTION_CHANGED: {
    Sheriff: "Has cambiado de opinión. Ahora interrogarás a {newTarget} en lugar de {oldTarget}.",
    Doctor: "Has decidido no curar a {oldTarget}. Ahora curarás a {newTarget}.",
    Vigilante: "Has cambiado tu target. Dispararás a {newTarget} en lugar de {oldTarget}.",
  },
  
  // Cancelación
  ACTION_CANCELLED: "Has cancelado tu acción. No targetearás a nadie esta noche.",
  
  // Confirmación
  ACTION_CONFIRMED: "✅ Tu acción ha sido confirmada. No puedes cambiarla.",
  
  // Lock
  ACTION_LOCKED: "🔒 La noche ha terminado. Tu acción se ejecutará ahora.",
  
  // Errores
  CANNOT_TARGET_SELF: "No puedes targetarte a ti mismo.",
  CANNOT_TARGET_DEAD: "No puedes targetear a jugadores muertos.",
  CANNOT_TARGET_JAILED: "No puedes targetear a alguien en la cárcel.",
  CANNOT_TARGET_CONSECUTIVE: "No puedes targetear al mismo jugador dos noches seguidas.",
  NO_USES_LEFT: "No te quedan usos de tu habilidad.",
  NIGHT_ENDED: "La noche ya terminó. No puedes cambiar tu acción.",
};
```

---

## Checklist de Implementación

### **Backend**
- [ ] Tabla PlayerAction con status STAGED
- [ ] ActionStagingService (stage, confirm, cancel, lock)
- [ ] ActionValidator (validaciones)
- [ ] Socket.io events (stage_action, confirm_action, etc)
- [ ] Sistema de mensajes privados
- [ ] Historial de cambios

### **Frontend**
- [ ] NightActionPanel component
- [ ] PlayerActionButton con estados
- [ ] Zustand store para acciones
- [ ] Socket.io listeners
- [ ] Mensajes privados en UI
- [ ] Indicadores visuales (target seleccionado)
- [ ] Confirmación opcional
- [ ] Timer de noche

### **Casos Especiales**
- [ ] Transporter (2 targets)
- [ ] Arsonist (douse vs ignite)
- [ ] Serial Killer (modos)
- [ ] Jailor (jail + ejecución separadas)
- [ ] Witch (2 targets: controlled + new target)

---

**Última actualización**: Febrero 2026  
**Sistema completo**: ✅ Staging + Cambios + Confirmación