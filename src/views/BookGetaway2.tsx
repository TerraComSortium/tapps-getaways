import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { scrollToFirstError } from '../utils/formErrors';
import LoadingOverlay from '../components/LoadingOverlay';

import { Box, TextField, Button, Typography, Divider, RadioGroup, Paper, Stack, Chip,
  FormGroup, FormControl,
  FormControlLabel,
  // FormLabel, FormHelperText,
  Radio, Checkbox, CircularProgress, Alert } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

import { useAuth } from '../contexts/AuthContext';
import { useGetawayById } from '../hooks/useGetawayById';
import { useCouponById } from '../hooks/useCoupon';
import { useCouponHold } from '../hooks/useCouponHold';
import { createPurchase, Reservation } from '../services/purchase/purchase';
import { paymentPath } from '../constants/routes';
import { BRAND } from '../theme/colors';

import AcademySchedule from '../components/AcademySchedule';
import LaddersSchedule from '../components/LaddersSchedule';
import TournamentsSchedule from '../components/TournamentsSchedule';
import { getCouponLabel, getCouponValue } from '../utils/couponHelpers';
import { getScheduleFeeLines } from '../utils/scheduleFees';
import type { AcademyClass } from '../hooks/useGetAcademy';
import type { Tournament } from '../services/tournament';
import type { Ladder } from '../services/ladder';

const TAX_RATE = 0.0654;
const CURRENCY = 'USD';

/** Formato del payload: debe coincidir con el que reconstruye el backend. */
const formatAmount = (value: number) => `${(value || 0).toFixed(2)} ${CURRENCY}`;

/** Formato de pantalla: con separador de miles y sin repetir símbolo + código. */
const displayAmount = (value: number) =>
  (value || 0).toLocaleString(undefined, {
    style: 'currency',
    currency: CURRENCY,
    minimumFractionDigits: 2,
  });

interface LodgingOption {
  name: string;
  price: number;
  occupancy?: string;
}
/** Concepto del subtotal. `hidden`: suma al total pero no se lista en el desglose. */
type SummaryLine = { id: string; label: string; price: number; hidden?: boolean };

interface AddOnOption {
  name: string;
  price: number;
}

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
  /** Firebase no guarda estos datos, así que se piden aquí. */
  cellphone: string;
  address: string;
}

/** Fila del resumen: concepto a la izquierda, importe alineado a la derecha. */
const SummaryRow = ({
  label, amount, highlight = false,
}: { label: string; amount: string; highlight?: boolean }) => (
  <Stack
    direction="row"
    sx={{ justifyContent: 'space-between', alignItems: 'baseline', py: 0.6 }}
  >
    <Typography variant="body2" color={highlight ? BRAND.primary : 'text.secondary'}>
      {label}
    </Typography>
    <Typography
      variant="body2"
      sx={{ fontWeight: highlight ? 'bold' : 500, color: highlight ? BRAND.primary : 'inherit' }}
    >
      {amount}
    </Typography>
  </Stack>
);

