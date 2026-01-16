import { useRef, useEffect, useState } from "react";
import { Button, Box, Typography, FormLabel, SxProps, Theme } from "@mui/material";
import { useJsApiLoader } from "@react-google-maps/api";
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import { styled } from "@mui/material/styles";
import type { LocationEntry } from '../types/getaway';

const StyledAutocomplete = styled('gmp-place-autocomplete', {
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
  backgroundColor: $transparent ? 'transparent' : '#fff',
  height: typeof $height === 'number' ? `${$height}px` : $height,
  outline: 'none',
  color: $textColor,
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',

  '&:focus-within': {
    borderColor: theme.palette.primary.main,
  }
}));

const LocationButton = styled(Button)<{ $hasLabel?: boolean; $height?: string | number }>(
  ({ theme, $hasLabel, $height }) => ({
    marginTop: $hasLabel ? '28px' : '0px',
    height: typeof $height === 'number' ? `${$height}px` : $height,
    backgroundColor: '#00E392',
    color: '#1A2660',
    fontWeight: 'bold',
    borderRadius: '30px',
    textTransform: 'none',
    whiteSpace: 'nowrap',
    boxShadow: 'none',
    '&:hover': {
      backgroundColor: '#3C1C91',
      color: 'white',
    },
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      marginTop: '10px'
    }
  })
);

interface CustomPlace {
  formattedAddress: string;
  location: {
    lat: number;
    lng: number;
  };
}

interface GooglePlaceAutocompleteElement extends HTMLElement {
  place: CustomPlace | null;
  value: string;
}

interface AddressAutocompleteProps {
  apiKey: string;
  onChange: (value: LocationEntry) => void;
  //optional props
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
  apiKey,
  onChange,
  label,
  error = false,
  errorMessage,
  showCurrentLocationBtn = false,
  inputStyle,
  containerSx,
  //default prop values
  height = '56px',
  transparentBackground = false,
  labelColor,
  inputTextColor = '#000',
}: AddressAutocompleteProps) {
  const autocompleteRef = useRef<GooglePlaceAutocompleteElement | null>(null);
  const [isLoadingGeo, setIsLoadingGeo] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: ['places'],
  });

  // Listener for Google component
  useEffect(() => {
    const autocompleteElement = autocompleteRef.current;
    if (!autocompleteElement) return;

    const handlePlaceChange = (event: Event) => {
      const target = event.target as GooglePlaceAutocompleteElement;
      const place = target?.place;

      if (place?.formattedAddress && place.location) {
        onChange({
          address: place.formattedAddress,
          lat: place.location.lat,
          lng: place.location.lng,
        });
      }
    };
    autocompleteElement.addEventListener('gmp-placechange', handlePlaceChange);
    return () => {
      autocompleteElement.removeEventListener('gmp-placechange', handlePlaceChange);
    };
  }, [onChange]);

  const handleMyPositionClick = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    console.log("Button pressed. making position request...");
    setIsLoadingGeo(true);

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      console.log("Relative position:", { lat, lng });

      try {
        console.log("Geocoding API call...");
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
        );
        const data = await res.json();
        // console.log("Google Maps API complete response:", data);
        let addressToSave = "";

        if (data.status === "OK" && data.results && data.results[0]) {
          addressToSave = data.results[0].formatted_address;
          console.log("Address found:", addressToSave);

        } else {
          console.warn(`Maps API status: ${data.status}. Using fallback coordinates.`);
          addressToSave = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
        }

        onChange({ address: addressToSave, lat, lng });
          if (autocompleteRef.current) {
            autocompleteRef.current.value = addressToSave;
          }

        } catch (error) {
          console.error("Geocoding error:", error);
          alert("Error fetching address details.");
        } finally {
          setIsLoadingGeo(false);
        }
      },
      (err) => {
        setIsLoadingGeo(false);
        console.error("Geolocation error:", err.message);
        alert("Could not get location: " + err.message);
      }
    );
  };

  if (!isLoaded) return <Typography>Loading Maps...</Typography>;

  return (
    <Box sx={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 1, flexWrap: 'wrap', ...containerSx }}>
      <Box sx={{ flex: 1, minWidth: '250px' }}>
        {label && (
          <FormLabel error={!!error} sx={{ fontWeight: 400, color: error ? undefined : labelColor }}>
            {label}
          </FormLabel>
        )}

        <StyledAutocomplete
          ref={autocompleteRef}
          //style custom props
          $isError={error}
          $height={height}
          $transparent={transparentBackground}
          $textColor={inputTextColor}
          //override
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
          //custom props
          $hasLabel={!!label}
          // $height={height}
          $height={'35px'}
          sx={{ ml: 0, mb: 2 }}
        >
          {isLoadingGeo ? "Locating..." : "My position"}
        </LocationButton>
      )}
    </Box>
  );
}