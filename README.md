# Gestión Dojo Karate

Sistema web para gestionar un dojo de karate: crear y administrar **clases**, registrar **profesores**, recibir **postulaciones** de alumnos mediante un formulario y llevar el control de cupos.

Es un **monorepo**: un solo repositorio con varios proyectos que se administran con **pnpm workspaces + Turborepo**.

| Carpeta | Tecnología | Qué es |
|---|---|---|
| `apps/web` | Astro 7 + React 19 + Ant Design + Tailwind 4 | Lo que ve el usuario en el navegador |
| `apps/api` | NestJS 12 + Google Sheets (`googleapis`) | La API REST que aplica las reglas y guarda los datos |
| `packages/shared` | TypeScript | Tipos, estados y reglas que usan web y api |

Los datos se guardan en una hoja de cálculo de Google, no en una base de datos. Ver [Datos en Google Sheets](docs/03-google-sheets.md).

## Guías del proyecto

1. [Flujo de trabajo con Git (Gitflow)](docs/01-gitflow.md): ramas `main`, `develop`, `feature`, `release` y `hotfix`.
2. [Commits convencionales](docs/02-commits-convencionales.md): cómo escribir los mensajes de commit.
3. [Datos en Google Sheets](docs/03-google-sheets.md): pestañas, columnas y credenciales.
4. [Calidad de código](docs/04-calidad-de-codigo.md): Biome, Husky, pruebas con Vitest y CI.

## Requisitos

- Node.js 24 (ver `.nvmrc`)
- pnpm 12 (viene fijado en `package.json`; con `corepack enable` se instala solo)
- La llave JSON de la cuenta de servicio de Google (ver [la guía 3](docs/03-google-sheets.md))

## Puesta en marcha

```bash
# 1. Git e instalación (git init antes de instalar, para que se activen los hooks)
git init
pnpm install

# 2. Variables de entorno (opcional: la API usa el puerto 3000 por defecto)
cp apps/api/.env.example apps/api/.env

# 3. Credenciales de Google: copia tu llave aquí (la carpeta está ignorada por Git)
mkdir -p apps/api/credentials
cp /ruta/a/tu/llave.json apps/api/credentials/google-service-account.json

# 4. Levantar todo
pnpm dev
```

- Web: http://localhost:4321
- API: http://localhost:3000

> Si instalaste antes de ejecutar `git init`, los hooks de commits no quedan activos. Actívalos con `pnpm run prepare`.

## Scripts principales

Desde la raíz del proyecto:

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Levanta web, api y shared en modo desarrollo |
| `pnpm dev:web` / `pnpm dev:api` | Levanta solo una app |
| `pnpm build` | Compila todo |
| `pnpm typecheck` | Revisa los tipos de TypeScript |
| `pnpm test` | Pruebas unitarias con Vitest |
| `pnpm lint` | Revisa el código con Biome sin modificarlo |
| `pnpm check` | Formatea y corrige lo que Biome pueda arreglar solo |
| `pnpm commit` | Asistente para escribir el commit con el formato correcto |
| `postinstall` | Se ejecuta solo después de `pnpm install`: compila `packages/shared`, que usa la API |

Pruebas e2e de la API: `pnpm --filter api test:e2e`.

## Estructura

```
apps/
  api/src/
    main.ts                  arranque: validación global y CORS
    app.module.ts            módulo raíz (cada módulo nuevo se importa aquí)
    clases/                  controller, service, dto, interfaces y repositories (clases y postulaciones)
    profesores/              controller, service, interfaces y repositories
  web/src/
    pages/                   una página por archivo (index, clases, profesores, postulaciones, calendario...)
    components/              componentes de React (islas): formulario, calendario, gestión de clases y profesores
    layouts/                 moldes de página
    styles/                  estilos globales
packages/shared/src/
  enums/                     estados de postulación y profesor, duraciones de clase
  types/api.ts               forma de los datos que viajan entre web y api
docs/                        guías del proyecto
```

