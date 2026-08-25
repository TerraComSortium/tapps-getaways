import { useNavigate } from 'react-router-dom';
import { Box, Typography,
  // Button, 
  CircularProgress } from '@mui/material';
import Grid from '@mui/material/Grid2';
// import AddIcon from '@mui/icons-material/Add';
import { BRAND } from '../theme/colors';
import { useTranslation } from 'react-i18next';
import { useCoupons, useCouponActions } from '../hooks/useCouponActions';
import { couponEditPath, 
  // couponNewPath 
} from '../constants/routes';
import AdminSideBar from '../components/AdminSidebar';
import { CouponItem } from '../components/CouponItem';
import { firestoreToDate } from '../utils/dates';

export default function Coupons() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: coupons, loading, error } = useCoupons();
  const { delete: deleteCoupon, isLoading: isDeleting } = useCouponActions();
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      <Grid container columnSpacing={{ xs: 0, sm: 2, md: 3 }}>
        <AdminSideBar />
        <Grid size={{ xs: 12, sm: 9, md: 10 }} className="section blueBg" sx={{ minWidth: 0 }}>
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
              <Typography variant="body2" color="text.secondary">{t('discount.fetchingCoupons')}</Typography>
            </Box>
          ):(
            <Box sx={{ padding: '7px 0' }}>
              <Typography variant="h5">Coupons management</Typography>
              <Typography sx={{ mt: 1, color: 'text.secondary' }}>
                {coupons.length} coupon{coupons.length !== 1 ? 's' : ''} active
              </Typography>

              {/* <Button startIcon={<AddIcon />} variant="contained" disableElevation
                onClick={() => navigate(couponNewPath())}
              >Add coupon
              </Button> */}

              <Box sx={{ mt: 2 }}>
                {coupons.map((coupon) => (
                  <CouponItem
                    key={coupon.id}
                    title={coupon.title}
                    description={coupon.description ?? ''}
                    // code={coupon.couponCode}
                    dates={`${firestoreToDate(coupon.validFrom)} - ${firestoreToDate(coupon.validUntil)}`}
                    discount={coupon.discount}
                    // discountPercent={coupon.percent || undefined}
                    // isActive={coupon.isActive}
                    usersUsed={coupon.usersUsed ?? []}
                    userLimit={coupon.userLimit}
                    createdAt={firestoreToDate(coupon.createdAt)}
                    updatedAt={firestoreToDate(coupon.updatedAt)}
                    onEdit={() => navigate(couponEditPath(coupon.id))}
                    onDelete={() => deleteCoupon(coupon.id)}
                    isDeleting={isDeleting}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}