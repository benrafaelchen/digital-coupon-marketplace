import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.product.count();
  if (existing > 0) {
    console.log(`Database already has ${existing} products — skipping seed.`);
    return;
  }

  const coupons = [
    {
      name: "20% Off Electronics",
      description: "Get 20% off any electronics purchase up to $500",
      imageUrl: "https://picsum.photos/seed/coupon1/400/300",
      costPrice: 10.0,
      marginPercentage: 25.0,
      valueType: "STRING" as const,
      value: "ELEC-20OFF-A1B2",
    },
    {
      name: "Free Shipping Voucher",
      description: "Free shipping on your next order, no minimum spend",
      imageUrl: "https://picsum.photos/seed/coupon2/400/300",
      costPrice: 5.0,
      marginPercentage: 40.0,
      valueType: "STRING" as const,
      value: "FREESHIP-X9Y8Z7",
    },
    {
      name: "$50 Restaurant Gift Card",
      description: "Redeemable at participating restaurants nationwide",
      imageUrl: "https://picsum.photos/seed/coupon3/400/300",
      costPrice: 35.0,
      marginPercentage: 20.0,
      valueType: "STRING" as const,
      value: "REST-GIFT-50-QW3R",
    },
    {
      name: "Buy 1 Get 1 Free Coffee",
      description: "Valid at any partner coffee shop location",
      imageUrl: "https://picsum.photos/seed/coupon4/400/300",
      costPrice: 3.0,
      marginPercentage: 50.0,
      valueType: "STRING" as const,
      value: "BOGO-COFFEE-M4N5",
    },
    {
      name: "Premium QR Discount Code",
      description: "Scan this QR code at checkout for 30% off",
      imageUrl: "https://picsum.photos/seed/coupon5/400/300",
      costPrice: 15.0,
      marginPercentage: 30.0,
      valueType: "IMAGE" as const,
      value: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=DISCOUNT-30-QR",
    },
  ];

  for (const coupon of coupons) {
    await prisma.product.create({
      data: {
        name: coupon.name,
        description: coupon.description,
        type: "COUPON",
        imageUrl: coupon.imageUrl,
        costPrice: coupon.costPrice,
        marginPercentage: coupon.marginPercentage,
        valueType: coupon.valueType,
        value: coupon.value,
      },
    });
  }

  console.log(`Seeded ${coupons.length} coupon products.`);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
