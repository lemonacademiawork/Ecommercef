import { Search, X, Loader2 } from "lucide-react";

/**
 * SearchInput – a styled search field with a clear (×) button and an
 * inline loading indicator spinner.
 *
 * Props:
 *  value        {string}   Controlled input value
 *  onChange     {fn}       Called with the new string value (not the event)
 *  onClear      {fn}       Called when the × button is clicked
 *  isLoading    {boolean}  Shows a spinner instead of the × when true
 *  placeholder  {string}   Input placeholder text
 *  className    {string}   Extra classes for the wrapper div
 */
export default function SearchInput({
  value = "",
  onChange,
  onClear,
  isLoading = false,
  placeholder = "Search…",
  className = "",
}) {
  return (
    <div className={`relative w-full ${className}`}>
      {/* Leading search icon */}
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-9 py-2.5 text-sm border border-border rounded-xl bg-white
                   focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40
                   placeholder:text-muted-foreground/60 transition-shadow"
      />

      {/* Trailing: spinner while loading, × button when there's a value */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : value ? (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear search"
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer p-0.5 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
