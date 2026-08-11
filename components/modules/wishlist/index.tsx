"use client";

import { useWishlistStore } from "@/app/_zustand/wishlistStore";
import WishItem from "@/components/WishItem";

export const WishlistModule = () => {
  const { wishlist } = useWishlistStore();

  return (
    <>
      {wishlist.length === 0 ? (
        <div className="mx-auto max-w-2xl py-16 text-center">
          <h3 className="font-serif text-4xl font-bold text-stone-900 max-sm:text-3xl">
            No favorites yet
          </h3>
          <p className="mt-3 text-stone-600">
            Tap the heart on any product to save it here for later.
          </p>
        </div>
      ) : (
        <div className="mx-auto max-w-screen-2xl">
          <div className="overflow-x-auto">
            <table className="table text-center">
              <thead>
                <tr>
                  <th></th>
                  <th className="text-stone-700">Image</th>
                  <th className="text-stone-700">Name</th>
                  <th className="text-stone-700">Stock Status</th>
                  <th className="text-stone-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {wishlist.map((item) => (
                  <WishItem
                    id={item.id}
                    title={item.title}
                    price={item.price}
                    image={item.image}
                    slug={item.slug}
                    stockAvailabillity={item.stockAvailabillity}
                    key={item.id}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};
