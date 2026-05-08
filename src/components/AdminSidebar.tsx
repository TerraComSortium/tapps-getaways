import AddIcon from '@mui/icons-material/Add';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import { Box, Button,
  // Container, Link, Typography
 } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid2';

export default function AdminSideBar() {
  return (
    <>
      <Grid size={{ xs: 12, sm: 3, md: 2 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'row', sm: 'column' },
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            px: { xs: 2, sm: 0 },
            pt: { xs: 1.5, sm: 0 },
            pb: { xs: 1.5, sm: 0 },
            mt: { xs: 0, sm: 2.6 },
            borderBottom: { xs: '1px solid rgba(0,0,0,0.1)', sm: 'none' },
          }}>
          <Button
            component="a"
            disableElevation
            variant="contained"
            href="/getaways"
            sx={{
              flex: { xs: 1, sm: 'unset' },
              width: { xs: 'auto', sm: '160px' },
              mb: { xs: 0, sm: 2 },
              padding: '8px 12px',
              overflow: 'hidden',
              bgcolor: '#3C1C91', color: '#FFF', borderRadius: '8px', fontWeight: 'medium', textTransform: 'none', whiteSpace: 'nowrap'
            }}
          >
            <IconButton aria-label="add" sx={{ color: '#C9F305', pl: '0' }}><SportsTennisIcon /></IconButton>
            My getaways
          </Button>
          <Button
            component="a"
            disableElevation
            variant="contained"
            href="/creategetaway"
            sx={{
              flex: { xs: 1, sm: 'unset' },
              width: { xs: 'auto', sm: '160px' },
              mb: { xs: 0, sm: 2 },
              padding: '8px 12px',
              overflow: 'hidden',
              bgcolor: '#3C1C91', color: '#FFF', borderRadius: '8px', fontWeight: 'medium', textTransform: 'none', whiteSpace: 'nowrap'
            }}
          >
            <IconButton aria-label="add" sx={{ color: '#C9F305', pl: '0' }}><AddIcon /></IconButton>
            New getaway
          </Button>
        </Box>
      </Grid>
    </>
  );
}