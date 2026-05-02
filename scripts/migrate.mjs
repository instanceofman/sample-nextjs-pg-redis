// Idempotent migration runner. Reads every .sql file in ./drizzle and applies
// in lexical order. Each file is run in a transaction; CREATE statements use
// IF NOT EXISTS so reruns are safe.
import { readdirSync, readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import pg from "pg";

const { Client } = pg;

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("[migrate] DATABASE_URL is not set");
  process.exit(1);
}

const dir = resolve(process.cwd(), "drizzle");
const files = readdirSync(dir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

if (files.length === 0) {
  console.log("[migrate] no .sql files found in drizzle/, skipping");
  process.exit(0);
}

const client = new Client({ connectionString: url });
await client.connect();

try {
  for (const file of files) {
    const sql = readFileSync(join(dir, file), "utf8");
    console.log(`[migrate] applying ${file}`);
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("COMMIT");
  }
  console.log("[migrate] done");
} catch (err) {
  await client.query("ROLLBACK").catch(() => {});
  console.error("[migrate] failed:", err);
  process.exit(1);
} finally {
  await client.end();
}
