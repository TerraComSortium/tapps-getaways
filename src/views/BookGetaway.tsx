import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { ROUTES } from '../constants/routes';
import { BRAND } from '../theme/colors';
import AdminSideBar from '../components/AdminSidebar';
import { useAuth } from '../contexts/AuthContext';

import { Box, TextField, Button, Typography, Divider, RadioGroup, FormControlLabel, Radio, Checkbox } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Grid from '@mui/material/Grid2';

interface FormData {
  lodgingOption: 'resortView' | 'partialOceanView';
  amenities: {
    specialDinner: boolean;
    meetGreet: boolean;
    tennisClass: boolean;
  };
  agreePolicy: boolean;
  agreeTerms: boolean;
}

const lodgingOptions = {
  resortView: 1200,
  partialOceanView: 519
};

const amenitiesOptions = {
  specialDinner: 50,
  meetGreet: 50,
  tennisClass: 100
};

const TAX_RATE = 0.0654;

export default function BookGetaway() {
  const { handleSubmit, control, formState: { errors }, watch } = useForm<FormData>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const lodgingOption = watch('lodgingOption');
  const amenities = watch('amenities', { specialDinner: false, meetGreet: false, tennisClass: false });

  const calculateTotal = () => {
    let total = 0;
    if (lodgingOption && lodgingOptions[lodgingOption]) {
      total += lodgingOptions[lodgingOption];
    }
    if (amenities.specialDinner) total += amenitiesOptions.specialDinner;
    if (amenities.meetGreet) total += amenitiesOptions.meetGreet;
    if (amenities.tennisClass) total += amenitiesOptions.tennisClass;
    const taxes = total * TAX_RATE;
    return { total: total + taxes, taxes };
  };

  const onSubmit = (data: FormData) => {
    const { total, taxes } = calculateTotal();
    const formDataWithTotal = { ...data, total, taxes };
    localStorage.setItem('selectedData', JSON.stringify(formDataWithTotal));
    navigate(ROUTES.PAYMENT);
  };

  const { total, taxes } = calculateTotal();

  return (
    <>
      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        <AdminSideBar />
        <Grid size={{ xs: 12, sm: 10 }} className='section blueBg'>
          <Typography variant="h5" className='title'>Getaway reservation</Typography>
          <Box sx={{ width: 1000, maxWidth: '100%', padding: '7px' }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Typography variant="h6" className='purpleLabel' sx={{ mt: 2, mb: 1, fontSize: '14px', fontWeight: 'bold' }}>Payment & contact info</Typography>
              <TextField label="Player Name"
                margin="dense" fullWidth disabled defaultValue={user?.displayName || ''}
              />
              <TextField label="Email"
                fullWidth margin="dense"
                defaultValue={user?.email || ''}
                disabled
              />
              <TextField label="Cellphone"
                fullWidth margin="dense"
                defaultValue=""
                disabled
              />
              <TextField label="Address"
                fullWidth margin="dense"
                defaultValue=""
                disabled
              />

              <Typography variant="h6" className='purpleLabel' sx={{ mt: 2, mb: 0.5, fontSize: '14px', fontWeight: 'bold' }}>Lodging Options*</Typography>
              <Divider aria-hidden="true" sx={{ bgcolor: BRAND.green }} />
              <Controller name="lodgingOption"
                control={control}
                defaultValue="resortView"
                rules={{ required: 'Please select a Lodging option' }}
                render={({ field }) => (
                  <RadioGroup {...field} aria-labelledby="demo-radio-buttons-group-label" name="radio-buttons-group">
                    <FormControlLabel value="resortView" control={<Radio />} label="$1200+tax/person Double Occupancy for a Resort View Room" />
                    <FormControlLabel value="partialOceanView" control={<Radio />} label="$519+tax/person Double Occupancy for Partial Ocean View Room" />
                  </RadioGroup>
                )}
              />
              {errors.lodgingOption && (
                <Typography variant="caption" color="error">{errors.lodgingOption.message}</Typography>
              )}

              <Typography variant="h6" className='purpleLabel' sx={{ mt: 2, mb: 0.5, fontSize: '14px', fontWeight: 'bold' }}>Add Ons (Optional)</Typography>
              <Divider aria-hidden="true" sx={{ bgcolor: BRAND.green }} />
              <Controller name="amenities.specialDinner"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    sx={{ display: 'block' }}
                    control={<Checkbox {...field} checked={field.value} />}
                    label="Saturday's special dinner $50"
                  />
                )}
              />
              <Controller name="amenities.meetGreet"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    sx={{ display: 'block' }}
                    control={<Checkbox {...field} checked={field.value} />}
                    label="Meet & greet with Stan Wawrinka $50"
                  />
                )}
              />
              <Controller
                name="amenities.tennisClass"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    sx={{ display: 'block' }}
                    control={<Checkbox {...field} checked={field.value} />}
                    label="Tennis class with Stan Wawrinka $100"
                  />
                )}
              />

              <Typography variant="h6" className='purpleLabel' sx={{ mt: 2, mb: 0.5, fontSize: '14px', fontWeight: 'bold' }}>Payment Details</Typography>
              <Divider aria-hidden="true" sx={{ bgcolor: BRAND.green }} />
              <Typography variant="body2" sx={{ mt: 1 }}>Taxes: ${taxes.toFixed(2)} USD</Typography>
              <Typography variant="body2">Total: ${total.toFixed(2)} USD</Typography>
              <Typography variant="body2">*The total charged on the next page will be the price quoted above.</Typography>

              <Typography variant="h6" className='purpleLabel' sx={{ mt: 2, mb: 0.5, fontSize: '16px', fontWeight: 'bold' }}>Policies*</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>Cancellations outside 30 days incur no penalty. Cancellations inside of 30 days you forfeit all money paid unless you can find someone to take your place. We highly recommend taking out travel insurance for any reason that could cause a last minute cancellation.</Typography>
              <Controller name="agreePolicy"
                control={control} defaultValue={false}
                rules={{ required: 'You must agree to the policy' }}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} />}
                    label="I understand the cancellation policy"
                  />
                )}
              />
              {errors.agreePolicy && (
                <Typography variant="caption" color="error" sx={{ display: 'block' }}>{errors.agreePolicy.message}</Typography>
              )}

              <Typography variant="h6" className='purpleLabel' sx={{ mt: 2, mb: 0.5, fontSize: '16px', fontWeight: 'bold' }}>Terms*</Typography>
              <Box sx={{ backgroundColor: 'white', borderRadius: '8px', padding: '1px 15px', mt: 1, mr: 2 }}>
                <Typography variant="body2" sx={{ py: 1 }}>This facility does not have any indoor or covered courts. We follow the USTA guidelines for playing in cold or hot temperatures. Every player is responsible for their decision regarding medical circumstances they may have limiting their ability to play in outside conditions. The camp will not be canceled due to rain. If rain does impact our scheduled clinic and match hours, we will do our best to reschedule those hours throughout the week. If rain is persistent, and we are forced to miss on court time, we will add off court activities such as chalk talks, video analysis, and happy hours. We will only be hosting padel clinics and matches on site at the resort location. We will not be traveling to other facilities in the area. Please note that we will refund missed on court hours.</Typography>
              </Box>
              <Controller name="agreeTerms"
                control={control}
                defaultValue={false}
                rules={{ required: 'You must agree to the terms' }}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} />}
                    label="I understand and agree to the terms"
                  />
                )}
              />
              {errors.agreeTerms && (
                <Typography variant="caption" color="error" sx={{ display: 'block' }}>{errors.agreeTerms.message}</Typography>
              )}

              <Box style={{ display: 'flex', justifyContent: 'center', gap: 18, margin: '20px 0' }}>
                <Button type="button" startIcon={<ArrowBackIcon />} variant="outlined" disableElevation
                  href={ROUTES.MY_GETAWAYS}
                  sx={{
                    width: '135px',
                    borderRadius: '8px', bgcolor: BRAND.white, color: BRAND.primary, fontWeight: 'medium', textTransform: 'none', borderColor: BRAND.primary,
                    ':hover': { bgcolor: BRAND.primary, color: 'white' }
                  }}
                >Retry</Button>

                <Button
                  type="submit"
                  startIcon={<ShoppingCartIcon />} variant="outlined" disableElevation
                  sx={{
                    borderRadius: '8px', borderColor: BRAND.primary,
                    bgcolor: BRAND.primary, color: BRAND.white, fontWeight: 'medium', textTransform: 'none',
                    ':hover': { bgcolor: 'white', color: BRAND.primary }
                  }}
                >Book getaway</Button>
              </Box>
            </form>
          </Box>
        </Grid>
      </Grid>
    </>
  );
}
