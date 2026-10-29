# Mapa de pantallas de Mi Dojo

Las rutas están en `apps/web/src/pages/`. El contenido interactivo de cada pantalla está en `apps/web/src/components/pantallas/`.

| Pantalla | Ruta | Archivo en `pages/` | Archivo en `components/pantallas/` |
| --- | --- | --- | --- |
| Clases (inicio) | `/` | `index.astro` | `Clases.jsx` |
| Nueva clase | `/nueva-clase` | `nueva-clase.astro` | `NuevaClase.jsx` |
| Postulaciones | `/postulaciones` | `postulaciones.astro` | `Postulaciones.jsx` |
| Calendario | `/calendario` | `calendario.astro` | `Calendario.jsx` |
| Profesores | `/profesores` | `profesores.astro` | `Profesores.jsx` |
| Usuario | `/usuario` | `usuario.astro` | `Usuario.jsx` |
| Ajustes | `/ajustes` | `ajustes.astro` | `Ajustes.jsx` |
| Configurar convocatoria | `/configurar-convocatoria` | `configurar-convocatoria.astro` | `ConfigurarConvocatoria.jsx` |
| Compartir convocatoria | `/compartir-convocatoria` | `compartir-convocatoria.astro` | `CompartirConvocatoria.jsx` |
| Formulario de postulación público | `/formulario?clase=ID` | `formulario.astro` | `FormularioPostulacion.jsx` |
| Iniciar sesión | `/login` | `login.astro` | `Login.jsx` |

## Componentes compartidos

En `apps/web/src/components/` quedan las piezas que pueden usarse en varias pantallas:

- `NavegacionInferior.astro`: barra inferior.
- `ProtegerPagina.astro`: comprobación de sesión de las páginas privadas.
- `CerrarSesion.astro`: botón para cerrar sesión.
- `InicializarTema.astro`: aplica el tema guardado antes de mostrar la página.
- `TarjetaClase.jsx` e `IndicadorCupos.jsx`: resumen de una clase y disponibilidad.
- `QrFormulario.jsx` y `CopiarEnlace.jsx`: QR y copia de enlaces.
- `Mensaje.jsx`: avisos de éxito y error.

`apps/web/src/layouts/LayoutAdministracion.astro` reúne el encabezado, la navegación y la protección de las pantallas privadas. Los hooks permanecen en `hooks/`, las utilidades en `lib/` y los estilos en `styles/`.

## Enlaces anteriores

`pages/clases.astro` y `pages/formulario-generado.astro` son alias de compatibilidad: renderizan las páginas nuevas, sin duplicar su contenido ni perder parámetros como `?clase=ID`. Para modificar esas pantallas, editar `nueva-clase.astro` o `compartir-convocatoria.astro` y sus componentes.

La dirección pública `/formulario?clase=ID` se conserva para que sigan funcionando los QR compartidos.

## Backend y código compartido

La API conserva la convención de NestJS por módulo: `apps/api/src/clases/`, `profesores/` y `auth/`. Dentro de cada módulo, los sufijos `.controller.ts`, `.service.ts`, `.module.ts`, `.dto.ts` y `.repository.ts` indican la función del archivo. Los tipos y estados comunes están en `packages/shared/src/`.
