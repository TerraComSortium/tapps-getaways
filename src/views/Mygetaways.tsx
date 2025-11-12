import React, { useEffect, useState } from 'react';
import { Box, Stack, Pagination, Typography, CircularProgress, Alert } from '@mui/material';
import Grid from '@mui/material/Grid2';
import AdminSideBar from '../components/AdminSidebar';
import GetawayItem from '../components/GetawayItem';
import { useNavigate } from 'react-router-dom';
import { getGetaways } from '../services/getawayApi';
import type { Getaway } from '../types/getaway';

const sportMap: { [key: string]: string } = {
  '1': 'Tennis',
  '2': 'Padel',
  '3': 'Pickleball'
};

export default function Mygetaways() {
  const [getaways, setGetaways] = useState<Getaway[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const handleViewDetails = (getaway: Getaway) => {
    navigate('/getawaydetail', { state: { getawayData: getaway } });
  };

  const handleBookNow = (getaway: Getaway) => {
    navigate('/bookgetaway', { state: { getawayData: getaway } });
  };


  useEffect(() => {
    const fetchGetaways = async () => {
      try {
        const data = await getGetaways();
        setGetaways(data);
      } catch (err) {
        setError("Getaways could not be loaded. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchGetaways();
  }, []);
  const handleChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  console.log(getaways)

  //render
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
        <Grid size={{ xs:10 }} spacing={2} justifyContent="center" className="section blueBg">
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <h2 className="title">My getaways</h2>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              <Typography sx={{ mb: 1 }}>
                {getaways.length > 0 ? `You have ${getaways.length} getaways registered` : 'No offers registered'}
              </Typography>
            </Box>

            {getaways.length > 0 && (
              getaways.map((getaway) => (
                <GetawayItem
                  key={getaway.id}
                  name={getaway.getawayTitle}
                  price={getaway.price}
                  dates={`${getaway.startDate} - ${getaway.endDate}`}
                  lodgingOptions={getaway.lodgingOptions || []}
                  // description={getaway.overview}
                  sport={sportMap[getaway.sport] || 'No available'}
                  galleryPhotos={getaway.galleryPhoto || []}
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
                count={Math.ceil(getaways.length / 10)}
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