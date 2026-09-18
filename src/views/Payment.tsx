import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Container, Box, Stack,
  Divider, Typography, Button, Alert, CircularProgress,
  Checkbox, FormControlLabel, Radio, RadioGroup,
} from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import '../App.css';

import { processPayment, confirmPayment } from '../services/payment/payment';
import { listSavedCards, type SavedCard } from '../services/payment/paymentMethods';
import { ROUTES } from '../constants/routes';
import { BRAND } from '../theme/colors';
import { useSidebar } from '../contexts/SidebarContext';
import CardBrands from '../components/CardBrands';
import { useOrderById } from '../hooks/useOrderById';

const NEW_CARD = 'new';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

// Códigos de error de tarjeta accionables por el usuario (el texto vive en i18n:
// payment.card.<code>).
const CARD_ERROR_CODES = new Set([
  'card_declined',
  'insufficient_funds',
  'incorrect_cvc',
  'incorrect_number',
  'expired_card',
  'processing_error',
]);

const SAFE_BACKEND_CODES = new Set([
  'amount_mismatch',
  'order_not_found',
  'order_already_paid',
  'invalid_order_amount',
]);

function getFriendlyPaymentError(e: any, t: TFunction): string {
  const data = e?.response?.data;

  if (data) {
    const code: string | undefined = data.code || data.declineCode;
    if (code && CARD_ERROR_CODES.has(code)) return t(`payment.card.${code}`);

    if (code && SAFE_BACKEND_CODES.has(code) && typeof data.error === 'string') return data.error;

    if (data.type === 'StripeCardError' && typeof data.error === 'string') return data.error;
    return t('payment.genericError');
  }

  if (e?.code && CARD_ERROR_CODES.has(e.code)) return t(`payment.card.${e.code}`);
  if (e?.type === 'validation_error' && typeof e?.message === 'string') return e.message;

  return t('payment.genericError');
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#1a1a1a',
      fontSize: '16px',
      fontFamily: 'inherit',
      '::placeholder': { color: '#9e9e9e' },
    },
    invalid: { color: '#d32f2f' },
  },
};

