# Documentación para la entrega

El nombre definitivo del sistema queda a elección del cliente. Estos documentos usan un título neutral y no incluyen datos reales, credenciales ni una aceptación firmada.

- [Guía del administrador](guia-administrador.md): recorrido de operación, profesores, clases, QR, postulaciones y cupos.
- [Respaldo y recuperación](respaldo-recuperacion.md): procedimiento manual, frecuencia propuesta y registro para completar con el responsable.
- [Validación y aceptación](validacion-entrega.md): 18 casos de prueba, registro de resultados, pendientes y condiciones de soporte para acordar con el cliente.

Los PDF y el ZIP están en `apps/web/public/documentos/` y se pueden descargar desde **Usuario > Ajustes > Documentación y entrega**. Para regenerarlos después de editar los Markdown, ejecutar `python3 scripts/generar-documentos-entrega.py` en un entorno con ReportLab instalado. No se requiere Python para ejecutar la aplicación.

## Regla de disponibilidad de profesores

Al crear o editar una clase, la API verifica al mismo profesor por su nombre normalizado, el periodo de fechas, los días semanales y el intervalo horario. Dos sesiones que terminan y empiezan a la misma hora son compatibles. El último día del periodo se incluye, como en el calendario actual. Se comprueba que un día compartido realmente ocurra dentro de la intersección de fechas; no basta con que los periodos se toquen.

La regla se aplica entre sedes, excluye la propia clase al editar y devuelve un conflicto con fecha, sede y horario. En una instancia de la API, las creaciones, ediciones y eliminaciones de clases se ejecutan en orden para comprobar el calendario actualizado. La coordinación no es distribuida: varias réplicas o cambios manuales simultáneos en Sheets requerirían otro mecanismo de bloqueo. Los nombres deben distinguir a cada profesor; todavía no existe una relación por id de profesor en las clases.

## Estado de la entrega

Los documentos dejan pendientes la aprobación del cliente, la asignación de responsables, el acuerdo de soporte, la política definitiva de conservación y un ensayo de recuperación en una copia de su hoja. Generar los documentos no ejecuta copias ni restaura datos. La demostración local y la puesta en producción se validan por separado.
