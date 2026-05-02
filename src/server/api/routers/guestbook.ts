import { desc } from "drizzle-orm";
import { z } from "zod";
import { guestbook } from "@/server/db/schema";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const guestbookRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(guestbook)
      .orderBy(desc(guestbook.createdAt))
      .limit(50);
  }),

  add: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).max(64),
        message: z.string().min(1).max(500),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .insert(guestbook)
        .values({ name: input.name, message: input.message })
        .returning();
      return row;
    }),
});
