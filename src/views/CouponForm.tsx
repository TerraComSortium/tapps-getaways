import {
  useNavigate, useParams,
  useSearchParams
} from 'react-router-dom';
import { useCouponById } from '../hooks/useCoupon';
import { Box, CircularProgress } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { firestoreToInputDate } from '../utils/dates';
import AdminSideBar from '../components/AdminSidebar';
import CouponForm from '../components/CouponForm';
import type { DiscountType } from '../types/getaway';
import { getCouponValue } from '../utils/couponHelpers';

export default function CouponFormView() {
  const { id } = useParams(); 
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const getawayIdFromUrl = searchParams.get('getawayId') ?? '';

  const isEditing = !!id;

  const { data: existing, loading } = useCouponById(id); 
  console.log('uso de cupont', existing)
  
  const handleError = (error: string) => {
    console.log('CouponFormView: error', error);
  };
  const handleSuccess = (redirectPath?: string) => {
    if (redirectPath) navigate(redirectPath);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress aria-label="Loading…" /> {/* t('common.loading') */}
      </Box>
    );
  }


  const discountType: DiscountType =
    existing?.discountType ?? (existing?.percent ? 'percentage' : 'amount');
  const discountValue = existing ? getCouponValue(existing) : undefined;


  return (
    <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
      <AdminSideBar />
      <Grid size={{ xs: 12, sm: 9, md: 10 }} className='section blueBg'>
      <CouponForm
        mode={isEditing ? 'edit' : 'create'}
        initialValues={existing ? {
          startDate: firestoreToInputDate(existing.validFrom),
          endDate: firestoreToInputDate(existing.validUntil),
          userLimit: existing.userLimit,
          couponCode: existing.title,
          description: existing.description,
          amount: discountType === 'amount' ? discountValue : null,
          percent: discountType === 'percentage' ? discountValue : null,
          discountType,
          getawayId: existing.getawayId,
        } : {
          getawayId: getawayIdFromUrl, //POST
        }}
        couponId={id}
        onSuccess={handleSuccess}
        onError={handleError}
      />
      </Grid>
    </Grid>
  );
}