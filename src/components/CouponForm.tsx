import { useEffect, useState, useCallback } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import {
  Box, Button, Typography, TextField, Divider,
  FormControl, InputLabel, OutlinedInput, InputAdornment,Snackbar, Alert
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import SaveIcon from '@mui/icons-material/Save';
import { BRAND } from '../theme/colors';

import { ROUTES } from '../constants/routes';
import type { CouponPayload, DiscountType } from '../types/getaway';
import { useCouponActions } from '../hooks/useCouponActions';
import { useEditCoupon } from '../hooks/useEditCoupon';
import { useTranslation } from 'react-i18next';

const ALPHANUMERIC_I18N_REGEX : RegExp = /^[\p{L}0-9\s,._'";:()!/|&—’-]*$/u;

interface CouponFormValues {
  startDate: string;
  endDate: string;
  userLimit: number | undefined;
  couponCode: string;
  description?: string;
  amount?: number | null;
  percent?: number | null;
  //DiscountType is either 'amount' or 'percentage' from the form selection
  discountType: DiscountType;
  getawayId: string;
}

type CouponFormProps = {
  mode: 'create' | 'edit';
  initialValues: Partial<CouponFormValues>;
  couponId?: string;
  onSuccess?: (redirectPath?: string) => void;
  onError?: (error: string) => void;
};

export default function CouponForm(
  { mode, initialValues, couponId, onSuccess, onError }: CouponFormProps
){
  // const { id: couponId } = useParams();
  const isEditing = !!couponId;

  const { t } = useTranslation();
  const {
    create,
    isLoading: isCreating, error: createError, clearError
   } = useCouponActions();
  const { editCoupon, isEditing: isEditing_api, error: editError } = useEditCoupon();
  const getawayIdFromProps = initialValues.getawayId;
  const isLoading = isCreating || isEditing_api;
  const error = createError || editError;

  // const getawayId = searchParams.get('getawayId') ?? undefined;
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const showSnackbar = useCallback((message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const { control, handleSubmit,
    watch, setValue, clearErrors //for discountType
   } = useForm<CouponFormValues>({
    defaultValues:{
      getawayId: getawayIdFromProps || '',
      startDate: initialValues.startDate || '',
      endDate: initialValues.endDate || '',
      userLimit: initialValues.userLimit ?? undefined,
      couponCode: initialValues.couponCode || '',
      description: initialValues.description || '',
      amount: initialValues.amount ?? undefined,
      percent: initialValues.percent ?? undefined,
      discountType: initialValues.percent ? 'percentage' : 'amount',
    },
  });

  useEffect(() => {
    if (initialValues.getawayId) {
      setValue('getawayId', initialValues.getawayId);
    }
  }, [initialValues.getawayId, setValue]);
  // watch listener: discount type from RHF
  const currentDiscountType = watch('discountType');
  const handleFocusType = (type: DiscountType) => {
    setValue('discountType', type);
    // reset unused field
    if (type === 'amount') {
      setValue('percent', undefined);
      clearErrors('percent');
    } else {
      setValue('amount', undefined);
      clearErrors('amount');
    }
  };

  const onSubmit: SubmitHandler<CouponFormValues> = async (values) => {
    console.log('payload:', 'values:', values);
    const payload: CouponPayload = {
    //...values,
      title: values.couponCode,
      description: values.description,
      discount: values.discountType === 'amount'
        ? values.amount || 0
        : values.percent || 0,
      validFrom: values.startDate,
      validUntil: values.endDate,
      userLimit: values.userLimit ?? 0,
      getawayId: values.getawayId ?? '',
      discountType: values.discountType,
      //  usersUsed: [],
    };
    console.log('Payload to POST:', payload);
    if (mode === 'edit') {
      editCoupon(couponId!, payload, {
        onSuccess: () => {
          showSnackbar(t('coupon.edited'), 'success');
          onSuccess?.();
        },
        onError: () => {
          showSnackbar(t('common.update.failed'), 'error');
          onError?.('Update failed');
        },
      });
    } else {
      const result = await create(payload);
      if (result) {
        showSnackbar(t('coupon.created'), 'success');
        onSuccess?.(ROUTES.COUPONS);
      } else if (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        showSnackbar(errorMsg, 'error');
      }
    }
  };
  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}
      sx={{ my:'20px', p:'20px 30px', borderRadius: '8px', bgcolor: BRAND.white }}
    >
      <Typography variant="h6" sx={{ color: BRAND.primary, fontWeight: 'bold', my: 1 }}>
        { isEditing ? t('coupons.edit') : t('coupons.create')}
      </Typography>
      <Grid container spacing={{xs:1, md:2}}>
        <Grid size={{xs:12, sm:6, md:4}}>
          <Controller
            name="startDate" control={control} defaultValue=""
            rules={{ required: t('coupon.startRequired') }}
            render={({ field, fieldState: { error } }) => (
              <TextField type="date" fullWidth margin="normal"
                {...field}
                label={t('coupon.startDate')}
                InputLabelProps={{ shrink: true }}
                error={!!error}
                helperText={error ? error.message : ''}
              />
            )}
          />
        </Grid>
        <Grid size={{xs:12, sm:6, md:4}}>
          <Controller
            name="endDate" control={control} defaultValue=""
            rules={{ required: t('coupon.dateRequired') }}
            render={({ field, fieldState: { error } }) => (
              <TextField type="date"
                {...field}
                label={t('coupon.endDate')}
                fullWidth margin="normal"
                InputLabelProps={{ shrink: true }}
                error={!!error}
                helperText={error ? error.message : ''}
              />
            )}
          />
        </Grid>
        <Grid size={{xs:12, sm:6, md:4}}>
          <Controller
            name="userLimit" control={control}
            rules={{
              required: t('coupon.couponRequired'),
              validate: ( v: number | undefined ) => {
                if (v === undefined || v === null) return t('coupon.required');
                return (Number.isInteger(v) && v > 0) || t('coupon.positive')
              }
            }}
            render={({ field, fieldState: { error } }) => (
              <FormControl fullWidth margin="normal" error={!!error} >
                <InputLabel htmlFor="input-userLimit">{t('coupon.limit')}</InputLabel>
                <OutlinedInput
                  {...field} value={field.value ?? ''}
                  id="input-userLimit"
                  label={t('coupon.limit')} type="number"
                  endAdornment={<InputAdornment position="end"> <LocalOfferIcon sx={{ p:'0 1px', color:'text.primary'}} /></InputAdornment>}
                  sx={{
                    //hide native arrows(spinners)from input Chrome, Safari, Edge, Opera
                    '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                      WebkitAppearance: 'none',
                      margin: 0
                    },
                    //Firefox
                    '& input[type=number]': {
                      MozAppearance: 'textfield'
                    }
                  }}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      field.onChange(undefined); //reset input
                      return;
                    }
                    const parsed = parseInt(val, 10);
                    field.onChange(isNaN(parsed) || parsed < 0 ? undefined : Math.floor(parsed));
                  }}
                  onKeyDown={(e) => {
                    if (['.', ',', '-', 'e', 'E'].includes(e.key)) {
                      e.preventDefault(); // Block
                    }
                  }}
                />
                {error &&
                  <Typography variant="caption" color="error.main" sx={{ ml: 2 }}>{error.message}</Typography>
                }
              </FormControl>
            )}
          />
        </Grid>
      </Grid>
      <Box style={{ display:'flex', flexDirection:'column', justifyContent:'flex-start'}}>
        <Controller
          name="getawayId" control={control}
          render={({ field }) => <input type="hidden" {...field} />}
        />
        <Controller
          name="couponCode" control={control} defaultValue=""
          rules={{
            required: t('coupon.couponRequired'),
            validate: (value?: string) =>
              !value || ALPHANUMERIC_I18N_REGEX.test(value)
                ? true
                : t('create.onlyAlphanumeric'),
          }}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              label={t('coupon.couponName')} required
              fullWidth margin="normal"
              id="outlined-required"
              error={!!error}
              helperText={error ? error.message : ''}
            />
          )}
        />

        <Controller
          name="description"
          control={control} defaultValue=""
          rules={{
            validate: (value?: string) =>
              !value || ALPHANUMERIC_I18N_REGEX.test(value)
                ? true
                : t('create.onlyAlphanumeric'),
          }}
          render={({ field }) => (
            <TextField {...field}
              id="outlined-multiline-flexible"
              label={t('coupon.description')}
              multiline margin="normal" fullWidth maxRows={3}
            />
          )}
        />

        <Typography variant="h6" color={BRAND.primary} sx={{ fontSize: '14px', fontWeight:"bold", mt:2  }}>
          {t('coupon.selectFormat')}
        </Typography>
        <Divider aria-hidden="true" sx={{margin:0, padding:0}} />
        <Box
          sx={{
            display: 'flex', padding:"0", margin:"0",
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'center', sm: 'center' },
            justifyContent:{ xs: 'center', sm:'start'},
            alignContent: { xs: 'start', sm: 'center' },
            gap: { xs:1, sm:2, md:4 },
            flexWrap:{ xs: 'wrap'}, width: '100%',
          }}
        >
          <Controller
            name="amount"
            control={control}
            rules={{
              validate: ( v: number | null | undefined ) => {
                if (currentDiscountType !== 'amount') return true;
                return (typeof v === 'number' && Number.isInteger(v) && v > 0) || t('coupon.amountPositive');
              }
            }}
            render={({ field, fieldState: { error } }) => (
              <FormControl
                sx={{
                  width:{ xs:'100%', sm:'auto' },
                  minWidth:{ sm:'180'}, flex: { sm: '1 1 180px' }
                }}
                margin="normal" error={!!error}
                disabled={currentDiscountType === 'percentage'}
              >
                <InputLabel htmlFor="input-amount">{t('coupon.amount')}</InputLabel>
                <OutlinedInput
                  {...field}
                  value={field.value ?? ''}
                  type="number" id="input-amount"
                  endAdornment={<InputAdornment position="end">$</InputAdornment>}
                  label={t('coupon.amount')}
                  sx={{
                    //hide native arrows(spinners)from input Chrome, Safari, Edge, Opera
                    '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': { WebkitAppearance: 'none', margin: 0 },
                    '& input[type=number]': { MozAppearance: 'textfield'} //Firefox
                  }}
                  onFocus={() => handleFocusType('amount')}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      field.onChange(''); //reset input
                      return;
                    }
                    const parsed = parseInt(val, 10);
                    field.onChange(isNaN(parsed) || parsed < 0 ? '' : Math.floor(parsed));
                  }}
                  onKeyDown={(e) => {
                    if (['.', ',', '-', 'e', 'E'].includes(e.key)) {
                      e.preventDefault(); // Block
                    }
                  }}
                />
                {error &&
                  <Typography variant="caption" color="error.main" sx={{ ml: 2 }}>{error.message}</Typography>
                }
              </FormControl>
            )}
          />
          <Typography color={BRAND.primary} sx={{ fontSize: '14px', fontWeight:"bold", userSelect: 'none'  }}> {t('coupon.or')} </Typography>
          <Controller
            name="percent" control={control}
            rules={{
              validate: (v) => {
                if (currentDiscountType !== 'percentage') return true;
                if (v === undefined || v === null) return t('coupon.amountRequired');
                return (
                  (typeof v === 'number' && Number.isInteger(v) && v > 0 && v <= 100) ||
                  t('coupon.amountPositive')
                );
              }
            }}
            render={({ field, fieldState: { error } }) => (
              <FormControl
                margin="normal" error={!!error}
                disabled={currentDiscountType === 'amount'}
                sx={{
                  width:{ xs: '100%', sm: 'auto'},
                  minWidth:{ sm:'180px'},
                  flex: { sm: '1 1 180px' }
                }}
              >
                <InputLabel htmlFor="input-percent"> {t('coupon.percentage')} </InputLabel>
                <OutlinedInput
                  {...field} value={field.value ?? ''}
                  id="input-percent" type="number"
                  label={t('coupon.percentage')}
                  sx={{
                    //hide native arrows(spinners)from input Chrome, Safari, Edge, Opera
                    '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {  WebkitAppearance: 'none', margin: 0 },
                    '& input[type=number]': { MozAppearance: 'textfield'} //Firefox
                  }}
                  endAdornment={<InputAdornment position="end">%</InputAdornment>}
                  onFocus={() => handleFocusType('percentage')}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      field.onChange(undefined);
                      return;
                    }
                    const parsed = parseInt(val, 10);
                    field.onChange(isNaN(parsed) || parsed < 0 ? undefined : Math.floor(parsed));
                  }}
                  onKeyDown={(e) => {
                    if (['.', ',', '-', 'e', 'E'].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
                {error &&
                  <Typography variant="caption" color="error.main" sx={{ ml: 2 }}>{error.message}</Typography>
                }
              </FormControl>
            )}
          />
        </Box>
        <Button type="submit" startIcon={<SaveIcon />} variant="outlined"
          disabled={isLoading}
          // className={`className ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          sx={{
            my: 2, width:'160px', borderRadius: '8px',
            bgcolor: BRAND.primary, color: BRAND.white, fontWeight: 'medium', textTransform: 'none',
            ':hover': { bgcolor: 'white', color: BRAND.primary }
          }}
          > {isLoading ? t('common.saving') : isEditing ? t('common.save') : t('coupons.create')}
        </Button>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => { setSnackbar((prev) => ({ ...prev, open: false })); clearError(); }}
          anchorOrigin={{ vertical:'bottom', horizontal:'center' }}
        >
          <Alert severity={snackbar.severity} variant="filled" sx={{ width:'100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}