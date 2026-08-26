import { useState, useCallback } from 'react';
import { BRAND } from '../theme/colors';
import {
  Box, Button, Typography, TextField, Divider,
  FormControl, InputLabel, OutlinedInput, InputAdornment,Snackbar, Alert
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
// import DeleteIcon from '@mui/icons-material/Delete';
import {
  useForm, Controller,
  // useFieldArray, SubmitHandler
  // useFormContext,
  // Control
} from 'react-hook-form';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { useTranslation } from 'react-i18next';
// import { GetawayFormData } from '../types/getaway';
import { useCouponActions,
  // create, update
 } from '../hooks/useCouponActions';

type DiscountType = 'amount' | 'percentage';
interface CouponFormValues {
  getawayId?: string;
  startDate: string;
  endDate: string;
  couponCode: string;
  description?: string;
  amount?: number;
  percent?: number;
}

type CouponFormProps = {
  // index: number;
  // remove: (index: number) => void;
  // control: Control<GetawayFormData>;

  mode: 'create' | 'edit';
  initialValues: Partial<CouponFormValues>;
  couponId?: string;
};
// {
//   mode, initialValues, couponId,
//   control, index, remove
// }: CouponFormProps
export default function CouponForm() {
  const navigate = useNavigate();
  const { id: couponId } = useParams();
  const [ searchParams ] = useSearchParams();
  const isEditing = !!couponId;

  const { t } = useTranslation();
  const { create, update, isLoading, error } = useCouponActions();
  const getawayId = searchParams.get('getawayId') ?? undefined;

  const [discountType, setDiscountType] = useState<DiscountType>('amount');
  // const [discountType, setDiscountType] = useState<DiscountType>(
  //   initialValues.porcentajeDescuento ? 'percentage' : 'amount'
  // );
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const showSnackbar = useCallback((message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const { control, handleSubmit } = useForm<CouponFormValues>({
    defaultValues:{
      getawayId,
      title: '',
      startDate: '',
      endDate: '',
      couponCode: '',
      description: '',
      amount: undefined,
      percent: undefined,
    },
  });
  // const handleSubmit = async(values: CouponFormValues) => {
  const onSubmit = async(values: CouponFormValues) => {
    const payload: CouponPayload = {
      ...values,
      title: values.couponCode,
      description: values.description,
      discount: discountType === 'amount'
      ? values.amount
      : values.percent,
      // amount: discountType === 'amount' ? values.amount : undefined,
      // percent: discountType === 'percentage' ? values.percent : undefined,
      validFrom: values.startDate,
      validUntil: values.endDate,
      userLimit: 0,
    };
    console.log('payload:', payload, 'values:', values);
    if (isEditing) {
      const result = await update(couponId, payload);
      if (result) {
        showSnackbar('Coupon updated successfully', 'success');
      }
    } else {
      const result = await create(payload);
      if (result) {
        showSnackbar('Coupon created successfully', 'success');
        //delay for toast before redirect
        setTimeout(() => navigate(ROUTES.COUPONS), 1500);
      }
    }

    //hook error
    if (error) showSnackbar(error, 'error');
  }
  // const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
  // const { isLoading, submitGetaway } = useCreateCoupon(showSnackbar);
  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}
      sx={{
        m:'20px 0px',
        p:'20px 20px',
        borderRadius: '8px', bgcolor: BRAND.white,
      }}
    >
      <Typography variant="h6" sx={{ color: BRAND.primary, fontWeight: 'bold', mb: 2 }}>
        { isEditing ? t('discount.edit') : t('discount.create')}
      </Typography>
      {/* <Box style={{ display: 'flex', justifyContent:'space-between', alignItems:'center', gap: 16, marginBottom: 5 }}> */}
        {/* <Button startIcon={<DeleteIcon />} variant="outlined" disableElevation size="medium" aria-label="delete"
          sx={{ height: 36,
            p:'5px 16px', m:'0 3px', borderRadius: "10px", textTransform: "none",
            bgcolor: BRAND.primary, borderColor: 'white', color: 'white', fontWeight: 'bold',
            ':hover': { color: BRAND.primary, bgcolor: BRAND.white  }
          }}
          // onClick={() => removeDiscount(index)}
          onClick={() => remove(index)}
          // disabled={activeForms.length === 1}
        > {t('discount.remove')} </Button> */}
      {/* </Box> */}

      {/* <Box style={{ display: 'flex', justifyContent: 'center', gap: 16  }}> */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Controller
          // name={`discounts.${index}.startDate`}
          name="startDate" control={control}
          defaultValue=""
          rules={{ required: t('discount.startRequired') }}
          render={({ field, fieldState: { error } }) => (
            <TextField type="date"
              {...field}
              label={t('discount.startDate')} fullWidth margin="normal"
              InputLabelProps={{ shrink: true }}
              error={!!error}
              helperText={error ? error.message : ''}
            />
          )}
        />
        <Controller
          name="endDate"
          control={control}
          defaultValue=""
          rules={{ required: t('discount.endRequired') }}
          render={({ field, fieldState: { error } }) => (
            <TextField type="date"
              {...field}
              label={t('discount.endDate')} fullWidth margin="normal"
              // slotProps={{ inputLabel: { shrink: true } }}
              InputLabelProps={{ shrink: true }}
              error={!!error}
              helperText={error ? error.message : ''}
            />
          )}
        />
      </Box>

      <Box style={{
        display: 'flex', flexDirection: 'column',
        justifyContent:'flex-start' ,  gap: 12  }}>
        <Controller
          name="couponCode"
          control={control}
          defaultValue=""
          rules={{ required: t('discount.couponRequired') }}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              label={t('discount.couponCode')} required
              fullWidth margin="normal"
              id="outlined-required"
              error={!!error}
              helperText={error ? error.message : ''}
            />
          )}
        />

        <Controller
          // name={`discounts.${index}.description`}
          name="description"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField {...field}
              id="outlined-multiline-flexible"
              label={t('discount.description')}
              multiline
              maxRows={3}
              // sx={{ m: 1 }}
              margin="normal" fullWidth
            />
          )}
        />
        <Typography variant="h6" color={BRAND.primary} sx={{
          //  mt:2,
            mb:0,
            fontSize: '14px', fontWeight:"bold"  }}>
          {/* {t('discount.selectFormat')} */}
          Select discount format
        </Typography>
        <Divider aria-hidden="true"/>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'center', sm: 'center' },
            justifyContent:{ xs: 'center', sm:'start'},
            alignContent: { xs: 'start', sm: 'center' },
            gap: { xs:1, sm:2, md:4 },
            flexWrap:{ xs: 'wrap'}, width: '100%',
          }}
        >
          <Controller
            // name={`discounts.${index}.amount`}
            name="amount"
            control={control}
            defaultValue={0}
            rules={{
              validate: (v) =>
                discountType !== 'amount' || (!!v && v > 0) || t('discount.amountPositive'),
              // valueAsNumber: true,
              // required: t('discount.amountRequired'),
              // min: { value: 0.01, message: t('discount.amountPositive') }
            }}
            render={({ field, fieldState: { error } }) => (
              <FormControl
                sx={{
                  width:{ xs:'100%', sm:'auto' },
                  minWidth:{ sm:'180'}, flex: { sm: '1 1 180px' }
                }}
                margin="normal" error={!!error}
                disabled={discountType === 'percentage'}
              >
                <InputLabel htmlFor="input-amount">{t('discount.amount')}</InputLabel>
                <OutlinedInput
                  {...field}
                  id="input-amount"
                  endAdornment={<InputAdornment position="end">$</InputAdornment>}
                  label={t('discount.amount')}
                  type="number"
                  onFocus={() => setDiscountType('amount')}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                />
                {error && <Typography variant="caption" color="error.main" sx={{ ml: 2 }}>{error.message}</Typography>}
              </FormControl>
            )}
          />
          <Typography color={BRAND.primary} sx={{ fontSize: '14px', fontWeight:"bold", userSelect: 'none'  }}>
            {/* {t('discount.or')} */}
            Or
          </Typography>
          <Controller
            // name={`discounts.${index}.percent`}
            name="percent"
            control={control}
            defaultValue={0}
            rules={{
              validate: (v) =>
                discountType !== 'percentage' || (!!v && v > 0) || t('discount.amountPositive'),
            }}
            render={({ field, fieldState: { error } }) => (
              <FormControl
                sx={{
                  width:{ xs: '100%', sm: 'auto'},
                  minWidth:{ sm:'180px'},
                  flex: { sm: '1 1 180px' }
                }}
                margin="normal" error={!!error}>
                <InputLabel htmlFor="input-percent">
                  {/* {t('discount.percentage')} */}
                  Discount in percentage
                </InputLabel>
                <OutlinedInput
                  {...field}
                  id="input-percent"
                  endAdornment={<InputAdornment position="end">%</InputAdornment>}
                  label={t('discount.percentage')}
                  type="number"
                  onFocus={() => setDiscountType('percentage')}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                />
                {error && <Typography variant="caption" color="error.main" sx={{ ml: 2 }}>{error.message}</Typography>}
              </FormControl>
            )}
          />
        </Box>
        {/* <Controller
          name={`discounts.${index}.isActive`}
          control={control}
          defaultValue={false} // Default
          render={({ field }) => (
            <FormControlLabel
              sx={{ color: BRAND.black }}
              label={t('discount.activate')}
              control={
                <Checkbox
                  {...field}
                  checked={field.value}
                  onChange={field.onChange}
                />
              }
            />
          )}
        /> */}
        {error && (
          <Typography color="error.main" variant="caption">{error}</Typography>
        )}
        <Button type="submit" startIcon={<SaveIcon />} variant="outlined"
          disabled={isLoading}
          // className={`className ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          sx={{
            mt: 2,
            width:'160px',
            borderRadius: '8px', bgcolor: BRAND.primary, color: BRAND.white, fontWeight: 'medium', textTransform: 'none',
            ':hover': { bgcolor: 'white', color: BRAND.primary }
          }}
          >
          {isLoading ? 'Saving...' : isEditing ? 'Save' : 'Create coupon'}
          {/* {isEditing ? t('discount.save') : t('discount.create')} */}
          {/* {isLoading ? t('create.saving') : t('create.saveChanges')} */}
        </Button>
        <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => { setSnackbar((prev) => ({ ...prev, open: false })); clearError(); }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      </Box>
    </Box>
  );
}