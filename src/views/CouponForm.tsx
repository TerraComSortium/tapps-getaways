import CouponForm from '../components/CouponForm';
import { useCoupon,
  // useCouponActions
} from '../hooks/useCouponActions';
import {
  // useNavigate,
  useParams, useSearchParams } from 'react-router-dom';
import AdminSideBar from '../components/AdminSidebar';
import Grid from '@mui/material/Grid2';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
export default function CouponFormView() {
  const { id } = useParams(); // if(id) → edit mode
  const [searchParams] = useSearchParams();
  const ofertaId = searchParams.get('ofertaId') ?? undefined;

  const isEditing = !!id;

  //if(edit) -> fetch(coupon to insert presets in fields)
  const { data: existing, loading } = useCoupon(id); // hook retorna null si !id
  if (loading) return
    <Box sx={{ display: 'flex' }}>
      <CircularProgress aria-label="Loading…" />
    </Box>;

  // TODO: add useCoupon(id) when getCoupon endpoint available
  return (
    <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
      <AdminSideBar />
      <Grid size={{ xs: 12, sm: 9, md: 10 }} className='section blueBg'>
      <CouponForm
        mode={isEditing ? 'edit' : 'create'}
        initialValues={{ ofertaId }}
        // initialValues={existing ?? { ofertaId }} //this with getCoupon endpoint available
        couponId={id}
        />
      </Grid>
    </Grid>
  );
}