import * as React from "react";
import { styled } from "@mui/material/styles";
import { BRAND } from "../theme/colors";
import {
  Box, Divider, Paper, Stack, Button, Typography,
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
import laddersLogo from '../assets/RappsIcons/laddersLogo.svg';

import type { Ladder } from '../services/ladder';
import { useLadders } from '../hooks/useLadders';

export interface LadderRow {
  id: string;
  ladderName: string;
  location: string;
  dates: string;
  rankingType: string;
  modality: string;
  price: string;
  included: boolean;
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
  (Array.isArray(ladders) ? ladders : []).map((ladder) => {
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
    };
  });

interface LadderTableProps {
  mode?: 'select' | 'readonly';
  selectedIds?: string[];
  setSelectedIds?: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function LaddersTable(
  { mode = 'readonly', selectedIds = [], setSelectedIds }: LadderTableProps
) {
  const { t } = useTranslation();
  const { ladders, loading, error, fetchLadders } = useLadders();

  const handleFetch = () => {
    fetchLadders();
    setShowTable(true);
  };
  //Conditional table rendering state
  const [showTable, setShowTable] = React.useState(false);

  const rows = React.useMemo(() => toLadderRows(ladders, t), [ladders, t]);

  React.useEffect(() => {
    if (mode === 'readonly' && selectedIds.length > 0){
      fetchLadders();
      setShowTable(true);
    }
  }, [ fetchLadders, mode, selectedIds.length]);

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

  const visibleRows = mode === 'readonly'
    ? rows.filter((row) => selectedIds.includes(row.id))
    : rows;

  return (
    <Box sx={{ width:'100%', margin:'25px 0' }}>
      <Divider textAlign="center" aria-hidden="true">
        <img src={laddersLogo} style={{height:'36px'}} className="logo" alt="Racquets Ladders Logo" />
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
              <Table stickyHeader sx={{ minWidth:700, tableLayout: 'fixed' }} aria-label="ladders table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell align="left">{t('ladders.header')}</StyledTableCell>
                    <StyledTableCell align="left">{t('academy.price')}</StyledTableCell>
                    {mode === 'select' && (
                      <StyledTableCell align="center">{t('academy.include')}</StyledTableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* {rows.map((row) => ( */}
                  {visibleRows.map((row) => (
                    <StyledTableRow hover key={row.id}>
                      <StyledTableCell component="th" scope="row">
                        <Stack direction="column" spacing={0.5}>
                          <strong>{row.ladderName} | {row.location}</strong>
                          <span>{t('sched.dates')}: {row.dates}</span>
                          <span>{t('sched.rankingType')}: {row.rankingType}</span>
                          <span>{t('sched.modality')}: {row.modality}</span>
                        </Stack>
                      </StyledTableCell>
                      <StyledTableCell align="left">{row.price}</StyledTableCell>
                      {mode === 'select' && (
                        <StyledTableCell align="center">
                          <input id={`ladderOption-${row.id}`}
                            type="checkbox"
                            checked={selectedIds.includes(row.id)}
                            onChange={() => handleIncludeChange(row.id)}
                            aria-label={`Include ${row.ladderName}`}
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
            p: 3, textAlign: 'center',
            bgcolor: '#F8F9FA', border: '1px dashed #bdbdbd'
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