import * as React from "react";
import { styled } from "@mui/material/styles";
import { BRAND } from "../theme/colors";
import {
  Box, Chip, Divider, Paper, Stack, Button, Typography,
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
import { useTranslation } from 'react-i18next';
import laddersLogo from '../assets/RappsIcons/laddersLogo.png';

import type { Ladder } from '../services/ladder';
import { useLadders } from '../hooks/useLadders';
import { matchesScheduleFilters, type ScheduleFilters } from '../utils/scheduleFilters';

export interface LadderRow {
  id: string;
  ladderName: string;
  location: string;
  dates: string;
  rankingType: string;
  modality: string;
  price: string;
  included: boolean;
  sport: string;
  level: string;
  games: string;
  rawStart: unknown;
  rawEnd: unknown;
}

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

interface FirestoreDate {
  _seconds?: number;
  seconds?: number;
}

const formatTournamentDate = (value: unknown) => {
  if (!value) return '';

  if (typeof value === 'string') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
  }

  if (value instanceof Date) {
    return value.toLocaleDateString();
  }

  if (typeof value === 'object') {
    const timestamp = value as FirestoreDate;
    const seconds = timestamp._seconds ?? timestamp.seconds;

    if (typeof seconds === 'number') {
      return new Date(seconds * 1000).toLocaleDateString();
    }
  }
  return '';
};

const formatNullableNumber = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '-';

  const numberValue = typeof value === 'number' ? value : Number(value);

  return Number.isFinite(numberValue) ? String(numberValue) : '-';
};

const formatMoney = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '-';

  const numberValue = typeof value === 'number' ? value : Number(value);

  return Number.isFinite(numberValue) ? `$${numberValue.toLocaleString()} fee` : '-';
};

const toLadderRows = (ladders: Ladder[], t: (key: string) => string): LadderRow[] =>
  (Array.isArray(ladders) ? ladders : [])
    // Sin id no hay key única para React ni nada que incluir en el getaway.
    .filter((ladder) => typeof ladder?.id === 'string' && ladder.id !== '')
    .map((ladder) => {
      const startDate = formatTournamentDate(ladder.startDate ?? ladder.startdate);
      const endDate = formatTournamentDate(ladder.endDate ?? ladder.enddate);
      const ladderName = ladder.name ?? ladder.title;
      const rankingType = ladder.rankingType ?? ladder.typeranking;
      const modality = ladder.modality ?? ladder.type;

      return {
        id: ladder.id,
        ladderName: typeof ladderName === 'string' && ladderName
          ? ladderName : `${t('ladders.header')} ${ladder.id}`,
        location: typeof ladder.location === 'string' && ladder.location
          ? ladder.location
          : typeof ladder.club_ID === 'string' ? ladder.club_ID : '-',
        dates: [startDate, endDate].filter(Boolean).join(' - ') || t('tournaments.undefinedDates'),
        rankingType: typeof rankingType === 'string' && rankingType
          ? rankingType
          : formatNullableNumber(rankingType),
        modality: typeof modality === 'string' && modality ? modality : '-',
        price: formatMoney(ladder.fees),
        included: false,
        sport: typeof ladder.sport === 'string' && ladder.sport ? ladder.sport : '',
        level: [ladder.playinglevelmin, ladder.playinglevelmax]
          .map((value) => formatNullableNumber(value))
          .join(' - '),
        games: formatNullableNumber(ladder.quantygame),
        rawStart: ladder.startDate ?? ladder.startdate,
        rawEnd: ladder.endDate ?? ladder.enddate,
      };
    });

interface LadderTableProps {
  mode?: 'select' | 'readonly';
  /** false oculta la columna de precio (p.ej. en el detalle público del getaway). */
  showPrice?: boolean;
  selectedIds?: string[];
  setSelectedIds?: React.Dispatch<React.SetStateAction<string[]>>;
  /** Deporte y fechas del formulario de getaway; filtran la tabla. */
  searchParams?: ScheduleFilters;
  /** Datos ya cargados (el getaway los trae embebidos); evita volver a pedirlos. */
  items?: Ladder[];
  /** Avisa al padre cuando llegan los datos (p.ej. para calcular tarifas en el resumen). */
  onItemsLoaded?: (items: Ladder[]) => void;
}

