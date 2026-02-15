# 🎨 VISUAL ASSETS GUIDE - Guía Completa de Assets Visuales

## 📋 Índice
- [Resumen de Assets Necesarios](#resumen-de-assets-necesarios)
- [Iconos de Roles](#iconos-de-roles)
- [Ilustraciones de Habilidades](#ilustraciones-de-habilidades)
- [Avatares de Jugadores](#avatares-de-jugadores)
- [UI Elements](#ui-elements)
- [Backgrounds y Escenas](#backgrounds-y-escenas)
- [Herramientas Recomendadas](#herramientas-recomendadas)
- [Prompts para IA](#prompts-para-ia)
- [Especificaciones Técnicas](#especificaciones-técnicas)

---

## Resumen de Assets Necesarios

### **Total de Assets Visuales**: ~300+ archivos

```
📊 Desglose:
├── Iconos de Roles (51)        - 512x512px PNG
├── Cartas de Roles (51)        - 400x600px PNG
├── Habilidades (51)            - 256x256px PNG
├── Avatares Custom (20-30)     - 256x256px PNG
├── UI Icons (50+)              - 64x64px SVG
├── Backgrounds (10)            - 1920x1080px JPG
├── Efectos VFX (30)            - Sprite sheets
└── Misc (logos, etc)           - Varios
```

---

## ICONOS DE ROLES (51 iconos)

### **Especificaciones:**
- **Formato**: PNG con transparencia
- **Tamaño**: 512x512px (exportar también 256x256, 128x128)
- **Estilo**: Medieval/Gótico, estilo ilustración
- **Paleta**: Coherente con tema (marrones, dorados, rojos oscuros)

### **Lista Completa de Iconos Necesarios:**

#### **TOWN (24 iconos)**

**Town Investigative:**
1. **Sheriff** - Estrella de sheriff dorada con inscripción
2. **Investigator** - Lupa con pergamino
3. **Lookout** - Catalejo/telescopio antiguo
4. **Spy** - Máscara veneciana con pluma
5. **Psychic** - Bola de cristal con niebla
6. **Tracker** - Huellas en barro con linterna

**Town Protective:**
7. **Doctor** - Cruz médica medieval con vendas
8. **Bodyguard** - Escudo con espada cruzada
9. **Crusader** - Casco de cruzado con cruz
10. **Trapper** - Trampa de oso antigua
11. **Guardian Angel** - Alas angelicales doradas

**Town Killing:**
12. **Vigilante** - Pistola antigua con pólvora
13. **Veteran** - Medalla de guerra con cicatrices
14. **Vampire Hunter** - Estaca de madera con ajo
15. **Jailor** - Llaves de prisión oxidadas

**Town Support:**
16. **Escort** - Rosa roja con perfume
17. **Mayor** - Corona de pueblo con pergamino
18. **Medium** - Vela con humo formando calavera
19. **Retributionist** - Mano esquelética saliendo de tumba
20. **Transporter** - Carruaje antiguo
21. **Spy** (ya listado)

#### **MAFIA (10 iconos)**

**Mafia Killing:**
22. **Godfather** - Anillo de sello con calavera
23. **Mafioso** - Cuchillo ensangrentado
24. **Ambusher** - Puñal en sombras

**Mafia Deception:**
25. **Disguiser** - Máscara teatral doble
26. **Forger** - Pluma con tinta y documento falso
27. **Framer** - Marco de cuadro roto
28. **Hypnotist** - Reloj de bolsillo balanceándose

**Mafia Support:**
29. **Blackmailer** - Carta sellada con lacre negro
30. **Consigliere** - Libro de secretos abierto
31. **Consort** - Abanico con veneno

#### **COVEN (7 iconos)**

32. **Coven Leader** - Necronomicon brillante
33. **Hex Master** - Muñeca vudú con alfileres
34. **Medusa** - Serpientes formando corona
35. **Necromancer** - Calavera con runas brillantes
36. **Poisoner** - Vial verde con humo tóxico
37. **Potion Master** - 3 pociones de colores

#### **NEUTRAL (12 iconos)**

**Neutral Evil:**
38. **Jester** - Gorro de bufón con cascabeles
39. **Executioner** - Hacha de verdugo con sangre
40. **Witch** - Escoba con sombrero puntiagudo

**Neutral Killing:**
41. **Serial Killer** - Cuchillo de carnicero
42. **Arsonist** - Cerilla encendida con gasolina
43. **Werewolf** - Luna llena con garra
44. **Juggernaut** - Armadura destrozada
45. **Plaguebearer/Pestilence** - Máscara de doctor peste

**Neutral Chaos:**
46. **Pirate** - Sable pirata con loro

**Neutral Benign:**
47. **Survivor** - Chaleco antibalas
48. **Amnesiac** - Cerebro con signo de interrogación
49. **Guardian Angel** (ya listado)

**Vampire:**
50. **Vampire** - Colmillos con sangre
51. **Vampire Hunter** (ya listado)

---

## CARTAS DE ROLES (51 cartas)

### **Especificaciones:**
- **Formato**: PNG con transparencia
- **Tamaño**: 400x600px (ratio 2:3 como cartas)
- **Estilo**: Carta de tarot medieval

### **Estructura de Carta:**

```
┌─────────────────────────┐
│   [BORDE DECORATIVO]    │
│                         │
│     [ICONO GRANDE]      │
│     (centrado)          │
│                         │
│   ══════════════════    │
│                         │
│      ROL NAME           │
│    (font medieval)      │
│                         │
│   ──────────────────    │
│                         │
│    [Alignment]          │
│   Town Investigative    │
│                         │
│   ──────────────────    │
│                         │
│   Attack: None          │
│   Defense: None         │
│                         │
└─────────────────────────┘
```

### **Elementos por Carta:**

1. **Borde decorativo** - Estilo medieval/gótico
2. **Ilustración del rol** - Versión grande del icono
3. **Nombre del rol** - Tipografía Uncial Antiqua
4. **Alignment badge** - Color según facción
5. **Stats** (Attack/Defense) - Iconos + valores
6. **Textura de pergamino** - Background sutil

### **Colores por Facción:**

```css
/* Bordes de carta */
.town-card { border-color: #4169e1; }
.mafia-card { border-color: #8b0000; }
.coven-card { border-color: #9400d3; }
.neutral-card { border-color: #808080; }
```

---

## ILUSTRACIONES DE HABILIDADES (51 animaciones/efectos)

### **Especificaciones:**
- **Formato**: PNG sequences o Sprite sheets
- **Tamaño**: 256x256px por frame
- **Frames**: 8-12 frames por animación
- **Estilo**: Efectos mágicos/medievales

### **Efectos por Categoría:**

#### **Investigative (Azul/Dorado)**
- **Sheriff Interrogate**: Estrella brillante → Resultado (✓ o ✗)
- **Investigator**: Lupa con destello → Lista de roles
- **Lookout Watch**: Ojo que parpadea → Siluetas de visitantes
- **Spy Bug**: Insecto brillante volando
- **Psychic Vision**: Bola de cristal brillando
- **Tracker**: Huellas luminosas

#### **Protective (Verde/Plateado)**
- **Doctor Heal**: Cruz médica con brillo verde
- **Bodyguard Protect**: Escudo materializándose
- **Crusader Protect**: Espada con destello
- **Trapper Set**: Trampa cerrándose

#### **Killing (Rojo/Naranja)**
- **Vigilante Shoot**: Disparo con chispa
- **Veteran Alert**: Explosión circular
- **Mafia Kill**: Cuchillo con sangre
- **Serial Killer**: Destello rojo oscuro
- **Arsonist Ignite**: Explosión de fuego
- **Werewolf Rampage**: Garras con luna

#### **Support (Amarillo/Blanco)**
- **Escort Roleblock**: Cadenas doradas
- **Mayor Reveal**: Corona brillando
- **Transporter**: Portal/vórtice

#### **Deception (Púrpura/Negro)**
- **Framer**: Humo negro envolviendo
- **Disguiser**: Máscara cambiante
- **Hypnotist**: Ondas hipnóticas

#### **Coven (Púrpura Oscuro)**
- **Hex**: Runas púrpuras girando
- **Poison**: Burbujas verdes tóxicas
- **Necronomicon**: Libro abierto con luz

---

## AVATARES DE JUGADORES (20-30 opciones)

### **Especificaciones:**
- **Formato**: PNG con transparencia
- **Tamaño**: 256x256px
- **Estilo**: Retratos estilo medieval/RPG

### **Categorías de Avatares:**

**Medieval Clásico (10):**
1. Caballero con casco
2. Arquero con capucha
3. Mago con barba
4. Clérigo con túnica
5. Ladrón con máscara
6. Noble con corona
7. Campesino con sombrero
8. Mercader con bolsa
9. Herrero con martillo
10. Bardo con laúd

**Fantasía Oscura (10):**
11. Vampiro pálido
12. Nigromante
13. Cazador de brujas
14. Asesino encapuchado
15. Hechicera
16. Paladín
17. Druida
18. Berserker
19. Monje
20. Pirata

**Neutros/Especiales (10):**
21. Jester (cara pintada)
22. Bufón
23. Verdugo
24. Doctor peste
25. Alquimista
26. Cartógrafo
27. Escriba
28. Guardia
29. Centinela
30. Vagabundo

---

## UI ELEMENTS (50+ elementos)

### **Botones y Controls:**

```
Tamaños: 
- Small: 32x32px
- Medium: 64x64px  
- Large: 128x64px
```

**Botones necesarios:**
1. **Primary Button** - Madera con borde dorado
2. **Secondary Button** - Piedra oscura
3. **Danger Button** - Rojo sangre
4. **Success Button** - Verde bosque
5. **Close Button** - X con ornamento
6. **Info Button** - i en círculo
7. **Settings Button** - Engranaje medieval
8. **Volume Button** - Bocina
9. **Mute Button** - Bocina tachada
10. **Fullscreen Button** - Flechas expandir

**Icons de Acción:**
11. **Vote** - Mano levantada
12. **Guilty** - Pulgar abajo
13. **Innocent** - Pulgar arriba
14. **Skip** - Reloj de arena
15. **Whisper** - Boca susurrando
16. **Will** - Pergamino enrollado
17. **Death Note** - Papel ensangrentado
18. **Notes** - Pluma y tinta
19. **Target** - Mira medieval
20. **Execute** - Hacha

**Status Icons:**
21. **Alive** - Corazón latiendo
22. **Dead** - Calavera
23. **On Trial** - Balanza
24. **Jailed** - Barrotes
25. **Roleblocked** - Cadenas
26. **Healed** - Cruz verde
27. **Protected** - Escudo
28. **Poisoned** - Gota veneno
29. **Doused** - Llama
30. **Hexed** - Símbolo maldición

**Faction Icons:**
31. **Town** - Edificio/torre
32. **Mafia** - Rosa negra
33. **Coven** - Pentagrama
34. **Neutral** - Balanza equilibrada
35. **Vampire** - Murciélago

**Misc UI:**
36. **Day Icon** - Sol medieval
37. **Night Icon** - Luna creciente
38. **Timer** - Reloj de arena
39. **Chat Bubble** - Burbuja
40. **Notification** - Campana
41. **Trophy** - Copa dorada
42. **Coin** - Moneda dorada
43. **XP Star** - Estrella brillante
44. **Level Up** - Flecha arriba
45. **Lock** - Candado
46. **Unlock** - Candado abierto
47. **Eye** - Ojo (mostrar)
48. **Eye Slash** - Ojo tachado (ocultar)
49. **Crown** - Corona (host/líder)
50. **Bot** - Engranaje con cara

---

## BACKGROUNDS Y ESCENAS (10 escenas)

### **Especificaciones:**
- **Formato**: JPG (optimizado) + WebP
- **Tamaño**: 1920x1080px (Full HD)
- **Versiones**: Desktop + Mobile (1080x1920)

### **Escenas Necesarias:**

1. **Main Menu Background**
   - Plaza medieval al atardecer
   - Hoguera en el centro
   - Edificios góticos al fondo
   - Niebla atmosférica

2. **Lobby Background**
   - Interior de taberna
   - Mesa redonda con velas
   - Sombras en las paredes
   - Ambiente cálido

3. **Day Phase Background**
   - Plaza del pueblo iluminada
   - Sol alto
   - NPCs en segundo plano
   - Hoguera central visible

4. **Night Phase Background**
   - Misma plaza pero nocturna
   - Luna llena
   - Antorchas encendidas
   - Niebla densa
   - Estrellas

5. **Trial Background**
   - Patíbulo en plaza
   - Multitud de sombras
   - Iluminación dramática
   - Verdugo en segundo plano

6. **Jail Background** (Para Jailor)
   - Interior de celda medieval
   - Barrotes de hierro
   - Antorcha en pared
   - Cadenas colgando

7. **Graveyard Background** (Para muertos)
   - Cementerio neblinoso
   - Lápidas antiguas
   - Luna parcial
   - Cuervos

8. **Victory Background - Town**
   - Plaza celebrando
   - Banderas azules
   - Fuegos artificiales
   - Gente festejando

9. **Victory Background - Mafia/Coven**
   - Plaza en caos
   - Fuego y humo
   - Banderas rojas/púrpuras
   - Luna sangrienta

10. **Victory Background - Neutral**
    - Plaza vacía
    - Amanecer/Atardecer
    - Solitario
    - Tono neutral

---

## EFECTOS VFX (30 efectos)

### **Partículas y Efectos:**

**Sprite Sheets (512x512px, 16 frames)**

1. **Fire Particles** - Para hoguera
2. **Smoke** - Transiciones
3. **Blood Splatter** - Muertes
4. **Magic Sparkles** - Habilidades
5. **Poison Bubbles** - Poisoner
6. **Lightning** - Efectos dramáticos
7. **Dark Mist** - Night transition
8. **Holy Light** - Resurrections
9. **Chains** - Roleblock
10. **Portal Swirl** - Transporter

**Animaciones UI:**
11. **Button Hover Glow**
12. **Coin Flip** - Decisiones
13. **Card Flip** - Revelar rol
14. **Paper Burn** - Testamento
15. **Torch Flicker** - Ambiente

---

## HERRAMIENTAS RECOMENDADAS

### **1. Para Generar con IA (Recomendado)**

#### **Midjourney** (Mejor calidad)
- **Precio**: $10/mes (Basic)
- **Output**: 4K alta calidad
- **Estilo**: Excelente para medieval/gótico
- **Uso**: Iconos, cartas, avatares

#### **DALL-E 3** (via ChatGPT Plus)
- **Precio**: $20/mes (incluye GPT-4)
- **Output**: 1024x1024px
- **Ventaja**: Mejor para coherencia de estilo
- **Uso**: Backgrounds, ilustraciones

#### **Leonardo.ai** (Gratis + Pago)
- **Precio**: Gratis (150 tokens/día) o $10/mes
- **Ventaja**: Canvas Editing
- **Uso**: Iconos, sprites

#### **Stable Diffusion** (Local, Gratis)
- **Precio**: Gratis (necesitas GPU)
- **Ventaja**: Control total
- **Modelos recomendados**: 
  - Dreamshaper (versatil)
  - RPG v5 (medieval)

### **2. Para Editar/Optimizar**

- **Photopea** (Gratis, web) - Como Photoshop
- **GIMP** (Gratis, desktop) - Edición avanzada
- **Figma** (Gratis) - UI/UX design
- **Aseprite** ($20) - Pixel art y sprites
- **remove.bg** (Gratis) - Quitar fondos

### **3. Para Comprimir**

- **TinyPNG** - Compresión PNG sin pérdida
- **Squoosh** - Convertir a WebP
- **ImageOptim** (Mac) - Optimización batch

---

## PROMPTS PARA IA

### **Template Base:**

```
[SUBJECT], medieval fantasy style, dark gothic aesthetic, 
high detail, clean lines, icon design, transparent background, 
professional game art, [COLOR PALETTE], dramatic lighting,
trending on ArtStation, 4k resolution
```

### **Ejemplos Específicos:**

#### **Sheriff Icon:**
```
Medieval sheriff star badge icon, golden metal with intricate 
engravings, dark background, gothic fantasy style, highly detailed, 
game icon design, transparent background, dramatic side lighting, 
4k, professional digital art
```

#### **Doctor Heal Effect:**
```
Magical healing spell effect, green glowing cross symbol, 
medieval fantasy, particle effects, transparent background,
game VFX, sprite sheet, 8 frames animation, soft glow
```

#### **Town Square Background:**
```
Medieval town square at dusk, large bonfire in center, 
gothic buildings surrounding, cobblestone ground, 
atmospheric fog, warm orange lighting, torches on walls,
cinematic composition, high detail, game background art,
1920x1080, matte painting style
```

#### **Godfather Card:**
```
Tarot card design, Godfather character, mafia boss in 
medieval attire, dark suit with cape, ornate golden ring 
with skull, dramatic pose, gothic border decorations, 
dark red and black color scheme, professional card game art,
400x600px, high detail
```

### **Parámetros Importantes:**

```
Aspect Ratios:
- Icons: --ar 1:1
- Cards: --ar 2:3
- Backgrounds: --ar 16:9
- Mobile BG: --ar 9:16

Style Modifiers:
- Medieval fantasy
- Dark gothic
- Game art style
- High contrast
- Dramatic lighting

Technical:
- Transparent background (para iconos)
- Clean edges
- High resolution
- Professional quality
```

---

## ESPECIFICACIONES TÉCNICAS

### **Formatos de Archivo:**

```javascript
const ASSET_SPECS = {
  roleIcons: {
    format: 'PNG',
    sizes: [512, 256, 128, 64],
    alpha: true,
    naming: 'role-{roleName}-{size}.png'
    // Ejemplo: role-sheriff-512.png
  },
  
  roleCards: {
    format: 'PNG',
    size: [400, 600],
    alpha: true,
    naming: 'card-{roleName}.png'
  },
  
  abilityEffects: {
    format: 'PNG sequence',
    frameSize: [256, 256],
    frames: 12,
    alpha: true,
    naming: 'ability-{roleName}-{frame}.png'
    // O sprite sheet: ability-{roleName}-sheet.png
  },
  
  backgrounds: {
    formats: ['JPG', 'WebP'],
    sizes: {
      desktop: [1920, 1080],
      mobile: [1080, 1920],
      tablet: [1536, 2048]
    },
    quality: 85,
    naming: 'bg-{scene}-{size}.{ext}'
  },
  
  uiIcons: {
    format: 'SVG',
    fallback: 'PNG',
    sizes: [64, 32, 16],
    naming: 'ui-{name}.svg'
  },
  
  avatars: {
    format: 'PNG',
    size: [256, 256],
    alpha: true,
    naming: 'avatar-{id}.png'
  }
};
```

### **Estructura de Carpetas:**

```
frontend/public/assets/
├── roles/
│   ├── icons/
│   │   ├── sheriff-512.png
│   │   ├── sheriff-256.png
│   │   └── ... (53 roles × 4 tamaños)
│   ├── cards/
│   │   ├── card-sheriff.png
│   │   └── ... (51 cartas)
│   └── abilities/
│       ├── sheriff-investigate/
│       │   ├── frame-001.png
│       │   ├── frame-002.png
│       │   └── ... (12 frames)
│       └── ... (51 habilidades)
│
├── avatars/
│   ├── avatar-001.png
│   └── ... (30 avatares)
│
├── ui/
│   ├── buttons/
│   │   ├── btn-primary.svg
│   │   └── ...
│   ├── icons/
│   │   ├── vote.svg
│   │   └── ...
│   └── effects/
│       ├── glow.png
│       └── ...
│
├── backgrounds/
│   ├── desktop/
│   │   ├── bg-menu-1920x1080.jpg
│   │   ├── bg-menu-1920x1080.webp
│   │   └── ...
│   └── mobile/
│       ├── bg-menu-1080x1920.jpg
│       └── ...
│
└── vfx/
    ├── fire-particles.png
    ├── smoke.png
    └── ...
```

### **Optimización:**

```javascript
// Next.js Image component config
// next.config.js
module.exports = {
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: ['your-cdn.com'],
  },
};

// Uso en componentes
import Image from 'next/image';

<Image
  src="/assets/roles/icons/sheriff-512.png"
  alt="Sheriff"
  width={128}
  height={128}
  quality={85}
  priority // Para iconos importantes
/>
```

---

## PLAN DE GENERACIÓN

### **Fase 1: Essentials (1-2 días)**
- [ ] 12 iconos de roles MVP
- [ ] 12 cartas de roles MVP
- [ ] 5 backgrounds básicos
- [ ] 20 UI icons esenciales
- [ ] 10 avatares básicos

### **Fase 2: Core (3-4 días)**
- [ ] 24 iconos Town completos
- [ ] 24 cartas Town completas
- [ ] 12 efectos básicos de habilidades
- [ ] 30 UI icons completos
- [ ] 20 avatares adicionales

### **Fase 3: Complete (5-7 días)**
- [ ] 51 iconos todos los roles
- [ ] 51 cartas todos los roles
- [ ] 51 efectos de habilidades
- [ ] 10 backgrounds todas las escenas
- [ ] 30 efectos VFX

### **Fase 4: Polish (2-3 días)**
- [ ] Variaciones de iluminación
- [ ] Efectos hover/pressed
- [ ] Animaciones complejas
- [ ] Assets de loading
- [ ] Optimización final

**Total**: ~15 días de generación intensiva

---

## BUDGET ESTIMADO

### **Opción 1: Todo con IA (Recomendado)**
```
Midjourney Pro: $30/mes × 2 meses = $60
ChatGPT Plus (DALL-E): $20/mes × 2 meses = $40
Leonardo.ai: $10/mes × 2 meses = $20
Aseprite (sprite editor): $20 one-time

TOTAL: $140
```

### **Opción 2: Freelancer + IA**
```
Pack de 51 iconos: $200-400
Pack de 51 cartas: $300-500
Backgrounds (10): $100-200
IA para efectos: $40

TOTAL: $640-1,140
```

### **Opción 3: Asset Stores**
```
Unity Asset Store / itch.io:
- Medieval Icon Pack: $20-50
- Fantasy Card Templates: $30-60
- VFX Bundle: $40-80
- Background Pack: $30-50
- Personalización: $100

TOTAL: $220-340
```

---

## RECURSOS GRATUITOS

### **Icon Packs Gratuitos:**
- **Game-icons.net** - 4000+ iconos SVG gratis
- **Flaticon** - Medieval pack
- **Noun Project** - Iconos básicos

### **Backgrounds:**
- **Unsplash** - Fotos de alta calidad
- **Pexels** - Videos y fotos
- **OpenGameArt** - Assets de juego gratis

### **Fonts:**
- **Google Fonts** - Gratis
  - UnifrakturMaguntia (medieval)
  - Cinzel (elegante)
  - IM Fell DW Pica (gótico)

---

## CHECKLIST DE ASSETS

### **Mínimo Viable (MVP):**
- [ ] 12 iconos de roles
- [ ] 3 backgrounds (menu, day, night)
- [ ] 15 UI icons básicos
- [ ] 5 avatares
- [ ] Logo del juego
- [ ] Loading spinner

### **Completo:**
- [ ] 51 iconos de roles (todos los tamaños)
- [ ] 51 cartas de roles
- [ ] 51 efectos de habilidades
- [ ] 10 backgrounds (todas las escenas)
- [ ] 50+ UI icons
- [ ] 30 avatares
- [ ] 30 VFX effects
- [ ] Favicon
- [ ] Social media assets (OG images)

---

**Última actualización**: Febrero 2026
