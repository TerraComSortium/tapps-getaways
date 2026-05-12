import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Box, Stack,
  Divider, Typography, Button
} from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CreditCardIcon from '@mui/icons-material/CreditCard';

function Payment() {
  const navigate = useNavigate();
  const formData = JSON.parse(localStorage.getItem('selectedData') || '{}');
  const { total = 0, taxes = 0, lodgingOption = '', amenities = {} } = formData;

  useEffect(() => {
    if (!formData.total) navigate('/bookgetaway', { replace: true });
  }, []);

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
          <Typography component="h1" variant="h6" sx={{ mt: 2, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
            Order summary
          </Typography>
          <Box sx={{ height: '65%' }}>
            <Stack sx={{ fontSize: 15, ml: 2, color: '#fff', p: 3, pb: 3 }}>
              <Typography variant="h6" className='title3'>Padel Weekend Getaway!</Typography>
              <Typography variant="body2">at The Ritz-Carlton Key Biscayne Miami, Florida</Typography>
              <Typography variant="body2">October 11-13, 2024</Typography>

              <Box sx={{ mt: 1 }}>
                <Typography>Lodging Option: {lodgingOption}</Typography>
                <Typography>
                  Add Ons:
                  {amenities?.specialDinner && ' Special Dinner,'}
                  {amenities?.meetGreet && ' Meet & Greet,'}
                  {amenities?.tennisClass && ' Tennis Class'}
                </Typography>
                <Typography>Taxes: ${taxes?.toFixed(2) || '0.00'} USD</Typography>
                <Typography>Total: ${total?.toFixed(2) || '0.00'} USD</Typography>
              </Box>
            </Stack>
          </Box>
          <Divider aria-hidden="true" sx={{ borderColor: 'white', borderStyle: 'dashed' }} />
          <Stack sx={{ fontSize: 15, ml: 2, color: '#fff', p: 3, pb: 0 }}>
            <Typography sx={{ color: '#fff', textDecoration: 'none' }}>
              The payment will be submitted from your Racquets!™ account:
            </Typography>
          </Stack>
          <Box sx={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Card
              sx={{
                m: 1,
                padding: '6px 8px', height: 130,
                width: '22em', bgcolor: '#fff',
              }}
            >
              <CardContent>
                <Box>
                  <Typography sx={{ fontWeight: 'bold' }}>playerName 💳</Typography>
                  <Typography sx={{ fontWeight: 'bold' }}>**** **** **** 0000</Typography>
                </Box>
              </CardContent>
            </Card>

            <Box style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 10, marginBottom: 6 }}>
              <Button
                href="/mygetaways"
                startIcon={<ArrowBackIcon />} type="button" variant="contained" disableElevation
                sx={{
                  minWidth: '13vw',
                  borderRadius: '8px',
                  bgcolor: '#FFF', color: '#3C1C91',
                  fontWeight: 'medium', textTransform: 'none',
                  ':hover': { bgcolor: '#3C1C91', color: 'white' },
                }}
              >Retry</Button>
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
              >Confirm payment</Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </>
  );
}
export default Payment;
