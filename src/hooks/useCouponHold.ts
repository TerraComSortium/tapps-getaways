import { useEffect, useState } from 'react';
import { holdCoupon } from '../services/coupons/coupons';

interface CouponHoldState {
  /** true si este jugador tiene un cupo apartado. */
  held: boolean;
  /** Cupos libres restantes, o null si el cupón no tiene límite. */
  remaining: number | null;
  /** 'no_slots' cuando el cupón se agotó, 'expired' si ya no es vigente. */
  reason: string | null;
  /** Momento en que caduca la reserva, para poder mostrar el tiempo restante. */
  expiresAt: string | null;
  loading: boolean;
}

/**
 * Aparta un cupo del cupón al entrar en la reserva.
 *
 * NO se libera al salir de la vista, y es deliberado: el cupo queda reservado
 * para este jugador durante los 15 minutos del TTL. Si sale y vuelve —botón
 * atrás, cerrar y reabrir, mirar el detalle y regresar— **sigue siendo suyo**:
 * al reentrar, `holdCoupon` reconoce su reserva y la refresca sin consumir otra.
 *
 * El cupo se recupera solo de dos formas: caducando (no pagó) o convirtiéndose
 * en uso definitivo (pagó, ver `consumeCoupon` en el backend).
 */
export const useCouponHold = (couponId?: string | null): CouponHoldState => {
  const [state, setState] = useState<CouponHoldState>({
    held: false,
    remaining: null,
    reason: null,
    expiresAt: null,
    loading: !!couponId,
  });

  useEffect(() => {
    if (!couponId) {
      setState({ held: false, remaining: null, reason: null, expiresAt: null, loading: false });
      return;
    }

    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true }));

    holdCoupon(couponId)
      .then((result) => {
        if (cancelled) return;
        setState({
          held: result.ok,
          remaining: result.remaining ?? null,
          reason: result.ok ? null : result.reason ?? 'no_slots',
          expiresAt: (result as { expiresAt?: string }).expiresAt ?? null,
          loading: false,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setState({ held: false, remaining: null, reason: 'error', expiresAt: null, loading: false });
      });

    return () => { cancelled = true; };
  }, [couponId]);

  return state;
};
