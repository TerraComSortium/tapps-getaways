import { Box, Button, IconButton, CircularProgress } from '@mui/material';
import Grid from '@mui/material/Grid2';
import AddIcon from '@mui/icons-material/Add';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from '../constants/routes';
import { Role } from '../constants/roles';
import { BRAND } from '../theme/colors';

export default function AdminSideBar() {
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
            flexDirection: { xs: 'row', sm: 'column' },
            alignItems: 'center',
            // justifyContent: 'center',
            gap: 1,
            px: { xs: 2, sm: 0 },
            pt: { xs: 1.5, sm: 0 },
            pb: { xs: 1.5, sm: 0 },
            mt: { xs: 0, sm: 2.5 },
            borderBottom: { xs: '1px solid rgba(0,0,0,0.1)', sm: 'none' },
          }}>
          {role === Role.PLAYER && (
          <Button
            component="a"
            disableElevation
            variant="contained"
            href={ROUTES.MY_ORDERS}
            sx={{
              flex: { xs: 1, sm: 'unset' },
              width: { xs: 'auto', sm: '175px' },
              mb: { xs: 0, sm: 1 },
              padding: '6px 0px',
              overflow: 'hidden',
              bgcolor: BRAND.primary, color: BRAND.white, borderRadius: '8px', fontWeight: 'medium', textTransform: 'none', whiteSpace: 'nowrap'
            }}
          >
            <IconButton aria-label="my-orders" sx={{ color: BRAND.lime, pl: '0' }}><ShoppingBagIcon /></IconButton>
            My getaways
          </Button>
          )}
          {role === Role.PLAYER && (
          <Button
            component="a"
            disableElevation
            variant="contained"
            href={ROUTES.GETAWAYS}
            sx={{
              flex: { xs: 1, sm: 'unset' },
              width: { xs: 'auto', sm: '175px' },
              mb: { xs: 0, sm: 1 },
              padding: '6px 6px',
              overflow: 'hidden',
              bgcolor: BRAND.primary, color: BRAND.white, borderRadius: '8px', fontWeight: 'medium', textTransform: 'none', whiteSpace: 'nowrap'
            }}
          >
            <IconButton aria-label="my-getaways-offers" sx={{ color: BRAND.lime, pl: '0' }}><SportsTennisIcon /></IconButton>
            Getaways offers
          </Button>
        )}
        {role === Role.ADMIN && (
          <Button
            component="a"
            disableElevation
            variant="contained"
            href={ROUTES.MY_GETAWAYS}
            sx={{
              flex: { xs: 1, sm: 'unset' },
              width: { xs: 'auto', sm: '160px' },
              mb: { xs: 0, sm: 1 },
              padding: '6px 6px',
              overflow: 'hidden',
              bgcolor: BRAND.primary, color: BRAND.white, borderRadius: '8px', fontWeight: 'medium', textTransform: 'none', whiteSpace: 'nowrap'
            }}
          >
            <IconButton aria-label="my-getaways-offers" sx={{ color: BRAND.lime, pl: '0' }}><SportsTennisIcon /></IconButton>
            My getaways
          </Button>
        )}
        {role === Role.ADMIN && (
          <Button
            component="a"
            disableElevation
            variant="contained"
            href={ROUTES.CREATE_GETAWAY}
            sx={{
              flex: { xs: 1, sm: 'unset' },
              width: { xs: 'auto', sm: '160px' },
              mb: { xs: 0, sm: 1 },
              padding: '6px 8px',
              overflow: 'hidden',
              bgcolor: BRAND.primary, color: BRAND.white, borderRadius: '8px', fontWeight: 'medium', textTransform: 'none', whiteSpace: 'nowrap'
            }}
          >
            <IconButton aria-label="create-getaway" sx={{ color: BRAND.lime, pl: '0' }}><AddIcon /></IconButton>
            New getaway
          </Button>
        )}
        </Box>
      </Grid>
    </>
  );
}