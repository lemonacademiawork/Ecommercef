import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

export function BackButton({ onClick, fallbackPath = "/", label = "Back", className = "" }) {
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
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-medium text-foreground/80 hover:text-foreground bg-card border border-border/60 hover:bg-muted shadow-sm transition-all duration-200 active:scale-95 cursor-pointer ${className}`}
    >
      <ArrowLeft className="w-4 h-4 text-primary" />
      <span>{label}</span>
    </button>
  );
}
