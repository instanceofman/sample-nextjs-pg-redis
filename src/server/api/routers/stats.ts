import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

const VISITOR_KEY = "vane:sample:visitors";

export const statsRouter = createTRPCRouter({
  bumpVisitor: publicProcedure.mutation(async ({ ctx }) => {
    const count = await ctx.redis.incr(VISITOR_KEY);
    return { count };
  }),

  visitorCount: publicProcedure.query(async ({ ctx }) => {
    const raw = await ctx.redis.get(VISITOR_KEY);
    return { count: raw ? Number(raw) : 0 };
  }),
});