export default function LaddersTable(
  { mode = 'readonly', showPrice = true, selectedIds = [], setSelectedIds, searchParams, items, onItemsLoaded }: LadderTableProps
) {
  const { t } = useTranslation();
  const { ladders, loading, error, fetchLadders } = useLadders();

  const handleFetch = () => {
    fetchLadders();
    setShowTable(true);
  };
  //Conditional table rendering state
  // En readonly la tabla nace abierta: no hay tarjeta de "cargar" que mostrar.
  const [showTable, setShowTable] = React.useState(mode === 'readonly');

  const source = items ?? ladders;
  React.useEffect(() => {
    if (!items) onItemsLoaded?.(ladders);
  }, [items, ladders, onItemsLoaded]);
  const rows = React.useMemo(() => toLadderRows(source, t), [source, t]);


  const handleIncludeChange = (id: string) => {
    if (!setSelectedIds) return;
    setSelectedIds((prevIds) =>
      prevIds.includes(id)
        ? prevIds.filter((selectedId) =>
          selectedId !== id)
      : [...prevIds, id]
    );
  };

  const handleResetTable = () => {
    setSelectedIds?.([]);
    setShowTable(false);
  };

  const { startDate, endDate, sport } = searchParams ?? {};

  // En 'select' se acota a lo que encaja con el getaway; en 'readonly' se muestra
  // lo ya elegido aunque las fechas del formulario hayan cambiado después.
  const visibleRows = React.useMemo(() => {
    if (mode === 'readonly') return rows.filter((row) => selectedIds.includes(row.id));

    return rows.filter(
      (row) =>
        selectedIds.includes(row.id) ||
        matchesScheduleFilters(
          { sport: row.sport, start: row.rawStart, end: row.rawEnd },
          { startDate, endDate, sport }
        )
    );
  }, [rows, mode, selectedIds, startDate, endDate, sport]);


  // En readonly sin nada incluido no hay sección que mostrar.
  if (mode === 'readonly' && selectedIds.length === 0) return null;
  return (
    <Box sx={{ width:'100%', margin:'25px 0' }}>
      <Divider textAlign="center" aria-hidden="true">
        <img src={laddersLogo} style={{height:'34px'}} className="logo" alt="Racquets Ladders Logo" />
      </Divider>
      {showTable ? (
        <>
          <p>{t('ladders.addPrompt')}</p>
          {loading && (
            <Typography sx={{ mb: 2 }} color="text.secondary">
              {t('tournaments.loading')}
            </Typography>
          )}
          {error && (
            <Typography sx={{ mb: 2 }} color="error">
              {error}
            </Typography>
          )}
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 360, overflowY: 'auto', overflowX: 'auto' }}>
              <Table stickyHeader sx={{ minWidth: 900 }} aria-label="ladders table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell align="left">{t('ladders.header')}</StyledTableCell>
                    <StyledTableCell align="left">{t('sched.dates')}</StyledTableCell>
                    <StyledTableCell align="left">{t('sched.location')}</StyledTableCell>
                    <StyledTableCell align="left">{t('sched.rankingType')}</StyledTableCell>
                    {showPrice && <StyledTableCell align="left">{t('academy.price')}</StyledTableCell>}
                    {mode === 'select' && (
                      <StyledTableCell align="center">{t('academy.include')}</StyledTableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visibleRows.map((row) => {
                    const isIncluded = selectedIds.includes(row.id);
                    return (
                      <StyledTableRow hover key={row.id}>
                        <StyledTableCell component="th" scope="row">
                          <Stack direction="column" spacing={0.5}>
                            <strong>{row.ladderName}</strong>
                            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                              {row.sport && (
                                <Chip size="small" label={row.sport}
                                  sx={{ bgcolor: BRAND.green, color: BRAND.navy, fontWeight: 'bold' }}
                                />
                              )}
                              {row.modality !== '-' && (
                                <Chip size="small" variant="outlined" label={row.modality}
                                  sx={{ borderColor: BRAND.primary, color: BRAND.primary }}
                                />
                              )}
                            </Stack>
                          </Stack>
                        </StyledTableCell>

                        <StyledTableCell align="left">{row.dates}</StyledTableCell>

                        <StyledTableCell align="left">{row.location}</StyledTableCell>

                        <StyledTableCell align="left">
                          <Stack direction="column" spacing={0.5}>
                            <span>{row.rankingType}</span>
                            <Typography variant="caption" color="text.secondary">
                              {t('sched.PlayLevel')}: {row.level}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {t('sched.quantityGames')}: {row.games}
                            </Typography>
                          </Stack>
                        </StyledTableCell>

                        {showPrice && <StyledTableCell align="left">{row.price}</StyledTableCell>}

                        {mode === 'select' && (
                          <StyledTableCell align="center">
                            <Button
                              variant={isIncluded ? "contained" : "outlined"}
                              size="small"
                              onClick={() => handleIncludeChange(row.id)}
                              aria-label={`Include ${row.ladderName}`}
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

            {!loading && !error && visibleRows.length === 0 && (
              <Typography sx={{ mt: 2 }} color="text.secondary">
                {t('tournaments.unavailable')}
              </Typography>
            )}
          </Paper>

          {/* Hide table and reset */}
          {mode === 'select' && (
            <Button  variant="contained" startIcon={<DeleteIcon />}
              onClick={handleResetTable}
              // color="primary"
              sx={{ mt:2,
                bgcolor: BRAND.primary,
                textTransform: 'none',
                borderRadius: '20px',
                px: 4
              }}
            > {t('academy.removeSelection')}
            </Button>
          )}
        </>
      ) : (
        <Card variant="outlined" sx={{
            p: 3, textAlign: 'center',
            bgcolor: 'action.hover', border: '1px dashed', borderColor: 'divider'
          }}>
          <CardContent>
            <Typography variant="h6" component="div" gutterBottom sx={{ fontWeight: 'bold', color: BRAND.primary }}> {t('academy.enhance')} </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {t('ladders.prompt')}
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: 'center' }}>
            <Button startIcon={<CheckCircleOutlineIcon />} variant="contained"  size="large"
              onClick={handleFetch} disabled={loading}
              sx={{ px: 4, borderRadius: '20px', bgcolor: BRAND.primary, textTransform: 'none' }}
            >
              {loading ? t('common.loading') : t('academy.showSessions')}
            </Button>
          </CardActions>
        </Card>
      )}
    </Box>
  );
}