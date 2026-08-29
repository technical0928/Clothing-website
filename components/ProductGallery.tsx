"use client";

import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface GalleryImage {
  imageID: string;
  image: string;
}

const PLACEHOLDER = "/product_placeholder.jpg";

const ProductGallery = ({
  mainImage,
  images,
  alt,
}: {
  mainImage: string;
  images?: GalleryImage[];
  alt: string;
}) => {
  const galleryImages = useMemo(() => {
    const extras = Array.isArray(images) ? images : [];
    const seen = new Set<string>();
    const ordered: { imageID: string; image: string }[] = [];

    if (mainImage) {
      seen.add(mainImage);
      ordered.push({ imageID: "main", image: mainImage });
    }

    for (const item of extras) {
      if (item?.image && !seen.has(item.image)) {
        seen.add(item.image);
        ordered.push(item);
      }
    }

    return ordered;
  }, [mainImage, images]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setActiveIndex(0);
    setImageError(false);
  }, [mainImage, images]);

  const activeImage = galleryImages[activeIndex]?.image || mainImage;
  const imageSrc = imageError || !activeImage ? PLACEHOLDER : `/${activeImage}`;

  const goTo = (index: number) => {
    setActiveIndex(index);
    setImageError(false);
  };

  const goPrev = () => {
    if (galleryImages.length <= 1) return;
    goTo((activeIndex - 1 + galleryImages.length) % galleryImages.length);
  };

  const goNext = () => {
    if (galleryImages.length <= 1) return;
    goTo((activeIndex + 1) % galleryImages.length);
  };

  return (
    <div className="w-full">
      <div className="relative">
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-stone-100 theme-gallery-bg">
          <Image
            src={imageSrc}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            alt={alt || "Product image"}
            className="object-contain transition-opacity duration-300"
            onError={() => setImageError(true)}
          />

          {galleryImages.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={goPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-stone-800 shadow-md hover:bg-white transition-colors theme-gallery-nav"
              >
                <FiChevronLeft className="text-lg" />
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={goNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-stone-800 shadow-md hover:bg-white transition-colors theme-gallery-nav"
              >
                <FiChevronRight className="text-lg" />
              </button>
            </>
          )}
        </div>
      </div>

      {galleryImages.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {galleryImages.map((imageItem, index) => (
            <button
              key={imageItem.imageID}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`View product image ${index + 1}`}
              aria-current={activeIndex === index ? "true" : undefined}
              className={`relative shrink-0 w-16 sm:w-20 aspect-[3/4] overflow-hidden rounded-md border-2 transition-all ${
                activeIndex === index
                  ? "border-amber-500 opacity-100 ring-1 ring-amber-500/30"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={`/${imageItem.image}`}
                fill
                sizes="80px"
                alt={`Product thumbnail ${index + 1}`}
                className="object-contain bg-stone-100"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
