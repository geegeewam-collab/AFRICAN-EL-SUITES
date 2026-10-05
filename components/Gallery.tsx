"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { Camera } from "lucide-react";
import { HostProfile } from "@/lib/types";

interface GalleryProps {
  host: HostProfile;
}

export default function Gallery({ host }: GalleryProps) {
  const [index, setIndex] = useState(-1);
  const images = host.gallery;
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
          {images.map((img, i) => {
            const isFirst = i === 0;
            // an odd image left over at the end stretches across, so the grid never has a hole
            const isOrphan = i === images.length - 1 && !isFirst && (images.length - 1) % 2 === 1;
            return (
              <button
                type="button"
                key={i}
                className={`relative overflow-hidden rounded-sm cursor-zoom-in group text-left ${isFirst ? "col-span-2 row-span-2" : ""} ${isOrphan ? "col-span-2" : ""}`}
                style={{ aspectRatio: isFirst ? "1/1" : isOrphan ? "16/9" : "4/3" }}
                onClick={() => setIndex(i)}
                aria-label={`View photo: ${img.label}`}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes={isFirst || isOrphan ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
                />
                <span className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/60 to-transparent">
                  <span className="text-white text-xs font-medium">{img.label}</span>
                </span>
              </button>
            );
          })}
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
