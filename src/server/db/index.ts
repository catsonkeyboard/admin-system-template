import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

const dbPath = (process.env.DATABASE_URL ?? 'file:./dev.db').replace('file:', '')

const sqlite = new Database(dbPath)

// 开启 WAL 模式，提升并发性能
sqlite.pragma('journal_mode = WAL')

export const db = drizzle(sqlite, { schema })

export type DB = typeof db
