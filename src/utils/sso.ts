// Recepción de un token de sesión enviado por una app externa (SSO).
// El token esperado es un Firebase Custom Token: se canjea por una sesión real
// con signInWithCustomToken (ver loginWithCustomToken en api/authFirebase).
//
// Transporte soportado: el token puede venir en el fragment (#token=...) o en el
// query (?token=...). Se prefiere el fragment porque NO viaja al servidor ni al
// header Referer. Aceptamos ambos para flexibilidad de la app emisora.

const TOKEN_KEYS = ['token', 'ssoToken'];

/**
 * Lee el token externo de la URL (hash o query) y lo ELIMINA de la barra de
 * direcciones (history/Referer) preservando el resto de la ruta. Devuelve el
 * token una sola vez; en cargas posteriores ya no estará en la URL.
 */
export function consumeSsoToken(): string | null {
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const queryParams = new URLSearchParams(window.location.search.replace(/^\?/, ''));

  let token: string | null = null;
  for (const key of TOKEN_KEYS) {
    token = hashParams.get(key) ?? queryParams.get(key);
    if (token) break;
  }
  if (!token) return null;

  // Limpia el token de la URL conservando los demás parámetros y la ruta.
  for (const key of TOKEN_KEYS) {
    hashParams.delete(key);
    queryParams.delete(key);
  }
  const newQuery = queryParams.toString();
  const newHash = hashParams.toString();
  const newUrl =
    window.location.pathname +
    (newQuery ? `?${newQuery}` : '') +
    (newHash ? `#${newHash}` : '');
  window.history.replaceState({}, document.title, newUrl);

  return token;
}
