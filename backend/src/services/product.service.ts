import Decimal from "decimal.js";
import { ProductRepository } from "../repositories/product.repository";
import { Errors } from "../utils/errors";
import { computeMinimumSellPrice } from "../utils/pricing";
import {
  CreateProductInput,
  UpdateProductInput,
  ProductPublicDTO,
  ProductAdminDTO,
  PurchaseResultDTO,
} from "../types";

// ─── DTO mappers ────────────────────────────────────────────────

function toPublicDTO(product: {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  costPrice: Decimal.Value;
  marginPercentage: Decimal.Value;
}): ProductPublicDTO {
  const price = computeMinimumSellPrice(product.costPrice, product.marginPercentage);
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    image_url: product.imageUrl,
    price: price.toDecimalPlaces(2).toNumber(),
  };
}

function toAdminDTO(product: any): ProductAdminDTO {
  const minPrice = computeMinimumSellPrice(product.costPrice, product.marginPercentage);
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    type: product.type,
    image_url: product.imageUrl,
    cost_price: Number(product.costPrice),
    margin_percentage: Number(product.marginPercentage),
    minimum_sell_price: minPrice.toDecimalPlaces(2).toNumber(),
    is_sold: product.isSold,
    value_type: product.valueType,
    value: product.value,
    created_at: product.createdAt.toISOString(),
    updated_at: product.updatedAt.toISOString(),
  };
}

// ─── Service ────────────────────────────────────────────────────

export const ProductService = {
  // ── Public / Reseller ──────────────────────────────────────

  async listUnsold(): Promise<ProductPublicDTO[]> {
    const products = await ProductRepository.findAllUnsold();
    return products.map(toPublicDTO);
  },

  async getPublicById(id: string): Promise<ProductPublicDTO> {
    const product = await ProductRepository.findById(id);
    if (!product) throw Errors.productNotFound();
    return toPublicDTO(product);
  },

  /**
   * Reseller purchase: validates price floor then atomically marks sold.
   * The reseller_price must meet or exceed minimum_sell_price.
   */
  async purchaseAsReseller(
    productId: string,
    resellerPrice: number
  ): Promise<PurchaseResultDTO> {
    // Pre-check existence and pricing before acquiring the lock
    const product = await ProductRepository.findById(productId);
    if (!product) throw Errors.productNotFound();
    if (product.isSold) throw Errors.productAlreadySold();

    const minPrice = computeMinimumSellPrice(product.costPrice, product.marginPercentage);
    if (new Decimal(resellerPrice).lessThan(minPrice)) {
      throw Errors.resellerPriceTooLow(minPrice.toDecimalPlaces(2).toNumber());
    }

    // Atomic purchase with row lock
    const result = await ProductRepository.atomicPurchase(productId);

    if (result.status === "NOT_FOUND") throw Errors.productNotFound();
    if (result.status === "ALREADY_SOLD") throw Errors.productAlreadySold();

    return {
      product_id: productId,
      final_price: new Decimal(resellerPrice).toDecimalPlaces(2).toNumber(),
      value_type: result.valueType,
      value: result.value,
    };
  },

  /**
   * Direct customer purchase: price is fixed at minimum_sell_price.
   * Customer cannot override price.
   */
  async purchaseAsCustomer(productId: string): Promise<PurchaseResultDTO> {
    const product = await ProductRepository.findById(productId);
    if (!product) throw Errors.productNotFound();
    if (product.isSold) throw Errors.productAlreadySold();

    const minPrice = computeMinimumSellPrice(product.costPrice, product.marginPercentage);

    const result = await ProductRepository.atomicPurchase(productId);

    if (result.status === "NOT_FOUND") throw Errors.productNotFound();
    if (result.status === "ALREADY_SOLD") throw Errors.productAlreadySold();

    return {
      product_id: productId,
      final_price: minPrice.toDecimalPlaces(2).toNumber(),
      value_type: result.valueType,
      value: result.value,
    };
  },

  // ── Admin ──────────────────────────────────────────────────

  async listAll(): Promise<ProductAdminDTO[]> {
    const products = await ProductRepository.findAll();
    return products.map(toAdminDTO);
  },

  async getById(id: string): Promise<ProductAdminDTO> {
    const product = await ProductRepository.findById(id);
    if (!product) throw Errors.productNotFound();
    return toAdminDTO(product);
  },

  async create(input: CreateProductInput): Promise<ProductAdminDTO> {
    validateAdminInput(input);
    const product = await ProductRepository.create({
      name: input.name,
      description: input.description,
      type: "COUPON",
      imageUrl: input.imageUrl,
      costPrice: input.costPrice,
      marginPercentage: input.marginPercentage,
      valueType: input.valueType,
      value: input.value,
    });
    return toAdminDTO(product);
  },

  async update(id: string, input: UpdateProductInput): Promise<ProductAdminDTO> {
    const existing = await ProductRepository.findById(id);
    if (!existing) throw Errors.productNotFound();

    if (input.costPrice !== undefined && input.costPrice < 0) {
      throw Errors.validationError("cost_price must be >= 0");
    }
    if (input.marginPercentage !== undefined && input.marginPercentage < 0) {
      throw Errors.validationError("margin_percentage must be >= 0");
    }

    const data: Record<string, any> = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.description !== undefined) data.description = input.description;
    if (input.imageUrl !== undefined) data.imageUrl = input.imageUrl;
    if (input.costPrice !== undefined) data.costPrice = input.costPrice;
    if (input.marginPercentage !== undefined) data.marginPercentage = input.marginPercentage;
    if (input.valueType !== undefined) data.valueType = input.valueType;
    if (input.value !== undefined) data.value = input.value;

    const updated = await ProductRepository.update(id, data);
    return toAdminDTO(updated);
  },

  async remove(id: string): Promise<void> {
    const existing = await ProductRepository.findById(id);
    if (!existing) throw Errors.productNotFound();
    await ProductRepository.delete(id);
  },
};

// ─── Validation helpers ─────────────────────────────────────────

function validateAdminInput(input: CreateProductInput) {
  if (!input.name?.trim()) throw Errors.validationError("name is required");
  if (!input.description?.trim()) throw Errors.validationError("description is required");
  if (!input.imageUrl?.trim()) throw Errors.validationError("image_url is required");
  if (input.costPrice === undefined || input.costPrice < 0) {
    throw Errors.validationError("cost_price must be >= 0");
  }
  if (input.marginPercentage === undefined || input.marginPercentage < 0) {
    throw Errors.validationError("margin_percentage must be >= 0");
  }
  if (!["STRING", "IMAGE"].includes(input.valueType)) {
    throw Errors.validationError("value_type must be STRING or IMAGE");
  }
  if (!input.value?.trim()) throw Errors.validationError("value is required");
}
