import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Stack, Pagination, Typography, CircularProgress, Alert } from '@mui/material';
import Grid from '@mui/material/Grid2';
import AdminSideBar from '../components/AdminSidebar';
import { GetawayItem } from '../components/GetawayItem';

import type { Getaway } from '../types/getaway';
import { useWatchLocation } from '../hooks/useWatchLocation';
import { useUserStore } from '../store/useUserStore';
import { getGetaways } from '../services/getawayApi';
import { SearchService } from '../services/searchService';
import {
  normalizeGetawayData,
  getSportLabel,
  getValidImages,
} from '../utils/getawayHelpers';

export default function Mygetaways() {
  useWatchLocation();
  const userLocation = useUserStore((state) => state.userLocation);
  const navigate = useNavigate();

  const [getaways, setGetaways] = useState<Getaway[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        setError(null);
        setIsOfflineMode(false);
        let rawData;

        if (userLocation?.lat && userLocation?.lng) {
          rawData = await SearchService.search({ lat: userLocation.lat, lng: userLocation.lng });
        } else {
          rawData = await getGetaways();
        }

        setGetaways(rawData.map(normalizeGetawayData));
      } catch (err: any) {
        console.warn("Error fetching initial data:", err.message);
        setError("No getaways could be loaded at this time. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [userLocation]);

  const handleViewDetails = (getaway: Getaway) => {
    navigate('/getawaydetail', { state: { getawayData: getaway } });
  };

  const handleBookNow = (getaway: Getaway) => {
    navigate('/bookgetaway', { state: { getawayData: getaway } });
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

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
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>My getaways</Typography>

              {isOfflineMode && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Showing local preview data. Backend connection failed.
                </Alert>
              )}

              {error && getaways.length === 0 ? (
                <Alert severity="info" sx={{ mt: 1 }}>
                  No getaways available right now. Try again later or create a new one.
                </Alert>
              ) : (
                <Typography sx={{ mb: 1 }}>
                  {getaways.length > 0
                    ? `${isOfflineMode ? 'Local matches' : 'Getaways offers'}: ${getaways.length}`
                    : 'No offers match your search'
                  }
                </Typography>
              )}
            </Box>

            {getaways.length > 0 && paginatedGetaways.map((getaway, index) => (
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
            ))}
          </Box>

          {getaways.length > 0 && (
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
