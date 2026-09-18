import { useEffect, useRef, useState } from 'react';
import { holdCoupon, releaseCoupon } from '../services/coupons/coupons';

interface CouponHoldState {
  /** true si este jugador tiene un cupo apartado. */
  held: boolean;
  /** Cupos libres restantes, o null si el cupón no tiene límite. */
  remaining: number | null;
  /** 'no_slots' cuando el cupón se agotó, 'expired' si ya no es vigente. */
  reason: string | null;
  loading: boolean;
}

/**
 * Aparta un cupo del cupón al entrar en la reserva y lo devuelve al salir.
 *
 * El cupo se libera al desmontar (navegar a otra vista, volver atrás). Si el
 * navegador se cierra de golpe no da tiempo a avisar, pero el backend caduca la
 * reserva a los 15 minutos, así que el cupo no se pierde.
 */
export const useCouponHold = (couponId?: string | null): CouponHoldState => {
  const [state, setState] = useState<CouponHoldState>({
    held: false,
    remaining: null,
    reason: null,
    loading: !!couponId,
  });

  // Evita liberar un cupo que nunca llegó a apartarse.
  const heldRef = useRef(false);

  useEffect(() => {
    if (!couponId) {
      setState({ held: false, remaining: null, reason: null, loading: false });
      return;
    }

    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true }));

    holdCoupon(couponId)
      .then((result) => {
        if (cancelled) {
          // El componente se desmontó mientras llegaba la respuesta: se devuelve ya.
          if (result.ok) releaseCoupon(couponId).catch(() => null);
          return;
        }
        heldRef.current = result.ok;
        setState({
          held: result.ok,
          remaining: result.remaining ?? null,
          reason: result.ok ? null : result.reason ?? 'no_slots',
          loading: false,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setState({ held: false, remaining: null, reason: 'error', loading: false });
      });

    return () => {
      cancelled = true;
      if (heldRef.current) {
        heldRef.current = false;
        releaseCoupon(couponId).catch(() => null);
      }
    };
  }, [couponId]);

  return state;
};
