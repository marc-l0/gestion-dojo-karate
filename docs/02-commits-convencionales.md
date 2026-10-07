# 2. Commits convencionales

[Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/) es un acuerdo para escribir los mensajes de commit siempre con la misma forma. Así el historial se lee fácil, se sabe qué versión publicar y se puede generar el registro de cambios automáticamente.

## El formato

```
<tipo>(<scope>): <descripción>

[cuerpo opcional: explica el porqué]

[pie opcional: BREAKING CHANGE, issues relacionados]
```

- **tipo**: qué clase de cambio es (ver tabla).
- **scope** (opcional pero recomendado): qué parte del proyecto toca.
- **descripción**: en imperativo, en minúsculas y sin punto final. Piensa que completa la frase *"Este commit va a..."*.

## Tipos

Los que más usarás:

| Tipo | Cuándo usarlo | Ejemplo |
|---|---|---|
| `feat` | Introduce una **nueva funcionalidad** | `feat(api): agregar estado a los profesores` |
| `fix` | **Corrige un error** | `fix(web): mostrar el error cuando la clase no existe` |
| `docs` | Cambia **solo documentación** | `docs: explicar cómo configurar la cuenta de servicio de Google` |
| `build` | Afecta la compilación o **dependencias externas** (npm) | `build(deps): actualizar astro` |
| `ci` | Cambia la **configuración del CI** (GitHub Actions) | `ci: ejecutar pruebas e2e en cada pull request` |

También disponibles:

| Tipo | Cuándo usarlo |
|---|---|
| `refactor` | Reorganiza código sin cambiar lo que hace |
| `test` | Agrega o corrige pruebas |
| `style` | Formato (espacios, comillas), sin cambiar la lógica |
| `perf` | Mejora el rendimiento |
| `chore` | Mantenimiento que no toca el código de la app |
| `revert` | Deshace un commit anterior |

## Scopes del proyecto

`web`, `api`, `shared`, `sheets` (la integración con Google Sheets), `ci`, `deps`, `config`, `docs`, `release`. Están definidos en `commitlint.config.js`; si usas otro, el commit se rechaza.

## Cambios que rompen compatibilidad (BREAKING CHANGE)

Cuando un cambio obliga a otros a modificar su código (por ejemplo, cambia la forma de una respuesta de la API), se marca de dos maneras:

1. Un `!` después del tipo o scope.
2. Un pie `BREAKING CHANGE:` que explica qué cambió y qué hacer.

```
feat(api)!: devolver las clases paginadas

BREAKING CHANGE: GET /clases ahora responde { data, meta } en lugar de un arreglo.
La web debe leer la lista desde "data".
```

Un `BREAKING CHANGE` significa que la próxima versión sube el número MAYOR (`1.4.2` → `2.0.0`).

## Ejemplos buenos y malos

| ❌ Malo | ✅ Bueno | Por qué |
|---|---|---|
| `cambios` | `feat(web): agregar formulario de postulación` | Dice qué y dónde |
| `arreglé el login` | `fix(api): aceptar correos con mayúsculas en la postulación` | Tipo + imperativo + detalle |
| `feat: Varias Cosas.` | Un commit por cambio | Un commit = una idea |
| `feat(backend): ...` | `feat(api): ...` | `backend` no es un scope válido |

## Cómo se valida

- **Al hacer commit en tu computadora:** el hook `commit-msg` de Husky ejecuta **commitlint**. Si el mensaje no cumple, el commit se cancela y te dice qué corregir:

```
⧗   input: arreglé cosas
✖   subject may not be empty [subject-empty]
✖   type may not be empty [type-empty]
```

- **En GitHub:** el workflow `pr-title.yml` revisa el **título del PR**, porque al unir con *Squash and merge* ese título se convierte en el commit que queda en `develop`.

## El asistente: `pnpm commit`

Si no recuerdas el formato, usa:

```bash
git add .
pnpm commit
```

Te hace preguntas en español (tipo, scope, descripción, si rompe compatibilidad, issues relacionados) y arma el mensaje por ti.

En VS Code también puedes usar la extensión recomendada **Conventional Commits** desde el panel de Git.
