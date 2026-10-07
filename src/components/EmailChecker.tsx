import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { BRAND } from '../theme/colors';
import { Box, Typography, TextField, Button, CircularProgress } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useEmailVerify, EmailVerifyResult } from '../hooks/useEmailVerify';
import { useTranslation } from 'react-i18next';
const schema = yup.object().shape({
  email: yup
    .string()
    .required('Email is required')
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
      'Invalid email address'
    ),
});

interface CheckInput {
  email: string;
}
interface EmailCheckerProps {
  onPartnerAdded?: (partner: EmailVerifyResult, email: string) => void;
}

const EmailChecker: React.FC<EmailCheckerProps> = ({ onPartnerAdded }) => {
  const { t } = useTranslation();
  const { execute: verifyEmail, loading } = useEmailVerify();
  const { control, handleSubmit, setError, reset, formState: { errors } } = useForm<CheckInput>({
    resolver: yupResolver(schema),
  });

  const handleVerifyAndAdd = async (data: CheckInput) => {
    try {
      const result = await verifyEmail(data.email);
      if (result && (result.verified || result.exists)) {
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
    } catch (err: any) {
      setError('email', {
        type: 'manual',
        message: err?.message || `${t('book.failedEmailPartner')}`,
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
              margin="normal" fullWidth
              id="email-partner"
              label="Email"
              sx={{
                minWidth:{ xs:'100px', sm:'200px', md:'300px'},
                maxWidth:{ xs:'80%', sm:'240px', md:'320px' },
                mr:{ xs:0, sm:'10px'},
                }}
              autoComplete="email"
              disabled={loading}
              autoFocus
              error={!!errors.email}
              helperText={errors.email ? errors.email.message : ''}
            />
          )}
        />
        <Button
          type="button" disabled={loading}
          onClick={handleSubmit(handleVerifyAndAdd)}
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