import { ControlPosition, MapControl, useMap } from '@vis.gl/react-google-maps';
import { useUserStore } from '../store/useUserStore';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { IconButton, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const UserLocationButton = () => {
  const { t } = useTranslation();
  const map = useMap();
  const userLocation = useUserStore((state) => state.userLocation);

  const handleCenter = () => {
    if (map && userLocation) {
      map.panTo(userLocation);
      map.setZoom(16);
    } else {
      alert(t('map.allowLocation'));
    }
  };

  return (
    <MapControl position={ControlPosition.RIGHT_BOTTOM}>
      <Paper
        elevation={3}
        style={{ margin: '10px', borderRadius: '2px' }}
      >
        <IconButton
          onClick={handleCenter}
          style={{ backgroundColor: 'white', padding: '8px' }}
          title={t('map.centerLocation')}
        >
          <MyLocationIcon style={{ color: '#666' }} />
        </IconButton>
      </Paper>
    </MapControl>
  );
};