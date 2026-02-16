# Actualizar Código en el Servidor

## Pasos para aplicar el fix:

### 1. Conectar por SSH al servidor
```bash
ssh usuario@tu-servidor
```

### 2. Ir al directorio del proyecto
```bash
cd /ruta/donde/clonaste/Town-of-Salem
# Por ejemplo: cd ~/Town-of-Salem
```

### 3. Hacer pull de los cambios
```bash
git pull origin main
```

### 4. Reconstruir y reiniciar los contenedores
```bash
docker compose down
docker compose up -d --build
```

O si solo quieres reiniciar sin reconstruir:
```bash
docker compose restart backend frontend
```

### 5. Verificar que los contenedores están corriendo
```bash
docker compose ps
docker compose logs -f backend
```

### 6. Probar el fix
- Crea una partida nueva
- Únete con tu amigo
- Inicia la partida
- Verifica que ambos aparecéis vivos

---

**Nota**: Si el directorio del servidor es `\\Elements\ssd\compose\Town of Salem\Town-of-Salem\`, 
conéctate a ese servidor y navega a ese directorio antes de hacer el pull.
