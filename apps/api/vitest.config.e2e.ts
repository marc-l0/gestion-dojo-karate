import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    // Valores públicos exclusivos de pruebas; no permiten acceso a una hoja real.
    env: {
      JWT_SECRET: 'secreto-solo-para-ci-con-mas-de-32-caracteres',
      ADMIN_USUARIO: 'admin',
      ADMIN_PASSWORD: 'clave-solo-para-ci-123',
      GOOGLE_SPREADSHEET_ID: 'id-falso-solo-para-ci',
    },
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
  },
});
