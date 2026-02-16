# Mecánicas Detalladas: Godfather y Mafioso

## 📋 Información Proporcionada por Usuario

El usuario compartió las mecánicas específicas del **Mafioso** y **Godfather** para asegurar que la implementación sea correcta.

---

## 👔 Godfather (Padrino)

### Rol Base
- **Facción**: Mafia
- **Alignment**: Mafia Killing
- **Attack**: 1 (Basic)
- **Defense**: 1 (Basic)

### Habilidades

**Habilidad Principal:**
- Ordena kills a la Mafia cada noche
- **El Godfather NO mata directamente** - delega al Mafioso
- Si no hay Mafioso vivo, el Godfather realiza el kill personalmente

**Inmunidades:**
- **Detection Immune**: Sheriff lo ve "Not Suspicious"
- **Basic Defense**: Sobrevive ataques Basic
- **Promoción**: Si Godfather muere, el Mafioso se convierte en Godfather

### Prioridad de Acción
- **Priority en kills**: El Godfather decide el target, pero el Mafioso lo ejecuta
- Si es roleblocked → Mafia kill falla (solo si él ejecuta)

### Mecánica de Orden
```
Noche 1-X:
1. Godfather selecciona target de kill
2. Mafioso ejecuta la orden
3. Si Mafioso está roleblocked/jailed → kill falla
4. Si NO hay Mafioso → Godfather mata personalmente

Chat Mafia:
- Godfather puede coordinar con otros Mafia
- Otros roles Mafia pueden sugerir pero Godfather decide
```

### Win Condition
- Mafia debe alcanzar paridad numérica con Town
- Eliminar Neutral Killing roles
- Sobrevivir hasta dominar

---

## 🔪 Mafioso

### Rol Base
- **Facción**: Mafia
- **Alignment**: Mafia Killing
- **Attack**: 1 (Basic)
- **Defense**: 0 (None)

### Habilidades

**Habilidad Principal:**
- **Ejecuta las órdenes del Godfather**
- NO elige su propio target
- El target lo decide el Godfather
- **NO puede rechazar órdenes**

**Promoción Automática:**
- Si el Godfather muere (cualquier causa)
- **Mafioso se convierte en Godfather** automáticamente
- Hereda: Detection Immunity + Basic Defense
- Ahora elige los targets él mismo

### Roleblock Behavior
```
Si Mafioso es roleblocked:
- Mafia kill FALLA esa noche
- Godfather NO mata por defecto (a menos que sea el único)
- Mafioso recibe mensaje: "Fuiste roleblocked"

Si Godfather es roleblocked (y selecciona target pero tiene Mafioso):
- Mafioso ejecuta normalmente
- Kill procede (Godfather solo ordena, no ejecuta)
```

### Mecánica de Ejecución
```
Noche 1:
1. Godfather elige target (en chat Mafia o acción)
2. Backend asigna kill action al Mafioso (sourceId = Mafioso)
3. Mafioso visita y mata al target
4. Mafioso aparece en investigaciones (Lookout, Tracker, Spy)

Godfather NO aparece en investigaciones (Detection Immune)
```

### Promoción Detallada
```javascript
// Cuando Godfather muere:
if (deadPlayer.role.slug === 'godfather') {
  const mafioso = livingPlayers.find(p => p.role.slug === 'mafioso');
  
  if (mafioso) {
    // Promover Mafioso a Godfather
    mafioso.roleId = godfatherRoleId;
    mafioso.role = godfatherRole;
    
    // Notificar
    sendMessage(mafioso.id, {
      text: '¡Te has convertido en el nuevo Godfather!',
      type: 'promotion'
    });
    
    // Broadcast a Mafia chat
    sendMafiaChat({
      text: `${mafioso.name} es ahora el Godfather.`,
      type: 'promotion_broadcast'
    });
  }
}
```

### Win Condition
- Igual que Godfather (Mafia domination)
- Si promovido, continúa como Godfather

