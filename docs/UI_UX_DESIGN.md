# 🎨 UI/UX DESIGN - Guía de Diseño Visual

## 📋 Índice
- [Filosofía de Diseño](#filosofía-de-diseño)
- [Paleta de Colores](#paleta-de-colores)
- [Tipografía](#tipografía)
- [Componentes](#componentes)
- [Layouts Móvil](#layouts-móvil)
- [Layouts Desktop](#layouts-desktop)
- [Animaciones y Transiciones](#animaciones-y-transiciones)
- [Accesibilidad](#accesibilidad)
- [Estados y Feedback](#estados-y-feedback)

---

## Filosofía de Diseño

### Concepto Visual: "Medieval Gothic Town Square"

**Inspiración**: Town of Salem + Medieval taverns + Gothic atmosphere

**Principios clave**:
1. **Inmersión temática** - El usuario siente que está en un pueblo medieval
2. **Claridad funcional** - La estética no compromete la usabilidad
3. **Mobile-first** - Optimizado para jugar desde el móvil
4. **Anonimato visual** - Los jugadores son representados de forma neutra

### Tono Visual

```
🏰 Medieval        - Arquitectura de piedra, madera, hogueras
🌙 Gótico          - Paleta oscura, sombras dramáticas
🔥 Calidez         - Tonos naranjas de fuego y velas
⚔️ Sobrio          - Sin elementos infantiles o caricaturescos
```

---

## Paleta de Colores

### Colores Principales

```css
/* Fondos */
--bg-dark: #1a0f0a;          /* Negro marrón profundo */
--bg-medium: #2a1810;        /* Marrón oscuro */
--bg-panel: rgba(40, 20, 10, 0.95);  /* Panel translúcido */

/* Madera y Estructura */
--wood: #8b4513;             /* Madera media */
--wood-dark: #5c2e0d;        /* Madera oscura */
--wood-light: #a0522d;       /* Madera clara */

/* Acentos */
--text-light: #f5deb3;       /* Wheat - Texto principal */
--text-gold: #ffa500;        /* Dorado - Títulos e importante */
--glow: #ff6b35;             /* Naranja fuego - Énfasis */

/* Facciones */
--faction-town: #4169e1;     /* Azul royal */
--faction-mafia: #8b0000;    /* Rojo oscuro sangre */
--faction-neutral: #808080;  /* Gris neutro */

/* Estados */
--success: #4caf50;          /* Verde éxito */
--warning: #ffa726;          /* Naranja advertencia */
--danger: #f44336;           /* Rojo peligro */
--info: #29b6f6;             /* Azul información */
```

### Gradientes

```css
/* Fondo principal */
background: linear-gradient(180deg, #1a0f0a 0%, #2a1810 100%);

/* Paneles de madera */
background: linear-gradient(180deg, #5c2e0d 0%, #8b4513 100%);

/* Hoguera */
background: radial-gradient(circle, #ff6b35 0%, #ff4500 50%, #8b0000 100%);

/* Overlays nocturnos */
background: rgba(0, 0, 20, 0.8);
backdrop-filter: blur(4px);
```

### Uso de Colores por Contexto

| Elemento | Color | Uso |
|----------|-------|-----|
| Títulos principales | `--text-gold` | Headers, nombres de roles |
| Texto de lectura | `--text-light` | Chat, descripciones |
| Bordes y divisores | `--wood` | Separadores visuales |
| Botones primarios | `--wood` con borde `--text-gold` | Acciones principales |
| Botones secundarios | `--bg-panel` con borde `--wood` | Acciones secundarias |
| Jugadores vivos | `--success` | Indicadores de estado |
| Jugadores muertos | `#666` | Desaturado |
| Nominados/Peligro | `--glow` | Pulso de atención |

---

## Tipografía

### Familias de Fuentes

**Display / Títulos**:
```css
font-family: 'Cinzel', serif;
/* Uso: Títulos, nombres de roles, botones importantes */
/* Caracteres: A-Z elegante, serifas clásicas */
```

**Lectura / Cuerpo**:
```css
font-family: 'Crimson Text', serif;
/* Uso: Chat, descripciones, texto largo */
/* Caracteres: Legible, serif tradicional */
```

### Escala Tipográfica

```css
/* Móvil */
--text-xs: 10px;    /* Timestamps, metadata */
--text-sm: 12px;    /* Labels secundarios */
--text-base: 14px;  /* Texto principal */
--text-lg: 16px;    /* Botones, destacados */
--text-xl: 18px;    /* Subtítulos */
--text-2xl: 20px;   /* Títulos sección */
--text-3xl: 24px;   /* Títulos principales */
--text-4xl: 32px;   /* Display especial */

/* Desktop - Aumentar ~20% */
--text-base-desktop: 16px;
--text-2xl-desktop: 24px;
--text-4xl-desktop: 40px;
```

### Jerarquía

```css
/* H1 - Logo principal */
.logo {
    font-family: 'Cinzel';
    font-size: 36px;
    font-weight: 900;
    color: var(--text-gold);
    text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.8);
}

/* H2 - Títulos de sección */
.section-title {
    font-family: 'Cinzel';
    font-size: 20px;
    font-weight: 700;
    color: var(--text-gold);
}

/* H3 - Subtítulos */
.subtitle {
    font-family: 'Cinzel';
    font-size: 16px;
    font-weight: 600;
    color: var(--text-light);
}

/* Body - Texto normal */
.body {
    font-family: 'Crimson Text';
    font-size: 14px;
    line-height: 1.6;
    color: var(--text-light);
}

/* Small - Metadata */
.small {
    font-size: 12px;
    color: #999;
}
```

---

## Componentes

### Botones

**Primario** (Acciones principales: Iniciar partida, Confirmar acción)
```css
.btn-primary {
    background: linear-gradient(180deg, #8b4513 0%, #5c2e0d 100%);
    border: 2px solid #ffa500;
    color: #ffa500;
    padding: 12px 24px;
    border-radius: 8px;
    font-family: 'Cinzel';
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(255, 165, 0, 0.3);
    transition: all 0.3s;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(255, 165, 0, 0.5);
}

.btn-primary:disabled {
    background: #666;
    border-color: #999;
    color: #999;
    cursor: not-allowed;
    opacity: 0.5;
}
```

**Secundario** (Acciones opcionales)
```css
.btn-secondary {
    background: rgba(40, 20, 10, 0.95);
    border: 2px solid #8b4513;
    color: #f5deb3;
    /* Resto igual a primary */
}
```

**Peligro** (Cancelar, Ejecutar)
```css
.btn-danger {
    background: rgba(139, 0, 0, 0.3);
    border: 2px solid #f44336;
    color: #f44;
}
```

### Tarjetas / Paneles

```css
.card {
    background: rgba(40, 20, 10, 0.95);
    border: 2px solid #8b4513;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
}

.card-header {
    border-bottom: 1px solid #8b4513;
    padding-bottom: 12px;
    margin-bottom: 12px;
}
```

### Avatares de Jugadores

```css
.player-avatar {
    background: rgba(40, 20, 10, 0.95);
    border: 2px solid #8b4513;
    border-radius: 12px;
    padding: 8px;
    text-align: center;
    transition: all 0.3s;
}

/* Estados */
.player-avatar.alive {
    border-color: #4caf50;
    box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
}

.player-avatar.dead {
    opacity: 0.5;
    filter: grayscale(100%);
    border-color: #666;
}

.player-avatar.nominated {
    border-color: #ff6b35;
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0%, 100% { 
        transform: scale(1); 
        box-shadow: 0 0 10px rgba(255, 107, 53, 0.5);
    }
    50% { 
        transform: scale(1.05); 
        box-shadow: 0 0 20px rgba(255, 107, 53, 1);
    }
}
```

### Inputs

```css
.input {
    background: rgba(0, 0, 0, 0.4);
    border: 2px solid #8b4513;
    border-radius: 8px;
    padding: 12px;
    color: #f5deb3;
    font-family: 'Crimson Text';
    font-size: 14px;
}

.input:focus {
    outline: none;
    border-color: #ffa500;
    box-shadow: 0 0 8px rgba(255, 165, 0, 0.3);
}
```

### Chat Bubbles

```css
.message {
    margin-bottom: 8px;
    font-size: 13px;
    line-height: 1.4;
}

.message-author {
    font-weight: 600;
    color: #ffa500;
}

.message-time {
    font-size: 10px;
    color: #999;
    margin-left: 4px;
}

/* Sistema */
.message.system {
    background: rgba(255, 165, 0, 0.1);
    padding: 6px 10px;
    border-left: 3px solid #ffa500;
    border-radius: 4px;
}
```

---

## Layouts Móvil

### Estructura General (390px ancho referencia)

```
┌─────────────────────────────┐
│   HEADER (56px)             │ ← Sticky
├─────────────────────────────┤
│                             │
│                             │
│   CONTENT                   │
│   (Scrollable)              │
│                             │
│                             │
│                             │
├─────────────────────────────┤
│   BOTTOM BAR (60px)         │ ← Sticky (opcional)
└─────────────────────────────┘
```

### Pantalla Principal de Juego

```
┌─────────────────────────────┐
│ 🏰 MAFIA    DÍA 2 ☀️  ⏱️4:23│
├─────────────────────────────┤
│        🔥 Hoguera           │
│                             │
│    👤  👤  👤               │
│                             │
│    👤  💀  👤     Plaza     │
│                             │
│    👤  👤  👤               │
│                             │
├─────────────────────────────┤
│ 8 Vivos | 2 Muertos | Día 2 │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ 🩺 DOCTOR               │ │
│ │ Town Protective         │ │
│ │ Habilidad: Cura...      │ │
│ │ [USAR HABILIDAD]        │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ 💬 CHAT ⏱️4:23          │ │
│ ├─────────────────────────┤ │
│ │ Player5: Mensaje...     │ │
│ │ Player7: Otro...        │ │
│ ├─────────────────────────┤ │
│ │ [Escribir...]  [ENVIAR] │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

### Grid de Jugadores

**3 columnas en móvil**:
```css
.players-circle {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
}
```

**4 columnas en tablet** (>600px):
```css
@media (min-width: 600px) {
    .players-circle {
        grid-template-columns: repeat(4, 1fr);
    }
}
```

### Pantalla de Lobby

```
┌─────────────────────────────┐
│   🏰 MAFIA GAME             │
│   Deducción social          │
├─────────────────────────────┤
│ [CREAR PARTIDA] [UNIRSE]    │ ← Tabs
├─────────────────────────────┤
│                             │
│   Código: ABC123            │
│   [QR Code]                 │
│   mafiagame.com/ABC123      │
│   [COPIAR]                  │
│                             │
├─────────────────────────────┤
│ 👥 Jugadores: 5/15          │
│                             │
│ 👑 Juan (Host) ✅           │
│ 👤 María ✅                 │
│ 👤 Carlos ✅                │
│ 👤 Ana ⏳                   │
│ 👤 Pedro ✅                 │
│                             │
├─────────────────────────────┤
│ ⚙️ Configuración            │
│ Día: 5:00 | Noche: 1:00     │
│ Roles: Clásica              │
│                             │
├─────────────────────────────┤
│ [⚙️ CONFIGURAR]             │
│ [▶️ INICIAR] (disabled)     │
│ [❌ CANCELAR]               │
└─────────────────────────────┘
```

### Modal de Acción Nocturna

```
┌─────────────────────────────┐
│ 🌙 ACCIÓN NOCTURNA          │
│ 🩺 Doctor - Elige curar     │
├─────────────────────────────┤
│                             │
│ ┌─────────────────────────┐ │
│ │ 👤 Jugador 1            │ │
│ │ Nunca curado            │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ 👤 Jugador 5            │ │
│ │ ⚠️ Curado anoche        │ │ ← Disabled
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │ ← Selected
│ │ 👤 Jugador 7 ⭐         │ │
│ │ Nunca curado            │ │
│ └─────────────────────────┘ │
│                             │
│ [CANCELAR] [CONFIRMAR]      │
└─────────────────────────────┘
```

---

## Layouts Desktop

### Vista Principal (1920x1080 referencia)

```
┌──────────────────────────────────────────────────────┐
│ 🏰 MAFIA GAME        DÍA 2 ☀️        ⏱️ 4:23       │
├────────────┬─────────────────────────┬───────────────┤
│            │                         │               │
│  JUGADORES │    TOWN SQUARE          │   TU PANEL    │
│            │                         │               │
│  👤 Pl 1   │       🔥                │ 🎭 DOCTOR     │
│  👤 Pl 2   │                         │ Town Protect  │
│  💀 Pl 3   │    👤  👤  👤          │               │
│  👤 Pl 5   │                         │ Habilidad:    │
│  👤 Pl 7   │    👤  💀  👤          │ Cura una vez  │
│  💀 Pl 8   │                         │ cada noche    │
│  👤 Pl 9   │    👤  👤  👤          │               │
│  👤 Pl 12  │                         │ [USAR ROL]    │
│  👤 TÚ     │                         │               │
│            │                         ├───────────────┤
│  8 Vivos   │                         │ CEMENTERIO    │
│  2 Muertos │                         │ 💀 Player3    │
│            │                         │    Sheriff    │
├────────────┴─────────────────────────┤ 💀 Player8    │
│ 💬 CHAT                              │    Citizen    │
├──────────────────────────────────────┴───────────────┤
│ Jugador5: Mensaje aquí...                            │
│ Jugador7: Otro mensaje...                            │
│ [Escribir mensaje...]                      [ENVIAR]  │
└──────────────────────────────────────────────────────┘
```

### Layout Desktop Responsive

```css
/* Desktop - 3 columnas */
@media (min-width: 1024px) {
    .game-layout {
        display: grid;
        grid-template-columns: 250px 1fr 350px;
        gap: 20px;
        height: calc(100vh - 80px);
    }
    
    .sidebar-left {
        /* Lista de jugadores */
    }
    
    .main-area {
        /* Plaza del pueblo + chat abajo */
        display: flex;
        flex-direction: column;
    }
    
    .sidebar-right {
        /* Panel de rol + cementerio */
    }
}

/* Tablet - 2 columnas */
@media (min-width: 768px) and (max-width: 1023px) {
    .game-layout {
        grid-template-columns: 1fr 300px;
    }
    
    .sidebar-left {
        display: none; /* Ocultar en tablet */
    }
}
```

---

## Animaciones y Transiciones

### Transiciones de Fase

**Día → Noche**:
```css
@keyframes fadeToNight {
    0% {
        background: linear-gradient(180deg, #1a0f0a 0%, #2a1810 100%);
        filter: brightness(1);
    }
    100% {
        background: linear-gradient(180deg, #000510 0%, #001020 100%);
        filter: brightness(0.4);
    }
}

.night-transition {
    animation: fadeToNight 2s ease-in-out;
}
```

**Noche → Día**:
```css
@keyframes fadeToDay {
    0% {
        background: linear-gradient(180deg, #000510 0%, #001020 100%);
        filter: brightness(0.4);
    }
    100% {
        background: linear-gradient(180deg, #1a0f0a 0%, #2a1810 100%);
        filter: brightness(1);
    }
}
```

### Micro-interacciones

**Hover en botones**:
```css
.btn {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 165, 0, 0.5);
}

.btn:active {
    transform: translateY(0);
}
```

**Parpadeo de hoguera**:
```css
@keyframes flicker {
    0%, 100% { 
        opacity: 1; 
        transform: scale(1); 
    }
    25% { 
        opacity: 0.8; 
        transform: scale(1.02); 
    }
    50% { 
        opacity: 0.9; 
        transform: scale(1.05); 
    }
    75% { 
        opacity: 0.85; 
        transform: scale(0.98); 
    }
}

.bonfire {
    animation: flicker 3s infinite;
}
```

**Aparición de mensajes**:
```css
@keyframes slideInMessage {
    from {
        opacity: 0;
        transform: translateX(-20px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.message {
    animation: slideInMessage 0.3s ease-out;
}
```

**Pulso de nominado**:
```css
@keyframes pulse {
    0%, 100% { 
        transform: scale(1);
        box-shadow: 0 0 10px rgba(255, 107, 53, 0.5);
    }
    50% { 
        transform: scale(1.05);
        box-shadow: 0 0 25px rgba(255, 107, 53, 1);
    }
}
```

### Loading States

```css
.loading-spinner {
    border: 3px solid rgba(139, 69, 19, 0.3);
    border-top: 3px solid #ffa500;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
```

---

## Accesibilidad

### Contraste de Colores

Todos los pares texto/fondo cumplen **WCAG 2.1 AA**:
- `#f5deb3` sobre `#1a0f0a` → Ratio: 8.5:1 ✅
- `#ffa500` sobre `#1a0f0a` → Ratio: 7.2:1 ✅
- `#f5deb3` sobre `#8b4513` → Ratio: 4.8:1 ✅

### Focus States

```css
/* Visible focus para teclado */
*:focus-visible {
    outline: 2px solid #ffa500;
    outline-offset: 2px;
}

button:focus-visible {
    box-shadow: 0 0 0 3px rgba(255, 165, 0, 0.5);
}
```

### Tamaños Táctiles

Todos los elementos interactivos ≥ 44x44px (recomendación WCAG):
```css
.btn {
    min-height: 44px;
    min-width: 44px;
}

.player-avatar {
    min-height: 80px; /* En móvil */
}
```

### Screen Readers

```html
<!-- Aria labels -->
<button aria-label="Usar habilidad de Doctor">
    🎯 USAR HABILIDAD
</button>

<!-- Live regions para cambios dinámicos -->
<div role="log" aria-live="polite" aria-atomic="true">
    <!-- Mensajes de chat aquí -->
</div>

<!-- Estados -->
<div aria-busy="true">Cargando...</div>
```

---

## Estados y Feedback

### Estados de Jugador

**Vivo**:
```css
.player.alive {
    border-color: #4caf50;
    opacity: 1;
    filter: none;
}
```

**Muerto**:
```css
.player.dead {
    border-color: #666;
    opacity: 0.5;
    filter: grayscale(100%);
}
```

**Nominado**:
```css
.player.nominated {
    border-color: #ff6b35;
    animation: pulse 1.5s infinite;
}
```

**Encarcelado** (Jailor):
```css
.player.jailed::after {
    content: '🔒';
    position: absolute;
    top: -8px;
    right: -8px;
    font-size: 20px;
}
```

**Bloqueado** (Roleblock):
```css
.player.roleblocked::after {
    content: '⛔';
}
```

**Protegido**:
```css
.player.protected::after {
    content: '🛡️';
}
```

### Notificaciones Toast

```css
.toast {
    position: fixed;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(40, 20, 10, 0.98);
    border: 2px solid #ffa500;
    border-radius: 12px;
    padding: 16px 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8);
    animation: slideDown 0.3s ease-out;
    z-index: 9999;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translate(-50%, -20px);
    }
    to {
        opacity: 1;
        transform: translate(-50%, 0);
    }
}

/* Tipos */
.toast.success { border-color: #4caf50; }
.toast.error { border-color: #f44336; }
.toast.warning { border-color: #ffa726; }
.toast.info { border-color: #29b6f6; }
```

### Feedback de Acciones

**Acción enviada**:
```css
.action-sent {
    position: relative;
}

.action-sent::after {
    content: '✅';
    position: absolute;
    top: 50%;
    right: 12px;
    transform: translateY(-50%);
    animation: fadeIn 0.3s;
}
```

**Timer urgente** (<30 segundos):
```css
.timer.urgent {
    color: #f44;
    animation: blink 1s infinite;
}

@keyframes blink {
    0%, 50%, 100% { opacity: 1; }
    25%, 75% { opacity: 0.5; }
}
```

---

## Assets y Recursos

### Iconos

Uso de emojis nativos para máxima compatibilidad:
- 🏰 Logo
- ☀️ Día
- 🌙 Noche
- 🔥 Hoguera
- 👤 Jugador genérico
- 💀 Muerto
- 🎭 Rol
- 💬 Chat
- ⚔️ Killing
- 🛡️ Protective
- 🔍 Investigative
- 💼 Support

### Ilustraciones Futuras

Para versiones avanzadas:
- Plaza del pueblo detallada (SVG)
- Edificios de fondo
- Texturas de madera
- Efectos de partículas (fuego, humo)
- Avatares personalizados

---

## Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 599px) {
    /* Mobile-first, estilos base */
}

/* Tablet */
@media (min-width: 600px) and (max-width: 1023px) {
    /* 2 columnas, grids más anchos */
}

/* Desktop */
@media (min-width: 1024px) {
    /* 3 columnas, layout completo */
}

/* Large Desktop */
@media (min-width: 1440px) {
    /* Máximo ancho, más espacio */
    .container {
        max-width: 1400px;
        margin: 0 auto;
    }
}
```

---

## Dark/Light Mode

**Nota**: El juego usa tema oscuro por defecto (medieval/nocturno).  
No se implementará light mode inicialmente, pero se mantiene flexibilidad con CSS variables.

---

## Performance

### Optimizaciones CSS

```css
/* Reducir repaint */
.player-avatar {
    will-change: transform, opacity;
    contain: layout style paint;
}

/* Hardware acceleration */
.modal {
    transform: translateZ(0);
    backface-visibility: hidden;
}
```

### Lazy Loading

```html
<!-- Imágenes diferidas -->
<img loading="lazy" src="avatar.png" alt="Player">

<!-- Componentes no críticos -->
<div data-lazy-component="graveyard"></div>
```

---

**Última actualización**: Febrero 2026  
**Versión**: 1.0  
**Herramientas de diseño**: Figma (wireframes), CSS Variables (theming)
