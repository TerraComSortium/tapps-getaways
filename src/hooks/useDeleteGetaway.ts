import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteGetaway } from '../services/getaways/getaways';

export const useDeleteGetaway = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (id: string) => deleteGetaway(id),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey:['getaways']});
    },

    onError: (error) => {
      console.error("Error: Failed to delete the offer", error);
    }
  });

  const removeGetaway = (
    id:string, callbacks?: {
      onSuccess?: ()=>void;
      onError?:()=>void
    }
  ) => {
    mutation.mutate(id, {
      onSuccess: () => {
        if (callbacks?.onSuccess) callbacks.onSuccess();
      },
      onError: () => {
        if (callbacks?.onError) callbacks.onError();
      }
    });
  };
  return {
    removeGetaway,
    isDeleting: mutation.isPending,
    error: mutation.error
  };
};