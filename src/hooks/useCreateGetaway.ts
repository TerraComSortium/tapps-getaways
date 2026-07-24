import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { useFormData } from '../contexts/FormDataContext';
import { handleGetawaySubmit, handleCouponSubmit } from '../services/getaways/getawayCreate';
import type { GetawayFormData, GetawayPayload, CouponPayload, ScheduleRow } from '../types/getaway';
import { mapScheduleRowsToApiFormat } from '../utils/dataMappers';

interface UseCreateGetawayReturn {
  isLoading: boolean;
  submitGetaway: (
    data: GetawayFormData,
    scheduleRows: ScheduleRow[],
    cleanedAddOns: { name: string; price: number }[],
    validPhotos: File[],
    validCaptions: string[]
  ) => Promise<void>;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning';
}

export function useCreateGetaway(
  showSnackbar: (message: string, severity: SnackbarState['severity']) => void
): UseCreateGetawayReturn {
  const [isLoading, setIsLoading] = useState(false);
  const { setSubmissionData } = useFormData();
  const navigate = useNavigate();

  const submitGetaway = async (
    data: GetawayFormData,
    scheduleRows: ScheduleRow[], cleanedAddOns: { name: string; price: number }[],
    validPhotos: File[],
    validCaptions: string[]
  ): Promise<void> => {
    setIsLoading(true);

    try {
      const apiSchedule = mapScheduleRowsToApiFormat(scheduleRows);
      const { discounts, getawayAddress, ...rest } = data;

      delete (rest as Partial<GetawayFormData>).optionalAddOns;
      delete (rest as Partial<GetawayFormData>).galleryPhotos;

      const payload: GetawayPayload = {
        ...rest,
        address: getawayAddress.address,
        location: {
          lat: getawayAddress.lat!,
          lng: getawayAddress.lng!,
        },
        optionalAddOns: cleanedAddOns,
        schedule: apiSchedule,
        galleryPhotos: validPhotos,
        galleryPhotoCaptions: validCaptions,
      };

      const result = await handleGetawaySubmit(payload);

      if (result.status === 'SUCCESS' && result.getawayId) {
        if (discounts?.length) {
          await Promise.all(
            discounts.map((discount) =>
              handleCouponSubmit({
                ...discount,
                getawayId: result.getawayId!,
              } satisfies CouponPayload)
            )
          );
        }

        showSnackbar('Getaway created successfully!', 'success');
        setSubmissionData(result);
        navigate(ROUTES.DATA_VIEW);
      } else {
        showSnackbar(
          'Connection error. Check your internet connection and try again.',
          'error'
        );
      }
    } catch (error) {
      console.error('Submit error', error);
      showSnackbar(
        'An unexpected error occurred while processing the request.',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };
  return { isLoading, submitGetaway };
}