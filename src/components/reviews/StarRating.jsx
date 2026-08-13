import { Star } from "lucide-react";
import { useState } from "react";

export function StarRating({
  rating = 0,
  onChange = null,
  size = "md", // "sm", "md", "lg"
  readOnly = false,
  className = "",
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const starSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-5 h-5",
    lg: "w-7 h-7",
  };

  const currentDisplay = hoverRating || rating;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[1, 2, 3, 4, 5].map((starIndex) => {
        const isFilled = starIndex <= currentDisplay;
        const isInteractive = !readOnly && onChange;

        return (
          <button
            key={starIndex}
            type="button"
            disabled={readOnly}
            onClick={() => isInteractive && onChange(starIndex)}
            onMouseEnter={() => isInteractive && setHoverRating(starIndex)}
            onMouseLeave={() => isInteractive && setHoverRating(0)}
            className={`${isInteractive ? "cursor-pointer transition-transform hover:scale-115 focus:outline-none" : "cursor-default"} p-0.5`}
          >
            <Star
              className={`${starSizes[size] || starSizes.md} transition-colors ${
                isFilled
                  ? "text-amber-400 fill-amber-400"
                  : "text-muted-foreground/30 fill-transparent"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
