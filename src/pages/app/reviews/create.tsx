import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "react-hot-toast";
import Head from "next/head";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import Button from "@/components/ui/Button";
import type { NextPageWithLayout } from "../../_app";

const CreateReview: NextPageWithLayout = () => {
  const router = useRouter();
  const { productId } = router.query;

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const createReviewMutation = trpc.products.createReview.useMutation({
    onSuccess: () => {
      toast.success("Review submitted successfully!");
      router.push(`/app/products/${productId}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof productId !== "string") {
      toast.error("Invalid product ID");
      return;
    }
    createReviewMutation.mutate({ productId, rating, comment });
  };

  return (
    <>
      <Head>
        <title>Leave a Review | Grove</title>
      </Head>
      <main className="min-h-screen pb-14 pt-48 md:pt-40 lg:pt-36">
        <div className="mx-auto w-full max-w-screen-sm px-4">
          <h1 className="mb-6 text-2xl font-semibold">Leave a Review</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="rating" className="block text-sm font-medium text-gray-700">
                Rating
              </label>
              <select
                id="rating"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value}>
                    {value} star{value !== 1 && "s"}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                Comment
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder="Write your review here..."
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary text-white"
              disabled={createReviewMutation.isLoading}
            >
              {createReviewMutation.isLoading ? "Submitting..." : "Submit Review"}
            </Button>
          </form>
        </div>
      </main>
    </>
  );
};

CreateReview.getLayout = (page) => <DefaultLayout>{page}</DefaultLayout>;

export default CreateReview;