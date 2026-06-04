import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Stack, Pagination, Typography, CircularProgress, Alert } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { GetawayItem } from '../components/GetawayItem';
import SearchBar from '../components/SearchBar';
import AdminSideBar from '../components/AdminSidebar';

import { useAuth } from '../contexts/AuthContext';
import type { Getaway } from '../types/getaway';
import { useUserStore } from '../store/useUserStore';
import { getAllGetaways } from '../services/getaways/getaways';
import { searchGetaways } from '../services/search/search';
import {
  normalizeGetawayData,
  performFallbackLocalSearch,
  getSportLabel,
  getValidImages,
} from '../utils/getawayHelpers';

export default function Mygetaways() {
  // App.tsx already calls useWatchLocation — no second watcher needed here
  const userLocation = useUserStore((state) => state.userLocation);
  const { role, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const [getaways, setGetaways] = useState<Getaway[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Track previous coordinates to avoid re-fetching when the location object
  // changes reference but lat/lng values are identical (watchPosition fires repeatedly)
  const prevCoordsKey = useRef<string>('');

  useEffect(() => {
    const coordsKey = userLocation ? `${userLocation.lat},${userLocation.lng}` : '';
    if (coordsKey && coordsKey === prevCoordsKey.current) return;
    prevCoordsKey.current = coordsKey;

    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        let finalData: Getaway[] = [];

        if (userLocation?.lat && userLocation?.lng) {
          const rawData = await searchGetaways({
            lat: userLocation.lat,
            lng: userLocation.lng,
          });
          finalData = Array.isArray(rawData) ? rawData.map(normalizeGetawayData) : [];
        }

        // Fall back to all getaways if search returned nothing or there was no location
        // (the search endpoint filters by date ≥ today, so test data with past dates returns [])
        if (finalData.length === 0) {
          finalData = await getAllGetaways();
        }

        setGetaways(finalData);
      } catch (err: any) {
        console.warn("Error fetching initial getaways:", err.message);
        setError("No getaways could be loaded at this time. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [userLocation]);
  const handleSearchFromBar = (filters: {
    q?: string;
    lat?: number | null;
    lng?: number | null;
    sport?: string;
    startDate?: string | null;
    endDate?: string | null;
  }) => {
    const searchLat = filters.lat || userLocation?.lat;
    const searchLng = filters.lng || userLocation?.lng;
    if (!searchLat || !searchLng) {
      setError("Please provide a valid location to search for getaways.");
      return;
    }
    setLoading(true);
    setError(null);
    setIsOfflineMode(false);

    searchGetaways({
      lat: searchLat,
      lng: searchLng,
      sport: filters.sport,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
    })

    .then(rawData => {
      if (rawData.length === 0 && localStorage.getItem('getaways')) {
        console.warn("API returned 0 results. Forcing a Fallback to view local data...");
        throw new Error("Force LocalStorage"); //redirect to next .catch()
      }
      //API: success
      setGetaways(rawData.map(normalizeGetawayData));
      setPage(1);
    })
    .catch(err => {
      console.warn("Cargando desde LocalStorage...", err.message);
      handleFallbackSearch(filters); //search on localStorage
    })
    .finally(() => setLoading(false));
  };

  //fallback controller
  const handleFallbackSearch = (filters: any) => {
    const localData = localStorage.getItem('getaways');
    if (localData) {
      try {
        const parsedData = JSON.parse(localData);
        const localFilteredResults = performFallbackLocalSearch(parsedData, filters);
        setGetaways(localFilteredResults);
        setIsOfflineMode(true);
        setPage(1);
      } catch (parseError) {
        setError("API failed and local data is corrupted.");
      }
    } else {
      setError("Server connection failed. No local getaways available.");
    }
  };

  const handleViewDetails = (getaway: Getaway) => {
    navigate('/getawaydetail', { state: { getawayData: getaway } });
    //navigate(`/getawaydetail`, { state:{ getawayData: getaway} })
  };
  const handleBooking = (getaway: Getaway) => {
    // navigate('/bookgetaway', { state: { getawayData: getaway } });
    navigate(`/booking/${getaway.id}`, { state: { getawayData: getaway } });
  };
  //initial search with userLocation
  const handleChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };
  const paginatedGetaways = getaways.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );
  // const paginatedGetaways = filteredGetaways.slice(
  //   (page - 1) * ITEMS_PER_PAGE,
  //   page * ITEMS_PER_PAGE
  // );

  // if (isAuthLoading || isDataLoading) {
  if (isAuthLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  // console.log("structure getaway received API:", getaways[0]);
  return (
    <>
      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }} >
        <AdminSideBar />
        {/* <Grid size={{ xs:1 }}/> */}
        <Grid size={{ xs:12, sm: 10 }}
          className="section blueBg">
          <SearchBar onSearch={handleSearchFromBar} />
          <Box>
            <Box sx={{ mb: 3 }}>
              {isOfflineMode && (
                <Alert severity="warning" sx={{ mb: 2 }}>Showing local preview data. Backend connection failed.</Alert>
              )}
              {!loading && error && getaways.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No getaways available right now. Try again later or use the search to find experiences near you.
                </Alert>
              ) : !loading && (
                <Typography variant="subtitle1" sx={{ mt: "20px" }}>
                  {getaways.length > 0
                    ? `${isOfflineMode ? 'Local matches' : 'Getaways offers'}: ${getaways.length}`
                    : 'No offers match your search'
                  }
                </Typography>
              )}
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress />
              </Box>
            ) : (
              getaways.length > 0 && paginatedGetaways.map((getaway, index) => (
                <GetawayItem
                  key={getaway._id || `fallback-key-${index}`}
                  name={getaway.title || "Untitled Offer"}
                  getawayAddress={getaway.getawayAddress}
                  // address={getaway.address || (getaway as any).getawayAddress?.address}
                  // address={ getaway.getawayAddress}
                  dates={`${getaway.startDate} - ${getaway.endDate}`}
                  lodgingOptions={getaway.lodgingOptions || []}
                  sport={getSportLabel(getaway.sport)}
                  galleryPhotos={getValidImages(getaway.galleryPhotos)}
                  // isLoading={isLoading}
                  onViewDetails={() => handleViewDetails(getaway)}
                  onBookNow={role === 'player' ? () => handleBooking(getaway) : undefined}
                  // onEdit={role === 'admin' ? () => handleEdit(getaway.id) : undefined}
                  // onDelete={role === 'admin' ? () => (getaway._id, getaway.title) : undefined}
                />
              ))
            )}
          </Box>

          {!loading && getaways.length > 0 && (
            <Stack spacing={2} sx={{ mt: 4, alignItems: 'center' }}>
              <Pagination
                shape="rounded"
                count={Math.ceil(getaways.length / ITEMS_PER_PAGE)}
                page={page}
                onChange={handleChange}
              />
            </Stack>
          )}
        </Grid>
      </Grid>
    </>
  );
}