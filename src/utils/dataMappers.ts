import { ApiScheduleEntry, ScheduleRow } from '../types/getaway';

/** Junta hora (00-23) y minuto en un "HH:mm" de 24h, con cero a la izquierda. */
export function formatTime24(hour: string, minute: string): string {
  return `${hour.padStart(2, "0")}:${minute}`;
}

/** true si el rango start→end es válido (end estrictamente después de start).
    Comparación de texto: funciona porque "HH:mm" siempre va con cero a la izquierda. */
export function compareTimes(
  sHour: string, sMin: string,
  eHour: string, eMin: string
): boolean {
  const start = formatTime24(sHour, sMin);
  const end = formatTime24(eHour, eMin);
  return start < end;
}

export function mapScheduleRowsToApiFormat(
  rows: ScheduleRow[]
): ApiScheduleEntry[] {
  return rows.map(row => {
    const formattedDate = row.date;

    const startTime = formatTime24(row.startHour, row.startMinute);
    const endTime = formatTime24(row.endHour, row.endMinute);

    return {
      date: formattedDate,
      startTime: startTime,
      endTime: endTime,
      activity: row.activity,
      location: row.location,
      services: row.services ?? []
    };
  });
}

/** Filas cuya fecha quedó fuera de [startDate, endDate], p.ej. porque el dueño
    acortó el rango después de cargarlas: el calendario ya no las pinta, pero
    seguirían viajando en el payload. */
export function rowsOutsideRange(rows: ScheduleRow[], startDate?: string, endDate?: string): ScheduleRow[] {
  if (!startDate || !endDate) return [];
  return rows.filter((row) => row.date < startDate || row.date > endDate);
}
