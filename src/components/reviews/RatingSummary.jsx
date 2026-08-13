import { StarRating } from "./StarRating";
import { Award, MessageSquare } from "lucide-react";

export function RatingSummary({ averageRating = 0, reviewCount = 0, ratingDistribution = {} }) {
  const total = Number(reviewCount || 0);
  // Only display non-zero average rating if there are reviews, otherwise display 0.0
  const avg = total > 0 ? Number(averageRating || 0).toFixed(1) : "0.0";

  // Safe distribution object
  const dist = {
    5: Number(ratingDistribution?.["5"] || ratingDistribution?.[5] || 0),
    4: Number(ratingDistribution?.["4"] || ratingDistribution?.[4] || 0),
    3: Number(ratingDistribution?.["3"] || ratingDistribution?.[3] || 0),
    2: Number(ratingDistribution?.["2"] || ratingDistribution?.[2] || 0),
    1: Number(ratingDistribution?.["1"] || ratingDistribution?.[1] || 0),
  };

  const totalDistCount = Object.values(dist).reduce((acc, count) => acc + count, 0) || (total > 0 ? total : 1);

  return (
    <div className="bg-card rounded-3xl border border-border/60 p-6 sm:p-8 shadow-sm transition-colors duration-300">
      <div className="grid md:grid-cols-12 gap-8 items-center">
        {/* Rating Score Left Box */}
        <div className="md:col-span-4 text-center md:text-left flex flex-col items-center md:items-start justify-center border-b md:border-b-0 md:border-r border-border/60 pb-6 md:pb-0 md:pr-8">
          <div className="flex items-baseline gap-2 mb-1">
            <span
              className="text-5xl font-extrabold tracking-tight text-foreground"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {avg}
            </span>
            <span className="text-sm font-semibold text-muted-foreground">/ 5.0</span>
          </div>

          <StarRating rating={Math.round(Number(avg))} size="lg" readOnly className="mb-3" />

          {total > 0 ? (
            <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-500" />
              Based on {total.toLocaleString()} {total === 1 ? "verified review" : "verified reviews"}
            </p>
          ) : (
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-primary" />
              No customer reviews yet
            </p>
          )}
        </div>

        {/* Rating Distribution Progress Bars */}
        <div className="md:col-span-8 space-y-3">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = dist[stars];
            const pct = total > 0 ? Math.round((count / totalDistCount) * 100) : 0;

            return (
              <div key={stars} className="flex items-center gap-3 text-xs">
                <div className="w-12 flex items-center justify-end gap-1 font-semibold text-foreground/80">
                  <span>{stars}</span>
                  <span className="text-amber-400">★</span>
                </div>

                <div className="flex-1 h-3 bg-muted/60 rounded-full overflow-hidden relative shadow-inner">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background:
                        stars >= 4
                          ? "linear-gradient(90deg, #a61c9b, #d82a81)"
                          : stars === 3
                          ? "#f59e0b"
                          : "#ef4444",
                    }}
                  />
                </div>

                <div className="w-14 text-right flex items-center justify-end gap-1 text-muted-foreground font-mono text-[11px]">
                  <span>{count}</span>
                  <span className="text-[10px] text-muted-foreground/60">({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
