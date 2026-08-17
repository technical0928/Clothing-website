import { CategoryMenu, Hero, Incentives, IntroducingSection, Newsletter, ProductSection } from "@/components";

export const revalidate = 30;

export default function Home() {
  return (
    <>
    <Hero />
    <IntroducingSection />
    <CategoryMenu />

    {/* Each section below fetches ONLY its own bounded batch via
        mode=section&section=<name>, so the homepage stays fast even when the
        catalog grows to 20,000+ products — no section ever loads the whole
        database. */}
    <div className="bg-amber-50 border-t-4 border-white">
      <div className="max-w-screen-2xl mx-auto px-10 max-sm:px-5">
        <ProductSection title="FEATURED PRODUCTS" section="featured" limit={12} autoScroll={false} linkHref="/shop" />
        <ProductSection title="NEW ARRIVALS" section="new" limit={12} linkHref="/shop" />
        <ProductSection title="BEST SELLERS" section="best-sellers" limit={12} linkHref="/shop" />
        <ProductSection title="WOMEN'S COLLECTION" section="women" limit={12} linkHref="/shop/women" linkLabel="Shop Women" />
        <ProductSection title="MEN'S COLLECTION" section="men" limit={12} linkHref="/shop/men" linkLabel="Shop Men" />
        <ProductSection title="SALE" section="sale" limit={12} autoScroll={false} linkHref="/shop" linkLabel="Shop Sale" />
      </div>
    </div>

    <Incentives />
    <Newsletter />
    </>
  );
}
