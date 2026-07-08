import { useState, useEffect } from 'react';
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
  const { id } = useParams<{ id: string }>(); 
  // const id = localStorage.getItem('id') ?? '';
  // const { data: getaways } = useGetawaySubscribers(id);

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
            <Typography variant="h6">Getaway's assistants list</Typography>
            <Stack direction="row" spacing={2} 
            sx={{ alignItems:'center' }}>
              <Typography sx={{ mt: 1, mb: 3, color: 'text.secondary' }}>
                {subscribers?.length > 0
                  ? `${subscribers.length} subscribers registered for this getaway`
                  : 'No subscribers registered yet'
                }
              </Typography>
              <Button disableElevation size="small"
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />} 
                onClick={refetch}
                sx={{
                  width: 115, borderRadius: '18px',
                  bgcolor:BRAND.primary, color: BRAND.white, fontVariantCaps: 'normal', textTransform: 'none',
                  textTransform: 'none',
                  '&.Mui-disabled': {
                    bgcolor: 'action.disabledBackground',
                  }
                }}
                > {loading ? 'Refreshing...' : 'Refresh'} </Button>
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
                <Typography variant="body2" color="text.secondary">Fetching latest bookings...</Typography>
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
                    <StyledTableCell align="left">Id</StyledTableCell>
                    <StyledTableCell>Player's name</StyledTableCell>
                    <StyledTableCell align="left">Payment state</StyledTableCell>
                    <StyledTableCell align="right">Amount&nbsp;($)</StyledTableCell>
                    <StyledTableCell align="left">Contact</StyledTableCell>
                    <StyledTableCell align="center">Sale detail</StyledTableCell>
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
                      > Sale details </Button>
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
          <Typography variant="subtitle1" sx={{ textAlign: 'center' }}>Sale Details</Typography>
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
              <Typography variant="body1">Player's name: {selectedRow.playerName}</Typography>
              <Typography variant="body1">City: {selectedRow.city}</Typography>
              <Typography variant="body1">Payment state: {selectedRow.paymentState}</Typography>
              <Typography variant="body1">Price: ${selectedRow.price}</Typography>

              {selectedData ? (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1">Booking details</Typography>
                  <Typography variant="body1">Lodging option: {selectedData.lodgingOption}</Typography>
                  <Typography variant="body1">
                    Add Ons:
                    {selectedData.amenities.specialDinner && ' Special Dinner,'}
                    {selectedData.amenities.meetGreet && ' Meet & Greet,'}
                    {selectedData.amenities.tennisClass && ' Tennis Class'}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1">Payment details</Typography>
                  <Typography variant="body1">Taxes: ${selectedData.taxes.toFixed(2)}</Typography>
                  <Typography variant="body1">Total: ${selectedData.total.toFixed(2)}</Typography>
                </>
              ) : (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="text.secondary">No booking details available.</Typography>
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