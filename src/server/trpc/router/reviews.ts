import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../trpc";

export const reviewsRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        rating: z.number().min(1).max(5),
        comment: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { productId, rating, comment } = input;
      const review = await ctx.prisma.review.create({
        data: {
          productId,
          userId: ctx.session.user.id,
          rating,
          comment,
        },
      });
      // Update the product's average rating
      const reviews = await ctx.prisma.review.findMany({
        where: { productId },
      });
      const averageRating =
        reviews.reduce((sum, review) => sum + review.rating, 0) /
        reviews.length;
      await ctx.prisma.product.update({
        where: { id: productId },
        data: { rating: averageRating },
      });
      return review;
    }),

  getProductReviews: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input: productId }) => {
      const reviews = await ctx.prisma.review.findMany({
        where: { productId },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return reviews;
    }),

  getByUser: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const reviews = await ctx.prisma.review.findMany({
        where: { userId: input },
        include: { product: true },
        orderBy: { createdAt: 'desc' },
      });
      return reviews;
    }),
});
