# Gestión Dojo Karate

Sistema web adaptable a celulares para gestionar un dojo de karate: crear y administrar **clases**, registrar **profesores**, compartir **convocatorias** y recibir **postulaciones** de alumnos con control de cupos.

El nombre provisional que aparece en la aplicación es **Mi Dojo**. El nombre definitivo y la identidad visual quedan a elección del cliente. Actualmente existe una **versión funcional en desarrollo para demostración local**; la publicación en internet y la aceptación de entrega deben validarse por separado.

Es un **monorepo**: un solo repositorio con varios proyectos que se administran con **pnpm workspaces + Turborepo**.

| Carpeta | Tecnología | Qué es |
|---|---|---|
| `apps/web` | Astro 7 + React 19 + Tailwind CSS 4 + Ant Design 6 | Pantallas de administración y formulario público |
| `apps/api` | Node.js 24 + NestJS 12 + Google Sheets (`googleapis`) | API REST, autenticación, reglas de negocio y persistencia |
| `packages/shared` | TypeScript | Tipos, estados y reglas compartidos que utiliza la API |

Los datos se guardan en una hoja de cálculo de Google. La estructura del almacenamiento se detalla en [Datos en Google Sheets](docs/03-google-sheets.md).

## Funcionalidades principales

- Inicio de sesión del administrador con JWT en cookies HTTP-only. La dirección principal abre el login; después se accede a Clases.
- Creación, edición y eliminación de clases, con fechas, sede, nivel, profesor, días, horario, tarifa y cupos.
- Detección de horarios superpuestos del mismo profesor, incluso entre sedes, al crear o editar clases. Las clases consecutivas están permitidas.
- Vista de clases vigentes, próximas y finalizadas, y calendario de entrenamiento.
- Registro, activación, desactivación y eliminación de profesores. Las clases y solicitudes existentes conservan el nombre guardado del profesor.
- Convocatorias disponibles desde la creación de la clase, con enlace, código QR negro sobre fondo blanco, descarga PNG y alternativa para guardar la imagen en móvil.
- Formulario público con validaciones, consentimiento, datos del apoderado para menores de edad y número de solicitud al completar el envío.
- Búsqueda y filtros de postulaciones por clase y estado, aceptación, rechazo y eliminación de solicitudes. Las pendientes no reservan vacante; las aceptadas o aprobadas consumen cupos.
- Navegación móvil compartida, avisos dentro de la app y temas claro, oscuro o automático.
- Documentos PDF descargables desde **Usuario > Ajustes > Documentación y entrega**: guía del administrador, procedimiento manual de respaldo y recuperación, y lista de pruebas de aceptación.

## Guías del proyecto

1. [Flujo de trabajo con Git (Gitflow)](docs/01-gitflow.md): ramas `main`, `develop`, `feature`, `release` y `hotfix`.
2. [Commits convencionales](docs/02-commits-convencionales.md): cómo escribir los mensajes de commit.
3. [Datos en Google Sheets](docs/03-google-sheets.md): pestañas, columnas, credenciales y validación de postulaciones.
4. [Calidad de código](docs/04-calidad-de-codigo.md): Biome, Husky, pruebas con Vitest y CI.
5. [Mapa de pantallas](docs/05-mapa-de-pantallas.md): rutas y archivos de cada sección.
6. [Documentación de entrega](docs/entrega/README.md): operación, respaldo, recuperación, pruebas y condiciones por acordar con el cliente.
7. [Presentación y capturas](docs/portafolio/README.md): PDF y capturas con datos ficticios para mostrar el proyecto.

## Requisitos

- **Git** para descargar y actualizar el repositorio.
- **Node.js 24**, la versión indicada en `.nvmrc`.
- **pnpm 12.6.0**, fijado en el campo `packageManager` de `package.json`. Usar la misma versión evita conflictos entre Corepack, pnpm global y las tareas de Turborepo.
- Una cuenta de Google, un proyecto con **Google Sheets API habilitada**, una cuenta de servicio y una hoja compartida con esa cuenta como **Editor**.
- Internet para consultar y guardar datos en Google Sheets.

## Puesta en marcha

La puesta en marcha se realiza mediante **PowerShell en Windows**, desde la carpeta seleccionada para alojar el proyecto. Las dependencias se instalan de forma conjunta mediante pnpm.

