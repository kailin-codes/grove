import type { NextPageWithLayout } from "@/pages/_app";
import type { OrderItemWithProduct, OrderWithItems } from "@/types/globals";
import { formatCurrency, formatEnum } from "@/utils/format";
import { trpc } from "@/utils/trpc";
import { Tab } from "@headlessui/react";
import { useIsMutating } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Router from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

// external imports
import Button from "@/components/ui/Button";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import ErrorScreen from "@/components/screens/ErrorScreen";
import LoadingScreen from "@/components/screens/LoadingScreen";

const Orders: NextPageWithLayout = () => {
  // redirect to signin page if unauthenticated
  const { status } = useSession();
  useEffect(() => {
    if (status === "unauthenticated") {
      Router.push("/api/auth/signin");
    }
  }, [status]);

  // get queries
  const utils = trpc.useContext();
  const ordersQuery = trpc.orders.get.useQuery();
  const archivedOrdersQuery = trpc.orders.getArchived.useQuery();
  const userListingsQuery = trpc.products.getUserListings.useQuery();

  // refetch queries
  const number = useIsMutating();
  useEffect(() => {
    if (number === 0) {
      utils.orders.get.invalidate();
      utils.orders.getArchived.invalidate();
      utils.products.getUserListings.invalidate();
    }
  }, [number, utils]);

  // headlessui tab
  const [selectedIndex, setSelectedIndex] = useState(0);
  const tabs = [{ name: "Orders" }, { name: "Archived orders" }, { name: "My Sales" }];

  // set tab index based on query
  useEffect(() => {
    if (Router.query.tab === "archived") {
      setSelectedIndex(1);
    } else if (Router.query.tab === "sales") {
      setSelectedIndex(2);
    }
  }, []);

  const [timeFrame, setTimeFrame] = useState("past 3 months");

  if (ordersQuery.isLoading || archivedOrdersQuery.isLoading || userListingsQuery.isLoading) {
    return <LoadingScreen />;
  }

  if (ordersQuery.isError) {
    return <ErrorScreen error={ordersQuery.error} />;
  }

  if (archivedOrdersQuery.isError) {
    return <ErrorScreen error={archivedOrdersQuery.error} />;
  }

  if (userListingsQuery.isError) {
    return <ErrorScreen error={userListingsQuery.error} />;
  }

  const hasOrders = ordersQuery.data?.length > 0 || archivedOrdersQuery.data?.length > 0;
  const hasListings = userListingsQuery.data?.length > 0;

  if (!hasOrders && !hasListings) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="text-xl font-semibold text-title md:text-3xl">
          You have no orders or listings
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Your Orders | Grove</title>
      </Head>
      <main className="min-h-screen pb-14 pt-48 md:pt-36">
        <div className="mx-auto w-full max-w-screen-lg px-4 sm:w-[95vw]">
          <h1 className="text-2xl font-bold text-title md:text-3xl mb-6">
            Your Orders and Sales
          </h1>
          <div className="mb-4 flex justify-between items-center">
            <div className="flex items-center">
              <input type="text" placeholder="Search all orders" className="border p-2 rounded-l-md" />
              <button className="bg-gray-200 text-gray-800 p-2 rounded-r-md">Search Orders</button>
            </div>
          </div>
          <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
            <Tab.List className="flex gap-5 mb-4">
              {tabs.map((tab) => (
                <Tab
                  key={tab.name}
                  className="text-sm font-medium text-link ring-2 ring-white hover:text-opacity-80 focus:outline-none ui-selected:border-b-2 ui-selected:border-primary ui-selected:font-bold ui-selected:text-title md:text-base"
                >
                  {tab.name}
                </Tab>
              ))}
            </Tab.List>
            <p className="mb-4">
              {selectedIndex === 2
                ? `${userListingsQuery.data?.length} listings`
                : `${(selectedIndex === 0 ? ordersQuery.data : archivedOrdersQuery.data)?.length} orders placed in`}
              <select value={timeFrame} onChange={(e) => setTimeFrame(e.target.value)} className="ml-2 border rounded">
                <option value="past 3 months">past 3 months</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
            </p>
            <Tab.Panels>
              <Tab.Panel>
                {ordersQuery.data?.every(
                  (order) => order.items.length === 0
                ) ? (
                  <div className="mt-40 grid place-items-center">
                    <div className="text-xl font-semibold text-title md:text-3xl">
                      You have no unarchived orders
                    </div>
                  </div>
                ) : (
                  <GroupedOrders data={ordersQuery.data} />
                )}
              </Tab.Panel>
              <Tab.Panel>
                {archivedOrdersQuery.data?.every(
                  (order) => order.items.length === 0
                ) ? (
                  <div className="mt-40 grid place-items-center">
                    <div className="text-xl font-semibold text-title md:text-3xl">
                      You have no archived orders
                    </div>
                  </div>
                ) : (
                  <GroupedOrders data={archivedOrdersQuery.data} />
                )}
              </Tab.Panel>
              <Tab.Panel>
                {userListingsQuery.data?.length === 0 ? (
                  <div className="mt-40 grid place-items-center">
                    <div className="text-xl font-semibold text-title md:text-3xl">
                      You have no listings
                    </div>
                  </div>
                ) : (
                  <UserListings data={userListingsQuery.data} />
                )}
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </main>
    </>
  );
};

