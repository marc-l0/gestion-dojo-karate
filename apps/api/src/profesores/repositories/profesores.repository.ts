import { Injectable } from '@nestjs/common';
import { env } from "../../config/env.js";
import { crearClienteSheets } from "../../google/sheets.client.js";
import { Profesor } from '../interfaces/profesor.interface.js';

@Injectable()
export class ProfesoresRepository {
  private readonly spreadsheetId = env.GOOGLE_SPREADSHEET_ID;

  private readonly range = 'Profesores!A:C';

  private async obtenerSheets() {
    return crearClienteSheets();
  }

  async obtenerTodos() {
    const sheets = await this.obtenerSheets();

    const respuesta = await sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: this.range,
    });

    const filas = respuesta.data.values || [];

    return filas.slice(1).map((fila) => ({
      id: Number(fila[0]),
      nombre: fila[1],
      estado: fila[2],
    }));
  }

  async guardar(profesor: Profesor) {
    const sheets = await this.obtenerSheets();

    await sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: this.range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[profesor.id, profesor.nombre, profesor.estado]],
      },
    });

    return profesor;
  }

  async actualizarEstado(id: number, estado: string) {
    const sheets = await this.obtenerSheets();

    const respuesta = await sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: this.range,
    });

    const filas = respuesta.data.values || [];

    const indiceFila = filas.findIndex((fila, indice) => indice > 0 && Number(fila[0]) === id);

    if (indiceFila === -1) {
      throw new Error('Profesor no encontrado');
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: 'Profesores!C' + (indiceFila + 1),
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[estado]],
      },
    });

    return {
      mensaje: 'Estado del profesor actualizado',
    };
  }
}
