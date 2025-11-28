import * as React from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  FormControl,
  Select, SelectChangeEvent,
  MenuItem
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';

export default function SearchBar() {
  const [city, setCity] = React.useState('');
  const [sport, setSport] = React.useState('');

  const handleCityChange = (event: SelectChangeEvent<string>) => {
    setCity(event.target.value);
  };

  const handleSportChange = (event: SelectChangeEvent) => {
    setSport(event.target.value);
  };

  return (
    <Box
      sx={{
        display: 'flex', flexDirection: 'column',
        bgcolor: '#3C1C91', color: 'white', borderRadius: '8px',
        p: { xs: 2, md: 4 },
        gap: { xs: 0.5, md: 1 }
      }}
    >
      <Typography variant="h6" component="h6" sx={{ margin:0, padding:0, fontSize: { xs: '0.9rem', md: '1rem' }, fontWeight: 'medium' }} > Search your next Racquets!™ getaway | Live the full experience
      </Typography>

      <Grid container spacing={{ xs: 1, sm: 1, md: 1 }} alignItems="flex-end"
        size={{ xs:12, sm:12, md:12, lg:12 }}
      >
        <Grid size={{ xs:12, sm:12, md:6, lg:4 }} >
          <Typography variant="body2" sx={{ color:'#B8FF00', mb: 0.5, fontWeight: 'medium' }}> City </Typography>
          <TextField fullWidth placeholder="Enter a city"
            value={city} onChange={handleCityChange}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'black', bgcolor: 'white',
                borderRadius: '8px',
                height: { xs: '38px', sm: '48px' },
                '&:hover fieldset': { borderColor: 'transparent' },
                '&.Mui-focused fieldset': { borderColor: 'transparent' },
              },
              '& .MuiInputBase-input:: placeholder': { color: 'rgba(0, 0, 0, 0.5)', opacity: 1 },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end"><LocationOnIcon /></InputAdornment>
              )
            }}
          />
        </Grid>

        <Grid size={{ xs:12, sm:12, md:6, lg:4 }}>
          <Typography variant="body2" sx={{ color:'#B8FF00', mb: 0.5 }}> Date </Typography>
          <Box sx={{ display: 'flex',
            gap: { xs: 1, sm: 2 },
            bgcolor: 'white',
            borderRadius: '8px',
            p: '0.2',
            width: '100%',
            height: { xs: '38px', sm: '48px' }
           }}>
            <TextField
              type="date" label="Arrival"
              variant="standard"
              InputLabelProps={{ shrink: true }} fullWidth
              sx={{
                flex: 1,
                m: '5px 2px',
                borderRadius: '0 0 8px ',
                width: { xs: '200px', sm: '240px' },
                borderColor: '#3C1C91', color: 'black',
                height: { xs: '90px', sm: '100px' },
                '& .MuiInputBase-input': { p: 0.5, color: 'black', fontSize: { xs: '0.75rem', sm: '0.875rem'} },
                '& .MuiInput-underline:before': { borderBottom: 'none' },
                '& .MuiInput-underline:after': { borderBottom: 'none' },
                '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottom: 'none' },

                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  height:{ xs: '38px', sm: '48px' },
                  bgcolor: 'white',
                  '&:hover fieldset': { borderColor: 'transparent' },
                  '&.Mui-focused fieldset': { borderColor: 'transparent' },
                },
              }}
            />
            <TextField
              type="date" label="Departure"
              variant="standard"
              InputLabelProps={{ shrink: true }} fullWidth
              sx={{
                flex: 1,
                m: '5px 0',
                width: { xs: '200px', sm: '240px' },
                color: '#3C1C91',
                '& .MuiInputBase-input': { p: 0.5, color: 'black', fontSize: { xs: '0.75rem', sm: '0.875rem' }, },
                '& .MuiInput-underline:before': { borderBottom: 'none' },
                '& .MuiInput-underline:after': { borderBottom: 'none' },
                '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottom: 'none' },
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  height:{ xs: '38px', sm: '48px' },
                  color: 'black', bgcolor: 'white',
                },
              }}
            />
          </Box>
        </Grid>

        <Grid size={{ xs:12, sm:4 }} sx={{ display: 'flex', gap: 1 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body2" sx={{ color:'#B8FF00', mb: 0.5 }}> Sport </Typography>
            <FormControl fullWidth sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                color: 'black', bgcolor: 'white',
                '& fieldset': { borderColor: 'transparent' },
                '&:hover fieldset': { borderColor: 'transparent' },
                '&.Mui-focused fieldset': { borderColor: 'transparent' },
              },
            }}>
              <Select
                value={sport}
                displayEmpty
                onChange={handleSportChange}
                inputProps={{ 'aria-label': 'Without label' }}
                sx={{ height: { xs: '38px', sm: '48px' }, minWidth: { xs: '80px', sm: '120px' },}}
              >
                <MenuItem value="" disabled> Choose option </MenuItem>
                <MenuItem value="tennis">Tennis</MenuItem>
                <MenuItem value="padel">Padel</MenuItem>
                <MenuItem value="golf">Pickleball</MenuItem>
                <MenuItem value="golf">Other</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Button variant="contained"
            sx={{
              p: 0, alignSelf: 'flex-end',
              minWidth: { xs: '48px', sm: '56px' },
              height:{ xs: '38px', sm: '48px' },
              bgcolor: '#B8FF00', color: '#3C1C91', borderRadius: '8px',
              '&:hover': { bgcolor: '#A3E300'}
            }}
          ><SearchIcon sx={{ fontSize: { xs: '24px', sm: '28px' } }} />
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}