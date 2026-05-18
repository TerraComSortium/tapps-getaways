import { useState } from 'react';
import { verifyEmail } from '../services/email/email';

interface EmailVerifyResult {
  exists: boolean;
  verified: boolean;
  uid?: string;
  verificationLink?: string;
  message: string;
}

export const useEmailVerify = () => {
  const [data, setData] = useState<EmailVerifyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (email: string) => {
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await verifyEmail(email);
      setData(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error verifying email');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, execute };
};
