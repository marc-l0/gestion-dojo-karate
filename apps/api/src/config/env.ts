import { z } from 'zod';

// Carga el archivo .env de la carpeta desde la que se arranca (apps/api).
// Si no existe (por ejemplo en producción), se usan las variables del sistema.
try {
  process.loadEnvFile();
} catch {
  // sin archivo .env
}

const vacioAUndefined = (valor?: string) => valor || undefined;

const esquema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().default(3000),
  WEB_URL: z
    .url()
    .default('http://localhost:4321')
    .transform((valor) => valor.replace(/\/$/, '')),
  COOKIE_DOMAIN: z.string().optional().transform(vacioAUndefined),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET debe tener al menos 32 caracteres'),
  JWT_EXPIRES_IN_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .default(60 * 60 * 8),
  ADMIN_USUARIO: z.string().min(3, 'ADMIN_USUARIO debe tener al menos 3 caracteres'),
  ADMIN_PASSWORD: z.string().min(12, 'ADMIN_PASSWORD debe tener al menos 12 caracteres'),
  GOOGLE_SPREADSHEET_ID: z.string().min(10, 'Falta el id de la hoja de Google'),
  GOOGLE_CREDENTIALS_PATH: z.string().default('credentials/google-service-account.json'),
  GOOGLE_CREDENTIALS_JSON: z.string().optional().transform(vacioAUndefined),
});

const resultado = esquema.safeParse(process.env);

if (!resultado.success) {
  throw new Error(`Variables de entorno inválidas:\n${z.prettifyError(resultado.error)}`);
}

export const env = resultado.data;
