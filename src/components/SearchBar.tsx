import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, TextField, Typography, FormControl, Select, MenuItem,
  Snackbar, Alert, CircularProgress
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import SearchIcon from '@mui/icons-material/Search';
import { AddressAutocomplete } from './AddressAutocomplete';
import type { LocationEntry } from '../types/getaway';
import { useUserStore } from '../store/useUserStore';

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

interface SearchBarProps {
  onSearch?: (filters: { city: string; sport: string; startDate: string; endDate: string }) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const navigate = useNavigate();
  const userAddress = useUserStore((state) => state.userAddress);
  const userLocation = useUserStore((state) => state.userLocation);

  const [searchLocation, setSearchLocation] = useState<LocationEntry | null>(null);
  const [sport, setSport] = React.useState('');
  const [feedback, setFeedback] = React.useState({
    open: false,
    message: '',
    severity: 'error' as 'error' | 'warning'
  });
  const [loading, setLoading] = React.useState(false);

  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  //initializing
  const todayObj = new Date();
  const today = formatLocalDate(todayObj);

  const tomorrowObj = new Date();
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrow = formatLocalDate(tomorrowObj);

  const [arrival, setArrival] = React.useState(today);
  const [departure, setDeparture] = React.useState(tomorrow);

  const hasAutoFilled = React.useRef(false); //userLocation's coords filledFlag
  React.useEffect(() => {
    if (userAddress && userLocation && !hasAutoFilled.current) {
      setSearchLocation({
        address: userAddress,
        lat: userLocation.lat,
        lng: userLocation.lng
      });
      hasAutoFilled.current = true;
    }
  }, [
    userAddress,
    userLocation
  ]);

  const handleMapsSearch = (location: LocationEntry) => {
    setSearchLocation(location);
    console.log("Selected Location:", location);
  };

  const handleSearch = async () => {
    if (arrival && departure && departure < arrival) {
      setFeedback({
        open: true,
        message: 'Check dates: Departure cannot be before Arrival.',
        severity: 'warning'
      });
      return;
    }
    setLoading(true);

    try {
      if (onSearch) {
        onSearch({
          city: searchLocation?.address || '',
          sport: sport,
          startDate: arrival,
          endDate: departure
        });
      } else {
        console.log("try search...");
        const params = new URLSearchParams();
        //add filledParams
        if (searchLocation?.address) params.append('city', searchLocation.address);
        if (sport) params.append('sport', sport);
        if (arrival) params.append('startDate', arrival);
        if (departure) params.append('endDate', departure);

        const queryString = params.toString();
        //console.log("finalURL:", `/getaways?${queryString}`);
        navigate(`/getaways?${queryString}`);
      }
    } catch (error) {
      console.error("Connection failed:", error);
      setFeedback({
        open: true,
        message: 'Server connection failed. Please try again later.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseFeedback = () => setFeedback(prev => ({ ...prev, open: false }));

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

      <Grid container spacing={1} alignItems="flex-end" size={12} >
        <Grid size={{ xs:12, md:6, lg:4 }} >
          <AddressAutocomplete
            apiKey={GOOGLE_API_KEY}
            onChange={handleMapsSearch}
            value={searchLocation}
            inputStyle={{
              height: '48px',
              backgroundColor: '#f5f5f5',
              color:'#000',
              borderRadius: '8px',
              borderColor: 'white',
            }}
            label="Nearest city"
            labelColor='#B8FF00'
          />
        </Grid>

        <Grid size={{ xs:12, md:6, lg:4 }}>
          <Typography variant="body2" sx={{ color:'#B8FF00', mb: 0.5 }}> Date </Typography>
          <Box sx={{ display: 'flex',
            gap: { xs: 1, sm: 2 },
            bgcolor: 'white',
            borderRadius: '8px',
            p: '0.2',
            width: '100%',
            height: { xs: '38px', sm: '48px' }
          }}>
            <TextField type="date" label="Arrival" value={arrival} variant="standard" fullWidth
              InputLabelProps={{ shrink: true }}
              onChange={(e) => setArrival(e.target.value)}
              inputProps={{ min: today }}
              sx={{
                flex: 1,
                m: '5px 2px',
                borderRadius: '0 0 8px ',
                width: { xs: '200px', sm: '240px' },
                borderColor: '#3C1C91', color: 'black',
                height: { xs: '90px', sm: '100px' },
                '& .MuiInputBase-input': { p: 0.5, fontSize: { xs: '0.75rem', sm: '0.875rem'} },
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
              type="date" label="Departure" value={departure} variant="standard" fullWidth
              InputLabelProps={{ shrink: true }}
              onChange={(e) => setDeparture(e.target.value)}
              inputProps={{ min: arrival || today }}
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
              '& .MuiOutlinedInput-root': { borderRadius: '8px', color: 'black', bgcolor: 'white', '& fieldset': { borderColor: 'transparent' }, '&:hover fieldset': { borderColor: 'transparent' }, '&.Mui-focused fieldset': { borderColor: 'transparent' }, },
            }}>
              <Select
                value={sport} displayEmpty
                onChange={(e) => setSport(e.target.value)}
                inputProps={{ 'aria-label': 'Sport selection' }}
                sx={{ height: { xs: '38px', sm: '48px' }, minWidth: { xs: '80px', sm: '120px' },}}
              >
                <MenuItem value="" disabled>Choose option</MenuItem>
                <MenuItem value="tennis">Tennis</MenuItem>
                <MenuItem value="padel">Padel</MenuItem>
                <MenuItem value="pickleball">Pickleball</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Button variant="contained"
            onClick={handleSearch}
            disabled={loading}
            sx={{
              p: 0, alignSelf: 'flex-end',
              minWidth: { xs: '48px', sm: '56px' },
              height:{ xs: '38px', sm: '48px' },
              bgcolor: '#B8FF00', color: '#3C1C91', borderRadius: '8px',
              '&:hover': { bgcolor: '#A3E300'},
              '&:disabled': { bgcolor: '#e0e0e0' }
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: '#3C1C91' }} />
            ):(
              <SearchIcon fontSize="large" />
            )}
          </Button>
        </Grid>
      </Grid>

      <Snackbar
        open={feedback.open}
        autoHideDuration={6000} onClose={handleCloseFeedback} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseFeedback} severity={feedback.severity} sx={{ width: '100%' }} >
          {feedback.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}