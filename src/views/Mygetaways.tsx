import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Stack, Pagination, Typography, CircularProgress, Alert } from '@mui/material';
import Grid from '@mui/material/Grid2';
import AdminSideBar from '../components/AdminSidebar';
import { GetawayItem } from '../components/GetawayItem';

import type { Getaway } from '../types/getaway';
import { useAuth } from '../contexts/AuthContext';
import { useDeleteGetaway } from '../hooks/useDeleteGetaway';

// import { useWatchLocation } from '../hooks/useWatchLocation';
// import { useUserStore } from '../store/useUserStore';

import { getGetawaysByOwner } from '../services/getaways/getaways';
// import { SearchService } from '../services/searchService';
import { normalizeGetawayData, getSportLabel, getValidImages } from '../utils/getawayHelpers';

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

  const [ successDeleteMsg, setSuccessDeleteMsg] = useState<string | null>(null);
  const { removeGetaway, isDeleting} = useDeleteGetaway();

  const ITEMS_PER_PAGE = 10;
  // const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);

  //graceful degradation pattern
  useEffect(() => {
    const fetchOwnerData = async () => {
      if (isAuthLoading) return;
      if (!role) {
        setError("You must be logged to review getaways");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        console.log("api call...");
        // setIsOfflineMode(false);
        const rawData = await getGetawaysByOwner();
        console.log("raw backend response:", rawData);
        const dataArray = Array.isArray(rawData)
          ? rawData
          : (rawData.data || rawData.offers || []);
        if (dataArray.length > 0) {
          setGetaways(dataArray.map(normalizeGetawayData));
        }
      } catch (err: any) {
        console.error("Error fetching owner getaways:", err);
        setError("Your offers could not be loaded. Please try again later.");
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

  const handleDeleteClick = (idToDelete: string) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete getaway: "${name}"?. This action cannot be undone.`);
    if (!isConfirmed) return;
    removeGetaway(idToDelete, {
      onSuccess: () => {
        setSuccessDeleteMsg("Getaway deleted successfully!");
        setTimeout(() => setSuccessDeleteMsg(null), 3000);
      },
      onError: () => {
        alert("An error occurred while deleting the offer on the server. Please try again later.");
      }
    });
  };

  if (loading) {
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
            <CircularProgress />
          </Box>
      )}
      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        <AdminSideBar />
        <Grid size={{ xs: 12, sm: 10 }} className="section blueBg">
          <Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>My getaways</Typography>
              {/* <h4>My getaways</h4> */}
              {error && <Alert severity="info" sx={{ mb: 2 }}>
                {error}
                {/* No getaways available right now. Try again later or create a new one. */}
                </Alert>
              }
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
              <GetawayItem
                key={getaway._id || ""}
                name={getaway.title || "Untitled Offer"}
                dates={`${getaway.startDate} - ${getaway.endDate}`}
                lodgingOptions={getaway.lodgingOptions || []}
                sport={getSportLabel(getaway.sport)}
                galleryPhotos={getValidImages(getaway.galleryPhotos)}
                onViewDetails={() => navigate('/getawaydetail', { state: { getawayData: getaway } })}
                onBookNow={() => navigate('/bookgetaway', { state: { getawayData: getaway } })}
                isDeleting={isDeleting}
                onDelete={() => handleDeleteClick(getaway._id)}
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
