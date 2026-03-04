# PSBD Management Tool

Herramienta integral para la gestión de oportunidades, recruiting, staffing y finanzas.

## Requisitos Previos

Para ejecutar esta herramienta en Windows 11, asegúrate de tener instalado:

1.  **Node.js** (Versión 18 o superior): [Descargar aquí](https://nodejs.org/)
2.  **Git** (Opcional, para clonar el repositorio): [Descargar aquí](https://git-scm.com/)

## Instalación en Windows 11

Sigue estos pasos para instalar y ejecutar la herramienta de forma sencilla:

1.  **Descargar el código**:
    Si tienes Git instalado, abre una terminal (PowerShell o CMD) y ejecuta:
    ```bash
    git clone <url-del-repositorio>
    cd psbd-management
    ```
    Si no tienes Git, descarga el archivo ZIP del proyecto y extráelo en una carpeta.

2.  **Instalar dependencias**:
    Abre una terminal en la carpeta del proyecto y ejecuta:
    ```bash
    npm install
    ```

3.  **Ejecutar en modo desarrollo**:
    Para probar la herramienta localmente:
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:3000`.

4.  **Despliegue para producción**:
    Si deseas generar una versión optimizada:
    ```bash
    npm run build
    ```
    Y luego inicia el servidor:
    ```bash
    npm start
    ```

## Actualización de la Aplicación

Para actualizar la aplicación a la última versión disponible en GitHub, sigue estos pasos desde la terminal (PowerShell o CMD) en la carpeta del proyecto:

1.  **Descargar los últimos cambios**:
    ```bash
    git pull origin main
    ```
    *(Nota: Si usas un token de acceso personal (PAT), asegúrate de tenerlo configurado en tu configuración de Git local).*

2.  **Actualizar dependencias**:
    ```bash
    npm install
    ```

3.  **Reconstruir la aplicación** (si estás en producción):
    ```bash
    npm run build
    ```

4.  **Reiniciar el servidor**:
    Detén el proceso actual (Ctrl+C) y vuelve a ejecutar `npm start` o `npm run dev`.

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