```powershell
# 1. Descargar la rama que contiene esta versión
git clone --branch feature/postulaciones-movil https://github.com/marc-l0/gestion-dojo-karate.git
cd gestion-dojo-karate

# 2. Instalar pnpm y las dependencias del proyecto
npm install --global pnpm@12.6.0
pnpm install --frozen-lockfile

# 3. Crear los archivos de configuración local
Copy-Item apps/api/.env.example apps/api/.env
Copy-Item apps/web/.env.example apps/web/.env

# 4. Crear la carpeta donde se guardará la credencial de Google
New-Item -ItemType Directory -Force apps/api/credentials
```

La llave JSON de la cuenta de servicio se guarda en `apps/api/credentials/google-service-account.json`. Se requieren las pestañas **Clases**, **Profesores** y **Postulaciones**, con encabezados en la primera fila y las columnas en el orden indicado en la [guía de Google Sheets](docs/03-google-sheets.md). En las hojas existentes se verifica que Postulaciones incluya las columnas R y S de consentimiento.

Los dos archivos `.env` se configuran antes del arranque. La API valida las variables obligatorias y detiene el inicio cuando faltan valores o no se cumplen los requisitos.

| Archivo | Variable | Qué configurar |
|---|---|---|
| `apps/api/.env` | `NODE_ENV` | `development` para la demostración local |
| `apps/api/.env` | `PORT` | Puerto de la API; por defecto, `3000` |
| `apps/api/.env` | `WEB_URL` | Dirección exacta de la web, por ejemplo `http://localhost:4321` |
| `apps/api/.env` | `JWT_SECRET` | Secreto aleatorio de al menos 32 caracteres; sustituir el ejemplo |
| `apps/api/.env` | `JWT_EXPIRES_IN_SECONDS` | Duración de la sesión; por defecto, `28800` segundos (8 horas) |
| `apps/api/.env` | `ADMIN_USUARIO` | Usuario del administrador, de al menos 3 caracteres |
| `apps/api/.env` | `ADMIN_PASSWORD` | Contraseña del administrador, de al menos 12 caracteres; sustituir el ejemplo |
| `apps/api/.env` | `GOOGLE_SPREADSHEET_ID` | Identificador de la hoja de cálculo, tomado de su URL |
| `apps/api/.env` | `GOOGLE_CREDENTIALS_PATH` | Por defecto, `credentials/google-service-account.json`, relativo a `apps/api` |
| `apps/api/.env` | `GOOGLE_CREDENTIALS_JSON` | Alternativa al archivo: JSON de la credencial configurado de forma privada en el alojamiento |
| `apps/api/.env` | `COOKIE_DOMAIN` | Vacío en local; definir según los dominios elegidos al publicar |
| `apps/web/.env` | `PUBLIC_API_URL` | Dirección de la API, por ejemplo `http://localhost:3000` |

La generación de un nuevo secreto se realiza localmente mediante el siguiente comando:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64'))"
```

Los `.env` y la carpeta `credentials/` están ignorados por Git. Su traslado a otra computadora se realiza por un medio privado. La URL pública de la API se configura en el frontend; las contraseñas y credenciales permanecen en el backend.

Una vez completada la configuración, se inicia el sistema con:

```powershell
pnpm dev
```

- Web: http://localhost:4321 (abre el login).
- API: http://localhost:3000 (no es la interfaz del sistema).

El arranque diario se realiza con `pnpm dev` desde la raíz del proyecto. Se inician el frontend y el backend en una sola terminal y se mantiene la compilación del paquete compartido. Los procesos se detienen con **Ctrl+C**. Cuando existe un frontend iniciado en segundo plano, se detiene con `pnpm stop:web`; también se detienen las instancias de la API abiertas por separado para liberar los puertos.

> La clonación del repositorio ya incluye la inicialización de Git. La reactivación de los hooks después de instalar se realiza con `pnpm run prepare`.

### Actualizar una copia existente

Antes de actualizar, se detiene la aplicación y se comprueba la rama correspondiente a esta versión mediante los siguientes comandos:

```powershell
git fetch origin
git switch feature/postulaciones-movil
git pull --ff-only origin feature/postulaciones-movil
pnpm dev
```

Cuando la actualización modifica las dependencias o el lockfile, se ejecuta `pnpm install --frozen-lockfile` antes de `pnpm dev`. Si Git informa de cambios locales que serían sobrescritos, estos se conservan mediante un commit o un respaldo con `git stash` antes de continuar.

### Probar desde un celular

La prueba desde un celular requiere que ambos dispositivos se encuentren conectados a la misma red. En la siguiente configuración, `IP-DE-LA-PC` representa la dirección de red de la computadora:

| Configuración | Valor para la red local |
|---|---|
| `apps/web/.env`: `PUBLIC_API_URL` | `http://IP-DE-LA-PC:3000` |
| `apps/api/.env`: `WEB_URL` | `http://IP-DE-LA-PC:4321` |
| `apps/api/.env`: `COOKIE_DOMAIN` | Vacío |
| Dirección de acceso desde el navegador | `http://IP-DE-LA-PC:4321` |

