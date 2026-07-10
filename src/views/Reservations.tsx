import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, IconButton, Typography, Divider
} from '@mui/material';
import { BRAND } from '../theme/colors';
import Grid from '@mui/material/Grid2';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
import CloseIcon from '@mui/icons-material/Close';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AdminSideBar from '../components/AdminSidebar';
import { useGetawaySubscribers } from '../hooks/useGetawaySubscribers';

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
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

function createData(
  playerName: string,
  city: string,
  paymentState: string,
  price: number,
  whatsappLink: string,
) {
  return { playerName, city, paymentState, price, whatsappLink };
}

const rows = [
  createData('Joe Doe', 'Miami', 'Pending', 240, 'wa.me/59178326628'),
  createData('Ann Taylor', 'Las Palmas', 'Approved', 370, 'wa.me/1+number'),
  createData('Alan Smith', 'Miami', 'Rejected', 240.5, 'wa.me/+number'),
];

interface RowData {
  playerName: string;
  city: string;
  paymentState: string;
  price: number;
  whatsappLink: string;
}

interface SelectedData {
  lodgingOption: string;
  amenities: {
    specialDinner: boolean;
    meetGreet: boolean;
    tennisClass: boolean;
  };
  taxes: number;
  total: number;
}

function Reservations() {
  const { t } = useTranslation();
  const id = localStorage.getItem('id') ?? '';
  const { data: getaways } = useGetawaySubscribers(id);
  console.log(getaways);

  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<RowData | null>(null);
  const [selectedData, setSelectedData] = useState<SelectedData | null>(null);

  useEffect(() => {
    const data = localStorage.getItem('selectedData');
    console.log("data que vamos creando ", data)
    if (data) {
      setSelectedData(JSON.parse(data));
    }
  }, []);

  const handleOpenDialog = (row: RowData) => {
    setSelectedRow(row);
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setSelectedRow(null);
  };

  return (
    <>
      <Box sx={{ width: '100%', overflow: 'hidden' }}>
      <Grid container columnSpacing={{ sm: 2, md: 3 }}>
        <AdminSideBar />
        <Grid size={{ xs: 12, sm: 9, md: 10 }} className="section blueBg" sx={{ minWidth: 0 }}>
          <Box>
            <Typography variant="h6">{t('reservations.playersList')}</Typography>
          </Box>
          <TableContainer component={Paper} sx={{ overflowX: 'auto', width: '100%' }}>
            <Table sx={{ minWidth: 650 }} aria-label="customized table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>{t('reservations.playerName')}</StyledTableCell>
                  <StyledTableCell align="left">{t('reservations.city')}</StyledTableCell>
                  <StyledTableCell align="left">{t('reservations.paymentState')}</StyledTableCell>
                  <StyledTableCell align="right">{t('reservations.price')}&nbsp;($)</StyledTableCell>
                  <StyledTableCell align="left">{t('reservations.whatsapp')}</StyledTableCell>
                  <StyledTableCell align="center">{t('reservations.saleDetail')}</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <StyledTableRow key={row.playerName}>
                    <StyledTableCell component="th" scope="row">
                      {row.playerName}
                    </StyledTableCell>
                    <StyledTableCell align="left">{row.city}</StyledTableCell>
                    <StyledTableCell align="left">{row.paymentState}</StyledTableCell>
                    <StyledTableCell align="right">{row.price}</StyledTableCell>
                    <StyledTableCell align="left">
                      <Link target="_blank" href={`https://${row.whatsappLink}`}>
                        {row.whatsappLink}
                      </Link>
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <Button
                        onClick={() => handleOpenDialog(row)}
                        startIcon={<CreditCardIcon />}
                        sx={{
                          padding: '0px 18px',
                          bgcolor: BRAND.primary, color: BRAND.white, fontWeight: 'medium', textTransform: 'none',
                        }}
                      >
                        {t('reservations.saleDetails')}
                      </Button>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
      </Box>

      {/* Receipt Modal */}
      <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="subtitle1" sx={{ textAlign: 'center' }}>{t('reservations.saleDetails')}</Typography>
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedRow && (
            <>
              <Typography variant="body1">{t('reservations.playerName')}: {selectedRow.playerName}</Typography>
              <Typography variant="body1">{t('reservations.city')}: {selectedRow.city}</Typography>
              <Typography variant="body1">{t('reservations.paymentState')}: {selectedRow.paymentState}</Typography>
              <Typography variant="body1">{t('reservations.priceLabel')}: ${selectedRow.price}</Typography>

              {selectedData ? (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1">{t('reservations.bookingDetails')}</Typography>
                  <Typography variant="body1">{t('reservations.lodgingOption')}: {selectedData.lodgingOption}</Typography>
                  <Typography variant="body1">
                    {t('reservations.addOns')}:
                    {selectedData.amenities.specialDinner && ` ${t('reservations.specialDinner')},`}
                    {selectedData.amenities.meetGreet && ` ${t('reservations.meetGreet')},`}
                    {selectedData.amenities.tennisClass && ` ${t('reservations.tennisClass')}`}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1">{t('reservations.paymentDetails')}</Typography>
                  <Typography variant="body1">{t('reservations.taxes')}: ${selectedData.taxes.toFixed(2)}</Typography>
                  <Typography variant="body1">{t('reservations.total')}: ${selectedData.total.toFixed(2)}</Typography>
                </>
              ) : (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="text.secondary">{t('reservations.noBookingDetails')}</Typography>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default Reservations;
