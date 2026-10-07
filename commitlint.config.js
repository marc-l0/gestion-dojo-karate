/**
 * Conventional Commits: <tipo>(<scope>): <descripción>
 * Ejemplos:
 *   feat(api): agregar endpoint para cambiar el estado de un profesor
 *   fix(web): corregir el cálculo de cupos en la lista de clases
 *   chore(deps): actualizar astro a la última versión
 *
 * Usa `pnpm commit` para un asistente interactivo.
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Scopes permitidos: uno por paquete del monorepo + transversales.
    'scope-enum': [
      2,
      'always',
      ['web', 'api', 'shared', 'sheets', 'ci', 'deps', 'config', 'docs', 'release'],
    ],
    'scope-empty': [1, 'never'],
    'header-max-length': [2, 'always', 100],
    // Permite escribir la descripción en español con nombres propios (Google Sheets, Astro).
    'subject-case': [0],
  },
  prompt: {
    messages: {
      skip: '(Enter para omitir)',
      max: 'máximo %d caracteres',
      min: 'mínimo %d caracteres',
      emptyWarning: 'no puede estar vacío',
      upperLimitWarning: 'excede el límite',
      lowerLimitWarning: 'no alcanza el mínimo',
    },
    questions: {
      type: {
        description: 'Selecciona el tipo de cambio',
        enum: {
          feat: { description: 'Nueva funcionalidad', title: 'Features' },
          fix: { description: 'Corrección de un error', title: 'Bug Fixes' },
          docs: { description: 'Solo documentación', title: 'Documentation' },
          style: {
            description: 'Formato, espacios, punto y coma (sin cambiar lógica)',
            title: 'Styles',
          },
          refactor: {
            description: 'Cambio de código que no corrige un error ni agrega funcionalidad',
            title: 'Code Refactoring',
          },
          perf: { description: 'Mejora de rendimiento', title: 'Performance Improvements' },
          test: { description: 'Agregar o corregir tests', title: 'Tests' },
          build: {
            description: 'Cambios en el build o dependencias externas',
            title: 'Builds',
          },
          ci: { description: 'Cambios en workflows de CI', title: 'Continuous Integrations' },
          chore: { description: 'Otras tareas que no tocan src ni tests', title: 'Chores' },
          revert: { description: 'Revierte un commit anterior', title: 'Reverts' },
        },
      },
      scope: { description: '¿Qué parte del proyecto afecta? (web, api, shared, sheets...)' },
      subject: { description: 'Descripción corta en imperativo (ej. "agregar filtro por sede")' },
      body: { description: 'Descripción más detallada (opcional)' },
      isBreaking: { description: '¿Es un cambio que rompe compatibilidad?' },
      breakingBody: { description: 'Describe el cambio que rompe compatibilidad' },
      breaking: { description: 'Detalle del breaking change' },
      isIssueAffected: { description: '¿Este cambio está relacionado con algún issue?' },
      issuesBody: { description: 'Si cierra issues, agrega una descripción' },
      issues: { description: 'Referencia de issues (ej. "closes #12")' },
    },
  },
};
