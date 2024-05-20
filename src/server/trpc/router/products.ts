import { PRODUCT_CATEGORY } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../trpc";

export const productsRouter = router({
  get: publicProcedure.query(async ({ ctx }) => {
    const products = await ctx.prisma.product.findMany({
      orderBy: [
        { category: 'asc' },
        { createdAt: 'desc' }
      ],
      include: {
        reviews: true,
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { reviews: true }
        }
      },
    });
    return products.map(product => ({
      ...product,
      averageRating: product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0
    }));
  }),

  getOne: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const product = await ctx.prisma.product.findUnique({
      where: {
        id: input,
      },
      include: {
        reviews: true,
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { reviews: true }
        }
      },
    });
    if (!product) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Product not found!",
      });
    }
    const averageRating = product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
      : 0;
    return {
      ...product,
      averageRating,
    };
  }),

  getCategories: publicProcedure.query(async ({ ctx }) => {
    const categories = await ctx.prisma.product.findMany({
      select: {
        category: true,
      },
      distinct: ['category'],
      orderBy: {
        category: 'asc',
      },
    });
    return categories.map(c => c.category);
  }),

  getByCategory: publicProcedure
    .input(z.nativeEnum(PRODUCT_CATEGORY))
    .query(async ({ ctx, input }) => {
      const products = await ctx.prisma.product.findMany({
        where: {
          category: input,
        },
        include: {
          reviews: true,
          seller: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: { reviews: true }
          }
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return products.map(product => ({
        ...product,
        averageRating: product.reviews.length > 0
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
          : 0
      }));
    }),

  search: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input }) => {
      const products = await ctx.prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: input.query } },
            { description: { contains: input.query } },
          ],
        },
        include: {
          reviews: true,
          seller: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: { reviews: true }
          }
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return products.map(product => ({
        ...product,
        averageRating: product.reviews.length > 0
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
          : 0
      }));
    }),

  getSuggestions: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!input.query) {
        return [];
      }
      const products = await ctx.prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: input.query } },
            { description: { contains: input.query } },
          ],
        },
        select: {
          name: true,
          category: true,
        },
        take: 5,
      });

      const suggestions = products.map(product => ({
        query: product.name,
        category: product.category,
      }));

      return suggestions;
    }),

  createReview: protectedProcedure
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
        reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
      await ctx.prisma.product.update({
        where: { id: productId },
        data: { rating: averageRating },
      });
      return review;
    }),

  getReviews: publicProcedure
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
          createdAt: 'desc',
        },
      });
      return reviews;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3),
        price: z.number().min(0),
        category: z.nativeEnum(PRODUCT_CATEGORY),
        description: z.string().min(3),
        image: z.string(),
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
          sellerId: ctx.session.user.id,
        },
      });
      return product;
    }),

  getUserListings: protectedProcedure
    .query(async ({ ctx }) => {
      const listings = await ctx.prisma.product.findMany({
        where: {
          sellerId: ctx.session.user.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return listings;
    }),

  updateListing: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(3),
        price: z.number().min(0),
        category: z.nativeEnum(PRODUCT_CATEGORY),
        description: z.string().min(3),
        image: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const product = await ctx.prisma.product.findUnique({
        where: { id: input.id },
      });

      if (!product || product.sellerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this listing",
        });
      }

      let imageUrl = product.image;
      if (input.image) {
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
        imageUrl = uploadedPhoto.secure_url;
      }

      const updatedProduct = await ctx.prisma.product.update({
        where: { id: input.id },
        data: {
          name: input.name,
          price: input.price,
          category: input.category,
          description: input.description,
          image: imageUrl,
        },
      });

      return updatedProduct;
    }),

  deleteListing: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const product = await ctx.prisma.product.findUnique({
        where: { id: input },
      });

      if (!product || product.sellerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete this listing",
        });
      }

      await ctx.prisma.product.delete({
        where: { id: input },
      });

      return { success: true };
    }),
});
