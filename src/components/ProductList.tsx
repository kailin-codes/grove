import { useCartStore } from "@/stores/cart";
import { formatCurrency, truncateText } from "@/utils/format";
import { renderStars } from "@/utils/render";
import type { Product } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { toast } from "react-hot-toast";
import Button from "./ui/Button";

type ProductListProps = {
  products: (Product & { averageRating: number; _count: { reviews: number } })[];
  isSearchResults?: boolean;
};

const ProductList = ({ products, isSearchResults = false }: ProductListProps) => {
  return (
    <section
      aria-label="product list"
      className="mx-auto w-full max-w-screen-2xl px-4 sm:w-[95vw]"
    >
      <h2 className="sr-only">Product list</h2>
      {isSearchResults ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <SlicedProducts products={products} range={{ from: 0, to: products.length }} />
        </div>
      ) : (
        <div className="grid grid-flow-row-dense gap-5 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <SlicedProducts products={products} range={{ from: 0, to: 4 }} />
          <Image
            src={`/img/advertisement-one.webp`}
            alt="advertisement one"
            width={1500}
            height={300}
            className="col-span-full"
            loading="lazy"
          />
          <div className="md:col-span-2">
            <SlicedProducts products={products} range={{ from: 4, to: 6 }} />
          </div>
          <SlicedProducts
            products={products}
            range={{ from: 6, to: products.length }}
          />
        </div>
      )}
    </section>
  );
};

export default ProductList;

type SlicedProductsProps = {
  products: (Product & { averageRating: number; _count: { reviews: number } })[];
  range: {
    from: number;
    to: number;
  };
};

const SlicedProducts = ({ products, range }: SlicedProductsProps) => {
  const cartStore = useCartStore((state) => ({
    products: state.products,
    addProduct: state.addProduct,
  }));

  return (
    <Fragment>
      {products.slice(range.from, range.to).map((product) => (
        <div
          key={product.id}
          className="flex flex-col gap-3 bg-white p-5 shadow transition-opacity hover:bg-opacity-80 active:bg-opacity-100"
        >
          <Link
            href={`/app/products/${product.id}`}
            className="relative mx-auto h-48 w-48"
          >
            <Image
              src={product.image}
              alt={product.name}
              width={192}
              height={192}
              className="absolute h-full w-full object-contain"
              loading="lazy"
            />
          </Link>
          <div className="flex items-center gap-1">
            {product.averageRating ? (
              <>
                {renderStars(product.averageRating)}
                <span className="text-sm text-gray-600">
                  {product.averageRating.toFixed(1)} ({product._count.reviews})
                </span>
              </>
            ) : (
              "-"
            )}
          </div>
          <Link href={`/app/products/${product.id}`}>
            <h2 className="text-sm font-medium text-title transition-colors line-clamp-1 hover:text-primary md:text-base">
              {product.name ?? "-"}
            </h2>
          </Link>
          <p className="text-xs font-medium text-text line-clamp-2 md:text-sm">
            {product.description ?? "-"}
          </p>
          {product.price ? (
            <p className="text-sm font-medium text-title md:text-base">
              {formatCurrency(product.price, "USD")}
            </p>
          ) : (
            "-"
          )}
          <Button
            aria-label="add product to cart"
            className="w-full bg-orange-300 text-title transition-colors hover:bg-primary active:bg-orange-300"
            onClick={() => {
              cartStore.addProduct(product);
              toast.success(`${truncateText(product.name, 16)} added to cart`);
            }}
          >
            Add to Cart
          </Button>
        </div>
      ))}
    </Fragment>
  );
};