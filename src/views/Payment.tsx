import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Container, Box, Stack,
  Divider, Typography, Button, CircularProgress
} from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import '../App.css';

import { processPayment } from '../services/payment/payment';
// import { createPurchase, Reservation } from '../services/purchase/purchase';
function Payment() {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const orderData = location.state?.dataForPayment || JSON.parse(localStorage.getItem('selectedData') || '{}');

  const paymentDetails = orderData?.paymentDetails || {};
  const lodgingOption = orderData?.lodgingOption || {};
  const optionalAddOns = orderData?.optionalAddOns || [];
  const user = orderData?.user || {};
  const getawayTitle = orderData?.getawayTitle || "Unavailable getaway name";
  const getawayAddress = orderData?.getawayAddress || "Unavailable address";
  const getawayDates = orderData?.getawayDates || "Unavailable dates";

  // const formData = JSON.parse(localStorage.getItem('selectedData') || '{}');
  // const { total = 0, taxes = 0, lodgingOption = '', amenities = {} } = formData;
  console.log("state received:", location.state);
  console.log("LocalStorage:", localStorage.getItem('selectedData'));
  useEffect(() => {
    if (!paymentDetails?.Total) {
    // if (!orderData || !orderData.paymentDetails || !orderData.paymentDetails.Total 
      // ||!paymentDetails.Total || !orderId
    // ){
      console.log("Datos no encontrados, redirirect...");
      navigate('/getaways', { replace: true });
    }
  }, [
    // orderData,
    paymentDetails,
    // orderId,
    navigate]);

  const handleConfirmPayment =  async () => {
    setIsProcessing(true);
    try{
      const numericTotal = parseFloat((paymentDetails.Total || '0').replace('USD', ''));

      const payload = {
        orderId: orderId || orderData.orderId,
        paymentMethodId: 'pm_card_visa',
        amount: numericTotal,
        currency: 'usd'
      };
      const response = await processPayment(payload);
      localStorage.removeItem('selectedData');
      navigate('/paid',{
        state: {
          paymentResult: {
            success: response.success,
            orderId: response.orderId,
            paymentStatus: response.paymentStatus,
            requiresAction: response.requiresAction,
            clientSecret: response.clientSecret
          }
        }
      });
    }catch(error){
      //todo: change with snackbar
      console.error("Payment failed", error);
      navigate('/paid', {
        state: {
          paymentResult: { success: false, paymentStatus: 'failed' } 
        } 
      });
    }finally{
      setIsProcessing(false);
    }
  };
  return (
    <>
      <div className="background-blueCourt"></div>
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
          <Typography 
          component="h3" 
          variant="body" sx={{ mt: 4, color: '#fff', fontWeight: 'semibold', textAlign: 'center' }}>
            Order summary
          </Typography>
          <Box sx={{ height: '65%' }}>
            <Stack sx={{ fontSize: 15, ml: 2, color: '#fff', p: 3, pb: 3 }}>
              <Typography component="h3" variant="body2">{getawayTitle}</Typography>
              <Typography variant="body2">{getawayAddress}</Typography>
              <Typography variant="body2">{getawayDates}</Typography>

              <Box sx={{ mt: 3 }}>
                <Typography sx={{ fontWeight: 'bold' }} >Lodging Option:</Typography>
                <Typography sx={{ ml: 2, mb: 1 }}> {lodgingOption.option} - ${lodgingOption.price}</Typography>
                {optionalAddOns.length > 0 && (
                  <>
                    <Typography sx={{ fontWeight: 'bold', mt: 1 }}> Add Ons:</Typography>
                      {optionalAddOns.map((addon: any, index: number) => (
                        <Typography key={index} sx={{ ml: 2 }}>
                          {addon.addonName} - ${addon.price} USD
                        </Typography>
                      ))}
                  </>
                )}
                <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid rgba(255,255,255,0.3)'}}>
                  <Typography>Subtotal: {paymentDetails.Subtotal}</Typography>
                  <Typography>Taxes: {paymentDetails.Taxes}</Typography>
                  <Typography sx={{ fontWeight: 'bold', fontSize: '1.1rem'}}>Total: {paymentDetails.Total}</Typography>
                </Box>
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
                  <Typography sx={{ fontWeight: 'bold' }}>{user.name || 'Player'} 💳</Typography>
                  <Typography sx={{ fontWeight: 'bold', color: 'text.secondary' }}>**** **** **** 0000</Typography>
                </Box>
              </CardContent>
            </Card>

            <Box style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 10, marginBottom: 6 }}>
              <Button
                onClick={() => navigate(-1)}
                // onClick={() => navigate('/mygetaways')}
                startIcon={<ArrowBackIcon />} variant="contained" disableElevation 
                disabled={isProcessing}
                sx={{
                  minWidth: '13vw',
                  borderRadius: '8px',
                  bgcolor: '#FFF', color: '#3C1C91',
                  fontWeight: 'medium', textTransform: 'none',
                  ':hover': { bgcolor: '#3C1C91', color: 'white' },
                }}
              >Retry</Button>
              <Button
                onClick={handleConfirmPayment}
                startIcon={
                  isProcessing ? <CircularProgress size={20} color="inherit" /> 
                  : <CreditCardIcon />
                }
                type="submit" variant="contained"
                disabled={isProcessing}
                sx={{
                  minWidth: '15vw',
                  maxWidth: '13vw',
                  bgcolor: '#3C1C91', color: '#FFF',
                  fontWeight: 'bold', textTransform: 'none',
                  borderRadius: '8px', borderColor: 'primary.main', border: 1,
                  ':hover': { bgcolor: 'white', color: '#3C1C91' },
                }}
              >{isProcessing ? 'Processing...' : 'Confirm payment'}</Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </>
  );
}
export default Payment;