import axios from 'axios';
import { api } from '../api/api';
import { useCallback, useState } from 'react';

export interface AcademyParams {
  startDate?: string;
  endDate?: string;
  sport?: string;
}

/** Hora suelta tal como la guarda la app principal: { hour, minutes, meridiem }. */
export interface AcademyHour {
  hour?: string;
  minutes?: string;
  meridiem?: 'AM' | 'PM' | number;
}

/** Una sesión semanal de la clase (weekday + horas + sede + cancha + staff + precio). */
export interface AcademySession {
  id?: string;
  weekday?: string;
  hours?: { start?: AcademyHour; end?: AcademyHour }[];
  location?: { name?: string } | null;
  court?: { name?: string; courtno?: string } | null;
  staff?: { name?: string; lastname?: string }[];
  limitPlaces?: string | number;
  fees?: string | number;
}

/**
 * Documento de la colección `academy_class` (interfaz IAcademyClass del backend).
 * OJO: `startdate`/`enddate` van en minúsculas y el horario real vive anidado
 * dentro de `scheduled[]`, no en campos planos.
 */
export interface AcademyClass {
  id: string;
  name?: string;
  description?: string;
  sport?: string;
  startdate?: string;
  enddate?: string;
  groupType?: string;
  agebracket?: string;
  genre?: string;
  playinglevelmin?: number | string;
  playinglevelmax?: number | string;
  scheduleType?: 'fixed-schedule' | 'varied-schedule';
  scheduled?: AcademySession[];
  daysavailable?: unknown;
  fixedSchedule_startTime?: AcademyHour | string;
  fixedSchedule_endTime?: AcademyHour | string;
  [key: string]: unknown;
}

export const useGetAcademy = () => {
  const [academyData, setAcademyData] = useState<AcademyClass[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAcademy = useCallback(async (params: AcademyParams) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<{ ok: boolean; academy: AcademyClass[] }>(
        '/academy/getaways',
        {
        params: {
          ...(params.startDate && { startDate: params.startDate }),
          ...(params.endDate && { endDate: params.endDate }),
          ...(params.sport && { sport: params.sport }),
        },
        }
      );

      setAcademyData(response.data.academy ?? []);
      // console.log('Academy response:', response.data)
    } catch (err: unknown) {
      console.error('Error fetching academy classes:', err);
      if (axios.isAxiosError<{ message?: string }>(err)) {
        console.error('Academy API error:', {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
        });
        setError(err.response?.data?.message || err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error fetching academy classes');
      }
      setAcademyData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { academyData, loading, error, fetchAcademy };
};
