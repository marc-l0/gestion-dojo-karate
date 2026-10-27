# 3. Datos en Google Sheets

Este proyecto **no usa una base de datos**: la API lee y escribe en una hoja de cálculo de Google con la librería `googleapis`. Cada pestaña de la hoja hace de tabla.

## Pestañas y columnas

La **fila 1 de cada pestaña son los encabezados**; el código la omite al leer. El orden de las columnas importa: la API las lee por posición.

### `Clases` (columnas A a M)

| Col | Campo | Notas |
|---|---|---|
| A | `id` | Se genera con `Date.now()` |
| B | `nivel` | |
| C | `sede` | |
| D | `frecuencia` | Días separados por coma: `Lunes, Miércoles` |
| E | `profesor` | Nombre del profesor |
| F | `horaInicio` | |
| G | `horaFin` | |
| H | `tarifa` | Número |
| I | `cupos` | Cupos totales |
| J | `cuposDisponibles` | Se recalcula al aceptar, rechazar o eliminar postulaciones |
| K | `fechaInicio` | `AAAA-MM-DD` |
| L | `duracion` | `1 semana`, `2 semanas`, `3 semanas` o `1 mes` |
| M | `fechaFin` | La calcula la API a partir de `fechaInicio` y `duracion` |

### `Postulaciones` (columnas A a S)

| Col | Campo | Notas |
|---|---|---|
| A | `id` | |
| B | `nombre` | |
| C | `telefono` | |
| D | `correo` | |
| E | `fechaNacimiento` | |
| F | `nombreCompletoApoderado` | Opcional (menores de edad) |
| G | `correoApoderado` | Opcional |
| H | `telefonoApoderado` | Opcional |
| I | `claseId` | Clase a la que postula |
| J–O | `nivel`, `sede`, `profesor`, `frecuencia`, `horaInicio`, `horaFin` | Copia de los datos de la clase al momento de postular |
| P | `estado` | `pendiente`, `aceptado`, `aprobado`, `rechazado` o `ignorado` |
| Q | `fechaPostulacion` | Fecha y hora ISO |
| R | `consentimientoVersion` | Versión del aviso aceptado (`2026-10-27`) |
| S | `consentimientoFecha` | Fecha y hora ISO de la aceptación |

Las postulaciones con estado `aceptado` o `aprobado` descuentan un cupo de la clase.

### `Profesores` (columnas A a C)

| Col | Campo | Notas |
|---|---|---|
| A | `id` | |
| B | `nombre` | |
| C | `estado` | `activo` o `inactivo` |

Los valores de los estados y las duraciones están definidos en `packages/shared/src/enums`, y la forma de cada registro en `packages/shared/src/types/api.ts`.

## Credenciales de la cuenta de servicio

La API entra a la hoja con una **cuenta de servicio** de Google Cloud.

1. En Google Cloud, crea una cuenta de servicio y descarga su llave en formato JSON.
2. Guárdala como `apps/api/credentials/google-service-account.json`.
3. Comparte la hoja de cálculo con el correo de la cuenta de servicio (`...@...iam.gserviceaccount.com`) con permiso de **Editor**.

> ⚠️ La carpeta `credentials/` está en el `.gitignore` y **nunca debe subirse a Git**: el archivo contiene una llave privada. Si alguna vez se sube por error, revoca la llave en Google Cloud y crea otra.

La ruta se escribe como `credentials/google-service-account.json` (relativa), así que la API debe arrancar desde la carpeta `apps/api`. Con `pnpm dev` o `pnpm dev:api` Turborepo ya lo hace por ti.

## Pendiente de mejorar

- El identificador de la hoja de cálculo (`spreadsheetId`) está escrito dentro de los tres repositorios (`clases`, `postulaciones` y `profesores`). Conviene moverlo a una variable de entorno.
- Cada operación vuelve a leer la pestaña completa. Con pocos datos no se nota; si la hoja crece, habrá que optimizarlo.

## Validación de postulaciones

La API valida nombre (3–120 caracteres), correo, teléfono de 9 dígitos y fecha de nacimiento (0–100 años). Los menores de 18 deben incluir nombre, correo y teléfono del apoderado. El consentimiento es obligatorio y se registra en las columnas R y S; añade esos encabezados a una hoja existente. Las filas antiguas pueden dejar esas columnas vacías.

La convocatoria permite postular desde que se crea la clase hasta `fechaFin` inclusive, según la fecha de Perú (`America/Lima`), siempre que haya cupos. `fechaInicio` marca el comienzo de las clases, no la apertura de inscripciones: una clase que empieza el 31 de octubre puede recibir postulaciones el día 27. No se permite postular después del fin ni si faltan fechas o están invertidas. El correo se normaliza y no puede repetirse para la misma clase, incluso si la postulación anterior fue rechazada. Puede usarse para otra clase.

Las postulaciones pendientes no reservan vacante. Aceptar o aprobar consume cupo; rechazar o ignorar lo libera. La API comprueba nuevamente los cupos al aceptar. Las operaciones de postulación y aceptación se serializan por clase dentro de una instancia; Google Sheets no ofrece transacciones y esta protección no coordina varias instancias de la API.

El formulario público admite 5 intentos por IP cada 15 minutos, incluidos los inválidos. El límite vive en memoria y se reinicia con el proceso. No habilites confianza indiscriminada en encabezados de proxy; si se despliega detrás de un proxy, configura sus direcciones de confianza y un almacén compartido de límites antes de usar varias instancias.

El aviso del formulario es un texto inicial para la demo. Antes de usar datos reales, el cliente debe confirmar responsable, contacto para ejercer derechos y plazos de conservación. No representa una validación legal del aviso.
