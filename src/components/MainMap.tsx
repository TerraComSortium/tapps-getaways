import { useState, useEffect } from 'react';
import { Map, AdvancedMarker, useMap, InfoWindow, useApiIsLoaded } from '@vis.gl/react-google-maps';
import { useUserStore } from '../store/useUserStore';
import { useWatchLocation } from '../hooks/useWatchLocation';
import getawaysLocation from '../assets/RappsIcons/getawaysLocation.png';
import { UserLocationButton } from './UserLocationButton';

const MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_ID;
const DEFAULT_CENTER = { lat: -17.3846397, lng: -66.1461434 };
const RC_NETS = [
  { id: 1, title: "Padel club", position:{ lat: -17.3735146, lng: -66.1968925 }},
  { id: 2, title: "Club de tennis Cochabamba", position:{ lat: -17.381254, lng: -66.166791 }},
  { id: 3, title: "Padel Clinique", position:{ lat: -17.3805, lng: -66.1888855 }},
  { id: 4, title: "Club de tennis municipal", position:{ lat: -17.3713838, lng: -66.158165 }},
  { id: 5, title: "Club de tennis El Paso", position:{ lat: -17.368032, lng: -66.172564 }},
  { id: 6, title: "Padel Central", position:{ lat: -17.3206833, lng: -66.2621544 }},
  { id: 7, title: "Country club", position:{ lat: -17.4023709, lng: -66.1461659 }},
  { id: 8, title: "Padel Club", position:{ lat: -17.3846397, lng: -66.1461434 }},
  //SCZ offers
  { id: 9, title: "Country Club Las Palmas", position:{ lat: -17.803063, lng: -63.206812 }},
  { id: 10, title: "Club de Tenis Santa Cruz🎾", position:{ lat: -17.782187, lng: -63.198313 }},
  { id: 11, title: "Los Tajibos", position:{ lat: -17.764688, lng: -63.196562 }}
  //plusCode: 6RP3+4C Santa Cruz de la Sierra
];

interface PlacePin {
  id: number | string;
  title: string;
  description?: string;
  position: {
    lat: number;
    lng: number;
  };
}
export default function MainMap() {
  const apiIsLoaded = useApiIsLoaded();
  const userLocation = useUserStore((state) => state.userLocation);
  useWatchLocation();
  const [selectedPlacePin, setSelectedPlacePin] = useState<PlacePin | null>(null);

  //map's control
  const map = useMap();
  //center at pin selection
  useEffect(() => {
    if (map && selectedPlacePin) {
      map.panTo(selectedPlacePin.position);
      map.setZoom(16);
    }
  }, [map, selectedPlacePin]);

  if (!apiIsLoaded) {
    return <p>Loading map...</p>;
  }

  return (
    <Map
      style={{ width: '100%', height: '100%' }}
      defaultCenter={DEFAULT_CENTER}
      defaultZoom={15}
      // VITE_GOOGLE_MAPS_ID='cbe986196ecd68d9' ->  copy this line to .env
      mapId={ MAP_ID }
      gestureHandling={'greedy'}
    >
      {userLocation && (
        <AdvancedMarker position={userLocation}>
          <div style={{
            width: '20px',
            height: '20px', backgroundColor: '#4285F4',
            borderRadius: '50%', border: '3px solid white',
            boxShadow: '0 0 10px rgba(0,0,0,0.3)'
          }} />
        </AdvancedMarker>
      )}
      <UserLocationButton />
      {RC_NETS.map((placepin) => (
        <AdvancedMarker
          key={placepin.id}
          position={placepin.position}
          onClick={() => setSelectedPlacePin(placepin)}
        >
          <img src={getawaysLocation} height={35} alt={placepin.title} style={{ cursor: 'pointer' }} />
        </AdvancedMarker>
      ))}

      {selectedPlacePin && (
        <InfoWindow
          position={selectedPlacePin.position}
          onCloseClick={() => setSelectedPlacePin(null)} //clean state
        >
          <div style={{ padding: '5px', color: 'black' }}>
            <h3 style={{ margin: '0 0 5px 0' }}>{selectedPlacePin.title}</h3>
            <p style={{ margin: 0, fontSize: '14px' }}>{selectedPlacePin.description}</p>
          </div>
        </InfoWindow>
      )}
    </Map>
  );
}