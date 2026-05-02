# Vane sample — Next.js (T3 stack) + Postgres 18 + Redis 8

Sample app dùng để test deploy bằng [vane](../../vane3/). Stack:

- **Next.js 15** (App Router, Turbopack dev)
- **TypeScript**, **Tailwind CSS v4**
- **tRPC v11** + **TanStack Query**
- **Drizzle ORM** + `node-postgres` → **Postgres 18**
- **ioredis** → **Redis 8**

## Tính năng

- `/` — visitor counter dùng Redis `INCR`, guestbook insert/select Postgres qua Drizzle.
- `/api/health` — ping cả Postgres và Redis. Trả `200` nếu cả hai OK, `503` nếu một bên fail. Dùng cho health check của vane.
- `/api/trpc/*` — tRPC endpoint.

## Env vars

| Tên | Bắt buộc | Mô tả |
|---|---|---|
| `DATABASE_URL` | ✅ | Postgres connection string, vd `postgres://user:pass@host:5432/db` |
| `REDIS_URL` | ✅ | Redis connection string, vd `redis://host:6379` |
| `PORT` | ❌ | Port Next.js listen (mặc định `3000`, vane sẽ tự inject) |

Xem [.env.example](.env.example).

## Migrations

`npm start` chạy [scripts/migrate.mjs](scripts/migrate.mjs) trước khi `next start`. Script này apply mọi file `.sql` trong [drizzle/](drizzle/) theo thứ tự lexical. Mỗi statement dùng `IF NOT EXISTS` nên rerun an toàn (idempotent).

Để regenerate SQL từ schema:

```bash
npm run db:generate
```

## Run local

```bash
# 1. Spin up Postgres 18 + Redis 8 bằng docker
docker run -d --name pg18 -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:18
docker run -d --name redis8 -p 6379:6379 redis:8

# 2. Cấu hình env
cp .env.example .env

# 3. Install + dev
npm install
npm run dev
```

Mở http://localhost:3000.

## Deploy bằng vane

Trên control panel vane:

1. **Tạo Postgres service** → ghi nhớ `DATABASE_URL` mà vane sinh ra.
2. **Tạo Redis service** → ghi nhớ `REDIS_URL`.
3. **Tạo App** từ git repo này, set:
   - Build: railpack tự detect Next.js (không cần Dockerfile).
   - Start command: `npm start` (mặc định của railpack).
   - Env vars: `DATABASE_URL`, `REDIS_URL` từ bước 1-2.
   - Health check path: `/api/health`.
4. Deploy. Migration sẽ chạy trong start command, sau đó Next.js boot.

## Cấu trúc

```
src/
├── app/
│   ├── api/health/route.ts        # /api/health → ping pg + redis
│   ├── api/trpc/[trpc]/route.ts   # tRPC fetch handler
│   ├── layout.tsx                 # bọc TRPCReactProvider
│   ├── page.tsx                   # UI: visitor counter + guestbook
│   └── globals.css                # Tailwind v4 import
├── server/
│   ├── api/
│   │   ├── routers/
│   │   │   ├── guestbook.ts       # list / add (Postgres)
│   │   │   └── stats.ts           # visitorCount / bumpVisitor (Redis)
│   │   ├── root.ts                # appRouter
│   │   └── trpc.ts                # context + initTRPC
│   ├── db/
│   │   ├── index.ts               # drizzle + pg Pool
│   │   └── schema.ts              # guestbook table
│   └── redis.ts                   # ioredis client
└── trpc/
    └── react.tsx                  # client provider
scripts/
└── migrate.mjs                    # idempotent SQL runner
drizzle/
└── 0000_init.sql                  # CREATE TABLE IF NOT EXISTS guestbook
```
