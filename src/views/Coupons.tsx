import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { QueryClient } from '@tanstack/react-query';
import { Box, Typography, Alert, Stack, Pagination,
  // Button,
  CircularProgress } from '@mui/material';
import Grid from '@mui/material/Grid2';
// import AddIcon from '@mui/icons-material/Add';
import { BRAND } from '../theme/colors';
import { useTranslation } from 'react-i18next';
import { useCoupons,
  // useCouponActions
} from '../hooks/useCouponActions';
import { couponEditPath,
  // couponNewPath
} from '../constants/routes';
import AdminSideBar from '../components/AdminSidebar';
import { CouponItem } from '../components/CouponItem';
import { firestoreToDate } from '../utils/dates';
import { useDeleteCoupon } from '../hooks/useDeleteCoupon';

export default function Coupons() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: coupons, loading, error } = useCoupons();

  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [successDeleteMsg, setSuccessDeleteMsg] = useState<string | null>(null);
  const { removeCoupon, isDeleting } = useDeleteCoupon();
  const handlePageChange = (_: any, value: number) => setPage(value);
  const paginatedCoupons = coupons.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );
  const handleDeleteClick = (couponId: string,
    couponTitle: string
  ) => {
    const message = t('coupons.confirmDelete');
    const isConfirmed = window.confirm(`${message} "${couponTitle}"`);
    // console.log('handleDeleteClick:', { couponId, couponTitle });
    if (!isConfirmed) return;
    removeCoupon(couponId, {
      onSuccess: () => {
        setSuccessDeleteMsg(t('coupons.deleteSuccess'));
        setTimeout(() => setSuccessDeleteMsg(null), 3000);
        if(paginatedCoupons.length === 1 && page > 1) {
          setPage(page - 1);
        }
        // return queryClient.invalidateQueries({ queryKey: ['coupons'] });
      },
      onError: () => {
        alert(t('coupons.deleteError'));
      }
    });
  };
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <>
      <Box sx={{ width: '100%', overflow: 'hidden' }}>
        <Grid container columnSpacing={{ xs: 0, sm: 2, md: 3 }}>
          <AdminSideBar />
          <Grid size={{ xs: 12, sm: 9, md: 10 }} className="section blueBg" sx={{ minWidth: 0 }}>
            {isDeleting && (
              <Box sx={{ position: 'fixed', top:10, right:10, zIndex: 9999 }}>
                <CircularProgress size={24}/>
              </Box>
            )}
            {loading ? (
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '250px',
                bgcolor: 'background.paper',
                borderRadius: '12px'
              }}>
                <CircularProgress size={36} sx={{ color: BRAND.primary, mb: 2 }}/>
                <Typography variant="body2" color="text.secondary">{t('coupons.fetchingCoupons')}</Typography>
              </Box>
            ):(
              <Box sx={{ padding: '7px 0' }}>
                <Typography variant="h5">{t('coupons.title')}</Typography>
                {successDeleteMsg && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    {successDeleteMsg}
                  </Alert>
                )}
                <Typography sx={{ mt: 1, color: 'text.secondary' }}>
                  {coupons.length} coupon{coupons.length !== 1 ? 's' : ''} created
                  {/* {coupons.length > 0
                  ? t('mygetaways.count', { count: coupons.length })
                  : t('mygetaways.none')
                  } */}
                </Typography>

                {/* <Button startIcon={<AddIcon />} variant="contained" disableElevation
                  onClick={() => navigate(couponNewPath())}
                >Add coupon
                </Button> */}

                <Box sx={{ mt: 2 }}>
                  {paginatedCoupons.map((coupon) => (
                  // {coupons.map((coupon) => (
                    <CouponItem
                      key={coupon.id}
                      id={coupon.id}
                      title={coupon.title}
                      description={coupon.description ?? ''}
                      dates={`${firestoreToDate(coupon.validFrom)} - ${firestoreToDate(coupon.validUntil)}`}
                      discount={coupon.discount}
                      usersUsed={coupon.usersUsed ?? []}
                      userLimit={coupon.userLimit}
                      createdAt={firestoreToDate(coupon.createdAt)}
                      updatedAt={firestoreToDate(coupon.updatedAt)}
                      onEdit={() => navigate(couponEditPath(coupon.id))}
                      onDelete={(couponId, couponTitle) => handleDeleteClick(couponId, couponTitle)}
                      isDeleting={isDeleting}
                    />
                  ))}
                </Box>
                  {coupons.length > ITEMS_PER_PAGE && (
                    <Stack spacing={2} sx={{ mt: 4, alignItems: 'center' }}>
                      <Pagination
                        shape="rounded"
                        count={Math.ceil(coupons.length / ITEMS_PER_PAGE)}
                        page={page}
                        onChange={handlePageChange}
                      />
                    </Stack>
                  )}
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>
    </>
  );
}