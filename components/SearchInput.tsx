// *********************
// Role of the component: Search input element located in the header but it can be used anywhere in your application
// Name of the component: SearchInput.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 2.0
// Component call: <SearchInput />
// Input parameters: no input parameters
// Output: form with search input and button
// *********************

"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { sanitize } from "@/lib/sanitize";

const SearchInput = () => {
  const [searchInput, setSearchInput] = useState<string>("");
  const router = useRouter();

  // function for modifying URL for searching products
  const searchProducts = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = searchInput.trim();
    if (!query) {
      return;
    }
    // Sanitize the search input before using it in URL
    const sanitizedSearch = sanitize(query);
    router.push(`/search?search=${encodeURIComponent(sanitizedSearch)}`);
    setSearchInput("");
  };

  return (
    <form className="flex w-full justify-center" onSubmit={searchProducts}>
      <div className="relative w-[70%] max-sm:w-full">
        <FaMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search products, brands, fabrics..."
          className="bg-gray-50 input input-bordered w-full rounded-r-none pl-10 outline-none focus:outline-none dark:bg-stone-800 dark:text-stone-100 dark:border-stone-600 dark:placeholder-stone-400"
        />
      </div>
      <button
        type="submit"
        className="btn bg-amber-500 text-stone-900 rounded-l-none rounded-r-xl hover:bg-amber-400"
      >
        Search
      </button>
    </form>
  );
};

export default SearchInput;
