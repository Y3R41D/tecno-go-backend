# Proyecto TecnoGo - README

Este proyecto gestiona la información relacionada con TecnoGo, utilizando una base de datos y un backend.

## Diagrama de la Base de Datos

Se ha creado un mockup del diagrama de la base de datos en dbdiagram.io. Puedes visualizarlo en el siguiente enlace:

[Enlace al diagrama DB](https://dbdiagram.io/d/67611f5184c7410727ed0f17)

## Configuración e Instalación

1. **Pre-requisitos:**

   Asegúrate de tener instalado lo siguiente:
    *   Node.js (v16 o superior recomendado)
    *   npm (o yarn)
    *   Wrangler (CLI de Cloudflare) - Instalar con: `npm install -g wrangler`
    *   Cuenta de Cloudflare con acceso a D1.

2. **Instalar dependencias del proyecto:**

   Navega al directorio del proyecto en tu terminal y ejecuta:

   ```bash
   npm install


3.  **Crear una nueva base de datos D1 para desarrollo:**

    Puedes crear la base de datos desde la UI de Cloudflare Workers (sección D1) o usando la CLI de Wrangler. Recomendamos usar la CLI:

    ```bash
    npx wrangler d1 create tecnogo-dev
    ```

    Este comando crea una base de datos llamada `tecnogo-dev`. Recuerda que debes estar autenticado en Wrangler (`wrangler login`).

4.  **Obtener el ID de la base de datos D1:**

    Después de crear la base de datos, necesitas su ID para interactuar con ella. Puedes encontrarlo en la UI de Cloudflare o ejecutando:

    ```bash
    npx wrangler d1 list
    ```

    Copia el ID de la base de datos `tecnogo-dev`. Lo usaremos como `<ID_DATABASE>` en los siguientes comandos.

5.  **Importar el esquema de la base de datos:**

    Ejecuta el siguiente comando, reemplazando `<ID_DATABASE>` con el ID que copiaste:

    ```bash
    npx wrangler d1 execute <ID_DATABASE> --file="./sql/TecnoGo.sql"
    ```

6.  ~~**Importar los datos de prueba (Inserts):**~~ (Aun no separado)

    Repite el paso anterior con el archivo de inserts:

    ```bash
    npx wrangler d1 execute <ID_DATABASE> --file="./Inserts_data.sql"
    ```

7. **Ejecutar el servidor local**

Para iniciar el servidor local y hacerlo accesible desde tu red local (útil para probar en dispositivos móviles), ejecuta:

```bash
npm run dev
```

**Deploy**


Para realizar el despliegue del proyecto a Cloudflare Workers, ejecuta:

```bash
npm run deploy
```

## Notas adicionales

  * Consulta la documentación de Cloudflare Workers, Wrangler y D1 para obtener información más detallada sobre la configuración y el despliegue:
      * [Cloudflare Workers](https://developers.cloudflare.com/workers/)
      * [Wrangler](https://developers.cloudflare.com/workers/wrangler/)
      * [Cloudflare D1](https://developers.cloudflare.com/d1/)