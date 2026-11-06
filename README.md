# SDroiMod Save Inspector (prototipo)

El sitio procesa archivos completamente en el navegador. El archivo seleccionado no se sube a un backend.

## Alcance actual
- Inspección de encabezados y directorio ZIP para `.sdroimod` / `.zip`, con límites de tamaño/entradas. No se descomprime ni descifra contenido.
- Vista/edición genérica de JSON y texto UTF-8 con restricciones para enteros inseguros. Las descargas son JSON/texto, no saves validados.
- No modifica ni recompila slots cifrados `.sdroimod`; todavía no se probó con un save real de ida y vuelta.

La APK exacta indica un ZIP con miembros `slot0.player` a `slot2.player` que llevan prefijo `SDMOD_ENC_V1:` y se procesan con AES/ECB/PKCS5Padding. Esta estructura procede de análisis estático del APK; no hay un archivo exportado real con el que verificar descifrado, checksum o campos. No expongas, sustituyas ni importes un guardado experimental en tu slot principal.
