import { Box, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { BRAND } from '../theme/colors';

/**
 * Todas las marcas que `CardElement` puede detectar (`event.brand`).
 *
 * Qué acepta REALMENTE la cuenta lo decide Stripe (Dashboard → Settings →
 * Payment methods → Cards), no este componente. Por eso se listan las comunes y,
 * si se detecta cualquier otra, se añade sobre la marcha: mostrar solo cuatro
 * haría creer que una JCB o una Diners no sirve cuando el cobro sí funcionaría.
 */
const BRAND_LABELS: Record<string, string> = {
  visa: 'VISA',
  mastercard: 'Mastercard',
  amex: 'AMEX',
  discover: 'Discover',
  diners: 'Diners Club',
  jcb: 'JCB',
  unionpay: 'UnionPay',
};

/** Las que se muestran siempre, por ser las de uso habitual. */
const COMMON_BRANDS = ['visa', 'mastercard', 'amex', 'discover'];

interface CardBrandsProps {
  /** Marca detectada por Stripe; 'unknown' mientras no haya número suficiente. */
  detected?: string;
  /** Texto sobre fondo oscuro (la tarjeta de pago es morada). */
  onDark?: boolean;
}

/**
 * Muestra qué tarjetas se aceptan y resalta la que Stripe detecta mientras el
 * usuario escribe. No es un selector: la marca la determina el número, no una
 * elección previa.
 */
export default function CardBrands({ detected, onDark = false }: CardBrandsProps) {
  const { t } = useTranslation();
  const hasDetection = !!detected && detected !== 'unknown';
  const baseColor = onDark ? BRAND.white : 'text.secondary';

  // Si se detecta una marca fuera de las habituales, se añade al listado en vez
  // de dejarla sin representar (y pareciendo rechazada).
  const brands = hasDetection && !COMMON_BRANDS.includes(detected as string)
    ? [...COMMON_BRANDS, detected as string]
    : COMMON_BRANDS;

  return (
    <Box sx={{ mt: 1 }}>
      <Typography
        variant="caption"
        sx={{ display: 'block', mb: 0.5, color: baseColor, opacity: 0.8 }}
      >
        {hasDetection ? t('payment.brandDetected') : t('payment.acceptedCards')}
      </Typography>

      <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap' }} useFlexGap>
        {brands.map((brandId) => {
          const isActive = detected === brandId;
          // Con marca detectada, las demás se atenúan para que destaque.
          const dimmed = hasDetection && !isActive;

          return (
            <Box
              key={brandId}
              aria-current={isActive ? 'true' : undefined}
              sx={{
                px: 1, py: 0.25,
                borderRadius: '6px',
                border: '1px solid',
                borderColor: isActive ? BRAND.green : onDark ? 'rgba(255,255,255,0.35)' : 'divider',
                bgcolor: isActive ? BRAND.green : 'transparent',
                color: isActive ? BRAND.navy : baseColor,
                fontSize: 11,
                fontWeight: 'bold',
                letterSpacing: 0.3,
                opacity: dimmed ? 0.35 : 1,
                transition: 'opacity .2s, background-color .2s, border-color .2s',
              }}
            >
              {BRAND_LABELS[brandId] ?? brandId}
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}