export default function BookGetaway() {
  const { t } = useTranslation();
  //get id param and fetch getaway
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const stateCouponId = (location.state as { couponId?: string } | null)?.couponId;
  const couponId = searchParams.get('couponId') || stateCouponId;
  const { data: getaway, loading, error } = useGetawayById(id || '');
  const { data: coupon } = useCouponById(couponId);
  // Aparta un cupo al entrar y lo devuelve al salir sin pagar.
  const couponHold = useCouponHold(couponId);
  // Si no se consiguió cupo, el cupón no descuenta: no se puede prometer un
  // precio que el backend no va a aplicar.
  const activeCoupon = couponHold.held ? coupon : null;

  // Minutos que le quedan a la reserva del cupo; se refresca cada 30 s.
  const [holdMinutesLeft, setHoldMinutesLeft] = useState<number | null>(null);
  useEffect(() => {
    if (!couponHold.expiresAt) {
      setHoldMinutesLeft(null);
      return;
    }
    const update = () => {
      const ms = new Date(couponHold.expiresAt as string).getTime() - Date.now();
      setHoldMinutesLeft(Math.max(Math.ceil(ms / 60000), 0));
    };
    update();
    const timer = setInterval(update, 30000);
    return () => clearInterval(timer);
  }, [couponHold.expiresAt]);

  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Permite abortar la creación de la reserva si el usuario se cansa de esperar.
  const abortRef = useRef<AbortController | null>(null);

  const cancelSubmit = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsSubmitting(false);
  }, []);

  const { handleSubmit, control, formState: { errors }, watch, reset } = useForm<FormData>({
    defaultValues: {
      lodgingOption: '',
      selectedAddOns: [],
      agreePolicies: false,
      agreeTerms: false,
      cellphone: '',
      address: '',
    }
  });

  const watchLodging = watch('lodgingOption');
  const watchAddOns = watch('selectedAddOns');

  useEffect(() => {
    if (getaway) {
      reset({
        // Siempre hay una opción de alojamiento marcada: reservar sin alojamiento
        // no es un estado válido, y así el resumen muestra un precio desde el inicio.
        // Se usa la primera, igual que en GetawayDetail.
        lodgingOption: getaway.lodgingOptions?.[0]?.name ?? '',
        selectedAddOns: [],
        agreePolicies: false,
        agreeTerms: false,
        cellphone: '',
        address: '',
      });
    }
  }, [id, getaway, reset]);

  /** Actividades incluidas en el getaway (academia, torneos, ladders) y su coste. */
  const scheduleLines = useMemo(() => getScheduleFeeLines(getaway), [getaway]);
  /**
   * Conceptos que forman el subtotal. El desglose y la suma salen de la MISMA
   * lista, así no pueden descuadrar: lo que se ve es exactamente lo que se cobra.
   * Se incluyen los de precio 0 (servicios sin coste que el usuario seleccionó).
   */
  const summaryLines = useMemo(() => {
    if (!getaway) return [] as SummaryLine[];

    const lines: SummaryLine[] = [];

    const selectedLodging = getaway.lodgingOptions?.find(
      (opt: LodgingOption) => opt.name === watchLodging
    );
    if (selectedLodging) {
      lines.push({
        id: `lodging-${selectedLodging.name}`,
        label: selectedLodging.name,
        price: Number(selectedLodging.price) || 0,
      });
    }

    getaway.optionalAddOns?.forEach((addon: AddOnOption, index: number) => {
      if (!watchAddOns?.includes(addon.name)) return;
      lines.push({
        id: `addon-${addon.name}-${index}`,
        label: addon.name,
        price: Number(addon.price) || 0,
      });
    });

    // Actividades incluidas: no son opcionales, vienen con el getaway.
    scheduleLines.forEach((line) => {
      lines.push({ id: line.id, label: line.name, price: line.price, hidden: true });
    });

    return lines;
  }, [getaway, watchLodging, watchAddOns, scheduleLines]);

  // Academia/torneos/ladders suman al subtotal pero no se listan en el desglose.
  const visibleSummaryLines = useMemo(
    () => summaryLines.filter((line) => !line.hidden),
    [summaryLines]
  );

  const totals = useMemo(() => {
    const sub = summaryLines.reduce((total, line) => total + line.price, 0);

    // Dos tipos de descuento: importe fijo se resta tal cual, porcentaje se
    // calcula sobre el subtotal ya formado (alojamiento + add-ons + actividades).
    const couponValue = getCouponValue(activeCoupon);
    const discount = activeCoupon
      ? activeCoupon.discountType === 'amount'
        ? Math.min(couponValue, sub)
        : sub * (couponValue / 100)
      : 0;

    const discountedSubtotal = Math.max(sub - discount, 0);
    const tax = discountedSubtotal * TAX_RATE;

    return {
      subtotal: sub,
      discount,
      discountedSubtotal,
      taxes: tax,
      total: discountedSubtotal + tax,
    };
  }, [summaryLines, activeCoupon]);

  const couponLabel = getCouponLabel(activeCoupon);

  const onSubmit = async (formData: FormData) => {
    if (!getaway || !user) return;
    setIsSubmitting(true);
    setSubmitError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const originalLodging = getaway.lodgingOptions?.find((opt: LodgingOption) => opt.name === formData.lodgingOption);
      const originalAddOns = getaway.optionalAddOns?.filter((addon: AddOnOption) => formData.selectedAddOns.includes(addon.name));

      //payload to POST
      const reservationPayload: Reservation = {
        //backend recalcula precios/total desde este getaway
        getawayId: id,
        couponId,
        user: {
          id: user.uid,
          name: user.displayName || '',
          email: user.email || '',
          cellphone: formData.cellphone,
          ...(formData.address ? { address: { street: formData.address } } : {}),
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
            occupancy: (originalLodging as LodgingOption).occupancy,
        } : undefined,

        optionalAddOns: originalAddOns?.map((addon: AddOnOption) => ({
          addonName: addon.name,
          price: addon.price
        })) || [],
        paymentDetails: {
          Subtotal: formatAmount(totals.subtotal),
          Taxes: formatAmount(totals.taxes),
          Total: formatAmount(totals.total),
        }
      };

      const response = await createPurchase(reservationPayload, controller.signal);
      const fetchedOrderId = response.orderSummary?.orderId || response.orderId;
      if (!fetchedOrderId) {
        throw new Error(t('book.noOrderId'));
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
      // Cancelar con Escape no es un error: el botón vuelve a estar disponible.
      if (axios.isCancel(err) || (err as Error)?.name === 'CanceledError') return;

      // Antes solo se logueaba: el botón se rehabilitaba y el usuario no sabía
      // por qué no avanzaba al pago.
      console.error('[BOOKING] Error al crear la reserva:', err);
      setSubmitError(err instanceof Error ? err.message : t('book.submitError'));
    } finally {
      abortRef.current = null;
      setIsSubmitting(false);
    }
  };


  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!getaway) return <Alert severity="info">{t('book.unavailable')}</Alert>;
  return (

    <Box sx={{ width: '100%', maxWidth: 1000, mx: 'auto', boxSizing: 'border-box' }}>
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Typography variant="h5" className='title' sx={{ fontWeight: 'bold' }}>
          {t('book.title')}
        </Typography>
        <Typography variant="h6" className='title' sx={{ color: 'text.secondary' }}>
          {getaway.title || t('book.title')}
        </Typography>
        {(getaway.startDate || getaway.endDate) && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {getaway.startDate} - {getaway.endDate}
          </Typography>
        )}
      </Box>

      <Box sx={{ px: { xs: 0, sm: 1 } }}>
        <form onSubmit={handleSubmit(onSubmit, scrollToFirstError)} noValidate>
          <Typography variant="h6" className='purpleLabel' sx={{ mt: 2, mb: 1, fontSize: '14px', fontWeight: 'bold' }}>{t('book.paymentContactInfo')}</Typography>
          <TextField label={t('book.playerName')} margin="dense" fullWidth disabled defaultValue={user?.displayName || ''} />

          <TextField label={t('book.email')} fullWidth margin="dense" disabled
            defaultValue={user?.email || ''}
          />
        
          <Controller
            name="cellphone" control={control}
            rules={{
              required: t('book.cellphoneRequired'),
              validate: (value) =>
                value.replace(/\D/g, '').length >= 7 || t('book.cellphoneInvalid'),
            }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label={t('book.cellphone')} type="tel"
                fullWidth margin="dense" required
                error={!!error}
                helperText={error?.message ?? ''}
              />
            )}
          />
          <Controller
            name="address" control={control}
            render={({ field }) => (
              <TextField {...field} label={t('book.address')} fullWidth margin="dense" />
            )}
          />
          <Typography variant="h6" className='purpleLabel' sx={{ mt: 2, mb: 0.5, fontSize: '14px', fontWeight: 'bold' }}>{t('book.lodgingOptions')}</Typography>
          <Divider aria-hidden="true" sx={{ bgcolor: BRAND.green }} />

          <Controller name="lodgingOption"
            control={control}
            rules={{ required: t('book.selectLodging') }}
            render={({ field }) => (
              <RadioGroup {...field} aria-labelledby="demo-radio-buttons-group-label" name="radio-buttons-group"
              value={field.value || ''}
              onChange={(e) => field.onChange(e.target.value)}
              >
                {getaway.lodgingOptions?.map((option: LodgingOption) => (
                  <FormControlLabel
                    key={option.name}
                    value={option.name}
                    control={<Radio />}
                    // Mismo orden y formato que los add-ons: "nombre: precio".
                    label={t('book.lodgingLabel', {
                      name: option.name,
                      price: displayAmount(Number(option.price)),
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
                {getaway.optionalAddOns?.map((addon: AddOnOption) => (
                  <FormControlLabel
                    key={addon.name}
                    label={`${addon.name}: ${displayAmount(Number(addon.price))}`}
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
          <AcademySchedule
            mode="readonly"
            showPrice={false}
            schedules={(getaway.academyClasses as AcademyClass[] | undefined) ?? []}
            loading={false}
            selectedIds={getaway.academyIds || []}
          />
          <TournamentsSchedule
            mode="readonly"
            showPrice={false}
            selectedIds={getaway.tournamentIds || []}
            items={(getaway.tournaments as Tournament[] | undefined) ?? []}
          />
          <LaddersSchedule
            mode="readonly"
            showPrice={false}
            selectedIds={getaway.ladderIds || []}
            items={(getaway.ladders as Ladder[] | undefined) ?? []}
          />
          {/* Resumen de pago: tarjeta aparte para que destaque sobre el formulario */}
          <Paper
            elevation={0}
            sx={{
              mt: 3, p: { xs: 2, sm: 2.5 },
              borderRadius: '12px',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
              <ReceiptLongIcon sx={{ color: BRAND.primary }} />
              <Typography sx={{ fontSize: 15, fontWeight: 'bold', color: BRAND.primary }}>
                {t('book.paymentDetails')}
              </Typography>
            </Stack>
            <Divider aria-hidden="true" sx={{ bgcolor: BRAND.green, mb: 1 }} />

            {activeCoupon && (
              <Box sx={{ my: 1 }}>
                <Chip
                  icon={<LocalOfferIcon />}
                  label={`${activeCoupon.title} · ${couponLabel}`}
                  sx={{
                    fontWeight: 'bold',
                    bgcolor: BRAND.green, color: BRAND.navy,
                    '& .MuiChip-icon': { color: BRAND.navy },
                  }}
                />
                {holdMinutesLeft !== null && holdMinutesLeft > 0 && (
                  <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: BRAND.primary, fontWeight: 'bold' }}>
                    {t('book.couponHeldFor', { count: holdMinutesLeft })}
                  </Typography>
                )}
                {couponHold.remaining !== null && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {t('book.couponRemaining', { count: couponHold.remaining })}
                  </Typography>
                )}
              </Box>
            )}

            {/* El cupón existe pero no se pudo apartar cupo */}
            {coupon && !couponHold.held && !couponHold.loading && (
              <Alert severity="warning" sx={{ my: 1 }}>
                {couponHold.reason === 'expired'
                  ? t('book.couponExpired')
                  : t('book.couponSoldOut')}
              </Alert>
            )}

            {visibleSummaryLines.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                {t('book.nothingSelected')}
              </Typography>
            ) : (
              visibleSummaryLines.map((line) => (
                <SummaryRow key={line.id} label={line.label} amount={displayAmount(line.price)} />
              ))
            )}

            <Divider sx={{ my: 1 }} />

            <SummaryRow label={t('book.subtotal')} amount={displayAmount(totals.subtotal)} />
            {activeCoupon && (
              <SummaryRow
                // Se distingue el tipo: "Descuento (20%)" vs "Descuento (importe fijo)"
                label={
                  activeCoupon.discountType === 'amount'
                    ? t('book.discountFixed')
                    : t('book.discountPercent', { percent: getCouponValue(activeCoupon) })
                }
                amount={`−${displayAmount(totals.discount || 0)}`}
                highlight
              />
            )}
            <SummaryRow label={t('book.taxes')} amount={displayAmount(totals.taxes)} />

            <Divider sx={{ my: 1 }} />

            <Stack
              direction="row"
              sx={{ justifyContent: 'space-between', alignItems: 'baseline', pt: 0.5 }}
            >
              <Typography sx={{ fontWeight: 'bold' }}>{t('book.total')}</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: BRAND.primary }}>
                {displayAmount(totals.total)}
              </Typography>
            </Stack>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              {t('book.totalNote')}
            </Typography>
          </Paper>

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

          {submitError && (
            <Alert severity="error" sx={{ mt: 2 }} onClose={() => setSubmitError(null)}>
              {submitError}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2, my: '20px' }}>
          <Button type="button" startIcon={<ArrowBackIcon />} variant="outlined" disableElevation
            onClick={() => navigate(-1)}
            sx={{ minWidth: '135px', whiteSpace: 'nowrap', px: 2, borderRadius: '8px', borderColor: BRAND.primary,
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

      <LoadingOverlay
        open={isSubmitting}
        message={t('book.creatingBooking')}
        onCancel={cancelSubmit}
      />
    </Box>
  );
}
