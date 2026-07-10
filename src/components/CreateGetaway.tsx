import * as React from 'react';
import { useForm, Controller, useFieldArray, SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../constants/routes';
import { BRAND } from '../theme/colors';
import { Box, TextField, Button, Divider, Typography, Card, Snackbar, Alert, MenuItem } from '@mui/material';
// import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid2';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

import AdminSidebar from './AdminSidebar';
import { GalleryPhotoInput } from "../components/GalleryPhotoInput";
import { AddressAutocompleteField } from '../components/AddressAutocompleteField';
import { ScheduleForm } from '../components/ScheduleForm';
import  DiscountForm  from '../components/DiscountForm';
import AcademySchedule from '../components/AcademySchedule';
import TournamentsSchedule from '../components/TournamentsSchedule';
import LaddersSchedule from '../components/LaddersSchedule';

import {
  GetawayFormData,
  // GetawayPayload, CouponPayload
  ScheduleRow,
} from '../types/getaway';

import { useSnackbar } from '../hooks/useSnackbar';
import { useCreateGetaway } from '../hooks/useCreateGetaway';
// import { useScheduleValidation } from '../hooks/useScheduleValidation';

const ALPHANUMERIC_I18N_REGEX : RegExp = /^[\p{L}0-9\s,._'";:()!/|&—’\-]*$/u;
const YOUTUBE_VIMEO_REGEX = /^(https?:\/\/)?(www\.)?(?:(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})|vimeo\.com\/(\d+))/;
const sports = [
  { value: 'tennis', label: 'Tennis' },
  { value: 'padel', label: 'Padel' },
  { value: 'pickleball', label: 'Pickleball' },
  { value: 'other', label: 'Other' }
];

export default function CreateGetaway() {
  const { t } = useTranslation();
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
  const { isLoading, submitGetaway } = useCreateGetaway(showSnackbar);

  const [scheduleRows, setScheduleRows] = React.useState<ScheduleRow[]>([]);
  const [scheduleError, setScheduleError] = React.useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<GetawayFormData>({
    defaultValues: {
      title: "",
      overview: "",
      getawayAddress: { address: "", lat: null, lng: null },
      galleryPhotos: [],
      lodgingOptions: [{ name: "", price: 0 }],
      optionalAddOns: [{ name: "", price: 0 }],
      amenities: [{ name: "" }],
      schedule: [],
      discounts: []
    }
  });

  const { fields: amenityFields, append: appendAmenity, remove: removeAmenity } = useFieldArray({
    control,
    name: 'amenities'
  });

  const { fields: lodgingFields, append: appendLodging, remove: removeLodging } = useFieldArray({
    control,
    name: 'lodgingOptions'
  });

  const { fields: addOnFields, append: appendAddOn, remove: removeAddOn } = useFieldArray({
    control,
    name: 'optionalAddOns'
  });

  const { fields: discountFields, append: appendDiscount, remove: removeDiscount } = useFieldArray({
    control,
    name: 'discounts'
  });

  const onSubmit: SubmitHandler<GetawayFormData> = async (data) => {
    if (!data.getawayAddress.lat || !data.getawayAddress.lng) {
      showSnackbar(t('create.selectValidLocation'), "warning");
      return;
    }
    if (scheduleRows.length === 0) {
      setScheduleError(t('create.scheduleRequired'));
      document.getElementById("schedule-section")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    const cleanedAddOns= data.optionalAddOns
      .filter(addon => {
        const isNameEmpty = !addon.name || addon.name.trim() === "";
        const isPriceZero = Number(addon.price) === 0;
        return !(isNameEmpty && isPriceZero);
      })
      .map(addon => ({
        name: addon.name,
        price: Number(addon.price)
      }));

    setScheduleError(null);
    await submitGetaway(data, scheduleRows, cleanedAddOns);
  };

  React.useEffect(() => {
    if (scheduleRows.length > 0 && scheduleError) {
      setScheduleError(null);
    }
  }, [scheduleRows, scheduleError]);

  return (
    <>
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
    <Grid container columnSpacing={{ sm: 2, md: 3 }}>
      <AdminSidebar/>
      <Grid size={{ xs: 12, sm: 9, md: 10 }} className='section blueBg' sx={{ minWidth: 0 }}>
        <h2 className='title'>{t('create.title')}</h2>
        <Box sx={{ padding: '7px 0px' }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller name="title" defaultValue=""
              control={control}
              rules={{
                // required: "Getaway title is required",
                validate: (value?: string) =>
                  !value || ALPHANUMERIC_I18N_REGEX.test(value)
                    ? true
                    : t('create.onlyAlphanumeric'),
              }}
              render={({ field }) => (
                <TextField label={t('create.getawayTitle')} id="Getaway title" fullWidth margin="dense"
                  {...field}
                  error={!!errors.title}
                  helperText={errors.title ? errors.title.message : ''}
                />
              )}
            />

            <Controller name="overview"
              control={control}
              defaultValue=""
              rules={{
                // required: "Overview description is required",
                validate: (value?: string) =>
                  !value || ALPHANUMERIC_I18N_REGEX.test(value)
                    ? true
                    : t('create.onlyAlphanumeric'),
              }}
              render={({ field }) => (
                <TextField id={field.name} label={t('create.overview')} fullWidth margin="dense" multiline maxRows={3}
                  {...field}
                  error={!!errors.overview}
                  helperText={errors.overview?.message || ''}
                />
              )}
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller name="startDate" defaultValue=""
                  control={control}
                  // rules={{ required: "Start date is required" }}
                  render={({ field }) => (
                    <TextField label={t('create.startDate')} type="date" fullWidth margin="normal"
                      {...field}
                      slotProps={{ inputLabel: { shrink: true } }}
                      error={!!errors.startDate}
                      helperText={errors.startDate ? errors.startDate.message : ''}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller name="endDate" defaultValue=""
                  control={control}
                  rules={{
                    // required: "End date is required",
                    validate: (value) => {
                      const start = control._formValues.startDate;
                      if (!value || !start) return true;
                      return new Date(start) < new Date(value) || t('create.endAfterStart');
                    }
                  }}
                  render={({ field }) => (
                    <TextField label={t('create.endDate')} fullWidth margin="normal"
                      {...field}
                      type="date"
                      slotProps={{ inputLabel: { shrink: true } }}
                      error={!!errors.endDate}
                      helperText={errors.endDate ? errors.endDate.message : ''}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller
                  name="sport"
                  control={control}
                  defaultValue="tennis"
                  render={({ field }) => (
                    <TextField
                      id={field.name}
                      label={t('create.sport')} fullWidth margin="normal"
                      select
                      {...field}
                      error={!!errors.sport}
                      helperText={errors.sport ? errors.sport.message : t('create.selectSport')}
                    >
                      {sports.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {t(`search.${option.value}`)}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
            </Grid>

            <AddressAutocompleteField name="getawayAddress" control={control} />

            <GalleryPhotoInput
              name="galleryPhotos"
              control={control}
              multiple={true}
              // rules={{ required: "Photo is required" }}
            />

            <Controller name="caption" defaultValue=""
              control={control}
              rules={{
                validate: (value?: string) =>
                  !value || ALPHANUMERIC_I18N_REGEX.test(value)
                    ? true
                    : t('create.onlyAlphanumeric'),
              }}
              render={({ field }) => (
                <TextField label={t('create.photoCaption')} fullWidth margin="dense"
                  {...field}
                  error={!!errors.caption}
                  helperText={
                    errors.caption
                      ? errors.caption.message
                      : t('create.onlyAlphanumericHelper')
                  }
                />
              )}
            />

            <Controller name="galleryVideo" defaultValue=""
              control={control}
              rules={{
                // required: "Video link is required",
                validate: (value: string) =>
                  value === "" ||
                  YOUTUBE_VIMEO_REGEX.test(value) ||
                  t('create.invalidVideoLink'),
              }}
              render={({ field }) => (
                <TextField label={t('create.videoLink')} fullWidth margin="dense"
                  {...field}
                  error={!!errors.galleryVideo}
                  helperText={
                    errors.galleryVideo
                      ? errors.galleryVideo.message
                      : t('create.videoResolution')
                  }
                />
              )}
            />

            <Card
              sx={{
                borderRadius: '0 24px', m: '20px 0', p: '20px 25px',
                bgcolor: BRAND.primary, color: BRAND.white, fontWeight: 'medium', textTransform: 'none',
                ':hover': { bgcolor: BRAND.primaryDark }
              }}>
              <h3 className='titleLeft'>{t('create.standOutTitle')}</h3>
              <p>{t('create.standOutText')}</p>
              <Button startIcon={<LightbulbIcon />} href="https://racquetsappsuite.com/" target="_blank" disableElevation
                sx={{
                  mb: 1, padding: '5px 15px', borderRadius: '8px', bgcolor: BRAND.white, color: BRAND.primary, fontWeight: 'medium', textTransform: 'none',
                  ':hover': { bgcolor: BRAND.primary, color: 'white'}
                }}
              > {t('create.learnMore')} </Button>
            </Card>

            <Typography variant="h6" color={BRAND.primary} sx={{ m: '1 0', fontWeight:"bold"  }}> {t('create.getawayDetails')} </Typography>
            <Divider aria-hidden="true"/>

            <Controller name="mainDescription" defaultValue="" control={control}
              rules={{
                // required: "Main description is required"
                validate: (value?: string) =>
                  !value || ALPHANUMERIC_I18N_REGEX.test(value)
                    ? true
                    : t('create.onlyAlphanumeric'),
              }}
              render={({ field }) => (
                <TextField label={t('create.mainDescription')} fullWidth multiline maxRows={7} margin="normal"
                  {...field}
                  error={!!errors.mainDescription}
                  helperText={errors.mainDescription ? errors.mainDescription.message : ''}
                />
              )}
            />

            <Typography variant="h6" color={BRAND.primary} sx={{ m: '1 0', fontSize: '14px', fontWeight:"bold"  }}> {t('create.lodgingOptionsSection')}</Typography>
            <Divider aria-hidden="true"/>
            {lodgingFields.map((field, index) => (
              <Box key={field.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'start', flexWrap: 'wrap', gap: 1 }}>
                <Controller name={`lodgingOptions.${index}.name`}
                  control={control}
                  defaultValue={field.name}
                  rules={{
                    required: t('create.lodgingRequired'),
                    validate: (value?: string) =>
                      !value || ALPHANUMERIC_I18N_REGEX.test(value)
                        ? true
                        : t('create.onlyAlphanumeric'),
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('create.lodgingOptionN', { n: index + 1 })}
                      fullWidth margin="normal"
                      sx={{ maxWidth: { xs: '100%', sm: '570px' }, mr: { xs: 0, sm: '15px' } }}
                      error={!!errors.lodgingOptions?.[index]?.name}
                      helperText={errors.lodgingOptions?.[index]?.name ? errors.lodgingOptions?.[index]?.name.message : ''}
                    />
                  )}
                />

                <Controller
                  name={`lodgingOptions.${index}.price`}
                  control={control}
                  // defaultValue={field.price}
                  defaultValue={Number(field.price) || 0}
                  rules={{
                    required: t('create.lodgingPriceRequired'),
                    validate: {
                      isNumber: (value) => {
                        const numberValue = parseFloat(String(value));
                        return !isNaN(numberValue) || t('create.priceNumber');
                      },
                      isPositive: (value) => {
                        const numberValue = parseFloat(String(value));
                        return numberValue >= 0 || t('create.pricePositive');
                      }
                    }
                  }}
                  render={({ field }) => (
                    <TextField sx={{ width: { xs: '100%', sm: '220px' }, mr: { xs: 0, sm: '15px' } }}
                      {...field}
                      label={t('create.lodgingPriceN', { n: index + 1 })}
                      type="number" margin="normal"
                      error={!!errors.lodgingOptions?.[index]?.price}
                      helperText={errors.lodgingOptions?.[index]?.price ? errors.lodgingOptions?.[index]?.price.message : ''}
                    />
                  )}
                />

                <Button startIcon={<DeleteIcon />} variant="outlined" disableElevation size="medium" aria-label="delete"
                  sx={{
                    p:'5px 16px', m:'0 2px',  borderRadius: "10px", textTransform: "none", bgcolor: BRAND.primary, color: BRAND.white, fontWeight: 'bold',
                    ':hover': { color: BRAND.primary, bgcolor: BRAND.white  }
                  }}
                  onClick={() => removeLodging(index)}
                  // disabled={activeForms.length === 1}
                >{t('create.remove')}</Button>
              </Box>
            ))}
            <Button
              startIcon={<AddIcon />} variant="contained"
              onClick={() => appendLodging({ name: "", price: 0})}
              sx={{
                mt: 0, mb: 3, bgcolor: BRAND.green, color: BRAND.navy, fontWeight: 'bold', borderRadius: '30px', textTransform: 'none',
                ':hover': { bgcolor: BRAND.primary, color: 'white' }
              }}
              disableElevation
            > {t('create.addItem')} </Button>

            <Typography variant="h6" color={BRAND.primary} sx={{ m: '1 0', fontSize: '14px', fontWeight:"bold"  }}> {t('create.addOnsSection')} </Typography>
            <Divider aria-hidden="true" />

            {addOnFields.map((field, index) => (
              <Box key={field.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'start', flexWrap: 'wrap', gap: 1 }}>
                <Controller
                  name={`optionalAddOns.${index}.name`}
                  control={control}
                  defaultValue={field.name}
                  rules={{
                    // required: "Add-on name is required",
                    validate: (value?: string) =>
                      !value || ALPHANUMERIC_I18N_REGEX.test(value)
                        ? true
                        : t('create.onlyAlphanumeric'),
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('create.addOnN', { n: index + 1 })}
                      sx={{ maxWidth: { xs: '100%', sm: '550px' }, mr: { xs: 0, sm: '15px' } }} fullWidth margin="normal"
                      error={!!errors.optionalAddOns?.[index]?.name}
                      helperText={errors.optionalAddOns?.[index]?.name ? errors.optionalAddOns?.[index]?.name.message : ''}
                    />
                  )}
                />
                <Controller
                  name={`optionalAddOns.${index}.price`}
                  control={control}
                  // defaultValue={field.price}
                  defaultValue={Number(field.price) || 0}
                  rules={{
                    // required: "Add-on price is required"
                    validate: {
                      isNumber: (value) => {
                        const numberValue = parseFloat(String(value));
                        return !isNaN(numberValue) || t('create.priceNumber');
                      },
                      isPositive: (value) => {
                        const numberValue = parseFloat(String(value));
                        return numberValue >= 0 || t('create.pricePositive');
                      }
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('create.addOnPriceN', { n: index + 1 })}
                      type="number" margin="normal" sx={{ maxWidth: { xs: '100%', sm: '220px' }, mr: { xs: 0, sm: '15px' } }}
                      error={!!errors.optionalAddOns?.[index]?.price}
                      helperText={errors.optionalAddOns?.[index]?.price ? errors.optionalAddOns?.[index]?.price.message : ''}
                    />
                  )}
                />
                <Button startIcon={<DeleteIcon />} variant="outlined" disableElevation size="medium" aria-label="delete"
                  sx={{
                    p:'5px 16px', m:'0 2px', borderRadius: "10px",
                    textTransform: "none", bgcolor: BRAND.primary, color: BRAND.white, fontWeight: 'bold',
                    ':hover': { color: BRAND.primary, bgcolor: BRAND.white  }
                  }}
                  onClick={() => removeAddOn(index)}
                  // disabled={activeForms.length === 1}
                > {t('create.remove')} </Button>
              </Box>
            ))}

            <Button startIcon={<AddIcon />} variant="contained" disableElevation
              onClick={() => appendAddOn({ name: "", price: 0 })}
              sx={{
                mt: 0, mb: 2, bgcolor: BRAND.green, color: BRAND.navy, fontWeight: 'bold', borderRadius: '30px', textTransform: 'none',
                ':hover': { bgcolor: BRAND.primary, color: 'white' }
              }}
            > {t('create.addItem')} </Button>

            <Typography variant="h6" color={BRAND.primary} sx={{ m: '1 0', fontSize: '14px', fontWeight:"bold"  }}> {t('create.amenitiesSection')} </Typography>
            <Divider aria-hidden="true" sx={{ pt:0, mt: 0 }} />
            {amenityFields.map((field, index) => (
              <Box key={field.id} sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Controller
                  name={`amenities.${index}.name`}
                  control={control}
                  defaultValue={field.name}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth margin="normal"
                      sx={{ maxWidth: { xs: '100%', sm: '550px' }, mr: { xs: 0, sm: '9px' } }}
                      label={t('create.amenityN', { n: index + 1 })}
                      error={!!errors.amenities?.[index]?.name}
                      helperText={errors.amenities?.[index]?.name ? errors.amenities?.[index]?.name.message : ''}
                    />
                  )}
                />
                <Button startIcon={<DeleteIcon />} variant="outlined" disableElevation size="medium"
                  sx={{
                    p:'5px 16px', m:'0 3px', borderRadius: "10px", textTransform: "none",
                    bgcolor: BRAND.primary, color: BRAND.white, fontWeight: 'bold',
                    ':hover': { color: BRAND.primary, bgcolor: BRAND.white  }
                  }}
                  onClick={() => removeAmenity(index)} aria-label="delete"
                > {t('create.remove')} </Button>
              </Box>
            ))}
            <Button startIcon={<AddIcon />} variant="contained" aria-label="Add amenity" disableElevation
              onClick={() => appendAmenity({ name: "" })}
              sx={{
                mb: 3, bgcolor: BRAND.green, color: BRAND.navy, borderRadius: '30px', fontWeight: 'bold', textTransform: 'none',
                ':hover': { bgcolor: BRAND.primary, color: 'white' }
              }}
            > {t('create.addItem')} </Button>

            {scheduleError && (
              <div style={{ color: "red", fontWeight: "bold", marginBottom: 8 }}> {scheduleError} </div>
            )}
            <Box id="schedule-section">
              <ScheduleForm rows={scheduleRows} setRows={setScheduleRows} />
            </Box>

            <Box
              sx={{
                borderRadius: '0 24px', m: '25px 0', p: '30px 25px',
                bgcolor: BRAND.primary, color:'white', fontWeight: 'medium', textTransform: 'none',
                ':hover': { bgcolor: BRAND.primaryDark }
              }}
            >
              <Typography variant="h3" color={BRAND.white} sx={{ m: '1 0', fontSize: '16px', fontWeight:"medium"  }}> {t('create.discountManagement')} </Typography>
              {discountFields.map((field, index) => (
                <DiscountForm
                  key={field.id}
                  control={control}
                  index={index}
                  remove={removeDiscount}
                  // errors={errors}
                />
              ))}

              <Button startIcon={<AddIcon />} variant="contained" aria-label="Add discount" disableElevation
                onClick={() => appendDiscount({
                  couponCode: "",
                  startDate: "",
                  endDate: "",
                  description: "",
                  amount: 0,
                  isActive: true
                })}
                sx={{
                  mt: 2, mb: 3, bgcolor: BRAND.white, color: BRAND.navy, borderRadius: '30px', fontWeight: 'bold', textTransform: 'none',
                  ':hover': { bgcolor: BRAND.primary, color: 'white' }
                }}
              > {t('create.addItem')} </Button>
            </Box>
            <AcademySchedule/>
            <TournamentsSchedule/>
            <LaddersSchedule/>

            <Controller name="policies" defaultValue=""
              control={control}
              // rules={{ required: "Policies are required" }}
              render={({ field }) => (
                <TextField label={t('create.policies')} fullWidth margin="normal" multiline maxRows={3}
                  {...field} id={field.name}
                  error={!!errors.policies}
                  helperText={errors.policies ? errors.policies.message : ''}
                />
              )}
            />

            <Controller name="terms" defaultValue=""
              control={control}
              render={({ field }) => (
                <TextField label={t('create.terms')} multiline maxRows={7} fullWidth margin="normal"
                  {...field} id={field.name}
                  error={!!errors.terms}
                  helperText={errors.terms ? errors.terms.message : ''}
                />
              )}
            />

            <Box style={{ display: 'flex', justifyContent: 'center', gap: 18, margin:'20px 0' }}>
              <Button type="button" href={ROUTES.GETAWAYS}
              startIcon={<ArrowBackIcon />} variant="outlined" disableElevation
                sx={{
                  width:'135px', borderRadius: '8px', bgcolor: BRAND.white, color: BRAND.primary, fontWeight: 'medium', textTransform: 'none',
                  ':hover': { bgcolor: BRAND.primary, color: 'white' }
                }}
              > {t('create.back')} </Button>

              <Button type="submit" startIcon={<SaveIcon />} variant="outlined"
                disabled={isLoading}
                // className={`className ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                sx={{
                  width:'150px',
                  borderRadius: '8px', bgcolor: BRAND.primary, color: BRAND.white, fontWeight: 'medium', textTransform: 'none',
                  ':hover': { bgcolor: 'white', color: BRAND.primary }
                }}
              > {isLoading ? t('create.saving') : t('create.saveChanges')}
              </Button>
            </Box>
          </form>
        </Box>
      </Grid>
    </Grid>
    </Box>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={closeSnackbar}>
        <Alert severity={snackbar.severity} onClose={closeSnackbar} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}