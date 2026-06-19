import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
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
import '../App.css';

import { processPayment } from '../services/payment/payment';
import { listSavedCards, type SavedCard } from '../services/payment/paymentMethods';

const NEW_CARD = 'new';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

// Mensaje genérico cuando el fallo es del sistema (clave de Stripe vencida/sin
// permisos, backend caído, red, etc.): el usuario no debe ver el detalle técnico,
// solo saber que debe reportarlo. El detalle real queda en la consola para revisión.
const GENERIC_PAYMENT_ERROR =
  'No pudimos procesar tu pago en este momento. No se realizó ningún cargo. ' +
  'Por favor inténtalo más tarde o comunícate con el administrador de la aplicación.';

// Errores de tarjeta accionables por el usuario (mapeados a un texto claro).
const CARD_ERROR_MESSAGES: Record<string, string> = {
  card_declined: 'Tu tarjeta fue rechazada. Intenta con otra tarjeta.',
  insufficient_funds: 'La tarjeta no tiene fondos suficientes.',
  incorrect_cvc: 'El código de seguridad (CVC) es incorrecto.',
  incorrect_number: 'El número de tarjeta es incorrecto.',
  expired_card: 'La tarjeta está vencida.',
  processing_error: 'Hubo un problema al procesar la tarjeta. Inténtalo de nuevo.',
};

// Códigos de error que genera nuestro propio backend (no Stripe): su mensaje es
// seguro y entendible, así que se muestra tal cual al usuario.
const SAFE_BACKEND_CODES = new Set([
  'amount_mismatch',
  'order_not_found',
  'order_already_paid',
  'invalid_order_amount',
]);

/**
 * Traduce cualquier error del flujo de pago a un mensaje seguro para el usuario.
 * - Errores de tarjeta (rechazo, CVC, fondos…) → mensaje específico y accionable.
 * - Errores de validación de Stripe.js (tarjeta incompleta) → su mensaje, ya es claro.
 * - Cualquier otro (config/sistema) → mensaje genérico para contactar al administrador.
 */
