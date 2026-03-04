# PSBD Management Tool

Herramienta integral para la gestión de oportunidades, recruiting, staffing y finanzas, optimizada para entornos Linux (Ubuntu).

## Requisitos Previos

La aplicación está diseñada para ejecutarse en **Ubuntu 22.04 LTS** o superior. El instalador automático se encargará de configurar:
- Node.js 18+
- SQLite3
- Herramientas de compilación esenciales

## Instalación en Ubuntu (Recomendado)

Hemos preparado un script de instalación automática que configura todo el entorno, instala las dependencias y registra la aplicación como un servicio del sistema para que se inicie automáticamente al arrancar el servidor.

1.  **Descargar el código**:
    ```bash
    git clone <url-del-repositorio>
    cd psbd-management
    ```

2.  **Ejecutar el instalador**:
    Dale permisos de ejecución al script y lánzalo:
    ```bash
    chmod +x install.sh
    ./install.sh
    ```

3.  **Acceder a la aplicación**:
    Una vez finalizado, abre tu navegador en: `http://localhost:3000`

## Gestión del Servicio

La aplicación se instala como un servicio de `systemd` llamado `psbd-mgmt`. Puedes gestionarlo con los siguientes comandos:

- **Ver estado**: `sudo systemctl status psbd-mgmt`
- **Reiniciar**: `sudo systemctl restart psbd-mgmt`
- **Detener**: `sudo systemctl stop psbd-mgmt`
- **Ver logs en tiempo real**: `sudo journalctl -u psbd-mgmt -f`

## Actualización de la Aplicación

Para actualizar a la última versión disponible en GitHub:

1.  **Descargar cambios**:
    ```bash
    git pull origin main
    ```

2.  **Reinstalar y Reconstruir**:
    ```bash
    npm install
    npm run build
    ```

3.  **Reiniciar el servicio**:
    ```bash
    sudo systemctl restart psbd-mgmt
    ```

---
## Estructura del Proyecto

-   `server.ts`: Servidor Backend (Express + SQLite). Gestiona la base de datos y las APIs.
-   `src/App.tsx`: Frontend principal (React + Tailwind). Contiene toda la lógica de la interfaz.
-   `src/types.ts`: Definiciones de tipos TypeScript para asegurar la integridad de los datos.
-   `psbd.db`: Base de datos SQLite (se crea automáticamente al iniciar).
-   `uploads/`: Carpeta donde se guardan los CVs y documentos subidos.

## Documentación de Módulos

La herramienta incluye un apartado de **Documentación** integrado en el menú lateral izquierdo donde se detallan los flujos de trabajo recomendados para cada módulo (Oportunidades, Recruiting, Staffing, etc.).

---
Desarrollado para la gestión eficiente de unidades de negocio de ciberseguridad.
