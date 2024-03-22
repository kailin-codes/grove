import type { NextPageWithLayout } from "@/pages/_app";
import { useCartStore } from "@/stores/cart";
import Head from "next/head";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import Cart from "@/components/Cart";
import Link from "next/link";

const CartPage: NextPageWithLayout = () => {
  const cartStore = useCartStore((state) => ({
    products: state.products,
  }));

  return (
    <>
      <Head>
        <title>Cart | Grove</title>
      </Head>
      <main className="min-h-screen bg-bg-gray pb-14 pt-48 md:pt-40 lg:pt-36">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Cart products={cartStore.products} />
          {cartStore.products.length > 0 && (
            <div className="mt-8 text-right">
              <Link
                href="/app/checkout"
                className="bg-yellow-400 text-black font-bold py-2 px-4 rounded"
              >
                Proceed to Checkout
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default CartPage;

CartPage.getLayout = (page) => <DefaultLayout>{page}</DefaultLayout>;