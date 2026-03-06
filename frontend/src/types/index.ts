export interface ProductPublic {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
}

/** Customer storefront product — includes sold status for UI display */
export interface ProductCustomer {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
  is_sold: boolean;
}

export interface ProductAdmin {
  id: string;
  name: string;
  description: string;
  type: string;
  image_url: string;
  cost_price: number;
  margin_percentage: number;
  minimum_sell_price: number;
  is_sold: boolean;
  value_type: "STRING" | "IMAGE";
  value: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseResult {
  product_id: string;
  final_price: number;
  value_type: "STRING" | "IMAGE";
  value: string;
}

export interface ApiError {
  error_code: string;
  message: string;
}
