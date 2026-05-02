import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/server/db";
import { redis } from "@/server/redis";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const result = {
    ok: true as boolean,
    postgres: "unknown" as "ok" | "fail" | "unknown",
    redis: "unknown" as "ok" | "fail" | "unknown",
    error: undefined as string | undefined,
  };

  try {
    await db.execute(sql`select 1`);
    result.postgres = "ok";
  } catch (err) {
    result.postgres = "fail";
    result.ok = false;
    result.error = err instanceof Error ? err.message : String(err);
  }

  try {
    const pong = await redis.ping();
    result.redis = pong === "PONG" ? "ok" : "fail";
    if (result.redis === "fail") result.ok = false;
  } catch (err) {
    result.redis = "fail";
    result.ok = false;
    result.error = result.error ?? (err instanceof Error ? err.message : String(err));
  }

  return NextResponse.json(result, { status: result.ok ? 200 : 503 });
}
