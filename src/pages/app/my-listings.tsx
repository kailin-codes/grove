import type { NextPageWithLayout } from "@/pages/_app";
import { trpc } from "@/utils/trpc";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

import DefaultLayout from "@/components/layouts/DefaultLayout";
import Button from "@/components/ui/Button";
import ErrorScreen from "@/components/screens/ErrorScreen";
import LoadingScreen from "@/components/screens/LoadingScreen";
import { formatCurrency, formatEnum } from "@/utils/format";

const MyListings: NextPageWithLayout = () => {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    }
  }, [status, router]);

  const { data: listings, isLoading, isError, error, refetch } = trpc.products.getUserListings.useQuery();

  const deleteMutation = trpc.products.deleteListing.useMutation({
    onSuccess: () => {
      toast.success("Listing deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete listing: ${error.message}`);
    },
  });

  if (isLoading) return <LoadingScreen />;
  if (isError) return <ErrorScreen error={error} />;

  return (
    <>
      <Head>
        <title>My Listings | Grove</title>
      </Head>
      <main className="min-h-screen pb-14 pt-48 md:pt-36">
        <div className="mx-auto w-full max-w-screen-lg px-4 sm:w-[95vw]">
          <h1 className="text-2xl font-bold text-title md:text-3xl mb-6">My Listings</h1>
          <Link href="/app/sell">
            <Button className="mb-4">Create New Listing</Button>
          </Link>
          {listings && listings.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <div key={listing.id} className="border p-4 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">{listing.name}</h2>
                  <p className="text-sm text-gray-600 mb-2">{formatEnum(listing.category)}</p>
                  <p className="font-bold mb-2">{formatCurrency(listing.price, "USD")}</p>
                  <div className="flex justify-between items-center mt-4">
                    <Link href={`/app/edit-listing/${listing.id}`}>
                      <Button variant="yellow" className="text-sm">Edit</Button>
                    </Link>
                    <Button
                      variant="red"
                      className="text-sm"
                      onClick={() => deleteMutation.mutate(listing.id)}
                      disabled={deleteMutation.isLoading}
                    >
                      {deleteMutation.isLoading ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>You don&apos;t have any listings yet.</p>
          )}
        </div>
      </main>
    </>
  );
};

export default MyListings;

MyListings.getLayout = (page) => <DefaultLayout>{page}</DefaultLayout>;
