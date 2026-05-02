import { createTRPCRouter } from "@/server/api/trpc";
import { guestbookRouter } from "@/server/api/routers/guestbook";
import { statsRouter } from "@/server/api/routers/stats";

export const appRouter = createTRPCRouter({
  guestbook: guestbookRouter,
  stats: statsRouter,
});

export type AppRouter = typeof appRouter;
