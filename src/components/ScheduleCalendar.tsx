import React, { useMemo, useState } from "react";
import { useTranslation } from 'react-i18next';
import { BRAND } from "../theme/colors";
import {
  Box, Paper, Typography, Button,
  TextField, Select, MenuItem, FormControl,
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Chip, Stack, Autocomplete, Alert
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';

import type { ScheduleRow, ScheduleService } from '../types/getaway';
import { compareTimes, rowsOutsideRange } from '../utils/dataMappers';

// 24h: "00".."23", sin AM/PM que interpretar.
const hourOptions = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const minuteOptions = ["00", "15", "30", "45"];
const generateId = () => Math.random().toString(36).substr(2, 9);

type ServiceSource = { name?: string };

type ScheduleCalendarProps = {
  rows: ScheduleRow[];
  setRows: React.Dispatch<React.SetStateAction<ScheduleRow[]>>;
  /** Rango del getaway (startDate/endDate del form): define qué días se pintan. */
  startDate?: string;
  endDate?: string;
  /** Valores actuales de esas 3 secciones del form, para poder enlazarlos a una actividad. */
  lodgingOptions?: ServiceSource[];
  addOns?: ServiceSource[];
  amenities?: ServiceSource[];
};

type DraftErrors = {
  startHour?: string;
  startMinute?: string;
  endHour?: string;
  endMinute?: string;
  activity?: string;
  location?: string;
  timeOrder?: string;
  days?: string;
};

type ActivityDraft = {
  startHour: string;
  startMinute: string;
  endHour: string;
  endMinute: string;
  activity: string;
  location: string;
  services: ScheduleService[];
  /** En qué días (YYYY-MM-DD) se crea esta actividad. Permite cargar algo que
      se repite (p.ej. desayuno) en varios días de una sola vez, en vez de
      reescribirlo día por día. */
  days: string[];
};

const EMPTY_DRAFT: ActivityDraft = {
  startHour: "", startMinute: "",
  endHour: "", endMinute: "",
  activity: "", location: "", services: [], days: [],
};

/** YYYY-MM-DD + n días, en local (evita el corrimiento de zona horaria de Date/toISOString). */
function addDaysToISODate(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d + days);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** Lista de días YYYY-MM-DD entre startDate y endDate, ambos incluidos. */
function buildDayRange(startDate?: string, endDate?: string): string[] {
  if (!startDate || !endDate || startDate > endDate) return [];
  const days: string[] = [];
  let cursor = startDate;
  let guard = 0; // límite de seguridad: nunca debería hacer falta, pero evita un loop infinito
  while (cursor <= endDate && guard < 366) {
    days.push(cursor);
    cursor = addDaysToISODate(cursor, 1);
    guard += 1;
  }
  return days;
}

function isoToLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

const cleanNames = (items: ServiceSource[]): string[] =>
  items.map((item) => item.name?.trim()).filter((name): name is string => !!name);

const serviceKey = (service: ScheduleService) => `${service.type}:${service.name}`;

/**
 * Reemplaza a ScheduleForm: en vez de una tabla plana con un date-picker por
 * fila, pinta los días del getaway como una agenda y las actividades se
 * agregan por día desde un diálogo (incluyendo, opcionalmente, qué lodging /
 * add-on / amenity del getaway aplica a esa actividad).
 */
export function ScheduleCalendar({
  rows, setRows, startDate, endDate,
  lodgingOptions = [], addOns = [], amenities = [],
}: ScheduleCalendarProps) {
  const { t, i18n } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [draft, setDraft] = useState<ActivityDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<DraftErrors>({});
  const [touched, setTouched] = useState(false);

  const days = useMemo(() => buildDayRange(startDate, endDate), [startDate, endDate]);

  // "Services & amenities included" es el catálogo de lo que se asigna a los
  // días: el campo Actividad lo sugiere, y lo que no esté ahí cuenta como extra.
  const amenityNames = useMemo(
    () => Array.from(new Set(cleanNames(amenities))),
    [amenities]
  );
  const isIncluded = (activity: string) => amenityNames.includes(activity.trim());

  // Las amenities ya se eligen como actividad: aquí solo lodging y add-ons.
  const serviceOptions = useMemo<ScheduleService[]>(() => [
    ...cleanNames(lodgingOptions).map((name) => ({ type: 'lodging' as const, name })),
    ...cleanNames(addOns).map((name) => ({ type: 'addOn' as const, name })),
  ], [lodgingOptions, addOns]);

  const rowsByDay = useMemo(() => {
    const map = new Map<string, ScheduleRow[]>();
    rows.forEach((row) => {
      const list = map.get(row.date) ?? [];
      list.push(row);
      map.set(row.date, list);
    });
    return map;
  }, [rows]);

  const openDay = (day: string) => {
    setSelectedDate(day);
    setDraft({ ...EMPTY_DRAFT, days: [day] });
    setErrors({});
    setTouched(false);
  };
  const closeDay = () => setSelectedDate(null);

  const handleDraftChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;
    setDraft((prev) => ({ ...prev, [name as string]: value as string }));
  };

  const toggleDraftDay = (day: string) => {
    setDraft((prev) => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter((d) => d !== day) : [...prev.days, day],
    }));
  };
  const selectAllDays = () => setDraft((prev) => ({ ...prev, days: [...days] }));
  const selectOnlyOpenDay = () =>
    setDraft((prev) => ({ ...prev, days: selectedDate ? [selectedDate] : [] }));

  const validateDraft = (form: ActivityDraft): DraftErrors => {
    const error: DraftErrors = {};
    if (!form.startHour) error.startHour = t('sched.required');
    if (!form.startMinute) error.startMinute = t('sched.required');
    if (!form.endHour) error.endHour = t('sched.required');
    if (!form.endMinute) error.endMinute = t('sched.required');
    if (
      form.startHour && form.startMinute && form.endHour && form.endMinute &&
      !compareTimes(form.startHour, form.startMinute, form.endHour, form.endMinute)
    ) {
      error.timeOrder = t('sched.afterStart');
    }
    if (!form.activity) error.activity = t('sched.required');
    if (!form.location) error.location = t('sched.required');
    if (form.days.length === 0) error.days = t('sched.selectAtLeastOneDay');
    return error;
  };

  const handleAddActivity = () => {
    if (!selectedDate) return;
    const validation = validateDraft(draft);
    setTouched(true);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    const { days: draftDays, ...activityFields } = draft;
    const activity = activityFields.activity.trim();
    const services: ScheduleService[] = [
      ...(isIncluded(activity) ? [{ type: 'amenity' as const, name: activity }] : []),
      ...activityFields.services.filter((service) => service.type !== 'amenity'),
    ];
    // Una fila independiente por día elegido: borrar/editar una no toca las demás.
    const newRows = draftDays.map((day) => ({
      id: generateId(), date: day, ...activityFields, activity, services,
    }));
    setRows((prev) => [...prev, ...newRows]);
    setDraft({ ...EMPTY_DRAFT, days: [selectedDate] });
    setErrors({});
    setTouched(false);
  };

  const handleRemoveRow = (id?: string) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  };

  const weekdayFormatter = useMemo(
    () => new Intl.DateTimeFormat(i18n.language, { weekday: 'short' }), [i18n.language]
  );
  const dayNumberFormatter = useMemo(
    () => new Intl.DateTimeFormat(i18n.language, { day: 'numeric' }), [i18n.language]
  );
  const monthFormatter = useMemo(
    () => new Intl.DateTimeFormat(i18n.language, { month: 'short' }), [i18n.language]
  );
  const fullDateFormatter = useMemo(
    () => new Intl.DateTimeFormat(i18n.language, { weekday: 'long', day: 'numeric', month: 'long' }),
    [i18n.language]
  );

  const serviceLabel = (service: ScheduleService) =>
    `${service.name} · ${t(`sched.serviceType.${service.type}`)}`;

  const orphanRows = rowsOutsideRange(rows, startDate, endDate);
  const removeOrphanRows = () => {
    const orphanIds = new Set(orphanRows.map((row) => row.id));
    setRows((prev) => prev.filter((row) => !orphanIds.has(row.id)));
  };
  const orphanAlert = orphanRows.length > 0 && (
    <Alert
      severity="warning" sx={{ mb: 1.5 }}
      action={
        <Button color="inherit" size="small" onClick={removeOrphanRows} sx={{ textTransform: 'none' }}>
          {t('sched.removeOutOfRange')}
        </Button>
      }
    >
      {t('sched.outOfRange', { count: orphanRows.length })}
    </Alert>
  );

  if (days.length === 0) {
    return (
      <Box>
        <Typography variant="body1" fontWeight="bold" color={BRAND.primary}> {t('sched.schedule')} </Typography>
        {orphanAlert}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {t('sched.pickDatesFirst')}
        </Typography>
      </Box>
    );
  }

  const selectedDayRows = selectedDate ? (rowsByDay.get(selectedDate) ?? []) : [];

  return (
    <Box>
      <Typography variant="body1" fontWeight="bold" color={BRAND.primary} sx={{ mb: 1 }}>
        {t('sched.schedule')}
      </Typography>
      {orphanAlert}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
        {days.map((day) => {
          const count = rowsByDay.get(day)?.length ?? 0;
          const date = isoToLocalDate(day);
          return (
            <Paper
              key={day} variant="outlined"
              onClick={() => openDay(day)}
              role="button" tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openDay(day); }}
              sx={{
                cursor: 'pointer', textAlign: 'center', px: 1.5, py: 1, minWidth: 76,
                borderRadius: 2, borderColor: count > 0 ? BRAND.primary : 'divider',
                bgcolor: count > 0 ? 'action.hover' : 'background.paper',
                ':hover': { borderColor: BRAND.primary, bgcolor: 'action.hover' },
              }}
            >
              <Typography variant="caption" sx={{ textTransform: 'capitalize', color: 'text.secondary' }}>
                {weekdayFormatter.format(date)}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1.1 }}>
                {dayNumberFormatter.format(date)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize', display: 'block' }}>
                {monthFormatter.format(date)}
              </Typography>
              <Box sx={{ mt: 0.5, minHeight: 22, display: 'flex', justifyContent: 'center' }}>
                {count > 0 ? (
                  <Chip
                    size="small" label={count}
                    sx={{ height: 18, fontSize: 11, bgcolor: BRAND.green, color: BRAND.navy, fontWeight: 'bold' }}
                  />
                ) : (
                  <AddIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                )}
              </Box>
            </Paper>
          );
        })}
      </Box>

      <Dialog open={!!selectedDate} onClose={closeDay} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="subtitle1" component="span"
            sx={{ display: 'block', textAlign: 'center', fontWeight: 'bold', textTransform: 'capitalize' }}
          >
            {selectedDate ? fullDateFormatter.format(isoToLocalDate(selectedDate)) : ''}
          </Typography>
          <IconButton aria-label="close" onClick={closeDay}
            sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
          ><CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {selectedDayRows.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('sched.noActivitiesDay')}
            </Typography>
          ) : (
            <Stack spacing={1.5} sx={{ mb: 3 }}>
              {selectedDayRows.map((row) => (
                <Paper key={row.id} variant="outlined"
                  sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {row.startHour}:{row.startMinute} – {row.endHour}:{row.endMinute}
                    </Typography>
                    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                      <Typography variant="body2">{row.activity}</Typography>
                      {!isIncluded(row.activity) && (
                        <Chip size="small" label={t('sched.extra')} color="warning" variant="outlined"
                          sx={{ height: 18, fontSize: 11 }} />
                      )}
                    </Stack>
                    {row.location && (
                      <Typography variant="caption" color="text.secondary">{row.location}</Typography>
                    )}
                    {row.services?.some((service) => service.type !== 'amenity') && (
                      <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: 'wrap' }} useFlexGap>
                        {row.services.filter((service) => service.type !== 'amenity').map((service) => (
                          <Chip key={serviceKey(service)} size="small" variant="outlined"
                            label={serviceLabel(service)}
                            sx={{ borderColor: BRAND.primary, color: BRAND.primary }}
                          />
                        ))}
                      </Stack>
                    )}
                  </Box>
                  <IconButton size="small" onClick={() => handleRemoveRow(row.id)} aria-label="delete activity">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Paper>
              ))}
            </Stack>
          )}

          <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
            {t('sched.addActivity')}
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5 }}>
            {/* Start time — reloj de 24h: "HH : MM", sin AM/PM que confundir */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                {t('sched.startTime')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FormControl size="small" error={!!(touched && errors.startHour)} sx={{ width: 72 }}>
                  <Select name="startHour" displayEmpty sx={{ borderRadius: '4px 0 0 4px' }}
                    value={draft.startHour} onChange={handleDraftChange}
                  >
                    <MenuItem value="">{t('sched.hr')}</MenuItem>
                    {hourOptions.map(hr => <MenuItem key={hr} value={hr}>{hr}</MenuItem>)}
                  </Select>
                </FormControl>
                <Typography sx={{ px: 0.5, fontWeight: 'bold', color: 'text.secondary' }}>:</Typography>
                <FormControl size="small" error={!!(touched && errors.startMinute)} sx={{ width: 72 }}>
                  <Select name="startMinute" displayEmpty sx={{ borderRadius: '0 4px 4px 0' }}
                    value={draft.startMinute} onChange={handleDraftChange}
                  >
                    <MenuItem value="">{t('sched.min')}</MenuItem>
                    {minuteOptions.map(min => <MenuItem key={min} value={min}>{min}</MenuItem>)}
                  </Select>
                </FormControl>
              </Box>
              {touched && (errors.startHour || errors.startMinute) && (
                <Typography variant="caption" color="error">{errors.startHour || errors.startMinute}</Typography>
              )}
            </Box>

            {/* End time */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                {t('sched.endTime')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FormControl size="small" error={!!(touched && (errors.endHour || errors.timeOrder))} sx={{ width: 72 }}>
                  <Select name="endHour" displayEmpty sx={{ borderRadius: '4px 0 0 4px' }}
                    value={draft.endHour} onChange={handleDraftChange}
                  >
                    <MenuItem value="">{t('sched.hr')}</MenuItem>
                    {hourOptions.map(hr => <MenuItem key={hr} value={hr}>{hr}</MenuItem>)}
                  </Select>
                </FormControl>
                <Typography sx={{ px: 0.5, fontWeight: 'bold', color: 'text.secondary' }}>:</Typography>
                <FormControl size="small" error={!!(touched && (errors.endMinute || errors.timeOrder))} sx={{ width: 72 }}>
                  <Select name="endMinute" displayEmpty sx={{ borderRadius: '0 4px 4px 0' }}
                    value={draft.endMinute} onChange={handleDraftChange}
                  >
                    <MenuItem value="">{t('sched.min')}</MenuItem>
                    {minuteOptions.map(min => <MenuItem key={min} value={min}>{min}</MenuItem>)}
                  </Select>
                </FormControl>
              </Box>
              {touched && (errors.endHour || errors.endMinute || errors.timeOrder) && (
                <Typography variant="caption" color="error">
                  {errors.endHour || errors.endMinute || errors.timeOrder}
                </Typography>
              )}
            </Box>
          </Box>

          <Box sx={{ mt: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {t('sched.repeatOn')}
              </Typography>
              <Stack direction="row" spacing={1.5}>
                <Typography
                  variant="caption" onClick={selectAllDays}
                  sx={{ cursor: 'pointer', color: BRAND.primary, fontWeight: 'bold', ':hover': { textDecoration: 'underline' } }}
                > {t('sched.allDays')} </Typography>
                <Typography
                  variant="caption" onClick={selectOnlyOpenDay}
                  sx={{ cursor: 'pointer', color: BRAND.primary, fontWeight: 'bold', ':hover': { textDecoration: 'underline' } }}
                > {t('sched.onlyThisDay')} </Typography>
              </Stack>
            </Box>
            <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap' }} useFlexGap>
              {days.map((day) => {
                const isChecked = draft.days.includes(day);
                const date = isoToLocalDate(day);
                return (
                  <Chip
                    key={day}
                    label={`${weekdayFormatter.format(date)} ${dayNumberFormatter.format(date)}`}
                    onClick={() => toggleDraftDay(day)}
                    variant={isChecked ? 'filled' : 'outlined'}
                    sx={{
                      textTransform: 'capitalize',
                      bgcolor: isChecked ? BRAND.primary : 'transparent',
                      color: isChecked ? BRAND.white : 'text.primary',
                      borderColor: BRAND.primary,
                      fontWeight: isChecked ? 'bold' : 'normal',
                    }}
                  />
                );
              })}
            </Stack>
            {touched && errors.days && (
              <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                {errors.days}
              </Typography>
            )}
          </Box>

          <Autocomplete
            freeSolo size="small"
            options={amenityNames}
            value={draft.activity || null}
            inputValue={draft.activity}
            onChange={(_, value) => setDraft((prev) => ({ ...prev, activity: value ?? '' }))}
            onInputChange={(_, value) => setDraft((prev) => ({ ...prev, activity: value }))}
            renderInput={(params) => (
              <TextField
                {...params} name="activity" label={t('sched.activityTitle')} margin="dense"
                placeholder={amenityNames.length > 0 ? t('sched.pickIncluded') : undefined}
                error={!!(touched && errors.activity)}
                helperText={
                  touched && errors.activity ? errors.activity
                    : draft.activity.trim() && !isIncluded(draft.activity) ? t('sched.extraHint')
                    : amenityNames.length === 0 ? t('sched.noIncludedYet')
                    : ' '
                }
              />
            )}
          />
          <TextField
            name="location" label={t('sched.location')} fullWidth margin="dense" size="small"
            value={draft.location} onChange={handleDraftChange}
            error={!!(touched && errors.location)}
            helperText={touched && errors.location ? errors.location : ' '}
          />

          {serviceOptions.length > 0 && (
            <Autocomplete
              multiple size="small"
              options={serviceOptions}
              value={draft.services}
              groupBy={(option) => t(`sched.serviceType.${option.type}`)}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(a, b) => serviceKey(a) === serviceKey(b)}
              onChange={(_, value) => setDraft((prev) => ({ ...prev, services: value }))}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })} key={serviceKey(option)}
                    label={option.name} size="small"
                    sx={{ bgcolor: BRAND.green, color: BRAND.navy, fontWeight: 'bold' }}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField {...params} margin="dense"
                  label={t('sched.linkedServices')}
                  placeholder={t('sched.linkedServicesPlaceholder')}
                />
              )}
            />
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDay} sx={{ textTransform: 'none' }}>{t('common.close')}</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddActivity}
            sx={{
              borderRadius: '20px', textTransform: 'none', fontWeight: 'bold',
              bgcolor: BRAND.primary, color: BRAND.white, ':hover': { color: BRAND.primary, bgcolor: BRAND.white }
            }}
          > {t('sched.addActivity')} </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ScheduleCalendar;
