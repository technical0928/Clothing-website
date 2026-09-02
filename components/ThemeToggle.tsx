"use client";
import { useEffect, useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa6";

const THEME_KEY = "noor-theme";

/**
 * Dark / light mode toggle. Persists the choice in localStorage and applies
 * the daisyUI theme by setting `data-theme` on <html>. A tiny inline script in
 * the layout applies the saved theme before paint so there is no flash.
 */
const ThemeToggle = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    if (current === "dark" || current === "light") {
      setTheme(current);
    } else {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === "dark") {
        setTheme("dark");
        document.documentElement.setAttribute("data-theme", "dark");
      }
    }
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem(THEME_KEY, next);
    document.documentElement.setAttribute("data-theme", next);
  };

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-800 shadow-sm transition-all duration-200 hover:scale-105 hover:border-amber-500 hover:text-amber-600 dark:border-stone-600 dark:bg-stone-800 dark:text-amber-400 dark:hover:text-amber-300"
    >
      {isDark ? <FaSun className="h-5 w-5" /> : <FaMoon className="h-5 w-5" />}
    </button>
  );
};

export default ThemeToggle;
