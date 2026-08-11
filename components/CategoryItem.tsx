// *********************
// Role of the component: Category Item that will display category icon, category name and link to the category
// Name of the component: CategoryItem.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 1.0
// Component call: <CategoryItem title={title} href={href} ><Image /></CategoryItem>
// Input parameters: CategoryItemProps interface
// Output: Category icon, category name and link to the category
// *********************

import Link from "next/link";
import React, { type ReactNode } from "react";

interface CategoryItemProps {
  children: ReactNode;
  title: string;
  href: string;
}

const CategoryItem = ({ title, children, href }: CategoryItemProps) => {
  return (
    <Link href={href} className="group block">
      <div className="flex min-h-44 cursor-pointer flex-col items-center justify-center gap-y-4 border border-stone-700 bg-stone-800 px-5 py-7 text-white transition-all duration-300 hover:-translate-y-1 hover:border-amber-400 hover:bg-stone-950 hover:shadow-2xl">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500 text-3xl text-stone-950 transition-transform duration-300 group-hover:scale-110">
          {children}
        </span>

        <h3 className="text-center font-serif text-2xl font-bold">{title}</h3>
      </div>
    </Link>
  );
};

export default CategoryItem;
