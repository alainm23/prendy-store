const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000';

import * as cache from './cache';

export interface StoreBranch {
  name: string;
  address: string | null;
  location: string | null;
  phone: string | null;
  image: string | null;
  schedule: any[] | null;
}

export interface StoreBusiness {
  slug: string;
  description: string | null;
  show_prices: boolean;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  business: {
    name: string;
    logo: string | null;
    color: string | null;
    phone: string | null;
    dial_code: string | null;
    currency: string;
    country: string | null;
  };
  branches: StoreBranch[];
}

export interface StoreProduct {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  images: string[] | null;
  is_available: boolean;
  category: { id: string; name: string; color: string } | null;
}

export async function getStoreBySlug(slug: string): Promise<StoreBusiness | null> {
  const cacheKey = `store:${slug}`;
  const cached = cache.get<StoreBusiness>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`${API_URL}/api/v1/store/${slug}`);
    if (!res.ok) {
      console.log(`[getStoreBySlug] ${slug} → ${res.status}`);
      return null;
    }
    const json = await res.json();
    const data = json.data;
    if (data) cache.set(cacheKey, data);
    return data;
  } catch (err) {
    console.error(`[getStoreBySlug] ${slug} error:`, err);
    return null;
  }
}

export async function getStoreProducts(slug: string, category?: string, sort?: string): Promise<StoreProduct[]> {
  const cacheKey = `products:${slug}:${category || 'all'}:${sort || 'default'}`;
  const cached = cache.get<StoreProduct[]>(cacheKey);
  if (cached) return cached;

  try {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (sort) params.set('sort', sort);
    const res = await fetch(`${API_URL}/api/v1/store/${slug}/products?${params}`);
    if (!res.ok) {
      console.log(`[getStoreProducts] ${slug} → ${res.status}`);
      return [];
    }
    const json = await res.json();
    const data = json.data?.data ?? json.data ?? [];
    cache.set(cacheKey, data);
    return data;
  } catch (err) {
    console.error(`[getStoreProducts] ${slug} error:`, err);
    return [];
  }
}

export async function getStoreCategories(slug: string): Promise<{ id: string; name: string; color?: string }[]> {
  const cacheKey = `categories:${slug}`;
  const cached = cache.get<{ id: string; name: string; color?: string }[]>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`${API_URL}/api/v1/store/${slug}/categories`);
    if (!res.ok) {
      console.log(`[getStoreCategories] ${slug} → ${res.status}`);
      return [];
    }
    const json = await res.json();
    const data = json.data ?? [];
    cache.set(cacheKey, data);
    return data;
  } catch (err) {
    console.error(`[getStoreCategories] ${slug} error:`, err);
    return [];
  }
}

export function buildWhatsAppUrl(phone: string, dialCode: string, message: string): string {
  const fullPhone = `${dialCode}${phone}`.replace(/[^0-9]/g, '');
  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
}

export function formatPrice(price: string | number, currency: string): string {
  const symbols: Record<string, string> = {
    PEN: 'S/',
    USD: '$',
    EUR: '€',
    MXN: '$',
    COP: '$',
  };
  const symbol = symbols[currency] || currency + ' ';
  return `${symbol}${Number(price).toFixed(2)}`;
}

export async function searchStoreProducts(slug: string, query: string): Promise<StoreProduct[]> {
  if (!query.trim()) return [];
  try {
    const params = new URLSearchParams({ search: query });
    const res = await fetch(`${API_URL}/api/v1/store/${slug}/products?${params}`);
    if (!res.ok) return [];
    const json = await res.json();
    return json.data?.data ?? json.data ?? [];
  } catch {
    return [];
  }
}

export async function getStoreProductsByIds(slug: string, ids: string[]): Promise<StoreProduct[]> {
  if (!ids.length) return [];
  try {
    const res = await fetch(`${API_URL}/api/v1/store/${slug}/products/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) {
      console.log(`[getStoreProductsByIds] ${slug} → ${res.status}`);
      return [];
    }
    const json = await res.json();
    return json.data ?? [];
  } catch (err) {
    console.error(`[getStoreProductsByIds] ${slug} error:`, err);
    return [];
  }
}

export interface StoreProductDetail {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  images: string[] | null;
  type: string;
  category: { id: string; name: string; color: string } | null;
  variants: { name: string; options: string[] }[];
}

export async function getStoreProductDetail(slug: string, productId: string): Promise<StoreProductDetail | null> {
  const cacheKey = `product-detail:${slug}:${productId}`;
  const cached = cache.get<StoreProductDetail>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`${API_URL}/api/v1/store/${slug}/products/${productId}`);
    if (!res.ok) {
      console.log(`[getStoreProductDetail] ${slug}/${productId} → ${res.status}`);
      return null;
    }
    const json = await res.json();
    const data = json.data;
    if (data) cache.set(cacheKey, data);
    return data;
  } catch (err) {
    console.error(`[getStoreProductDetail] ${slug}/${productId} error:`, err);
    return null;
  }
}

export function trackStoreEvent(slug: string, type: string, productId?: string): void {
  const body: Record<string, string> = { type };
  if (productId) body.product_id = productId;

  fetch(`${API_URL}/api/v1/store/${slug}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => {});
}
