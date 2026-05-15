import { Module } from '@nestjs/common'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from '../db/schema'

export const DRIZZLE = Symbol('DRIZZLE')

export type DB = ReturnType<typeof createDrizzleInstance>

function createDrizzleInstance() {
  const dbPath = (process.env.DATABASE_URL ?? 'file:./dev.db').replace('file:', '')
  const sqlite = new Database(dbPath)

  // 开启 WAL 模式，提升并发性能
  sqlite.pragma('journal_mode = WAL')

  return drizzle(sqlite, { schema })
}

@Module({
  providers: [
    {
      provide: DRIZZLE,
      useFactory: () => createDrizzleInstance(),
    },
  ],
  exports: [DRIZZLE],
})
export class DatabaseModule {}
