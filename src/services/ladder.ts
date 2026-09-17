import { api } from '../api/api';

export interface Ladder {
  id: string;
  name?: string;
  [key: string]: unknown;
}

interface LaddersApiResponse {
  ok: boolean;
  response?: Ladder[] | { ladders?: Ladder[]; data?: Ladder[]; items?: Ladder[] };
  ladders?: Ladder[] | { ladders?: Ladder[]; data?: Ladder[]; items?: Ladder[] };
  data?: Ladder[] | { ladders?: Ladder[]; data?: Ladder[]; items?: Ladder[] };
  items?: Ladder[];
}

const extractLadders = (payload: LaddersApiResponse | Ladder[] | unknown): Ladder[] => {
  if (Array.isArray(payload)) return payload;

  if (payload && typeof payload === 'object') {
    const response = payload as LaddersApiResponse;

    if (Array.isArray(response.ladders)) return response.ladders;
    if (Array.isArray(response.response)) return response.response;
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response.items)) return response.items;

    if (response.ladders && typeof response.ladders === 'object') {
      return extractLadders(response.ladders);
    }

    if (response.response && typeof response.response === 'object') {
      return extractLadders(response.response);
    }

    if (response.data && typeof response.data === 'object') {
      return extractLadders(response.data);
    }
  }

  return [];
};

export class LadderClientService {
  static async getLadders(): Promise<Ladder[]> {
    const { data } = await api.get<LaddersApiResponse>('/ladder/getaways');

    return extractLadders(data);
  }
}
