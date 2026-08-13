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
      className={`inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer py-1 group ${className}`}
    >
      <ArrowLeft className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:-translate-x-1 transition-all" />
      <span>{label}</span>
    </button>
  );
}
