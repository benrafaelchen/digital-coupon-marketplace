import { Decimal } from "@prisma/client/runtime/library";

// ─── Domain types ───────────────────────────────────────────────

export type ProductType = "COUPON";
export type CouponValueType = "STRING" | "IMAGE";

export interface ProductRecord {
  id: string;
  name: string;
  description: string;
  type: ProductType;
  imageUrl: string;
  costPrice: Decimal;
  marginPercentage: Decimal;
  isSold: boolean;
  valueType: CouponValueType;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── API response shapes ────────────────────────────────────────

/** Public product listing — excludes pricing internals and coupon value */
export interface ProductPublicDTO {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
}

/** Customer storefront listing — like PublicDTO but includes sold status so the
 *  frontend can show sold coupons as dimmed/disabled. Still excludes pricing
 *  internals and coupon value. */
export interface ProductCustomerDTO {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
  is_sold: boolean;
}

/** Returned after a successful purchase */
export interface PurchaseResultDTO {
  product_id: string;
  final_price: number;
  value_type: CouponValueType;
  value: string;
}

/** Admin view — includes all fields */
export interface ProductAdminDTO {
  id: string;
  name: string;
  description: string;
  type: ProductType;
  image_url: string;
  cost_price: number;
  margin_percentage: number;
  minimum_sell_price: number;
  is_sold: boolean;
  value_type: CouponValueType;
  value: string;
  created_at: string;
  updated_at: string;
}

// ─── Admin input ────────────────────────────────────────────────

export interface CreateProductInput {
  name: string;
  description: string;
  imageUrl: string;
  costPrice: number;
  marginPercentage: number;
  valueType: CouponValueType;
  value: string;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  imageUrl?: string;
  costPrice?: number;
  marginPercentage?: number;
  valueType?: CouponValueType;
  value?: string;
}

// ─── Error ──────────────────────────────────────────────────────

export interface ApiError {
  error_code: string;
  message: string;
}
