import type { Prisma } from "@prisma/client";
import { PRODUCT_CATEGORY } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { adminProcedure, router } from "../../trpc";

export const productsAdminRouter = router({
  get: adminProcedure
    .input(
      z.object({
        page: z.number().int().default(0),
        perPage: z.number().int().default(10),
        name: z.string().optional(),
        price: z.number().optional(),
        category: z.nativeEnum(PRODUCT_CATEGORY).optional(),
        rating: z.number().min(0).max(5).optional(),
        sortBy: z
          .enum([
            "name",
            "category",
            "quantity",
            "price",
            "rating",
            "createdAt",
          ])
          .optional(),
        sortDesc: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      const needFilter =
        input.name || input.price || input.category || input.rating;

      const params: Prisma.ProductFindManyArgs = {
        orderBy: input.sortBy
          ? { [input.sortBy]: input.sortDesc ? "desc" : "asc" }
          : undefined,
        where: needFilter
          ? {
              AND: {
                name: input.name ? { contains: input.name } : undefined,
                price: input.price ? { equals: input.price } : undefined,
                category: input.category
                  ? { equals: input.category }
                  : undefined,
                rating: input.rating ? { equals: input.rating } : undefined,
              },
            }
          : undefined,
      };

      const [count, products] = await ctx.prisma.$transaction([
        ctx.prisma.product.count({ where: params.where }),
        ctx.prisma.product.findMany({
          ...params,
          skip: input.page * input.perPage,
          take: input.perPage,
        }),
      ]);
      return { count, products };
    }),

  getOne: adminProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const product = await ctx.prisma.product.findUnique({
      where: {
        id: input,
      },
    });
    if (!product)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Product not found!",
      });
    return product;
  }),

  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(3),
        price: z.number().min(0),
        category: z.nativeEnum(PRODUCT_CATEGORY),
        description: z.string().min(3),
        image: z.string(),
        rating: z.number().min(0).max(5),
        quantity: z.number().default(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const uploadedPhoto = await ctx.cloudinary.uploader.upload(input.image, {
        resource_type: "image",
        format: "webp",
        folder: "amzn-store",
        transformation: [
          {
            width: 224,
            height: 224,
            quality: 80,
          },
        ],
      });
      const product = await ctx.prisma.product.create({
        data: {
          name: input.name,
          price: input.price,
          category: input.category,
          description: input.description,
          image: uploadedPhoto.secure_url,
          rating: input.rating,
          quantity: input.quantity,
          sellerId: ctx.session.user.id, // Add this line
        },
      });
      return product;
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(3),
        price: z.number().min(0),
        category: z.nativeEnum(PRODUCT_CATEGORY),
        description: z.string().min(3),
        image: z.string(),
        rating: z.number().min(0).max(5),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const uploadedPhoto = await ctx.cloudinary.uploader.upload(input.image, {
        resource_type: "image",
        format: "webp",
        folder: "amzn-store",
        transformation: [
          {
            width: 224,
            height: 224,
            quality: 80,
          },
        ],
      });
      const product = await ctx.prisma.product.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          price: input.price,
          category: input.category,
          description: input.description,
          image: uploadedPhoto.secure_url,
          rating: input.rating,
        },
      });
      return product;
    }),

  delete: adminProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    const product = await ctx.prisma.product.delete({
      where: {
        id: input,
      },
    });
    return product;
  }),

  prev: adminProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    const product = await ctx.prisma.product.findUnique({
      where: {
        id: input,
      },
    });
    if (!product)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Product not found!",
      });
    const prevProduct = await ctx.prisma.product.findFirst({
      where: {
        id: {
          lt: product.id,
        },
      },
      orderBy: {
        id: "desc",
      },
    });
    if (!prevProduct) {
      const lastProduct = await ctx.prisma.product.findFirst({
        orderBy: {
          id: "desc",
        },
      });
      return lastProduct;
    }
    return prevProduct;
  }),

  next: adminProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    const product = await ctx.prisma.product.findUnique({
      where: {
        id: input,
      },
    });
    if (!product)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Product not found!",
      });
    const nextProduct = await ctx.prisma.product.findFirst({
      where: {
        id: {
          gt: product.id,
        },
      },
      orderBy: {
        id: "asc",
      },
    });
    if (!nextProduct) {
      const firstProduct = await ctx.prisma.product.findFirst({
        orderBy: {
          id: "asc",
        },
      });
      return firstProduct;
    }
    return nextProduct;
  }),
});
