import { useState, useCallback } from 'react';
import { Tournament, TournamentClientService } from '../services/tournament';
import { useTranslation } from 'react-i18next';
import { isAxiosError } from 'axios';

export const useTournaments = () => {
  const { t } = useTranslation();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // const fetchTournaments = useCallback(async (token?: string) => {
  const fetchTournaments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // const data = await TournamentClientService.getTournaments(token);
      const data = await TournamentClientService.getTournaments();
      setTournaments(data);
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.status === 401) {
        setError(t('common.noAccess'));
      } else if (isAxiosError(err)) {
        setError(err.response?.data?.message || err.message || t('tournaments.error'));
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t('tournaments.error'));
      }
    } finally {
      setLoading(false);
    }
  }, [t]);

  return { tournaments, loading, error, fetchTournaments };
}