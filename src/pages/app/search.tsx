import type { NextPageWithLayout } from "@/pages/_app";
import { trpc } from "@/utils/trpc";
import Head from "next/head";
import { useRouter } from "next/router";
import ProductList from "@/components/ProductList";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import ErrorScreen from "@/components/screens/ErrorScreen";
import LoadingScreen from "@/components/screens/LoadingScreen";

const SearchResults: NextPageWithLayout = () => {
  const router = useRouter();
  const { q } = router.query;

  const searchQuery = trpc.products.search.useQuery(
    { query: q as string },
    {
      enabled: !!q,
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );

  if (searchQuery.isLoading) {
    return <LoadingScreen />;
  }

  if (searchQuery.isError) {
    return <ErrorScreen error={searchQuery.error} />;
  }

  return (
    <>
      <Head>
        <title>Search Results for &quot;{q}&quot; | Grove</title>
      </Head>
      <main className="min-h-screen bg-bg-gray pb-14 pt-48 md:pt-40 lg:pt-36">
        <div className="mx-auto w-full max-w-screen-2xl px-4 sm:w-[95vw]">
          <h1 className="mb-4 text-2xl font-bold">Search Results for &quot;{q}&quot;</h1>
          {searchQuery.data.length === 0 ? (
            <p>No results found for &quot;{q}&quot;. Please try a different search term.</p>
          ) : (
            <ProductList products={searchQuery.data} isSearchResults={true} />
          )}
        </div>
      </main>
    </>
  );
};

export default SearchResults;

SearchResults.getLayout = (page) => <DefaultLayout>{page}</DefaultLayout>;
