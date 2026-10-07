# 4. Calidad de código: linter, Husky y Vitest

El proyecto revisa el código en tres momentos: **mientras escribes** (VS Code), **antes de cada commit o push** (Husky) y **en cada Pull Request** (GitHub Actions). Si algo se escapa en un paso, lo atrapa el siguiente.

```
Escribes código ──► Guardas (Ctrl+S) ──► git commit ──► git push ──► Pull Request
                    Biome formatea       pre-commit      pre-push     CI completo
                                         commit-msg
```

## Linter y formateador: Biome

- Un **linter** lee el código y avisa de errores y malas prácticas **sin ejecutarlo**.
- Un **formateador** deja el código con el mismo estilo sin importar quién lo escribió (espacios, comillas, saltos de línea). Así los PR muestran solo cambios reales.

**Biome** hace las dos cosas en una sola herramienta. Su configuración está en `biome.json`: 2 espacios, comillas simples, líneas de hasta 100 caracteres y las reglas recomendadas de lint.

| Comando | Qué hace |
|---|---|
| `pnpm lint` | Muestra los problemas de lint, sin cambiar nada |
| `pnpm format` | Formatea todos los archivos |
| `pnpm check` | Formatea y corrige todo lo que se pueda corregir solo |
| `pnpm ci:check` | Igual que `check` pero sin modificar nada (es lo que usa el CI) |

En VS Code, con la extensión **Biome** instalada, el código se formatea y se ordenan los imports **cada vez que guardas**.

> **Archivos `.astro`:** Biome no los revisa (están excluidos en `biome.json`). Se editan con la extensión de Astro. Los componentes de React (`.jsx`) sí pasan por Biome.

Además del linter, **TypeScript** revisa los tipos con `pnpm typecheck` (hoy en `api` y `shared`).

## Husky: revisiones automáticas con Git

**Husky** ejecuta scripts en ciertos momentos de Git, llamados **hooks**. Se activan solos al hacer `pnpm install` (con el script `prepare`), siempre que antes exista el repositorio (`git init` o `git clone`).

| Hook | Cuándo corre | Qué hace | Archivo |
|---|---|---|---|
| `pre-commit` | Antes de guardar el commit | Ejecuta **lint-staged**: Biome formatea y revisa **solo los archivos que vas a commitear**. Si hay un error que no puede corregir, cancela el commit. | `.husky/pre-commit` |
| `commit-msg` | Después de escribir el mensaje | Ejecuta **commitlint**: rechaza el mensaje si no sigue Conventional Commits. | `.husky/commit-msg` |
| `pre-push` | Antes de subir a GitHub | Revisa los tipos y ejecuta las **pruebas unitarias**. Turborepo reutiliza resultados anteriores, así que si nada cambió tarda segundos. | `.husky/pre-push` |

> Git permite saltarse los hooks con `--no-verify`, pero no sirve de nada: el CI de GitHub repite las mismas revisiones y el PR quedará bloqueado igual.

## Pruebas con Vitest

**Vitest** ejecuta pruebas automáticas: pequeños programas que usan tu código y comprueban que el resultado sea el esperado. Si alguien rompe algo sin querer, la prueba falla y avisa antes de llegar a producción.

| Paquete | Archivos | Qué prueban | Comando |
|---|---|---|---|
| `packages/shared` | `src/**/*.test.ts` | Reglas compartidas (por ejemplo, qué estados ocupan cupo) | `pnpm --filter @dojo/shared test` |
| `apps/api` (unitarias) | `src/**/*.spec.ts` | Controllers y services | `pnpm --filter api test` |
| `apps/api` (e2e) | `test/**/*.e2e-spec.ts` | La API arrancando completa | `pnpm --filter api test:e2e` |
| `apps/web` | — | Todavía sin pruebas | |

`pnpm test` en la raíz ejecuta todas las unitarias. Mientras programas, el modo vigilancia vuelve a ejecutarlas cada vez que guardas:

```bash
pnpm --filter api test:watch
```

Toda prueba sigue tres pasos: **preparar**, **ejecutar** y **comprobar**:

```ts
import { describe, expect, it } from 'vitest';
import { ocupaCupo } from './estado-postulacion.js';

describe('ocupaCupo', () => {
  it('cuenta las postulaciones aceptadas', () => {
    // Preparar y ejecutar
    const resultado = ocupaCupo('aceptado');

    // Comprobar
    expect(resultado).toBe(true);
  });
});
```

Para probar un service de la API sin tocar Google Sheets, se reemplaza el repositorio por uno falso (un **mock**), de modo que la prueba nunca llame a la hoja real.

## En GitHub: el CI

El workflow `.github/workflows/ci.yml` se ejecuta en cada Pull Request y repite todo en un servidor limpio:

1. `pnpm ci:check`: Biome.
2. `pnpm typecheck`: tipos.
3. `pnpm test`: pruebas unitarias.
4. `pnpm build`: compilación.
5. Pruebas e2e de la API.

Si cualquier paso falla, el PR no se puede unir.
