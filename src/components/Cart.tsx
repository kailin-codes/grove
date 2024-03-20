import { useCartStore } from "@/stores/cart";
import { formatCurrency, formatEnum } from "@/utils/format";
import { type Product } from "@prisma/client";
import Image from "next/image";
import { useState } from "react";

const Cart = ({ products }: { products: Product[] }) => {
  const totalPrice = products.reduce(
    (acc, product) => acc + product.price * product.quantity,
    0
  );
  const totalQuantity = products.reduce(
    (acc, product) => acc + product.quantity,
    0
  );

  // cart store
  const cartStore = useCartStore((state) => ({
    removeProducts: state.removeProducts,
  }));

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      {products.length <= 0 ? (
        <div className="grid gap-1.5 bg-white px-5 pb-10 pt-8">
          <h1 className="text-2xl text-title md:text-3xl">
            Your cart is empty.
          </h1>
          <p className="text-xs font-medium text-text md:text-sm">
            Your Shopping Cart lives to serve. Give it purpose — fill it with
            groceries, clothing, household supplies, electronics, and more.
          </p>
        </div>
      ) : (
        <div className="flex flex-col justify-between gap-5">
          <div className="grid flex-[0.8] gap-5 bg-white px-5 pb-7 pt-5 md:pt-8">
            <div className="flex justify-between gap-4 md:border-b-2 md:border-neutral-200 md:pb-4">
              <span>
                <h1 className="text-xl text-title md:text-3xl">
                  Shopping Cart
                </h1>
                <button
                  className="mt-1 text-xs font-medium text-link transition hover:text-primary hover:underline sm:text-sm"
                  onClick={() => {
                    cartStore.removeProducts(
                      products.map((product) => product.id)
                    );
                  }}
                >
                  Remove all products
                </button>
              </span>
              <span className="hidden place-self-end text-xs font-medium text-text md:block md:text-sm">
                Price
              </span>
            </div>
            <div className="grid gap-5">
              {products.map((product) => (
                <ProductCard product={product} key={product.id} />
              ))}
            </div>
            <div className="ml-auto text-base font-semibold">
              Subtotal ({totalQuantity} {totalQuantity > 1 ? "items" : "item"})
              :{" "}
              <span className="font-bold">
                {formatCurrency(totalPrice, "USD")}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;

const ProductCard = ({ product }: { product: Product }) => {
  const [selectedQuantity, setSelectedQuantity] = useState(product.quantity);

  // zustand
  const cartStore = useCartStore((state) => ({
    removeProduct: state.removeProduct,
    setQuantity: state.setQuantity,
  }));

  return (
    <div className="flex flex-col gap-4 border-b-2 pb-4 md:flex-row md:items-center md:justify-between md:border-neutral-200">
      <div className="flex gap-2">
        <Image
          src={product.image}
          alt={product.name}
          className="h-28 min-w-[112px] object-contain"
          width={112}
          height={112}
          loading="lazy"
        />
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-title line-clamp-2 sm:text-base">
            {product.name}
          </span>
          <span className="block text-base font-bold text-text md:hidden">
            {product.price ? formatCurrency(product.price, "USD") : "-"}
          </span>
          <span className="text-xs font-bold capitalize tracking-wide text-text">
            {formatEnum(product.category)}
          </span>
          <div className="mt-2.5 flex flex-wrap gap-5 divide-x-2 divide-neutral-200">
            <select
              name="quantity"
              id="product-quantity"
              className="cursor-pointer rounded-sm py-1 text-xs font-medium text-title transition-colors hover:bg-neutral-100 active:bg-white md:text-sm"
              value={selectedQuantity}
              onChange={(e) => {
                setSelectedQuantity(Number(e.target.value));
                cartStore.setQuantity(product.id, Number(e.target.value));
              }}
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((quantity) => (
                <option key={quantity} value={quantity} className="font-medium">
                  {quantity}
                </option>
              ))}
            </select>
            <button
              aria-label="delete product"
              className="w-fit px-4 text-xs font-medium text-link hover:underline sm:text-sm"
              onClick={() => cartStore.removeProduct(product.id)}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
      <span className="hidden self-start text-xs font-medium text-text sm:text-sm md:block">
        {product.price ? formatCurrency(product.price, "USD") : "-"}
      </span>
    </div>
  );
};