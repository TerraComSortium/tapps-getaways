import { SubmissionResult } from '../contexts/FormDataContext';
// import { GetawayFormData } from '../types/getaway';
import { Box, Typography, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface DataViewProps {
  result: SubmissionResult;
}

const statusColor = {
  SUCCESS: 'success' as const,
  API_ERROR: 'error' as const,
  NETWORK_ERROR: 'error' as const,
  LOCAL_SAVE: 'warning' as const,
};

export default function DataView({ result }: DataViewProps) {
  const { t } = useTranslation();
  const { payload, status, statusCode } = result;
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        {t('dataView.result')}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Typography variant="h6">{t('dataView.state')}:</Typography>
        <Chip label={t(`dataView.status.${status}`)} color={statusColor[status]} />
      </Box>
      {statusCode && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="h6">{t('dataView.statusCode')}:</Typography>
          <Chip label={statusCode} variant="outlined" />
        </Box>
      )}

      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
        {t('dataView.payload')}:
      </Typography>
      <Box
        component="pre"
        sx={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          bgcolor: 'grey.200',
          color: 'black',
          p: 2,
          borderRadius: 1
        }}
      >
        {JSON.stringify(payload, null, 2)}
      </Box>
    </Box>
  );
}