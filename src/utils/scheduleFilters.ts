import { parseDateLike, type DateLike } from './dates';

/** Deporte y rango de fechas del formulario de getaway. */
export interface ScheduleFilters {
  startDate?: string;
  endDate?: string;
  sport?: string;
}

/** Lo mínimo que necesita un torneo/ladder para poder filtrarse. */
export interface FilterableSchedule {
  sport?: unknown;
  /** Se acepta sin tipar: los payloads llegan con index signature `unknown`. */
  start?: unknown;
  end?: unknown;
}

const sameSport = (value: unknown, sport?: string): boolean => {
  if (!sport) return true;
  if (typeof value !== 'string' || value.trim() === '') return true; // sin deporte → no se descarta
  return value.trim().toLowerCase() === sport.trim().toLowerCase();
};

/**
 * Solapamiento de rangos: el evento entra si empieza antes de que acabe el
 * getaway y acaba después de que empiece. Un extremo ausente no descarta nada.
 */
const overlapsRange = (item: FilterableSchedule, filters: ScheduleFilters): boolean => {
  const from = parseDateLike(filters.startDate);
  const to = parseDateLike(filters.endDate);
  const start = parseDateLike(item.start as DateLike);
  const end = parseDateLike(item.end as DateLike);

  if (to && start && start.getTime() > to.getTime()) return false;
  if (from && end && end.getTime() < from.getTime()) return false;

  return true;
};

/**
 * Filtra por el deporte y las fechas del getaway.
 * OJO: es filtrado en cliente — los endpoints `/tornament/getaways` y
 * `/ladder/getaways` devuelven todo y no aceptan query params todavía.
 */
export const matchesScheduleFilters = (
  item: FilterableSchedule,
  filters: ScheduleFilters
): boolean => sameSport(item.sport, filters.sport) && overlapsRange(item, filters);
