const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface FetchOptions extends RequestInit {
  token?: string;
}

async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }

  if (res.status === 204) return null as T;
  return res.json();
}

// Auth
export interface User {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  oauth_provider: string | null;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export const authApi = {
  register: (email: string, password: string, display_name?: string) =>
    apiFetch<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, display_name }),
    }),
  login: (email: string, password: string) =>
    apiFetch<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  googleAuth: (credential: string) =>
    apiFetch<AuthResponse>("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential }),
    }),
  googleClientId: () =>
    apiFetch<{ client_id: string }>("/api/auth/google/client-id").catch(() => null),
  logout: () => apiFetch("/api/auth/logout", { method: "POST" }),
  me: (token: string) => apiFetch<User>("/api/auth/me", { token }),
};

// Wishlists
export interface Wishlist {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  occasion: string | null;
  event_date: string | null;
  slug: string;
  currency: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface WishlistItem {
  id: string;
  wishlist_id: string;
  name: string;
  link: string | null;
  price: number;
  image_url: string | null;
  total_funded: number;
  contributor_count: number;
  status: "AVAILABLE" | "PARTIALLY_FUNDED" | "FULLY_FUNDED";
  created_at: string;
  updated_at: string;
}

export interface PublicWishlist {
  id: string;
  title: string;
  description: string | null;
  occasion: string | null;
  event_date: string | null;
  slug: string;
  currency: string;
  is_archived: boolean;
  items: WishlistItem[];
}

export interface ScrapeResult {
  title: string | null;
  image: string | null;
  price: number | null;
  currency: string | null;
}

export interface Contribution {
  id: string;
  item_id: string;
  amount: number;
  created_at: string;
  updated_at: string;
}

export const wishlistApi = {
  create: (data: { title: string; occasion?: string; event_date?: string; currency?: string }, token: string) =>
    apiFetch<Wishlist>("/api/wishlists/", { method: "POST", body: JSON.stringify(data), token }),
  list: (token: string) => apiFetch<Wishlist[]>("/api/wishlists/", { token }),
  get: (id: string, token: string) => apiFetch<Wishlist>(`/api/wishlists/${id}`, { token }),
  update: (id: string, data: Partial<Wishlist>, token: string) =>
    apiFetch<Wishlist>(`/api/wishlists/${id}`, { method: "PUT", body: JSON.stringify(data), token }),
  delete: (id: string, token: string) =>
    apiFetch(`/api/wishlists/${id}`, { method: "DELETE", token }),
  getPublic: (slug: string) => apiFetch<PublicWishlist>(`/api/wishlists/public/${slug}`),
};

export const itemApi = {
  create: (wishlistId: string, data: { name: string; link?: string; price: number; image_url?: string }, token: string) =>
    apiFetch<WishlistItem>(`/api/wishlists/${wishlistId}/items/`, { method: "POST", body: JSON.stringify(data), token }),
  list: (wishlistId: string) =>
    apiFetch<WishlistItem[]>(`/api/wishlists/${wishlistId}/items/`),
  update: (wishlistId: string, itemId: string, data: Partial<WishlistItem>, token: string) =>
    apiFetch<WishlistItem>(`/api/wishlists/${wishlistId}/items/${itemId}`, { method: "PUT", body: JSON.stringify(data), token }),
  delete: (wishlistId: string, itemId: string, token: string) =>
    apiFetch(`/api/wishlists/${wishlistId}/items/${itemId}`, { method: "DELETE", token }),
  getDeletionInfo: (wishlistId: string, itemId: string, token: string) =>
    apiFetch<{ item_name: string; total_funded: number; contributor_count: number; has_contributions: boolean }>(
      `/api/wishlists/${wishlistId}/items/${itemId}/deletion-info`, { token }
    ),
};

export const scrapeApi = {
  scrape: (url: string) =>
    apiFetch<ScrapeResult>("/api/scrape/", { method: "POST", body: JSON.stringify({ url }) }),
};

export const contributionApi = {
  create: (itemId: string, amount: number, token: string) =>
    apiFetch<Contribution>(`/api/items/${itemId}/contributions/`, { method: "POST", body: JSON.stringify({ amount }), token }),
  reserve: (itemId: string, token: string) =>
    apiFetch<Contribution>(`/api/items/${itemId}/contributions/reserve`, { method: "POST", token }),
  update: (itemId: string, amount: number, token: string) =>
    apiFetch<Contribution>(`/api/items/${itemId}/contributions/`, { method: "PUT", body: JSON.stringify({ amount }), token }),
  mine: (itemId: string, token: string) =>
    apiFetch<Contribution | null>(`/api/items/${itemId}/contributions/mine`, { token }),
};