Después de modificar la configuración, se reinician ambos servicios. Cuando el firewall lo solicita, se habilita el acceso de Node.js en la red privada. La web y la API se acceden mediante el mismo hostname o IP para mantener el funcionamiento de la sesión.

El frontend escucha en la red local. Cuando cambia la IP de la computadora, se actualizan los `.env`, se reinician los servicios y se generan nuevamente los enlaces y QR. En el celular, `localhost` corresponde al propio dispositivo; el acceso al sistema se realiza mediante la IP de la computadora.

## Scripts principales

Desde la raíz del proyecto:

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Compila shared, mantiene sus cambios e inicia frontend y backend en una terminal |
| `pnpm dev:web` / `pnpm dev:api` | Levanta solo una app |
| `pnpm stop:web` | Detiene el frontend si se inició en segundo plano |
| `pnpm build` | Compila los tres paquetes |
| `pnpm typecheck` | Revisa los tipos de la API y shared; web no tiene actualmente un script propio de typecheck |
| `pnpm test` | Ejecuta las pruebas unitarias de la API y shared con Vitest |
| `pnpm --filter api test:e2e` | Pruebas HTTP de la API con repositorios simulados; no usan una hoja real |
| `pnpm lint` | Revisa el código con Biome sin modificarlo |
| `pnpm format` | Aplica formato con Biome |
| `pnpm check` | Formatea y corrige lo que Biome pueda arreglar solo |
| `pnpm ci:check` | Comprueba formato y lint sin escribir cambios, como en CI |
| `pnpm commit` | Asistente para escribir el commit con el formato correcto |
| `postinstall` | Se ejecuta después de instalar dependencias: compila `packages/shared`, que usa la API |

Las comprobaciones recientes de desarrollo incluyen las compilaciones de web y API, typecheck, pruebas unitarias y HTTP, y verificaciones de navegación con Playwright en tamaños móviles y de escritorio. Las verificaciones de navegador no forman parte de un comando de pruebas versionado del frontend. La validación de entrega se completa con la ejecución de la [lista de aceptación](docs/entrega/validacion-entrega.md) junto con el cliente.

## Estructura

```text
apps/
  api/src/
    main.ts                  arranque: validación global, cookies y CORS
    config/env.ts            carga y validación de variables de entorno
    auth/                    inicio de sesión, JWT y cierre de sesión
    clases/                  clases, postulaciones, cupos y validación de horarios
    profesores/              registro, cambios de estado y eliminación de profesores
    google/                  cliente de Google Sheets
  api/test/                  pruebas HTTP con repositorios simulados
  web/
    public/documentos/       PDF de operación y entrega, y ZIP descargable
    src/
      pages/                 rutas del sistema y formulario público
      components/pantallas/  contenido React de cada pantalla
      components/            navegación, tarjetas, confirmaciones, QR y mensajes
      layouts/               encabezado, navegación y protección de páginas privadas
      hooks/                 estado de operaciones y tema
      lib/                   acceso a la API y enlaces de formularios
      styles/                estilos globales y temas
packages/shared/src/
  enums/                     estados, duraciones y reglas compartidas
  types/api.ts               contratos de datos entre web y API
scripts/                     generador opcional de los PDF de entrega
docs/                        guías, entrega y material de presentación
```

La ubicación de cada pantalla y su ruta se detalla en el [mapa de pantallas](docs/05-mapa-de-pantallas.md).

## Endpoints de la API

Las rutas requieren sesión de administrador salvo las indicadas como **públicas**. La sesión se envía mediante cookie, no mediante una clave en la URL.

