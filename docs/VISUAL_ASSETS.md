# 🎨 VISUAL ASSETS - Sistema de Imágenes y Arte

## 📋 Índice
- [Overview de Assets](#overview-de-assets)
- [Sistema de Generación de Imágenes](#sistema-de-generación-de-imágenes)
- [Assets por Categoría](#assets-por-categoría)
- [Especificaciones Técnicas](#especificaciones-técnicas)
- [Herramientas y APIs](#herramientas-y-apis)
- [Paleta y Estilo](#paleta-y-estilo)

---

## Overview de Assets

### **Total de Assets Necesarios: ~300 imágenes**

```
📊 Desglose:
├── Roles (53 roles × 4 estados) = 204 imágenes
├── Habilidades (51 iconos) = 51 imágenes
├── UI/Backgrounds = 20 imágenes
├── Efectos/Partículas = 15 imágenes
└── Misc (logotipos, badges) = 10 imágenes
```

---

## Sistema de Generación de Imágenes

### **Opción 1: IA Generativa (RECOMENDADO) 🤖**

#### **A. DALL-E 3 (OpenAI) - Mejor calidad**

**Costo**: $0.04 por imagen (1024x1024)  
**Estimado total**: ~$12-15 para 300 imágenes

```javascript
// Ejemplo de generación con DALL-E API
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function generateRoleImage(roleName, description) {
  const prompt = `
Medieval gothic character portrait for a Mafia/Town of Salem game.
Role: ${roleName}
Style: Dark fantasy, hand-painted, mysterious atmosphere
Character: ${description}
Art style: Digital painting, detailed, dramatic lighting
Setting: Medieval town square at night
Colors: Dark browns, golds, deep reds, shadows
Format: Character bust portrait, centered, looking at viewer
Mood: Serious, mysterious, slightly ominous
NO text, NO UI elements, NO modern clothing
  `;
  
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: prompt,
    n: 1,
    size: "1024x1024",
    quality: "standard", // o "hd" para mejor calidad ($0.08)
  });
  
  return response.data[0].url;
}

// Uso:
const sheriffImage = await generateRoleImage(
  "Sheriff",
  "Stern lawman with badge, cowboy hat, serious expression, mustache"
);
```

**Pros**:
- ✅ Calidad profesional
- ✅ Consistencia de estilo
- ✅ Rápido (30 segundos por imagen)
- ✅ No necesitas artista

**Contras**:
- ❌ Costo (~$15 total)
- ❌ Necesita API key

---

#### **B. Stable Diffusion XL (Gratis) 🆓**

**Plataformas**:
- **Hugging Face** (gratis, 512x512)
- **Replicate** (gratis con límites)
- **Stability AI** (trial gratuito)
- **Local** (RunPod/Colab)

```python
# Ejemplo con Hugging Face API (GRATIS)
import requests
import io
from PIL import Image

API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0"
headers = {"Authorization": f"Bearer {HUGGINGFACE_TOKEN}"}

def generate_image(prompt):
    payload = {
        "inputs": prompt,
        "parameters": {
            "negative_prompt": "text, watermark, signature, modern, blurry, low quality",
            "num_inference_steps": 50,
            "guidance_scale": 7.5,
        }
    }
    
    response = requests.post(API_URL, headers=headers, json=payload)
    image = Image.open(io.BytesIO(response.content))
    return image

# Uso:
prompt = """
medieval sheriff character portrait, dark fantasy style, 
detailed face, cowboy hat, badge, mustache, serious expression,
dramatic lighting, oil painting style, dark background,
high quality, professional art
"""

image = generate_image(prompt)
image.save("sheriff.png")
```

**Pros**:
- ✅ 100% GRATIS
- ✅ Open source
- ✅ Control total

**Contras**:
- ❌ Calidad variable
- ❌ Necesita más prompting
- ❌ Puede tardar más

---

#### **C. Midjourney (Mejor calidad artística)**

**Costo**: $10/mes (200 imágenes)

**Prompts optimizados**:
```
/imagine medieval sheriff character portrait, 
dark gothic atmosphere, oil painting style, 
dramatic lighting, mysterious, detailed face, 
badge and cowboy hat, stern expression, 
by Rembrandt and Greg Rutkowski, 
--ar 1:1 --stylize 750 --v 6
```

**Pros**:
- ✅ Calidad artística superior
- ✅ Estilo muy consistente
- ✅ Comunidad activa

**Contras**:
- ❌ $10/mes
- ❌ Necesita Discord
- ❌ No API directa

---

### **Opción 2: Assets Pre-hechos (Compra) 💰**

#### **Marketplaces**

**A. Itch.io**
- Packs de assets medievales
- $5-30 por pack
- Búsqueda: "medieval character portraits"

**B. ArtStation Marketplace**
- Arte profesional
- $10-50 por set
- Alta calidad

**C. Unity Asset Store**
- Character packs
- $20-100
- Incluye variaciones

**D. Creative Market**
- Ilustraciones custom
- $15-60 por pack

---

### **Opción 3: Comisionar Artista 🎨**

**Fiverr/Upwork**:
- $5-15 por ilustración simple
- $50-100 por set completo (53 roles)
- Buscar: "pixel art character", "game character portrait"

**Freelancer local**:
- Estudiante de arte
- $200-500 por proyecto completo
- Estilo único y consistente

---

## Assets por Categoría

### **1. ICONOS DE ROLES (51 imágenes)**

**Dimensiones**: 256x256px  
**Formato**: PNG con transparencia  
**Estilo**: Icono simplificado, reconocible

#### **Lista Completa de Iconos**

**TOWN INVESTIGATIVE (6)**
```javascript
const TOWN_INVESTIGATIVE_ICONS = [
  {
    role: "Sheriff",
    prompt: "sheriff badge icon, star shape, gold metal, medieval style, centered",
    color: "#FFD700",
    symbol: "⭐"
  },
  {
    role: "Investigator", 
    prompt: "magnifying glass icon, antique brass, detective tool, medieval",
    color: "#4A90E2",
    symbol: "🔍"
  },
  {
    role: "Lookout",
    prompt: "spyglass telescope icon, brass, medieval nautical tool",
    color: "#87CEEB",
    symbol: "🔭"
  },
  {
    role: "Spy",
    prompt: "cloak and dagger icon, dark hood, medieval assassin style",
    color: "#2C3E50",
    symbol: "🕵️"
  },
  {
    role: "Psychic",
    prompt: "crystal ball icon, mystical orb, glowing purple, fortune teller",
    color: "#9B59B6",
    symbol: "🔮"
  },
  {
    role: "Tracker",
    prompt: "compass icon, brass navigational tool, medieval explorer",
    color: "#E67E22",
    symbol: "🧭"
  }
];
```

**TOWN PROTECTIVE (5)**
```javascript
const TOWN_PROTECTIVE_ICONS = [
  {
    role: "Doctor",
    prompt: "medical cross icon, white bandages, healing symbol, medieval physician",
    color: "#27AE60",
    symbol: "⚕️"
  },
  {
    role: "Bodyguard",
    prompt: "shield icon, metal protection, knight's shield, medieval armor",
    color: "#34495E",
    symbol: "🛡️"
  },
  {
    role: "Crusader",
    prompt: "crossed swords icon, holy crusader, silver blades, religious symbol",
    color: "#E74C3C",
    symbol: "⚔️"
  },
  {
    role: "Trapper",
    prompt: "bear trap icon, metal jaws, hunter's trap, dangerous device",
    color: "#7F8C8D",
    symbol: "🪤"
  },
  {
    role: "Guardian Angel",
    prompt: "angel wings icon, white feathers, holy protection, divine symbol",
    color: "#ECF0F1",
    symbol: "👼"
  }
];
```

**TOWN KILLING (4)**
```javascript
const TOWN_KILLING_ICONS = [
  {
    role: "Vigilante",
    prompt: "revolver gun icon, six-shooter, wild west weapon, smoking barrel",
    color: "#95A5A6",
    symbol: "🔫"
  },
  {
    role: "Veteran",
    prompt: "military helmet icon, war veteran, battle-worn, soldier's helm",
    color: "#6C7A89",
    symbol: "🪖"
  },
  {
    role: "Vampire Hunter",
    prompt: "wooden stake and cross icon, vampire slayer, holy weapon",
    color: "#F39C12",
    symbol: "🧄"
  },
  {
    role: "Jailor",
    prompt: "iron shackles icon, prison chains, jailer's tool, locked",
    color: "#34495E",
    symbol: "⛓️"
  }
];
```

**MAFIA (10) - Continuar para todos los roles...**

---

### **2. RETRATOS DE PERSONAJES (51 × 4 estados = 204 imágenes)**

**Estados por rol**:
1. **Normal** - Neutral, sin efectos
2. **Active** - Usando habilidad (glow, efectos)
3. **Dead** - Grayscale, transparencia
4. **Highlighted** - Borde dorado, seleccionado

**Dimensiones**: 512x512px  
**Formato**: PNG con transparencia  
**Estilo**: Bust portrait (busto), medieval/gótico

#### **Ejemplo: Sheriff**

```javascript
const SHERIFF_PORTRAITS = {
  normal: {
    prompt: `
      Medieval sheriff character portrait, 
      stern middle-aged man, cowboy hat, sheriff badge,
      mustache, serious expression, looking at viewer,
      dark gothic atmosphere, oil painting style,
      dramatic side lighting, brown leather vest,
      dark background with subtle fog,
      professional game character art, centered composition,
      no text, no UI
    `,
    file: "sheriff_normal.png"
  },
  
  active: {
    prompt: `
      Same medieval sheriff character,
      golden glow around him, magical investigation aura,
      eyes glowing slightly blue, concentrated expression,
      mystic particles floating around,
      dramatic lighting emphasizing power,
      [same base prompt as normal]
    `,
    file: "sheriff_active.png"
  },
  
  dead: {
    // Post-process: Desaturar + opacity 50%
    file: "sheriff_dead.png"
  },
  
  highlighted: {
    // Post-process: Borde dorado + glow
    file: "sheriff_highlighted.png"
  }
};
```

#### **Prompts Base por Rol**

**TOWN Aesthetic**: 
- Colores: Azules, blancos, dorados
- Lighting: Cálido, esperanzador
- Mood: Noble, heroico, protector

**MAFIA Aesthetic**:
- Colores: Rojos oscuros, negros, grises
- Lighting: Sombras dramáticas
- Mood: Siniestro, misterioso, amenazante

**NEUTRAL Aesthetic**:
- Colores: Grises, púrpuras, verdes
- Lighting: Místico, ambiguo
- Mood: Impredecible, caótico

**COVEN Aesthetic**:
- Colores: Púrpuras, verdes oscuros, negros
- Lighting: Sobrenatural, etéreo
- Mood: Mágico, poderoso, ominoso

---

### **3. ICONOS DE HABILIDADES (51 imágenes)**

**Dimensiones**: 128x128px  
**Formato**: PNG transparente  
**Estilo**: Icono de acción, claro y reconocible

#### **Ejemplos de Habilidades**

```javascript
const ABILITY_ICONS = {
  sheriff_interrogate: {
    prompt: "interrogation light icon, spotlight beam, questioning symbol",
    file: "ability_interrogate.png"
  },
  
  doctor_heal: {
    prompt: "healing hands icon, green medical energy, life force",
    file: "ability_heal.png"
  },
  
  vigilante_shoot: {
    prompt: "gun muzzle flash icon, bullet fire, shooting action",
    file: "ability_shoot.png"
  },
  
  mafia_kill: {
    prompt: "bloody knife icon, assassination weapon, danger",
    file: "ability_mafia_kill.png"
  },
  
  jailor_jail: {
    prompt: "prison bars icon, locked cell, imprisonment",
    file: "ability_jail.png"
  },
  
  witch_control: {
    prompt: "puppet strings icon, mind control, magical manipulation",
    file: "ability_control.png"
  }
};
```

---

### **4. UI ELEMENTS (20 imágenes)**

**Backgrounds**:
```javascript
const UI_BACKGROUNDS = [
  {
    name: "town_square_day",
    size: "1920x1080",
    prompt: "medieval town square, daytime, cobblestone, buildings, market stalls, sunny",
    file: "bg_town_day.jpg"
  },
  {
    name: "town_square_night",
    size: "1920x1080", 
    prompt: "medieval town square at night, moonlight, torches, shadows, mysterious fog",
    file: "bg_town_night.jpg"
  },
  {
    name: "bonfire",
    size: "512x512",
    prompt: "animated bonfire, campfire flames, orange and yellow fire, transparent background",
    file: "bonfire.png"
  }
];
```

**Decorative Elements**:
```javascript
const UI_DECORATIONS = [
  "wood_frame_border.png",      // Marco de madera para UI
  "parchment_paper.png",         // Fondo pergamino para texto
  "rope_divider.png",            // Separador decorativo
  "metal_corner.png",            // Esquinas metálicas para panels
  "blood_splatter.png",          // Efecto muerte
  "glow_circle.png",             // Efecto de glow
  "particle_spark.png",          // Partícula de chispa
  "smoke_wisp.png",              // Efecto humo
];
```

---

### **5. EFECTOS Y PARTÍCULAS (15 imágenes)**

```javascript
const PARTICLE_EFFECTS = [
  {
    name: "heal_particles",
    prompt: "green healing sparkles, medical particles, life energy",
    usage: "Doctor cura exitosa"
  },
  {
    name: "attack_slash",
    prompt: "red slash effect, sword strike, damage indicator",
    usage: "Cualquier ataque"
  },
  {
    name: "protect_shield",
    prompt: "blue shield bubble, protective barrier, defense aura",
    usage: "Bodyguard/Doctor protege"
  },
  {
    name: "death_skull",
    prompt: "small skull icon, death indicator, dark energy",
    usage: "Jugador muere"
  },
  {
    name: "investigation_eye",
    prompt: "mystical eye icon, all-seeing eye, investigation magic",
    usage: "Roles investigativos"
  },
  {
    name: "fire_particle",
    prompt: "small fire ember, orange spark, flame particle",
    usage: "Hoguera ambient"
  },
  {
    name: "blood_drop",
    prompt: "blood droplet, dark red liquid, death indicator",
    usage: "Muerte violenta"
  },
  {
    name: "magic_sparkle",
    prompt: "purple magic sparkle, mystical particle, witch energy",
    usage: "Coven/Witch habilidades"
  }
];
```

---

### **6. BADGES Y LOGOTIPOS (10 imágenes)**

```javascript
const BADGES = [
  {
    name: "town_logo",
    prompt: "town of salem logo, medieval town crest, blue and gold",
    size: "256x256"
  },
  {
    name: "mafia_logo", 
    prompt: "mafia organization emblem, red and black, crime syndicate",
    size: "256x256"
  },
  {
    name: "level_badge",
    prompt: "level up badge, experience medal, gold achievement",
    size: "128x128",
    variations: 20 // Nivel 1-20
  },
  {
    name: "mvp_crown",
    prompt: "golden crown icon, mvp award, king crown",
    size: "128x128"
  }
];
```

---

## Especificaciones Técnicas

### **Formatos y Optimización**

```javascript
const IMAGE_SPECS = {
  role_portraits: {
    size: "512x512",
    format: "PNG",
    compression: "lossy 80%",
    transparency: true,
    maxFileSize: "150KB"
  },
  
  role_icons: {
    size: "256x256",
    format: "PNG", 
    compression: "lossy 85%",
    transparency: true,
    maxFileSize: "50KB"
  },
  
  ability_icons: {
    size: "128x128",
    format: "PNG",
    compression: "lossy 85%",
    transparency: true,
    maxFileSize: "30KB"
  },
  
  backgrounds: {
    size: "1920x1080",
    format: "JPG",
    quality: 85,
    maxFileSize: "300KB"
  },
  
  particles: {
    size: "128x128",
    format: "PNG",
    transparency: true,
    maxFileSize: "20KB"
  }
};
```

### **Estructura de Directorios**

```
public/
└── assets/
    ├── roles/
    │   ├── portraits/
    │   │   ├── sheriff_normal.png
    │   │   ├── sheriff_active.png
    │   │   ├── sheriff_dead.png
    │   │   ├── sheriff_highlighted.png
    │   │   └── ... (204 archivos total)
    │   │
    │   └── icons/
    │       ├── sheriff.png
    │       ├── doctor.png
    │       └── ... (51 archivos)
    │
    ├── abilities/
    │   ├── interrogate.png
    │   ├── heal.png
    │   └── ... (51 archivos)
    │
    ├── ui/
    │   ├── backgrounds/
    │   │   ├── town_day.jpg
    │   │   └── town_night.jpg
    │   ├── frames/
    │   │   └── wood_border.png
    │   └── decorations/
    │       └── parchment.png
    │
    ├── effects/
    │   ├── heal_particles.png
    │   ├── attack_slash.png
    │   └── ... (15 archivos)
    │
    └── badges/
        ├── town_logo.png
        └── level_*.png (20 archivos)
```

---

## Script de Generación Automática

### **Generador con DALL-E**

```javascript
// scripts/generate-assets.js
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Importar lista de roles desde DATABASE.md
import { ALL_ROLES } from './role-definitions.js';

async function generateRolePortrait(role, state = 'normal') {
  const basePrompt = `
Medieval gothic character portrait for ${role.name}.
Description: ${role.description}
Style: Dark fantasy, oil painting, dramatic lighting
Composition: Bust portrait, centered, looking at viewer
Atmosphere: ${role.faction === 'Town' ? 'Noble and heroic' : 
              role.faction === 'Mafia' ? 'Sinister and dangerous' : 
              'Mysterious and ambiguous'}
Background: Dark ${role.faction === 'Town' ? 'blue' : 
                   role.faction === 'Mafia' ? 'red' : 'purple'} tones
NO text, NO modern elements
  `;
  
  const statePrompts = {
    normal: basePrompt,
    active: basePrompt + "\nGlowing aura, using magical ability, power emanating",
    // dead y highlighted se procesan después
  };
  
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: statePrompts[state] || basePrompt,
    size: "1024x1024",
    quality: "standard",
  });
  
  // Descargar imagen
  const imageUrl = response.data[0].url;
  const imageData = await fetch(imageUrl).then(r => r.arrayBuffer());
  
  // Guardar
  const filename = `${role.name.toLowerCase()}_${state}.png`;
  const filepath = path.join('public/assets/roles/portraits', filename);
  
  fs.writeFileSync(filepath, Buffer.from(imageData));
  
  console.log(`✅ Generated: ${filename}`);
  
  return filepath;
}

async function generateAllRoles() {
  console.log('🎨 Starting asset generation...');
  console.log(`Total roles: ${ALL_ROLES.length}`);
  console.log(`Total images: ${ALL_ROLES.length * 2} (normal + active)`);
  console.log(`Estimated cost: $${(ALL_ROLES.length * 2 * 0.04).toFixed(2)}`);
  
  for (const role of ALL_ROLES) {
    console.log(`\n🎭 Generating ${role.name}...`);
    
    // Generar estado normal
    await generateRolePortrait(role, 'normal');
    await delay(1000); // Rate limiting
    
    // Generar estado active
    await generateRolePortrait(role, 'active');
    await delay(1000);
    
    // Procesar dead (grayscale del normal)
    await processDeadState(role);
    
    // Procesar highlighted (borde dorado del normal)
    await processHighlightedState(role);
  }
  
  console.log('\n✅ All assets generated!');
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Ejecutar
generateAllRoles().catch(console.error);
```

### **Post-procesamiento con Sharp**

```javascript
// scripts/post-process.js
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function processDeadState(roleName) {
  const inputPath = `public/assets/roles/portraits/${roleName}_normal.png`;
  const outputPath = `public/assets/roles/portraits/${roleName}_dead.png`;
  
  await sharp(inputPath)
    .greyscale()
    .modulate({ brightness: 0.7 })
    .composite([{
      input: Buffer.from([0, 0, 0, 128]), // Semi-transparent overlay
      raw: { width: 1, height: 1, channels: 4 },
      tile: true,
      blend: 'over'
    }])
    .toFile(outputPath);
    
  console.log(`✅ Processed dead state: ${roleName}`);
}

async function processHighlightedState(roleName) {
  const inputPath = `public/assets/roles/portraits/${roleName}_normal.png`;
  const outputPath = `public/assets/roles/portraits/${roleName}_highlighted.png`;
  
  // Añadir borde dorado
  await sharp(inputPath)
    .extend({
      top: 10,
      bottom: 10,
      left: 10,
      right: 10,
      background: { r: 255, g: 215, b: 0, alpha: 1 }
    })
    .toFile(outputPath);
    
  console.log(`✅ Processed highlighted state: ${roleName}`);
}
```

---

## Paleta de Colores por Facción

```css
/* Town - Azules y dorados */
--town-primary: #4169E1;
--town-secondary: #FFD700;
--town-accent: #87CEEB;
--town-glow: rgba(65, 105, 225, 0.5);

/* Mafia - Rojos y negros */
--mafia-primary: #8B0000;
--mafia-secondary: #2C2C2C;
--mafia-accent: #DC143C;
--mafia-glow: rgba(139, 0, 0, 0.6);

/* Coven - Púrpuras y verdes */
--coven-primary: #8B008B;
--coven-secondary: #2E8B57;
--coven-accent: #BA55D3;
--coven-glow: rgba(139, 0, 139, 0.5);

/* Neutral - Grises y ambiguos */
--neutral-primary: #808080;
--neutral-secondary: #696969;
--neutral-accent: #A9A9A9;
--neutral-glow: rgba(128, 128, 128, 0.4);
```

---

## Checklist de Assets

### **Fase 1: MVP (12 roles × 4 estados = 48 imágenes)**
- [ ] Sheriff (normal, active, dead, highlighted)
- [ ] Doctor
- [ ] Vigilante
- [ ] Mayor
- [ ] Investigator
- [ ] Bodyguard
- [ ] Godfather
- [ ] Mafioso
- [ ] Consigliere
- [ ] Serial Killer
- [ ] Jester
- [ ] Survivor

### **Fase 1: Iconos MVP (12 imágenes)**
- [ ] 12 iconos de roles MVP

### **Fase 1: UI Básico (5 imágenes)**
- [ ] Town square día
- [ ] Town square noche
- [ ] Hoguera
- [ ] Wood frame
- [ ] Parchment background

### **Fase 2: Roles Completos (39 roles más × 4 = 156 imágenes)**
- [ ] Todos los Town roles restantes
- [ ] Todos los Mafia roles
- [ ] Todos los Neutral roles

### **Fase 3: Coven (7 roles × 4 = 28 imágenes)**
- [ ] Coven Leader
- [ ] Hex Master
- [ ] Medusa
- [ ] Necromancer
- [ ] Poisoner
- [ ] Potion Master

### **Fase 4: Efectos y Polish (15 imágenes)**
- [ ] Partículas de efectos
- [ ] Badges y logotipos

---

## Presupuesto Estimado

### **Opción Gratis (Stable Diffusion)**
- Costo: $0
- Tiempo: ~20 horas trabajo manual
- Calidad: 7/10

### **Opción Económica (DALL-E)**
- Costo: $12-15 total
- Tiempo: ~4 horas (automatizado)
- Calidad: 9/10

### **Opción Premium (Midjourney)**
- Costo: $10/mes (1 mes suficiente)
- Tiempo: ~6 horas
- Calidad: 10/10

### **Opción Artista**
- Costo: $200-500
- Tiempo: 2-4 semanas
- Calidad: 10/10 + estilo único

---

**Recomendación**: Empezar con DALL-E para MVP (cuesta ~$2), ver cómo queda, y si te gusta el resultado, generar el resto. Total ~$15 para 300 imágenes profesionales.

---

**Última actualización**: Febrero 2026
