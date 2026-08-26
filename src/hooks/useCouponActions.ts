import { useState, useEffect, useCallback } from 'react';
import {
  getCoupon, getCoupons,
  createCoupon,
  updateCoupon,
} from '../services/coupons/coupons';
import type { CouponPayload, Discount } from '../types/getaway';

interface UseCouponActionsState {
  isLoading: boolean;
  error: string | null;
}

interface UseCouponActionsReturn extends UseCouponActionsState {
  create: (data: CouponPayload) => Promise<Discount | null>;
  update: (id: string, data: Partial<CouponPayload>) => Promise<Discount | null>;
  clearError: () => void;
}

// provisional hook, test (edit mode)
export function useCoupon(id?: string) {
  const [data, setData] = useState<Discount | null>(null);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (!id) return;
    getCoupon(id)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading };
}

export function useCoupons() {
  const [data, setData] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('useCoupons: fetching...');
    // getCoupons()
    //   .then(setData)
    //   .catch((err) => setError(err instanceof Error ? err.message : 'Error fetching coupons'))
    //   .finally(() => setLoading(false));
    getCoupons()
      .then((res) => {
        // console.log('getCoupons response:', res);
        // console.log('useCoupons: success', res.coupons);
        console.log('raw res:', res);
        console.log('res.coupons:', res.coupons);
        console.log('keys:', Object.keys(res));
        setData(res.coupons ?? []);
        // setData(res.coupons);
      })
      .catch((err) => {
        console.error('useCoupons: error', err);
        setError(err instanceof Error ? err.message : 'Error fetching coupons');
      })
      .finally(() => {
        console.log('useCoupons: done');
        setLoading(false);
      });
  }, []);
  return { data, loading, error };
}

/**
 * Hook: manage coupons(post, edit), with loading and error state.
 */
export function useCouponActions(): UseCouponActionsReturn {
  const [state, setState] = useState<UseCouponActionsState>({
    isLoading: false,
    error: null,
  });

  const withLoading = useCallback(
    async <T>(fn: () => Promise<T>, fallback: T): Promise<T> => {
      setState({ isLoading: true, error: null });
      try {
        return await fn();
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Unexpected error';
        setState((prev) => ({ ...prev, error }));
        if (process.env.NODE_ENV === 'development') {
          console.error('[useCouponActions]', error);
        }
        return fallback;
      } finally {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    []
  );

  const clearError = useCallback(
    () => {
      setState((prev) => ({ ...prev, error: null }));
    },
    []
  );

  const create = useCallback(
    (data: CouponPayload) =>
      withLoading(() => createCoupon(data), null),
    [withLoading]
  );

  const update = useCallback(
    (id: string, data: Partial<CouponPayload>) =>
      withLoading(() => updateCoupon(id, data), null),
    [withLoading]
  );

  return {
    ...state,
    create,
    update,
    clearError,
  };
}