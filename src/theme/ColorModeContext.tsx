import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ThemeProvider, type PaletteMode } from '@mui/material';
import { createAppTheme } from './theme';

interface ColorModeContextValue {
  mode: PaletteMode;
  toggleColorMode: () => void;
}

const ColorModeContext = createContext<ColorModeContextValue>({
  mode: 'light',
  toggleColorMode: () => {},
});

// Hook para leer/cambiar el modo de color desde cualquier componente.
export const useColorMode = () => useContext(ColorModeContext);

const STORAGE_KEY = 'colorMode';

// Provee el tema MUI (claro/oscuro) a toda la app. NO incluye <CssBaseline>
// a propósito, para no pisar el CSS global existente (App.css/index.css).
export function ColorModeProvider({ children }: { children: ReactNode }) {
  // Temporal: fijado en modo claro (toggle deshabilitado en el Navbar).
  // Para reactivar el tema, restaurar: () => (localStorage.getItem(STORAGE_KEY) as PaletteMode) || 'light'
  const [mode, setMode] = useState<PaletteMode>('light');

  const toggleColorMode = () => {
    setMode((prev) => {
      const next: PaletteMode = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  };

  // Sincroniza el modo con la capa CSS: <html data-theme="dark"> activa el bloque
  // :root[data-theme="dark"] de index.css y flipea las variables --bg/--text.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={{ mode, toggleColorMode }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ColorModeContext.Provider>
  );
}
