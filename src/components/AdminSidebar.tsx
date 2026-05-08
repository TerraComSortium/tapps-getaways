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
            display: 'flex', flexDirection: { xs: 'row', sm: 'column' },
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 1,
            mt: { xs: 1, sm: 2.6 },
            mb: { xs: 1, sm: 0 },
          }}>
          <Button
            component="a"
            disableElevation
            variant="contained"
            href="/getaways"
            sx={{
              mb: { xs: 0, sm: 2 }, padding: '5px 0px',
              width: '160px',
              bgcolor: '#3C1C91', color: '#FFF', borderRadius:'8px', fontWeight: 'medium', textTransform: 'none'
            }}
          >
            <IconButton aria-label="add" sx={{ color:"#C9F305", pl: '0' }} ><SportsTennisIcon/></IconButton>
            My getaways
          </Button>
          <Button
            component="a"
            disableElevation
            variant="contained"
            href="/creategetaway"
            sx={{
              width: '160px',
              mb: 2, padding: '5px 0px',
              bgcolor: '#3C1C91', color: '#FFF', borderRadius:'8px', fontWeight: 'medium', textTransform: 'none'
            }}
          >
            <IconButton aria-label="add" sx={{ color:"#C9F305", pl: '0'}} ><AddIcon/></IconButton>
            New getaway
          </Button>
        </Box>
      </Grid>
    </>
  );
}