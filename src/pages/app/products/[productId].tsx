import { useCartStore } from "@/stores/cart";
import { formatCurrency, truncateText } from "@/utils/format";
import { trpc } from "@/utils/trpc";
import type { Product } from "@prisma/client";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import type { NextPageWithLayout } from "../../_app";
import Button from "@/components/ui/Button";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import ErrorScreen from "@/components/screens/ErrorScreen";
import LoadingScreen from "@/components/screens/LoadingScreen";
import { renderStars } from "@/utils/render";

const ShowProduct: NextPageWithLayout = () => {
  const router = useRouter();
  const productId = router.query.productId as string;
  
  const productQuery = trpc.products.getOne.useQuery(productId);
  const reviewsQuery = trpc.reviews.getProductReviews.useQuery(productId);
  
  const cartStore = useCartStore((state) => ({
    addProduct: state.addProduct,
  }));

  if (productQuery.isLoading || reviewsQuery.isLoading) {
    return <LoadingScreen />;
  }

  if (productQuery.isError) {
    return <ErrorScreen error={productQuery.error} />;
  }

  if (reviewsQuery.isError) {
    return <ErrorScreen error={reviewsQuery.error} />;
  }

  const averageRating = productQuery.data.averageRating;

  return (
    <>
      <Head>
        <title>{productQuery.data.name ?? "Product"} | Grove</title>
      </Head>
      <main className="min-h-screen pb-14 pt-48 md:pt-40 lg:pt-36">
        <div className="mx-auto w-full max-w-screen-2xl px-4 sm:w-[95vw]">
          <div className="mx-auto flex w-full flex-col items-center gap-5 md:w-1/2">
            <Image
              src={productQuery.data.image}
              alt={productQuery.data.name}
              width={224}
              height={224}
              className="h-56 w-56 object-contain"
              loading="lazy"
            />
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-center text-xl font-semibold md:text-3xl">
                {productQuery.data.name}
              </h1>
              <p className="text-center text-sm text-lowkey md:text-base">
                {productQuery.data.description}
              </p>
              <p className="text-xl font-semibold md:text-2xl">
                {formatCurrency(productQuery.data.price, "USD")}
              </p>
              <div className="flex items-center gap-2">
                {renderStars(averageRating, reviewsQuery.data.length)}
              </div>
              <Button
                aria-label="add product to cart"
                className="mt-1.5 bg-orange-300 px-5 text-title transition-colors hover:bg-primary active:bg-orange-300"
                onClick={() => {
                  cartStore.addProduct(productQuery.data as Product);
                  toast.success(
                    `${truncateText(
                      productQuery.data?.name as string,
                      16
                    )} added to cart`
                  );
                }}
              >
                Add to Cart
              </Button>
            </div>
          </div>
          <div className="mt-8">
            <h2 className="text-lg font-semibold">Reviews ({reviewsQuery.data.length})</h2>
            {reviewsQuery.data.map((review) => (
              <div key={review.id} className="mt-4 border-t pt-4">
                <Link href={`/users/${review.userId}`}>
                  <span className="font-semibold hover:underline cursor-pointer">{review.user.name}</span>
                </Link>
                <div className="flex items-center gap-2">
                  {renderStars(review.rating)}
                </div>
                <p>{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default ShowProduct;

ShowProduct.getLayout = (page) => <DefaultLayout>{page}</DefaultLayout>;