| Método | Ruta | Acceso | Qué hace |
|---|---|---|---|
| `POST` | `/auth/login` | Público | Verifica las credenciales y crea la cookie de sesión |
| `GET` | `/auth/me` | Administrador | Comprueba la sesión y devuelve el usuario |
| `POST` | `/auth/logout` | Administrador | Borra la cookie de sesión |
| `GET` | `/clases` | Administrador | Lista las clases con sus cupos disponibles |
| `GET` | `/clases/:id` | Público | Consulta la clase del formulario o QR |
| `POST` | `/clases` | Administrador | Crea una clase y comprueba la disponibilidad del profesor |
| `POST` | `/clases/:id` | Administrador | Actualiza una clase y comprueba cruces con otras clases |
| `DELETE` | `/clases/:id` | Administrador | Elimina una clase |
| `GET` | `/clases/postulaciones` | Administrador | Lista las postulaciones |
| `POST` | `/clases/postulaciones` | Público | Valida y registra una postulación pendiente |
| `POST` | `/clases/postulaciones/estado` | Administrador | Cambia el estado y actualiza los cupos |
| `DELETE` | `/clases/postulaciones/:id` | Administrador | Elimina una postulación y recalcula cupos |
| `GET` | `/profesores` | Administrador | Lista los profesores |
| `POST` | `/profesores` | Administrador | Crea un profesor |
| `POST` | `/profesores/estado` | Administrador | Activa o desactiva un profesor |
| `DELETE` | `/profesores/:id` | Administrador | Elimina un profesor |

Las clases se identifican por id, pero actualmente guardan al profesor por nombre. Al eliminar un profesor, sus clases y solicitudes existentes conservan el nombre guardado; no se eliminan en cascada. Las postulaciones también conservan una copia de los datos de su clase al momento de enviarse.

## Cambios realizados (2026-10-07)

- Se corrigió la consulta de postulaciones para utilizar `GET /clases/postulaciones` en lugar de `GET /profesores`.
- Se ajustó el acceso a la API desde la pantalla de postulaciones y se verificó la compilación del frontend.

## Cambios realizados (2026-10-09)

- Se corrigió el tipado de la prueba e2e de la API, eliminando la importación no válida de `supertest/types`.
- Se actualizaron las pruebas unitarias de `ClasesController` y `ClasesService` para registrar sus dependencias mediante mocks.
- Se ejecutó Biome sobre los archivos modificados mediante los hooks de Git.

## Cambios realizados (2026-10-27)

- Se incorporó la validación de postulaciones, el consentimiento y los datos del apoderado para menores, junto con controles de cupos y solicitudes duplicadas.
- Se unificó la navegación inferior y se ajustaron los formularios y tarjetas para pantallas móviles.
- Se organizó la consulta de clases vigentes, próximas y finalizadas, con accesos a postulaciones y convocatoria de cada clase.
- Se permitió compartir convocatorias y recibir postulaciones antes de la fecha de inicio de las clases.
- Se cambió el QR a negro sobre fondo blanco y se corrigió la copia del enlace al acceder mediante una dirección de red local con HTTP.

## Cambios realizados (2026-10-29)

- Se añadieron mensajes de estado dentro de la app y protección contra envíos repetidos durante las operaciones.
- Se incorporaron búsqueda y filtros de postulaciones, indicadores de últimos cupos y número de solicitud al completar el formulario.
- Se agregaron los temas claro, oscuro y automático, junto con la guía rápida y la información del sistema.
- Se centralizaron la cuenta, los ajustes y el cierre de sesión en la sección Usuario de la barra inferior. La creación de clases quedó dentro de Clases.
- Se adoptó el nombre provisional Mi Dojo y se configuró el login como entrada a la aplicación.
- Se reemplazó la confirmación del navegador al eliminar clases por una confirmación dentro de la app.

## Cambios realizados (2026-11-09)

- Se preparó una presentación PDF del proyecto y se agregaron capturas con datos ficticios para demostración y portafolio.

## Cambios realizados (2026-11-12)

