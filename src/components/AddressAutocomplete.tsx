import { useRef, useState, useEffect } from "react";
import { Button, Box, Typography, FormLabel, SxProps, Theme } from "@mui/material";
import { BRAND } from "../theme/colors";
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import { styled } from "@mui/material/styles";
import type { LocationEntry } from '../types/getaway';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { useTranslation } from 'react-i18next';

const StyledAutocomplete = styled('input', {
  shouldForwardProp: (prop) =>
    prop !== '$isError' &&
    prop !== '$height' &&
    prop !== '$transparent' &&
    prop !== '$textColor'
})<{
  $isError?: boolean;
  $height?: string | number;
  $transparent?: boolean;
  $textColor?: string;
}>(({ theme, $isError, $height, $transparent, $textColor }) => ({
  fontSize: '12px',
  padding: '10px',
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
  inputStyle?: React.CSSProperties;
  containerSx?: SxProps<Theme>;
  height?: string | number;
  transparentBackground?: boolean;
  labelColor?: string;
  inputTextColor?: string;
}

export function AddressAutocomplete({
  onChange,
  value,
  label,
  error = false,
  errorMessage,
  showCurrentLocationBtn = false,
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

  useEffect(() => { onChangeRef.current = onChange; });

  // Sync external value (e.g. GPS auto-fill) into the input
  const globalAddress = value?.address;
  useEffect(() => {
    if (inputRef.current && globalAddress) {
      const inputAddress = `${globalAddress}, `;
      inputRef.current.value = inputAddress;
      const isDesktop = window.innerWidth > 768;
      if (isDesktop) {
        inputRef.current.focus();
        const length = inputAddress.length;
        inputRef.current.setSelectionRange(length, length);
      }
    }
  }, [globalAddress]);

  // Attach Google Places Autocomplete to our own styled input
  useEffect(() => {
    if (!placesLib || !inputRef.current) return;

    const ac = new placesLib.Autocomplete(inputRef.current, {
      fields: ['formatted_address', 'geometry', 'name'],
    });

    const listener = ac.addListener('place_changed', () => {
      const place = ac.getPlace();
      if (!place?.geometry?.location) {
        console.warn("Place selected has no coordinates");
        return;
      }
      const address = place.formatted_address || place.name || "";
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      onChangeRef.current({ address, lat, lng });
    });

    return () => google.maps.event.removeListener(listener);
  }, [placesLib]);

  const handleMyPositionClick = () => {
    if (!navigator.geolocation) {
      alert(t('address.geoUnsupported'));
      return;
    }
    setIsLoadingGeo(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
          );
          const data = await res.json();
          let address = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
          if (data.status === "OK" && data.results?.[0]) {
            address = data.results[0].formatted_address;
          }
          onChangeRef.current({ address, lat, lng });
          if (inputRef.current) inputRef.current.value = address;
        } catch (err) {
          console.error("Geocoding error:", err);
          alert(t('address.geoFetchError'));
        } finally {
          setIsLoadingGeo(false);
        }
      },
      (err) => {
        setIsLoadingGeo(false);
        alert(t('address.geoUnavailable') + " " + err.message);
      }
    );
  };

  if (!placesLib) return <Typography>{t('address.loadingMaps')}</Typography>;

  return (
    <Box sx={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 1, flexWrap: 'wrap', ...containerSx }}>
      <Box sx={{ flex: 1, minWidth: '250px' }}>
        {label && (
          <FormLabel error={!!error} sx={{ fontWeight: 400, color: error ? undefined : labelColor }}>
            {label}
          </FormLabel>
        )}
        <StyledAutocomplete
          ref={inputRef}
          type="text"
          placeholder={t('address.cityPlaceholder')}
          defaultValue={value?.address || ""}
          $isError={error}
          $height={height}
          $transparent={transparentBackground}
          $textColor={inputTextColor}
          style={inputStyle}
        />
        {errorMessage && (
          <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
            {errorMessage}
          </Typography>
        )}
      </Box>

      {showCurrentLocationBtn && (
        <LocationButton
          onClick={handleMyPositionClick}
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
