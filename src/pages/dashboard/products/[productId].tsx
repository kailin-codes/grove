import { formatEnum } from "@/utils/format";
import { trpc } from "@/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { PRODUCT_CATEGORY } from "@prisma/client";
import { useIsMutating } from "@tanstack/react-query";
import Head from "next/head";
import Router from "next/router";
import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "react-hot-toast";
import { z } from "zod";
import type { NextPageWithLayout } from "../../_app";

// external imports
import Button from "@/components/ui/Button";
import CustomDropzone from "@/components/ui/FileInput";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import ErrorScreen from "@/components/screens/ErrorScreen";
import LoadingScreen from "@/components/screens/LoadingScreen";
import {
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon,
} from "@heroicons/react/20/solid";

const schema = z.object({
  name: z.string().min(3),
  price: z.number().min(0),
  category: z.nativeEnum(PRODUCT_CATEGORY),
  description: z.string().min(3),
  image: z.unknown().refine((v) => v instanceof File, {
    message: "Expected File, received unknown",
  }),
  rating: z.number().min(0).max(5),
});
type Inputs = z.infer<typeof schema>;

const UpdateProduct: NextPageWithLayout = () => {
  const productId = Router.query.productId as string;
  const [preview, setPreview] = useState<string | undefined>();

  // get product query
  const productQuery = trpc.admin.products.getOne.useQuery(productId, {
    enabled: Boolean(productId),
  });

  // update product mutation
  const updateProductMutation = trpc.admin.products.update.useMutation({
    onSuccess: async () => {
      toast.success("Product updated!");
    },
    onError: async (err) => {
      toast.error(err.message);
    },
  });
  // react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<Inputs>({ resolver: zodResolver(schema) });

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const reader = new FileReader();
    reader.readAsDataURL(data.image as File);
    reader.onload = async () => {
      const base64 = reader.result;
      await updateProductMutation.mutateAsync({
        id: productId,
        ...data,
        image: base64 as string,
      });
    };
  };

  // delete product mutation
  const deleteProductMutation = trpc.admin.products.delete.useMutation({
    onSuccess: async () => {
      toast.success("Product deleted!");
      Router.push("/dashboard/products");
    },
    onError: async (err) => {
      toast.error(err.message);
    },
  });

  // prev product mutation
  const prevProductMutation = trpc.admin.products.prev.useMutation({
    onSuccess: async (data) => {
      if (!data) {
        return toast.error("No previous product!");
      }
      await Router.push(`/dashboard/products/${data.id}`);
      reset();
      setPreview(data.image);
    },
    onError: async (err) => {
      toast.error(err.message);
    },
  });

  // next product mutation
  const nextProductMutation = trpc.admin.products.next.useMutation({
    onSuccess: async (data) => {
      if (!data) {
        return toast.error("No next product!");
      }
      await Router.push(`/dashboard/products/${data.id}`);
      reset();
      setPreview(data.image);
    },
    onError: async (err) => {
      toast.error(err.message);
    },
  });

  // refetch queries
  const utils = trpc.useContext();
  const number = useIsMutating();
  useEffect(() => {
    if (number === 0) {
      utils.admin.products.getOne.invalidate(productId);
      utils.products.get.invalidate();
    }
  }, [number, productId, utils]);

  // setPreview
  useEffect(() => {
    if (!productQuery.data?.image) return;
    setPreview(productQuery.data.image);
  }, [productQuery.data?.image]);

  if (productQuery.isLoading) {
    return <LoadingScreen />;
  }

  if (productQuery.isError) {
    return <ErrorScreen error={productQuery.error} />;
  }

  return (
    <>
      <Head>
        <title>Update Product | Grove</title>
      </Head>
      <main className="min-h-screen pb-14 pt-52 md:pt-40">
        <div className="mx-auto grid w-full max-w-screen-sm gap-4 px-4 sm:w-[95vw]">
          <div className="flex items-center justify-between">
            <button
              aria-label="navigate back to products page"
              className="flex-1"
              onClick={() => Router.push("/dashboard/products")}
            >
              <ArrowLeftCircleIcon
                className="aspect-square w-10 text-primary transition-colors hover:text-orange-300 active:text-orange-500"
                aria-hidden="true"
              />
            </button>
            <div className="flex items-center">
              <button
                aria-label="navigate to previous product page"
                onClick={() => prevProductMutation.mutateAsync(productId)}
              >
                <ArrowLeftCircleIcon
                  className="aspect-square w-10 text-primary transition-colors hover:text-orange-300 active:text-orange-500"
                  aria-hidden="true"
                />
              </button>
              <button
                aria-label="navigate to next product page"
                onClick={() => nextProductMutation.mutateAsync(productId)}
              >
                <ArrowRightCircleIcon
                  className="aspect-square w-10 text-primary transition-colors hover:text-orange-300 active:text-orange-500"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
          <div className="grid gap-4">
            <form
              aria-label="update product form"
              className="grid gap-2.5 whitespace-nowrap"
              onSubmit={handleSubmit(onSubmit)}
            >
              <fieldset className="grid gap-2">
                <label
                  htmlFor="update-product-name"
                  className="text-xs font-medium text-title md:text-sm"
                >
                  Product name
                </label>
                <input
                  type="text"
                  id="update-product-name"
                  className="w-full px-4 py-2.5 text-xs font-medium text-title transition-colors placeholder:text-lowkey/80 md:text-sm"
                  placeholder="Product name"
                  {...register("name", { required: true })}
                  defaultValue={productQuery.data?.name}
                />
                {errors.name ? (
                  <p className="text-sm font-medium text-danger">
                    {errors.name.message}
                  </p>
                ) : null}
              </fieldset>
              <fieldset className="grid gap-2">
                <label
                  htmlFor="update-product-price"
                  className="text-xs font-medium text-title md:text-sm"
                >
                  Product price
                </label>
                <input
                  type="number"
                  step="any"
                  id="update-product-price"
                  className="w-full px-4 py-2.5 text-xs font-medium text-title transition-colors placeholder:text-lowkey/80 md:text-sm"
                  placeholder="Product price"
                  {...register("price", {
                    required: true,
                    valueAsNumber: true,
                  })}
                  defaultValue={productQuery.data?.price}
                />
                {errors.price ? (
                  <p className="text-sm font-medium text-danger">
                    {errors.price.message}
                  </p>
                ) : null}
              </fieldset>
              <fieldset className="grid gap-2">
                <label
                  htmlFor="update-product-category"
                  className="text-xs font-medium text-title md:text-sm"
                >
                  Product category
                </label>
                <select
                  id="update-product-category"
                  className="w-full px-4 py-2.5 text-xs font-medium text-title transition-colors md:text-sm"
                  {...register("category", { required: true })}
                  defaultValue={productQuery.data?.category}
                >
                  <option value="" hidden>
                    Select category
                  </option>
                  {Object.values(PRODUCT_CATEGORY).map((category) => (
                    <option key={category} value={category}>
                      {formatEnum(category)}
                    </option>
                  ))}
                </select>
                {errors.category ? (
                  <p className="text-sm font-medium text-danger">
                    {errors.category.message}
                  </p>
                ) : null}
              </fieldset>
              <fieldset className="grid gap-2">
                <label
                  htmlFor="update-user-name"
                  className="text-xs font-medium text-title md:text-sm"
                >
                  Product description
                </label>
                <textarea
                  cols={25}
                  rows={5}
                  id="update-product-description"
                  className="h-32 w-full px-4 py-2.5 text-xs font-medium text-title transition-colors placeholder:text-lowkey/80 md:text-sm"
                  placeholder="Product description"
                  {...register("description", { required: true })}
                  defaultValue={productQuery.data?.description}
                />
                {errors.description ? (
                  <p className="text-sm font-medium text-danger">
                    {errors.description.message}
                  </p>
                ) : null}
              </fieldset>
              <fieldset className="grid gap-2">
                <label
                  htmlFor="update-product-image"
                  className="text-xs font-medium text-title md:text-sm"
                >
                  Product image
                </label>
                <CustomDropzone<Inputs>
                  id="update-product-image"
                  name="image"
                  setValue={setValue}
                  preview={preview}
                  setPreview={setPreview}
                />
                {errors.image ? (
                  <p className="text-sm font-medium text-danger">
                    {errors.image.message}
                  </p>
                ) : null}
              </fieldset>
              <fieldset className="grid gap-2">
                <label
                  htmlFor="update-product-rating"
                  className="text-xs font-medium text-title md:text-sm"
                >
                  Product ratings
                </label>
                <input
                  type="number"
                  step="any"
                  id="update-product-rating"
                  className="w-full px-4 py-2.5 text-xs font-medium text-title transition-colors placeholder:text-lowkey/80 md:text-sm"
                  placeholder="Product ratings"
                  {...register("rating", {
                    required: true,
                    valueAsNumber: true,
                  })}
                  defaultValue={productQuery.data?.rating}
                />
                {errors.rating ? (
                  <p className="text-sm font-medium text-danger">
                    {errors.rating.message}
                  </p>
                ) : null}
              </fieldset>
              <Button
                aria-label="update product"
                className="w-full"
                disabled={updateProductMutation.isLoading}
              >
                {updateProductMutation.isLoading
                  ? "Loading..."
                  : "Update product"}
              </Button>
            </form>
            <Button
              aria-label="delete product"
              className="w-full bg-danger"
              onClick={() => deleteProductMutation.mutateAsync(productId)}
              disabled={deleteProductMutation.isLoading}
            >
              {deleteProductMutation.isLoading
                ? "Loading..."
                : "Delete product"}
            </Button>
          </div>
        </div>
      </main>
    </>
  );
};

export default UpdateProduct;

UpdateProduct.getLayout = (page) => <DefaultLayout>{page}</DefaultLayout>;
