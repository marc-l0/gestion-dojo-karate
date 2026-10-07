import { Injectable } from '@nestjs/common';
import { env } from "../../config/env.js";
import { crearClienteSheets } from "../../google/sheets.client.js";
import { Clase } from '../interfaces/clase.interface.js';

@Injectable()
export class ClasesRepository {
  private readonly spreadsheetId = env.GOOGLE_SPREADSHEET_ID;

  private readonly range = 'Clases!A:M';

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

      nivel: fila[1],

      sede: fila[2],

      frecuencia: typeof fila[3] === 'string' ? fila[3].split(',').map((dia) => dia.trim()) : [],

      profesor: fila[4],

      horaInicio: fila[5],

      horaFin: fila[6],

      tarifa: Number(fila[7]),

      cupos: Number(fila[8]),

      cuposDisponibles: Number(fila[9] ?? fila[8] ?? 0),

      fechaInicio: fila[10] ?? '',

      duracion: fila[11] ?? '',

      fechaFin: fila[12] ?? '',
    }));
  }

  async guardar(clase: Clase) {
    const sheets = await this.obtenerSheets();

    await sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,

      range: this.range,

      valueInputOption: 'USER_ENTERED',

      requestBody: {
        values: [
          [
            clase.id,

            clase.nivel,

            clase.sede,

            clase.frecuencia.join(', '),

            clase.profesor,

            clase.horaInicio,

            clase.horaFin,

            clase.tarifa,

            clase.cupos,

            clase.cuposDisponibles,

            clase.fechaInicio,

            clase.duracion,

            clase.fechaFin,
          ],
        ],
      },
    });

    return clase;
  }

  async actualizar(clase: Clase) {
    const sheets = await this.obtenerSheets();

    const respuesta = await sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,

      range: this.range,
    });

    const filas = respuesta.data.values || [];

    const indiceFila = filas.findIndex(
      (fila, indice) => indice > 0 && Number(fila[0]) === clase.id,
    );

    if (indiceFila === -1) {
      throw new Error('Clase no encontrada');
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,

      range: 'Clases!A' + (indiceFila + 1) + ':M' + (indiceFila + 1),

      valueInputOption: 'USER_ENTERED',

      requestBody: {
        values: [
          [
            clase.id,

            clase.nivel,

            clase.sede,

            clase.frecuencia.join(', '),

            clase.profesor,

            clase.horaInicio,

            clase.horaFin,

            clase.tarifa,

            clase.cupos,

            clase.cuposDisponibles,

            clase.fechaInicio,

            clase.duracion,

            clase.fechaFin,
          ],
        ],
      },
    });

    return clase;
  }

  async actualizarCuposDisponibles(claseId: number, cuposDisponibles: number) {
    const sheets = await this.obtenerSheets();

    const respuesta = await sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,

      range: this.range,
    });

    const filas = respuesta.data.values || [];

    const indiceFila = filas.findIndex((fila, indice) => indice > 0 && Number(fila[0]) === claseId);

    if (indiceFila === -1) {
      throw new Error('Clase no encontrada');
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,

      range: 'Clases!J' + (indiceFila + 1),

      valueInputOption: 'USER_ENTERED',

      requestBody: {
        values: [[cuposDisponibles]],
      },
    });

    return {
      mensaje: 'Cupos disponibles actualizados',
    };
  }

  async eliminar(claseId: number) {
    const sheets = await this.obtenerSheets();

    const respuesta = await sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,

      range: this.range,
    });

    const filas = respuesta.data.values || [];

    const indiceFila = filas.findIndex((fila, indice) => indice > 0 && Number(fila[0]) === claseId);

    if (indiceFila === -1) {
      throw new Error('Clase no encontrada');
    }

    const informacion = await sheets.spreadsheets.get({
      spreadsheetId: this.spreadsheetId,

      fields: 'sheets.properties',
    });

    const hoja = informacion.data.sheets?.find((item) => item.properties?.title === 'Clases');

    if (hoja?.properties?.sheetId === undefined || hoja?.properties?.sheetId === null) {
      throw new Error('Hoja Clases no encontrada');
    }

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: this.spreadsheetId,

      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: hoja.properties.sheetId,

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
      mensaje: 'Clase eliminada correctamente',
    };
  }
}
