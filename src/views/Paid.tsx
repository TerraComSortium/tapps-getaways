import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { BRAND } from '../theme/colors';
import { Container, Divider, Stack, Box, Typography, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TaskAltIcon from '@mui/icons-material/TaskAlt';

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import LoopIcon from '@mui/icons-material/Loop';

import '../App.css';
function Paid() {
  const location = useLocation();
  const navigate = useNavigate();
  const paymentResult = location.state?.paymentResult;
  useEffect(() => {
    //route filter
    if (!paymentResult) {
      navigate(ROUTES.GETAWAYS, { replace: true });
    }
  }, [paymentResult, navigate]);
  if (!paymentResult) return null;
  const { success, orderId, paymentStatus, requiresAction } = paymentResult;
  return (
    <>
    <div className="background-blueCourt"></div>
      <Container
        sx={{
          pt:4, pb:4,
          width: { xs: '100%', sm: '70%' },
          display:"flex", flexDirection: 'column',
        }}
      >
        <Box sx={{
          // mt:8,
          pt:10,
          alignItems: 'center', justifyContent: 'center',
          bgcolor:BRAND.purpleBg
        }}>
        {/* 1 if needed bank auth*/}
        {requiresAction ? (
          <Stack spacing={2} alignItems="center">
            <LoopIcon sx={{ fontSize: 70, color: BRAND.primary }} className="spin-animation" />
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: BRAND.primary }}>
              Authentication Required
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your bank requires extra verification. In a complete integration, Stripe Elements would trigger a verification modal here using the clientSecret.
            </Typography>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', bgcolor: BRAND.bgPaper, p: 1 }}>
              Status: {paymentStatus}
            </Typography>
          </Stack>
        ) : success ? (
          /* 2 Direct successfull payment */
          <center>
            <Stack spacing={2} alignItems="center">
              <CheckCircleOutlineIcon sx={{ fontSize: 70, color: BRAND.white }} />
              <TaskAltIcon sx={{ color:BRAND.white}}  />
              <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold', color: BRAND.white }}>
                Payment Successful! 🎉
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Thank you for your purchase. Your spot in this Getaway is secure.
              </Typography>
              
              <Box sx={{ bgcolor: BRAND.bgPaper, p: 2, borderRadius: '8px', width: '100%', mt: 2, textAlign: 'left' }}>
                <Typography variant="caption" display="block" color={BRAND.white}>
                  <strong>Order ID:</strong> {orderId}
                </Typography>
                <Typography variant="caption" display="block" color={BRAND.white}>
                  <strong>Status:</strong> {paymentStatus || 'succeeded'}
                </Typography>
                <Typography
                  sx={{
                    pb:10,
                    color: BRAND.white, textDecoration: 'none'
                  }}>
                  The payment receipt will be sent to your registered email address.
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<LibraryBooksIcon />}
                onClick={() => navigate(ROUTES.MY_ORDERS)}
                sx={{ mt: 3, bgcolor: BRAND.primary, color: BRAND.white, textTransform: 'none', borderRadius: '8px', px: 4 }}
              > View My Bookings
              </Button>
            </Stack>
          </center>
        ) : (
          /* 3 payment denied or failed */
          <center>
          <Stack spacing={2} alignItems="center">
            <ErrorOutlineIcon sx={{ fontSize:70, color:BRAND.white }} />
            <Typography component="h3" variant="body1" sx={{ fontWeight: 'semibold', color:BRAND.white }}> Payment Declined
            </Typography>
            <Typography variant="body1" color={BRAND.white}>
              We couldn't process your payment. Please check your card details or use a different payment method.
            </Typography>

            <Button
              variant="contained"
              onClick={() => navigate(-1)}
              sx={{ mt:3, mb:3, minWidth: { xs: '190px', sm: '190px' }, bgcolor: BRAND.primary, color: BRAND.white, textTransform: 'none', borderRadius: '8px', px: 4,
                ':hover': { bgcolor: BRAND.white, color: BRAND.primary},
                  borderColor: 'primary.main', border: 1
              }}
            > Try Again
            </Button><br/>
          </Stack>
          </center>
        )}
          <Divider aria-hidden="true" sx={{ borderColor: 'white', borderStyle: 'dashed' }} />
          <Box>
            <Stack sx={{
              m:2,
              display:"flex", flexDirection: 'row',
              alignItems: 'center', justifyContent: 'center'
            }}>
              <Button startIcon={<ArrowBackIcon />} type="button" variant="contained"
                href={ROUTES.GETAWAYS}
                sx={{
                  mt: 1, mb: 3, borderRadius:'8px',
                  minWidth: { xs: '200px', sm: '220px' },
                  bgcolor: BRAND.primary, color: BRAND.white, fontWeight: 'bold', textTransform: 'none',
                  ':hover': { bgcolor: BRAND.white, color: BRAND.primary},
                  borderColor: 'primary.main', border: 1
                }}
              > Search more getaways!
              </Button>
            </Stack>
          </Box>
        </Box>
      </Container>
    </>
  )
}
export default Paid;