export default Orders;

Orders.getLayout = (page) => <DefaultLayout>{page}</DefaultLayout>;

// GroupedOrders
const GroupedOrders = ({ data }: { data: OrderWithItems[] }) => {
  return (
    <div className="mt-5 grid gap-8">
      {data
        .filter((order) => order.items.length > 0)
        .map((order) => (
          <div key={order.id} className="border p-4 rounded-md">
            <div className="flex justify-between mb-4">
              <div>
                <p className="font-semibold">ORDER PLACED</p>
                <p>{dayjs(order.createdAt).format("DD MMM YYYY")}</p>
              </div>
              <div>
                <p className="font-semibold">TOTAL</p>
                <p>{formatCurrency(order.total, "USD")}</p>
              </div>
              <div>
                <p className="font-semibold">SHIP TO</p>
                <p>{order.address?.name} ▼</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">ORDER # {order.id}</p>
                <Link href={`/app/orders/${order.id}`} className="text-blue-600 hover:underline">
                  View order details
                </Link>
                <p><Link href="#" className="text-blue-600 hover:underline">View invoice</Link></p>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-green-700">
                {order.status === "DELIVERED" ? "Delivered" : "Arriving Soon"}
              </h3>
              {order.items.map((item) => (
                <Item key={item.id} item={item} />
              ))}
            </div>
          </div>
        ))}
    </div>
  );
};

// Item
const Item = ({ item }: { item: OrderItemWithProduct }) => {
  // update item mutation
  const updateItemMutation = trpc.orders.updateItem.useMutation({
    onSuccess: async () => {
      toast.success(item.archived ? "Item unarchived!" : "Item archived!");
    },
    onError: async (err) => {
      toast.error(err.message);
    },
  });

  return (
    <div className="flex items-start mt-2 pb-2 border-b">
      <Image
        src={item.product.image}
        alt={item.product.name}
        width={80}
        height={80}
        loading="lazy"
        className="h-20 w-20 object-contain mr-4"
      />
      <div className="flex-grow">
        <div className="text-sm font-medium text-title line-clamp-2 md:text-base">
          {item.product.name}
        </div>
        <span className="text-xs font-medium text-lowkey line-clamp-1 md:text-sm">
          {formatEnum(item.product.category)}
        </span>
        <div className="text-xs font-medium text-lowkey md:text-sm">
          {`${item.quantity} x ${formatCurrency(item.product.price, "USD")} = ${formatCurrency(
            item.product.price * item.quantity,
            "USD"
          )}`}
        </div>
        <div className="mt-2 flex space-x-2">
          <Link href={`/app/products/${item.productId}`}>
            <Button
              variant="yellow"
              aria-label="go to product"
              className="text-xs px-2 py-1 rounded"
            >
              Buy it again
            </Button>
          </Link>
          <Button
            variant="gray"
            aria-label={item.archived ? "unarchive" : "archive"}
            className="text-xs px-2 py-1 rounded"
            onClick={() => {
              updateItemMutation.mutateAsync({
                id: item.id,
                archived: item.archived,
              });
            }}
            disabled={updateItemMutation.isLoading}
          >
            {updateItemMutation.isLoading
              ? item.archived
                ? "Unarchiving..."
                : "Archiving..."
              : item.archived
              ? "Unarchive"
              : "Archive"}
          </Button>
          <Link href={`/app/reviews/create?productId=${item.productId}`}>
            <Button
              variant="gray"
              aria-label="leave a review"
              className="text-xs px-2 py-1 rounded"
            >
              Write a product review
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Define a more specific type for the UserListings component
type UserListing = {
  id: string;
  image: string;
  name: string;
  category: string;
  price: number;
};

// UserListings
const UserListings = ({ data }: { data: UserListing[] }) => {
  return (
    <div className="mt-5 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {data.map((listing) => (
        <div key={listing.id} className="border p-4 rounded-md">
          <Image
            src={listing.image}
            alt={listing.name}
            width={150}
            height={150}
            className="mx-auto mb-4"
          />
          <h3 className="text-lg font-semibold mb-2">{listing.name}</h3>
          <p className="text-gray-600 mb-2">{formatEnum(listing.category)}</p>
          <p className="font-bold mb-4">{formatCurrency(listing.price, "USD")}</p>
          <div className="flex justify-between">
            <Link href={`/app/edit-listing/${listing.id}`}>
              <Button variant="yellow" className="text-sm">Edit</Button>
            </Link>
            <Link href={`/app/products/${listing.id}`}>
              <Button variant="blue" className="text-sm">View</Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};
