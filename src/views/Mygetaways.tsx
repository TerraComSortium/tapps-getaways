import React, { useEffect, useState } from 'react';
import { Box, Stack, Pagination, Typography, CircularProgress, Alert } from '@mui/material';
import Grid from '@mui/material/Grid2';
import AdminSideBar from '../components/AdminSidebar';
import GetawayItem from '../components/GetawayItem';
import { useNavigate } from 'react-router-dom';
import { getGetaways } from '../services/getawayApi';
import type { Getaway } from '../types/getaway';
import SearchBar from '../components/SearchBar';
import { useWatchLocation } from '../hooks/useWatchLocation';

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

  const [getaways, setGetaways] = useState<Getaway[]>([]);
  const [filters, setFilters] = useState({ city: '', sport: '', startDate: '', endDate: '' });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const navigate = useNavigate();

  const handleViewDetails = (getaway: Getaway) => {
    navigate('/getawaydetail', { state: { getawayData: getaway } });
  };
  const handleBookNow = (getaway: Getaway) => {
    navigate('/bookgetaway', { state: { getawayData: getaway } });
  };
  //function for SearchBar
  const handleLocalSearch = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(1);
  };

  //derived state before pagination
  const filteredGetaways = getaways.filter((getaway) => {
    let matches = true;

    //city filter (case-insensitive)
    if (filters.city) {
      const address = getaway.getawayAddress?.address || '';
      if (!address.toLowerCase().includes(filters.city.toLowerCase())) {
        matches = false;
      }
    }

    //sports filter
    if (filters.sport) {
      const sportLabel = getSportLabel(getaway.sport).toLowerCase();
      if (sportLabel !== filters.sport.toLowerCase()) {
        matches = false;
      }
    }

    //dates filter ISO format ('YYYY-MM-DD')
    if (filters.startDate && filters.startDate.trim() !== '' && getaway.startDate) {
      //filter earlier offers than selected start date
      if (getaway.startDate < filters.startDate) matches = false;
    }

    if (filters.endDate && filters.endDate.trim() !== '' && getaway.endDate) {
      //filter later offers than selected end date
      if (getaway.endDate > filters.endDate) matches = false;
    }
    return matches;
  });

  const handleChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const getValidImages = (photos: string[] | undefined) => {
    if (!photos || !Array.isArray(photos) || photos.length === 0) return [];
    return photos.filter(url => url && typeof url === 'string' && url.length > 5);
  };

  useEffect(() => {
    const fetchGetaways = async () => {
      try {
        const rawData = await getGetaways();
        console.log("initialData:", rawData);

        const cleanData = rawData.map(normalizeGetawayData);
        console.log("cleanData:", cleanData);
        setGetaways(cleanData);
      } catch (err) {
        console.error(err);
        setError("Getaways could not be loaded. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchGetaways();
  }, []);

  // const paginatedGetaways = getaways.slice(
  //   (page - 1) * ITEMS_PER_PAGE,
  //   page * ITEMS_PER_PAGE
  // );
  const paginatedGetaways = filteredGetaways.slice(
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
        <Grid size={{ xs:10 }} spacing={1} className="section blueBg">
          <SearchBar onSearch={handleLocalSearch} />
          <Box>
            <Box sx={{ mb: 3 }}>
              <h3>My getaways</h3>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              <Typography sx={{ mb: 1 }}>
                {/* {getaways.length > 0 ? `You have ${getaways.length} getaways registered` : 'No offers registered'} */}
                {filteredGetaways.length > 0
                  ? `Showing ${filteredGetaways.length} getaways`
                  : 'No offers match your search'
                }
              </Typography>
            </Box>

            {filteredGetaways.length > 0 && (
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

          {filteredGetaways.length > 0 && (
            // {getaways.length > 0 && (
              <Stack spacing={2} sx={{ mt: 4, alignItems: 'center' }}>
                <Pagination
                  shape="rounded"
                  // count={Math.ceil(getaways.length / ITEMS_PER_PAGE)}
                  count={Math.ceil(filteredGetaways.length / ITEMS_PER_PAGE)}
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