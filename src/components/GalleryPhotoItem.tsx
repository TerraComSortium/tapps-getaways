import React from 'react';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import { Box, Button, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { FileUploadField } from './FileUploadField'; // Tu componente base de input
import { BRAND } from '../theme/colors';
import type { GetawayFormData } from '../types/getaway';
import { useTranslation } from 'react-i18next';

const ALPHANUMERIC_I18N_REGEX = /^[\p{L}0-9\s,._'";:()!/|&—’-]*$/u;
interface GalleryPhotoItemProps {
  index: number;
  control: Control<GetawayFormData>;
  errors: FieldErrors<GetawayFormData>;
  onRemove: (index: number) => void;
}

export const GalleryPhotoItem: React.FC<GalleryPhotoItemProps> = ({
  index,
  control,
  // errors,
  onRemove,
}) => {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center',
        gap: 1.5,
        mb: 2,
        width: '100%',
      }}
    >
      <Controller
        name={`galleryPhotos.${index}.file`}
        control={control}
        defaultValue={null}
        rules={{
          validate: (file: File | null) => {
            if (!file) return true;
            if (file.size > 5 * 1024 * 1024) return t('gallery.fileTooLarge');
            return true;
          },
        }}
        render={({ field, fieldState }) => (
          <FileUploadField
            label={`${t('gallery.uploadFile')} #${index + 1}`}
            accept="image/*"
            fullWidth
            // value={field.value as File | null}
            value={field.value}
            onChange={(file) => field.onChange(file)}
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />

      <Controller
        name={`galleryPhotos.${index}.caption`}
        control={control}
        defaultValue=""
        rules={{
          validate: (value?: string) =>
            !value || ALPHANUMERIC_I18N_REGEX.test(value)
              ? true
              : t('create.onlyAlphanumeric'),
        }}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label={t('create.photoCaption')}
            fullWidth
            margin="none"
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />
      <Button variant="outlined" disableElevation size="small"
        onClick={() => onRemove(index)}
        sx={{
          p: '10px 16px', borderRadius: '10px',
          color: BRAND.white, bgcolor: BRAND.primary,
          fontWeight: 'bold', textTransform: 'none', minWidth: '48px', height: '56px',
          ':hover': { color: BRAND.primary, bgcolor: BRAND.white },
        }}
      ><DeleteIcon />
      </Button>
    </Box>
  );
};