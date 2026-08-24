// One-off migration: applies supabase/schema.sql to the Supabase Postgres DB.
// Uses the NON-POOLING connection string (direct, supports DDL).
// Usage: SUPABASE_DB_URL="postgres://...:5432/postgres" node scripts/migrate.mjs

import { readFile } from 'node:fs/promises';
import pg from 'pg';

const url = process.env.SUPABASE_DB_URL;
if (!url) {
  console.error('Missing SUPABASE_DB_URL (use the non-pooling connection string, port 5432).');
  process.exit(1);
}

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  const sql = await readFile(new URL('../supabase/schema.sql', import.meta.url), 'utf8');
  await client.query(sql);
  console.log('Migration applied OK.');
} finally {
  await client.end();
}
