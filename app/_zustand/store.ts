import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ProductInCart = {
  id: string;
  title: string;
  price: number;
  image: string;
  amount: number;
  selectedSize?: string;
  selectedColor?: string;
};

export type State = {
  products: ProductInCart[];
  allQuantity: number;
  total: number;
  // "Buy Now" item — checked out directly, NOT added to the cart
  buyNowItem: ProductInCart | null;
};

export type Actions = {
  addToCart: (newProduct: ProductInCart) => void;
  removeFromCart: (id: string, selectedSize?: string, selectedColor?: string) => void;
  updateCartAmount: (id: string, quantity: number, selectedSize?: string, selectedColor?: string) => void;
  calculateTotals: () => void;
  clearCart: () => void;
  setBuyNowItem: (item: ProductInCart) => void;
  clearBuyNowItem: () => void;
};

const getItemKey = (item: { id: string; selectedSize?: string; selectedColor?: string }) => 
  `${item.id}_${item.selectedSize || ''}_${item.selectedColor || ''}`;

const calculateCartTotals = (products: ProductInCart[]) => {
  return products.reduce(
    (totals, item) => ({
      allQuantity: totals.allQuantity + item.amount,
      total: totals.total + item.amount * item.price,
    }),
    { allQuantity: 0, total: 0 }
  );
};

export const useProductStore = create<State & Actions>()(
  persist(
    (set) => ({
      products: [],
      allQuantity: 0,
      total: 0,
      buyNowItem: null,
      setBuyNowItem: (item) => set({ buyNowItem: item }),
      clearBuyNowItem: () => set({ buyNowItem: null }),
      addToCart: (newProduct) => {
        set((state) => {
          const newKey = getItemKey(newProduct);
          const cartItemIndex = state.products.findIndex(
            (item) => getItemKey(item) === newKey
          );
          if (cartItemIndex === -1) {
            const products = [...state.products, newProduct];
            return { products, ...calculateCartTotals(products) };
          } else {
            const updatedProducts = [...state.products];
            updatedProducts[cartItemIndex] = {
              ...updatedProducts[cartItemIndex],
              amount: updatedProducts[cartItemIndex].amount + newProduct.amount,
            };
            return { products: updatedProducts, ...calculateCartTotals(updatedProducts) };
          }
        });
      },
      clearCart: () => {
        set(() => ({
          products: [],
          allQuantity: 0,
          total: 0,
        }));
      },
      removeFromCart: (id, selectedSize, selectedColor) => {
        set((state) => {
          const targetKey = `${id}_${selectedSize || ''}_${selectedColor || ''}`;
          const updatedProducts = state.products.filter(
            (product: ProductInCart) => getItemKey(product) !== targetKey
          );
          return { products: updatedProducts, ...calculateCartTotals(updatedProducts) };
        });
      },

      calculateTotals: () => {
        set((state) => {
          let amount = 0;
          let total = 0;
          state.products.forEach((item) => {
            amount += item.amount;
            total += item.amount * item.price;
          });

          return {
            products: state.products,
            allQuantity: amount,
            total: total,
          };
        });
      },
      updateCartAmount: (id, amount, selectedSize, selectedColor) => {
        set((state) => {
          const targetKey = `${id}_${selectedSize || ''}_${selectedColor || ''}`;
          const updatedProducts = state.products
            .map((product) => {
              if (getItemKey(product) === targetKey) {
                return { ...product, amount: Math.max(1, amount) };
              }
              return product;
            });

          return { products: updatedProducts, ...calculateCartTotals(updatedProducts) };
        });
      },
    }),
    {
      name: "products-storage",
      storage: createJSONStorage(() => sessionStorage),
      merge: (persistedState, currentState) => {
        const mergedState = {
          ...currentState,
          ...(persistedState as Partial<State & Actions>),
        };
        return {
          ...mergedState,
          buyNowItem: mergedState.buyNowItem ?? null,
          ...calculateCartTotals(mergedState.products || []),
        };
      },
    }
  )
);
