#!/bin/bash
# ============================================
# Town of Salem - Init SSL (Let's Encrypt)
# ============================================
# Este script obtiene los certificados SSL iniciales.
# Solo necesitas ejecutarlo UNA VEZ en el primer despliegue.
#
# Requisitos:
#   - Docker y Docker Compose instalados
#   - Puerto 80 accesible desde internet
#   - DNS de salem.xelements.es apuntando a este servidor
#   - .env configurado con CERTBOT_EMAIL
# ============================================

set -e

DOMAIN="salem.xelements.es"

# Load .env
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

EMAIL="${CERTBOT_EMAIL:-}"
if [ -z "$EMAIL" ]; then
  echo "❌ Error: Configura CERTBOT_EMAIL en el archivo .env"
  exit 1
fi

echo "🔐 Obteniendo certificados SSL para $DOMAIN..."
echo "📧 Email: $EMAIL"
echo ""

# Create required directories
mkdir -p certbot/conf certbot/www

# Step 1: Create a temporary Nginx config for the challenge
echo "📝 Creando configuración temporal de Nginx..."
cat > nginx/nginx-init.conf << 'INITCONF'
server {
    listen 80;
    server_name salem.xelements.es;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 200 'SSL init in progress...';
        add_header Content-Type text/plain;
    }
}
INITCONF

# Step 2: Start Nginx with temporary config (HTTP only)
echo "🚀 Iniciando Nginx temporal (HTTP)..."
docker compose run -d --rm --name tos-nginx-init \
  -p 80:80 \
  -v "$(pwd)/nginx/nginx-init.conf:/etc/nginx/conf.d/default.conf:ro" \
  -v "$(pwd)/certbot/www:/var/www/certbot:ro" \
  nginx nginx -g "daemon off;"

# Wait for Nginx to start
sleep 3

# Step 3: Request certificates
echo "📜 Solicitando certificados a Let's Encrypt..."
docker run --rm \
  -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
  -v "$(pwd)/certbot/www:/var/www/certbot" \
  certbot/certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  -d "$DOMAIN"

# Step 4: Stop temporary Nginx
echo "🛑 Deteniendo Nginx temporal..."
docker stop tos-nginx-init 2>/dev/null || true

# Step 5: Clean up temporary config
rm -f nginx/nginx-init.conf

# Verify certificates exist
if [ -f "certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
  echo ""
  echo "✅ ¡Certificados SSL obtenidos correctamente!"
  echo ""
  echo "Ahora puedes iniciar el stack completo:"
  echo "  docker compose up -d --build"
  echo ""
  echo "🌐 Tu juego estará disponible en: https://$DOMAIN"
else
  echo ""
  echo "❌ Error: No se pudieron obtener los certificados."
  echo "Verifica que:"
  echo "  1. El DNS de $DOMAIN apunta a la IP de este servidor"
  echo "  2. El puerto 80 está abierto en el firewall/router"
  echo "  3. Cloudflare NO tiene el proxy activado (nube gris) durante este paso"
fi
