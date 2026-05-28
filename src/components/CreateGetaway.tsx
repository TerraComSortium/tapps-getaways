import * as React from 'react';
import { useForm, Controller, useFieldArray, SubmitHandler } from 'react-hook-form';
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
      showSnackbar("Please select a valid location from the suggestions.", "warning");
      return;
    }
    if (scheduleRows.length === 0) {
      setScheduleError("You must add at least one schedule row.");
      document.getElementById("schedule-section")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    setScheduleError(null);
    await submitGetaway(data, scheduleRows);
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
        <h2 className='title'>Create getaway</h2>
        <Box sx={{ padding: '7px 0px' }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller name="title" defaultValue=""
              control={control}
              rules={{
                // required: "Getaway title is required",
                validate: (value?: string) =>
                  !value || ALPHANUMERIC_I18N_REGEX.test(value)
                    ? true
                    : "Only letters and numbers are allowed.",
              }}
              render={({ field }) => (
                <TextField label="Getaway title" id="Getaway title" fullWidth margin="dense"
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
                    : "Only letters and numbers are allowed.",
              }}
              render={({ field }) => (
                <TextField id={field.name} label="Overview description" fullWidth margin="dense" multiline maxRows={3}
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
                    <TextField label="Start date" type="date" fullWidth margin="normal"
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
                      return new Date(start) < new Date(value) || "End date must be after start date";
                    }
                  }}
                  render={({ field }) => (
                    <TextField label="End date" fullWidth margin="normal"
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
                      label="Sport" fullWidth margin="normal"
                      select
                      {...field}
                      error={!!errors.sport}
                      helperText={errors.sport ? errors.sport.message : 'Please select the sport'}
                    >
                      {sports.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
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
                    : "Only letters and numbers are allowed.",
              }}
              render={({ field }) => (
                <TextField label="Photo Caption (Optional)" fullWidth margin="dense"
                  {...field}
                  error={!!errors.caption}
                  helperText={
                    errors.caption
                      ? errors.caption.message
                      : "Only letters and numbers allowed."
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
                  "Please enter a valid YouTube or Vimeo link",
              }}
              render={({ field }) => (
                <TextField label="Youtube or Vimeo link (Optional)" fullWidth margin="dense"
                  {...field}
                  error={!!errors.galleryVideo}
                  helperText={
                    errors.galleryVideo
                      ? errors.galleryVideo.message
                      : "Recommended resolution 1280x720px"
                  }
                />
              )}
            />

            <Card
              sx={{
                borderRadius: '0 24px', m: '20px 0', p: '20px 25px',
                bgcolor: '#3C1C91', color: '#FFF', fontWeight: 'medium', textTransform: 'none',
                ':hover': { bgcolor: '#300e8eff' }
              }}>
              <h3 className='titleLeft'>Want your Getaways to stand out?</h3>
              <p>We offer professional photography and video services to enhance the beauty of your facilities and capture the essence of your club.
              Make your Getaways irresistible!</p>
              <Button startIcon={<LightbulbIcon />} href="https://racquetsappsuite.com/" target="_blank" disableElevation
                sx={{
                  mb: 1, padding: '5px 15px', borderRadius: '8px', bgcolor: '#FFF', color: '#3C1C91', fontWeight: 'medium', textTransform: 'none',
                  ':hover': { bgcolor: '#3C1C91', color: 'white'}
                }}
              > Learn more </Button>
            </Card>

            <Typography variant="h6" color="#3C1C91" sx={{ m: '1 0', fontWeight:"bold"  }}> Getaway details </Typography>
            <Divider aria-hidden="true"/>

            <Controller name="mainDescription" defaultValue="" control={control}
              rules={{
                // required: "Main description is required"
                validate: (value?: string) =>
                  !value || ALPHANUMERIC_I18N_REGEX.test(value)
                    ? true
                    : "Only letters and numbers are allowed.",
              }}
              render={({ field }) => (
                <TextField label="Main description" fullWidth multiline maxRows={7} margin="normal"
                  {...field}
                  error={!!errors.mainDescription}
                  helperText={errors.mainDescription ? errors.mainDescription.message : ''}
                />
              )}
            />

            <Typography variant="h6" color="#3C1C91" sx={{ m: '1 0', fontSize: '14px', fontWeight:"bold"  }}> Lodging options(Single or double occupancy)</Typography>
            <Divider aria-hidden="true"/>
            {lodgingFields.map((field, index) => (
              <Box key={field.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'start', flexWrap: 'wrap', gap: 1 }}>
                <Controller name={`lodgingOptions.${index}.name`}
                  control={control}
                  defaultValue={field.name}
                  rules={{
                    // required: "Lodging option is required",
                    validate: (value?: string) =>
                      !value || ALPHANUMERIC_I18N_REGEX.test(value)
                        ? true
                        : "Only letters and numbers are allowed.",
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={`Lodging Option ${index + 1}`}
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
                    // required: "Lodging price is required",
                    validate: {
                      isNumber: (value) => {
                        const numberValue = parseFloat(String(value));
                        return !isNaN(numberValue) || 'Price must be a number';
                      },
                      isPositive: (value) => {
                        const numberValue = parseFloat(String(value));
                        return numberValue >= 0 || 'The price must be a positive number';
                      }
                    }
                  }}
                  render={({ field }) => (
                    <TextField sx={{ width: { xs: '100%', sm: '220px' }, mr: { xs: 0, sm: '15px' } }}
                      {...field}
                      label={`Lodging ${index + 1} Price`}
                      type="number" margin="normal"
                      error={!!errors.lodgingOptions?.[index]?.price}
                      helperText={errors.lodgingOptions?.[index]?.price ? errors.lodgingOptions?.[index]?.price.message : ''}
                    />
                  )}
                />

                <Button startIcon={<DeleteIcon />} variant="outlined" disableElevation size="medium" aria-label="delete"
                  sx={{
                    p:'5px 16px', m:'0 2px',  borderRadius: "10px", textTransform: "none", bgcolor: '#3C1C91', color: '#fff', fontWeight: 'bold',
                    ':hover': { color: '#3C1C91', bgcolor: '#fff'  }
                  }}
                  onClick={() => removeLodging(index)}
                  // disabled={activeForms.length === 1}
                >Remove</Button>
              </Box>
            ))}
            <Button
              startIcon={<AddIcon />} variant="contained"
              onClick={() => appendLodging({ name: "", price: 0})}
              sx={{
                mt: 0, mb: 3, bgcolor: '#00E392', color: '#1A2660', fontWeight: 'bold', borderRadius: '30px', textTransform: 'none',
                ':hover': { bgcolor: '#3C1C91', color: 'white' }
              }}
              disableElevation
            > Add item </Button>

            <Typography variant="h6" color="#3C1C91" sx={{ m: '1 0', fontSize: '14px', fontWeight:"bold"  }}> Optional Add Ons [name, price] </Typography>
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
                        : "Only letters and numbers are allowed.",
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={`Optional Add On ${index + 1}`}
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
                        return !isNaN(numberValue) || 'Price must be a number';
                      },
                      isPositive: (value) => {
                        const numberValue = parseFloat(String(value));
                        return numberValue >= 0 || 'The price must be a positive number';
                      }
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={`Add On ${index + 1} Price`}
                      type="number" margin="normal" sx={{ maxWidth: { xs: '100%', sm: '220px' }, mr: { xs: 0, sm: '15px' } }}
                      error={!!errors.optionalAddOns?.[index]?.price}
                      helperText={errors.optionalAddOns?.[index]?.price ? errors.optionalAddOns?.[index]?.price.message : ''}
                    />
                  )}
                />
                <Button startIcon={<DeleteIcon />} variant="outlined" disableElevation size="medium" aria-label="delete"
                  sx={{
                    p:'5px 16px', m:'0 2px', borderRadius: "10px",
                    textTransform: "none", bgcolor: '#3C1C91', color: '#fff', fontWeight: 'bold',
                    ':hover': { color: '#3C1C91', bgcolor: '#fff'  }
                  }}
                  onClick={() => removeAddOn(index)}
                  // disabled={activeForms.length === 1}
                > Remove </Button>
              </Box>
            ))}

            <Button startIcon={<AddIcon />} variant="contained" disableElevation
              onClick={() => appendAddOn({ name: "", price: 0 })}
              sx={{
                mt: 0, mb: 2, bgcolor: '#00E392', color: '#1A2660', fontWeight: 'bold', borderRadius: '30px', textTransform: 'none',
                ':hover': { bgcolor: '#3C1C91', color: 'white' }
              }}
            > Add item </Button>

            <Typography variant="h6" color="#3C1C91" sx={{ m: '1 0', fontSize: '14px', fontWeight:"bold"  }}> Services & amenities included </Typography>
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
                      label={`Amenity ${index + 1}`}
                      error={!!errors.amenities?.[index]?.name}
                      helperText={errors.amenities?.[index]?.name ? errors.amenities?.[index]?.name.message : ''}
                    />
                  )}
                />
                <Button startIcon={<DeleteIcon />} variant="outlined" disableElevation size="medium"
                  sx={{
                    p:'5px 16px', m:'0 3px', borderRadius: "10px", textTransform: "none",
                    bgcolor: '#3C1C91', color: '#fff', fontWeight: 'bold',
                    ':hover': { color: '#3C1C91', bgcolor: '#fff'  }
                  }}
                  onClick={() => removeAmenity(index)} aria-label="delete"
                > Remove </Button>
              </Box>
            ))}
            <Button startIcon={<AddIcon />} variant="contained" aria-label="Add amenity" disableElevation
              onClick={() => appendAmenity({ name: "" })}
              sx={{
                mb: 3, bgcolor: '#00E392', color: '#1A2660', borderRadius: '30px', fontWeight: 'bold', textTransform: 'none',
                ':hover': { bgcolor: '#3C1C91', color: 'white' }
              }}
            > Add item </Button>

            {scheduleError && (
              <div style={{ color: "red", fontWeight: "bold", marginBottom: 8 }}> {scheduleError} </div>
            )}
            <Box id="schedule-section">
              <ScheduleForm rows={scheduleRows} setRows={setScheduleRows} />
            </Box>

            <Box
              sx={{
                borderRadius: '0 24px', m: '25px 0', p: '30px 25px',
                bgcolor: '#3C1C91', color:'white', fontWeight: 'medium', textTransform: 'none',
                ':hover': { bgcolor: '#300e8eff' }
              }}
            >
              <Typography variant="h3" color="#fff" sx={{ m: '1 0', fontSize: '16px', fontWeight:"medium"  }}> Discount management </Typography>
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
                  mt: 2, mb: 3, bgcolor: '#fff', color: '#1A2660', borderRadius: '30px', fontWeight: 'bold', textTransform: 'none',
                  ':hover': { bgcolor: '#3C1C91', color: 'white' }
                }}
              > Add item </Button>
            </Box>
            <AcademySchedule/>
            <TournamentsSchedule/>
            <LaddersSchedule/>

            <Controller name="policies" defaultValue=""
              control={control}
              // rules={{ required: "Policies are required" }}
              render={({ field }) => (
                <TextField label="Policies" fullWidth margin="normal" multiline maxRows={3}
                  {...field} id={field.name}
                  error={!!errors.policies}
                  helperText={errors.policies ? errors.policies.message : ''}
                />
              )}
            />

            <Controller name="terms" defaultValue=""
              control={control}
              render={({ field }) => (
                <TextField label="Terms" multiline maxRows={7} fullWidth margin="normal"
                  {...field} id={field.name}
                  error={!!errors.terms}
                  helperText={errors.terms ? errors.terms.message : ''}
                />
              )}
            />

            <Box style={{ display: 'flex', justifyContent: 'center', gap: 18, margin:'20px 0' }}>
              <Button type="button" href="/getaways"
              startIcon={<ArrowBackIcon />} variant="outlined" disableElevation
                sx={{
                  width:'135px', borderRadius: '8px', bgcolor: '#FFF', color: '#3C1C91', fontWeight: 'medium', textTransform: 'none',
                  ':hover': { bgcolor: '#3C1C91', color: 'white' }
                }}
              > Retry </Button>

              <Button type="submit" startIcon={<SaveIcon />} variant="outlined"
                disabled={isLoading}
                // className={`className ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                sx={{
                  width:'150px',
                  borderRadius: '8px', bgcolor: '#3C1C91', color: '#FFF', fontWeight: 'medium', textTransform: 'none',
                  ':hover': { bgcolor: 'white', color: '#3C1C91' }
                }}
              > {isLoading ? 'Saving...' : 'Save changes '}
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