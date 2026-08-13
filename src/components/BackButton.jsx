import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

export function BackButton({ onClick, fallbackPath = "/", label = "", iconOnly = false, className = "" }) {
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
      className={`inline-flex items-center justify-center p-2 rounded-xl text-foreground/80 hover:text-primary hover:bg-muted/80 transition-all cursor-pointer group active:scale-95 ${className}`}
    >
      <ArrowLeft className="w-5 h-5 text-foreground group-hover:text-primary group-hover:-translate-x-0.5 transition-all" />
      {label && !iconOnly ? <span className="text-xs font-semibold ml-1.5">{label}</span> : null}
    </button>
  );
}
