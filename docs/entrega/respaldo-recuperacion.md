# Respaldo y recuperación de datos

Sistema de gestión de clases · Procedimiento manual

## 1. Responsables y frecuencia

Designar un responsable del negocio para las copias y un responsable técnico para la recuperación. Este documento describe un procedimiento manual: debe ejecutarlo la persona asignada; la aplicación no programa copias automáticas.

Realizar una copia al finalizar cada jornada con cambios, antes de eliminar información importante y antes de una restauración. Registrar fecha, responsable y ubicación. Conservar inicialmente las últimas 7 copias diarias y 4 semanales, sujeto a aprobación del cliente y su política de conservación de datos.

## 2. Qué debe respaldarse

- La hoja completa de Google Sheets con las pestañas Clases, Profesores y Postulaciones, incluyendo encabezados, identificadores y todas las columnas existentes.
- El código fuente y la versión entregada, conservados en el repositorio del proyecto.
- La configuración necesaria para reconstruir el entorno: archivos .env del frontend y backend, y la credencial de Google, si se utiliza un archivo JSON. Guardarlos separadamente en una ubicación privada y protegida, fuera del repositorio.

No copiar contraseñas o claves dentro de la hoja de datos ni enviarlas en la documentación pública. Los respaldos contienen datos personales de postulantes y apoderados: limitar su acceso al personal autorizado.

## 3. Crear la copia en Google Drive

1. Avisar que se realizará el respaldo y evitar altas, cambios de estado y eliminaciones mientras se verifica la copia.
2. Abrir la hoja utilizada por el sistema con la cuenta propietaria o una cuenta autorizada.
3. Elegir Archivo > Hacer una copia. Usar un nombre como Respaldo_Sistema_2026-11-12_1830.
4. Guardarla en la carpeta privada de respaldos del negocio. Revisar los permisos de la copia y limitar el acceso.
5. Abrir la copia y comprobar las tres pestañas, sus encabezados y algunos registros de cada una. No modificar el orden de las columnas.
6. Anotar fecha, responsable, enlace privado y cantidad de registros por pestaña en el registro de respaldos. Si existen solicitudes de menores, verificar también sus columnas de apoderado y consentimiento.

Como copia adicional puede usar Archivo > Descargar > Microsoft Excel (.xlsx). Guarde el archivo en un almacenamiento privado autorizado. La copia en Drive es el respaldo principal para este procedimiento.

## 4. Restaurar una versión anterior en la misma hoja

1. Detener el uso del sistema y el backend para evitar escrituras durante la recuperación. En la demostración local, detener pnpm dev con Ctrl+C.
2. Hacer primero una copia de la hoja actual, aunque contenga errores. Registrar el incidente y qué información se pretende recuperar.
3. En la hoja original, abrir Archivo > Historial de versiones > Ver historial de versiones. Identificar una versión anterior al incidente y revisar su contenido. La disponibilidad del historial depende de los permisos y de las versiones conservadas por Google.
4. Restaurar la versión elegida. Este paso revierte la hoja completa: revisar si se perderían cambios posteriores válidos antes de confirmar.
5. Comprobar Clases, Profesores y Postulaciones, incluidos identificadores, relaciones, cupos y consentimientos. Como se conserva la misma hoja, su identificador no cambia.
6. Reiniciar el sistema y efectuar las comprobaciones del apartado 6 antes de reabrirlo a los usuarios.

## 5. Recuperar desde una copia de Drive

1. Detener el uso del sistema y crear una copia del estado actual como medida de conservación.
2. El responsable técnico selecciona una copia verificada y comprueba que las pestañas, columnas e identificadores se mantengan intactos.
3. Si se cambia a otra hoja, compartirla con el correo de la cuenta de servicio de Google con permiso de edición. Actualizar GOOGLE_SPREADSHEET_ID en la configuración privada del backend y reiniciarlo.
4. Conservar los identificadores de las clases y solicitudes para mantener sus relaciones. Evitar mezclar filas de respaldos de momentos distintos sin revisar las referencias.
5. Mantener la hoja anterior apartada para poder investigar y volver atrás si fuera necesario. Actualizar el registro de recuperación con la copia utilizada y la autorización del responsable.

Si se recupera desde un archivo Excel, el responsable técnico debe convertirlo a Google Sheets y validar fechas, números, nombres de pestañas y orden de todas las columnas antes de conectarlo al sistema.

## 6. Comprobaciones antes de reabrir

- Iniciar sesión y comprobar que aparecen clases y profesores esperados.
- Revisar al menos una solicitud pendiente y una aceptada, si existen, y verificar los cupos correspondientes.
- Abrir un enlace de convocatoria y comprobar que corresponde a la clase restaurada.
- En una copia de prueba, registrar una solicitud ficticia para verificar la escritura; no usar datos de clientes para el ensayo.
- Confirmar con el responsable del negocio los datos recuperados y cualquier cambio válido que necesite reingresarse.

Una restauración debe ensayarse en una copia de prueba antes de la entrega. Registrar su resultado; este documento por sí solo no acredita que el ensayo se haya realizado en la hoja del cliente.

## 7. Registro de respaldo y recuperación

Fecha y hora: ______________________________________________

Responsable: _________________________________________________

Tipo de operación y motivo: ___________________________________

Ubicación privada del respaldo: _______________________________

Registros verificados por pestaña: ____________________________

Resultado y pendientes: _______________________________________

Autorización para reabrir el sistema: __________________________
