import { Injectable } from '@nestjs/common';
import { env } from "../../config/env.js";
import { crearClienteSheets } from "../../google/sheets.client.js";
import { Postulacion } from '../interfaces/postulacion.interface.js';

@Injectable()
export class PostulacionesRepository {
  private readonly spreadsheetId = env.GOOGLE_SPREADSHEET_ID;

  private readonly range = 'Postulaciones!A:Q';

  private async obtenerSheets() {
    return crearClienteSheets();
  }

  async obtenerTodas() {
    const sheets = await this.obtenerSheets();

    const respuesta = await sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: this.range,
    });

    const filas = respuesta.data.values || [];

    return filas.slice(1).map((fila) => ({
      id: Number(fila[0]),
      nombre: fila[1],
      telefono: fila[2],
      correo: fila[3],
      fechaNacimiento: fila[4],
      nombreCompletoApoderado: fila[5],
      correoApoderado: fila[6],
      telefonoApoderado: fila[7],
      claseId: Number(fila[8]),
      nivel: fila[9],
      sede: fila[10],
      profesor: fila[11],
      frecuencia: fila[12],
      horaInicio: fila[13],
      horaFin: fila[14],
      estado: fila[15],
      fechaPostulacion: fila[16],
    }));
  }

  async guardar(postulacion: Postulacion) {
    const sheets = await this.obtenerSheets();

    await sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: 'Postulaciones!A:Q',
      valueInputOption: 'RAW',
      requestBody: {
        values: [
          [
            postulacion.id,
            postulacion.nombre,
            postulacion.telefono,
            postulacion.correo,
            postulacion.fechaNacimiento,
            postulacion.nombreCompletoApoderado || '',
            postulacion.correoApoderado || '',
            postulacion.telefonoApoderado || '',
            postulacion.claseId,
            postulacion.nivel,
            postulacion.sede,
            postulacion.profesor,
            Array.isArray(postulacion.frecuencia)
              ? postulacion.frecuencia.join(', ')
              : postulacion.frecuencia,
            postulacion.horaInicio,
            postulacion.horaFin,
            postulacion.estado,
            postulacion.fechaPostulacion,
          ],
        ],
      },
    });

    return postulacion;
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
      throw new Error('Postulación no encontrada');
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: 'Postulaciones!P' + (indiceFila + 1),
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[estado]],
      },
    });

    return {
      mensaje: 'Estado actualizado correctamente',
    };
  }

  async eliminar(id: number) {
    const sheets = await this.obtenerSheets();

    const respuesta = await sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: this.range,
    });

    const filas = respuesta.data.values || [];

    const indiceFila = filas.findIndex((fila, indice) => indice > 0 && Number(fila[0]) === id);

    if (indiceFila === -1) {
      throw new Error('Postulación no encontrada');
    }

    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: this.spreadsheetId,
    });

    const hoja = spreadsheet.data.sheets?.find(
      (sheet) => sheet.properties?.title === 'Postulaciones',
    );

    const sheetId = hoja?.properties?.sheetId;

    if (sheetId === undefined) {
      throw new Error('No se encontró la hoja Postulaciones');
    }

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: this.spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: sheetId,
                dimension: 'ROWS',
                startIndex: indiceFila,
                endIndex: indiceFila + 1,
              },
            },
          },
        ],
      },
    });

    return {
      mensaje: 'Postulación eliminada correctamente',
    };
  }
}
