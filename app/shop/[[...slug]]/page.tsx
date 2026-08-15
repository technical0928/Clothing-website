export const revalidate = 30;

import type { Metadata } from "next";
import {
  Breadcrumb,
  Filters,
  Pagination,
  Products,
  SortBy,
} from "@/components";
import React from "react";
import { sanitize } from "@/lib/sanitize";

// improve readabillity of category text, for example category text "smart-watches" will be "smart watches"
const improveCategoryText = (text: string): string => {
  if (text.indexOf("-") !== -1) {
    let textArray = text.split("-");

    return textArray.join(" ");
  } else {
    return text;
  }
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = slug && slug[0]?.length > 0 ? improveCategoryText(slug[0]) : "";
  const title = category ? `${category} clothing` : "Shop all clothing";
  return {
    title,
    description: category
      ? `Shop ${title} online at Noor-e-Multan — Pakistani ready-to-wear, lawn and formal wear with delivery across Pakistan.`
      : "Browse the full Noor-e-Multan collection — Pakistani ready-to-wear, lawn, kurtas and formal wear with delivery across Pakistan.",
    alternates: {
      canonical: slug && slug[0]?.length > 0 ? `/shop/${slug.join("/")}` : "/shop",
    },
  };
}

const ShopPage = async ({ params, searchParams }: { params: Promise<{ slug?: string[] }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) => {
  // Await both params and searchParams
  const awaitedParams = await params;
  const awaitedSearchParams = await searchParams;
  
  return (
    <div className="text-black bg-white">
      <div className=" max-w-screen-2xl mx-auto px-10 max-sm:px-5">
        <Breadcrumb />
        <div className="grid grid-cols-[200px_1fr] gap-x-10 max-md:grid-cols-1 max-md:gap-y-5">
          <Filters />
          <div>
            <div className="flex justify-between items-center max-lg:flex-col max-lg:gap-y-5">
              <h1 className="text-2xl font-bold max-sm:text-xl max-[400px]:text-lg uppercase">
                {awaitedParams?.slug && awaitedParams?.slug[0]?.length > 0
                  ? sanitize(improveCategoryText(awaitedParams?.slug[0]))
                  : "All products"}
              </h1>

              <SortBy />
            </div>
            <div className="divider"></div>
            <Products params={awaitedParams} searchParams={awaitedSearchParams} />
            <Pagination />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
