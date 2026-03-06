import { ProductPublic, ProductAdmin, PurchaseResult } from "../types";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(body.message || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─── Customer API ───────────────────────────────────────────

export function fetchCustomerProducts(): Promise<ProductPublic[]> {
  return request("/api/customer/products");
}

export function purchaseProduct(id: string): Promise<PurchaseResult> {
  return request(`/api/customer/products/${id}/purchase`, { method: "POST" });
}

// ─── Admin API ──────────────────────────────────────────────

export function fetchAdminProducts(): Promise<ProductAdmin[]> {
  return request("/api/admin/products");
}

export function createAdminProduct(data: {
  name: string;
  description: string;
  image_url: string;
  cost_price: number;
  margin_percentage: number;
  value_type: "STRING" | "IMAGE";
  value: string;
}): Promise<ProductAdmin> {
  return request("/api/admin/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deleteAdminProduct(id: string): Promise<void> {
  return request(`/api/admin/products/${id}`, { method: "DELETE" });
}
