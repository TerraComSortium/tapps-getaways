import * as React from 'react';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ClearIcon from '@mui/icons-material/Clear';
import { Box, IconButton, InputAdornment } from '@mui/material';
import TextField, { TextFieldProps } from '@mui/material/TextField';

function getFileIcon(filename: string | undefined) {
  if (!filename) return <AttachFileIcon/>;
  return <AttachFileIcon />;
}

export interface FileUploadFieldProps extends Omit<TextFieldProps, 'value' | 'onChange' | 'type'> {
  value?: File | null;
  onChange?: (file: File | null) => void;
  accept?: string;
  clearable?: boolean;
}

export const FileUploadField = React.forwardRef< HTMLDivElement, FileUploadFieldProps >(function FileUploadField(props, ref) {
  const {
    value,
    onChange,
    accept,
    clearable = true,
    label,
    error,
    helperText,
    fullWidth,
    ...other
  } = props;

  const hiddenInputRef = React.useRef<HTMLInputElement>(null);

  const previewUrl = React.useMemo(() => {
    if ( value && value instanceof File && value?.type.startsWith('image/')) {
      return URL.createObjectURL(value);
    }
    return null;
  }, [value]);

  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onChange?.(file);
  };

  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = '';
    }
    onChange?.(null);
  };

  const handleBoxClick = () => {
    hiddenInputRef.current?.click();
  };
  const filename = value?.name || '';

  const renderStartAdornment = () => {
    if (previewUrl) {
      return (
        <Box
          component="img"
          src={previewUrl}
          alt={filename}
          sx={{
            width: 24, height: 24,
            objectFit: 'cover',
            borderRadius: 0.5,
            mr: 1
          }}
        />
      );
    }
    return(
      <InputAdornment position="start">
        {React.cloneElement(getFileIcon(filename), {
          sx: { color: filename ? 'text.primary' : 'text.secondary' },
        })}
      </InputAdornment>
    );
  };

  return (
    <Box ref={ref} sx={{ width: fullWidth ? '100%' : 'auto' }}>
      <input
        type="file"
        accept={accept}
        ref={hiddenInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <TextField
        // ref={ref}
        {...other}
        fullWidth={fullWidth}
        label={label}
        value={filename}
        error={error}
        helperText={helperText}
        onClick={handleBoxClick}
        sx={{
          cursor: 'pointer',
          '& .MuiInputBase-input': { cursor: 'pointer' },
          ...other.sx
        }}

        slotProps={{
          input: {
            readOnly: true,
            startAdornment: renderStartAdornment(),
            endAdornment:
              clearable && value ? (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="clear file"
                    onClick={handleClear}
                    edge="end"
                    size="small"
                  ><ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
          }
        }}
      />
    </Box>
  );
});