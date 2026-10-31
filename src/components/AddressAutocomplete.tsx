import { useRef, useState, useEffect, useCallback } from "react";
import { Button, Box, CircularProgress, IconButton, Typography, FormLabel, SxProps, Theme } from "@mui/material";
import { BRAND } from "../theme/colors";
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import PlaceIcon from '@mui/icons-material/Place';
import { styled } from "@mui/material/styles";
import type { LocationEntry } from '../types/getaway';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { useTranslation } from 'react-i18next';

const StyledAutocomplete = styled('input', {
  shouldForwardProp: (prop) =>
    prop !== '$isError' &&
    prop !== '$height' &&
    prop !== '$transparent' &&
    prop !== '$textColor' &&
    prop !== '$hasInlineLocationButton'
})<{
  $isError?: boolean;
  $height?: string | number;
  $transparent?: boolean;
  $textColor?: string;
  $hasInlineLocationButton?: boolean;
}>(({ theme, $isError, $height, $transparent, $textColor, $hasInlineLocationButton }) => ({
  fontSize: '12px',
  padding: $hasInlineLocationButton ? '10px 46px 10px 10px' : '10px',
  width: '100%',
  display: 'block',
  border: `1px solid ${$isError ? theme.palette.error.main : 'rgba(0, 0, 0, 0.23)'}`,
  borderRadius: '4px',
  backgroundColor: $transparent ? 'transparent' : BRAND.white,
  height: typeof $height === 'number' ? `${$height}px` : $height,
  outline: 'none',
  color: $textColor,
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
  '&:focus-within': {
    borderColor: theme.palette.primary.main,
  }
}));

const LocationButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== '$hasLabel' && prop !== '$height',
})<{ $hasLabel?: boolean; $height?: string | number }>(
  ({ theme, $hasLabel, $height }) => ({
    marginTop: $hasLabel ? '28px' : '0px',
    height: typeof $height === 'number' ? `${$height}px` : $height,
    backgroundColor: BRAND.green,
    color: BRAND.navy,
    fontWeight: 'bold',
    borderRadius: '30px',
    textTransform: 'none',
    whiteSpace: 'nowrap',
    boxShadow: 'none',
    '&:hover': {
      backgroundColor: BRAND.primary,
      color: 'white',
    },
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      marginTop: '10px'
    }
  })
);

interface AddressAutocompleteProps {
  onChange: (value: LocationEntry) => void;
  value?: LocationEntry | null;
  label?: string;
  error?: boolean;
  errorMessage?: string;
  showCurrentLocationBtn?: boolean;
  currentLocationButtonVariant?: 'standalone' | 'inline';
  inputStyle?: React.CSSProperties;
  containerSx?: SxProps<Theme>;
  height?: string | number;
  transparentBackground?: boolean;
  labelColor?: string;
  inputTextColor?: string;
}

type GeocodeResponse = {
  results: Array<{
    formatted_address: string;
  }>;
};

