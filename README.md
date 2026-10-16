# Inversiones Hermanos Carranza S.A.S. - sitio web
HTML + CSS + JS (solo fuentes de Google Fonts). Abre `index.html` o sube la carpeta a cualquier hosting estático.

Estructura: `index.html`, `styles.css`, `js/script.js`, `img/logo.png` (si no existe, el sitio prueba `img/logo/logo.png`), `img/carrusel.jpg` o `img/carrusel/...`.

- Colores y fuentes: variables en `:root` de `styles.css`.
- Carrusel: escribe la ruta exacta en `CONFIG.banner` de `js/script.js`, ej. `["img/carrusel/carrusel.jpg"]`. Con una imagen es banner fijo; si agregas más rutas se vuelve carrusel automático con flechas y puntos. Si lo dejas vacío, el script busca una imagen llamada `carrusel` en `img/carrusel/` e `img/`; si no la encuentra muestra un banner de respaldo.
- Foto de los hermanos: `img/galeria/hermanos.jpg` (acepta png, jpeg, webp). La sección "Conoce a los hermanos Carranza" solo aparece si la foto existe.
- Redes sociales: completa `CONFIG.social.facebook` y `CONFIG.social.instagram` en `js/script.js` cuando tengas las URL oficiales. Mientras estén vacías no se muestran; WhatsApp siempre aparece.
- WhatsApp: el botón WhatsApp del footer abre un selector con los dos números; los botones de cada tarjeta de Contacto abren directo la conversación de esa persona. Números y mensaje se editan en `CONFIG.contacts` y `CONFIG.waMessage` de `js/script.js` (enlaces `https://wa.me/NUMERO?text=MENSAJE`; la persona edita y envía el mensaje ella misma).
- Formulario: el código de validación está en `js/script.js` y solo se activa si agregas un `<form id="form">` en el HTML; abre el correo del usuario (mailto). Para recibir envíos directos se requiere un servicio (Formspree, Netlify Forms, etc.).
