import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCoupon } from '../services/coupons/coupons';

export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => deleteCoupon(id),
    // onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons'] }),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['coupons'] })
    },
    onError: (error) => console.error('Delete failed:', error),
  });

  const removeCoupon = (
    id: string,
    callbacks?: {
      onSuccess?: () => void;
      onError?: () => void;
    }) => {
    mutation.mutate(id, { onSuccess: () => callbacks?.onSuccess?.(), onError: () => callbacks?.onError?.() });
  };

  return { removeCoupon, isDeleting: mutation.isPending, error: mutation.error };
};