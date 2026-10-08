import React, { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { BRAND } from '../theme/colors';
import { Box, Typography, TextField, Button, CircularProgress } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useEmailVerify, EmailVerifyResult } from '../hooks/useEmailVerify';
import { useTranslation } from 'react-i18next';
import { MAX_PARTNERS } from '../utils/scheduleFees';

interface CheckInput {
  email: string;
}
interface EmailCheckerProps {
  onPartnerAdded?: (result: EmailVerifyResult, email: string) => void;
  disabled?: boolean; //control limit
}
const EmailChecker: React.FC<EmailCheckerProps> = ({ onPartnerAdded, disabled = false }) => {
  const { t, i18n } = useTranslation();
  // Dentro del componente para que los mensajes sigan el idioma activo.
  const schema = useMemo(() => yup.object().shape({
    email: yup
      .string()
      .required(t('validation.emailRequired'))
      .matches(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
        t('validation.emailInvalid')
      ),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [t, i18n.language]);
  const { execute: verifyEmail, loading } = useEmailVerify();
  const { control, handleSubmit, setError, reset, formState: { errors } } = useForm<CheckInput>({
    resolver: yupResolver(schema),
  });

  const handleVerifyAndAdd = async (data: CheckInput) => {
    if (disabled) return;
    try {
      const result = await verifyEmail(data.email);
      if (result && result.exists) {
        if (onPartnerAdded) {
          onPartnerAdded(result, data.email);
        }
        reset({ email: '' });
      } else {
        setError('email', {
          type: 'manual',
          message: result?.message || `${t('book.nullEmailPartner')}`,
        });
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : `${t('book.failedEmailPartner')}`;
      setError('email', {
        type: 'manual',
        message: errorMessage,
      });
    }
  };

  return (
    <>
      <Typography variant="h6" className='purpleLabel' sx={{ mt: 2, mb: 0, fontSize: '14px', fontWeight: 'bold' }}>{t('book.addPartnerEmail')}</Typography>
      <Box sx={{ pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'start', flexWrap: 'wrap', gap:0
      }}>
        <Controller
          name="email" defaultValue="" control={control}
          render={({ field }) => (
            <TextField
              {...field}
              id="email-partner"
              margin="normal" fullWidth
              autoComplete="email"
              label={disabled ? t('book.partnerLimitReached', { count: MAX_PARTNERS }) : t('book.email')}
              disabled={loading || disabled}
              autoFocus
              error={!!errors.email}
              helperText={errors.email ? errors.email.message : ''}
              sx={{
                minWidth:{ xs:'100px', sm:'200px', md:'300px'},
                maxWidth:{ xs:'80%', sm:'240px', md:'320px' },
                mr:{ xs:0, sm:'10px'},
              }}
            />
          )}
        />
        <Button
          type="button"
          onClick={handleSubmit(handleVerifyAndAdd)}
          disabled={loading || disabled}
          startIcon={
            loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <PersonAddIcon />
            )
          }
          variant="outlined" disableElevation size="medium"
          aria-label="add partner"
          sx={{
            minWidth:'48px',
            px:'16px', py:'10px',
            ml:{ xs:'3px', sm:'2px'},
            borderRadius: '10px',
            textTransform: 'none',
            bgcolor: BRAND.primary, color: BRAND.white,  fontWeight: 'bold',
            ':hover': { color: BRAND.primary, bgcolor: BRAND.white  }
          }}
        >{t('book.addPartnerBttn')}
        </Button>
      </Box>
    </>
  );
};
export default EmailChecker;