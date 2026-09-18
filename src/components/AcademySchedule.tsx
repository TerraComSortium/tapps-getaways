import * as React from "react";
import { styled } from "@mui/material/styles";
import { BRAND } from "../theme/colors";
import { useTranslation } from 'react-i18next';
import {
  Box, Chip, Divider, Paper, Stack, Button, Typography, CircularProgress,
  Card, CardContent, CardActions
} from '@mui/material';
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import academy from '../assets/RappsIcons/academyLogo.svg';
// import { AcademyClass } from '../services/academyService';
import { AcademyClass, AcademyHour, AcademyParams, AcademySession } from '../hooks/useGetAcademy';

//Props from CreateGetaway
interface AcademyScheduleProps {
  /** 'select' deja elegir sesiones; 'readonly' solo muestra las ya incluidas. */
  mode?: 'select' | 'readonly';
  schedules: AcademyClass[];
  loading: boolean;
  selectedIds: string[];
  setSelectedIds?: React.Dispatch<React.SetStateAction<string[]>>;
  /** Solo se usan en modo 'select': el readonly pinta lo que recibe en `schedules`. */
  fetchAcademy?: (params: AcademyParams) => void;
  searchParams?: AcademyParams;
}

/**
 * Fila de la tabla: UNA por clase de academia (no por sesión), porque lo que se
 * incluye en el getaway es el id de la clase. Los datos del documento vienen
 * anidados en `scheduled[]`, así que aquí se aplanan y se agrupan sin repetir.
 */
export interface AcademyRow {
  id: string;
  name: string;
  sport: string;
  genre: string;
  subtitle: string;
  weekdays: string;
  hours: string;
  location: string;
  court: string;
  trainers: string;
  price: string;
  places: string;
}

const MERIDIEM_BY_INDEX: Record<number, string> = { 0: 'AM', 1: 'PM' };

/** { hour: '9', minutes: '00', meridiem: 'AM' } → "9:00 AM" */
const formatHour = (value?: AcademyHour | string): string => {
  if (!value) return '';
  if (typeof value === 'string') return value.trim();

  const { hour, minutes, meridiem } = value;
  if (!hour) return '';

  const suffix =
    typeof meridiem === 'number' ? MERIDIEM_BY_INDEX[meridiem] ?? '' : meridiem ?? '';
  return `${hour}:${String(minutes ?? '00').padStart(2, '0')} ${suffix}`.trim();
};

const formatFee = (value?: string | number): string => {
  if (value === null || value === undefined || value === '') return '';
  const fee = Number(value);
  return Number.isFinite(fee) ? `$${fee}` : String(value);
};

const formatDate = (value?: string): string => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

/** Valores únicos y no vacíos, conservando el orden. */
const uniq = (values: (string | undefined)[]): string[] =>
  Array.from(new Set(values.filter((v): v is string => !!v && v.trim() !== '')));

/** `daysavailable` puede venir como string[] o como [{ label, value }]. */
const toWeekdayList = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return uniq(
    value.map((day) =>
      typeof day === 'string' ? day : (day as { label?: string })?.label
    )
  );
};

const toAcademyRows = (classes: AcademyClass[]): AcademyRow[] =>
  (classes ?? []).map((item) => {
    const sessions: AcademySession[] = Array.isArray(item.scheduled) ? item.scheduled : [];

    const weekdays = uniq(sessions.map((session) => session.weekday));
    const hours = uniq(
      sessions.flatMap((session) =>
        (session.hours ?? []).map((slot) =>
          [formatHour(slot.start), formatHour(slot.end)].filter(Boolean).join(' - ')
        )
      )
    );

    // Clases de horario fijo: los datos no están en `scheduled`, sino sueltos.
    if (weekdays.length === 0) weekdays.push(...toWeekdayList(item.daysavailable));
    if (hours.length === 0) {
      const fixedRange = [
        formatHour(item.fixedSchedule_startTime),
        formatHour(item.fixedSchedule_endTime),
      ]
        .filter(Boolean)
        .join(' - ');
      if (fixedRange) hours.push(fixedRange);
    }

    const dates = [formatDate(item.startdate), formatDate(item.enddate)]
      .filter(Boolean)
      .join(' - ');

    return {
      id: item.id,
      name: item.name || item.description || `#${item.id}`,
      sport: item.sport ?? '',
      genre: item.genre ?? '',
      subtitle: uniq([dates, item.groupType, item.agebracket]).join(' · '),
      weekdays: weekdays.join(', '),
      hours: hours.join(' / '),
      location: uniq(sessions.map((session) => session.location?.name)).join(', '),
      court: uniq(
        sessions.map((session) => session.court?.name || session.court?.courtno)
      ).join(', '),
      trainers: uniq(
        sessions.flatMap((session) =>
          (session.staff ?? []).map((person) =>
            [person?.name, person?.lastname].filter(Boolean).join(' ')
          )
        )
      ).join(', '),
      price: uniq(sessions.map((session) => formatFee(session.fees))).join(' / '),
      places: uniq(
        sessions.map((session) =>
          session.limitPlaces === null || session.limitPlaces === undefined
            ? undefined
            : String(session.limitPlaces)
        )
      ).join(' / '),
    };
  });

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

