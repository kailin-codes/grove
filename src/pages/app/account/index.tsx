import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import type { NextPageWithLayout } from "../../_app";

// external imports
import DefaultLayout from "@/components/layouts/DefaultLayout";

const Account: NextPageWithLayout = () => {
  const { status } = useSession();

  const accountLinks = [
    {
      name: "Your Orders",
      description: "Track, return, or buy things again",
      href: "/app/orders",
    },
    {
      name: "Login & security",
      description: "Edit login, name, and mobile number",
      href:
        status === "authenticated" ? "/app/account/update" : "/api/auth/signin",
    },
    {
      name: "Prime",
      description: "View benefits and payment settings",
      href:
        status === "authenticated" ? "/app/account/prime" : "/api/auth/signin",
    },
    {
      name: "Gift cards",
      description: "View balance, redeem, or reload cards",
      href: "##",
    },
    {
      name: "Your Payments",
      description: "View all transactions, manage payment methods and settings",
      href: "##",
    },
    {
      name: "Your Profiles",
      description:
        "Manage, add, or remove user profiles for personalized experiences",
      href: "##",
    },
    {
      name: "Digital Services and Device Support",
      description: "Troubleshoot device issues",
      href: "##",
    },
    {
      name: "Your Messages",
      description: "View messages to and from Amazon, sellers, and buyers",
      href: "##",
    },
    {
      name: "Archived orders",
      description: "View and manage your archived orders",
      href:
        status === "authenticated"
          ? "/app/orders?tab=archived"
          : "/api/auth/signin",
    },
    {
      name: "Your Lists",
      description: "View, modify, and share your lists, or create new ones",
      href: "##",
    },
    {
      name: "Customer Service",
      href: "##",
    },
  ];

  return (
    <>
      <Head>
        <title>Account | Grove</title>
      </Head>
      <main className="min-h-screen pb-14 pt-48 md:pt-36">
        <div className="mx-auto w-full max-w-screen-lg px-4 sm:w-[95vw]">
          <h1 className="text-xl font-medium text-title md:text-2xl">
            Your Account
          </h1>
          <div className="mt-4 grid gap-5 xs:grid-cols-2 md:grid-cols-3">
            {accountLinks.map((link) => (
              <Link
                href={link.href}
                key={link.name}
                className="flex flex-col gap-1 rounded-md p-4 ring-1 ring-neutral-300 transition hover:bg-neutral-100"
              >
                <span className="text-base font-medium text-title md:text-lg">
                  {link.name}
                </span>
                {link.description ? (
                  <span className="text-xs text-text md:text-sm">
                    {link.description}
                  </span>
                ) : null}
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default Account;

Account.getLayout = (page) => <DefaultLayout>{page}</DefaultLayout>;
