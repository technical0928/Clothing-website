"use client";

// *********************
// Role of the component: Horizontal product carousel used on the homepage.
// Supports left/right buttons, mouse drag on desktop, touch swipe on mobile,
// and an optional gentle auto-scroll that pauses while the user interacts.
// Only renders the products it receives — the parent decides how many to load.
// Name of the component: ProductCarousel.tsx
// *********************

import React, { useCallback, useEffect, useRef, useState } from "react";
import ProductItem from "./ProductItem";

interface ProductCarouselProps {
  products: any[];
  autoScroll?: boolean;
  autoScrollIntervalMs?: number;
}

const ProductCarousel = ({
  products,
  autoScroll = true,
  autoScrollIntervalMs = 3000,
}: ProductCarouselProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Drag-to-scroll state (desktop)
  const dragState = useRef({ isDown: false, startX: 0, startScroll: 0, moved: false });

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows]);

  const scrollByCard = useCallback(
    (direction: 1 | -1) => {
      const el = trackRef.current;
      if (!el) return;
      const card = el.querySelector<HTMLElement>("[data-carousel-card]");
      const step = card ? card.offsetWidth + 24 : el.clientWidth * 0.8;
      el.scrollBy({ left: direction * step, behavior: "smooth" });
    },
    []
  );

  // Auto-scroll: every few seconds nudge one card forward, loop back at the
  // end. Pauses whenever the user hovers, touches, or drags the carousel.
  useEffect(() => {
    if (!autoScroll || isPaused || products.length === 0) return;
    const timer = setInterval(() => {
      const el = trackRef.current;
      if (!el) return;
      const card = el.querySelector<HTMLElement>("[data-carousel-card]");
      const step = card ? card.offsetWidth + 24 : el.clientWidth * 0.8;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 8) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: step, behavior: "smooth" });
      }
    }, autoScrollIntervalMs);
    return () => clearInterval(timer);
  }, [autoScroll, autoScrollIntervalMs, isPaused, products.length]);

  const onPointerDown = (e: React.PointerEvent) => {
    const el = trackRef.current;
    if (!el) return;
    dragState.current = {
      isDown: true,
      startX: e.clientX,
      startScroll: el.scrollLeft,
      moved: false,
    };
    setIsPaused(true);
    el.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const el = trackRef.current;
    const state = dragState.current;
    if (!state.isDown || !el) return;
    const dx = e.clientX - state.startX;
    if (Math.abs(dx) > 4) state.moved = true;
    el.scrollLeft = state.startScroll - dx;
  };

  const endDrag = () => {
    dragState.current.isDown = false;
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Left arrow — visible on all screen sizes; dimmed when at the start */}
      <button
        type="button"
        aria-label="Scroll products left"
        onClick={() => scrollByCard(-1)}
        disabled={!canScrollLeft}
        className={`absolute left-1 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border text-xl font-bold shadow-md transition-all md:-left-3 md:h-11 md:w-11 ${
          canScrollLeft
            ? "border-stone-200 bg-white/95 text-stone-900 active:scale-95 hover:scale-110 hover:bg-stone-900 hover:text-white"
            : "cursor-not-allowed border-stone-100 bg-stone-100/80 text-stone-300"
        }`}
      >
        ‹
      </button>

      {/* Scroll track */}
      <div
        ref={trackRef}
        data-carousel-track
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-2 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ cursor: dragState.current.isDown ? "grabbing" : "grab" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
      >
        {products.map((product: any) => (
          <div
            key={product.id}
            data-carousel-card
            className="w-[260px] flex-none snap-start sm:w-[300px] lg:w-[320px]"
          >
            <ProductItem product={product} color="black" />
          </div>
        ))}
      </div>

      {/* Right arrow — visible on all screen sizes; dimmed when at the end */}
      <button
        type="button"
        aria-label="Scroll products right"
        onClick={() => scrollByCard(1)}
        disabled={!canScrollRight}
        className={`absolute right-1 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border text-xl font-bold shadow-md transition-all md:-right-3 md:h-11 md:w-11 ${
          canScrollRight
            ? "border-stone-200 bg-white/95 text-stone-900 active:scale-95 hover:scale-110 hover:bg-stone-900 hover:text-white"
            : "cursor-not-allowed border-stone-100 bg-stone-100/80 text-stone-300"
        }`}
      >
        ›
      </button>
    </div>
  );
};

export default ProductCarousel;
