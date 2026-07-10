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

export interface LadderRow {
  id: number;
  tournamentName: string;
  location: string;
  dates: string;
  rankingType: string;
  modality: string;
  price: string;
  included: boolean;
}

const initialRows: LadderRow[] = [
  {
    id: 1,
    tournamentName: "Nombre Torneo",
    location: "Sede",
    dates: "14/12/25 - 15/12/25",
    rankingType: "A",
    modality: "singles",
    price: "Included in Getaway™",
    included: false,
  },
  {
    id: 2,
    tournamentName: "Nombre Torneo",
    location: "Sede",
    dates: "14/12/25 - 15/12/25",
    rankingType: "A",
    modality: "singles",
    price: "237$ per person",
    included: false,
  },
];

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

export default function LaddersTable() {
  const { t } = useTranslation();
  const [rows, setRows] = React.useState<LadderRow[]>(initialRows);

  //Conditional table rendering state
  const [showTable, setShowTable] = React.useState(false);

  const handleIncludeChange = (id: number) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === id ? { ...row, included: !row.included } : row
      )
    );
  };

  const handleResetTable = () => {
    setRows(initialRows);
    setShowTable(false);
  };

  return (
    <Box sx={{ width:'100%', margin:'25px 0' }}>
      <Divider textAlign="center" aria-hidden="true">
        <img src={laddersLogo} style={{height:'36px'}} className="logo" alt="Racquets Ladders Logo" />
      </Divider>
      {showTable ? (
        <>
          <p>{t('ladders.addPrompt')}</p>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth:700 }} aria-label="customized table">
              <TableHead>
                <TableRow>
                  <StyledTableCell align="left">{t('ladders.header')}</StyledTableCell>
                  <StyledTableCell align="left">{t('academy.price')}</StyledTableCell>
                  <StyledTableCell align="center">{t('academy.include')}</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <StyledTableRow key={row.id}>
                    <StyledTableCell component="th" scope="row">
                      <Stack direction="column" spacing={0.5}>
                        <strong>{row.tournamentName} | {row.location}</strong>
                        <span>{t('sched.dates')}: {row.dates}</span>
                        <span>{t('sched.rankingType')}: {row.rankingType}</span>
                        <span>{t('sched.modality')}: {row.modality}</span>
                      </Stack>
                    </StyledTableCell>
                    <StyledTableCell align="left">{row.price}</StyledTableCell>
                    <StyledTableCell align="center">
                      <input id={`ladderOption-${row.id}`} 
                        type="checkbox"
                        checked={row.included}
                        onChange={() => handleIncludeChange(row.id)}
                        aria-label={`Include ${row.tournamentName}`}
                      />
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Hide table and reset */}
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
              onClick={() => setShowTable(true)}
              sx={{ px: 4, borderRadius: '20px', bgcolor: BRAND.primary, textTransform: 'none' }}
            > {t('academy.showSessions')}
            </Button>
          </CardActions>
        </Card>
      )}
    </Box>
  );
}