import type { NextPageWithLayout } from "@/pages/_app";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PRODUCT_CATEGORY } from "@prisma/client";
import Head from "next/head";

// external imports
import Button from "@/components/ui/Button";
import CustomDropzone from "@/components/ui/FileInput";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import { formatEnum } from "@/utils/format";

const schema = z.object({
  name: z.string().min(3),
  price: z.number().min(0),
  category: z.nativeEnum(PRODUCT_CATEGORY),
  description: z.string().min(3),
  image: z.unknown().refine((v) => v instanceof File, {
    message: "Image is required",
  }),
});

type Inputs = z.infer<typeof schema>;

const SellPage: NextPageWithLayout = () => {
  const router = useRouter();
  const [preview, setPreview] = useState<string | undefined>();

  const createMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success("Product listed successfully");
      router.push("/app/my-listings");
    },
    onError: (error) => {
      toast.error(`Failed to list product: ${error.message}`);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const reader = new FileReader();
    reader.readAsDataURL(data.image as File);
    reader.onload = async () => {
      const base64 = reader.result as string;
      await createMutation.mutateAsync({ ...data, image: base64 });
    };
  };

  return (
    <>
      <Head>
        <title>Sell an Item | Grove</title>
      </Head>
      <main className="min-h-screen pb-14 pt-48 md:pt-36">
        <div className="mx-auto w-full max-w-screen-sm px-4 sm:w-[95vw]">
          <h1 className="text-2xl font-bold text-title md:text-3xl mb-6">Sell an Item</h1>
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
              disabled={createMutation.isLoading}
            >
              {createMutation.isLoading ? "Listing..." : "List Item for Sale"}
            </Button>
          </form>
        </div>
      </main>
    </>
  );
};

export default SellPage;

SellPage.getLayout = (page) => <DefaultLayout>{page}</DefaultLayout>;