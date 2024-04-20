import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import config from "./drizzle.config";

import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const Database = require("better-sqlite3") as typeof import('better-sqlite3');

const sqlite = new Database(config.dbCredentials.url);
export const db = drizzle(sqlite, { schema });
