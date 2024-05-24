import type { Order, OrderItem, Product, Address, PaymentMethod } from "@prisma/client";

export type OrderItemWithProduct = OrderItem & { product: Product };

export type OrderWithItems = Order & {
  items: OrderItemWithProduct[];
  address: Address | null;
  paymentMethod: PaymentMethod | null;
};