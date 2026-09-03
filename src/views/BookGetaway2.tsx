import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Box, TextField, Button, Typography, Divider, RadioGroup,
  FormGroup, FormControl,
  FormControlLabel,
  // FormLabel, FormHelperText,
  Radio, Checkbox, CircularProgress, Alert } from '@mui/material';
import Grid from '@mui/material/Grid2';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import AdminSideBar from '../components/AdminSidebar';
import { useAuth } from '../contexts/AuthContext';
import { useGetawayById } from '../hooks/useGetawayById';
import { createPurchase, Reservation } from '../services/purchase/purchase';
import { paymentPath } from '../constants/routes';
import { BRAND } from '../theme/colors';

import AcademySchedule from '../components/AcademySchedule';
import LaddersSchedule from '../components/LaddersSchedule';
import TournamentsSchedule from '../components/TournamentsSchedule';

const TAX_RATE = 0.0654;
interface FormData {
  // payment user info....?
  lodgingOption: string;
  selectedAddOns: string[];
  // selectedAmenities: string[];
  // {
  //   specialDinner: boolean;
  //   meetGreet: boolean;
  //   tennisClass: boolean;
  // };
  agreePolicies: boolean;
  agreeTerms: boolean;
}

export default function BookGetaway() {
  const { t } = useTranslation();
  //get id param and fetch getaway
  const { id } = useParams<{ id: string }>();
  const { data: getaway, loading, error } = useGetawayById(id || '');

  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { handleSubmit, control, formState: { errors }, watch, reset } = useForm<FormData>({
    defaultValues: {
      lodgingOption: '',
      selectedAddOns: [],
      agreePolicies: false,
      agreeTerms: false
    }
  });

  const watchLodging = watch('lodgingOption');
  const watchAddOns = watch('selectedAddOns');

  useEffect(() => {
    if (getaway) {
      reset({
        lodgingOption: '',
        selectedAddOns: [],
        agreePolicies: false,
        agreeTerms: false
      });
    }
  }, [id, getaway, reset]);

  const totals = useMemo(() => {
    let sub = 0;
    if (!getaway) return { subtotal: 0, taxes: 0, total: 0 };

    const selectedLodging = getaway.lodgingOptions?.find((opt: any) => opt.name === watchLodging);
    if (selectedLodging) sub += Number(selectedLodging.price) || 0;

    getaway.optionalAddOns?.forEach((addon: any) => {
      if (watchAddOns?.includes(addon.name)) {
        sub += Number(addon.price) || 0;
      }
    });

    const tax = sub * TAX_RATE;
    return {
      subtotal: sub,
      taxes: tax,
      total: sub + tax
    };
  }, [getaway, watchLodging, watchAddOns]);

  const onSubmit = async (formData: FormData) => {
    if (!getaway || !user) return;
    setIsSubmitting(true);

    try {
      const originalLodging = getaway.lodgingOptions?.find((opt: any) => opt.name === formData.lodgingOption);
      const originalAddOns = getaway.optionalAddOns?.filter((addon: any) => formData.selectedAddOns.includes(addon.name));

      //payload to POST
      const reservationPayload: Reservation = {
        // El backend recalcula los precios/total desde este getaway (fuente de verdad).
        getawayId: id,
        user: {
          id: user.uid,
          name: user.displayName || '',
          email: user.email || '',
          cellphone: (user as any).cellphone || '', //Firebase User no expone cellphone
          // address: {
          //   street: "string" || '',
          //   city: "string" || '',
          //   state: "string" || '',
          //   country: "string" || '',
          //   zipCode: "string || '',
          // }
        },
        lodgingOption: originalLodging ? {
        //   selectedLodging, //before
        //   "option": "string" || '',
        //   "price": 0,
        //   "occupancy": "string || '',
            option: originalLodging.name,
            price: originalLodging.price,
            occupancy: (originalLodging as any).occupancy,
        } : undefined,

        optionalAddOns: originalAddOns?.map((addon:any) => ({
          addonName: addon.name,
          price: addon.price
        })) || [],
        paymentDetails: {
          Subtotal: `${totals.subtotal.toFixed(2)} USD`,
          Taxes: `${totals.taxes.toFixed(2)} USD`,
          Total: `${totals.total.toFixed(2)} USD`
        }
      };

      const response = await createPurchase(reservationPayload);
      const fetchedOrderId = response.orderSummary?.orderId || response.orderId;
      if (!fetchedOrderId) {
        throw new Error("Not received valid orderId from server");
      }
      //save order with id
      const dataForPayment = {
        ...reservationPayload,
        orderId: fetchedOrderId,
        getawayTitle: getaway.title,
        getawayAddress: getaway.getawayAddress?.address,
        getawayDates: `${getaway.startDate} - ${getaway.endDate}`
      };

      localStorage.setItem('selectedData', JSON.stringify(dataForPayment));
      navigate(paymentPath(fetchedOrderId), { state: { dataForPayment } });
    } catch (err) {
      console.error("Error at Booking getaway, try again later", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  //loading & error
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!getaway) return <Alert severity="info">{t('book.unavailable')}</Alert>;
  console.log("Valores actuales del form:", watchLodging);
  console.log("Opciones disponibles:", getaway.lodgingOptions);
  return (
    <>
      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        <AdminSideBar />
        <Grid size={{ xs: 12, sm: 9, md: 10 }} className='section blueBg'>
          <Typography variant="h5" className='title'>{t('book.title')}</Typography>
          <Typography variant="h6" className='title'>{getaway.title || t('book.title')}</Typography>
          {/* <Typography variant="h6" className='title'><span>{getaway.startDate} to {getaway.endDate}</span></Typography> */}

          <Box sx={{ width: 1000, maxWidth: '100%', padding: { xs: 1, sm: '7px' }, boxSizing: 'border-box' }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Typography variant="h6" className='purpleLabel' sx={{ mt: 2, mb: 1, fontSize: '14px', fontWeight: 'bold' }}>{t('book.paymentContactInfo')}</Typography>
              <TextField label={t('book.playerName')} margin="dense" fullWidth disabled defaultValue={user?.displayName || ''} />

              <TextField label={t('book.email')} fullWidth margin="dense" disabled
                defaultValue={user?.email || ''}
              />
              <TextField label={t('book.cellphone')}
                fullWidth margin="dense"
                defaultValue=""
                // defaultValue={user?.cellphone || ''}
                disabled
              />
              <TextField label={t('book.address')}
                fullWidth margin="dense"
                defaultValue=""
                disabled
              />
              <Typography variant="h6" className='purpleLabel' sx={{ mt: 2, mb: 0.5, fontSize: '14px', fontWeight: 'bold' }}>{t('book.lodgingOptions')}</Typography>
              <Divider aria-hidden="true" sx={{ bgcolor: BRAND.green }} />
              <Controller name="lodgingOption"
                control={control}
                defaultValue=""
                rules={{ required: t('book.selectLodging') }}
                render={({ field }) => (
                  <RadioGroup {...field} aria-labelledby="demo-radio-buttons-group-label" name="radio-buttons-group"
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value)}
                  >
                    {getaway.lodgingOptions?.map((option: any) => (
                      <FormControlLabel
                        key={option.name}
                        value={option.name}
                        control={<Radio />}
                        label={t('book.lodgingLabel', {
                          price: option.price,
                          occupancy: option.occupancy || '',
                          name: option.name,
                        })}
                      />
                    ))}
                  </RadioGroup>
                )}
              />
              {errors.lodgingOption && <Typography variant="caption" color="error">{errors.lodgingOption.message}</Typography>}

              <Typography variant="h6" className='purpleLabel' sx={{ mt: 2, mb: 0.5, fontSize: '14px', fontWeight: 'bold' }}>{t('book.addOns')}</Typography>
              <Divider aria-hidden="true" sx={{ bgcolor: BRAND.green }} />
              <Controller name="selectedAddOns" control={control} render={({ field }) => (
                <FormControl component="fieldset" variant="standard"
                  sx={{ mt: 1, display: 'flex', flexDirection: 'column' }}
                >
                  <FormGroup>
                    {getaway.optionalAddOns?.map((addon: any) => (
                      <FormControlLabel
                        key={addon.name}
                        label={`${addon.name}:  $${addon.price}`}
                        control={
                          <Checkbox
                            // name="addOns"
                            checked={field.value.includes(addon.name)}
                            onChange={(e) => {
                              const newValue = e.target.checked
                              ? [...field.value, addon.name]
                              : field.value.filter((val: string) => val !== addon.name);
                              field.onChange(newValue);
                            }}
                          />
                        }
                      />
                    ))}
                  </FormGroup>
                </FormControl>
              )}
            />
              <AcademySchedule/>
              <TournamentsSchedule
                mode="readonly"
                selectedIds={getaway.tournamentIds || []}
              />
              <LaddersSchedule/>
              <Typography variant="h6" className='purpleLabel' sx={{ mt: 2, mb: 0.5, fontSize: '14px', fontWeight: 'bold' }}>{t('book.paymentDetails')}</Typography>
              <Divider aria-hidden="true" sx={{ bgcolor: BRAND.green }} />
              <Typography variant="body2" sx={{ mt: 1 }}>{t('book.subtotal')}: ${(totals.subtotal || 0).toFixed(2)} USD</Typography>
              <Typography variant="body2">{t('book.taxes')}: ${(totals.taxes || 0).toFixed(2)} USD</Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{t('book.total')}: ${ (totals.total || 0).toFixed(2)} USD</Typography>
              <Typography variant="body2">{t('book.totalNote')}</Typography>

              <Typography variant="h6" className='purpleLabel' sx={{ mt: 2, mb: 0.5, fontSize: '16px', fontWeight: 'bold' }}>{t('book.policies')}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>{getaway.policies || t('book.noPolicies')}</Typography>
              <Controller name="agreePolicies" control={control} rules={{ required: t('book.mustAgreePolicy') }}
              render={({ field }) => <FormControlLabel control={<Checkbox {...field} checked={field.value} />} label={t('book.agreePolicy')} />}
              />

              {errors.agreePolicies && (
                <Typography variant="caption" color="error" sx={{ display: 'block' }}>{errors.agreePolicies.message}</Typography>
              )}

              <Typography variant="h6" className='purpleLabel' sx={{ mt: 2, mb: 0.5, fontSize: '16px', fontWeight: 'bold' }}>{t('book.terms')}</Typography>
              <Box sx={{ backgroundColor: 'white', borderRadius: '8px', padding: '1px 15px', mt: 1, mr: 2 }}>
                <Typography variant="body2" sx={{ py: 1 }}>{getaway.terms || t('book.noTerms')}</Typography>
              </Box>
              <Controller name="agreeTerms"
                control={control}
                defaultValue={false}
                rules={{ required: t('book.mustAgreeTerms') }}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} />}
                    label={t('book.agreeTerms')}
                  />
                )}
              />
              {errors.agreeTerms && (
                <Typography variant="caption" color="error" sx={{ display: 'block' }}>{errors.agreeTerms.message}</Typography>
              )}

              <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2, my: '20px' }}>
              <Button type="button" startIcon={<ArrowBackIcon />} variant="outlined" disableElevation
                onClick={() => navigate(-1)}
                sx={{ width: '135px', borderRadius: '8px', borderColor: BRAND.primary,
                //bgcolor: BRAND.white, color: BRAND.primary,
                fontWeight: 'medium', textTransform: 'none',
                ':hover': { bgcolor: BRAND.primary, color: 'white' } }}
              >{t('book.back')}</Button>

              <Button
                type="submit" startIcon={isSubmitting ? <CircularProgress size={20} /> : <ShoppingCartIcon />}
                variant="outlined" disableElevation disabled={isSubmitting}
                sx={{ borderRadius: '8px', bgcolor: BRAND.primary, color: BRAND.white,
                  borderColor: BRAND.primary,
                  fontWeight: 'medium', textTransform: 'none',
                  ':hover': { bgcolor: 'white', color: BRAND.primary }
                }}
              > {isSubmitting ? t('book.processing') : t('book.submit')}
              </Button>
            </Box>
            </form>
          </Box>
        </Grid>
      </Grid>
    </>
  );
}
