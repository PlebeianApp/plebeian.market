import {
  Auction,
  Bid,
  Category,
  DigitalProduct,
  Event,
  Invoice,
  Order,
  OrderItem,
  PaymentDetail,
  Product,
  ProductCategory,
  ProductImage,
  Shipping,
  ShippingZone,
  Stall,
  User,
} from "./types";
import { faker } from "@faker-js/faker";
import { db } from "./database";
import { allowedMimeTypes } from "./constants";
import { sql } from "drizzle-orm";

const randomLengthArrayFromTo = (min: number, max: number) => {
  return Array.from({ length: faker.number.int({ min, max }) });
};

const main = async () => {
  const userIds = [
    {
      id: "11a1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245",
    },
    {
      id: "21b1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245",
    },
    {
      id: "31c1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245",
    },
  ];

  const fullUsers = userIds.map(
    (user) =>
      ({
        ...user,
        createdAt: faker.date.recent(),
        updatedAt: faker.date.future(),
        name: faker.person.firstName(),
        role: "pleb",
        displayName: faker.person.middleName(),
        about: faker.person.bio(),
        image: faker.image.avatar(),
        banner: faker.image.urlLoremFlickr({ width: 800, height: 400 }),
        nip05: faker.internet.email(),
        lud06: faker.string.hexadecimal({ length: 64, prefix: '', casing: 'lower' }),
        lud16: faker.string.hexadecimal({ length: 64, prefix: '', casing: 'lower' }),
        website: faker.internet.url(),
        zapService: faker.internet.url(),
        lastLogin: faker.date.future(),
      }) as User,
  );

  const userStalls = userIds.map((user) => {
    return randomLengthArrayFromTo(4, 8).map((i) => {
      return {
        userId: user.id,
        createdAt: faker.date.recent(),
        updatedAt: faker.date.future(),
        id: faker.string.hexadecimal({ length: 64, prefix: '', casing: 'lower' }),
        name: faker.commerce.productMaterial(),
        description: faker.commerce.productDescription(),
        currency: faker.finance.currencyCode(),
      } as Stall;
    });
  });

  const productData = userStalls.map((stallsByUser) => {
    return stallsByUser.map((stall) => {
      return randomLengthArrayFromTo(3, 12).map((i) => {
        return {
          id: faker.string.hexadecimal({ length: 64, prefix: '', casing: 'lower' }),
          createdAt: faker.date.recent(),
          updatedAt: faker.date.future(),
          stallId: stall.id,
          userId: stall.userId,
          productName: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          price: faker.finance.amount(),
          productType: faker.helpers.arrayElement([
            "simple",
            "variable",
            "variation",
          ]),
          currency: faker.finance.currencyCode(),
          isDigital: faker.datatype.boolean({ probability: 0.8 }),
          parentId: null,
          stockQty: faker.number.int({ min: 0, max: 100 }),
        } as Product;
      });
    });
  });

  const paymentDetailsData = userStalls.map((stallsByUser) => {
    return stallsByUser.map((stall) => {
      return {
        paymentId: faker.string.uuid(),
        userId: stall.userId,
        stallId: stall.id,
        paymentMethod: faker.helpers.arrayElement([
          "ln",
          "on-chain",
          "cashu",
          "other",
        ]),
        paymentDetails: faker.finance.creditCardNumber(),
      } as PaymentDetail;
    });
  });

  const shippingData = userStalls.map((stallsByUser) => {
    return stallsByUser.map((stall) => {
      return {
        id: faker.string.uuid(),
        stallId: stall.id,
        userId: stall.userId,
        name: faker.commerce.productName(),
        shippingMethod: faker.helpers.arrayElement([
          "standard",
          "express",
          "overnight",
        ]),
        shippingDetails: faker.commerce.productDescription(),
        baseCost: faker.finance.amount(),
        isDefault: faker.datatype.boolean(),
      } as Shipping;
    });
  });

  const shippingZonesData = shippingData.map((shippingByStall) => {
    return shippingByStall.map((shipping) => {
      return {
        shippingId: shipping.id,
        stallId: shipping.stallId,
        shippingZoneId: faker.string.uuid(),
        regionCode: faker.location.countryCode(),
        countryCode: faker.location.countryCode(),
      } as ShippingZone;
    });
  });

  const auctionsData = userStalls.map((stallByUser) => {
    return stallByUser.map((stall) => {
      return {
        id: faker.string.hexadecimal({ length: 64, prefix: '', casing: 'lower' }),
        createdAt: faker.date.recent(),
        updatedAt: faker.date.future(),
        stallId: stall.id,
        userId: stall.userId,
        productName: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        startingBidAmount: faker.finance.amount(),
        endDate: faker.date.future(),
        currency: faker.finance.currencyCode(),
        specs: faker.commerce.productMaterial() || null,
        status: faker.helpers.arrayElement(["active", "ended", "canceled"]),
        stockQty: faker.number.int(),
      } as Auction;
    });
  });

  const bidsData = auctionsData.map((auctionByStall) => {
    return auctionByStall.map((auction) => {
      return {
        id: faker.string.hexadecimal({ length: 64, prefix: '', casing: 'lower' }),
        createdAt: faker.date.recent(),
        updatedAt: faker.date.future(),
        auctionId: auction.id,
        userId: faker.helpers.arrayElement(userIds).id,
        bidAmount: faker.finance.amount(),
        bidStatus: faker.helpers.arrayElement([
          "accepted",
          "rejected",
          "pending",
          "winner",
        ]),
      } as Bid;
    });
  });

  const ordersData = shippingData.map((shippingByStall) => {
    return shippingByStall.map((shipping) => {
      return randomLengthArrayFromTo(3, 12).map((i) => {
        return {
          id: faker.string.uuid(),
          createdAt: faker.date.recent(),
          updatedAt: faker.date.future(),
          sellerUserId: faker.helpers.arrayElement(userIds).id,
          buyerUserId: faker.helpers.arrayElement(userIds).id,
          status: faker.helpers.arrayElement([
            "confirmed",
            "pending",
            "shipped",
            "completed",
            "canceled",
          ]),
          shippingId: shipping.id,
          stallId: shipping.stallId,
          address: faker.location.streetAddress(),
          zip: faker.location.zipCode(),
          city: faker.location.city(),
          region: faker.location.state(),
          contactName: faker.person.firstName(),
          contactPhone: faker.phone.number(),
          contactEmail: faker.internet.email(),
          observations: faker.lorem.sentence(),
        } as Order;
      });
    });
  });

  const orderItemsData = ordersData.map((orders) => {
    return orders.flat(1).map((order) => {
      return {
        orderId: order.id,
        productId: faker.helpers.arrayElement(productData.flat(2)).id,
        qty: faker.number.int({ min: 1, max: 10 }),
      } as OrderItem;
    });
  });

  const invoicesData = ordersData.map((orders) => {
    return orders.flat(1).map((order) => {
      return {
        id: faker.string.uuid(),
        orderId: order.id,
        createdAt: faker.date.recent(),
        updatedAt: faker.date.future(),
        totalAmount: faker.finance.amount(),
        invoiceStatus: faker.helpers.arrayElement([
          "pending",
          "paid",
          "canceled",
          "refunded",
        ]),
        paymentMethod: faker.helpers.arrayElement([
          "ln",
          "on-chain",
          "cashu",
          "other",
        ]),
        paymentDetails: faker.finance.creditCardNumber(),
      } as Invoice;
    });
  });

  const categoryData = [
    {
      catId: faker.string.uuid(),
      catName: faker.commerce.department(),
      description: faker.commerce.productDescription(),
      parentId: null,
    },
  ] as Category[];

  const productCategoryData = productData.flat(2).map(
    (product) =>
      ({
        productId: product.id,
        catId: faker.helpers.arrayElement(categoryData).catId,
      }) as ProductCategory,
  );

  const digitalProductsData = productData
    .flat(2)
    .filter((product) => product.isDigital)
    .map(
      (product) =>
        ({
          productId: product.id,
          licenseKey: faker.string.hexadecimal({ length: 64, prefix: '', casing: 'lower' }),
          downloadLink: faker.internet.url(),
          mimeType: faker.helpers.arrayElement(allowedMimeTypes),
          sha256Hash: faker.string.hexadecimal({ length: 64, prefix: '', casing: 'lower' }),
        }) as DigitalProduct,
    );

  const productImagesData = productData.flat(2).map(
    (product) =>
      ({
        productId: product.id,
        imageUrl: faker.image.url(),
        imageType: faker.helpers.arrayElement(["main", "thumbnail", "gallery"]),
        imageOrder: faker.number.int({ min: 0, max: 5 }),
        createdAt: faker.date.recent(),
        updatedAt: faker.date.future(),
      }) as ProductImage,
  );

  const eventData = userIds.map(
    (user) =>
      ({
        id: faker.string.hexadecimal({ length: 64, prefix: '', casing: 'lower' }),
        createdAt: faker.date.recent(),
        updatedAt: faker.date.future(),
        eventAuthor: user.id,
        eventKind: faker.number.int(),
        event: faker.string.uuid(),
      }) as Event,
  );

  db.run(sql`PRAGMA foreign_keys = OFF;`);

  console.log("Reset start");
  const dbSchema = db._.fullSchema;
  await Promise.all([
    db.delete(dbSchema.categories),
    db.delete(dbSchema.stalls),
    db.delete(dbSchema.products),
    db.delete(dbSchema.productCategories),
    db.delete(dbSchema.productImages),
    db.delete(dbSchema.digitalProducts),
    db.delete(dbSchema.auctions),
    db.delete(dbSchema.bids),
    db.delete(dbSchema.orders),
    db.delete(dbSchema.orderItems),
    db.delete(dbSchema.invoices),
    db.delete(dbSchema.shipping),
    db.delete(dbSchema.shippingZones),
    db.delete(dbSchema.paymentDetails),
    db.delete(dbSchema.events),
    db.delete(dbSchema.users),
  ]);
  console.log("Reset done");

  console.log("Seed start");
  await db.transaction(async (tx) => {
    for (const { table, data } of [
      { table: dbSchema.users, data: fullUsers },
      { table: dbSchema.stalls, data: userStalls.flat(1) },
      { table: dbSchema.auctions, data: auctionsData.flat(2) },
      { table: dbSchema.bids, data: bidsData.flat(2) },
      { table: dbSchema.categories, data: categoryData },
      { table: dbSchema.products, data: productData.flat(2) },
      { table: dbSchema.digitalProducts, data: digitalProductsData },
      { table: dbSchema.productImages, data: productImagesData },
      { table: dbSchema.productCategories, data: productCategoryData },
      { table: dbSchema.paymentDetails, data: paymentDetailsData.flat(1) },
      { table: dbSchema.shipping, data: shippingData.flat(1) },
      { table: dbSchema.shippingZones, data: shippingZonesData.flat(1) },
      { table: dbSchema.orders, data: ordersData.flat(2) },
      { table: dbSchema.invoices, data: invoicesData.flat(1) },
      { table: dbSchema.orderItems, data: orderItemsData.flat(1) },
      { table: dbSchema.events, data: eventData },
    ]) {
      await tx.insert(table).values(data).execute();
    }
  });

  db.run(sql`PRAGMA foreign_keys = ON;`);

  console.log("Seed done");
};

await main();
