import {api} from './client';

export type Contribution = {
  id: string;
  item_id: string;
  user_id: string;
  amount: number;
  created_at: string;
  updated_at: string;
};

export const contributionsApi = {
  create(itemId: string, amount: number) {
    return api.post<Contribution>(`/api/items/${itemId}/contributions`, {
      amount,
    });
  },

  reserve(itemId: string) {
    return api.post<Contribution>(`/api/items/${itemId}/contributions/reserve`);
  },

  update(itemId: string, amount: number) {
    return api.put<Contribution>(`/api/items/${itemId}/contributions`, {
      amount,
    });
  },

  getMine(itemId: string) {
    return api.get<Contribution | null>(`/api/items/${itemId}/contributions/mine`);
  },
};
