import path from "node:path";
import type { Config } from "drizzle-kit";

const dbPath = path.resolve(process.cwd(), "..", "..", "sqlite.db");

export default {
  schema: "./schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: dbPath,
  },
} satisfies Config;
