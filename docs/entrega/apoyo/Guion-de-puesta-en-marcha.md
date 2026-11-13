# Guion de puesta en marcha con el cliente

Sistema de gestión de clases · Sesión práctica de 20 minutos

## 1. Objetivo y alcance de la sesión

Se realiza una puesta en marcha práctica: se inicia el sistema, se ejecutan los procesos principales, el cliente realiza acciones y se registran los resultados. El PDF de presentación queda como apoyo visual.

La versión local depende de la computadora que ejecuta frontend y backend y de internet para Google Sheets. El acceso desde otros equipos requiere conexión con esa computadora. La duplicación del iPhone muestra su pantalla en Windows; no publica la aplicación en internet.

## 2. Preparación antes de recibir al cliente

- Iniciar pnpm dev y comprobar el acceso del administrador y la conexión con Google Sheets.
- Verificar profesores, clases y solicitudes ficticias; conservar al menos una solicitud pendiente, una aceptada y una rechazada, y una clase con pocos cupos.
- Confirmar que las fechas de las clases siguen siendo válidas el día de la reunión.
- Realizar una copia de la hoja en Google Drive antes de las pruebas y anotar su ubicación privada.
- Abrir la app en el iPhone desde la dirección de red de la computadora, comprobar el QR y preparar la duplicación por AirPlay.
- Tener descargados en la computadora el guion, la presentación, las capturas y los tres PDF de documentación.
- Activar No molestar en el celular para evitar interrupciones durante la sesión.

## 3. Qué significa hoja de demostración

La hoja de demostración es un archivo de Google Sheets con las pestañas Clases, Profesores y Postulaciones, sus encabezados y datos ficticios. Es el almacenamiento que consulta la aplicación. No es un documento Word ni un PDF.

Si la hoja actual contiene solamente datos ficticios y se utiliza para las pruebas, ya cumple esa función. Para separar pruebas y operación real, se puede hacer una copia y configurar el backend con el identificador de la hoja elegida. Ese cambio se prepara con anticipación, verificando el permiso de Editor de la cuenta de servicio y reiniciando los servicios.

## 4. Mostrar el iPhone en Windows 11

Se utiliza AirPlay con una aplicación receptora compatible instalada en Windows, como AirServer o Reflector. Se revisan su licencia o periodo de prueba y se realiza un ensayo antes de la reunión. La pantalla del iPhone aparece en una ventana de Windows que puede mostrarse en el monitor o proyector.

1. Instalar y abrir el receptor AirPlay en la computadora desde su sitio oficial.
2. Conectar el iPhone y la computadora a la misma red local. Comprobar que el receptor permita la conexión en esa red.
3. En el iPhone, abrir el Centro de control y pulsar Duplicar pantalla.
4. Seleccionar el nombre de la computadora o receptor e introducir el código mostrado, si se solicita.
5. Abrir la aplicación en Safari mediante la dirección de red de la computadora. Probar los toques, el desplazamiento y el formulario antes de la reunión.
6. Si no aparece el receptor, comprobar que esté abierto, que ambos equipos estén en la misma red y que el firewall o la red no impidan AirPlay. Si no se logra conectar, se puede operar desde el navegador de la computadora y mostrar el iPhone directamente.

La duplicación por AirPlay muestra la pantalla; el acceso a la aplicación local utiliza la configuración de red: PUBLIC_API_URL con la IP y puerto 3000, WEB_URL con la misma IP y puerto 4321, y los servicios funcionando. La duplicación se detiene desde Duplicar pantalla > Detener duplicación.

## 5. Recorrido práctico con tiempos orientativos

00:00 a 02:00 — Acceso y objetivo. Se inicia sesión y se explica: El sistema centraliza clases, profesores y postulaciones, y permite controlar las vacantes. Se confirma quién operará el sistema.

02:00 a 04:00 — Profesores. Se registra un profesor ficticio o se usa uno preparado. Se muestra Desactivar y Activar. Se explica que Eliminar quita el registro definitivamente y conserva el nombre en las clases existentes. Una eliminación se puede cancelar para mostrar la confirmación.

