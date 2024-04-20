import { Stall, User } from "./types";
import { faker } from "@faker-js/faker";
import { db } from "./database";
import { stalls, users } from "./schema";

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
        updatedAt: faker.date.recent(),
        name: faker.person.firstName(),
        role: "pleb",
        displayName: faker.person.middleName(),
        about: faker.person.bio(),
        image: faker.image.avatar(),
        banner: faker.image.urlLoremFlickr({ width: 800, height: 400 }),
        nip05: faker.internet.url(),
        lud06: faker.string.hexadecimal({ length: 32 }),
        lud16: faker.string.hexadecimal({ length: 64 }),
        website: faker.internet.url(),
        zapService: faker.internet.url(),
        lastLogin: faker.date.recent(),
      }) as User,
  );

  const userStalls = userIds.map(
    (user) =>
      ({
        userId: user.id,
        createdAt: faker.date.recent(),
        updatedAt: faker.date.recent(),
        id: faker.string.uuid(),
        name: faker.commerce.productMaterial(),
        description: faker.commerce.productDescription(),
        currency: faker.finance.currencyCode(),
      }) as Stall,
  );

  console.log("Reset start");
  await Promise.all([db.delete(stalls), db.delete(users)]);
  console.log("Reset done");

  console.log("Seed start");
  await Promise.all([
    db.insert(users).values(fullUsers).execute(),
    db.insert(stalls).values(userStalls).execute(),
  ]);
  console.log("Seed done");
};

main();
