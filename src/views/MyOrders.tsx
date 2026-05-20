import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Stack, Pagination, Typography, CircularProgress, Alert } from '@mui/material';
import Grid from '@mui/material/Grid2';
import AdminSideBar from '../components/AdminSidebar';
import { GetawayItem } from '../components/GetawayItem';

import { useAuth } from '../contexts/AuthContext';
import { useOwnerGetaways } from '../hooks/useOwnerGetaways';
// import { useSubscribedGetaways } from '../hooks/useSubscribedGetaways';

import { getSportLabel, getValidImages } from '../utils/getawayHelpers';

// import { useWatchLocation } from '../hooks/useWatchLocation';
// import { useUserStore } from '../store/useUserStore';
// import { SearchService } from '../services/searchService';

export default function MyOrders() {
  // useWatchLocation();
  //subscribe to userLocation global state
  // const userLocation = useUserStore((state) => state.userLocation);
  // console.log('userLocation:', userLocation);

  const navigate = useNavigate();
  const { role, isLoading: isAuthLoading } = useAuth();
  //localStates
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const isUserValid = !isAuthLoading && !!role;
  const { data: getaways = [], isLoading: isDataLoading, error: queryError } = useOwnerGetaways(isUserValid);
  // const { data: getaways = [], isLoading: isDataLoading, error: queryError } = useSubscribedGetaways(isUserValid);

  const authError = !isAuthLoading && !role ? "Youn must be logged to review your getaways" : null;
  const displayError = authError || (queryError instanceof Error ? queryError.message : null);
  const handlePageChange = (_: any, value: number) => setPage(value);
  // const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);

  const paginatedGetaways = getaways.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  if (isAuthLoading || isDataLoading) {
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
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>My getaway's orders</Typography>
              {/* <h4>My getaways</h4> */}
              {displayError && (
                <Alert severity="info" sx={{ mb: 2 }}> {displayError} </Alert>
              )}
              <Typography color="text.secondary">
                {getaways.length > 0
                  ? `You have ${getaways.length} getaways purchased`
                  : 'No orders registered yet'
                }
                {/* {filteredGetaways.length > 0
                  ? `Nearest getaways offers at: ${filteredGetaways.length}`
                  : 'No offers match your search'
                } */}
              </Typography>
            </Box>
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
                onOrderDetails={() => navigate(`/orders/${getaway.orderId}`)}
                // onViewDetails={() => handleViewDetails(getaway)}
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