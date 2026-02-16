#!/bin/bash
# ============================================
# Auto-configurar Nginx para salem.xelements.es
# Añade rutas backend/API/WebSocket automáticamente
# ============================================

set -e

echo "🔍 Buscando configuración de salem.xelements.es..."

# Buscar archivo de configuración
CONFIG_FILE=$(find /etc/nginx -name "*.conf" -exec grep -l "salem.xelements.es" {} \; | head -n 1)

if [ -z "$CONFIG_FILE" ]; then
    echo "❌ No se encontró configuración para salem.xelements.es"
    echo "Buscando en /etc/nginx:"
    find /etc/nginx -name "*.conf" | head -10
    exit 1
fi

echo "✅ Configuración encontrada: $CONFIG_FILE"

# Backup
BACKUP_FILE="${CONFIG_FILE}.backup-$(date +%Y%m%d-%H%M%S)"
cp "$CONFIG_FILE" "$BACKUP_FILE"
echo "💾 Backup creado: $BACKUP_FILE"

# Verificar si ya tiene las rutas
if grep -q "location /socket.io/" "$CONFIG_FILE"; then
    echo "⚠️  Las rutas ya existen en la configuración"
    echo "Si quieres reconfigurar, edita manualmente: $CONFIG_FILE"
    exit 0
fi

# Crear snippet con las rutas
cat > /tmp/salem-routes.conf << 'ROUTES'

    # ====================================
    # Town of Salem - Backend Routes
    # ====================================
    
    # Socket.IO / WebSocket
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
ROUTES

# Insertar antes del primer "location /" dentro del server block de salem.xelements.es
awk '
    /server_name salem.xelements.es/ { in_salem=1; }
    in_salem && /location \/ \{/ && !inserted {
        while((getline line < "/tmp/salem-routes.conf") > 0) {
            print line;
        }
        close("/tmp/salem-routes.conf");
        inserted=1;
    }
    { print; }
' "$CONFIG_FILE" > "${CONFIG_FILE}.new"

# Verificar sintaxis
nginx -t -c "${CONFIG_FILE}.new" 2>&1 | head -5

if nginx -t -c /etc/nginx/nginx.conf 2>/dev/null; then
    mv "${CONFIG_FILE}.new" "$CONFIG_FILE"
    echo ""
    echo "✅ Configuración actualizada correctamente"
    echo ""
    echo "Ahora recarga nginx:"
    echo "  nginx -s reload"
    echo ""
    echo "O desde Portainer: Restart el container de nginx"
else
    echo ""
    echo "❌ Error de sintaxis nginx"
    echo "Restaurando backup..."
    cp "$BACKUP_FILE" "$CONFIG_FILE"
    echo "⚠️  Configura manualmente siguiendo: NGINX_SETUP.md"
fi

rm -f /tmp/salem-routes.conf
