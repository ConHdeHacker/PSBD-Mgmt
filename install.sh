#!/bin/bash

# PSBD Management Tool - Ubuntu Installer
# This script automates the installation of Node.js, dependencies, and systemd service.

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Iniciando instalación de PSBD Management Tool en Ubuntu...${NC}"

# 1. Update system
echo -e "${BLUE}Actualizando el sistema...${NC}"
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js (Version 20 - More stable for modern packages)
if ! command -v node &> /dev/null || [[ $(node -v | cut -d'v' -f2 | cut -d'.' -f1) -lt 20 ]]; then
    echo -e "${BLUE}Instalando Node.js 20...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    # Ensure npm is the latest version
    sudo npm install -g npm@latest
else
    echo -e "${GREEN}Node.js ya está instalado: $(node -v)${NC}"
fi

# 3. Install build tools for SQLite and native modules
echo -e "${BLUE}Instalando herramientas de compilación...${NC}"
sudo apt install -y build-essential python3-minimal

# 4. Install project dependencies
echo -e "${BLUE}Limpiando e instalando dependencias (con soporte para módulos nativos)...${NC}"
rm -rf node_modules package-lock.json
# Use --include=optional to ensure native bindings are fetched
npm install --include=optional

# Force rebuild of native modules to ensure they match the OS
echo -e "${BLUE}Reconstruyendo módulos nativos...${NC}"
npm rebuild

# 5. Build the frontend
echo -e "${BLUE}Compilando el frontend (Vite)...${NC}"
npm run build

# 6. Create Systemd Service
echo -e "${BLUE}Configurando el servicio del sistema (systemd)...${NC}"
APP_PATH=$(pwd)
USER_NAME=$(whoami)

sudo bash -c "cat > /etc/systemd/system/psbd-mgmt.service << EOF
[Unit]
Description=PSBD Management Tool
After=network.target

[Service]
Type=simple
User=$USER_NAME
WorkingDirectory=$APP_PATH
ExecStart=/usr/bin/npm start
Restart=on-failure
Environment=NODE_ENV=production PORT=3000

[Install]
WantedBy=multi-user.target
EOF"

# 7. Start the service
echo -e "${BLUE}Iniciando el servicio...${NC}"
sudo systemctl daemon-reload
sudo systemctl enable psbd-mgmt
sudo systemctl start psbd-mgmt

echo -e "${GREEN}--------------------------------------------------${NC}"
echo -e "${GREEN}¡Instalación completada con éxito!${NC}"
echo -e "${GREEN}La aplicación está corriendo en: http://localhost:3000${NC}"
echo -e "${GREEN}--------------------------------------------------${NC}"
echo -e "${BLUE}Comandos útiles:${NC}"
echo -e "  - Ver logs: sudo journalctl -u psbd-mgmt -f"
echo -e "  - Reiniciar: sudo systemctl restart psbd-mgmt"
echo -e "  - Detener: sudo systemctl stop psbd-mgmt"
