import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Config } from "drizzle-kit";

const dbPath = path.resolve(
  process.cwd(),
  "..",
  "..",
  "sqlite.db",
);

export default {
  schema: "./schema.ts",
  out: "./drizzle",
  driver: "better-sqlite",
  dbCredentials: {
    url: dbPath,
  },
} satisfies Config;
