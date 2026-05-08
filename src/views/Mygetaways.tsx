import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Stack, Pagination, Typography, CircularProgress, Alert } from '@mui/material';
import Grid from '@mui/material/Grid2';
import AdminSideBar from '../components/AdminSidebar';
import { GetawayItem } from '../components/GetawayItem';
// import SearchBar from '../components/SearchBar';

import type { Getaway } from '../types/getaway';
import { useWatchLocation } from '../hooks/useWatchLocation';
// import { useUserStore } from '../store/useUserStore';
import { useAuth } from '../contexts/AuthContext';

import { getOwnerGetaways } from '../services/getawayApi';
// import { SearchService } from '../services/searchService';

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

// const getValidImages = (photos: string[] | undefined) => {
//   if (!photos || !Array.isArray(photos)) return [];
//   return photos.filter(url => typeof url === 'string' && url.length > 5);
// };

export default function Mygetaways() {
  useWatchLocation();
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
    const fetchInitialData = async () => {
      if (isAuthLoading || !role) return;
      setLoading(true);
      try {
        setError(null);
        console.log("api call...");
        // setIsOfflineMode(false);
        const rawData = await getOwnerGetaways();
        console.log("raw backend response:", rawData);
        //rawData array check
        if (!Array.isArray(rawData)) {
          console.error("response not array, instead:", typeof rawData);
          return;
        }

        const cleanData = rawData.map(normalizeGetawayData);
        console.log("finalData normalized:", cleanData);
        setGetaways(cleanData);
      } catch (err: any) { //(!api || localStorage getGetaways?)
        console.warn("Error fetching owner getaways", err.message);
        setError("No getaways could be loaded at this time. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [isAuthLoading, role]);

  const handleViewDetails = (getaway: Getaway) => {
    navigate('/getawaydetail', { state: { getawayData: getaway } });
  };
  // const handleBookNow = (getaway: Getaway) => {
  //   navigate('/bookgetaway', { state: { getawayData: getaway } });
  // };
  //initial search with userLocation
  // const handleChange = (_event: React.ChangeEvent<unknown>, value: number) => {
  //   setPage(value);
  // };
  const getValidImages = (photos: string[] | undefined) => {
    if (!photos || !Array.isArray(photos) || photos.length === 0) return [];
    return photos.filter(url => url && typeof url === 'string' && url.length > 5);
  };

  const paginatedGetaways = getaways.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );
  // const paginatedGetaways = filteredGetaways.slice(
  //   (page - 1) * ITEMS_PER_PAGE,
  //   page * ITEMS_PER_PAGE
  // );

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
        <Grid size={{ xs:10 }} spacing={1} className="section blueBg">
          {/* <SearchBar onSearch={handleSearchFromBar} /> */}
          <Box>
            <Box sx={{ mb: 3 }}>
              <h4>My getaways</h4>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {/* {isOfflineMode && <Alert severity="warning" sx={{ mb: 2 }}>Showing local preview data. Backend connection failed.</Alert>} */}
              <Typography sx={{ mb: 1 }}>
                {getaways.length > 0
                  ? `You have ${getaways.length} getaways registered`
                  : 'No offers registered'
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
            {paginatedGetaways.map((getaway) => (
              <GetawayItem
                key={getaway._id}
                name={getaway.title}
                dates={`${getaway.startDate} - ${getaway.endDate}`}
                lodgingOptions={getaway.lodgingOptions}
                sport={getSportLabel(getaway.sport)}
                galleryPhotos={getValidImages(getaway.galleryPhotos)}
                onViewDetails={() => navigate('/getawaydetail', { state: { getawayData: getaway } })}
                onBookNow={() => navigate('/bookgetaway', { state: { getawayData: getaway } })}
              />
            ))}
          </Box>

          {getaways.length > ITEMS_PER_PAGE && (
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