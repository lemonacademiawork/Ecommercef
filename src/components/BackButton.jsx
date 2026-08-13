import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

export function BackButton({ onClick, fallbackPath = "/", label = "Back", iconOnly = false, className = "" }) {
  const reactNavigator = useNavigate();

  const handleBack = () => {
    if (onClick) {
      onClick();
    } else if (window.history.length > 2) {
      reactNavigator(-1);
    } else {
      reactNavigator(fallbackPath);
    }
  };

  return (
    <button
      onClick={handleBack}
      type="button"
      aria-label={label || "Go back"}
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-border/80 bg-card hover:bg-muted text-foreground transition-all cursor-pointer group active:scale-95 text-xs font-semibold shadow-sm ${className}`}
    >
      <ArrowLeft className="w-4 h-4 text-primary group-hover:-translate-x-0.5 transition-transform" />
      {label && !iconOnly ? <span>{label}</span> : null}
    </button>
  );
}
