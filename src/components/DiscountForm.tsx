import * as React from 'react';
import {
  Box, Button, Typography, TextField,
  FormControl,
  Checkbox,
  InputLabel, OutlinedInput, InputAdornment, FormControlLabel,
} from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import {
  // useForm,
  // useFieldArray, SubmitHandler
  // useFormContext,
  Controller, Control
} from 'react-hook-form';
import { GetawayFormData } from '../types/getaway';

type DiscountFormProps = {
  index: number;
  remove: (index: number) => void;
  control: Control<GetawayFormData>;
};

export default function DiscountForm({ control, index, remove }: DiscountFormProps) {
  return (
    <Box sx={{
      m:'20px 0px',
      p:'20px 20px',
      borderRadius: '8px', bgcolor: '#FFF',
    }}
    >
      <Box style={{ display: 'flex', justifyContent:'space-between', alignItems:'center', gap: 16, marginBottom: 5 }}>
        <Typography variant="h6" sx={{ color: '#3C1C91', fontWeight: 'bold' }}> Discount #{index + 1} </Typography>
        <Button startIcon={<DeleteIcon />} variant="outlined" disableElevation size="medium" aria-label="delete"
          sx={{ height: 36,
            p:'5px 16px', m:'0 3px', borderRadius: "10px", textTransform: "none",
            bgcolor: '#3C1C91', borderColor: 'white', color: 'white', fontWeight: 'bold',
            ':hover': { color: '#3C1C91', bgcolor: '#fff'  }
          }}
          // onClick={() => removeDiscount(index)}
          onClick={() => remove(index)}
          // disabled={activeForms.length === 1}
        > Remove </Button>
      </Box>

      <Box style={{ display: 'flex', justifyContent: 'center', gap: 16  }}>
        <Controller
          name={`discounts.${index}.startDate`}
          control={control}
          defaultValue=""
          rules={{ required: "Start date is required" }}
          render={({ field, fieldState: { error } }) => (
            <TextField type="date"
              {...field}
              label="Start date" fullWidth margin="normal"
              // slotProps={{ inputLabel: { shrink: true } }}
              InputLabelProps={{ shrink: true }}
              error={!!error}
              helperText={error ? error.message : ''}
            />
          )}
        />
        <Controller
          name={`discounts.${index}.endDate`}
          control={control}
          defaultValue=""
          rules={{ required: "End date is required" }}
          render={({ field, fieldState: { error } }) => (
            <TextField type="date"
              {...field}
              label="End date" fullWidth margin="normal"
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
          name={`discounts.${index}.couponCode`}
          control={control}
          defaultValue=""
          rules={{ required: "Coupon code is required" }}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              label="Coupon name or code" required
              fullWidth margin="normal"
              id="outlined-required"
              error={!!error}
              helperText={error ? error.message : ''}
            />
          )}
        />

        <Controller
          name={`discounts.${index}.description`}
          control={control}
          defaultValue=""
          render={({ field }) => (
          <TextField {...field}
            id="outlined-multiline-flexible"
            label="Description"
            multiline
            maxRows={3}
            // sx={{ m: 1 }}
            margin="normal" fullWidth
          />
        )}
        />

        <Controller
          name={`discounts.${index}.amount`}
          control={control}
          defaultValue={0}
          rules={{
            // valueAsNumber: true,
            required: "Amount is required",
            min: { value: 0.01, message: "Amount must be positive" }
          }}
          render={({ field, fieldState: { error } }) => (
            <FormControl fullWidth margin="normal" error={!!error}>
              <InputLabel htmlFor="outlined-adornment-amount">Discount Amount</InputLabel>
              <OutlinedInput
                {...field}
                id="outlined-adornment-amount"
                endAdornment={<InputAdornment position="end">$</InputAdornment>}
                label="Discount Amount"
                type="number"
                onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
              />
              {error && <Typography variant="caption" color="error.main" sx={{ ml: 2 }}>{error.message}</Typography>}
            </FormControl>
          )}
        />

        <Controller
          name={`discounts.${index}.isActive`}
          control={control}
          defaultValue={false} // Default
          render={({ field }) => (
            <FormControlLabel
              sx={{ color: "#000" }}
              label="Activate discount"
              control={
                <Checkbox
                  {...field}
                  checked={field.value}
                  onChange={field.onChange}
                />
              }
            />
          )}
        />
      </Box>
    </Box>
  );
}