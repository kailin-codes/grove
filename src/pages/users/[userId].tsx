import { useRouter } from 'next/router';
import { trpc } from "@/utils/trpc";
import Head from "next/head";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import type { NextPageWithLayout } from "../_app";
import Link from 'next/link';
import { renderStars } from "@/utils/render";
import Image from 'next/image';

const UserProfile: NextPageWithLayout = () => {
  const router = useRouter();
  const { userId } = router.query;

  const { data: user, isLoading, error } = trpc.users.getOne.useQuery(userId as string, {
    enabled: !!userId,
  });

  const { data: reviews } = trpc.reviews.getByUser.useQuery(userId as string, {
    enabled: !!userId,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred: {error.message}</div>;
  if (!user) return <div>User not found</div>;

  return (
    <>
      <Head>
        <title>{user.name}&apos;s Profile | Grove</title>
      </Head>
      <main className="min-h-screen pb-14 pt-48 md:pt-36">
        <div className="mx-auto w-full max-w-screen-lg px-4 sm:w-[95vw]">
          <h1 className="text-2xl font-medium text-title mb-4">{user.name}&apos;s Profile</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Image
                src={user.image || "/img/default-avatar.png"}
                alt={user.name || "User avatar"}
                width={200}
                height={200}
                className="w-full rounded-full"
              />
            </div>
            <div className="md:col-span-2">
              <h2 className="text-xl font-medium mb-2">Reviews ({reviews?.length || 0})</h2>
              {reviews && reviews.length > 0 ? (
                <ul className="space-y-4">
                  {reviews.map((review) => (
                    <li key={review.id} className="border-b pb-4">
                      <Link href={`/app/products/${review.product.id}`}>
                        <span className="font-medium hover:underline cursor-pointer">{review.product.name}</span>
                      </Link>
                      <div className="flex items-center mb-1">
                        <div className="flex">{renderStars(review.rating)}</div>
                        <span className="ml-2">{review.rating.toFixed(1)}/5</span>
                      </div>
                      <p className="text-sm text-gray-600">{review.comment}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Posted on {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No reviews yet.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default UserProfile;

UserProfile.getLayout = (page) => <DefaultLayout>{page}</DefaultLayout>;
