# Despliegue con Nginx de Portainer

## Arquitectura
```
Internet → Cloudflare → Tu Nginx (Portainer) → Docker containers
                         ├─ / → localhost:3000 (frontend)
                         ├─ /socket.io/ → localhost:3001 (backend WebSocket)
                         └─ /api/ → localhost:3001 (backend API)
```

## Paso a paso

### 1. En tu servidor, clonar el repo:
```bash
cd /compose/Town\ of\ Salem
git clone https://github.com/ale-dm/Town-of-Salem.git
cd Town-of-Salem
```

### 2. Configurar el .env:
```bash
cp .env.docker.example .env
nano .env
```
Rellena: `POSTGRES_PASSWORD`, `GEMINI_API_KEY`, `SESSION_SECRET`

### 3. Levantar los containers:
```bash
docker compose up -d --build
```

Esto levantará:
- **PostgreSQL** en puerto interno (no expuesto)
- **Backend** en `localhost:3001`
- **Frontend** en `localhost:3000`

### 4. Configurar tu Nginx de Portainer:

#### Opción A: Editar el archivo de configuración manualmente
Copia el contenido de `nginx/salem-portainer.conf` dentro del bloque `server {}` de tu configuración para `salem.xelements.es`.

Tu archivo final debería verse así:
```nginx
server {
    listen 443 ssl http2;
    server_name salem.xelements.es;

    # Tus certificados SSL existentes
    ssl_certificate /path/to/your/cert.pem;
    ssl_certificate_key /path/to/your/key.pem;

    # --- Aquí pega el contenido de salem-portainer.conf ---
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        # ... resto de configuración
    }
    # ... etc
}
```

#### Opción B: Usar include (recomendado)
1. Copia `nginx/salem-portainer.conf` a tu nginx de Portainer (ej: `/etc/nginx/conf.d/`)
2. En tu configuración principal de `salem.xelements.es`, añade:
```nginx
server {
    listen 443 ssl http2;
    server_name salem.xelements.es;

    # SSL config...
    
    include /etc/nginx/conf.d/salem-portainer.conf;
}
```

### 5. Recargar Nginx:
```bash
docker exec <tu-container-nginx> nginx -t  # verificar sintaxis
docker exec <tu-container-nginx> nginx -s reload
```

O en Portainer: **restart** el container de nginx.

### 6. Verificar:
- Frontend: `https://salem.xelements.es`
- Backend health: `https://salem.xelements.es/health`
- Logs: `docker compose logs -f backend`

## Troubleshooting

**Error: Cannot connect to WebSocket**
- Verifica que nginx tiene `proxy_set_header Upgrade $http_upgrade`
- Verifica que Cloudflare tiene WebSocket habilitado (está por defecto)

**Error: CORS**
- El backend ya acepta requests desde `https://salem.xelements.es`
- Verifica que las URLs en el frontend build son correctas (ver docker-compose.yml)

**Error: Database connection**
- Verifica que el container `tos-database` esté corriendo: `docker ps`
- Logs: `docker compose logs db`

**Rebuild después de cambios:**
```bash
git pull origin main
docker compose down
docker compose up -d --build
```

## Gestión de bots

Los bots usan Gemini API. Si alcanzas el límite de cuota:
- Añade una segunda API key en `GEMINI_API_KEY_2`
- Los bots usan mensajes fallback automáticamente si Gemini falla

## Mantenimiento

**Ver logs:**
```bash
docker compose logs -f backend    # backend en tiempo real
docker compose logs frontend      # frontend
docker compose logs db            # database
```

**Reiniciar un servicio:**
```bash
docker compose restart backend
docker compose restart frontend
```

**Parar todo:**
```bash
docker compose down
```

**Limpiar y reconstruir desde cero:**
```bash
docker compose down -v  # ⚠️ BORRA LA BASE DE DATOS
docker compose up -d --build
```
