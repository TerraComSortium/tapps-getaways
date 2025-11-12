// import { useLocation } from 'react-router-dom';
import {
  Container, Box, Stack,
  Divider, Typography, Button
} from '@mui/material';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CreditCardIcon from '@mui/icons-material/CreditCard';
// import RappsCourtsCOLLAGEdarker from '../assets/backgrounds/RappsCourtsCOLLAGEdarker.png';

function Payment() {
  const formData = JSON.parse(localStorage.getItem('selectedData') || '{}'); // Recuperar datos
  const { total, taxes, lodgingOption, amenities } = formData;
  // const location = useLocation();
  // const { formData } = location.state as any;
  // const { total, taxes } = formData;

  return (
    <>
      <Container
        sx={{
          pt: 3, pb: 3,
          width: '75%',
          display: 'flex', flexDirection: 'column', position: 'relative',
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            pt: 5,
            padding: '16px',
            alignItems: 'center', justifyContent: 'center',
            bgcolor: '#371984', borderRadius: '8px',
          }}
        >
          <center>
            <Typography component="h1" variant="h6" sx={{ mt: 2, color: '#fff', fontWeight: 'bold' }}> Order summary </Typography>
          </center>
          <Box sx={{ height: '65%'}}>
            <Stack sx={{ fontSize: 15, ml: 2, color: '#fff', p: 3, pb: 3 }}>
              <h3 className='title3'>Padel Weekend Getaway!</h3>
              <span className=''>at The Ritz-Carlton Key Biscayne Miami, Florida</span>
              <span> October 11-13, 2024</span>

              <div className=''>
                <h4>Taxes: ${taxes.toFixed(2)} USD</h4>
                <h4>Total: ${total.toFixed(2)} USD</h4>
                <h3>Total amount: ${total.toFixed(2)} USD</h3>

                <Typography>Lodging Option: {lodgingOption}</Typography>
                <Typography>
                  Add Ons:
                  {amenities?.specialDinner && ' Special Dinner,'}
                  {amenities?.meetGreet && ' Meet & Greet,'}
                  {amenities?.tennisClass && ' Tennis Class'}
                </Typography>
                <Typography>Taxes: ${taxes?.toFixed(2) || 0} USD</Typography>
                <Typography>Total: ${total?.toFixed(2) || 0} USD</Typography>
              </div>
            </Stack>
          </Box>
          <Divider aria-hidden="true" sx={{ borderColor: 'white', borderStyle: 'dashed' }} />
          <Stack sx={{ fontSize: 15, ml: 2, color: '#fff', p: 3, pb: 0 }}>
            <Typography sx={{ color: '#fff', textDecoration: 'none'}}> The payment will be submitted from your Racquets!™ account: </Typography>
          </Stack>
          <Box sx={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center'}}>
            <Card
              sx={{
                m: 1,
                p: '6 8', height: 130,
                width:'22em', bgcolor: '#fff',
              }}
            >
              <CardContent>
                <div>
                  <Typography sx={{ fontWeight: 'lg' }}> playerName 💳 </Typography>
                  <Typography sx={{ fontWeight: 'lg' }}> **** **** **** 0000 </Typography>
                </div>
              </CardContent>
            </Card>

            <Box style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop:10, marginBottom: 6 }}>
              <Button
                href="/MyGetaways"
                startIcon={<ArrowBackIcon />} type="button" variant="contained" disableElevation
                sx={{
                  minWidth: '13vw',
                  borderRadius: '8px',
                  bgcolor: '#FFF', color: '#3C1C91',
                  fontWeight: 'medium', textTransform: 'none',
                  ':hover': { bgcolor: '#3C1C91', color: 'white' },
                }}
              > Retry
              </Button>
              <Button startIcon={<CreditCardIcon />} type="submit" variant="contained"
                href="/paid"
                sx={{
                  minWidth: '15vw',
                  maxWidth: '13vw',
                  bgcolor: '#3C1C91', color: '#FFF',
                  fontWeight: 'bold', textTransform: 'none',
                  borderRadius: '8px', borderColor: 'primary.main', border: 1,
                  ':hover': { bgcolor: 'white', color: '#3C1C91' },
                }}
              > Confirm payment
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </>
  );
}
export default Payment;