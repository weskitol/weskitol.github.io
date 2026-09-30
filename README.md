# weskitol-web

Sitio estático del canal de clips **Weskitol**, pensado para GitHub Pages. Existe para cumplir lo que
piden Google (pantalla de consentimiento OAuth de la app **Weskitol Clips**) y TikTok for Developers:
página principal, política de privacidad, términos y una URL de redirección con https.

| Archivo | Qué es |
|---|---|
| `index.html` | Qué es Weskitol, enlaces a YouTube y TikTok, crédito a Westcol, qué hace Weskitol Clips y sus permisos. |
| `privacidad.html` | Política de privacidad: permisos, qué se guarda, Limited Use de Google, API de YouTube, borrado y cómo revocar. |
| `terminos.html` | Términos de uso del sitio y de la herramienta, contenido de terceros, contacto. |
| `tiktok/callback.html` + `callback.js` | Retorno de OAuth de TikTok: muestra `code`, `state`, `scopes` o `error` para copiarlos. No envía nada (CSP con `connect-src 'none'`). |
| `404.html` | Página de error. Lleva el CSS dentro porque GitHub Pages la sirve en cualquier ruta. |
| `estilos.css`, `favicon.svg`, `.nojekyll` | Estilos, icono y aviso a GitHub para servir los archivos tal cual. |

No hay recursos externos (ni CDN ni fuentes remotas) y solo `callback.html` usa JavaScript.

## Antes de publicar

1. **Correo de contacto.** Cambia el marcador en todos los archivos:
   ```bash
   grep -rl --include='*.html' 'weskitol.clips@gmail.com' . | xargs sed -i 's/weskitol.clips@gmail.com/tu-correo@dominio.com/g'
   ```
2. **Tokens cifrados.** La política dice que los tokens se guardan *cifrados en reposo*. Hoy
   `westcol-clips` guarda `secretos/youtube.json` en claro (con permisos 600). Cífralo antes de
   publicar o cambia esa frase en `privacidad.html` (secciones «En pocas palabras», 5 y 12).

## Publicar en GitHub Pages

Lo recomendado es un **sitio de usuario u organización**: repositorio `weskitol.github.io`, que queda
en la raíz `https://weskitol.github.io/`. Así Google puede verificar el dominio y la 404 funciona tal
cual. (Como sitio de proyecto, `https://weskitol.github.io/<repo>/`, también sirve, pero hay que
cambiar los enlaces `/` de `404.html` por `/<repo>/` y la verificación del dominio se complica.)

```bash
git remote add origin git@github.com:weskitol/weskitol.github.io.git
git push -u origin main
```

En GitHub: **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)`**, y
marca **Enforce HTTPS**. Tarda unos minutos en salir.

## Qué poner en Google (Google Auth Platform → Marca)

| Campo | Valor |
|---|---|
| Nombre de la app | `Weskitol Clips` (igual que en la página principal) |
| Página principal | `https://weskitol.github.io/` |
| Política de privacidad | `https://weskitol.github.io/privacidad.html` |
| Condiciones del servicio | `https://weskitol.github.io/terminos.html` |
| Dominio autorizado | `weskitol.github.io` |

`github.io` está en la lista de sufijos públicos, así que el dominio autorizado es
`weskitol.github.io` y no `github.io`. Google pide **verificar la propiedad** en
[Search Console](https://search.google.com/search-console): propiedad de tipo *Prefijo de URL* con
`https://weskitol.github.io/` y método *Archivo HTML* (sube el `google….html` a la raíz del repo), con
la misma cuenta de Google que administra el proyecto de Cloud. Si Google no acepta el subdominio de
GitHub, usa un dominio propio del canal como dominio personalizado de Pages y autoriza ese dominio.

## Qué poner en TikTok for Developers

| Campo | Valor |
|---|---|
| Web / Website URL | `https://weskitol.github.io/` |
| Terms of Service URL | `https://weskitol.github.io/terminos.html` |
| Privacy Policy URL | `https://weskitol.github.io/privacidad.html` |
| Redirect URI (Login Kit, Web) | `https://weskitol.github.io/tiktok/callback.html` |

Productos: **Login Kit** y **Content Posting API**. Permisos: `user.info.basic`, `video.upload`,
`video.publish`. La URL de redirección debe coincidir exacta (https, sin parámetros). El `code` que
muestra la página caduca en minutos y sirve una sola vez. Si el portal pide verificar la propiedad
del sitio, sube a la raíz del repo el archivo que te dé TikTok.

## Probar en local

```bash
python3 -m http.server 8080 --bind 127.0.0.1
# http://127.0.0.1:8080/tiktok/callback.html?code=PRUEBA&state=abc&scopes=user.info.basic,video.publish
# http://127.0.0.1:8080/tiktok/callback.html?error=access_denied&error_description=El+usuario+cancel%C3%B3
```
