import { Prisma } from "@prisma/client";
import prisma from "../utils/prisma";

/**
 * Data-access layer for the products table.
 * All DB queries live here — services never touch Prisma directly.
 */
export const ProductRepository = {
  findAll() {
    return prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  },

  findAllUnsold() {
    return prisma.product.findMany({
      where: { isSold: false },
      orderBy: { createdAt: "desc" },
    });
  },

  findById(id: string) {
    return prisma.product.findUnique({ where: { id } });
  },

  create(data: Prisma.ProductCreateInput) {
    return prisma.product.create({ data });
  },

  update(id: string, data: Prisma.ProductUpdateInput) {
    return prisma.product.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.product.delete({ where: { id } });
  },

  /**
   * Atomically marks a product as sold inside a serializable transaction.
   * Uses SELECT ... FOR UPDATE to acquire a row-level lock, preventing
   * double-sell under concurrent requests.
   *
   * Returns the locked row (pre-update) so the caller can read coupon value,
   * or null if the product doesn't exist or is already sold.
   */
  async atomicPurchase(productId: string) {
    return prisma.$transaction(async (tx) => {
      // Raw query for row-level lock — Prisma doesn't expose FOR UPDATE
      const rows = await tx.$queryRaw<
        Array<{
          id: string;
          is_sold: number;
          cost_price: string;
          margin_percentage: string;
          value_type: string;
          value: string;
        }>
      >`SELECT id, is_sold, cost_price, margin_percentage, value_type, value
        FROM products
        WHERE id = ${productId}
        FOR UPDATE`;

      if (rows.length === 0) return { status: "NOT_FOUND" as const };

      const row = rows[0];
      // MySQL returns TINYINT(1) for BOOLEAN — 1 = true
      if (row.is_sold === 1) return { status: "ALREADY_SOLD" as const };

      await tx.product.update({
        where: { id: productId },
        data: { isSold: true },
      });

      return {
        status: "SUCCESS" as const,
        costPrice: row.cost_price,
        marginPercentage: row.margin_percentage,
        valueType: row.value_type as "STRING" | "IMAGE",
        value: row.value,
      };
    },
    {
      // SERIALIZABLE ensures the strongest isolation for the purchase lock
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
  },
};
