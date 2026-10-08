import type { Getaway } from '../types/getaway';

export const sportMap: { [key: string]: string } = {
  '1': 'Tennis',
  '2': 'Padel',
  '3': 'Pickleball',
  '4': 'Other'
};

export const getSportLabel = (sportKey: string): string => {
  if (!sportKey) return 'Not available';
  return sportMap[sportKey] || sportKey || 'Not available';
};

export const normalizeGetawayData = (raw: any): Getaway => {
  return {
    ...raw,
    _id: raw._id || raw.id || `temp_${Math.random()}`,
    title: raw.title || raw.getawayTitle || "Untitled Offer",
    overview: raw.overview || raw.getawayOverview || "",
    startDate: parseFirestoreDate(raw.startDate, { calendarDay: true }),
    endDate: parseFirestoreDate(raw.endDate, { calendarDay: true }),
    sport: raw.sport || "",
    // price: Number(raw.price) || 0,
    galleryPhotos: raw.galleryPhotos || raw.galleryPhoto || [],

    lodgingOptions: raw.lodgingOptions || [],
    optionalAddOns: raw.optionalAddOns || [],
    amenities: raw.amenities || [],
    schedule: raw.schedule?.map((item: any) => ({
      ...item,
      date: parseFirestoreDate(item.date, { calendarDay: true })
    })) || [],
    caption: raw.caption || "",
    galleryVideo: raw.galleryVideo || "",
    mainDescription: raw.mainDescription || raw.getawayOverview || "",
    policies: raw.policies || "",
    terms: raw.terms || "",

    getawayAddress: raw.getawayAddress || { address: raw.address || "", lat: raw.location?.lat || 0, lng: raw.location?.lng || 0 }
  };
};

export const getStartingPrice = (
  lodgingOptions: { name: string; price: number }[]
): number => {
  // price puede venir como string desde Firestore ("250"): se normaliza a número.
  const prices = (lodgingOptions ?? []).map((o) => Number(o.price)).filter((p) => Number.isFinite(p) && p >= 0);
  return prices.length > 0 ? Math.min(...prices) : 0;
};

export const performFallbackLocalSearch = (
  rawData: any[],
  filters: { q?: string; sport?: string; startDate?: string | null; endDate?: string | null }
): Getaway[] => {
  let results = rawData.map(normalizeGetawayData);

  if (filters.q?.trim()) {
    const term = filters.q.trim().toLowerCase();
    results = results.filter(g =>
      g.getawayAddress?.address.toLowerCase().includes(term) ||
      g.title.toLowerCase().includes(term)
    );
  }

  if (filters.sport?.trim()) {
    const label = getSportLabel(filters.sport).toLowerCase();
    results = results.filter(g => getSportLabel(g.sport).toLowerCase() === label);
  }

  if (filters.startDate?.trim()) {
    results = results.filter(g => !g.startDate || g.startDate >= filters.startDate!);
  }

  if (filters.endDate?.trim()) {
    results = results.filter(g => !g.endDate || g.endDate <= filters.endDate!);
  }

  return results;
};

export const getValidImages = (photos: string[] | undefined): string[] => {
  if (!photos || !Array.isArray(photos) || photos.length === 0) return [];
  return photos.filter(url => url && typeof url === 'string' && url.length > 5);
};

// True si el getaway ya terminó: sigue activo todo el día de su endDate y vence
// al día siguiente (mismo criterio que el backend, `libs/offerExpiry.ts`).
// Sin endDate válido → false (no se bloquea).
export const isGetawayExpired = (getaway: { endDate?: any } | null | undefined): boolean => {
  if (!getaway?.endDate) return false;
  const end = new Date(getaway.endDate);
  if (isNaN(end.getTime())) return false;
  // endDate llega ya normalizado ("Oct 1, 2026"): se compara contra hoy por día, en local.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return end < today;
};

export const formatGetawayDates = (start: any, end: any): string => {
  //validation
  const startStr = typeof start === 'string' ? start.trim() : (start instanceof Date ? start.toLocaleDateString() : "");
  const endStr = typeof end === 'string' ? end.trim() : (end instanceof Date ? end.toLocaleDateString() : "");

  if (startStr && endStr) return `${startStr} - ${endStr}`;
  if (startStr) return `Starts: ${startStr}`;
  if (endStr) return `Ends: ${endStr}`;

  return "No dates available";
};

/**
 * `calendarDay`: la fecha es un DÍA del calendario (inicio/fin del getaway, días
 * del schedule), que el backend guarda como medianoche UTC. Se formatea en UTC
 * para que en zonas horarias negativas no se muestre el día anterior.
 * Sin la opción (p.ej. `subscribedAt`, un instante real) se formatea en local.
 */
export const parseFirestoreDate = (
  rawDate: unknown,
  { calendarDay = false }: { calendarDay?: boolean } = {}
): string => {
  if (!rawDate) return "";
  const timeZone = calendarDay ? 'UTC' : undefined;
  try {
    //if valid date is string, return
    if (typeof rawDate === 'string') {
      const date = new Date(rawDate);
      if (isNaN(date.getTime())) return "";
      // Un texto ya formateado ("Oct 1, 2026", p.ej. al normalizar dos veces) se
      // interpreta en local: pasarlo a UTC lo correría un día en zonas positivas.
      const isIsoDate = /^\d{4}-\d{2}-\d{2}/.test(rawDate);
      return formatDate(date, isIsoDate ? timeZone : undefined);
    }

    //timestamp firestore
    if (typeof rawDate === 'object' && rawDate !== null) {
      const ts = rawDate as Record<string, unknown>;
      const secs = (ts.seconds ?? ts._seconds) as number | undefined;
      if (secs !== undefined) {
        return formatDate(new Date(secs * 1000), timeZone);
      }
    }
    // Date native
    if (rawDate instanceof Date) {
      return isNaN(rawDate.getTime()) ? "" : formatDate(rawDate, timeZone);
    }
    return "";
  } catch {
    return "";
  }
}
function formatDate(date: Date, timeZone?: string): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone,
  });
}

/**
 * Días del getaway entre dos fechas "YYYY-MM-DD", contando inicio y fin
 * (del 21 al 25 = 5 días). 0 si falta alguna o el rango es inválido.
 * Se calcula en UTC para que la zona horaria no reste o sume un día.
 */
export const countGetawayDays = (startDate?: string, endDate?: string): number => {
  if (!startDate || !endDate) return 0;
  const start = Date.parse(`${startDate.slice(0, 10)}T00:00:00Z`);
  const end = Date.parse(`${endDate.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return 0;
  return Math.round((end - start) / 86_400_000) + 1;
};
