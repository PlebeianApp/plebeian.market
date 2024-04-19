import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import config from './drizzle.config'

const sqlite = new Database(config.dbCredentials.url);
export const db = drizzle(sqlite, { schema });
