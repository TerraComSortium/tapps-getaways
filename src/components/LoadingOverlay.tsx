import { useEffect } from 'react';
import { Backdrop, Box, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { BRAND } from '../theme/colors';

interface LoadingOverlayProps {
  open: boolean;
  /** Texto principal; si falta, solo se muestra el spinner. */
  message?: string;
  /**
   * Si se pasa, se puede cancelar con Escape y se muestra la pista al usuario.
   * Sin `onCancel` el overlay es una espera bloqueante sin salida.
   */
  onCancel?: () => void;
}

/**
 * Cortina de espera para operaciones que tardan y no deben repetirse por
 * impaciencia (crear una reserva, cobrar). Bloquea la interacción mientras dura.
 */
export default function LoadingOverlay({ open, message, onCancel }: LoadingOverlayProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!open || !onCancel) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel]);

  return (
    <Backdrop
      open={open}
      // por encima del modal para que nada quede clicable detrás
      sx={{ zIndex: (theme) => theme.zIndex.modal + 1, color: BRAND.white }}
    >
      <Box sx={{ textAlign: 'center', px: 3 }}>
        <CircularProgress color="inherit" />
        {message && (
          <Typography sx={{ mt: 2, fontWeight: 'bold' }}>{message}</Typography>
        )}
        {onCancel && (
          <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.85 }}>
            {t('common.pressEscToCancel')}
          </Typography>
        )}
      </Box>
    </Backdrop>
  );
}
