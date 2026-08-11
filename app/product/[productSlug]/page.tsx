import {
  StockAvailabillity,
  UrgencyText,
  ProductGallery,
  ProductTabs,
  SingleProductDynamicFields,
  ProductItem,
} from "@/components";
import apiClient from "@/lib/api";
import { notFound } from "next/navigation";
import React from "react";
import { FaSquareFacebook } from "react-icons/fa6";
import { FaSquareXTwitter } from "react-icons/fa6";
import { FaSquarePinterest } from "react-icons/fa6";
import { sanitize } from "@/lib/sanitize";
import Image from "next/image";

export const revalidate = 30;

interface ImageItem {
  imageID: string;
  productID: string;
  image: string;
}

interface SingleProductPageProps {
  params: Promise<{ productSlug: string }>;
}

const SingleProductPage = async ({ params }: SingleProductPageProps) => {
  const paramsAwaited = await params;
  // sending API request for a single product with a given product slug
  const data = await apiClient.get(
    `/api/slugs/${paramsAwaited?.productSlug}`,
    { next: { revalidate: 30, tags: ["products"] } }
  );
  const product = await data.json();

  if (!product || product.error) {
    notFound();
  }

  // sending API request for more than 1 product image if it exists
  let images: ImageItem[] = [];
  try {
    const imagesData = await apiClient.get(
      `/api/images/${product?.id}`,
      { next: { revalidate: 30, tags: ["products"] } }
    );
    const parsedImages = await imagesData.json();
    images = Array.isArray(parsedImages) ? parsedImages : [];
  } catch (error) {
    images = [];
  }

  // related products from the same category (excluding the current product)
  let relatedProducts: any[] = [];
  try {
    const relatedData = await apiClient.get(
      `/api/products?filters[category][$equals]=${encodeURIComponent(
        product?.category?.name || ""
      )}&filters[price][$lte]=50000&sort=defaultSort&page=1`,
      { next: { revalidate: 30, tags: ["products"] } }
    );
    const related = await relatedData.json();
    relatedProducts = Array.isArray(related)
      ? related.filter((item: any) => item.id !== product.id).slice(0, 4)
      : [];
  } catch (error) {
    relatedProducts = [];
  }

  const hasSale = Boolean(product?.salePrice) && product?.salePrice < product?.price;
  const displayPrice = hasSale ? product?.salePrice : product?.price;
  const discountPercent = hasSale
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  return (
    <div className="bg-white">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex justify-center gap-x-16 pt-10 max-lg:flex-col items-center gap-y-5 px-5">
          <div>
            <ProductGallery
              mainImage={product?.mainImage}
              images={images}
              alt={sanitize(product?.title) || "main image"}
            />
          </div>
          <div className="flex flex-col gap-y-7 text-black max-[500px]:text-center">
            <h1 className="text-3xl">{sanitize(product?.title)}</h1>
            <div className="flex items-center gap-x-3 max-[500px]:justify-center">
              <p className="text-xl font-semibold">
                PKR {displayPrice?.toLocaleString()}
              </p>
              {hasSale && (
                <>
                  <p className="text-lg font-medium text-stone-400 line-through">
                    PKR {product?.price?.toLocaleString()}
                  </p>
                  <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-bold uppercase text-white">
                    -{discountPercent}%
                  </span>
                </>
              )}
            </div>
            <StockAvailabillity stock={94} inStock={product?.inStock} />
            <SingleProductDynamicFields product={product} />
            <div className="flex flex-col gap-y-2 max-[500px]:items-center">
              <p className="text-lg">
                SKU: <span className="ml-1">abccd-18</span>
              </p>
              <div className="text-lg flex gap-x-2">
                <span>Share:</span>
                <div className="flex items-center gap-x-1 text-2xl">
                  <FaSquareFacebook />
                  <FaSquareXTwitter />
                  <FaSquarePinterest />
                </div>
              </div>
              <div className="flex gap-x-2">
                <Image
                  src="/visa.svg"
                  width={50}
                  height={50}
                  alt="visa icon"
                  className="w-auto h-auto"
                />
                <Image
                  src="/mastercard.svg"
                  width={50}
                  height={50}
                  alt="mastercard icon"
                  className="h-auto w-auto"
                />
                <Image
                  src="/ae.svg"
                  width={50}
                  height={50}
                  alt="americal express icon"
                  className="h-auto w-auto"
                />
                <Image
                  src="/paypal.svg"
                  width={50}
                  height={50}
                  alt="paypal icon"
                  className="w-auto h-auto"
                />
                <Image
                  src="/dinersclub.svg"
                  width={50}
                  height={50}
                  alt="diners club icon"
                  className="h-auto w-auto"
                />
                <Image
                  src="/discover.svg"
                  width={50}
                  height={50}
                  alt="discover icon"
                  className="h-auto w-auto"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="py-16">
          <ProductTabs product={product} />
        </div>

        {relatedProducts.length > 0 && (
          <div className="border-t border-stone-200 px-5 py-16">
            <h2 className="text-center font-serif text-3xl font-bold uppercase tracking-wide text-stone-900">
              Related Products
            </h2>
            <div className="grid grid-cols-4 justify-items-center max-w-screen-2xl mx-auto py-10 gap-x-2 px-10 gap-y-8 max-xl:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1">
              {relatedProducts.map((relatedProduct: any) => (
                <ProductItem
                  key={relatedProduct.id}
                  product={relatedProduct}
                  color="black"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleProductPage;
