"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { Camera } from "lucide-react";

const images = [
  { src: "/images/living-room-tv.jpg", alt: "Living room and TV lounge with cobalt curtains", label: "Living Room" },
  { src: "/images/living-room-main.jpg", alt: "Sofa corner beneath the cobalt curtains", label: "Lounge Corner" },
  { src: "/images/bedroom-suite.jpg", alt: "Bedroom with tufted headboard and mirror", label: "Bedroom" },
  { src: "/images/bedroom-detail.jpg", alt: "Bed detail with chevron accent pillow", label: "Bedroom Detail" },
  { src: "/images/living-room-lounge.jpg", alt: "Sofa and coffee table with fresh flowers", label: "Coffee Corner" },
  { src: "/images/kitchen-bar.jpg", alt: "Breakfast bar and kitchenette", label: "Breakfast Bar" },
  { src: "/images/kitchen-detail.jpg", alt: "Fitted kitchen cabinetry and cooktop", label: "Kitchenette" },
  { src: "/images/styling-detail.jpg", alt: "Styling detail, fresh greenery", label: "Details" },
];

export default function Gallery() {
  const [index, setIndex] = useState(-1);
  const slides = images.map((img) => ({ src: img.src, alt: img.alt }));

  return (
    <section id="gallery" className="section-pad" style={{ backgroundColor: "#0B1526" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Camera size={16} style={{ color: "#D4B483" }} />
          </div>
          <span className="eyebrow">The Suite</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-serif text-white mb-3">Every corner, as it is</h2>
          <p className="text-white/45 text-sm tracking-wide">Real photos, not staged renders — tap any to view full screen</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          {images.map((img, i) => (
            <div
              key={i}
              className={`relative overflow-hidden rounded-sm cursor-pointer group ${
                i === 0 ? "col-span-2 row-span-2" : ""
              }`}
              style={{ aspectRatio: i === 0 ? "1/1" : "4/3" }}
              onClick={() => setIndex(i)}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/40 transition-all duration-300 flex items-end p-3">
                <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 px-2 py-1 rounded-sm">
                  {img.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={slides}
        on={{ view: ({ index: i }) => setIndex(i) }}
      />
    </section>
  );
}
