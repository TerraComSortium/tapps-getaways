import { Box, Button, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Control, Controller, FieldErrors, Path, RegisterOptions } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { BRAND } from '../theme/colors';
import type { GetawayFormData } from '../types/getaway';

/** Secciones del formulario que se cobran por día. */
export type PricedSection = 'lodgingOptions' | 'amenities';

type RowErrors = FieldErrors<{ name: string; unitPrice: number; days: number }>;

interface PricedItemRowProps {
  control: Control<GetawayFormData>;
  errors: FieldErrors<GetawayFormData>;
  section: PricedSection;
  index: number;
  nameLabel: string;
  nameRules?: RegisterOptions<GetawayFormData, Path<GetawayFormData>>;
  /** Días del getaway, valor inicial del campo "días". */
  defaultDays: number;
  /** Total ya calculado (precio unitario × días) para mostrar. */
  total: string;
  onRemove: () => void;
}

/**
 * Fila "nombre · precio unitario · días · total" para las opciones de alojamiento
 * y los servicios incluidos. Los días arrancan con los del getaway y se pueden
 * editar; el total es de solo lectura (lo calcula quien la usa).
 */
export function PricedItemRow({
  control, errors, section, index, nameLabel, nameRules, defaultDays, total, onRemove,
}: PricedItemRowProps) {
  const { t } = useTranslation();
  const rowErrors = (errors[section] as RowErrors[] | undefined)?.[index];
  const path = (field: 'name' | 'unitPrice' | 'days') => `${section}.${index}.${field}` as Path<GetawayFormData>;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'start', gap: 1 }}>
      <Controller
        name={path('name')}
        control={control}
        rules={nameRules}
        render={({ field }) => (
          <TextField
            {...field}
            value={field.value ?? ''}
            fullWidth margin="normal"
            sx={{ maxWidth: { xs: '90%', sm: '80%', md: '300px' } }}
            label={nameLabel}
            error={!!rowErrors?.name}
            helperText={rowErrors?.name?.message || ''}
          />
        )}
      />
      <Controller
        name={path('unitPrice')}
        control={control}
        rules={{
          required: section === 'lodgingOptions' ? t('create.lodgingPriceRequired') : false,
          validate: {
            isNumber: (value) => !isNaN(parseFloat(String(value ?? 0))) || t('create.priceNumber'),
            isPositive: (value) => parseFloat(String(value ?? 0)) >= 0 || t('create.pricePositive'),
          },
        }}
        render={({ field }) => (
          <TextField
            {...field}
            value={field.value ?? ''}
            type="number" margin="normal"
            sx={{ width: { xs: '44%', sm: '150px' } }}
            label={t('create.amenityUnitPrice')}
            inputProps={{ min: 0, step: '0.01' }}
            error={!!rowErrors?.unitPrice}
            helperText={rowErrors?.unitPrice?.message || ''}
          />
        )}
      />
      <Controller
        name={path('days')}
        control={control}
        defaultValue={defaultDays || 1}
        rules={{
          validate: (value) => {
            const days = Number(value);
            return (Number.isInteger(days) && days >= 1) || t('create.amenityDaysMin');
          },
        }}
        render={({ field }) => (
          <TextField
            {...field}
            value={field.value ?? ''}
            type="number" margin="normal"
            sx={{ width: { xs: '30%', sm: '100px' } }}
            label={t('create.amenityDays')}
            inputProps={{ min: 1, step: 1 }}
            error={!!rowErrors?.days}
            helperText={rowErrors?.days?.message || ''}
          />
        )}
      />
      <TextField
        value={total}
        margin="normal"
        sx={{ width: { xs: '44%', sm: '140px' } }}
        label={t('create.amenityTotal')}
        InputProps={{ readOnly: true }}
      />
      <Button variant="outlined" disableElevation size="medium" aria-label="delete"
        sx={{
          p: '10px 16px', minWidth: '48px', height: '56px', mt: '8px', ml: '2px',
          borderRadius: '10px', textTransform: 'none',
          bgcolor: BRAND.primary, color: BRAND.white, fontWeight: 'bold',
          ':hover': { color: BRAND.primary, bgcolor: BRAND.white },
        }}
        onClick={onRemove}
      ><DeleteIcon /></Button>
    </Box>
  );
}

export default PricedItemRow;
