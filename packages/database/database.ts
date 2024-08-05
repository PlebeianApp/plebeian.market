import { createRequire } from 'node:module'
import { drizzle } from 'drizzle-orm/better-sqlite3'

import config from './drizzle.config'
import * as schema from './schema'

const require = createRequire(import.meta.url)

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
const Database = require('better-sqlite3') as typeof import('better-sqlite3')

const sqlite = new Database(config.dbCredentials.url)
export const db = drizzle(sqlite, { schema })
