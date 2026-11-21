# Asadero Ángel

Menú adaptable con vista previa del ticket y apertura de WhatsApp. Los artículos seleccionados viven en memoria hasta que se recarga la página.

## Edición

- `pedido.js` contiene el catálogo, precios en pesos mexicanos, sucursales y sus números de WhatsApp.
- Usa `null` para un precio pendiente. Esos productos se incluyen en el ticket con el importe por confirmar.
- El horario y mapa de Flores Magón quedan pendientes. El teléfono proviene del material del negocio.
- La promoción del miércoles se informa en el menú y se confirma con la sucursal.

## GitHub Pages

Sube los archivos de esta carpeta a la raíz de un repositorio. En **Settings → Pages**, selecciona **Deploy from a branch**, la rama **main** y **/(root)**. Guarda y abre la URL que GitHub muestre en esa misma pantalla.

Para probar localmente, ejecuta `python -m http.server 8000` en esta carpeta y abre `http://localhost:8000`.
