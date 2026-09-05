import * as React from "react";
import { styled } from "@mui/material/styles";
import { BRAND } from "../theme/colors";

import {
  Box, Divider, Paper, Stack, Button, Typography, Card, CardContent, CardActions
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
import tournamentsLogo from '../assets/RappsIcons/tournamentsLogo.svg';
import type { Tournament } from '../services/tournament';
import { useTournaments } from '../hooks/useTournaments';

export interface TournamentRow {
  id: string;
  tournamentName: string;
  clubName: string;
  dates: string;
  type: string;
  location: string;
  sport: string;
  price: string;
  playingLevelMax: string;
  playingLevelMin: string;
  participantLimit: string;
  included: boolean;
  typeDraw: string;
  quantityGames: string;
}

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

const formatInteger = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '-';

  const numberValue = typeof value === 'number' ? value : Number(value);

  return Number.isInteger(numberValue) ? String(numberValue) : '-';
};

const toTournamentRows = (tournaments: Tournament[], t: (key: string) => string): TournamentRow[] =>
  tournaments.map((tournament) => {
    const startDate = formatTournamentDate(tournament.startDate);
    const endDate = formatTournamentDate(tournament.endDate);

    return {
      id: tournament.id,
      tournamentName: typeof tournament.name === 'string' && tournament.name
        ? tournament.name : `${t('tournaments.tournament')} ${tournament.id}`,
      clubName: typeof tournament.clubName === 'string' && tournament.clubName
        ? tournament.clubName
        : "",
      dates: [startDate, endDate].filter(Boolean).join(' - ') || t('tournaments.undefinedDates'),
      type: typeof tournament.type === 'string' && tournament.type ? tournament.type : '-',
      location: typeof tournament.location === 'string' && tournament.location ? tournament.location : '-',
      sport: typeof tournament.sport === 'string' && tournament.sport ? tournament.sport : '-',
      typeDraw: typeof tournament.typeDraw === 'string' && tournament.typeDraw ? tournament.typeDraw : '-',
      playingLevelMax: formatNullableNumber(tournament.playingLevelMax),
      playingLevelMin: formatNullableNumber(tournament.playingLevelMin),
      participantLimit: formatNullableNumber(tournament.participantLimit),
      price: formatMoney(tournament.fees),
      included: false,
      quantityGames: formatInteger(tournament.quantityGames),
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

interface TournamentTableProps {
  mode?: 'select' | 'readonly';
  selectedIds?: string[];
  setSelectedIds?: React.Dispatch<React.SetStateAction<string[]>>;
}

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

export default function TournamentTable(
  { mode = 'readonly', selectedIds = [], setSelectedIds }: TournamentTableProps
) {
  const { t } = useTranslation();
  const { tournaments, loading, error, fetchTournaments } = useTournaments();

  const handleFetch = () => {
    fetchTournaments();
    setShowTable(true);
  };

  // const [selectedTournamentIds, setSelectedTournamentIds] = React.useState<string[]>([]);

  //Conditional table rendering state
  const [showTable, setShowTable] = React.useState(false);
  const rows = React.useMemo(() => toTournamentRows(tournaments, t), [tournaments, t]);

  React.useEffect(() => {
    if (mode === 'readonly' && selectedIds.length > 0) {
      fetchTournaments();
      setShowTable(true);
    }
  }, [fetchTournaments, mode, selectedIds.length]);

  const handleIncludeChange = (id: string) => {
    if (!setSelectedIds) return;

    setSelectedIds((prevIds) =>
      prevIds.includes(id)
        ? prevIds.filter((selectedId) => selectedId !== id)
        : [...prevIds, id]
    );
  };

  const handleResetTable = () => {
    setSelectedIds?.([]);
    setShowTable(false);
  };

  const visibleRows = mode === 'readonly'
    ? rows.filter((row) => selectedIds.includes(row.id))
    : rows;

  return (
    <Box sx={{ width:'100%', margin:'25px 0' }}>
      <Divider textAlign="center" aria-hidden="true">
        <img src={tournamentsLogo} style={{ height:'36px' }} className="logo" alt="Racquets Tournaments Logo"/>
      </Divider>

      {showTable ? (
        <>
          <p>{t('tournaments.addPrompt')}</p>
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
            <Table stickyHeader sx={{ minWidth:700, tableLayout: 'fixed' }} aria-label="tournaments table">
              <TableHead>
                <TableRow>
                  <StyledTableCell align="left">{t('tournaments.header')}</StyledTableCell>
                  <StyledTableCell align="left">{t('academy.price')}</StyledTableCell>
                  {mode === 'select' && (
                    <StyledTableCell align="center">{t('academy.include')}</StyledTableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleRows.map((row) => (
                  <StyledTableRow hover key={row.id}>
                    <StyledTableCell component="th" scope="row">
                      <Stack direction="column" spacing={0.5}>
                        <strong>{row.tournamentName}</strong>
                        <span>{t('sched.clubName')}: {row.clubName}</span>
                        <span>{t('sched.dates')}: {row.dates}</span>
                        <span>{t('sched.type')}: {row.type}</span>
                        <span>{t('sched.PlayLevel')}: {row.playingLevelMin} - {row.playingLevelMax}</span>
                        <span>{t('sched.quantityGames')}: {row.quantityGames}</span>
                        <span>{t('sched.sport')}: {row.sport}</span>
                        <span>{t('sched.typeDraw')}: {row.typeDraw}</span>
                        <span>{t('sched.location')}: {row.location}</span>
                      </Stack>
                    </StyledTableCell>
                    <StyledTableCell align="left">{row.price}</StyledTableCell>
                    {mode === 'select' && (
                      <StyledTableCell align="center">
                        <input id={`tournamentOption-${row.id}`}
                          type="checkbox"
                          checked={selectedIds.includes(row.id)}
                          onChange={() => handleIncludeChange(row.id)}
                          aria-label={`Include ${row.tournamentName}`}
                        />
                      </StyledTableCell>
                    )}
                  </StyledTableRow>
                ))}
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
            p: 3, textAlign: 'center', bgcolor: '#F8F9FA', border: '1px dashed #bdbdbd'
          }}>
          <CardContent>
            <Typography variant="h6" component="div" gutterBottom sx={{ fontWeight: 'bold', color: BRAND.primary }}> {t('academy.enhance')} </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              {t('tournaments.prompt')}
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: 'center' }}>
            <Button startIcon={<CheckCircleOutlineIcon />} variant="contained"  size="large"
              onClick={handleFetch} disabled={loading}
              sx={{ px: 4, borderRadius: '20px', bgcolor: BRAND.primary, textTransform: 'none' }}
            >
              {loading ? t('common.loading') : t('tournaments.get')}
            </Button>
          </CardActions>
        </Card>
      )}
    </Box>
  );
}
