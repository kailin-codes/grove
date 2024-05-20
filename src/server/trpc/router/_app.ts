import { router } from "../trpc";
import { adminRouter } from "./admin";
import { ordersRouter } from "./orders";
import { productsRouter } from "./products";
import { stripeRouter } from "./stripe";
import { usersRouter } from "./users";
import { reviewsRouter } from "./reviews";

export const appRouter = router({
  users: usersRouter,
  products: productsRouter,
  orders: ordersRouter,
  stripe: stripeRouter,
  admin: adminRouter,
  reviews: reviewsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;