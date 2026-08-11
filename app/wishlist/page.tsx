import { WishlistModule } from "@/components/modules/wishlist";

export default function WishlistPage() {
  return (
    <main className="bg-white px-5 py-12">
      <h1 className="mb-8 text-center font-serif text-5xl font-bold text-stone-900">
        Your Favorites
      </h1>
      <WishlistModule />
    </main>
  );
}
