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
import academy from '../assets/RappsIcons/academyLogo.svg';

export interface AcademyRow {
  id: number;
  day: string;
  startTime: string;
  endTime: string;
  location: string;
  court: string;
  trainers: string;
  price: number;
  priceLabel: string;
  included: boolean;
}

const initialRows: AcademyRow[] = [
  {
    id: 1,
    day: "Saturday",
    startTime: "10:00",
    endTime: "12:00",
    location: "Salitre",
    court: "Cancha #4",
    trainers: "E. Panche",
    price: 0,
    priceLabel: "Included in Getaway™",
    included: true,
  },
  {
    id: 2,
    day: "Saturday",
    startTime: "12:00",
    endTime: "13:00",
    location: "Salitre",
    court: "Cancha #2",
    trainers: "E. Panche",
    price: 60,
    priceLabel: "/ Per person",
    included: false,
  },
];

//Styled components
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

export default function AcademyTable() {
  const [rows, setRows] = React.useState<AcademyRow[]>(initialRows);

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
    <Box sx={{ width:'100%', margin:'25px 0' }} >
      <Divider textAlign="center" aria-hidden="true" sx={{ mb: 2 }}>
        <img src={academy} style={{height:'36px'}} className="logo" alt="Racquets Academy Logo" />
      </Divider>

      {showTable ? (
        <>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Select the Academy&trade; class sessions you want to include:
          </Typography>

          <TableContainer component={Paper} elevation={3}>
            <Table aria-label="customized table" sx={{ minWidth:700 }}>
              <TableHead>
                <TableRow>
                  <StyledTableCell align="left">Weekday</StyledTableCell>
                  <StyledTableCell align="left">Location</StyledTableCell>
                  <StyledTableCell align="left">Trainer</StyledTableCell>
                  <StyledTableCell align="left">Price</StyledTableCell>
                  <StyledTableCell align="center">Include</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <StyledTableRow key={row.id}>
                    <StyledTableCell component="th" scope="row">
                      <Stack direction="column" spacing={0.5}>
                        <strong>{row.day}</strong>
                        <span>{row.startTime}</span>
                        <span>{row.endTime}</span>
                      </Stack>
                    </StyledTableCell>
                    <StyledTableCell component="th" scope="row">
                      <Stack direction="column" spacing={0.5}>
                        <strong>{row.location}</strong>
                        <span>Court: {row.court}</span>
                      </Stack>
                    </StyledTableCell>
                    <StyledTableCell component="th" scope="row">
                      <Stack direction="column" spacing={0.5}>
                        <span>{row.trainers}</span>
                      </Stack>
                    </StyledTableCell>
                    <StyledTableCell align="left" component="th" scope="row">
                      <Stack direction="column" spacing={0.5}>
                        <span>{row.price}$</span>
                        <span>{row.priceLabel}</span>
                      </Stack>
                    </StyledTableCell>

                    <StyledTableCell align="center">
                      <input type="checkbox" id={`academyOption-${row.id}`}
                        checked={row.included}
                        onChange={() => handleIncludeChange(row.id)}
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
          > Remove Selection
          </Button>
        </>

      ) : (
        <Card variant="outlined" sx={{
            p: 3, textAlign: 'center',
            bgcolor: '#F8F9FA', border: '1px dashed #bdbdbd'
          }}>
          <CardContent>
            <Typography variant="h6" component="div" gutterBottom sx={{ fontWeight: 'bold', color: BRAND.primary }}> Enhance your Getaway </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Do you want to see available <strong>Racquets Academy&trade;</strong> sessions for these dates?
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: 'center' }}>
            <Button startIcon={<CheckCircleOutlineIcon />} variant="contained"  size="large"
              onClick={() => setShowTable(true)}
              sx={{ px: 4, borderRadius: '20px', bgcolor: BRAND.primary, textTransform: 'none' }}
            > Show available sessions
            </Button>
          </CardActions>
        </Card>
      )}
    </Box>
  );
}