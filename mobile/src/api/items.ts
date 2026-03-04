import {api} from './client';
import type {Item} from './wishlists';

export const itemsApi = {
  list(wishlistId: string) {
    return api.get<Item[]>(`/api/wishlists/${wishlistId}/items`);
  },

  create(
    wishlistId: string,
    data: {name: string; price: number; link?: string; image_url?: string},
  ) {
    return api.post<Item>(`/api/wishlists/${wishlistId}/items`, data);
  },

  update(wishlistId: string, itemId: string, data: Partial<Item>) {
    return api.put<Item>(
      `/api/wishlists/${wishlistId}/items/${itemId}`,
      data,
    );
  },

  getDeletionInfo(wishlistId: string, itemId: string) {
    return api.get<{has_contributions: boolean; contributor_count: number; total_funded: number}>(
      `/api/wishlists/${wishlistId}/items/${itemId}/deletion-info`,
    );
  },

  delete(wishlistId: string, itemId: string) {
    return api.delete(`/api/wishlists/${wishlistId}/items/${itemId}`);
  },
};
