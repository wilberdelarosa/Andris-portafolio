"use client";

import React, { useState } from "react";
import { motion } from "motion/react";

export interface AmenityItem {
  id: string;
  image?: string;
  name: string;
}

export interface AmenitiesCarouselProps {
  items: AmenityItem[];
}

export function AmenitiesCarousel({ items }: AmenitiesCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!items || items.length === 0) return null;

  const total = items.length;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const setIndex = (index: number) => {
    setCurrentIndex(index);
  };

  const onDragEnd = (event: any, info: any) => {
    if (info.offset.x < -50) {
      handleNext();
    } else if (info.offset.x > 50) {
      handlePrev();
    }
  };

  return (
    <div className="amenities-carousel-wrapper">
      <div className="amenities-carousel-container">
        {items.map((item, index) => {
          let diff = (index - currentIndex) % total;
          if (diff > Math.floor(total / 2)) {
            diff -= total;
          } else if (diff < -Math.floor((total - 1) / 2)) {
            diff += total;
          }

          const isCenter = diff === 0;
          const absDiff = Math.abs(diff);

          const xOffset = diff * 90; 
          const scale = 1 - absDiff * 0.15;
          const opacity = absDiff > 2 ? 0 : 1 - absDiff * 0.4;
          const zIndex = 10 - absDiff;

          return (
            <motion.div
              key={item.id}
              className="amenities-carousel-item"
              initial={false}
              animate={{
                x: `${xOffset}%`,
                scale,
                opacity,
                zIndex,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={onDragEnd}
              onClick={() => {
                if (!isCenter) setIndex(index);
              }}
            >
              <div className="amenities-carousel-card">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="amenities-carousel-image"
                    draggable={false}
                  />
                ) : (
                  <div className="amenities-carousel-fallback" />
                )}
                {isCenter && (
                  <motion.div
                    className="amenities-carousel-label"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {item.name}
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="amenities-carousel-pagination">
        {items.map((_, idx) => (
          <button
            key={idx}
            className={`amenities-carousel-dot ${
              idx === currentIndex ? "active" : ""
            }`}
            onClick={() => setIndex(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
