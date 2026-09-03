import { api } from '../api/api';
export interface Tournament {
  id: string;
  name?: string;
  [key: string]: unknown;
}

interface TournamentsApiResponse {
  ok: boolean;
  ladders: Tournament[];
}

export class TournamentClientService {
  static async getTournaments(): Promise<Tournament[]> {
    const { data } = await api.get<TournamentsApiResponse>('/tornament/getaways');

    return data.ladders;
  }
}
