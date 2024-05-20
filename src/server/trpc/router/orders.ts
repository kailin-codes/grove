import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const ordersRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const orders = await ctx.prisma.order.findMany({
      where: {
        userId: ctx.session.user.id,
        archived: false,
      },
      include: {
        items: {
          include: {
            product: true,
          },
          where: {
            archived: false,
          },
        },
        address: true,
        paymentMethod: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return orders;
  }),

  getArchived: protectedProcedure.query(async ({ ctx }) => {
    const orders = await ctx.prisma.order.findMany({
      where: {
        userId: ctx.session.user.id,
        archived: true,
      },
      include: {
        items: {
          include: {
            product: true,
          },
          where: {
            archived: true,
          },
        },
        address: true,
        paymentMethod: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return orders;
  }),

  getOne: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const order = await ctx.prisma.order.findUnique({
      where: {
        id: input,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        address: true,
        paymentMethod: true,
      },
    });
    if (!order) {
      throw new Error("Order not found!");
    }
    return order;
  }),

  getItems: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const orderItems = await ctx.prisma.orderItem.findMany({
        where: {
          orderId: input,
        },
        include: {
          product: true,
        },
      });
      if (!orderItems) {
        throw new Error("Order not found!");
      }
      return orderItems;
    }),

  getUserItems: protectedProcedure.query(async ({ ctx }) => {
    const orderItems = await ctx.prisma.orderItem.findMany({
      where: {
        order: {
          userId: ctx.session.user.id,
        },
      },
      include: {
        product: true,
      },
    });
    if (!orderItems) {
      throw new Error("Order not found!");
    }
    return orderItems;
  }),

  updateItem: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        archived: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const orderItem = await ctx.prisma.orderItem.update({
        where: {
          id: input.id,
        },
        data: {
          archived: !input.archived,
        },
      });
      if (!orderItem) {
        throw new Error("Order item not found!");
      }
      const orderItems = await ctx.prisma.orderItem.findMany({
        where: {
          orderId: orderItem.orderId,
        },
      });
      const orderItemsArchived = orderItems.every((item) => item.archived);
      const order = await ctx.prisma.order.update({
        where: {
          id: orderItem.orderId,
        },
        data: {
          archived: orderItemsArchived,
        },
      });
      if (!order) {
        throw new Error("Order not found!");
      }
      return orderItem;
    }),

  create: protectedProcedure
    .input(z.object({
      items: z.array(z.object({
        productId: z.string(),
        productQuantity: z.number(),
      })),
      addressId: z.string(),
      paymentMethodId: z.string(),
      deliveryOption: z.string(),
      shippingCost: z.number(),
      tax: z.number(),
      total: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.prisma.order.create({
        data: {
          userId: ctx.session.user.id,
          addressId: input.addressId,
          paymentMethodId: input.paymentMethodId,
          deliveryOption: input.deliveryOption,
          shippingCost: input.shippingCost,
          tax: input.tax,
          total: input.total,
          items: {
            create: input.items.map(({ productId, productQuantity }) => ({
              productId,
              quantity: productQuantity,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          address: true,
          paymentMethod: true,
        },
      });
      return order;
    }),
});