---

## 🔄 Interacción entre Godfather y Mafioso

### Escenario 1: Ambos vivos
```
Godfather selecciona target → Mafioso ejecuta → Target muere (si no protegido)
```

### Escenario 2: Godfather muere
```
Mafioso promovido → Ahora Mafioso ES el Godfather → Elige y ejecuta
```

### Escenario 3: Mafioso muere primero
```
Godfather ahora mata personalmente → Godfather visita targets → Pierde Detection Immunity en acciones (Lookout lo ve)
```

### Escenario 4: Solo Godfather, sin Mafioso desde inicio
```
Godfather mata personalmente desde N1 → Actúa como Mafioso + Godfather
```

---

## 🎭 Diferencias Clave con Implementación Actual

### ✅ Implementado Correctamente
- Godfather tiene Detection Immunity
- Mafioso ejecuta kills
- Promoción de Mafioso → Godfather existe

### ⚠️ Por Verificar en gameEngine.js

**1. Orden de Kill - ¿Está implementado?**
```javascript
// ¿El backend asigna el kill al Mafioso o al Godfather?
// Debería ser:
if (godfather && mafioso) {
  mafiaNightAction.sourceId = mafioso.id; // Mafioso ejecuta
  mafiaNightAction.targetId = godfatherSelectedTarget;
} else if (godfather && !mafioso) {
  mafiaNightAction.sourceId = godfather.id; // GF ejecuta
}
```

**2. Roleblock Handling**
```javascript
// Si Mafioso roleblocked:
if (mafiosoAction.isRoleblocked) {
  // Kill falla
  mafiaKillFails = true;
}

// Si Godfather roleblocked pero Mafioso ejecuta:
if (godfatherAction.isRoleblocked && mafioso) {
  // Kill procede (Mafioso ejecuta)
  mafiaKillProceeds = true;
}
```

**3. Promoción en Death Event**
```javascript
// En revealNightDeaths() o processLynch()
if (deadPlayer.role.slug === 'godfather') {
  promoteMafiosoToGodfather(game);
}
```

---

## 📝 Notas de Implementación

### Priority de Backend

**Mafia Kill Action debe tener:**
- `type: 'KILL_SINGLE'`
- `sourceId`: Mafioso (si existe) o Godfather (si no)
- `targetId`: Elegido por Godfather
- `priority: 6` (estándar killing priority)

### Frontend - Selección de Target

**Si eres Godfather:**
```
UI muestra: "Selecciona el target para el kill de la Mafia"
Tooltip: "Tu Mafioso ejecutará esta orden"
```

**Si eres Mafioso:**
```
UI NO muestra selector
Mensaje: "Esperando órdenes del Godfather"
O alternativa: "Ejecutarás la orden cuando el Godfather decida"
```

**Si solo hay Godfather:**
```
UI muestra: "Selecciona tu target"
Tooltip: "Matarás personalmente esta noche"
```

### Chat Mafia

**Coordinación:**
- Otros Mafia pueden sugerir targets
- Godfather tiene decisión final
- "¿Matamos al Jailor o al Sheriff?"

---

## 🎯 Testing Checklist

Para verificar que Godfather/Mafioso funcionan correctamente:

- [ ] **Test 1**: Godfather + Mafioso → Mafioso ejecuta kill
  - Lookout ve al Mafioso (NO al Godfather)
  - Tracker rastrear Mafioso → ve visiting target
  - Sheriff checks Godfather → "Not Suspicious"
  
- [ ] **Test 2**: Godfather roleblocked, Mafioso vivo
  - Kill procede (Mafioso ejecuta)
  - Godfather recibe mensaje roleblock pero kill no falla
  
- [ ] **Test 3**: Mafioso roleblocked, Godfather vivo
  - Kill FALLA
  - Mafioso recibe mensaje roleblock
  - Target sobrevive
  
