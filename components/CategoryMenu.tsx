// *********************
// Role of the component: Category wrapper that will contain title and category items
// Name of the component: CategoryMenu.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 2.0
// Component call: <CategoryMenu />
// Input parameters: no input parameters
// Output: section title and category items for clothing categories
// *********************

import React from "react";
import CategoryItem from "./CategoryItem";
import { categoryMenuList } from "@/lib/utils";
import { FaBagShopping, FaGem, FaLeaf, FaShirt, FaStar, FaUserTie } from "react-icons/fa6";

const categoryIcons: Record<string, React.ReactNode> = {
  "Lawn Shirts": <FaLeaf />,
  "Ethnic Shirts": <FaShirt />,
  Formalwear: <FaUserTie />,
  Partywear: <FaStar />,
  Accessories: <FaGem />,
};

const CategoryMenu = () => {
  return (
    <section className="bg-stone-900 py-20">
      <div className="mx-auto max-w-screen-2xl px-6 text-center lg:px-12">
        <p className="text-sm font-bold uppercase tracking-[0.35em] text-amber-400">
          Shop by style
        </p>
        <h2 className="mt-4 font-serif text-6xl font-bold text-white max-md:text-4xl">
          Browse Signature Categories
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-stone-300">
          Find refined lawn, occasion wear, formal silhouettes, and finishing pieces for a complete Noor-e-Multan look.
        </p>
      </div>

      <div className="mx-auto grid max-w-screen-2xl grid-cols-5 gap-5 px-16 py-12 max-lg:grid-cols-3 max-md:grid-cols-2 max-md:px-10 max-[450px]:grid-cols-1">
        {categoryMenuList.map((item) => (
          <CategoryItem title={item.title} key={item.id} href={item.href}>
            {categoryIcons[item.title] || <FaBagShopping />}
          </CategoryItem>
        ))}
      </div>
    </section>
  );
};

export default CategoryMenu;
