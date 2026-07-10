import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, Button, IconButton, Dialog, DialogTitle, DialogContent, Divider, Stack, CircularProgress, Link
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import Paper from '@mui/material/Paper';
import CloseIcon from '@mui/icons-material/Close';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import RefreshIcon from '@mui/icons-material/Refresh';
import { styled } from '@mui/material/styles';
import { BRAND } from '../theme/colors';
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
  id: string,
  playerName: string,
  city: string,
  paymentState: string,
  price: number,
  whatsappLink: string,
) {
  return { id, playerName, city, paymentState, price, whatsappLink };
}

const rows = [
  createData('1', 'Joe Doe', 'Miami', 'Pending', 240, 'wa.me/59178326628'),
  createData('2', 'Ann Taylor', 'Las Palmas', 'Approved', 370, 'wa.me/1+number'),
  createData('3', 'Alan Smith', 'Miami', 'Rejected', 240.5, 'wa.me/+number'),
];

interface RowData {
  id: string;
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
  const { id } = useParams<{ id: string }>();
  // const id = localStorage.getItem('id') ?? '';

  const { data: subscribers, loading, error, refetch } = useGetawaySubscribers(id || '');
  console.log(subscribers);
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<RowData | null>(null);
  const [selectedData, setSelectedData] = useState<SelectedData | null>(null);

  useEffect(() => {
    const data = localStorage.getItem('selectedData');
    console.log("localstorage data ", data)
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
  // if (loading) return <p>Loading Bookings...</p>;
  if (error) return <p>Error: {error}</p>;
  return (
    <>
      <Grid container columnSpacing={{ xs: 0, sm: 2, md: 3 }}>
        <AdminSideBar />
        <Grid size={{ xs: 12, sm: 9, md: 10 }} className="section blueBg">
          <Box>
            <Typography variant="h6">{t('reservations.assistantsList')}</Typography>
            <Stack direction="row" spacing={2}
            sx={{ alignItems:'center' }}>
              <Typography sx={{ mt: 1, mb: 3, color: 'text.secondary' }}>
                {subscribers?.length > 0
                  ? t('reservations.subscribersCount', { count: subscribers.length })
                  : t('reservations.noSubscribers')
                }
              </Typography>
              <Button disableElevation size="small"
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
                onClick={refetch}
                sx={{
                  width: 115, borderRadius: '18px',
                  bgcolor:BRAND.primary, color: BRAND.white, fontVariantCaps: 'normal', textTransform: 'none',
                  '&.Mui-disabled': {
                    bgcolor: 'action.disabledBackground',
                  }
                }}
                > {loading ? t('reservations.refreshing') : t('reservations.refresh')} </Button>
            </Stack>
            {loading ? (
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '250px',
                bgcolor: 'background.paper',
                borderRadius: '12px'
              }}>
                <CircularProgress size={36} sx={{ color: BRAND.primary, mb: 2 }}/>
                <Typography variant="body2" color="text.secondary">{t('reservations.fetchingBookings')}</Typography>
              </Box>
            ):(
              <ul>
                {subscribers?.map((subscriber: any) => (
                  <li key={subscriber.id}>{subscriber.name} - {subscriber.email}</li>
                ))}
              </ul>
            )}

            <TableContainer component={Paper} sx={{ overflowX: 'auto', width: '100%' }}>
              <Table sx={{ minWidth: 650 }} aria-label="customized table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell align="left">{t('reservations.id')}</StyledTableCell>
                    <StyledTableCell>{t('reservations.playerName')}</StyledTableCell>
                    <StyledTableCell align="left">{t('reservations.paymentState')}</StyledTableCell>
                    <StyledTableCell align="right">{t('reservations.amount')}&nbsp;($)</StyledTableCell>
                    <StyledTableCell align="left">{t('reservations.contact')}</StyledTableCell>
                    <StyledTableCell align="center">{t('reservations.saleDetail')}</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                  <StyledTableRow key={row.playerName}>
                    <StyledTableCell align="left">{row.id}</StyledTableCell>
                    <StyledTableCell component="th" scope="row">
                      {row.playerName}
                    </StyledTableCell>
                    <StyledTableCell align="left">{row.paymentState}</StyledTableCell>
                    <StyledTableCell align="right">{row.price}</StyledTableCell>
                    <StyledTableCell align="left">
                      <Link target="_blank" href={`https://${row.whatsappLink}`}>
                        {row.whatsappLink}
                      </Link>
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <Button startIcon={<CreditCardIcon />}
                        onClick={() => handleOpenDialog(row)}
                        sx={{ width: 136, bgcolor: BRAND.primary, color: BRAND.white, fontWeight: 'medium', textTransform: 'none', borderRadius: '8px', }}
                      > {t('reservations.saleDetails')} </Button>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Grid>     
      </Grid>     

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
          ><CloseIcon />
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
};
export default Reservations;