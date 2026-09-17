
export type DateLike =
  | { _seconds: number; _nanoseconds?: number }
  | { seconds: number; nanoseconds?: number }
  | Date
  | string
  | number
  | null
  | undefined;

/** Normaliza a Date: Timestamp de Firestore, Date, ms, ISO o DD/MM/YYYY. */
const parseDateLike = (value: DateLike): Date | null => {
  if (value === null || value === undefined || value === '') return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'number') {
    const fromMs = new Date(value);
    return Number.isNaN(fromMs.getTime()) ? null : fromMs;
  }

  if (typeof value === 'object') {
    const seconds =
      '_seconds' in value ? value._seconds : 'seconds' in value ? value.seconds : null;
    if (typeof seconds !== 'number') return null;
    return new Date(seconds * 1000);
  }

  // DD/MM/YYYY (formato de display del backend)
  const ddmmyyyy = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (ddmmyyyy) {
    return new Date(Number(ddmmyyyy[3]), Number(ddmmyyyy[2]) - 1, Number(ddmmyyyy[1]));
  }

  // YYYY-MM-DD → se construye en local para que no se corra un día por zona horaria
  const isoDay = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDay) {
    return new Date(Number(isoDay[1]), Number(isoDay[2]) - 1, Number(isoDay[3]));
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

/** Para mostrar en pantalla. Devuelve '—' si no hay fecha. */
export const firestoreToDate = (ts: DateLike): string => {
  const date = parseDateLike(ts);
  return date ? date.toLocaleDateString() : '—';
};

/**
 * Para rellenar un <input type="date">, que SOLO acepta YYYY-MM-DD.
 * Devuelve '' si no hay fecha (input vacío en vez de valor inválido).
 */
export const firestoreToInputDate = (ts: DateLike): string => {
  const date = parseDateLike(ts);
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
