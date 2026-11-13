# Validación y aceptación de entrega

Sistema de gestión de clases · Documento para completar con el cliente

## 1. Identificación de la entrega

Cliente / negocio: ____________________________________________

Nombre definitivo del sistema: ________________________________

Responsable del cliente: ______________________________________

Responsable técnico: __________________________________________

Fecha, versión o commit y dirección del sistema: _______________

Entorno de presentación: computadora local / entorno publicado.

Dispositivos y navegadores utilizados: ________________________

Este documento registra la revisión de la versión indicada. Todos los casos comienzan PENDIENTES; la aprobación corresponde al cliente después de ejecutar las pruebas.

## 2. Lista de pruebas de aceptación

Registrar para cada caso: resultado (Aprobado / Pendiente / Observado), fecha y observaciones. Utilizar datos ficticios y una hoja de prueba.

01. Acceso: abrir la dirección principal, comprobar que aparece el login, entrar con credenciales válidas y verificar que una contraseña incorrecta no permite acceder.

02. Protección de sesión: abrir una pantalla administrativa sin sesión y comprobar que solicita iniciar sesión. Cerrar sesión desde Usuario.

03. Profesores: registrar un profesor de prueba, desactivarlo, comprobar que no aparece en Nueva clase y volver a activarlo.

04. Eliminación de profesor: cancelar una eliminación y comprobar que el registro continúa. Confirmar otra eliminación y verificar que desaparece, conservando las clases existentes.

05. Creación de clase: completar fechas, duración, sede, nivel, profesor, días, horas, tarifa y cupos. Guardar y comprobar los datos en Clases y en Calendario.

06. Conflicto de profesor: intentar crear una clase que coincida en día, fecha y hora con otra del mismo profesor. Comprobar el mensaje de conflicto y que no se guarde, incluso si cambia la sede.

07. Horario compatible: crear otra clase del mismo profesor que comience exactamente al terminar la anterior; comprobar que se permite. Probar también otro día o un periodo de fechas sin coincidencia.

08. Edición de clase: guardar sin cambiar su horario y comprobar que no se considera un conflicto consigo misma. Intentar mover otra clase al horario ocupado y verificar que se impide.

09. Menú móvil: desde el celular, abrir los tres puntos, editar y guardar. Comprobar que Eliminar abre la confirmación y que Cancelar conserva la clase.

10. Convocatoria: compartir el enlace de una clase futura, copiarlo, descargar el QR y abrirlo desde otro dispositivo. Verificar que el PNG o la alternativa manual permiten guardar la imagen correcta.

11. Formulario de adulto: enviar una postulación ficticia con consentimiento, comprobar el número de solicitud y su aparición como pendiente. Revisar que la fecha de nacimiento encaje y que las fechas de la clase se muestren en español.

12. Formulario de menor: indicar una fecha de nacimiento de menor de edad, completar datos del apoderado y verificar que son obligatorios. Comprobar el consentimiento correspondiente.

13. Solicitudes: buscar por nombre, correo y número de solicitud; combinar filtros de clase y estado. Aceptar y rechazar solicitudes de prueba.

14. Cupos: comprobar que una pendiente no ocupa vacante, que aceptar disminuye los cupos y que no se permite aceptar una persona adicional cuando la clase está completa.

15. Errores y conexión: interrumpir temporalmente el backend durante una prueba, comprobar el aviso y volver a intentar tras restaurar el servicio. Verificar que un fallo no muestre un éxito inexistente.

16. Apariencia y navegación: revisar en computadora y celular los temas claro, oscuro y automático, la barra inferior, el botón Volver y los campos del formulario.

17. Respaldo y recuperación: con la persona asignada, crear una copia de prueba, verificar las tres pestañas y ensayar la recuperación siguiendo el procedimiento. Registrar el resultado sin alterar datos reales.

18. Capacitación y documentación: el administrador realiza el recorrido principal con la guía, dispone de la documentación entregada y sabe a quién reportar incidencias.

## 3. Registro de resultados

Caso(s) revisado(s): ___________________________________________

Resultado: Aprobado / Pendiente / Observado

Detalle, evidencia o enlace privado: ___________________________

Responsable y fecha: __________________________________________

Repetir este registro para cada caso o adjuntar una hoja de resultados con los números de prueba.

## 4. Condiciones de operación acordadas

Cuenta propietaria de los datos y responsable de acceso: _______

Responsable y frecuencia de respaldos: ________________________

Canal y horario de soporte: ___________________________________

Periodo de soporte incluido y fecha de inicio: ________________

Alcance de correcciones y condiciones para nuevos cambios: _____

Responsable de costos de alojamiento y servicios: ______________

Acuerdo sobre acceso, conservación y eliminación de datos personales: _______________________________________________________

## 5. Pendientes y publicación

Incidencias pendientes, prioridad y fecha acordada: ___________

Nombre, identidad visual y dominio por confirmar: ______________

Para publicar en internet se deben acordar cuentas y costos, configurar frontend y backend, HTTPS y sesiones, permisos de Google y verificar nuevamente los flujos con las direcciones definitivas. La demostración local no acredita por sí sola una puesta en producción.

## 6. Conformidad

Estado de la entrega: Aprobada / Aprobada con pendientes / Pendiente de validación.

Observaciones y compromisos: __________________________________

Nombre, fecha y firma del responsable del cliente: _____________

Nombre, fecha y firma del responsable técnico: _________________

No completar esta sección como aprobada sin la revisión y conformidad del cliente.
