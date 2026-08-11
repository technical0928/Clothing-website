import { CategoryMenu, Hero, Incentives, IntroducingSection, Newsletter, ProductsSection } from "@/components";

export const revalidate = 30;

export default function Home() {
  return (
    <>
    <Hero />
    <IntroducingSection />
    <CategoryMenu />
    <ProductsSection />
    </>
  );
}
