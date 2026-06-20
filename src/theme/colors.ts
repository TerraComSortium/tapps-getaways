// Tokens de color que apuntan a las CSS variables definidas en index.css.
// Úsalos en `sx`, `styled()` o cualquier estilo inline → consumen la variable CSS
// (y flipean en modo oscuro los que correspondan). FUENTE de los valores: index.css.
export const BRAND = {
  primary: 'var(--brand-primary)',
  primaryDark: 'var(--brand-primary-dark)',
  primaryLight: 'var(--brand-primary-light)',
  purpleBg: 'var(--brand-purple-bg)',
  green: 'var(--brand-green)',
  greenDark: 'var(--brand-green-dark)',
  lime: 'var(--brand-lime)',
  limeAlt: 'var(--brand-lime-alt)',
  navy: 'var(--brand-navy)',
  white: 'var(--brand-white)',
  black: 'var(--brand-black)',
  // superficie/texto que cambian en oscuro
  bgDefault: 'var(--bg-default)',
  bgPaper: 'var(--bg-paper)',
  textPrimary: 'var(--text-primary)',
} as const;

// Valores HEX crudos — SOLO para la paleta de MUI (primary/secondary), porque MUI
// necesita un color real para derivar light/dark/contrastText (no acepta var()).
// Deben coincidir con los de index.css.
export const BRAND_HEX = {
  primary: '#3C1C91',
  primaryDark: '#300E8E',
  primaryLight: '#5B2BD6',
  purpleBg: '#371984',
  green: '#00E392',
  lime: '#C9F305',
  navy: '#1A2660',
  white: '#ffffff',
} as const;

// Fondos/texto por modo (hex reales para la paleta de MUI; deben coincidir con index.css).
export const SURFACE_HEX = {
  light: { bgDefault: '#ffffff', bgPaper: '#ffffff', textPrimary: '#1A2660' },
  dark: { bgDefault: '#0E0A1F', bgPaper: '#171229', textPrimary: '#ffffff' },
} as const;
