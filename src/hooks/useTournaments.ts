import { useState, useCallback } from 'react';
import { Tournament, TournamentClientService } from '../services/tournament';

export const useTournaments = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTournaments = useCallback(async (token?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await TournamentClientService.getTournaments(token);
      setTournaments(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('No autorizado: Requiere sesión activa o token válido');
      } else {
        setError(err.response?.data?.message || err.message || 'Error al obtener torneos');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return { tournaments, loading, error, fetchTournaments };
};