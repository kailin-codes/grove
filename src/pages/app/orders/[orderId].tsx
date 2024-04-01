import { formatCurrency, formatEnum } from "@/utils/format";
import { trpc } from "@/utils/trpc";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Router from "next/router";
import type { NextPageWithLayout } from "../../_app";

// external imports
import DefaultLayout from "@/components/layouts/DefaultLayout";
import ErrorScreen from "@/components/screens/ErrorScreen";
import LoadingScreen from "@/components/screens/LoadingScreen";
import Button from "@/components/ui/Button";

const ShowOrder: NextPageWithLayout = () => {
  const orderId = Router.query.orderId as string;

  // get order query
  const orderQuery = trpc.orders.getOne.useQuery(orderId);

  if (orderQuery.isLoading) {
    return <LoadingScreen />;
  }

  if (orderQuery.isError) {
    return <ErrorScreen error={orderQuery.error} />;
  }

  const order = orderQuery.data;

  return (
    <>
      <Head>
        <title>Order Details | Grove</title>
      </Head>
      <main className="min-h-screen pb-14 pt-48 md:pt-36">
        <div className="mx-auto w-full max-w-screen-lg px-4 sm:w-[95vw]">
          <div className="mb-4">
            <Link href="/app/orders" className="text-blue-600 hover:underline">
              ← Back to orders
            </Link>
          </div>
          <h1 className="mb-6 text-2xl font-bold">Order Details</h1>
          <div className="mb-6 rounded-md border p-6">
            <div className="mb-4 flex justify-between">
              <div>
                <p className="font-semibold">
                  Ordered on {new Date(order.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">Order# {order.id}</p>
              </div>
              <Button className="rounded bg-gray-200 px-4 py-2 text-gray-800">
                View or Print invoice
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <h3 className="mb-2 font-semibold">Shipping Address</h3>
                <p>{order.address?.name}</p>
                <p>{order.address?.street}</p>
                <p>
                  {order.address?.city}, {order.address?.state}{" "}
                  {order.address?.zipCode}
                </p>
                <p>{order.address?.country}</p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Payment Method</h3>
                <p>
                  {order.paymentMethod?.type} ending in{" "}
                  {order.paymentMethod?.cardNumber.slice(-4)}
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Order Summary</h3>
                <p>
                  Item(s) Subtotal:{" "}
                  {formatCurrency(
                    order.total - order.tax - order.shippingCost,
                    "USD"
                  )}
                </p>
                <p>
                  Shipping & Handling:{" "}
                  {formatCurrency(order.shippingCost, "USD")}
                </p>
                <p>
                  Total before tax:{" "}
                  {formatCurrency(order.total - order.tax, "USD")}
                </p>
                <p>
                  Estimated tax to be collected:{" "}
                  {formatCurrency(order.tax, "USD")}
                </p>
                <p className="font-semibold">
                  Grand Total: {formatCurrency(order.total, "USD")}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-md border p-6">
            <h2 className="mb-4 text-2xl font-bold">
              {order.status === "DELIVERED" ? "Delivered" : "Arriving Soon"}
            </h2>
            {order.items.map((item) => (
              <div
                key={item.id}
                className="mb-4 flex items-start border-b pb-4"
              >
                <Image
                  src={item.product.image}
                  alt={item.product.name}
                  width={80}
                  height={80}
                  className="mr-4 h-20 w-20 object-contain"
                />
                <div className="flex-grow">
                  <h3 className="font-semibold">{item.product.name}</h3>
                  <p className="text-sm text-gray-600">
                    {formatEnum(item.product.category)}
                  </p>
                  <p className="font-semibold">
                    {formatCurrency(item.product.price * item.quantity, "USD")}
                  </p>
                  <p className="text-sm text-gray-600">
                    Quantity: {item.quantity}
                  </p>
                  <div className="mt-2">
                    <Link href={`/app/products/${item.productId}`}>
                      <Button className="mr-2 rounded bg-yellow-400 px-3 py-1 text-sm">
                        Buy it again
                      </Button>
                    </Link>
                    <Link
                      href={`/app/reviews/create?productId=${item.productId}`}
                    >
                      <Button className="rounded border border-gray-300 px-3 py-1 text-sm">
                        Write a product review
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default ShowOrder;

ShowOrder.getLayout = (page) => <DefaultLayout>{page}</DefaultLayout>;
