import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface SidebarState {
  /** Drawer del sidebar abierto (solo aplica en móvil). */
  mobileOpen: boolean;
  openMobile: () => void;
  closeMobile: () => void;
  /** true cuando la ruta actual monta un sidebar; el navbar pinta el botón solo entonces. */
  hasSidebar: boolean;
  setHasSidebar: (value: boolean) => void;
  /**
   * Bloquea la navegación del sidebar. Se activa durante operaciones que no
   * deben interrumpirse a medias, como el cobro de una reserva.
   */
  locked: boolean;
  setLocked: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarState>({
  mobileOpen: false,
  openMobile: () => {},
  closeMobile: () => {},
  hasSidebar: false,
  setHasSidebar: () => {},
  locked: false,
  setLocked: () => {},
});

/**
 * Comparte el estado del sidebar entre el Navbar (que pinta el botón de menú en
 * móvil) y AdminLayout (que monta el Drawer). Son hermanos en el árbol, así que
 * necesitan un contexto común por encima de ambos.
 */
export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hasSidebar, setHasSidebar] = useState(false);
  const [locked, setLocked] = useState(false);

  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  // useMemo: sin él, el objeto sería nuevo en cada render y re-renderizaría a
  // todos los consumidores aunque el estado no haya cambiado.
  const value = useMemo(
    () => ({ mobileOpen, openMobile, closeMobile, hasSidebar, setHasSidebar, locked, setLocked }),
    [mobileOpen, openMobile, closeMobile, hasSidebar, locked]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
};

export const useSidebar = () => useContext(SidebarContext);
