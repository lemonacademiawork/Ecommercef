import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { getOptimizedImageUrl } from "../../utils/cloudinary";

export function ReviewImageViewer({ activeUrl, photos = [], onClose }) {
  const [currentIndex, setCurrentIndex] = useState(() => {
    const idx = photos.indexOf(activeUrl);
    return idx >= 0 ? idx : 0;
  });

  if (!activeUrl || photos.length === 0) return null;

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-10"
      >
        <X className="w-6 h-6" />
      </button>

      <div
        className="relative max-w-4xl max-h-[85vh] flex items-center justify-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={getOptimizedImageUrl(photos[currentIndex], { width: 1000 })}
          alt={`Review image ${currentIndex + 1}`}
          className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
        />

        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2 p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all cursor-pointer backdrop-blur-sm"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2 p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all cursor-pointer backdrop-blur-sm"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full font-mono">
              {currentIndex + 1} / {photos.length}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
