import { StarRating } from "./StarRating";

export function RatingSummary({ averageRating = 0, reviewCount = 0, ratingDistribution = {} }) {
  const avg = Number(averageRating || 0).toFixed(1);
  const total = Number(reviewCount || 0);

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
    <div className="bg-card rounded-2xl border border-border/60 p-5 shadow-sm transition-colors duration-300">
      <div className="grid sm:grid-cols-12 gap-4 items-center">
        {/* Rating Score */}
        <div className="sm:col-span-4 text-center sm:text-left flex flex-col items-center sm:items-start justify-center border-b sm:border-b-0 sm:border-r border-border/60 pb-4 sm:pb-0 sm:pr-4">
          <div className="text-4xl font-extrabold text-foreground tracking-tight mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>
            {avg}
          </div>
          <StarRating rating={Math.round(Number(avg))} size="md" className="mb-1" />
          <p className="text-[11px] text-muted-foreground font-medium">
            Based on {total.toLocaleString()} {total === 1 ? "review" : "verified reviews"}
          </p>
        </div>

        {/* Rating Distribution Progress Bars */}
        <div className="sm:col-span-8 space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = dist[stars];
            const pct = Math.round((count / totalDistCount) * 100);

            return (
              <div key={stars} className="flex items-center gap-2.5 text-xs">
                <span className="w-5 font-semibold text-foreground/80 flex items-center gap-0.5 justify-end text-[11px]">
                  {stars} <span className="text-amber-400">★</span>
                </span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden relative">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: stars >= 4 ? "linear-gradient(90deg, #a61c9b, #d82a81)" : stars === 3 ? "#f59e0b" : "#ef4444",
                    }}
                  />
                </div>
                <span className="w-10 text-right text-muted-foreground font-mono text-[10px]">
                  {count} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
