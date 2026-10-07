import { useState, useCallback } from 'react';
import { verifyEmail } from '../services/email/email';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

export interface EmailVerifyResult {
  exists: boolean;
  verified: boolean;
  uid?: string;
  verificationLink?: string;
  message: string;
}

export const useEmailVerify = () => {
  const [data, setData] = useState<EmailVerifyResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const execute = useCallback(async (email: string): Promise<EmailVerifyResult | null> => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return null;

    setLoading(true);
    setError(null);

    try {
      const result = await verifyEmail(trimmedEmail);
      setData(result);
      return result;
    } catch (err: unknown) {

      if (axios.isAxiosError(err) && err.response?.data) {
        const apiData = err.response.data as EmailVerifyResult;
        const fallbackMsg = apiData.message || `${t('book.nullEmailPartner')}`;
        setError(fallbackMsg);

        return { //api response
          exists: apiData.exists ?? false,
          verified: apiData.verified ?? false,
          message: fallbackMsg,
        };
      }
      const errorMessage =
        err instanceof Error ? err.message : `${t('book.failedEmailPartner')}`;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [t]);

  const resetState = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return { data, loading, error, execute, resetState };
};