04:00 a 08:00 — Clases y disponibilidad. Se consulta una clase y sus detalles. Se crea otra con fechas, duración, días, horario, sede, profesor y cupos. Para probar el control de horarios, se intenta una coincidencia real con una clase existente del mismo profesor y se revisa el aviso. Se corrige el horario y se guarda. Se explica que dos clases consecutivas están permitidas.

08:00 a 10:00 — Calendario y convocatoria. Se localiza la clase en el calendario o en Todas si es futura. Se abre Compartir QR, se copia el enlace y se descarga el PNG. Se explica que la convocatoria abre desde la creación de la clase.

10:00 a 13:00 — Formulario en el celular. Se abre el formulario público y se envían datos ficticios con consentimiento. Se comprueba el número de solicitud. Si hay tiempo, se muestra que una fecha de nacimiento de menor solicita datos del apoderado, sin necesidad de enviar otra solicitud.

13:00 a 16:00 — Revisión y cupos. Se busca la solicitud por nombre o número. Se comprueba que está pendiente y no ha reservado vacante. Se acepta y se verifica la disminución de cupos. Se muestran una solicitud rechazada y una clase completa previamente preparadas.

16:00 a 18:00 — Operación por el cliente. El administrador designado realiza una acción por sí mismo: localizar una clase, compartir su convocatoria o revisar una solicitud. Se observa si entiende la navegación y se anotan las dudas.

18:00 a 20:00 — Cierre de puesta en marcha. Se abre Usuario > Ajustes > Documentación y entrega. Se localiza la guía, se explica quién hará los respaldos y se registran pruebas aprobadas, observaciones y pendientes con el cliente.

## 6. Archivos de apoyo y respaldo de la reunión

- Presentación del proyecto en PDF: permite explicar el objetivo, los procesos y las tecnologías si no se puede usar temporalmente la app.
- Capturas de las pantallas: permiten mostrar clases, calendario, solicitudes, QR y formulario sin depender del servidor.
- Guion de puesta en marcha: contiene el recorrido y las comprobaciones de esta sesión.
- Guía del administrador, respaldo y recuperación, y validación de entrega: sirven para capacitación, operación y registro de resultados.

Estos archivos son un apoyo para la reunión. La copia de los datos es otro respaldo distinto: se realiza en Google Drive o mediante una descarga privada de la hoja. El paquete de apoyo no contiene una copia de Google Sheets, los archivos .env ni la credencial de Google.

## 7. Lista de aceptación y registro del resultado

La opción Lista de pruebas para la entrega de Ajustes descarga el documento titulado Validación y aceptación de entrega. Es la lista de aceptación: contiene 18 casos, campos de identificación, resultados, condiciones de soporte y conformidad.

Se utiliza durante y después de las pruebas. Para cada caso se anota Aprobado, Pendiente u Observado, junto con la fecha y una observación si corresponde. No se considera aprobada la totalidad del sistema únicamente por haber ejecutado este recorrido breve; los casos restantes quedan identificados para completarlos.

## 8. Si el sistema quedará en uso real al terminar

Se confirma en qué computadora y red quedará funcionando, quién la mantendrá encendida y quién operará el sistema. El acceso local deja de estar disponible si se detienen los servicios o se apaga la computadora; el acceso externo permanente requiere un despliegue posterior.

Se acuerda la hoja de operación con datos reales, su propietario, los accesos, las credenciales de administrador, la información inicial y el manejo de datos personales. Se conserva una copia de la hoja de prueba y se realiza la transición de forma controlada, verificando los permisos de la hoja y el funcionamiento de lectura y escritura.

Se registran el responsable de respaldos, el canal de soporte, los pendientes y la conformidad del cliente. Una operación de respaldo y restauración se ensaya en una copia, sin utilizar los datos reales del negocio para la prueba.

## 9. Si ocurre una incidencia durante la sesión

Si falla internet o Google Sheets, se registra el incidente, se muestran los archivos de apoyo y se retoman las pruebas de escritura al recuperar la conexión. Si falla la duplicación, se continúa con la app desde el navegador de la computadora y se muestra el celular directamente cuando sea necesario. La aceptación de un caso que no pudo ejecutarse queda pendiente.
