import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const usersRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const users = await ctx.prisma.user.findMany();
    return users;
  }),

  getOne: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({
      where: {
        id: input,
      },
    });
    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found!",
      });
    }
    return user;
  }),

  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),

  getSubscriptionStatus: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session.user?.id) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Could not find user",
      });
    }
    const user = await ctx.prisma.user.findUnique({
      where: {
        id: ctx.session.user?.id,
      },
      select: {
        stripeSubscriptionStatus: true,
      },
    });
    if (!user) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Could not find user",
      });
    }
    return user.stripeSubscriptionStatus;
  }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(3).max(50),
        email: z.string().email(),
        phone: z.string().min(10).max(11),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          email: input.email,
          phone: input.phone,
        },
      });
      return user;
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.delete({
        where: {
          id: input,
        },
      });
      return user;
    }),

  getAddresses: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user?.id) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    const addresses = await ctx.prisma.address.findMany({
      where: { userId: ctx.session.user.id },
    });
    return addresses;
  }),

  getPaymentMethods: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user?.id) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    const paymentMethods = await ctx.prisma.paymentMethod.findMany({
      where: { userId: ctx.session.user.id },
    });
    return paymentMethods;
  }),

  addAddress: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        street: z.string(),
        city: z.string(),
        state: z.string(),
        zipCode: z.string(),
        country: z.string(),
        isDefault: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const address = await ctx.prisma.address.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      });
      return address;
    }),

  addPaymentMethod: protectedProcedure
    .input(
      z.object({
        type: z.string(),
        cardNumber: z.string(),
        nameOnCard: z.string(),
        expirationDate: z.string(),
        isDefault: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      if (input.isDefault) {
        await ctx.prisma.paymentMethod.updateMany({
          where: { userId: ctx.session.user.id },
          data: { isDefault: false },
        });
      }

      const paymentMethod = await ctx.prisma.paymentMethod.create({
        data: {
          type: input.type,
          cardNumber: input.cardNumber,
          nameOnCard: input.nameOnCard,
          expirationDate: input.expirationDate,
          isDefault: input.isDefault,
          userId: ctx.session.user.id,
        },
      });
      return paymentMethod;
    }),

  getWithReviews: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input },
        include: {
          reviews: {
            include: {
              product: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found!",
        });
      }

      return user;
    }),
});