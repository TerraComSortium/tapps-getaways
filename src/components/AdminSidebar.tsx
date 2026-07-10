import { Box, Button, IconButton, CircularProgress } from '@mui/material';
import Grid from '@mui/material/Grid2';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import AddIcon from '@mui/icons-material/Add';

import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from '../constants/routes';
import { Role } from '../constants/roles';
import { BRAND } from '../theme/colors';

export default function AdminSideBar() {
  const { t } = useTranslation();
  const { role, isLoading } = useAuth();
  if(isLoading){
    return(
      <Box display="flex" justifyContent="center" alignItems="center" height={400}>
        <CircularProgress />
      </Box>
    );
    //(<Skeleton variant="rectangular" width={300} height={400} sx={{borderRadius:'15px'}}/>);
  }
  return (
    <>
      <Grid size={{ xs: 12, sm: 3, md: 2 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'row', sm: 'row', md: 'column' },
            flexWrap:'wrap',
            alignItems:  { xs: 'center', sm: 'center' },
            alignContent: 'start',
            justifyContent: { xs: 'center', sm: 'center', md: 'center' },
            gap: 1,
            px: { xs: 2, sm: 2, md: 1.5 },
            pt: { xs: 1.5, sm: 0 },
            pb: { xs: 1.5, sm: 0 },
            mt: { xs: 0, sm: 2.5 },
            borderBottom: { xs: '1px solid rgba(50, 28, 28, 0.1)', sm: 'none' },
          }}>
          {/* {role === Role.PLAYER && ( */}
            <Button
              component="a"
              disableElevation variant="contained" aria-label="getaways-offers"
              href={ROUTES.GETAWAYS}
              sx={{
                flex: { xs: 1, sm: 'unset' },
                minWidth:'155px',
                width: { xs:'auto', sm:'155px'},
                mb: { xs: 0, sm: 1 },
                padding: '5px 0px',
                overflow: 'hidden',
                bgcolor: BRAND.primary, color: BRAND.white, borderRadius: '8px', fontWeight: 'medium', textTransform: 'none', whiteSpace: 'nowrap'
              }}
            >
              <IconButton aria-label="getaways-offers" sx={{ color: BRAND.lime }}><SportsTennisIcon /></IconButton>
              {t('nav.getaways')} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </Button>
          {/* )} */}
          {role === Role.PLAYER && (
          // {role === 'player' && (
            <Button
              component="a"
              href={ROUTES.MY_ORDERS}
              disableElevation variant="contained" aria-label="my-getaways-orders"
              sx={{
                flex: { xs: 1, sm: 'unset' },
                minWidth:'155px',
                width: { xs: 'auto', sm: '155px' },
                mb: { xs: 0, sm: 1 },
                padding: '5px 0px',
                overflow: 'hidden',
                bgcolor: BRAND.primary, color: BRAND.white, borderRadius: '8px', fontWeight: 'medium', textTransform: 'none', whiteSpace: 'nowrap',
              }}
            >
              <IconButton aria-label="my-orders" sx={{ color:BRAND.lime, pl:'0' }}><ShoppingBagIcon /></IconButton>
              {t('sidebar.myGetaways')}
            </Button>
          )}
          {role === Role.ADMIN && (
            <Button
              component="a"
              disableElevation variant="contained" aria-label="my-getaways-offers"
              href={ROUTES.MY_GETAWAYS}
              sx={{
                flex: { xs: 1, sm: 'unset' },
                minWidth:'155px',
                width: { xs: 'auto', sm: '155px' },
                mb: { xs: 0, sm: 1 },
                padding: '5px 5px',
                overflow: 'hidden',
                bgcolor: BRAND.primary, color: BRAND.white, borderRadius: '8px', fontWeight: 'medium', textTransform: 'none', whiteSpace: 'nowrap'
              }}
            >
              <IconButton aria-label="my-getaways-offers" sx={{ color: BRAND.lime, pl: '0' }}><NoteAltIcon /></IconButton>
              {t('sidebar.myGetaways')}
            </Button>
          )}
          {role === Role.ADMIN && (
            <Button
              // component="a"
              href={ROUTES.CREATE_GETAWAY}
              disableElevation variant="contained" aria-label="create-getaways"
              sx={{
                flex: { xs: 1, sm: 'unset' },
                minWidth:'155px',
                width: { xs: 'auto', sm: '155px' },
                mb: { xs: 0, sm: 1 },
                padding: '5px 0px',
                overflow: 'hidden',
                bgcolor: BRAND.primary, color: BRAND.white, borderRadius: '8px', fontWeight: 'medium', textTransform: 'none', whiteSpace: 'nowrap'
              }}
            >
              <IconButton aria-label="create-getaway" sx={{ color: BRAND.lime, pl: '0' }}><AddIcon /></IconButton>
              {t('sidebar.newGetaway')}
            </Button>
          )}
        </Box>
      </Grid>
    </>
  );
}