function CheckoutForm({ orderId, amount, user }: { orderId: string; amount: number; user: any }) {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const { setLocked } = useSidebar();

  useEffect(() => {
    setLocked(processing);

    if (!processing) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);

    return () => window.removeEventListener('beforeunload', warn);
  }, [processing, setLocked]);

  useEffect(() => () => setLocked(false), [setLocked]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>(NEW_CARD); // pm_id | 'new'
  const [saveCard, setSaveCard] = useState(false);

  const [cardBrand, setCardBrand] = useState<string>('unknown');

  useEffect(() => {
    listSavedCards()
      .then((cards) => {
        setSavedCards(cards);
        if (cards.length > 0) setSelectedMethod(cards[0].id);
      })
      .catch((e) => console.warn('[STRIPE] No se pudieron cargar tarjetas guardadas:', e));
  }, []);

  const usingNewCard = selectedMethod === NEW_CARD;

  const handleConfirm = async () => {
    if (!stripe) return; // Stripe.js aún no cargó

    setProcessing(true);
    setErrorMsg(null);

    try {
      let paymentMethodId: string;

      if (usingNewCard) {
        // 1a. Tarjeta nueva → tokenizar con Stripe Elements
        if (!elements) return;
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) return;
        console.log('%c[STRIPE] Paso 1 — createPaymentMethod (tarjeta nueva)', 'color:#5B2BD6;font-weight:bold');
        const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
          billing_details: { name: user?.name || '', email: user?.email || '' },
        });
        if (pmError) {
          console.error('[STRIPE] error createPaymentMethod:', pmError);
          throw pmError; // conserva code/type para el mensaje amigable
        }
        paymentMethodId = paymentMethod!.id;
      } else {
        // 1b. Tarjeta guardada → se usa su pm_id directamente
        console.log('%c[STRIPE] Paso 1 — usando tarjeta guardada', 'color:#5B2BD6;font-weight:bold', selectedMethod);
        paymentMethodId = selectedMethod;
      }

      const paymentPayload = {
        orderId,
        paymentMethodId,
        amount,
        currency: 'usd',
        saveCard: usingNewCard ? saveCard : false,
      };
      console.log('%c[STRIPE] Paso 2 — POST /payment (enviando)', 'color:#5B2BD6;font-weight:bold', paymentPayload);
      let payRes = await processPayment(paymentPayload);
      console.log('%c[STRIPE] Paso 2 — /payment OK (respuesta)', 'color:#00A36C;font-weight:bold', payRes);

      if (payRes?.requiresAction && payRes?.clientSecret) {
        console.log('%c[STRIPE] Paso 3 — requiere 3D Secure, confirmCardPayment...', 'color:#E69500;font-weight:bold');
        const { error: confirmError } = await stripe.confirmCardPayment(payRes.clientSecret);
        if (confirmError) {
          console.error('[STRIPE] error 3DS:', confirmError);
          throw new Error(confirmError.message);
        }

        console.log('%c[STRIPE] Paso 3b — 3DS OK, POST /payment/confirm...', 'color:#E69500;font-weight:bold');
        payRes = await confirmPayment(orderId);
        console.log('%c[STRIPE] Paso 3b — /payment/confirm OK', 'color:#00A36C;font-weight:bold', payRes);
      }

      localStorage.removeItem('selectedData');
      navigate(ROUTES.PAID, {
        state: {
          paymentResult: {
            success: payRes?.success ?? true,
            orderId: payRes?.orderId ?? orderId,
            paymentStatus: payRes?.paymentStatus,
            invoiceNumber: payRes?.invoiceNumber,
            requiresAction: false,
          },
        },
      });
    } catch (e: any) {
      console.error('[STRIPE] ❌ Error en el flujo de pago:', {
        message: e?.message,
        code: e?.code,
        type: e?.type,
        status: e?.response?.status,
        backendError: e?.response?.data,
      });
      setErrorMsg(getFriendlyPaymentError(e, t));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Card
        sx={{
          m: 2,
          width: 340,
          height: 214,
          maxWidth: '90vw',
          borderRadius: '16px',
          color: BRAND.white,
          background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.purpleBg} 60%, ${BRAND.primaryLight} 100%)`,
          boxShadow: '0 10px 25px rgba(0,0,0,0.35)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{
          position: 'absolute', top: -60, right: -40,
          width: 160, height: 160, borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.08)',
        }} />
        <CardContent sx={{ height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', p: 2.25, '&:last-child': { pb: 2.25 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{
              width: 44, height: 32, borderRadius: '6px',
              background: 'linear-gradient(135deg, #f7d774, #d4af37)',
            }} />
            <Typography sx={{ fontWeight: 'bold', fontStyle: 'italic', letterSpacing: 1 }}>
              Racquets!™
            </Typography>
          </Box>
          <Typography sx={{
            fontFamily: 'monospace',
            fontSize: 'clamp(1rem, 4.5vw, 1.25rem)',
            letterSpacing: 1.5,
            whiteSpace: 'nowrap',
            textAlign: 'center',
          }}>
            ••••&nbsp;••••&nbsp;••••&nbsp;0000
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <Box>
              <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', lineHeight: 1 }}>
                {t('payment.cardholder')}
              </Typography>
              <Typography sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                {user?.name || t('payment.playerName')}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', lineHeight: 1 }}>
                {t('payment.expires')}
              </Typography>
              <Typography sx={{ fontWeight: 'bold' }}>••/••</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Selector de método de pago: tarjetas guardadas + tarjeta nueva */}
      <Box sx={{ width: 340, maxWidth: '90vw', mb: 1 }}>
        <Typography variant="caption" sx={{ color: BRAND.white, display: 'block', mb: 0.5, fontWeight: 'bold' }}>
          {t('payment.methodLabel')}
        </Typography>
        <RadioGroup
          value={selectedMethod}
          onChange={(e) => setSelectedMethod(e.target.value)}
        >
          {savedCards.map((c) => (
            <FormControlLabel
              key={c.id}
              value={c.id}
              control={<Radio size="small" sx={{ color: BRAND.white, '&.Mui-checked': { color: BRAND.green } }} />}
              label={
                <Typography variant="body2" sx={{ color: BRAND.white }}>
                  {(c.brand || 'card').toUpperCase()} •••• {c.last4} — {String(c.expMonth).padStart(2, '0')}/{c.expYear}
                </Typography>
              }
            />
          ))}
          <FormControlLabel
            value={NEW_CARD}
            control={<Radio size="small" sx={{ color: BRAND.white, '&.Mui-checked': { color: BRAND.green } }} />}
            label={<Typography variant="body2" sx={{ color: BRAND.white }}>{t('payment.useNewCard')}</Typography>}
          />
        </RadioGroup>

        {/* Campo real de tarjeta (solo si se eligió tarjeta nueva) */}
        {usingNewCard && (
          <>
            <Box sx={{ bgcolor: BRAND.white, borderRadius: '8px', p: 1.5, mt: 0.5 }}>
              <CardElement
                options={CARD_ELEMENT_OPTIONS}
                onChange={(event) => setCardBrand(event.brand)}
              />
            </Box>

            {/* Marcas aceptadas; la detectada se resalta al teclear. */}
            <CardBrands detected={cardBrand} onDark />
            <FormControlLabel
              sx={{ mt: 0.5 }}
              control={
                <Checkbox
                  size="small"
                  checked={saveCard}
                  onChange={(e) => setSaveCard(e.target.checked)}
                  sx={{ color: BRAND.white, '&.Mui-checked': { color: BRAND.green } }}
                />
              }
              label={
                <Typography variant="caption" sx={{ color: BRAND.white }}>
                  {t('payment.saveCard')}
                </Typography>
              }
            />
          </>
        )}
      </Box>

      {errorMsg && (
        <Alert severity="error" sx={{ width: 340, maxWidth: '90vw', mt: 1 }}>{errorMsg}</Alert>
      )}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2, mt: 1.5, mb: 1 }}>
        <Button
          onClick={() => navigate(-1)}
          startIcon={<ArrowBackIcon />} type="button" variant="contained" disableElevation
          disabled={processing}
          sx={{
            minWidth: 130,
            borderRadius: '8px',
            bgcolor: BRAND.white, color: BRAND.primary,
            fontWeight: 'medium', textTransform: 'none',
            ':hover': { bgcolor: BRAND.primary, color: BRAND.white },
          }}
        >{t('payment.retry')}</Button>
        <Button
          onClick={handleConfirm}
          startIcon={processing ? <CircularProgress size={18} sx={{ color: BRAND.white }} /> : <CreditCardIcon />}
          variant="contained"
          disabled={!stripe || processing}
          sx={{
            minWidth: 160,
            bgcolor: BRAND.primary, color: BRAND.white,
            fontWeight: 'bold', textTransform: 'none',
            borderRadius: '8px', borderColor: 'primary.main', border: 1,
            ':hover': { bgcolor: BRAND.white, color: BRAND.primary },
          }}
        >{processing ? t('payment.processing') : t('payment.confirm')}</Button>
      </Box>
    </Box>
  );
}

function Payment() {
  const { t } = useTranslation();
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();

  // Fuente de verdad: la orden del backend, identificada por la URL.
  const { data: order, loading: loadingOrder, error: orderError } = useOrderById(orderId);

  /**
   * Datos locales SOLO como pintado inmediato mientras llega la orden, y solo si
   * son de ESTA orden. Antes se usaba `localStorage['selectedData']` sin
   * comprobar el id, así que abrir /payment/ORDEN_A con los datos de ORDEN_B en
   * localStorage mostraba un resumen y cobraba otro.
   */
  const placeholder = useMemo(() => {
    const fromState = location.state?.dataForPayment;
    if (fromState?.orderId === orderId) return fromState;

    try {
      const stored = JSON.parse(localStorage.getItem('selectedData') || '{}');
      return stored?.orderId === orderId ? stored : null;
    } catch {
      // JSON corrupto: antes reventaba la vista con un SyntaxError sin capturar
      return null;
    }
  }, [location.state, orderId]);

  const orderData = useMemo(() => {
    if (!order) return placeholder ?? {};

    // El backend adjunta los datos del getaway a la orden, así que el resumen se
    // pinta igual aunque se recargue o se entre desde otro dispositivo.
    const getaway = order.getaway as
      | { title?: string; address?: string; startDate?: string; endDate?: string }
      | null;

    const dates = getaway && (getaway.startDate || getaway.endDate)
      ? [getaway.startDate, getaway.endDate]
          .filter(Boolean)
          .map((value) => new Date(value as string).toLocaleDateString())
          .join(' - ')
      : undefined;

    return {
      ...placeholder,
      ...(order.reservation as Record<string, unknown>),
      orderId: (order.orderId as string) ?? orderId,
      getawayTitle: getaway?.title || placeholder?.getawayTitle,
      getawayAddress: getaway?.address || placeholder?.getawayAddress,
      getawayDates: dates || placeholder?.getawayDates,
    };
  }, [order, placeholder, orderId]);

  const paymentDetails = orderData?.paymentDetails || {};
  const lodgingOption = orderData?.lodgingOption || {};
  const optionalAddOns = orderData?.optionalAddOns || [];
  // Actividades incluidas (academia, torneos, ladders): el backend guarda el
  // desglose en la orden para que aquí se vea lo mismo que en la reserva.
  const scheduleItems = orderData?.scheduleItems || [];
  // Cupón aplicado por el backend (no el que pidió el cliente).
  const appliedCoupon = orderData?.coupon as
    | { title?: string; discountType?: string; value?: number }
    | undefined;
  const user = orderData?.user || {};
  const getawayTitle = orderData?.getawayTitle || t('payment.unavailableName');
  const getawayAddress = orderData?.getawayAddress || t('payment.unavailableAddress');
  const getawayDates = orderData?.getawayDates || t('payment.unavailableDates');

  // Monto numérico para Stripe (paymentDetails.Total viene como "X.XX USD")
  const numericTotal = parseFloat((paymentDetails.Total || '0').replace('USD', ''));
  const resolvedOrderId = orderId || orderData.orderId || '';

  const alreadyPaid = order?.status === 'paid';

  // Mientras llega la orden se pinta el placeholder si lo hay; si no, un spinner.
  if (loadingOrder && !placeholder) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  /**
   * Antes esto era un `navigate(ROUTES.GETAWAYS, { replace: true })` silencioso:
   * el usuario pulsaba pagar y aparecía en el listado sin saber por qué.
   */
  if (orderError || (!loadingOrder && !paymentDetails?.Total)) {
    return (
      <Box sx={{ maxWidth: 560, mx: 'auto', p: 3 }}>
        <Alert severity={orderError === 'forbidden' ? 'error' : 'warning'}>
          {orderError === 'not_found'
            ? t('payment.orderNotFound')
            : orderError === 'forbidden'
              ? t('payment.orderForbidden')
              : t('payment.orderUnavailable')}
        </Alert>
        <Button
          component={RouterLink} to={ROUTES.MY_ORDERS}
          variant="contained"
          sx={{ mt: 2, borderRadius: '8px', textTransform: 'none', bgcolor: BRAND.primary }}
        >
          {t('paid.viewBookings')}
        </Button>
      </Box>
    );
  }

  // Una orden ya pagada no se vuelve a cobrar: el backend lo rechaza con
  // `order_already_paid`, pero es mejor no dejar siquiera intentarlo.
  if (alreadyPaid) {
    return (
      <Box sx={{ maxWidth: 560, mx: 'auto', p: 3 }}>
        <Alert severity="success">{t('payment.orderAlreadyPaid')}</Alert>
        <Button
          component={RouterLink} to={ROUTES.MY_ORDERS}
          variant="contained"
          sx={{ mt: 2, borderRadius: '8px', textTransform: 'none', bgcolor: BRAND.primary }}
        >
          {t('paid.viewBookings')}
        </Button>
      </Box>
    );
  }

  return (
    <>
      <div className="background-blueCourt"></div>
      <Container
        sx={{
          pt: 3, pb: 3,
          width: { xs: '100%', sm: '90%', md: '75%' },
          display: 'flex', flexDirection: 'column', position: 'relative',
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            pt: 5,
            padding: '16px',
            alignItems: 'center', justifyContent: 'center',
            bgcolor: BRAND.purpleBg, borderRadius: '8px',
          }}
        >
          <Typography
            component="h3"
            variant="body1" sx={{ mt: 4, color: BRAND.white, fontWeight: 'semibold', textAlign: 'center' }}>
            {t('payment.orderSummary')}
          </Typography>
          <Box sx={{ px: { xs: 2, sm: 4 }, pb: 3 }}>
            {/* Encabezado del getaway */}
            <Box sx={{ color: BRAND.white, mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{getawayTitle}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>📍 {getawayAddress}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>🗓️ {getawayDates}</Typography>
            </Box>

            {/* Detalle de la reserva */}
            <Box
              sx={{
                bgcolor: 'rgba(255,255,255,0.08)',
                borderRadius: '10px',
                p: 2,
                color: BRAND.white,
              }}
            >
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="caption" sx={{ color: BRAND.green, fontWeight: 'bold', letterSpacing: 0.5 }}>
                  {t('payment.lodging')}
                </Typography>
                <Typography variant="body2">
                  {lodgingOption.option ? `${lodgingOption.option} - $${lodgingOption.price}` : '—'}
                </Typography>
              </Box>

              <Box sx={{ mb: 1.5 }}>
                <Typography variant="caption" sx={{ color: BRAND.green, fontWeight: 'bold', letterSpacing: 0.5 }}>
                  {t('payment.addons')}
                </Typography>
                {optionalAddOns.length > 0 ? (
                  optionalAddOns.map((addon: any, index: number) => (
                    <Typography key={index} variant="body2">• {addon.addonName} - ${addon.price} USD</Typography>
                  ))
                ) : (
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>{t('payment.none')}</Typography>
                )}
              </Box>

              {scheduleItems.length > 0 && (
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: BRAND.green, fontWeight: 'bold', letterSpacing: 0.5 }}>
                    {t('payment.activities')}
                  </Typography>
                  {scheduleItems.map((item: { id: string; name: string; price: number }, index: number) => (
                    <Typography key={item.id || index} variant="body2">
                      • {item.name} - ${item.price} USD
                    </Typography>
                  ))}
                </Box>
              )}

              <Divider sx={{ borderColor: 'rgba(255,255,255,0.25)', my: 1.5 }} />

              {/* Desglose de precios */}
              <Stack spacing={0.75}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ opacity: 0.85 }}>{t('payment.subtotal')}</Typography>
                  <Typography variant="body2">{paymentDetails.Subtotal}</Typography>
                </Box>
                {paymentDetails.Discount && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: BRAND.green, fontWeight: 'bold' }}>
                      {appliedCoupon?.discountType === 'amount'
                        ? t('book.discountFixed')
                        : t('book.discountPercent', { percent: appliedCoupon?.value ?? 0 })}
                      {appliedCoupon?.title ? ` · ${appliedCoupon.title}` : ''}
                    </Typography>
                    <Typography variant="body2" sx={{ color: BRAND.green, fontWeight: 'bold' }}>
                      −{paymentDetails.Discount}
                    </Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ opacity: 0.85 }}>{t('payment.taxes')}</Typography>
                  <Typography variant="body2">{paymentDetails.Taxes}</Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    mt: 0.5, pt: 1.25, borderTop: '1px solid rgba(255,255,255,0.25)',
                  }}
                >
                  <Typography sx={{ fontWeight: 'bold' }}>{t('payment.total')}</Typography>
                  <Typography sx={{ fontWeight: 'bold', color: BRAND.green, fontSize: '1.15rem' }}>
                    {paymentDetails.Total}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Box>
          <Divider aria-hidden="true" sx={{ borderColor: BRAND.white, borderStyle: 'dashed' }} />
          <Stack sx={{ fontSize: 15, ml: 2, color: BRAND.white, p: 3, pb: 0 }}>
            <Typography sx={{ color: BRAND.white, textDecoration: 'none' }}>
              {t('payment.fromAccount')}
            </Typography>
          </Stack>

          {/* Formulario de pago real con Stripe Elements */}
          <Elements stripe={stripePromise}>
            <CheckoutForm orderId={resolvedOrderId} amount={numericTotal} user={user} />
          </Elements>
        </Box>
      </Container>
    </>
  );
}
export default Payment;
