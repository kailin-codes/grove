import type { NextPageWithLayout } from "@/pages/_app";
import Head from "next/head";
import { useRouter } from "next/router";
import { trpc } from "@/utils/trpc";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useState, useEffect } from "react";
import { PRODUCT_CATEGORY } from "@prisma/client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { SubmitHandler } from "react-hook-form";
import { TRPCClientError } from "@trpc/client";

// external imports
import Button from "@/components/ui/Button";
import CustomDropzone from "@/components/ui/FileInput";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import ErrorScreen from "@/components/screens/ErrorScreen";
import LoadingScreen from "@/components/screens/LoadingScreen";
import { formatEnum } from "@/utils/format";

const schema = z.object({
  name: z.string().min(3),
  price: z.number().min(0),
  category: z.nativeEnum(PRODUCT_CATEGORY),
  description: z.string().min(3),
  image: z.unknown().optional(),
});

type Inputs = z.infer<typeof schema>;

interface FormData {
  id: string;
  name: string;
  price: number;
  category: PRODUCT_CATEGORY;
  description: string;
  image?: string;
}

const EditListing: NextPageWithLayout = () => {
  const router = useRouter();
  const { productId } = router.query;

  const [preview, setPreview] = useState<string | undefined>();

  const { data: product, isLoading, isError } = trpc.products.getOne.useQuery(productId as string, {
    enabled: !!productId,
  });

  const updateMutation = trpc.products.updateListing.useMutation({
    onSuccess: () => {
      toast.success("Product updated successfully!");
      router.push("/app/my-listings");
    },
    onError: (error) => {
      toast.error(`Failed to update product: ${error.message}`);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: product ?? undefined,
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        price: product.price,
        category: product.category,
        description: product.description,
      });
      setPreview(product.image);
    }
  }, [product, reset]);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (typeof productId !== 'string') return;

    const formData: FormData = {
      id: productId,
      name: data.name,
      price: data.price,
      category: data.category,
      description: data.description,
    };

    if (data.image instanceof File) {
      const reader = new FileReader();
      reader.readAsDataURL(data.image);
      reader.onload = async () => {
        const base64 = reader.result as string;
        await updateMutation.mutateAsync({ ...formData, image: base64 });
      };
    } else {
      await updateMutation.mutateAsync(formData);
    }
  };

  if (isLoading) return <LoadingScreen />;
  if (isError) return <ErrorScreen error={new TRPCClientError("Failed to load product")} />;

  return (
    <>
      <Head>
        <title>Edit Listing | Grove</title>
      </Head>
      <main className="min-h-screen pb-14 pt-48 md:pt-36">
        <div className="mx-auto w-full max-w-screen-sm px-4 sm:w-[95vw]">
          <h1 className="text-2xl font-bold text-title md:text-3xl mb-6">Edit Listing</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                {...register("name")}
                id="name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
              <input
                {...register("price", { valueAsNumber: true })}
                id="price"
                type="number"
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
              <select
                {...register("category")}
                id="category"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              >
                {Object.values(PRODUCT_CATEGORY).map((category) => (
                  <option key={category} value={category}>
                    {formatEnum(category)}
                  </option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                {...register("description")}
                id="description"
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
            </div>
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700">Image</label>
              <CustomDropzone<Inputs>
                id="image"
                name="image"
                setValue={setValue}
                preview={preview}
                setPreview={setPreview}
              />
              {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={updateMutation.isLoading}
            >
              {updateMutation.isLoading ? "Updating..." : "Update Listing"}
            </Button>
          </form>
        </div>
      </main>
    </>
  );
};

export default EditListing;

EditListing.getLayout = (page) => <DefaultLayout>{page}</DefaultLayout>;
