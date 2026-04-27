import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Stack, Pagination, Typography, CircularProgress, Alert } from '@mui/material';
import Grid from '@mui/material/Grid2';
// import AdminSideBar from '../components/AdminSidebar';
import GetawayItem from '../components/GetawayItem';
import SearchBar from '../components/SearchBar';

import type { Getaway } from '../types/getaway';
import { useWatchLocation } from '../hooks/useWatchLocation';
import { useUserStore } from '../store/useUserStore';

import { getGetaways } from '../services/getawayApi';
import { SearchService } from '../services/searchService';

const normalizeGetawayData = (raw: any): Getaway => {
  return {
    _id: raw._id || raw.id || `temp_${Math.random()}`,
    title: raw.title || raw.getawayTitle || "Untitled Offer",
    overview: raw.overview || raw.getawayOverview || "",
    startDate: raw.startDate || "",
    endDate: raw.endDate || "",
    sport: raw.sport || "",
    galleryPhotos: raw.galleryPhotos || raw.galleryPhoto || [],

    lodgingOptions: raw.lodgingOptions || [],
    optionalAddOns: raw.optionalAddOns || [],
    amenities: raw.amenities || [],
    schedule: raw.schedule || [],
    caption: raw.caption || "",
    galleryVideo: raw.galleryVideo || "",
    mainDescription: raw.mainDescription || raw.getawayOverview || "",
    policies: raw.policies || "",
    terms: raw.terms || "",

    getawayAddress: raw.getawayAddress || { address: raw.address || "", lat: raw.location?.lat || 0, lng: raw.location?.lng || 0 }
  };
};
//temporal search at localstorage
const performFallbackLocalSearch = (
  rawData: any[],
  filters: { q?: string; sport?: string; startDate?: string | null; endDate?: string | null }
): Getaway[] => {
  let results = rawData.map(normalizeGetawayData);

  //q validation
  if (filters.q && filters.q.trim() !== '') {
    const searchTerm = filters.q.trim().toLowerCase();
    results = results.filter(g =>
      g.getawayAddress?.address.toLowerCase().includes(searchTerm) ||
      g.title.toLowerCase().includes(searchTerm)
    );
  }

  if (filters.sport && filters.sport.trim() !== '') {
    const filterSportLabel = getSportLabel(filters.sport).toLowerCase();
    results = results.filter(g => getSportLabel(g.sport).toLowerCase() === filterSportLabel);
  }

  if (filters.startDate && filters.startDate.trim() !== '') {
    results = results.filter(g => !g.startDate || g.startDate >= filters.startDate!);
  }
  if (filters.endDate && filters.endDate.trim() !== '') {
    results = results.filter(g => !g.endDate || g.endDate <= filters.endDate!);
  }

  return results;
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

export default function Mygetaways() {
  useWatchLocation();
  //subscribe to userLocation global state
  const userLocation = useUserStore((state) => state.userLocation);
  console.log('userLocation:', userLocation);
  const navigate = useNavigate();

  const [getaways, setGetaways] = useState<Getaway[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  //graceful degradation pattern
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        setError(null);
        setIsOfflineMode(false);
        let rawData;

        if (userLocation?.lat && userLocation?.lng) {
          console.log("Position detected: searching nearby offers at 300km...");
          rawData = await SearchService.search({
            lat: userLocation.lat,
            lng: userLocation.lng
          });
        } else {
          console.log("Without usrLocation: receving all offers...");
          rawData = await getGetaways();
        }

        //Normalize and save data
        const cleanData = rawData.map(normalizeGetawayData);
        setGetaways(cleanData);

      } catch (err: any) { //(!api || localStorage getGetaways?)
        console.warn("Error a initial fetch data", err.message);
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

    SearchService.search({
      lat: searchLat,
      lng: searchLng,
      q: filters.q,
      sport: filters.sport,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined
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
  };
  const handleBookNow = (getaway: Getaway) => {
    navigate('/bookgetaway', { state: { getawayData: getaway } });
  };
  //initial search with userLocation
  const handleChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };
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
      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }} >
        {/* <AdminSideBar /> */}
        <Grid size={{ xs:1 }}/>
        <Grid size={{ xs:10 }} 
          spacing={1} 
          className="section blueBg">
          <SearchBar onSearch={handleSearchFromBar} />
          <Box>
            <Box sx={{ mb: 3 }}>
              {/* <h4>My getaways</h4> */}
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {isOfflineMode && <Alert severity="warning" sx={{ mb: 2 }}>Showing local preview data. Backend connection failed.</Alert>}
              <Typography variant="subtitle1" sx={{ mt:"20px"}}>
                {getaways.length > 0
                  ? `${isOfflineMode ? 'Local matches near cityName' : 'Getaways offers'}: ${getaways.length}`
                  // at {cityName}
                  : 'No offers match your search'
                }
                {/* {getaways.length > 0 ? `You have ${getaways.length} getaways registered` : 'No offers registered'} */}
                {/* {filteredGetaways.length > 0
                  ? `Nearest getaways offers at: ${filteredGetaways.length}`
                  : 'No offers match your search'
                } */}
              </Typography>
            </Box>

            {getaways.length > 0 && (
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
            )}
          </Box>

          {getaways.length > 0 && (
            <Stack spacing={2} sx={{ mt: 4, alignItems: 'center' }}>
              <Pagination
                shape="rounded"
                count={Math.ceil(getaways.length / ITEMS_PER_PAGE)}
                // count={Math.ceil(filteredGetaways.length / ITEMS_PER_PAGE)}
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