- Se incorporó la eliminación de profesores desde la app y la API, con confirmación y conservación de los nombres en clases y solicitudes existentes.
- Se corrigió la interacción táctil de los botones Editar y Eliminar del menú de clases.
- Se ajustaron los selectores de profesor y duración para mostrar su indicación inicial sin ofrecerla como opción seleccionable.
- Se corrigió la descarga del QR como archivo PNG y se añadió una alternativa para abrir y guardar la imagen desde el celular.
- Se ajustó el campo de nacimiento del formulario público y se pasaron las fechas del aviso y resumen al formato español.
- Se agregó la detección de horarios superpuestos del mismo profesor al crear y editar clases, considerando fechas, días y horas entre sedes.
- Se añadieron la guía del administrador, el procedimiento manual de respaldo y recuperación y la lista de 18 pruebas para la entrega, disponibles en PDF y ZIP desde Ajustes.

Las fechas del registro corresponden a la zona horaria de Perú (`America/Lima`).

## Pendiente de mejorar

### Frontend

- Incorporar un script propio de typecheck y una suite de pruebas de navegador versionada, para que las verificaciones móviles puedan repetirse mediante un comando del proyecto.
- Evaluar el uso directo de `@dojo/shared` en el frontend; actualmente sus contratos se utilizan desde la API.

### Backend

- Migrar la relación de profesor en las clases a un identificador estable, en lugar de depender del nombre.
- Optimizar las lecturas completas de Google Sheets si crece el volumen de datos.
- Si se utilizan varias réplicas de la API, reemplazar las colas y límites en memoria por coordinación compartida. Las protecciones actuales se aplican dentro de una instancia y no coordinan ediciones manuales simultáneas en Sheets.

### Entrega y publicación

- Realizar el ensayo de recuperación en una copia de la hoja del cliente y asignar un responsable a los respaldos manuales.
- Completar las pruebas de aceptación, las condiciones de soporte y la conformidad con el cliente. Los documentos preparados no equivalen a una aceptación firmada.
- Confirmar el nombre definitivo, los datos iniciales y la configuración de los servicios de alojamiento; el dominio personalizado puede definirse después.
- Verificar HTTPS, cookies de sesión, CORS y conexión entre frontend y backend con las direcciones definitivas antes de usar datos reales en producción.
- Acordar con el cliente el responsable, el contacto y los plazos de conservación del aviso de datos personales.

## Automatizaciones en GitHub

El repositorio contiene las siguientes configuraciones. Su ejecución depende de las ramas, permisos y servicios habilitados en GitHub.

| Archivo | Qué hace |
|---|---|
| `.github/workflows/ci.yml` | En cada PR y en pushes a `main`/`develop`: configura Biome, typecheck, pruebas, build y pruebas HTTP de la API |
| `.github/workflows/pr-title.yml` | Valida el título del PR (Conventional Commits) y las ramas de Gitflow |
| `.github/dependabot.yml` | Propone actualizaciones de GitHub Actions hacia `develop` |
| `renovate.json` | Configura actualizaciones de dependencias de npm hacia `develop`; requiere habilitar la app Renovate |

El workflow de CI no se dispara por un push aislado a `feature/postulaciones-movil`; se ejecuta al abrir o actualizar un PR. Su uso como requisito de entrega requiere verificar la ejecución en Actions y la estructura del bloque `env` del paso de pruebas e2e, de modo que las variables queden dentro de ese bloque.

### Configuración del repositorio (una sola vez, en Settings)

La configuración siguiente se encuentra sujeta a verificación en GitHub; su presencia en la documentación no acredita que los ajustes estén aplicados. La disponibilidad de algunas opciones depende del plan y la visibilidad del repositorio.

1. **Ramas**: al adoptar Gitflow, crear `develop` desde `main` y marcarla como rama por defecto (**General > Default branch**). La versión de demostración descrita aquí está en `feature/postulaciones-movil`.
2. **Rules > Rulesets**: configurar reglas para `main` y `develop` que exijan PR y los checks `Lint, tipos, tests y build`, `Tests e2e del api`, `Validar Conventional Commits` y `Validar ramas de Gitflow`, una vez comprobado que esos workflows funcionan. Bloquear el force push y el borrado de las ramas protegidas.
3. **General > Pull Requests**: habilitar *Allow squash merging* para `feature` → `develop` y *Allow merge commits* para `release` y `hotfix` → `main`, de acuerdo con la guía de Gitflow.
4. **Advanced Security**: habilitar secret scanning, push protection y CodeQL cuando estén disponibles para el repositorio.
5. Habilitar la app **Renovate** si se desea automatizar la actualización de dependencias.
