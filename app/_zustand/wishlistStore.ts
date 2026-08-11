import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type State = {
  wishlist: ProductInWishlist[];
  wishQuantity: number;
};

export type Actions = {
  addToWishlist: (product: ProductInWishlist) => void;
  removeFromWishlist: (id: string) => void;
  toggleWishlist: (product: ProductInWishlist) => boolean;
  setWishlist: (wishlist: ProductInWishlist[]) => void;
};

export const useWishlistStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      wishlist: [],
      wishQuantity: 0,
      addToWishlist: (product) => {
        set((state) => {
          const exists = state.wishlist.some((item) => product.id === item.id);

          if (exists) {
            return {
              wishlist: state.wishlist,
              wishQuantity: state.wishlist.length,
            };
          }

          const wishlist = [...state.wishlist, product];
          return { wishlist, wishQuantity: wishlist.length };
        });
      },
      removeFromWishlist: (id) => {
        set((state) => {
          const wishlist = state.wishlist.filter((item) => id !== item.id);
          return { wishlist, wishQuantity: wishlist.length };
        });
      },
      toggleWishlist: (product) => {
        const exists = get().wishlist.some((item) => item.id === product.id);

        if (exists) {
          get().removeFromWishlist(product.id);
          return false;
        }

        get().addToWishlist(product);
        return true;
      },
      setWishlist: (wishlist) => {
        set(() => ({ wishlist: [...wishlist], wishQuantity: wishlist.length }));
      },
    }),
    {
      name: "wishlist-storage",
      storage: createJSONStorage(() => sessionStorage),
      merge: (persistedState, currentState) => {
        const mergedState = {
          ...currentState,
          ...(persistedState as Partial<State & Actions>),
        };

        return {
          ...mergedState,
          wishQuantity: mergedState.wishlist?.length || 0,
        };
      },
    }
  )
);
