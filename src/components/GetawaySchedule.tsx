import { useMemo } from 'react';
import { Box, Chip, Link, Paper, Stack, Typography } from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';
import { useTranslation } from 'react-i18next';
import { BRAND } from '../theme/colors';
import type { ScheduleService } from '../types/getaway';
import '../App.css';

interface ScheduleItem {
  date: string;
  startTime: string;
  endTime: string;
  activity: string;
  location: string;
  /** Lodging/add-on/amenity enlazados a la actividad. Getaways viejos no lo traen. */
  services?: ScheduleService[];
}

interface GetawayScheduleProps {
  schedule?: ScheduleItem[];
  /** Dirección del getaway: se añade a la búsqueda del mapa para desambiguar
      ubicaciones genéricas como "Cancha central". */
  address?: string;
}

/** La fecha puede venir como string ISO o como Timestamp serializado de Firestore. */
const toDate = (value: unknown): Date | null => {
  if (!value) return null;

  if (typeof value === 'object') {
    const seconds = (value as { _seconds?: number; seconds?: number })._seconds
      ?? (value as { seconds?: number }).seconds;
    if (typeof seconds === 'number') return new Date(seconds * 1000);
  }

  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

/** Clave del día en UTC. El backend guarda la fecha "YYYY-MM-DD" como
    medianoche UTC (`new Date(dateStr)`), así que leerla en hora local la movía
    al día anterior en zonas horarias negativas (p.ej. -04: el 5 salía como 4). */
const dayKey = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/** Enlace de búsqueda en Google Maps para la ubicación de una actividad. */
const mapsHref = (place: string, address?: string): string => {
  const query = [place, address].filter(Boolean).join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
};

const asText = (value: unknown): string => {
  if (!value) return '';
  return typeof value === 'string' ? value : String(toDate(value)?.toLocaleDateString() ?? '');
};

export default function GetawaySchedule({ schedule, address }: GetawayScheduleProps) {
  const { t, i18n } = useTranslation();

  /** Se agrupa por día y se ordena: los días entre sí, y las actividades por hora. */
  const days = useMemo(() => {
    const groups = new Map<string, { date: Date | null; items: ScheduleItem[] }>();

    (schedule ?? []).forEach((item) => {
      const date = toDate(item.date);
      const key = date ? dayKey(date) : asText(item.date) || '—';

      if (!groups.has(key)) groups.set(key, { date, items: [] });
      groups.get(key)!.items.push(item);
    });

    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, group]) => ({
        key,
        date: group.date,
        // startTime viene en 24h con cero a la izquierda ("09:30"), así que ordena bien como texto
        items: [...group.items].sort((a, b) => (a.startTime || '').localeCompare(b.startTime || '')),
      }));
  }, [schedule]);

  if (days.length === 0) {
    return (
      <Typography sx={{ fontStyle: 'italic', color: 'text.secondary', py: 2 }}>
        {t('getawaySchedule.notAvailable')}
      </Typography>
    );
  }

  const weekdayOf = (date: Date | null) =>
    date ? new Intl.DateTimeFormat(i18n.language, { weekday: 'long', timeZone: 'UTC' }).format(date) : '';

  const dateLabelOf = (date: Date | null, fallback: string) =>
    date
      ? new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(date)
      : fallback;

  // Con agendas largas se limita la altura y se hace scroll dentro del bloque,
  // en vez de estirar la página entera.
  const isLong = days.length > 3;

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%', bgcolor: 'transparent',
        ...(isLong && { maxHeight: 560, overflowY: 'auto', pr: 1 }),
      }}
    >
      {days.map((day) => (
        <Box key={day.key} sx={{ mb: 3 }}>
          {/* Cabecera del día */}
          <Stack
            direction="row" spacing={1}
            sx={{
              alignItems: 'baseline',
              justifyContent: 'space-between',
              mb: 1.5, pb: 0.5, pt: 0.5,
              borderBottom: `2px solid ${BRAND.green}`,
              // al hacer scroll, el día en curso se queda visible arriba
              ...(isLong && {
                position: 'sticky', top: 0, zIndex: 1,
                bgcolor: 'background.paper',
              }),
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline', minWidth: 0 }}>
              <Typography
                sx={{ fontWeight: 'bold', color: BRAND.primary, textTransform: 'capitalize' }}
              >
                {weekdayOf(day.date)}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {dateLabelOf(day.date, day.key)}
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
              {t('getawaySchedule.activityCount', { count: day.items.length })}
            </Typography>
          </Stack>

          {/* Actividades del día, en línea de tiempo */}
          {day.items.map((item, index) => {
            const isLast = index === day.items.length - 1;

            return (
              <Stack key={index} direction="row" spacing={2} sx={{ alignItems: 'stretch' }}>
                {/* Horas */}
                <Box sx={{ minWidth: { xs: 52, sm: 68 }, textAlign: 'right', pt: 0.2, flexShrink: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {item.startTime}
                  </Typography>
                  {item.endTime && (
                    <Typography variant="caption" color="text.secondary">
                      {item.endTime}
                    </Typography>
                  )}
                </Box>

                {/* Raíl con el punto de cada actividad */}
                <Box sx={{ position: 'relative', width: 12, display: 'flex', justifyContent: 'center' }}>
                  <Box
                    sx={{
                      width: '2px', bgcolor: 'divider',
                      flexGrow: 1, mt: 1.4,
                      // el último tramo no continúa hacia abajo
                      visibility: isLast ? 'hidden' : 'visible',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute', top: 5,
                      width: 11, height: 11, borderRadius: '50%',
                      bgcolor: BRAND.green, border: `2px solid ${BRAND.primary}`,
                    }}
                  />
                </Box>

                {/* Actividad y ubicación */}
                <Box sx={{ flexGrow: 1, pb: isLast ? 0 : 2.5, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600 }}>
                    {asText(item.activity) || t('getawaySchedule.activity')}
                  </Typography>
                  {item.location && (
                    <Link
                      href={mapsHref(asText(item.location), address)}
                      target="_blank" rel="noopener"
                      underline="hover"
                      sx={{
                        display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 0.3,
                        color: 'text.secondary',
                        ':hover': { color: BRAND.primary },
                      }}
                      title={t('getawaySchedule.openInMaps')}
                    >
                      <PlaceIcon sx={{ fontSize: 16, color: BRAND.primary }} />
                      <Typography variant="body2" component="span">
                        {asText(item.location)}
                      </Typography>
                    </Link>
                  )}
                  {item.services?.some((service) => service.type !== 'amenity') && (
                    <Stack direction="row" spacing={0.5} useFlexGap sx={{ mt: 0.75, flexWrap: 'wrap' }}>
                      {/* la amenity ya es el título de la actividad: solo lodging/add-ons */}
                      {item.services.filter((service) => service.type !== 'amenity').map((service) => (
                        <Chip
                          key={`${service.type}:${service.name}`}
                          size="small" variant="outlined"
                          label={`${service.name} · ${t(`sched.serviceType.${service.type}`)}`}
                          sx={{ borderColor: BRAND.primary, color: BRAND.primary }}
                        />
                      ))}
                    </Stack>
                  )}
                </Box>
              </Stack>
            );
          })}
        </Box>
      ))}
    </Paper>
  );
}
