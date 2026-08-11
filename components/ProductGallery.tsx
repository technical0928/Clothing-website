"use client";

import Image from "next/image";
import React, { useState } from "react";

interface GalleryImage {
  imageID: string;
  image: string;
}

const ProductGallery = ({
  mainImage,
  images,
  alt,
}: {
  mainImage: string;
  images?: GalleryImage[];
  alt: string;
}) => {
  const galleryImages = [
    { imageID: "main", image: mainImage },
    ...(Array.isArray(images) ? images : []),
  ];

  const [activeImage, setActiveImage] = useState<string>(mainImage);

  return (
    <div>
      <div
        className="group relative overflow-hidden rounded-lg bg-stone-100"
        title="Hover to zoom"
      >
        <Image
          src={activeImage ? `/${activeImage}` : "/product_placeholder.jpg"}
          width={500}
          height={500}
          alt={alt || "main image"}
          className="w-full h-auto transition-transform duration-300 ease-out group-hover:scale-[1.65] group-hover:cursor-zoom-in"
        />
        <span className="pointer-events-none absolute bottom-2 right-2 rounded bg-stone-900/70 px-2 py-0.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
          🔍 Hover to zoom
        </span>
      </div>
      {galleryImages.length > 1 && (
        <div className="flex justify-around mt-5 flex-wrap gap-y-1 max-[500px]:justify-center max-[500px]:gap-x-1">
          {galleryImages.map((imageItem) => (
            <button
              key={imageItem.imageID}
              type="button"
              onClick={() => setActiveImage(imageItem.image)}
              aria-label="View product image"
              className={`overflow-hidden rounded-md border-2 transition-all ${
                activeImage === imageItem.image
                  ? "border-amber-500 opacity-100"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={`/${imageItem.image}`}
                width={100}
                height={100}
                alt="product image"
                className="w-auto h-auto"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
