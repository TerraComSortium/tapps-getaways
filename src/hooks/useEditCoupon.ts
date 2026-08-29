import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCoupon } from '../services/coupons/coupons';
import type { CouponPayload } from '../types/getaway';

export const useEditCoupon = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: { id: string; data: Partial<CouponPayload> }) =>
      updateCoupon(payload.id, payload.data),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
    onError: (error) => {
      console.error('Update failed:', error);
    },
  });

  const editCoupon = (
    id: string,
    data: Partial<CouponPayload>,
    callbacks?: {
      onSuccess?: () => void;
      onError?: () => void;
    }
  ) => {
    mutation.mutate(
      { id, data },
      {
        onSuccess: () => callbacks?.onSuccess?.(),
        onError: () => callbacks?.onError?.(),
      }
    );
  };

  return {
    editCoupon,
    isEditing: mutation.isPending,
    error: mutation.error,
  };
};