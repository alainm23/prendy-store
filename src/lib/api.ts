const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000';

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

export interface StoreBusiness {
  id: string;
  name: string;
  description: string | null;
  logo: string | null;
  color: string;
  currency: string;
  phone: string | null;
  dial_code: string | null;
  address: string | null;
  slug: string;
}

export async function getStoreBySlug(slug: string): Promise<StoreBusiness | null> {
  try {
    const res = await fetch(`${API_URL}/api/v1/store/${slug}`);
    if (!res.ok) return null;
    const { data } = await res.json();
    return data;
  } catch {
    return null;
  }
}

export async function getStoreProducts(slug: string, category?: string): Promise<StoreProduct[]> {
  try {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    const res = await fetch(`${API_URL}/api/v1/store/${slug}/products?${params}`);
    if (!res.ok) return [];
    const { data } = await res.json();
    return data;
  } catch {
    return [];
  }
}

export async function getStoreCategories(slug: string): Promise<{ id: string; name: string }[]> {
  try {
    const res = await fetch(`${API_URL}/api/v1/store/${slug}/categories`);
    if (!res.ok) return [];
    const { data } = await res.json();
    return data;
  } catch {
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
