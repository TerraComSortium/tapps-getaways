import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Stack, Pagination, Typography, CircularProgress, Alert } from '@mui/material';
import Grid from '@mui/material/Grid2';
import AdminSideBar from '../components/AdminSidebar';
import { GetawayItem } from '../components/GetawayItem';

import type { Getaway } from '../types/getaway';
// import { useWatchLocation } from '../hooks/useWatchLocation';
// import { useUserStore } from '../store/useUserStore';
import { useAuth } from '../contexts/AuthContext';

import { getOwnerGetaways } from '../services/getawayApi';
// import { SearchService } from '../services/searchService';
// import {
  //   normalizeGetawayData,
  //   getSportLabel,
  //   getValidImages,
  // } from '../utils/getawayHelpers';

const parseFirestoreDate = (dateField: any): string => {
  if (!dateField) return "Date not defined";

  //for firestoreTimestamp
  if (dateField._seconds !== undefined) {
    //convert to milisecs
    return new Date(dateField._seconds * 1000).toLocaleDateString();
  }
  return new Date(dateField).toLocaleDateString();
};
const normalizeGetawayData = (raw: any): Getaway => {
  return {
    ...raw,
    _id: raw._id || raw.id || `temp_${Math.random()}`,
    title: raw.title || raw.getawayTitle || "Untitled Offer",
    overview: raw.overview || raw.getawayOverview || "",
    startDate: parseFirestoreDate(raw.startDate),
    endDate: parseFirestoreDate(raw.endDate),
    sport: raw.sport || "",
    galleryPhotos: raw.galleryPhotos || raw.galleryPhoto || [],

    lodgingOptions: raw.lodgingOptions || [],
    optionalAddOns: raw.optionalAddOns || [],
    amenities: raw.amenities || [],
    schedule: raw.schedule?.map((item: any) => ({
      ...item,
      date: parseFirestoreDate(item.date)
    })) || [],
    caption: raw.caption || "",
    galleryVideo: raw.galleryVideo || "",
    mainDescription: raw.mainDescription || raw.getawayOverview || "",
    policies: raw.policies || "",
    terms: raw.terms || "",

    getawayAddress: raw.getawayAddress || { address: raw.address || "", lat: raw.location?.lat || 0, lng: raw.location?.lng || 0 }
  };
};

const sportMap: { [key: string]: string } = {
  '1': 'Tennis',
  '2': 'Padel',
  '3': 'Pickleball',
  '4': 'Other'
};
const getSportLabel = (sportKey: string) => {
  if (!sportKey) return 'Not available';
  return sportMap[sportKey] || sportKey || 'Not available';
};

// const getValidImages = (photos: any) => {
//   if (!Array.isArray(photos)) return [];
//   return photos.filter(url => typeof url === 'string' && url.startsWith('http'));
// };
const getValidImages = (photos: string[] | undefined) => {
  if (!photos || !Array.isArray(photos) || photos.length === 0) return [];
  return photos.filter(url => url && typeof url === 'string' && url.length > 5);
};

export default function Mygetaways() {
  // useWatchLocation();
  //subscribe to userLocation global state
  // const userLocation = useUserStore((state) => state.userLocation);
  // console.log('userLocation:', userLocation);

  const navigate = useNavigate();
  const { role, isLoading: isAuthLoading } = useAuth();
  //localStates
  const [getaways, setGetaways] = useState<Getaway[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  // const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);

  //graceful degradation pattern
  useEffect(() => {
    // const fetchInitialData = async () => {
    const fetchOwnerData = async () => {
      // if (isAuthLoading || !role) return;
      if (isAuthLoading) return;
      if (!role) {
        setError("Debes estar logueado para ver tus ofertas.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        console.log("api call...");
        // setIsOfflineMode(false);
        const rawData = await getOwnerGetaways();
        console.log("raw backend response:", rawData);
        //rawData array check
        if (Array.isArray(rawData)) {
          setGetaways(rawData.map(normalizeGetawayData));
        }
      } catch (err: any) {
        console.error("Error fetching owner getaways:", err);
        setError("No se pudieron cargar tus ofertas. Inténtalo más tarde.");
      } finally {
        setLoading(false);
      }
    };
    fetchOwnerData();
  }, [isAuthLoading, role]);

  const handlePageChange = (_: any, value: number) => setPage(value);
  // const handleViewDetails = (getaway: Getaway) => {
  //   navigate('/getawaydetail', { state: { getawayData: getaway } });
  // };

  const paginatedGetaways = getaways.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        <AdminSideBar />
        <Grid size={{ xs: 12, sm: 10 }} className="section blueBg">
          <Box>
            <Box sx={{ mb: 3 }}>
              <h4>My getaways</h4>
              {/* <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>My getaways</Typography> */}
              {error && <Alert severity="info" sx={{ mb: 2 }}>
                {error}
                {/* No getaways available right now. Try again later or create a new one. */}
              </Alert>}
              <Typography color="text.secondary" 
                // sx={{ mb: 1 }}
                >
                {getaways.length > 0
                  ? `You have ${getaways.length} getaways registered`
                  : 'No offers registered yet'
                }
                {/* {filteredGetaways.length > 0
                  ? `Nearest getaways offers at: ${filteredGetaways.length}`
                  : 'No offers match your search'
                } */}
              </Typography>
            </Box>
            {/* {getaways.length > 0 && (
              paginatedGetaways.map((getaway, index) => (
                <GetawayItem
                  key={getaway._id || `fallback-key-${index}`}
                  name={getaway.title || "Untitled Offer"}
                  dates={`${getaway.startDate} - ${getaway.endDate}`}
                  lodgingOptions={getaway.lodgingOptions || []}
                  sport={getSportLabel(getaway.sport)}
                  galleryPhotos={getValidImages(getaway.galleryPhotos)}
                  onViewDetails={() => handleViewDetails(getaway)}
                  onBookNow={() => handleBookNow(getaway)}
                />
              ))
            )} */}
          </Box>
          <Stack spacing={2}>
            {paginatedGetaways.map((getaway) => (
              <GetawayItem
                key={getaway._id || ""}
                name={getaway.title || "Untitled Offer"}
                dates={`${getaway.startDate} - ${getaway.endDate}`}
                lodgingOptions={getaway.lodgingOptions || []}
                sport={getSportLabel(getaway.sport)}
                galleryPhotos={getValidImages(getaway.galleryPhotos)}
                onViewDetails={() => navigate('/getawaydetail', { state: { getawayData: getaway } })}
                onBookNow={() => navigate('/bookgetaway', { state: { getawayData: getaway } })}
                // onViewDetails={() => handleViewDetails(getaway)}
                // onBookNow={() => handleBookNow(getaway)}
              />
            ))}
          </Stack>

          {getaways.length > ITEMS_PER_PAGE && (
            <Stack spacing={2} sx={{ mt: 4, alignItems: 'center' }}>
              <Pagination
                shape="rounded"
                count={Math.ceil(getaways.length / ITEMS_PER_PAGE)}
                page={page}
                onChange={handlePageChange}
              />
            </Stack>
          )}
        </Grid>
      </Grid>
    </>
  );
}
