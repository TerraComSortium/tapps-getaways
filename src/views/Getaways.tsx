import { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Stack, Pagination, Typography, CircularProgress, Alert } from '@mui/material';
import { GetawayItem } from '../components/GetawayItem';
import SearchBar from '../components/SearchBar';

import { useAuth } from '../contexts/AuthContext';
import type { Getaway } from '../types/getaway';
import { useUserStore } from '../store/useUserStore';
import type { Discount } from '../types/getaway';
import { getAllGetaways } from '../services/getaways/getaways';
import { searchGetaways } from '../services/search/search';
import { useGetawayNavigation } from '../hooks/useGetawayNavigation';
import { useCouponsForGetaways } from '../hooks/useCoupon';

import {
  normalizeGetawayData,
  performFallbackLocalSearch,
  getSportLabel,
  getValidImages,
  isGetawayExpired,
} from '../utils/getawayHelpers';
import {
  // ROUTES,
  // getawayDetailPath,
  bookingPath } from '../constants/routes';
import { Role } from '../constants/roles';

export default function Getaways() {
  const { t } = useTranslation();
  // App.tsx already calls useWatchLocation — no second watcher needed here
  const userLocation = useUserStore((state) => state.userLocation);
  const { role, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const { handleViewDetails } = useGetawayNavigation();
  const [getaways, setGetaways] = useState<Getaway[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const canViewCouponLabels = role === Role.ADMIN || role === Role.PLAYER;
  const getawayIds = useMemo(() => getaways.map((getaway) => getaway._id).filter(Boolean), [getaways]);
  const { data: coupons } = useCouponsForGetaways(getawayIds, canViewCouponLabels);
  const couponsByGetawayId = useMemo(
    () =>
      coupons.reduce(
        (map: Map<string, Discount>, coupon: Discount) => {
          if (coupon.getawayId) {
            map.set(coupon.getawayId, coupon);
          }
          return map;
        },
        new Map<string, Discount>()
      ),
    [coupons]
  );

  // Track previous coordinates to avoid re-fetching when the location object
  // changes reference but lat/lng values are identical (watchPosition fires repeatedly)
  const prevCoordsKey = useRef<string>('');

  useEffect(() => {
    const coordsKey = userLocation ? `${userLocation.lat},${userLocation.lng}` : '';
    if (coordsKey && coordsKey === prevCoordsKey.current) return;
    prevCoordsKey.current = coordsKey;

    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        let finalData: Getaway[] = [];

        if (userLocation?.lat && userLocation?.lng) {
          const rawData = await searchGetaways({
            lat: userLocation.lat,
            lng: userLocation.lng,
          });
          finalData = Array.isArray(rawData) ? rawData.map(normalizeGetawayData) : [];
        }
        // Fallback to all getaways if search returned nothing or there was no location
        // (the search endpoint filters by date ≥ today, so test data with past dates returns [])
        if (finalData.length === 0) {
          finalData = await getAllGetaways();
        }
        setGetaways(finalData);
      } catch (err: any) {
        console.warn("Error fetching initial getaways:", err.message);
        setError(t('getaways.loadError'));
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [userLocation, t]);
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
      setError(t('getaways.locationRequired'));
      return;
    }
    setLoading(true);
    setError(null);
    setIsOfflineMode(false);

    searchGetaways({
      lat: searchLat,
      lng: searchLng,
      sport: filters.sport,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
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
        setError(t('getaways.localCorrupted'));
      }
    } else {
      setError(t('getaways.noLocalData'));
    }
  };

  const handleBooking = (getaway: Getaway, couponId?: string) => {
    navigate(bookingPath(getaway._id, couponId), { state: { getawayData: getaway, couponId } });
  };
  //initial search with userLocation
  const handleChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };
  const paginatedGetaways = getaways.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );
  // const paginatedGetaways = filteredGetaways.slice(
  //   (page - 1) * ITEMS_PER_PAGE,
  //   page * ITEMS_PER_PAGE
  // );

  // if (isAuthLoading || isDataLoading) {
  if (isAuthLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  // console.log("structure getaway received API:", getaways[0]);
  return (
    <>
            <SearchBar onSearch={handleSearchFromBar} />
      <Box>
        <Box sx={{ mb: 3 }}>
          {isOfflineMode && (
            <Alert severity="warning" sx={{ mb: 2 }}>{t('getaways.offlineMode')}</Alert>
          )}
          {!loading && error && getaways.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              {t('getaways.emptyState')}
            </Alert>
          ) : !loading && (
            <Typography variant="subtitle1" sx={{ mt: "20px" }}>
              {getaways.length > 0
                ? `${isOfflineMode ? t('getaways.localMatches') : t('getaways.offers')}: ${getaways.length}`
                : t('getaways.noMatches')
              }
            </Typography>
          )}
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          getaways.length > 0 && paginatedGetaways.map((getaway, index) => (
            <GetawayItem
              key={getaway._id || `fallback-key-${index}`}
              name={getaway.title || t('common.untitledGetaway')}
              dates={`${getaway.startDate} - ${getaway.endDate}`}
              lodgingOptions={getaway.lodgingOptions || []}
              sport={getSportLabel(getaway.sport)}
              galleryPhotos={getValidImages(getaway.galleryPhotos)}
              coupon={couponsByGetawayId.get(getaway._id)}
              // isLoading={isLoading}
              onViewDetails={() => handleViewDetails(getaway)}
              onBookNow={role === Role.PLAYER && !isGetawayExpired(getaway) ? () => handleBooking(getaway, couponsByGetawayId.get(getaway._id)?.id) : undefined}
              // onEdit={role === 'admin' ? () => handleEdit(getaway.id) : undefined}
            />
          ))
        )}
      </Box>

      {!loading && getaways.length > 0 && (
        <Stack spacing={2} sx={{ mt: 4, alignItems: 'center' }}>
          <Pagination
            shape="rounded"
            count={Math.ceil(getaways.length / ITEMS_PER_PAGE)}
            page={page}
            onChange={handleChange}
          />
        </Stack>
      )}
    
    </>
  );
}