export default function AcademySchedule({
  mode = 'select',
  schedules,
  loading,
  selectedIds,
  setSelectedIds,
  fetchAcademy, searchParams
}: AcademyScheduleProps) {
  const { t } = useTranslation();
  const isSelectable = mode === 'select';
  // En readonly la tabla nace abierta: no hay tarjeta de "cargar" que mostrar.
  const [showTable, setShowTable] = React.useState(!isSelectable);

  // Los datos llegan anidados desde Firestore; se aplanan una vez por respuesta.
  const rows = React.useMemo(() => toAcademyRows(schedules), [schedules]);



  const visibleRows = React.useMemo(
    () => (isSelectable ? rows : rows.filter((row) => selectedIds.includes(row.id))),
    [rows, isSelectable, selectedIds]
  );

  const handleToggleInclude = (id: string) => {
    if (!setSelectedIds) return;
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleShowTable = () => {
    setShowTable(true);
    if (searchParams) fetchAcademy?.(searchParams);
  };

  // Conditional table rendering state
  // const handleIncludeChange = (id: number) => {
  //   setRows((prevRows) =>
  //     prevRows.map((row) =>
  //       row.id === id ? { ...row, included: !row.included } : row
  //     )
  //   );
  // };

  const handleResetTable = () => {
    setSelectedIds?.([]);
    setShowTable(false);
  };
  // 3. No mostrar el componente si no hay resultados ni fechas elegidas
  // if (!schedules || schedules.length === 0) {
  //   return null; // O un mensaje de "No hay horarios disponibles"
  // }

  // En readonly sin sesiones incluidas no hay nada que enseñar.
  if (!isSelectable && selectedIds.length === 0) return null;

  return (
    <Box sx={{ width: '100%', margin: '25px 0' }}>
      <Divider textAlign="center" aria-hidden="true" sx={{ mb: 2 }}>
        <img src={academy} style={{ height: '36px' }} className="logo" alt="Racquets Academy Logo" />
      </Divider>

      {!showTable && isSelectable ? (
        <Card variant="outlined" sx={{
          p: 3, textAlign: 'center',
          bgcolor: 'action.hover', border: '1px dashed', borderColor: 'divider'
        }}>
          <CardContent>
            <Typography variant="h6" component="div" gutterBottom sx={{ fontWeight: 'bold', color: BRAND.primary }}> {t('academy.enhance')} </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}> {t('academy.prompt')}</Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: 'center' }}>
            <Button startIcon={<CheckCircleOutlineIcon />} variant="contained"  size="large"
            onClick={handleShowTable}
            // onClick={() => setShowTable(true)}
            sx={{ px: 4, borderRadius: '20px', bgcolor: BRAND.primary, textTransform: 'none' }}
            > {t('academy.showSessions')}</Button>
          </CardActions>
        </Card>
      ) : (
      <>
        { loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress color="primary" />
            {/* <Typography sx={{ my: 2 }}>{t('common.loading')}...</Typography> */}
          </Box>
        ) : visibleRows.length === 0 ? (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ my: 2 }}>
            {t('academy.noSchedules')}
          </Typography>
        ) : (
          <>
            {isSelectable && (
              <Typography variant="body1" sx={{ mb: 2, color: BRAND.primary, fontWeight: 'bold' }}>
                {t('academy.selectSessions')}
              </Typography>
            )}

            <TableContainer component={Paper} elevation={3}>
              <Table aria-label="customized table" sx={{ minWidth: 700 }}>
                <TableHead>
                  <TableRow>
                    <StyledTableCell align="left">{t('academy.class')}</StyledTableCell>
                    <StyledTableCell align="left">{t('academy.weekday')}</StyledTableCell>
                    <StyledTableCell align="left">{t('academy.location')}</StyledTableCell>
                    <StyledTableCell align="left">{t('academy.trainer')}</StyledTableCell>
                    <StyledTableCell align="left">{t('academy.price')}</StyledTableCell>
                    {isSelectable && (
                      <StyledTableCell align="center">{t('academy.include')}</StyledTableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visibleRows.map((row) => {
                    const isIncluded = selectedIds.includes(row.id);
                    return (
                      <StyledTableRow key={row.id}>
                        <StyledTableCell component="th" scope="row">
                          <Stack direction="column" spacing={0.5}>
                            <strong>{row.name}</strong>
                            {(row.sport || row.genre) && (
                              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                {row.sport && (
                                  <Chip size="small" label={row.sport}
                                    sx={{ bgcolor: BRAND.green, color: BRAND.navy, fontWeight: 'bold' }}
                                  />
                                )}
                                {row.genre && (
                                  <Chip size="small" variant="outlined" label={row.genre}
                                    sx={{ borderColor: BRAND.primary, color: BRAND.primary }}
                                  />
                                )}
                              </Stack>
                            )}
                            {row.subtitle && (
                              <Typography variant="caption" color="text.secondary">
                                {row.subtitle}
                              </Typography>
                            )}
                          </Stack>
                        </StyledTableCell>

                        <StyledTableCell scope="row">
                          <Stack direction="column" spacing={0.5}>
                            <strong>{row.weekdays || '-'}</strong>
                            <span>{row.hours || '-'}</span>
                          </Stack>
                        </StyledTableCell>

                        <StyledTableCell scope="row">
                          <Stack direction="column" spacing={0.5}>
                            <strong>{row.location || '-'}</strong>
                            {row.court && <span>{t('academy.court')}: {row.court}</span>}
                          </Stack>
                        </StyledTableCell>

                        <StyledTableCell scope="row">
                          <span>{row.trainers || '-'}</span>
                        </StyledTableCell>

                        <StyledTableCell align="left" scope="row">
                          <Stack direction="column" spacing={0.5}>
                            <span>{row.price || '-'}</span>
                            {row.places && (
                              <Typography variant="caption" color="text.secondary">
                                {t('academy.places', { count: Number(row.places) || 0 })}
                              </Typography>
                            )}
                          </Stack>
                        </StyledTableCell>

                        {isSelectable && (
                          <StyledTableCell align="center">
                            <Button
                              variant={isIncluded ? "contained" : "outlined"}
                              size="small"
                              onClick={() => handleToggleInclude(row.id)}
                              sx={{
                                borderRadius: '20px',
                                textTransform: 'none',
                                bgcolor: isIncluded ? BRAND.green : 'transparent',
                                color: isIncluded ? BRAND.navy : BRAND.primary,
                                borderColor: BRAND.primary,
                                '&:hover': {
                                  bgcolor: isIncluded ? BRAND.primary : 'rgba(0,0,0,0.04)',
                                  color: isIncluded ? BRAND.white : BRAND.primary,
                                }
                              }}
                            >
                              {isIncluded ? t('academy.included') : t('academy.include')}
                            </Button>
                          </StyledTableCell>
                        )}
                      </StyledTableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            {/* Hide table and reset */}
            {isSelectable && (
              <Button  variant="contained" startIcon={<DeleteIcon />}
                onClick={handleResetTable} color="primary"
                sx={{
                  mt:2, px: 4,
                  bgcolor: BRAND.primary,
                  textTransform: 'none',
                  borderRadius: '20px',
                }}
              > {t('academy.removeSelection')}
              </Button>
            )}
          </>
        )}
      </>
    )}
    </Box>
  );
}