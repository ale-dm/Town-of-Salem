# Configuración Nginx en Portainer - Instrucciones

## Situación actual
- ✅ Backend funcionando: `localhost:3001`
- ✅ Frontend funcionando: `localhost:3000`
- ❌ Nginx solo proxy al frontend, falta backend

## Solución: Añadir rutas backend a nginx

### Opción 1: Editar desde Portainer (Recomendado)

1. **Ir a Portainer** → Containers → Tu container de nginx → **Console**

2. **Buscar tu archivo de configuración:**
```bash
find /etc/nginx -name "*.conf" -exec grep -l "salem.xelements.es" {} \;
```

3. **Editar el archivo encontrado:**
```bash
nano /ruta/al/archivo.conf
```

4. **Dentro del bloque `server { ... }` de salem.xelements.es, ANTES del `location / {}`:**

Añadir estas líneas (copia exactamente):

```nginx
    # Socket.IO / WebSocket (DEBE ir ANTES de location /)
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
        proxy_buffering off;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
```

**IMPORTANTE:** Estas rutas van **ANTES** de tu `location / { proxy_pass http://localhost:3000; }`

5. **Tu configuración final debería verse así:**

```nginx
server {
    listen 443 ssl http2;
    server_name salem.xelements.es;
    
    # ... tus certificados SSL ...
    
    # --- NUEVAS RUTAS (VAN PRIMERO) ---
    location /socket.io/ { ... }
    location /api/ { ... }
    location /health { ... }
    
    # --- TU LOCATION / EXISTENTE ---
    location / {
        proxy_pass http://localhost:3000;
        # ... resto de tu config
    }
}
```

6. **Verificar sintaxis:**
```bash
nginx -t
```

7. **Si dice "syntax is ok", recargar nginx:**
```bash
nginx -s reload
```

O desde Portainer: **Restart** el container de nginx.

### Opción 2: Usar archivo completo (Avanzado)

Si prefieres reemplazar todo el archivo, usa: `nginx/salem-complete.conf`

```bash
# En tu servidor
cd /compose/Town\ of\ Salem/Town-of-Salem
cp nginx/salem-complete.conf /ruta/hacia/nginx/conf.d/salem.xelements.es.conf

# Ajustar rutas de certificados SSL en el archivo

# Restart nginx desde Portainer
```

---

## Verificar que funciona

1. **Test health check:**
```bash
curl https://salem.xelements.es/health
# Debe responder: {"status":"ok",...}
```

2. **Test crear partida:**
```bash
curl -X POST https://salem.xelements.es/api/games/create \
  -H "Content-Type: application/json" \
  -d '{"hostName":"Test"}'
# Debe responder con gameId y code
```

3. **Abrir el juego en el navegador:**
`https://salem.xelements.es` → Crear partida → debería funcionar sin errores 404

---

## Troubleshooting

**Error: 502 Bad Gateway**
```bash
# Verificar que los containers estén corriendo
docker ps | grep tos
# Debe ver: tos-backend (Up), tos-frontend (Up)
```

**Error: 404 en /api/**
- Las rutas de nginx están en el orden incorrecto
- `location /api/` debe ir ANTES de `location /`

**Error: WebSocket connection failed**
- Falta `location /socket.io/`
- Cloudflare debe tener WebSocket activado (está por defecto)

**Ver logs nginx:**
```bash
docker logs <tu-container-nginx> --tail 50
```
