import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { BRAND } from '../theme/colors';
import { Container, Divider, Stack, Box, Typography, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TaskAltIcon from '@mui/icons-material/TaskAlt';

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import LoopIcon from '@mui/icons-material/Loop';

import { useTranslation } from 'react-i18next';
import '../App.css';
function Paid() {
  const { t } = useTranslation();
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
        pt:4, pb:4, width: { xs: '100%', sm: '75%', md:'70%' },
        display:"flex", flexDirection: 'column',
      }}
    >
      <Box sx={{
        // mt:2,
        pt:7,
        alignItems: 'center', justifyContent: 'center', bgcolor:BRAND.purpleBg
      }}>
        {/* 1 if needed bank auth*/}
        {requiresAction ? (
          <Stack spacing={2} alignItems="center">
            <LoopIcon sx={{ fontSize: 70, color: BRAND.primary }} className="spin-animation" />
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: BRAND.primary }}>
              {t('paid.authRequired')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('paid.authRequiredDetail')}
            </Typography>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', bgcolor: BRAND.bgPaper, p: 1 }}>
              {t('paid.status')}: {paymentStatus}
            </Typography>
          </Stack>
        ) : success ? (
          /* 2 Direct successfull payment */
          <center>
            <Stack spacing={1} alignItems="center">
              <TaskAltIcon sx={{ fontSize: 35, color:BRAND.white}}  />
              <Typography component="h1" variant="h6" sx={{ fontWeight: 'bold', color: BRAND.white }}>
                {t('paid.successTitle')}
              </Typography>
              <Typography variant="body1" sx={{ color: BRAND.white }}>
                {t('paid.successSubtitle')}
              </Typography>

              <Box sx={{ bgcolor: BRAND.bgPaper, p: 1, borderRadius: '8px', mt: 2, textAlign: 'left', width: '65%'}}>
                <Typography variant="subtitle2" display="block"><strong>{t('paid.orderId')}:</strong>{ orderId}</Typography>
                <Typography variant="subtitle2" display="block"><strong>{t('paid.status')}:</strong> {paymentStatus || 'succeeded'}</Typography>
                <Typography variant='subtitle2' sx={{ pb:3, textDecoration: 'none' }}
                > {t('paid.receiptNote')} </Typography>
              </Box>
              <Button startIcon={<ShoppingBagIcon />} variant="contained"
                onClick={() => navigate(ROUTES.MY_ORDERS)}
                sx={{ mt:10, mb:5, bgcolor: BRAND.primary, borderColor: 'primary.main', border: 1,  textTransform: 'none', borderRadius: '8px', px: 4, 
                  ':hover': { bgcolor: BRAND.white, color: BRAND.primary},  
                }}
              > {t('paid.viewBookings')}
              </Button>
            </Stack>
          </center>
        ) : (
          /* 3 payment denied or failed */
          <center>
          <Stack spacing={2} alignItems="center">
            <ErrorOutlineIcon sx={{ fontSize:70, color:BRAND.white }} />
            <Typography component="h3" variant="body1" sx={{ fontWeight: 'semibold', color:BRAND.white }}> {t('paid.declinedTitle')}
            </Typography>
            <Typography variant="body1" color={BRAND.white}>
              {t('paid.declinedDetail')}
            </Typography>

            <Button
              variant="contained"
              onClick={() => navigate(-1)}
              sx={{ mt:3, mb:3, minWidth: { xs: '190px', sm: '190px' }, bgcolor: BRAND.primary, color: BRAND.white, textTransform: 'none', borderRadius: '8px', px: 4,
                ':hover': { bgcolor: BRAND.white, color: BRAND.primary},
                borderColor: 'primary.main', border: 1
              }}
            > {t('paid.tryAgain')}
            </Button><br/>
          </Stack>
          </center>
        )}
          <Divider aria-hidden="true" sx={{ borderColor: 'white', borderStyle: 'dashed', mt:2 }} />
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
              > {t('paid.searchMore')}
              </Button>
            </Stack>
          </Box>
        </Box>
      </Container>
    </>
  )
}
export default Paid;