export function AddressAutocomplete({
  onChange,
  value,
  label,
  error = false,
  errorMessage,
  showCurrentLocationBtn = false,
  currentLocationButtonVariant = 'standalone',
  inputStyle,
  containerSx,
  height = '56px',
  transparentBackground = false,
  labelColor,
  inputTextColor = BRAND.black,
}: AddressAutocompleteProps) {

  const { t } = useTranslation();
  const [isLoadingGeo, setIsLoadingGeo] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);

  // useMapsLibrary hooks into the APIProvider from @vis.gl — no separate loader needed
  const placesLib = useMapsLibrary('places');
  const geocodingLib = useMapsLibrary('geocoding');

  const requestVersionRef = useRef(0);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const updateLocation = useCallback((location: LocationEntry) => {
    requestVersionRef.current += 1;
    setIsLoadingGeo(false);
    // onChange(location);
    onChangeRef.current(location);
  }, []);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    updateLocation({
      address: event.target.value,
      lat: null,
      lng: null,
    });
  }, [updateLocation]);

  // Attach Google Places Autocomplete to our own styled input
  useEffect(() => {
    if (!placesLib || !inputRef.current) return;

    const ac = new placesLib.Autocomplete(inputRef.current, {
      fields: ['formatted_address', 'geometry', 'name'],
    });

    const listener = ac.addListener('place_changed', () => {
      const place = ac.getPlace();

      if (!place.geometry?.location) return;

      const name = place.name?.trim();
      const formattedAddress = place.formatted_address?.trim() ?? '';
      const address = name && !formattedAddress.includes(name)
        ? `${name}, ${formattedAddress}`
        : formattedAddress || name || '';

      updateLocation({
        address,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
    });
    return () => listener.remove();

  }, [placesLib, updateLocation]);

  const requestCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert(t('address.geoUnsupported'));
      return;
    }

    if (!geocodingLib) {
      alert(t('address.loadingMaps'));
      return;
    }

    const requestVersion = ++requestVersionRef.current;
    setIsLoadingGeo(true);

    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude: lat, longitude: lng } }) => {
        const geocoder = new geocodingLib.Geocoder();

        geocoder
          .geocode({ location: { lat, lng } })
          .then(({ results }: GeocodeResponse) => {
            if (requestVersion !== requestVersionRef.current) return;

            const address = results[0]?.formatted_address
              ?? `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;

            updateLocation({ address, lat, lng });
          })
          .catch(() => {
            if (requestVersion !== requestVersionRef.current) return;

            updateLocation({
              address: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`,
              lat,
              lng,
            });
          });
      },
      (error) => {
        if (requestVersion !== requestVersionRef.current) return;

        setIsLoadingGeo(false);

        if (error.code === error.PERMISSION_DENIED) {
          alert(t('address.geoPositionForbidden'));
          return;
        }

        alert(`${t('address.geoUnavailable')} ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 },
    );
  }, [geocodingLib, t, updateLocation]);

  if (!placesLib) return <Typography>{t('address.loadingMaps')}</Typography>;

  const showInlineLocationButton = showCurrentLocationBtn && currentLocationButtonVariant === 'inline';


  return (
    <Box sx={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 1, flexWrap: 'wrap', ...containerSx }}>
      <Box sx={{ flex: 1, minWidth: '250px' }}>
        {label && (
          <FormLabel error={!!error}
            sx={{ fontWeight: 400, color: error ? undefined : labelColor, fontSize:{ sm: '0.85rem', md: '0.9rem' }
             }}>
            {label}
          </FormLabel>
        )}

        <Box sx={{ position: 'relative' }}>
          <StyledAutocomplete
            ref={inputRef}
            type="text"
            placeholder={t('address.cityPlaceholder')}
            value={value?.address ?? ''}
            onChange={handleInputChange}
            $isError={error}
            $height={height}
            $transparent={transparentBackground}
            $textColor={inputTextColor}
            $hasInlineLocationButton={showInlineLocationButton}
            style={inputStyle}
          />
          {showInlineLocationButton && (
            <IconButton
              aria-label={t('address.myPosition')}
              onClick={requestCurrentLocation}
              disabled={isLoadingGeo}
              size="small"
              sx={{
                position: 'absolute',
                right: 6,
                top: '50%',
                transform: 'translateY(-50%)',
                color: BRAND.primary,
              }}
            >
              {isLoadingGeo ? <CircularProgress size={18} /> : <PlaceIcon fontSize="small" />}
            </IconButton>
          )}
        </Box>
        {errorMessage && (
          <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
            {errorMessage}
          </Typography>
        )}
      </Box>

      {showCurrentLocationBtn && currentLocationButtonVariant === 'standalone' && (
        <LocationButton
          onClick={requestCurrentLocation}
          disabled={isLoadingGeo}
          startIcon={<GpsFixedIcon />}
          variant="contained"
          disableElevation
          $hasLabel={!!label}
          $height={'35px'}
          sx={{ ml: 0, mb: 2 }}
        >
          {isLoadingGeo ? t('address.locating') : t('address.myPosition')}
        </LocationButton>
      )}
    </Box>
  );
}
