import { google } from 'googleapis';
import { env } from '../config/env.js';

/** Cliente de Google Sheets compartido por todos los repositories. */
export async function crearClienteSheets() {
  const auth = new google.auth.GoogleAuth({
    ...(env.GOOGLE_CREDENTIALS_JSON
      ? { credentials: JSON.parse(env.GOOGLE_CREDENTIALS_JSON) }
      : { keyFile: env.GOOGLE_CREDENTIALS_PATH }),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const client = await auth.getClient();

  return google.sheets({
    version: 'v4',
    auth: client as any,
  });
}
