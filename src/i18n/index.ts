import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

/**
 * i18n del frontend de getaways.
 *
 * - Idiomas soportados: los mismos 12 que el backend / la app principal.
 * - Los catálogos viven en ./locales/<lang>.json y se cargan automáticamente
 *   con import.meta.glob (Vite) — añadir un idioma = añadir su .json.
 * - El idioma se detecta de localStorage → navegador, con fallback a 'en'.
 *   El mismo código se envía al backend en el header Accept-Language
 *   (ver src/api/api.ts), para que sus errores lleguen también traducidos.
 */

export const SUPPORTED_LANGS = [
  'en',
  'es',
  'ar',
  'zh',
  'de',
  'el',
  'fr',
  'hi',
  'it',
  'ja',
  'nl',
  'pt',
] as const;

export const LANG_LABELS: Record<string, string> = {
  en: 'English',
  es: 'Español',
  ar: 'العربية',
  zh: '中文',
  de: 'Deutsch',
  el: 'Ελληνικά',
  fr: 'Français',
  hi: 'हिन्दी',
  it: 'Italiano',
  ja: '日本語',
  nl: 'Nederlands',
  pt: 'Português',
};

// Carga estática de todos los catálogos de ./locales/*.json
const modules = import.meta.glob('./locales/*.json', { eager: true }) as Record<
  string,
  { default: Record<string, string> }
>;

const resources: Record<string, { translation: Record<string, string> }> = {};
for (const path in modules) {
  const match = path.match(/\/([a-z]{2})\.json$/);
  if (match) {
    resources[match[1]] = { translation: modules[path].default };
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGS as unknown as string[],
    nonExplicitSupportedLngs: true, // es-ES → es
    load: 'languageOnly',
    interpolation: { escapeValue: false }, // React ya escapa
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;
