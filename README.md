# helpgit

Guía visual de acceso para la plataforma Git de Núcleo Linux UAGRM.

Sitio estático (HTML + CSS + JS), sin dependencias ni build.

## Contenido

Guía paso a paso para crear una cuenta, esperar la aprobación, iniciar sesión
y protegerla con autenticación de dos factores (2FA) usando Aegis Authenticator.

## Estructura

- `public/` — sitio listo para publicar
  - `index.html` — página principal con los 6 pasos y la sección de ayuda
  - `css/styles.css` — estilos (modo claro/oscuro, responsive, animaciones)
  - `js/main.js` — tema, progreso, animaciones de scroll, QR ilustrativo
  - `favicon.svg` — favicon
  - `.nojekyll` — evita el procesamiento de Jekyll en GitHub Pages
- `.github/workflows/deploy.yml` — publica `public/` en la rama `public`

## Probar localmente

```sh
cd public
python3 -m http.server 8000
```

Abrir http://localhost:8000

## Despliegue

El sitio se publica en https://help.git.nluagrm.org

El workflow `.github/workflows/deploy.yml` se ejecuta al hacer push a `main`
y publica el contenido de `public/` en la raíz de la rama `public`.

GitHub Pages debe configurarse con:

- Branch: `public`
- Folder: `/` (root)
