# Mapa de pantallas de Mi Dojo

Las rutas están en `apps/web/src/pages/`. El contenido interactivo de cada pantalla está en `apps/web/src/components/pantallas/`.

| Pantalla | Ruta | Archivo en `pages/` | Archivo en `components/pantallas/` |
| --- | --- | --- | --- |
| Entrada al login | `/` | `index.astro` | Redirige a `/login` |
| Clases | `/clases` | `clases.astro` | `Clases.jsx` |
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

`pages/formulario-generado.astro` es un alias de compatibilidad: renderiza `compartir-convocatoria.astro`, sin duplicar su contenido ni perder parámetros como `?clase=ID`.

La ruta principal `/` lleva siempre al login. Al iniciar sesión se abre `/clases`, salvo que haya una pantalla privada pendiente en `?volver=...`. Las páginas privadas solo se muestran después de comprobar la sesión; si la comprobación falla, llevan al login. La creación de clases está en `/nueva-clase`.

La dirección pública `/formulario?clase=ID` se conserva para que sigan funcionando los QR compartidos.

## Backend y código compartido

La API conserva la convención de NestJS por módulo: `apps/api/src/clases/`, `profesores/` y `auth/`. Dentro de cada módulo, los sufijos `.controller.ts`, `.service.ts`, `.module.ts`, `.dto.ts` y `.repository.ts` indican la función del archivo. Los tipos y estados comunes están en `packages/shared/src/`.