function getFriendlyPaymentError(e: any): string {
  const data = e?.response?.data;

  // Error proveniente del backend (POST /payment)
  if (data) {
    const code: string | undefined = data.code || data.declineCode;
    if (code && CARD_ERROR_MESSAGES[code]) return CARD_ERROR_MESSAGES[code];
    // Errores de validación que genera nuestro propio backend (monto no coincide,
    // orden no encontrada / ya pagada): el mensaje es seguro y claro → se muestra tal cual.
    if (code && SAFE_BACKEND_CODES.has(code) && typeof data.error === 'string') return data.error;
    // El backend marca los errores de tarjeta con type StripeCardError y nos manda
    // un mensaje seguro en data.error. El resto se oculta tras el genérico.
    if (data.type === 'StripeCardError' && typeof data.error === 'string') return data.error;
    return GENERIC_PAYMENT_ERROR;
  }

  // Error de Stripe.js en el navegador (createPaymentMethod): validación de tarjeta.
  if (e?.code && CARD_ERROR_MESSAGES[e.code]) return CARD_ERROR_MESSAGES[e.code];
  if (e?.type === 'validation_error' && typeof e?.message === 'string') return e.message;

  return GENERIC_PAYMENT_ERROR;
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

// Formulario de pago — debe vivir dentro de <Elements> para usar los hooks de Stripe.
// La orden ya fue creada en BookGetaway2 (orderId viene por la URL), así que aquí
// solo se cobra la tarjeta real con ese orderId.
function CheckoutForm({ orderId, amount, user }: { orderId: string; amount: number; user: any }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Tarjetas guardadas del usuario
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>(NEW_CARD); // pm_id | 'new'
  const [saveCard, setSaveCard] = useState(false);

  useEffect(() => {
    listSavedCards()
      .then((cards) => {
        setSavedCards(cards);
        // Si hay tarjetas guardadas, preseleccionar la primera; si no, tarjeta nueva.
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

      // 2. Procesar el pago en el backend. saveCard solo aplica a tarjeta nueva.
      const paymentPayload = {
        orderId,
        paymentMethodId,
        amount,
        currency: 'usd',
        saveCard: usingNewCard ? saveCard : false,
      };
      console.log('%c[STRIPE] Paso 2 — POST /payment (enviando)', 'color:#5B2BD6;font-weight:bold', paymentPayload);
      const payRes = await processPayment(paymentPayload);
      console.log('%c[STRIPE] Paso 2 — /payment OK (respuesta)', 'color:#00A36C;font-weight:bold', payRes);

      // 3. 3D Secure — si la tarjeta requiere autenticación adicional
      if (payRes?.requiresAction && payRes?.clientSecret) {
        console.log('%c[STRIPE] Paso 3 — requiere 3D Secure, confirmCardPayment...', 'color:#E69500;font-weight:bold');
        const { error: confirmError } = await stripe.confirmCardPayment(payRes.clientSecret);
        if (confirmError) {
          console.error('[STRIPE] error 3DS:', confirmError);
          throw new Error(confirmError.message);
        }
        // TODO(backend): tras 3DS el backend no marca la orden como 'paid'
        // (no hay webhook ni endpoint de confirmación). Pendiente de resolver en backend.
      }

      // 4. Éxito → navegar a /paid con el paymentResult que espera la vista Paid
      localStorage.removeItem('selectedData');
      navigate('/paid', {
        state: {
          paymentResult: {
            success: payRes?.success ?? true,
            orderId: payRes?.orderId ?? orderId,
            paymentStatus: payRes?.paymentStatus,
            requiresAction: payRes?.requiresAction,
            clientSecret: payRes?.clientSecret,
          },
        },
      });
    } catch (e: any) {
      // El detalle técnico completo queda en la consola para revisión (no se muestra al usuario).
      console.error('[STRIPE] ❌ Error en el flujo de pago:', {
        message: e?.message,
        code: e?.code,
        type: e?.type,
        status: e?.response?.status,
        backendError: e?.response?.data,
      });
      // Al usuario solo se le muestra un mensaje amable (tarjeta accionable o genérico).
      setErrorMsg(getFriendlyPaymentError(e));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {/* Tarjeta decorativa */}
      <Card
        sx={{
          m: 2,
          width: 340,
          height: 214,
          maxWidth: '90vw',
          borderRadius: '16px',
          color: '#fff',
          background: 'linear-gradient(135deg, #3C1C91 0%, #371984 60%, #5B2BD6 100%)',
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
                CARDHOLDER
              </Typography>
              <Typography sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                {user?.name || 'Player Name'}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', lineHeight: 1 }}>
                EXPIRES
              </Typography>
              <Typography sx={{ fontWeight: 'bold' }}>••/••</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Selector de método de pago: tarjetas guardadas + tarjeta nueva */}
      <Box sx={{ width: 340, maxWidth: '90vw', mb: 1 }}>
        <Typography variant="caption" sx={{ color: '#fff', display: 'block', mb: 0.5, fontWeight: 'bold' }}>
          Payment method
        </Typography>
        <RadioGroup
          value={selectedMethod}
          onChange={(e) => setSelectedMethod(e.target.value)}
        >
          {savedCards.map((c) => (
            <FormControlLabel
              key={c.id}
              value={c.id}
              control={<Radio size="small" sx={{ color: '#fff', '&.Mui-checked': { color: '#00E392' } }} />}
              label={
                <Typography variant="body2" sx={{ color: '#fff' }}>
                  {(c.brand || 'card').toUpperCase()} •••• {c.last4} — {String(c.expMonth).padStart(2, '0')}/{c.expYear}
                </Typography>
              }
            />
          ))}
          <FormControlLabel
            value={NEW_CARD}
            control={<Radio size="small" sx={{ color: '#fff', '&.Mui-checked': { color: '#00E392' } }} />}
            label={<Typography variant="body2" sx={{ color: '#fff' }}>Use a new card</Typography>}
          />
        </RadioGroup>

        {/* Campo real de tarjeta (solo si se eligió tarjeta nueva) */}
        {usingNewCard && (
          <>
            <Box sx={{ bgcolor: '#fff', borderRadius: '8px', p: 1.5, mt: 0.5 }}>
              <CardElement options={CARD_ELEMENT_OPTIONS} />
            </Box>
            <FormControlLabel
              sx={{ mt: 0.5 }}
              control={
                <Checkbox
                  size="small"
                  checked={saveCard}
                  onChange={(e) => setSaveCard(e.target.checked)}
                  sx={{ color: '#fff', '&.Mui-checked': { color: '#00E392' } }}
                />
              }
              label={
                <Typography variant="caption" sx={{ color: '#fff' }}>
                  Guardar esta tarjeta para futuros pagos
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
            bgcolor: '#FFF', color: '#3C1C91',
            fontWeight: 'medium', textTransform: 'none',
            ':hover': { bgcolor: '#3C1C91', color: 'white' },
          }}
        >Retry</Button>
        <Button
          onClick={handleConfirm}
          startIcon={processing ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <CreditCardIcon />}
          variant="contained"
          disabled={!stripe || processing}
          sx={{
            minWidth: 160,
            bgcolor: '#3C1C91', color: '#FFF',
            fontWeight: 'bold', textTransform: 'none',
            borderRadius: '8px', borderColor: 'primary.main', border: 1,
            ':hover': { bgcolor: 'white', color: '#3C1C91' },
          }}
        >{processing ? 'Processing…' : 'Confirm payment'}</Button>
      </Box>
    </Box>
  );
}

function Payment() {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();

  const orderData = location.state?.dataForPayment || JSON.parse(localStorage.getItem('selectedData') || '{}');

  const paymentDetails = orderData?.paymentDetails || {};
  const lodgingOption = orderData?.lodgingOption || {};
  const optionalAddOns = orderData?.optionalAddOns || [];
  const user = orderData?.user || {};
  const getawayTitle = orderData?.getawayTitle || "Unavailable getaway name";
  const getawayAddress = orderData?.getawayAddress || "Unavailable address";
  const getawayDates = orderData?.getawayDates || "Unavailable dates";

  // Monto numérico para Stripe (paymentDetails.Total viene como "X.XX USD")
  const numericTotal = parseFloat((paymentDetails.Total || '0').replace('USD', ''));
  const resolvedOrderId = orderId || orderData.orderId || '';

  useEffect(() => {
    if (!paymentDetails?.Total) {
      navigate('/getaways', { replace: true });
    }
  }, [paymentDetails, navigate]);

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
            bgcolor: '#371984', borderRadius: '8px',
          }}
        >
          <Typography
            component="h3"
            variant="body1" sx={{ mt: 4, color: '#fff', fontWeight: 'semibold', textAlign: 'center' }}>
            Order summary
          </Typography>
          <Box sx={{ px: { xs: 2, sm: 4 }, pb: 3 }}>
            {/* Encabezado del getaway */}
            <Box sx={{ color: '#fff', mb: 2 }}>
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
                color: '#fff',
              }}
            >
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="caption" sx={{ color: '#00E392', fontWeight: 'bold', letterSpacing: 0.5 }}>
                  LODGING
                </Typography>
                <Typography variant="body2">
                  {lodgingOption.option ? `${lodgingOption.option} - $${lodgingOption.price}` : '—'}
                </Typography>
              </Box>

              <Box sx={{ mb: 1.5 }}>
                <Typography variant="caption" sx={{ color: '#00E392', fontWeight: 'bold', letterSpacing: 0.5 }}>
                  ADD-ONS
                </Typography>
                {optionalAddOns.length > 0 ? (
                  optionalAddOns.map((addon: any, index: number) => (
                    <Typography key={index} variant="body2">• {addon.addonName} - ${addon.price} USD</Typography>
                  ))
                ) : (
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>None</Typography>
                )}
              </Box>

              <Divider sx={{ borderColor: 'rgba(255,255,255,0.25)', my: 1.5 }} />

              {/* Desglose de precios */}
              <Stack spacing={0.75}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ opacity: 0.85 }}>Subtotal</Typography>
                  <Typography variant="body2">{paymentDetails.Subtotal}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ opacity: 0.85 }}>Taxes</Typography>
                  <Typography variant="body2">{paymentDetails.Taxes}</Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    mt: 0.5, pt: 1.25, borderTop: '1px solid rgba(255,255,255,0.25)',
                  }}
                >
                  <Typography sx={{ fontWeight: 'bold' }}>Total</Typography>
                  <Typography sx={{ fontWeight: 'bold', color: '#00E392', fontSize: '1.15rem' }}>
                    {paymentDetails.Total}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Box>
          <Divider aria-hidden="true" sx={{ borderColor: 'white', borderStyle: 'dashed' }} />
          <Stack sx={{ fontSize: 15, ml: 2, color: '#fff', p: 3, pb: 0 }}>
            <Typography sx={{ color: '#fff', textDecoration: 'none' }}>
              The payment will be submitted from your Racquets!™ account:
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
