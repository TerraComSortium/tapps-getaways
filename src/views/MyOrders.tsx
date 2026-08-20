import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../constants/routes';
import { Box, Stack, Pagination, Typography, CircularProgress, Alert } from '@mui/material';
import Grid from '@mui/material/Grid2';
import AdminSideBar from '../components/AdminSidebar';
import { GetawayItem } from '../components/GetawayItem';

import { useAuth } from '../contexts/AuthContext';
import { useSubscribedGetaways } from '../hooks/useSubscribedGetaways';
import { useGetawayNavigation } from '../hooks/useGetawayNavigation';
import { normalizeGetawayData, getSportLabel, getValidImages, formatGetawayDates, parseFirestoreDate } from '../utils/getawayHelpers';

export default function MyOrders() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { handleViewDetails } = useGetawayNavigation();
  const { role, isLoading: isAuthLoading } = useAuth();
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Getaways a los que el jugador está suscrito (GET /getaways/subscribed)
  const { data, loading: isDataLoading, error: queryError } = useSubscribedGetaways();
  console.log('getSuscribed player', data)
  // El backend responde { count, offers }; normalizamos a Getaway[].
  const rawOffers =
    (data as any)?.offers || (data as any)?.results || (Array.isArray(data) ? data : []);
  const getaways = Array.isArray(rawOffers) ? rawOffers.map(normalizeGetawayData) : [];

  const authError = !isAuthLoading && !role ? t('myOrders.mustLogin') : null;
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
        <Grid size={{ xs: 12, sm: 10 }} className="section blueBg">
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>{t('myOrders.title')}</Typography>
            {displayError && <Alert severity="info" sx={{ mb: 2 }}>{displayError}</Alert>}
            <Typography color="text.secondary">
              {getaways.length > 0
                ? t('myOrders.subscribed', { count: getaways.length })
                : t('myOrders.none')}
            </Typography>
          </Box>

          <Stack spacing={2}>
            {paginatedGetaways.map((getaway: any, index) => (
              <GetawayItem
                key={index || getaway._id || getaway.id || ''}
                name={getaway.title || t('common.untitledGetaway')}
                dates={formatGetawayDates(getaway.startDate, getaway.endDate)}
                lodgingOptions={getaway.lodgingOptions || []}
                sport={getSportLabel(getaway.sport)}
                galleryPhotos={getValidImages(getaway.galleryPhotos)}
                bookedDate={parseFirestoreDate(getaway.subscribedAt)}
                onViewDetails={() => handleViewDetails(getaway)}
                onOrderDetails={() => navigate(ROUTES.GETAWAY_DETAIL, { state: { getawayData: getaway } })}
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