## Endpoints de la API

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/clases` | Lista las clases con sus cupos disponibles |
| `POST` | `/clases` | Crea una clase |
| `POST` | `/clases/:id` | Actualiza una clase |
| `DELETE` | `/clases/:id` | Elimina una clase |
| `GET` | `/clases/postulaciones` | Lista las postulaciones |
| `POST` | `/clases/postulaciones` | Registra una postulación |
| `POST` | `/clases/postulaciones/estado` | Cambia el estado de una postulación |
| `DELETE` | `/clases/postulaciones/:id` | Elimina una postulación |
| `GET` | `/profesores` | Lista los profesores |
| `POST` | `/profesores` | Crea un profesor |
| `POST` | `/profesores/estado` | Activa o desactiva un profesor |

## Cambios realizados (2026-10-07)

- Se corrigió la carga de postulaciones en `apps/web/src/pages/postulaciones.astro`: ahora consulta `GET /clases/postulaciones` en vez de `GET /profesores`.
- Se movió la importación de `apiFetch` al `<script>` de la página, donde se utiliza en el navegador. La compilación de `apps/web` finalizó correctamente después del cambio.

## Cambios realizados (2026-10-09)

- Se corrigió el tipado de la prueba e2e de la API en `apps/api/test/app.e2e-spec.ts`, eliminando la importación no válida de `supertest/types`.
- Se actualizaron las pruebas unitarias de `ClasesController` y `ClasesService` para registrar sus dependencias mediante mocks en los módulos de prueba.
- Se ejecutó Biome sobre los archivos modificados mediante los hooks de Git.

**Pendiente de verificación:** ejecutar `typecheck` y las pruebas de la API y del monorepo antes de publicar los cambios.

## Pendiente de mejorar

### Frontend

- Unificar el diseño del frontend: revisar las páginas de `apps/web` y aplicar criterios visuales comunes (estructura, navegación, colores, tipografía, espaciado y estilos de formularios, tablas y botones), reutilizando los layouts y componentes compartidos. La meta es que todas las páginas se vean ordenadas y coherentes entre sí, en lugar de parecer diseños distintos.

- Aunque `apps/web/src/lib/api.js` ya centraliza la URL con `PUBLIC_API_URL` y ofrece `apiFetch`, algunos componentes todavía hacen `fetch` directamente a `http://127.0.0.1:3000`; falta migrarlos a la configuración común.
- `apps/web` todavía no usa `@dojo/shared`.

### Backend

- El origen permitido por CORS (`http://localhost:4321`) y el `spreadsheetId` de Google están escritos en el código de la API; faltan en un `.env` validado.

## Automatizaciones en GitHub

| Archivo | Qué hace |
|---|---|
| `.github/workflows/ci.yml` | En cada PR y en `main`/`develop`: Biome, typecheck, tests, build y tests e2e |
| `.github/workflows/pr-title.yml` | Valida el título del PR (Conventional Commits) y que las ramas sigan Gitflow |
| `.github/dependabot.yml` | Actualiza las GitHub Actions (PRs hacia `develop`) |
| `renovate.json` | Actualiza las dependencias de npm (PRs hacia `develop`; requiere instalar la app Renovate) |

### Configuración del repositorio (una sola vez, en Settings)

1. **Ramas**: crea `develop` desde `main` y márcala como rama por defecto (**General > Default branch**).
2. **Rules > Rulesets**: crea una regla para `main` y otra para `develop` que exijan PR, los checks `Lint, tipos, tests y build`, `Tests e2e del api`, `Validar Conventional Commits` y `Validar ramas de Gitflow`, y que bloqueen el force push y el borrado de la rama.
3. **General > Pull Requests**: habilita *Allow squash merging* (para `feature` → `develop`) y *Allow merge commits* (para `release` y `hotfix` → `main`). Desactiva *Allow rebase merging*.
4. **Advanced Security**: activa secret scanning, push protection y CodeQL en modo *Default setup*.
5. Instala la app **Renovate** desde GitHub Marketplace para este repositorio.
