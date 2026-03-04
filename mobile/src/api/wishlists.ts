import {api} from './client';

export type Wishlist = {
  id: string;
  title: string;
  description: string | null;
  occasion: string | null;
  event_date: string | null;
  slug: string;
  currency: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  items?: Item[];
  owner?: {display_name: string; avatar_url: string | null};
};

export type Item = {
  id: string;
  name: string;
  link: string | null;
  price: number;
  image_url: string | null;
  total_funded: number;
  contributor_count: number;
  status: 'AVAILABLE' | 'PARTIALLY_FUNDED' | 'FULLY_FUNDED';
  created_at: string;
};

export const wishlistsApi = {
  list() {
    return api.get<Wishlist[]>('/api/wishlists');
  },

  get(id: string) {
    return api.get<Wishlist>(`/api/wishlists/${id}`);
  },

  create(data: {
    title: string;
    occasion?: string;
    event_date?: string;
    currency?: string;
  }) {
    return api.post<Wishlist>('/api/wishlists', data);
  },

  update(id: string, data: Partial<Wishlist>) {
    return api.put<Wishlist>(`/api/wishlists/${id}`, data);
  },

  delete(id: string) {
    return api.delete(`/api/wishlists/${id}`);
  },

  getPublic(slug: string) {
    return api.get<Wishlist>(`/api/wishlists/public/${slug}`, false);
  },
};
