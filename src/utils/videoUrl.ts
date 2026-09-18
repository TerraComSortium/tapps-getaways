/**
 * Convierte un enlace de YouTube o Vimeo al formato **embebible** en un iframe.
 *
 * Es necesario porque el formulario de creación acepta el enlace que uno copia
 * del navegador (`youtube.com/watch?v=...`, `youtu.be/...`, `/shorts/...`), y
 * YouTube **bloquea esas URLs dentro de un iframe** con `X-Frame-Options`: se ve
 * un recuadro gris con "Video unavailable". Solo funciona `/embed/<id>`.
 * Con Vimeo pasa igual: hace falta `player.vimeo.com/video/<id>`.
 */

const YOUTUBE_ID = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
const VIMEO_ID = /vimeo\.com\/(?:video\/)?(\d+)/;

/**
 * Devuelve la URL lista para el `src` del iframe, o null si no se reconoce el
 * proveedor (así quien la use puede decidir no pintar el reproductor).
 */
export const toEmbedUrl = (rawUrl?: string | null): string | null => {
  if (!rawUrl || typeof rawUrl !== 'string') return null;

  const url = rawUrl.trim();
  if (!url) return null;

  const youtube = url.match(YOUTUBE_ID);
  if (youtube) return `https://www.youtube.com/embed/${youtube[1]}`;

  const vimeo = url.match(VIMEO_ID);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;

  return null;
};
