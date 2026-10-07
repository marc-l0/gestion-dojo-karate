# 1. Flujo de trabajo con Git (Gitflow)

**Gitflow** es un modelo de ramas pensado para proyectos que publican versiones de forma planificada. Tiene dos ramas permanentes y tres tipos de ramas temporales.

## Las ramas

| Rama | Dura | Sale de | Se une a | Para qué |
|---|---|---|---|---|
| `main` | Siempre | | | Lo que está **en producción**. Nadie hace commits directos. |
| `develop` | Siempre | `main` | | **Integración**: aquí se juntan los cambios terminados. |
| `feature/<descripcion>` | Horas o 1 día | `develop` | `develop` | Una funcionalidad o historia de usuario. |
| `bugfix/<descripcion>` | Horas | `develop` o `release/*` | la misma de origen | Corregir un error antes de que llegue a producción. |
| `release/<version>` | Días | `develop` | `main` y `develop` | Congelar una versión para probarla antes de publicarla. |
| `hotfix/<descripcion>` | Horas | `main` | `main` y `develop` | Corregir un error urgente que ya está en producción. |

```
main     ●───────────────────────●─────────────●────────
         │                      /  v0.1.0     /  v0.1.1
         │         release/0.1.0 ●──●        /
         │                      /    \      / hotfix/login
develop  ●──●────────●─────────●──────●────●──────●─────
             \      /                              \
  feature/    ●──●─●                                ●── ...
  filtro
```

## Reglas de oro

1. **Ramas cortas.** Mientras más tiempo vive una rama separada de `develop`, más conflictos tendrá al unirse. Divide el trabajo en historias de usuario pequeñas que se terminen **en un día o menos**.
2. **Actualiza tu rama seguido.** Trae los cambios de `develop` a tu rama al empezar el día.
3. **Nada entra sin Pull Request.** `main` y `develop` están protegidas: todo cambio pasa por un PR con revisión y CI en verde.
4. **Evita fusiones que haya que revertir.** Para eso existen las ramas `release`: la versión se prueba ahí antes de llegar a `main`.
5. **Nombres de rama en minúsculas y con guiones:** `feature/filtro-por-sede`, no `Feature/Filtro Por Sede`.

El workflow `pr-title.yml` revisa automáticamente estas combinaciones:

| Destino del PR | Ramas permitidas |
|---|---|
| `main` | `release/*`, `hotfix/*` |
| `develop` | `feature/*`, `bugfix/*`, `release/*`, `hotfix/*` y las de los bots |
| `release/*` | `bugfix/*` |

## Cómo se trabaja, paso a paso

### Una funcionalidad nueva (feature)

```bash
# 1. Partir de develop actualizado
git switch develop
git pull

# 2. Crear la rama
git switch -c feature/filtro-por-sede

# 3. Trabajar y hacer commits pequeños
git add .
pnpm commit                    # asistente de commits convencionales

# 4. Traer lo último de develop (si otros avanzaron)
git fetch origin
git merge origin/develop

# 5. Subir la rama
git push -u origin feature/filtro-por-sede
```

6. En GitHub, abre un **Pull Request hacia `develop`** con un título convencional, por ejemplo `feat(api): agregar filtro de clases por sede`.
7. Cuando el CI esté en verde y tenga aprobación, se une con **Squash and merge**: todos tus commits se juntan en uno solo en `develop`.
8. Borra la rama (GitHub ofrece el botón **Delete branch**).

### Publicar una versión (release)

```bash
git switch develop
git pull
git switch -c release/0.1.0
git push -u origin release/0.1.0
```

- Se prueba la versión. Si aparece un error, se corrige con una rama `bugfix/*` hacia `release/0.1.0`.
- Cuando está lista: PR de `release/0.1.0` hacia **`main`**, unido con **Create a merge commit** (no squash, para mantener el historial conectado).
- Se marca la versión en `main`:

```bash
git switch main
git pull
git tag v0.1.0
git push origin v0.1.0
```

- Finalmente, PR de `release/0.1.0` hacia **`develop`** para que las correcciones también lleguen a develop.

### Un error urgente en producción (hotfix)

```bash
git switch main
git pull
git switch -c hotfix/formulario-no-envia
# corregir, commit, push
git push -u origin hotfix/formulario-no-envia
```

- PR hacia **`main`** (merge commit) y tag de versión, por ejemplo `v0.1.1`.
- PR de la misma rama hacia **`develop`**, para no perder la corrección.

## Versionado

Las versiones siguen el formato `MAYOR.MENOR.PARCHE` (por ejemplo `1.4.2`):

- **PARCHE** (`0.1.0` → `0.1.1`): solo correcciones (`fix`).
- **MENOR** (`0.1.1` → `0.2.0`): funcionalidades nuevas (`feat`).
- **MAYOR** (`0.2.0` → `1.0.0`): cambios que rompen compatibilidad (`BREAKING CHANGE`).

Por eso los commits convencionales son tan útiles: con solo leer los tipos de commit se sabe qué número subir. Ver la [guía 2](02-commits-convencionales.md).

## Comandos de Git que más vas a usar

| Comando | Qué hace |
|---|---|
| `git status` | Muestra qué archivos cambiaron |
| `git switch <rama>` | Cambia de rama |
| `git switch -c <rama>` | Crea una rama y se cambia a ella |
| `git pull` | Trae los cambios de GitHub a tu rama actual |
| `git add .` | Prepara todos los cambios para el commit |
| `git log --oneline --graph` | Muestra el historial como un árbol |
| `git stash` / `git stash pop` | Guarda cambios a medias sin hacer commit, y los recupera |

Más información: [Gitflow Workflow, tutorial de Atlassian](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow).
