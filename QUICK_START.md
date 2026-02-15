# 🚀 Guía de Inicio Rápido - Mafia Game

## Prerrequisitos

Asegúrate de tener instalado:
- **Node.js 20+** ([descargar](https://nodejs.org/))
- **PostgreSQL 15+** ([descargar](https://www.postgresql.org/download/))
- **Git** ([descargar](https://git-scm.com/))

## Instalación en 5 Minutos

### 1️⃣ Clonar el Repositorio
```bash
cd "c:\Town of Salem"
```

### 2️⃣ Configurar Base de Datos

Crea una base de datos PostgreSQL:
```sql
CREATE DATABASE mafia_game;
```

### 3️⃣ Configurar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
copy .env.example .env

# Editar .env con tu configuración:
# DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/mafia_game"
# GEMINI_API_KEY="tu_api_key_de_gemini"
notepad .env

# Generar Prisma Client
npm run prisma:generate

# Crear tablas en la base de datos
npm run prisma:migrate

# Poblar con roles
npm run prisma:seed

# ✅ ¡Backend listo!
```

### 4️⃣ Configurar Frontend

```bash
cd ..\frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
copy .env.local.example .env.local

# Editar .env.local:
# NEXT_PUBLIC_API_URL=http://localhost:3001
# NEXT_PUBLIC_WS_URL=ws://localhost:3001
notepad .env.local

# ✅ ¡Frontend listo!
```

### 5️⃣ Iniciar Aplicación

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 6️⃣ ¡Jugar!

Abre tu navegador en:
```
http://localhost:3000
```

---

## 🎮 Cómo Jugar

### Crear una Partida
1. Ingresa tu nombre
2. Haz clic en "Crear Partida"
3. Configura el juego (jugadores, roles, modo)
4. Comparte el código de 6 dígitos con tus amigos
5. Espera a que todos se unan
6. Click en "Iniciar Partida"

### Unirse a una Partida
1. Ingresa tu nombre
2. Ingresa el código de 6 dígitos
3. Haz clic en "Unirse a Partida"
4. Espera a que el host inicie

---

## 🛠️ Comandos Útiles

### Backend
```bash
# Desarrollo
npm run dev

# Ver base de datos (Prisma Studio)
npm run prisma:studio

# Regenerar Prisma Client
npm run prisma:generate

# Nueva migración
npm run prisma:migrate

# Re-seed (limpiar y poblar)
npm run prisma:seed
```

### Frontend
```bash
# Desarrollo
npm run dev

# Build producción
npm run build

# Iniciar producción
npm run start

# Linter
npm run lint
```

---

## 🔧 Solución de Problemas

### Error: "Cannot connect to database"
✅ Verifica que PostgreSQL está corriendo
✅ Verifica DATABASE_URL en backend/.env
✅ Verifica credenciales de base de datos

### Error: "Port 3001 already in use"
✅ Mata el proceso:
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <numero_pid> /F
```

### Error: "Socket connection failed"
✅ Asegúrate de que el backend está corriendo
✅ Verifica NEXT_PUBLIC_WS_URL en frontend/.env.local

### Las fuentes no se ven bien
✅ Las fuentes de Google Fonts pueden tardar en cargar
✅ Refresca la página

---

## 📚 Estructura de Archivos Importante

```
Town of Salem/
├── backend/
│   ├── src/
│   │   └── index.js          # 🔧 Servidor principal
│   ├── prisma/
│   │   ├── schema.prisma     # 📊 Schema de BD
│   │   └── seed.js           # 🌱 Datos iniciales
│   └── .env                  # ⚙️ Configuración
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx          # 🏠 Página principal
│   │   ├── layout.tsx        # 📐 Layout
│   │   └── globals.css       # 🎨 Estilos
│   ├── hooks/                # 🪝 Hooks personalizados
│   ├── store/                # 💾 Zustand stores
│   └── .env.local            # ⚙️ Configuración
│
└── docs/                     # 📚 Documentación completa
    ├── README.md
    ├── IMPLEMENTATION_CHECKLIST.md
    └── ...
```

---

## 🎯 Próximos Pasos

Una vez que todo funcione:

1. **Lee la documentación** en `docs/IMPLEMENTATION_CHECKLIST.md`
2. **Sigue la Fase 1** para implementar el MVP (Lobby + Roles + Ciclo Día/Noche)
3. **Consulta** `DEVELOPMENT_STATUS.md` para ver el progreso
4. **Implementa roles** siguiendo el patrón en `backend/prisma/seed.js`

---

## 📞 Recursos

- **Documentación completa**: Carpeta `docs/`
- **Schema de roles**: `docs/DATABASE_SCHEMA_ROLE_COMPLETO.md`
- **53 roles**: `docs/ALL_ROLES.md`
- **Flujo de juego**: `docs/GAME_FLOW.md`
- **Sistema de bots**: `docs/BOT_SYSTEM_ADVANCED.md`

---

## ✅ Checklist de Verificación

Antes de empezar a desarrollar, verifica:

- [ ] PostgreSQL corriendo
- [ ] Base de datos `mafia_game` creada
- [ ] Backend: `npm install` exitoso
- [ ] Backend: `.env` configurado
- [ ] Backend: `npm run prisma:migrate` exitoso
- [ ] Backend: `npm run prisma:seed` exitoso
- [ ] Backend: `npm run dev` corriendo en puerto 3001
- [ ] Frontend: `npm install` exitoso
- [ ] Frontend: `.env.local` configurado
- [ ] Frontend: `npm run dev` corriendo en puerto 3000
- [ ] Navegador: http://localhost:3000 carga correctamente
- [ ] Backend: http://localhost:3001/health responde OK

---

**¡Listo para empezar a desarrollar! 🎮🔥**
