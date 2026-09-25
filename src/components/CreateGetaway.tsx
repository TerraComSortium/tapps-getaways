import { Link as RouterLink } from 'react-router-dom';
import { useForm, Controller, useFieldArray, SubmitHandler, SubmitErrorHandler,
  useWatch
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../constants/routes';
import { BRAND } from '../theme/colors';
import { Box, TextField, Button, Divider, Typography, Card, Snackbar, Alert, MenuItem } from '@mui/material';
import Grid from '@mui/material/Grid2';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

import { AddressAutocompleteField } from '../components/AddressAutocompleteField';
import { GalleryPhotoItem } from '../components/GalleryPhotoItem';
import { ScheduleCalendar } from '../components/ScheduleCalendar';
import { rowsOutsideRange } from '../utils/dataMappers';
import { countGetawayDays } from '../utils/getawayHelpers';
import { getScheduleFeeLines, lineTotal, sumAmenities } from '../utils/scheduleFees';
import { GetawaySummaryDialog, type GetawaySummary } from '../components/GetawaySummaryDialog';
import type { Tournament } from '../services/tournament';
import type { Ladder } from '../services/ladder';
import { PricedItemRow } from '../components/PricedItemRow';
import AcademySchedule from '../components/AcademySchedule';
// import AcademySchedule1 from '../components/AcademySchedule1';

import LaddersSchedule from '../components/LaddersSchedule';
import TournamentsSchedule from '../components/TournamentsSchedule';
// import { Tournaments } from './Tournaments';
// import { getAcademy } from '../services/academyService';
import { useGetAcademy } from '../hooks/useGetAcademy';

import {
  GetawayFormData,
  // GetawayPayload, CouponPayload
  ScheduleRow,
} from '../types/getaway';

import { useSnackbar } from '../hooks/useSnackbar';
import { scrollToFirstError } from '../utils/formErrors';
import { useCreateGetaway } from '../hooks/useCreateGetaway';
import { useEffect, useRef, useState } from 'react';
// import { useScheduleValidation } from '../hooks/useScheduleValidation';

const ALPHANUMERIC_I18N_REGEX : RegExp = /^[\p{L}0-9\s,._'";:()!/|&—’-]*$/u;
const YOUTUBE_VIMEO_REGEX = /^(https?:\/\/)?(www\.)?(?:(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})|vimeo\.com\/(\d+))/;
const sports = [
  { value: 'tennis', label: 'Tennis' },
  { value: 'padel', label: 'Padel' },
  { value: 'pickleball', label: 'Pickleball' },
  { value: 'other', label: 'Other' }
];

export const CreateGetaway =() => {
  const { t, i18n } = useTranslation();
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
  const { isLoading, submitGetaway } = useCreateGetaway(showSnackbar);

  const [scheduleRows, setScheduleRows] = useState<ScheduleRow[]>([]);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  const { control, handleSubmit, setValue, getValues, formState: { errors } } = useForm<GetawayFormData>({
    defaultValues: {
      title: "",
      overview: "",
      getawayAddress: { address: "", lat: null, lng: null },
      galleryPhotos: [],
      lodgingOptions: [{ name: "", unitPrice: 0, days: 1, price: 0 }],
      optionalAddOns: [{ name: "", price: 0 }],
      amenities: [{ name: "", unitPrice: 0, days: 1 }],
      schedule: [],
      discounts: []
    }
  });

  // 1. Hook de consulta a la academia
  const { academyData, loading: loadingAcademy, error: academyError, fetchAcademy } = useGetAcademy();
  const [selectedAcademyIds, setSelectedAcademyIds] = useState<string[]>([]);

  // 2. Escuchar los inputs clave del formulario
  const watchedStartDate = useWatch({ control, name: 'startDate' });
  const watchedEndDate = useWatch({ control, name: 'endDate' });
  const watchedSport = useWatch({ control, name: 'sport' });
  // Valores en vivo de estas 3 secciones, para poder enlazarlas a una actividad
  // del schedule (useFieldArray.fields no refleja lo que el usuario va tipeando).
  const watchedLodgingOptions = useWatch({ control, name: 'lodgingOptions' });
  const watchedAddOns = useWatch({ control, name: 'optionalAddOns' });
  const watchedAmenities = useWatch({ control, name: 'amenities' });

  const [selectedTournamentIds, setSelectedTournamentIds] = useState<string[]>([]);
  // Datos que cargan las tablas de torneos/ladders: se usan para sus tarifas en el resumen.
  const [tournamentsData, setTournamentsData] = useState<Tournament[]>([]);
  const [laddersData, setLaddersData] = useState<Ladder[]>([]);
  // Datos validados a la espera de que el usuario confirme el resumen.
  const [pendingSubmit, setPendingSubmit] = useState<{
    data: GetawayFormData;
    cleanedAddOns: { name: string; price: number }[];
    validPhotos: File[];
    validCaptions: string[];
    summary: GetawaySummary;
  } | null>(null);
  const [selectedLadderIds, setSelectedLadderIds] = useState<string[]>([]);

  const { fields: photoFields, append: appendPhoto, remove: removePhoto } = useFieldArray({
    control,
    name: 'galleryPhotos'
  });
  const PHOTOS_LIMIT = 5;
  const isLimitReached = photoFields.length >= PHOTOS_LIMIT;

  const { fields: lodgingFields, append: appendLodging, remove: removeLodging } = useFieldArray({
    control,
    name: 'lodgingOptions'
  });

  const { fields: amenityFields, append: appendAmenity, remove: removeAmenity } = useFieldArray({
    control,
    name: 'amenities'
  });

  // Días del getaway: valor por defecto de "días" en alojamiento y amenities.
  const getawayDays = countGetawayDays(watchedStartDate, watchedEndDate);
  const lastGetawayDays = useRef(1);
  // Al cambiar las fechas se actualizan los días de las filas que seguían con el
  // valor automático; las que el usuario editó a mano se respetan.
  useEffect(() => {
    if (!getawayDays) return;
    const previous = lastGetawayDays.current;
    (['lodgingOptions', 'amenities'] as const).forEach((section) => {
      (getValues(section) || []).forEach((item, index) => {
        const days = Number(item?.days);
        if (!days || days === previous) {
          setValue(`${section}.${index}.days`, getawayDays);
        }
      });
    });
    lastGetawayDays.current = getawayDays;
  }, [getawayDays, getValues, setValue]);

  // Totales en vivo (precio unitario × días), con el mismo cálculo que el backend.
  const lodgingTotal = (index: number) =>
    lineTotal(watchedLodgingOptions?.[index]?.unitPrice, watchedLodgingOptions?.[index]?.days);
  const amenityTotal = (index: number) =>
    lineTotal(watchedAmenities?.[index]?.unitPrice, watchedAmenities?.[index]?.days);
  const amenitiesSum = sumAmenities(watchedAmenities);
  const formatMoney = (value: number) =>
    value.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const { fields: addOnFields, append: appendAddOn, remove: removeAddOn } = useFieldArray({
    control,
    name: 'optionalAddOns'
  });

  // const { fields: discountFields, append: appendDiscount, remove: removeDiscount } = useFieldArray({
  //   control,
  //   name: 'discounts'
  // });

  const onSubmit: SubmitHandler<GetawayFormData> = async (data) => {
    if (!data.getawayAddress.lat || !data.getawayAddress.lng) {
      showSnackbar(t('create.selectValidLocation'), "warning");
      return;
    }
    const validEntries = (data.galleryPhotos || []).filter(
      (item): item is { file: File; caption?: string } => item.file instanceof File
    );
    //Filter null files
    const validPhotos = validEntries.map((item) => item.file);
    const validCaptions = validEntries.map((item) => item.caption || '');
    if (validPhotos.length > PHOTOS_LIMIT) {
      alert(`Only ${PHOTOS_LIMIT} photos.`);
      return;
    }

    if (scheduleRows.length === 0) {
      setScheduleError(t('create.scheduleRequired'));
      document.getElementById('schedule-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      showSnackbar(t('create.scheduleRequired'), 'warning');
      return;
    }
    if (rowsOutsideRange(scheduleRows, data.startDate, data.endDate).length > 0) {
      setScheduleError(t('sched.outOfRangeBlocking'));
      document.getElementById('schedule-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      showSnackbar(t('sched.outOfRangeBlocking'), 'warning');
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

    // El precio de cada habitación es su total: precio unitario × días.
    const normalizeLine = <T extends { unitPrice?: number; days?: number }>(item: T) => ({
      ...item,
      unitPrice: Number(item.unitPrice) || 0,
      days: Number(item.days) || 1,
    });
    const lodgingOptions = (data.lodgingOptions || []).map((option) => {
      const line = normalizeLine(option);
      return { ...line, price: lineTotal(line.unitPrice, line.days) };
    });
    const amenities = (data.amenities || [])
      .filter((amenity) => amenity.name?.trim())
      .map((amenity) => {
        const line = normalizeLine(amenity);
        return { ...line, total: lineTotal(line.unitPrice, line.days) };
      });
    const normalizedData: GetawayFormData = { ...data, lodgingOptions, amenities };

    // Actividades seleccionadas con su tarifa (misma función que la reserva y el cobro).
    const pick = <T extends { id?: string }>(items: T[], ids: string[]) => items.filter((item) => item.id && ids.includes(item.id));
    const activityLines = getScheduleFeeLines({
      academyClasses: pick(academyData as { id?: string }[], selectedAcademyIds),
      tournaments: pick(tournamentsData, selectedTournamentIds),
      ladders: pick(laddersData, selectedLadderIds),
    });

    setPendingSubmit({
      data: normalizedData,
      cleanedAddOns,
      validPhotos,
      validCaptions,
      summary: {
        title: data.title,
        startDate: data.startDate,
        endDate: data.endDate,
        days: countGetawayDays(data.startDate, data.endDate),
        sport: data.sport,
        address: data.getawayAddress?.address || '',
        lodging: lodgingOptions.map(({ name, unitPrice, days, price }) => ({ name, unitPrice, days, total: price })),
        amenities: amenities.map(({ name, unitPrice, days, total }) => ({ name, unitPrice, days, total })),
        addOns: cleanedAddOns,
        activities: activityLines.map(({ name, kind, price }) => ({ name, kind, price })),
        scheduleCount: scheduleRows.length,
      },
    });
  };

  /** "Confirmar y guardar" en el resumen: recién aquí se envía al backend. */
  const confirmSubmit = async () => {
    if (!pendingSubmit) return;
    await submitGetaway(
      pendingSubmit.data,
      scheduleRows,
      pendingSubmit.cleanedAddOns,
      pendingSubmit.validPhotos,
      pendingSubmit.validCaptions,
      selectedTournamentIds,
      selectedLadderIds,
      selectedAcademyIds
    );
    setPendingSubmit(null);
  };

  /**
   * Se dispara cuando la validación falla: lleva al primer campo con error para
   * que el usuario vea QUÉ le falta, en vez de que no pase nada al pulsar guardar.
   */
  const onInvalid: SubmitErrorHandler<GetawayFormData> = (validationErrors) => {
    const field = scrollToFirstError(validationErrors);

    if (!field && scheduleRows.length === 0) {
      setScheduleError(t('create.scheduleRequired'));
      document.getElementById('schedule-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    showSnackbar(t('common.missingFields'), 'warning');
  };

  useEffect(() => {
    // Solo se limpia cuando el schedule ya es válido: con filas y ninguna fuera de rango.
    const isValid = scheduleRows.length > 0 &&
      rowsOutsideRange(scheduleRows, watchedStartDate, watchedEndDate).length === 0;
    if (isValid && scheduleError) {
      setScheduleError(null);
    }
  }, [scheduleRows, scheduleError, watchedStartDate, watchedEndDate]);
  // Disparar la consulta al cambiar las fechas o el deporte
  useEffect(() => {
    if (watchedStartDate && watchedEndDate && watchedSport) {
      fetchAcademy({
        startDate: watchedStartDate,
        endDate: watchedEndDate,
        sport: watchedSport,
      });
    }
  }, [watchedStartDate, watchedEndDate, watchedSport, fetchAcademy]);

  // Antes este error se tragaba en silencio: `academyData` quedaba en [] y
  // AcademySchedule mostraba "no hay sesiones", como si la búsqueda hubiera
  // dado vacío de verdad en vez de haber fallado.
  useEffect(() => {
    if (academyError) {
      showSnackbar(t('academy.loadError'), 'warning');
    }
  }, [academyError, showSnackbar, t]);
  return (
    <>
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
            <h2 className='title'>{t('create.title')}</h2>
      <Box sx={{ padding: '7px 0px' }}>
        <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
          <Controller name="title" defaultValue=""
            control={control}
            rules={{
              required: t('create.titleRequired'),
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
                rules={{ required: t('create.startRequired') }}
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
                  required: t('create.endRequired'),
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

          <Typography variant="h6" color={BRAND.primary} sx={{ mt:2, fontSize: '14px', fontWeight:"bold"  }}> {t('gallery.photoGallery')}</Typography>
          <Divider aria-hidden="true"/>
          <Box width={{ xs:'85%', sm:'100%' }} sx={{ mt:2, mb:3 }}>
            {photoFields.map((field, index) => (
              <GalleryPhotoItem
                key={field.id}
                index={index}
                control={control}
                errors={errors}
                onRemove={removePhoto}
              />
            ))}

            <Button startIcon={<AddIcon />} variant="contained" disableElevation
              disabled={isLimitReached}
              onClick={() => appendPhoto({ file: null, caption: '' })}
              sx={{
                // mb: 1,
                color: BRAND.navy, bgcolor: BRAND.green,
                borderRadius: '30px',
                fontWeight: 'bold', textTransform: 'none',
                ':hover': { bgcolor: BRAND.primary, color: 'white' },
                '&.Mui-disabled': { bgcolor: '#e0e0e0', color: '#a0a0a0' }
              }}
            > {t('create.addPhoto')} {/* || Add Photo */}
            </Button>
          </Box>

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
            <PricedItemRow
              key={field.id}
              control={control}
              errors={errors}
              section="lodgingOptions"
              index={index}
              nameLabel={t('create.lodgingOptionN', { n: index + 1 })}
              nameRules={{
                required: t('create.lodgingRequired'),
                validate: (value) =>
                  !value || ALPHANUMERIC_I18N_REGEX.test(String(value)) ? true : t('create.onlyAlphanumeric'),
              }}
              defaultDays={getawayDays}
              total={formatMoney(lodgingTotal(index))}
              onRemove={() => removeLodging(index)}
            />
          ))}
          <Button
            startIcon={<AddIcon />} variant="contained" aria-label="Add lodging option" disableElevation
            onClick={() => appendLodging({ name: "", unitPrice: 0, days: getawayDays || 1, price: 0 })}
            sx={{
              mt:0, mb: 3, bgcolor: BRAND.green, color: BRAND.navy, fontWeight: 'bold', borderRadius: '30px', textTransform: 'none',
              ':hover': { bgcolor: BRAND.primary, color: 'white' }
            }}
          > {t('create.addItem')} </Button>

          <Typography variant="h6" color={BRAND.primary} sx={{ m: '1 0', fontSize: '14px', fontWeight:"bold"  }}> {t('create.addOnsSection')} </Typography>
          <Divider aria-hidden="true" />

          {addOnFields.map((field, index) => (
            <Box key={field.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'start', flexWrap: 'wrap', gap:0 }}>
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
                    sx={{ maxWidth:{ xs:'70%', sm:'225px', md:'300px' }, mr:{ xs:0, sm:'12px'}, mb:'1' }}
                    fullWidth margin="normal"
                    error={!!errors.optionalAddOns?.[index]?.name}
                    helperText={errors.optionalAddOns?.[index]?.name ? errors.optionalAddOns?.[index]?.name.message : ''}
                  />
                )}
              />
              <Controller
                name={`optionalAddOns.${index}.price`}
                control={control}
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
                    type="number" margin="normal" sx={{ maxWidth: { xs:'45%', sm:'180px', md:'220px' }, mr: { xs: 0, sm: '5px' } }}
                    error={!!errors.optionalAddOns?.[index]?.price}
                    helperText={errors.optionalAddOns?.[index]?.price ? errors.optionalAddOns?.[index]?.price.message : ''}
                  />
                )}
              />
              <Button variant="outlined" disableElevation size="medium" aria-label="delete"
                sx={{
                  p: '10px 16px',
                  minWidth: '48px', height: '56px',
                  mt:'8px', ml:{ xs:'3px', sm:'2px'}, borderRadius: "10px",
                  textTransform: "none", bgcolor: BRAND.primary, color: BRAND.white, fontWeight: 'bold',
                  ':hover': { color: BRAND.primary, bgcolor: BRAND.white  }
                }}
                onClick={() => removeAddOn(index)}
                // disabled={activeForms.length === 1}
              ><DeleteIcon/></Button>
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
            <PricedItemRow
              key={field.id}
              control={control}
              errors={errors}
              section="amenities"
              index={index}
              nameLabel={t('create.amenityN', { n: index + 1 })}
              defaultDays={getawayDays}
              total={formatMoney(amenityTotal(index))}
              onRemove={() => removeAmenity(index)}
            />
          ))}
          {amenitiesSum > 0 && (
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: BRAND.primary, mt: 1, mb: 1 }}>
              {t('create.amenitiesTotal', { total: formatMoney(amenitiesSum) })}
            </Typography>
          )}
          <Button startIcon={<AddIcon />} variant="contained" aria-label="Add amenity" disableElevation
            onClick={() => appendAmenity({ name: "", unitPrice: 0, days: getawayDays || 1 })}
            sx={{
              mb: 3, bgcolor: BRAND.green, color: BRAND.navy, borderRadius: '30px', fontWeight: 'bold', textTransform: 'none',
              ':hover': { bgcolor: BRAND.primary, color: 'white' }
            }}
          > {t('create.addItem')} </Button>

          {scheduleError && (
            <div style={{ color: "red", fontWeight: "bold", marginBottom: 8 }}> {scheduleError} </div>
          )}
          <Box id="schedule-section">
            <ScheduleCalendar
              rows={scheduleRows}
              setRows={setScheduleRows}
              startDate={watchedStartDate}
              endDate={watchedEndDate}
              lodgingOptions={watchedLodgingOptions}
              addOns={watchedAddOns}
              amenities={watchedAmenities}
            />
          </Box>

          {/* <AcademySchedule1/> */}
          <AcademySchedule
            schedules={academyData}
            loading={loadingAcademy}
            error={academyError}
            selectedIds={selectedAcademyIds}
            setSelectedIds={setSelectedAcademyIds}
            fetchAcademy={fetchAcademy}
            searchParams={{
              startDate: watchedStartDate,
              endDate: watchedEndDate,
              sport: watchedSport
            }}
          />
          {/* <TournamentsSchedule/> */}
          <TournamentsSchedule
            mode="select"
            onItemsLoaded={setTournamentsData}
            selectedIds={selectedTournamentIds}
            setSelectedIds={setSelectedTournamentIds}
            searchParams={{
              startDate: watchedStartDate,
              endDate: watchedEndDate,
              sport: watchedSport
            }}
          />

          {/* <section style={{ marginTop: '20px' }}>
            <Tournaments />
          </section> */}

          <LaddersSchedule
            mode="select"
            onItemsLoaded={setLaddersData}
            selectedIds={selectedLadderIds}
            setSelectedIds={setSelectedLadderIds}
            searchParams={{
              startDate: watchedStartDate,
              endDate: watchedEndDate,
              sport: watchedSport
            }}
          />

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

          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2, m: '20px 0' }}>
            <Button type="button" component={RouterLink} to={ROUTES.GETAWAYS}
            startIcon={<ArrowBackIcon />} variant="outlined" disableElevation
              sx={{
                minWidth: '135px', whiteSpace: 'nowrap', px: 2, borderRadius: '8px', bgcolor: BRAND.white, color: BRAND.primary, fontWeight: 'medium', textTransform: 'none',
                ':hover': { bgcolor: BRAND.primary, color: 'white' }
              }}
            > {t('create.back')} </Button>

            <Button type="submit" startIcon={<SaveIcon />} variant="outlined"
              disabled={isLoading}
              // className={`className ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              sx={{
                minWidth: '150px', whiteSpace: 'nowrap', px: 2,
                borderRadius: '8px', bgcolor: BRAND.primary, color: BRAND.white, fontWeight: 'medium', textTransform: 'none',
                ':hover': { bgcolor: 'white', color: BRAND.primary }
              }}
            > {isLoading ? t('create.saving') : t('create.saveChanges')}
            </Button>
          </Box>
        </form>
      </Box>
    
    </Box>
      <GetawaySummaryDialog
        open={!!pendingSubmit}
        summary={pendingSubmit?.summary ?? null}
        saving={isLoading}
        onClose={() => setPendingSubmit(null)}
        onConfirm={confirmSubmit}
      />
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={closeSnackbar}>
        <Alert severity={snackbar.severity} onClose={closeSnackbar} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
export default CreateGetaway;
