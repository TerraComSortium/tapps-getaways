import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * React Router no reinicia el scroll al navegar: al entrar a una página nueva
 * conservas la posición de la anterior y apareces a media página.
 *
 * Se respeta el botón "atrás" del navegador (POP), donde lo esperado es volver
 * justo donde estabas. Tampoco actúa si solo cambian los query params.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType === 'POP') return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname, navigationType]);

  return null;
}
