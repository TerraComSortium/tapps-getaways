import {
  useNavigate, useParams,
  useSearchParams
} from 'react-router-dom';
import { useCoupon,
  // useCouponActions
} from '../hooks/useCoupon';
import { Box, CircularProgress } from '@mui/material';
import Grid from '@mui/material/Grid2';
import {firestoreToDate} from '../utils/dates';
import AdminSideBar from '../components/AdminSidebar';
import CouponForm from '../components/CouponForm';

export default function CouponFormView() {
  const { id } = useParams(); // if(id) → edit mode
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // const ofertaId = searchParams.get('ofertaId') ?? undefined;
  const getawayIdFromUrl = searchParams.get('getawayId') ?? '';

  const isEditing = !!id;

  //if(edit) -> fetch(coupon to insert presets in fields)
  const { data: existing, loading } = useCoupon(id); //hook return null if !id
  const handleError = (error: string) => {
    console.log('CouponFormView: error', error);
  };
  const handleSuccess = (redirectPath?: string) => {
    if (redirectPath) navigate(redirectPath);
  };
  if (loading) return
  <Box sx={{ display: 'flex' }}>
    <CircularProgress aria-label="Loading…" /> {/* t('common.loading') */}
  </Box>;

  // TODO: add useCoupon(id) when getCoupon endpoint available
  return (
    <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
      <AdminSideBar />
      <Grid size={{ xs: 12, sm: 9, md: 10 }} className='section blueBg'>
      <CouponForm
        mode={isEditing ? 'edit' : 'create'}
        // initialValues={{ ofertaId }}
        // initialValues={existing ?? { ofertaId }} //this with getCoupon endpoint available
        initialValues={existing ? {
          startDate: firestoreToDate(existing.validFrom),
          endDate: firestoreToDate(existing.validUntil),
          userLimit: existing.userLimit,
          couponCode: existing.title,
          description: existing.description,
          amount: existing.discount,
          discountType: existing.discountType,
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