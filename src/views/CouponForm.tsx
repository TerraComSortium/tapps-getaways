import {
  useNavigate, useParams,
  useSearchParams
} from 'react-router-dom';
import { useCouponById } from '../hooks/useCoupon';
import { Box, CircularProgress } from '@mui/material';
import { firestoreToInputDate } from '../utils/dates';
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
  const handleError = (error: string) => {
    console.error('[COUPON_FORM] error', error);
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
  
  );
}