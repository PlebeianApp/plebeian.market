import { migrate } from 'drizzle-orm/better-sqlite3/migrator'

import { db } from './index'

migrate(db, { migrationsFolder: 'drizzle' })
