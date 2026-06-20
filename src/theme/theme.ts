import { createTheme, type PaletteMode } from '@mui/material/styles';
import { BRAND_HEX, SURFACE_HEX } from './colors';

// Colores de marca extra accesibles desde el tema: theme.palette.brand.*
declare module '@mui/material/styles' {
  interface Palette {
    brand: { green: string; lime: string; navy: string; purpleBg: string };
  }
  interface PaletteOptions {
    brand?: { green: string; lime: string; navy: string; purpleBg: string };
  }
}

// IMPORTANTE: la paleta de MUI debe usar HEX reales (no var()), porque MUI aplica
// alpha()/lighten()/darken() → decomposeColor() y eso NO acepta var(--...).
// Las CSS variables se usan en la capa CSS y en los BRAND.* dentro de `sx`.
export const createAppTheme = (mode: PaletteMode) => {
  const surface = SURFACE_HEX[mode];
  return createTheme({
    palette: {
      mode,
      primary: {
        main: BRAND_HEX.primary,
        dark: BRAND_HEX.primaryDark,
        light: BRAND_HEX.primaryLight,
        contrastText: BRAND_HEX.white,
      },
      secondary: { main: BRAND_HEX.green, contrastText: BRAND_HEX.navy },
      brand: {
        green: BRAND_HEX.green,
        lime: BRAND_HEX.lime,
        navy: BRAND_HEX.navy,
        purpleBg: BRAND_HEX.purpleBg,
      },
      background: { default: surface.bgDefault, paper: surface.bgPaper },
      text: { primary: surface.textPrimary },
    },
  });
};
