import { useEffect, useMemo, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  const routerLocation = useLocation();
  const { handleViewDetails } = useGetawayNavigation();
  const [getaways, setGetaways] = useState<Getaway[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
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

  const filtersFromUrl = useMemo(() => {
    const params = new URLSearchParams(routerLocation.search);
    const parseCoordinate = (value: string | null): number | null => {
      if (value === null || value.trim() === '') return null;

      const coordinate = Number(value);
      return Number.isFinite(coordinate) ? coordinate : null;
    };

    return {
      lat: parseCoordinate(params.get('lat')),
      lng: parseCoordinate(params.get('lng')),
      sport: params.get('sport') || undefined,
      startDate: params.get('startDate') || undefined,
      endDate: params.get('endDate') || undefined,
    };
  }, [routerLocation.search]);

  // Evita consultas duplicadas por actualizaciones de referencia en userLocation.
  const previousRequestKey = useRef<string>('');

  useEffect(() => {
    const hasLocationInUrl = filtersFromUrl.lat !== null && filtersFromUrl.lng !== null;
    const searchLat = hasLocationInUrl ? filtersFromUrl.lat : userLocation?.lat;
    const searchLng = hasLocationInUrl ? filtersFromUrl.lng : userLocation?.lng;
    const requestKey = hasLocationInUrl
      ? routerLocation.search
      : searchLat !== undefined && searchLng !== undefined ? `${searchLat},${searchLng}` : 'all';

    if (requestKey === previousRequestKey.current) return;
    previousRequestKey.current = requestKey;

    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (
          typeof searchLat === 'number' &&
          typeof searchLng === 'number' &&
          Number.isFinite(searchLat) &&
          Number.isFinite(searchLng)
        ) {
          const rawData = await searchGetaways({
            lat: searchLat,
            lng: searchLng,
            ...(hasLocationInUrl && { sport: filtersFromUrl.sport }),
            ...(hasLocationInUrl && { startDate: filtersFromUrl.startDate }),
            ...(hasLocationInUrl && { endDate: filtersFromUrl.endDate }),
          });
          setGetaways(rawData.map(normalizeGetawayData));
        } else {
          setGetaways(await getAllGetaways());
        }
      } catch (error: unknown) {
        console.warn('Error fetching initial getaways:', error);
        setError(t('getaways.loadError'));
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [filtersFromUrl, routerLocation.search, t, userLocation]);
  const handleSearchFromBar = async (filters: {
    q?: string;
    lat?: number | null;
    lng?: number | null;
    sport?: string;
    startDate?: string | null;
    endDate?: string | null;
  }) => {
    const searchLat = filters.lat ?? userLocation?.lat;
    const searchLng = filters.lng ?? userLocation?.lng;
    if (
      typeof searchLat !== 'number' ||
      typeof searchLng !== 'number' ||
      !Number.isFinite(searchLat) ||
      !Number.isFinite(searchLng)
    ) {
      setError(t('getaways.locationRequired'));
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const rawData = await searchGetaways({
        lat: searchLat,
        lng: searchLng,
        sport: filters.sport,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      });
      setGetaways(rawData.map(normalizeGetawayData));
      setPage(1);
    } catch (error: unknown) {
      console.warn('Error searching getaways:', error);
      setGetaways([]);
      setError(t('getaways.loadError'));
    } finally {
      setLoading(false);
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
          {!loading && error && getaways.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              {t('getaways.emptyState')}
            </Alert>
          ) : !loading && (
            <Typography variant="subtitle1" sx={{ mt: "20px" }}>
              {getaways.length > 0
                ? `${t('getaways.offers')}: ${getaways.length}`
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
              address={getaway.getawayAddress?.address || t('common.noAddress')}
              dates={`${getaway.startDate} - ${getaway.endDate}`}
              sport={getSportLabel(getaway.sport)}
              price={Number(getaway.price) || 0}
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
