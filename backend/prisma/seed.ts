import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const coupons = [
  {
    name: "20% Off Electronics",
    description: "Get 20% off any electronics purchase up to $500",
    imageUrl: "https://picsum.photos/seed/elec20/400/300",
    costPrice: 10.0,
    marginPercentage: 25.0,
    valueType: "STRING" as const,
    value: "ELEC-20OFF-A1B2",
  },
  {
    name: "Free Shipping Voucher",
    description: "Free shipping on your next order, no minimum spend",
    imageUrl: "https://picsum.photos/seed/freeship/400/300",
    costPrice: 5.0,
    marginPercentage: 40.0,
    valueType: "STRING" as const,
    value: "FREESHIP-X9Y8Z7",
  },
  {
    name: "$50 Restaurant Gift Card",
    description: "Redeemable at participating restaurants nationwide",
    imageUrl: "https://picsum.photos/seed/restaurant/400/300",
    costPrice: 35.0,
    marginPercentage: 20.0,
    valueType: "STRING" as const,
    value: "REST-GIFT-50-QW3R",
  },
  {
    name: "Buy 1 Get 1 Free Coffee",
    description: "Valid at any partner coffee shop location",
    imageUrl: "https://picsum.photos/seed/coffee/400/300",
    costPrice: 3.0,
    marginPercentage: 50.0,
    valueType: "STRING" as const,
    value: "BOGO-COFFEE-M4N5",
  },
  {
    name: "Premium QR Discount Code",
    description: "Scan this QR code at checkout for 30% off",
    imageUrl: "https://picsum.photos/seed/qrcode/400/300",
    costPrice: 15.0,
    marginPercentage: 30.0,
    valueType: "IMAGE" as const,
    value: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=DISCOUNT-30-QR",
  },
  {
    name: "Gym Monthly Pass",
    description: "One month unlimited access to partner gyms",
    imageUrl: "https://picsum.photos/seed/gym/400/300",
    costPrice: 25.0,
    marginPercentage: 20.0,
    valueType: "STRING" as const,
    value: "GYM-MONTH-P6Q7",
  },
  {
    name: "Movie Night Bundle",
    description: "Two tickets + popcorn combo at any cinema chain",
    imageUrl: "https://picsum.photos/seed/movie/400/300",
    costPrice: 12.0,
    marginPercentage: 35.0,
    valueType: "STRING" as const,
    value: "MOVIE-2TIX-R8S9",
  },
  {
    name: "Spa & Wellness Voucher",
    description: "60-minute massage or facial at partner spas",
    imageUrl: "https://picsum.photos/seed/spa/400/300",
    costPrice: 40.0,
    marginPercentage: 15.0,
    valueType: "STRING" as const,
    value: "SPA-60MIN-T0U1",
  },
  {
    name: "Online Course Credit",
    description: "$30 credit toward any online learning platform course",
    imageUrl: "https://picsum.photos/seed/course/400/300",
    costPrice: 18.0,
    marginPercentage: 30.0,
    valueType: "STRING" as const,
    value: "LEARN-30CR-V2W3",
  },
  {
    name: "Pet Store Discount",
    description: "15% off your next purchase at partner pet stores",
    imageUrl: "https://picsum.photos/seed/petstore/400/300",
    costPrice: 4.0,
    marginPercentage: 50.0,
    valueType: "STRING" as const,
    value: "PET-15OFF-X4Y5",
  },
  {
    name: "Book Store Gift Card",
    description: "$20 gift card for any bookstore purchase",
    imageUrl: "https://picsum.photos/seed/books/400/300",
    costPrice: 14.0,
    marginPercentage: 25.0,
    valueType: "STRING" as const,
    value: "BOOK-20GC-Z6A7",
  },
  {
    name: "Car Wash Premium",
    description: "Full interior and exterior detail at partner locations",
    imageUrl: "https://picsum.photos/seed/carwash/400/300",
    costPrice: 20.0,
    marginPercentage: 20.0,
    valueType: "STRING" as const,
    value: "WASH-PREM-B8C9",
  },
  {
    name: "Music Streaming 3-Month",
    description: "Three months of premium music streaming, ad-free",
    imageUrl: "https://picsum.photos/seed/music/400/300",
    costPrice: 8.0,
    marginPercentage: 40.0,
    valueType: "STRING" as const,
    value: "MUSIC-3MO-D0E1",
  },
  {
    name: "Grocery Store Saver",
    description: "10% off your entire grocery cart, up to $200",
    imageUrl: "https://picsum.photos/seed/grocery/400/300",
    costPrice: 6.0,
    marginPercentage: 35.0,
    valueType: "STRING" as const,
    value: "GROC-10OFF-F2G3",
  },
  {
    name: "Travel QR Voucher",
    description: "Scan for $100 off your next flight booking",
    imageUrl: "https://picsum.photos/seed/travel/400/300",
    costPrice: 60.0,
    marginPercentage: 25.0,
    valueType: "IMAGE" as const,
    value: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TRAVEL-100OFF",
  },
];

/**
 * Idempotent seed: only inserts coupons whose name doesn't already exist.
 * Safe to re-run on every container restart without creating duplicates.
 */
async function main() {
  const existingNames = new Set(
    (await prisma.product.findMany({ select: { name: true } })).map((p) => p.name)
  );

  const toInsert = coupons.filter((c) => !existingNames.has(c.name));

  if (toInsert.length === 0) {
    console.log(
      `All ${coupons.length} seed coupons already exist — nothing to insert.`
    );
    return;
  }

  for (const coupon of toInsert) {
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

  console.log(
    `Seeded ${toInsert.length} new coupon(s) (${existingNames.size} already existed).`
  );
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
