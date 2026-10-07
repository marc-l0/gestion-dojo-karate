# Guía de contribución

Resumen de las reglas del proyecto. El detalle está en la carpeta [`docs/`](docs/).

## 1. Ramas (Gitflow)

- `main` es producción y `develop` es integración. Nadie hace commits directos en ellas.
- Crea tu rama desde `develop` con el formato `feature/<descripcion>` o `bugfix/<descripcion>`, en minúsculas y con guiones: `feature/filtro-por-sede`.
- Ramas cortas: un cambio que se termine en un día o menos.
- Las versiones se preparan en `release/<version>` y los arreglos urgentes en `hotfix/<descripcion>`.

Ver [Gitflow](docs/01-gitflow.md).

## 2. Commits (Conventional Commits)

```
<tipo>(<scope>): <descripción en imperativo y minúsculas>
```

```
feat(api): agregar el estado inactivo a los profesores
fix(web): mostrar los cupos disponibles después de aceptar una postulación
docs: explicar cómo configurar la cuenta de servicio de Google
build(deps): actualizar astro
ci: ejecutar los tests e2e en cada pull request
feat(api)!: devolver las clases paginadas
```

- Scopes permitidos: `web`, `api`, `shared`, `sheets`, `ci`, `deps`, `config`, `docs`, `release`.
- Si no recuerdas el formato, usa `pnpm commit`.

Ver [Commits convencionales](docs/02-commits-convencionales.md).

## 3. Pull Requests

1. Sube tu rama y abre un PR hacia `develop`.
2. El título del PR sigue el mismo formato que los commits (al unir con *Squash and merge* se convierte en el commit final).
3. Completa la plantilla: qué cambia, por qué y cómo probarlo.
4. Espera el CI en verde y al menos una aprobación.

## 4. Antes de pedir revisión

- [ ] `pnpm check` no muestra errores.
- [ ] `pnpm typecheck` y `pnpm test` pasan (el hook `pre-push` lo revisa por ti).
- [ ] Si cambiaste las columnas de una hoja de Google Sheets, actualizaste [`docs/03-google-sheets.md`](docs/03-google-sheets.md).
- [ ] Si agregaste variables de entorno, actualizaste el `.env.example`.
- [ ] Nunca subas `apps/api/credentials/`: contiene la llave privada de Google.

## Qué validan los hooks de Git

| Hook | Qué revisa |
|---|---|
| `pre-commit` | Biome formatea y revisa los archivos del commit |
| `commit-msg` | commitlint rechaza mensajes que no sigan el formato |
| `pre-push` | Tipos y pruebas unitarias antes de subir a GitHub |

No uses `--no-verify`: el CI hace las mismas validaciones y el PR quedará bloqueado igual. Ver [Calidad de código](docs/04-calidad-de-codigo.md).