- [ ] **Test 4**: Godfather muere
  - Mafioso promovido automáticamente
  - Mafioso recibe mensaje "¡Te has convertido en Godfather!"
  - Próxima noche: Mafioso tiene Detection Immunity
  
- [ ] **Test 5**: Solo Godfather (sin Mafioso en setup)
  - Godfather mata personalmente
  - Lookout VE al Godfather (pierde stealth al visitar)
  
- [ ] **Test 6**: Mafia múltiple (Godfather + Mafioso + Consort)
  - Solo Mafioso ejecuta kill
  - Consort puede roleblock independiente
  - Godfather coordina pero no visita

---

## 🔧 Código Ejemplo (Pseudocódigo)

```javascript
// En handleMafiaNightPhase():

function processMafiaKill(game) {
  const mafia = game.players.filter(p => 
    p.isAlive && p.role.faction === 'MAFIA'
  );
  
  const godfather = mafia.find(p => p.role.slug === 'godfather');
  const mafioso = mafia.find(p => p.role.slug === 'mafioso');
  
  let killExecutor = null;
  let killTarget = null;
  
  // Determinar quién ejecuta
  if (godfather) {
    killTarget = godfather.selectedTarget; // GF elige
    
    if (mafioso && !mafioso.isJailed && !mafioso.isRoleblocked) {
      killExecutor = mafioso; // Mafioso ejecuta
    } else if (!mafioso) {
      killExecutor = godfather; // GF ejecuta si no hay Mafioso
    } else {
      // Mafioso bloqueado → kill falla
      killExecutor = null;
    }
  } else if (mafioso) {
    // Mafioso promovido (ahora es GF de facto)
    killTarget = mafioso.selectedTarget;
    killExecutor = mafioso;
  }
  
  // Crear acción
  if (killExecutor && killTarget) {
    submitNightAction({
      type: 'KILL_SINGLE',
      sourceId: killExecutor.id,
      targetId: killTarget.id,
      priority: 6
    });
  }
}

// En processDeath():
function handleGodfatherDeath(game, godfatherId) {
  const mafioso = game.players.find(p => 
    p.isAlive && p.role.slug === 'mafioso'
  );
  
  if (mafioso) {
    const godfatherRole = await prisma.role.findUnique({
      where: { slug: 'godfather' }
    });
    
    await prisma.player.update({
      where: { id: mafioso.id },
      data: { roleId: godfatherRole.id }
    });
    
    // Notificar
    io.to(mafioso.socketId).emit('role_changed', {
      newRole: godfatherRole,
      message: '¡Te has convertido en el nuevo Godfather!'
    });
    
    // Broadcast a Mafia
    game.players
      .filter(p => p.role.faction === 'MAFIA' && p.isAlive)
      .forEach(mafiaPlayer => {
        io.to(mafiaPlayer.socketId).emit('mafia_chat', {
          message: `${mafioso.name} es ahora el Godfather.`,
          type: 'promotion'
        });
      });
  }
}
```

---

## 📊 Estado de Implementación

### ✅ Probablemente Implementado
- Godfather tiene nightActionType: KILL_SINGLE
- Mafioso tiene nightActionType: KILL_SINGLE
- Seed.js tiene especialInteractions para promoción

### ⚠️ Necesita Verificación
- ¿El backend asigna kill al Mafioso cuando hay GF?
- ¿Promoción automática funciona?
- ¿Roleblock handling diferencia GF vs Mafioso?
- ¿Detection Immunity del GF está en Sheriff checks?

### 🔍 Archivos a Revisar
1. `backend/src/gameEngine.js` - función de Mafia kill assignment
2. `backend/src/bots/botManager.js` - Mafia bot AI para coordinación
3. `backend/prisma/seed.js` - verificar specialInteractions promoción

---

**Última Actualización**: 2025-01-XX  
**Estado**: Documentado para referencia de implementación  
**Fuente**: Mecánicas proporcionadas por usuario
