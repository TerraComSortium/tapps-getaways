import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { Box, Stack, Pagination, Typography, CircularProgress, Alert } from '@mui/material';
import Grid from '@mui/material/Grid2';
import AdminSideBar from '../components/AdminSidebar';
import { GetawayItem } from '../components/GetawayItem';

import { useAuth } from '../contexts/AuthContext';
import { useSubscribedGetaways } from '../hooks/useSubscribedGetaways';
import { normalizeGetawayData, getSportLabel, getValidImages } from '../utils/getawayHelpers';

export default function MyOrders() {
  const navigate = useNavigate();
  const { role, isLoading: isAuthLoading } = useAuth();
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Getaways a los que el jugador está suscrito (GET /getaways/subscribed)
  const { data, loading: isDataLoading, error: queryError } = useSubscribedGetaways();

  // El backend responde { count, offers }; normalizamos a Getaway[].
  const rawOffers =
    (data as any)?.offers || (data as any)?.results || (Array.isArray(data) ? data : []);
  const getaways = Array.isArray(rawOffers) ? rawOffers.map(normalizeGetawayData) : [];

  const authError = !isAuthLoading && !role ? 'You must be logged in to review your bookings' : null;
  const displayError = authError || queryError;
  const handlePageChange = (_: any, value: number) => setPage(value);

  const paginatedGetaways = getaways.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  if (isAuthLoading || isDataLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Grid container columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        <AdminSideBar />
        <Grid size={{ xs: 12, sm: 9, md: 10 }} className="section blueBg">
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>My bookings</Typography>
            {displayError && <Alert severity="info" sx={{ mb: 2 }}>{displayError}</Alert>}
            <Typography color="text.secondary">
              {getaways.length > 0
                ? `You are subscribed to ${getaways.length} getaway${getaways.length > 1 ? 's' : ''}`
                : 'You are not subscribed to any getaway yet'}
            </Typography>
          </Box>

          <Stack spacing={2}>
            {paginatedGetaways.map((getaway: any) => (
              <GetawayItem
                key={getaway._id || getaway.id || ''}
                name={getaway.title || 'Untitled getaway'}
                dates={`${getaway.startDate} - ${getaway.endDate}`}
                lodgingOptions={getaway.lodgingOptions || []}
                sport={getSportLabel(getaway.sport)}
                galleryPhotos={getValidImages(getaway.galleryPhotos)}
                onViewDetails={() => navigate(ROUTES.GETAWAY_DETAIL, { state: { getawayData: getaway } })}
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