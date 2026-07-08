import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES, reservationsPath } from '../constants/routes';
import { Box, Stack, Pagination, Typography, CircularProgress, Alert } from '@mui/material';
import Grid from '@mui/material/Grid2';
import AdminSideBar from '../components/AdminSidebar';
import { GetawayItem } from '../components/GetawayItem';

import { useAuth } from '../contexts/AuthContext';
import { Role } from '../constants/roles';
import { useDeleteGetaway } from '../hooks/useDeleteGetaway';
import { useOwnerGetaways } from '../hooks/useOwnerGetaways';
import { getSportLabel, getValidImages, formatGetawayDates } from '../utils/getawayHelpers';

// import { useWatchLocation } from '../hooks/useWatchLocation';
// import { useUserStore } from '../store/useUserStore';
// import { SearchService } from '../services/searchService';

export default function Mygetaways() {
  // useWatchLocation();
  //subscribe to userLocation global state
  // const userLocation = useUserStore((state) => state.userLocation);
  // console.log('userLocation:', userLocation);

  // const { role, isLoading: isAuthLoading } = useAuth();
  const { role, isLoading } = useAuth();
  const navigate = useNavigate();
  //localStates
  const [page, setPage] = useState(1);
  const [successDeleteMsg, setSuccessDeleteMsg] = useState<string | null>(null);
  const ITEMS_PER_PAGE = 10;

  // const isUserValid = !isAuthLoading && !!role;
  const isUserValid = !isLoading && !!role;

  const { data: getaways = [], isLoading: isDataLoading, error: queryError } = useOwnerGetaways(isUserValid);
  const { removeGetaway, isDeleting } = useDeleteGetaway();
  // const authError = !isAuthLoading && !role ? "Youn must be logged to review your getaways" : null;
  const authError = !isLoading && !role ? "Youn must be logged to review your getaways" : null;

  const displayError = authError || (queryError instanceof Error ? queryError.message : null);
  const handlePageChange = (_: any, value: number) => setPage(value);
  // const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);

  const paginatedGetaways = getaways.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handleViewReservations = (id:string) => {
    if(!id)return;
    navigate (reservationsPath(id))
  }

  const handleDeleteClick = (getawayId: string, getawayTitle: string) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete getaway: "${getawayTitle}"?. This action cannot be undone.`);
    if (!isConfirmed) return;
    removeGetaway(getawayId, {
      onSuccess: () => {
        setSuccessDeleteMsg("Getaway deleted successfully!");
        setTimeout(() => setSuccessDeleteMsg(null), 3000);

        if(paginatedGetaways.length === 1 && page > 1) {
          setPage(page - 1);
        }
      },
      onError: () => {
        alert("An error occurred while deleting the offer on the server. Please try again later.");
      }
    });
  };

  if (
    // isAuthLoading
    isLoading || isDataLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  return (
    <>
      {isDeleting && (
        <Box sx={{ position: 'fixed', top:10, right:10, zIndex: 9999 }}>
          <CircularProgress size={24}/>
        </Box>
      )}
      <Grid container columnSpacing={{ xs: 0, sm: 2, md: 3 }}>
        <AdminSideBar />
        <Grid size={{ xs: 12, sm: 9, md:10 }} className="section blueBg">
          <Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>My getaways</Typography>
              {displayError && (
                <Alert severity="info" sx={{ mb: 2 }}> {displayError} </Alert>
              )}
              {successDeleteMsg && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {successDeleteMsg}
                </Alert>
              )}
              <Typography color="text.secondary">
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

          </Box>
          <Stack spacing={2}>
            {paginatedGetaways.map((getaway) => (
              console.log(`Getaway: ${getaway.title}`, {
                startRawDate: getaway.startDate,
                typeStart: typeof getaway.startDate,
                resultHelper: formatGetawayDates(getaway.startDate, getaway.endDate)
              }),
              <GetawayItem
                key={getaway._id || ""}
                name={getaway.title || "Untitled Offer"}
                // dates={`${getaway.startDate} - ${getaway.endDate}`}
                dates={formatGetawayDates(getaway.startDate, getaway.endDate)}
                lodgingOptions={getaway.lodgingOptions || []}
                sport={getSportLabel(getaway.sport)}
                galleryPhotos={getValidImages(getaway.galleryPhotos)}
                onViewDetails={() => navigate(ROUTES.GETAWAY_DETAIL, { state: { getawayData: getaway } })}
                // onViewDetails={() => handleViewDetails(getaway)}
                isDeleting={isDeleting}
                onDelete={() => handleDeleteClick(getaway._id, getaway.title)}
                // onEdit={role === 'admin' ? () => handleEdit(getaway.id) : undefined}
                // onViewBookings ={role === 'admin' ? () => 
                onViewBookings ={role === Role.ADMIN ? () =>
                  handleViewReservations(getaway._id) : undefined}
                // badgeCount={getaway.subscribersCount || 0} //toDo
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
