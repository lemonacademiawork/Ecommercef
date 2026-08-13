import { AlertTriangle, Loader2 } from "lucide-react";

export function DeleteReviewDialog({ isOpen, isDeleting, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-3xl border border-border shadow-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-foreground mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
          Delete your review?
        </h3>
        <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
          Are you sure you want to delete this review? This action cannot be undone.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-border hover:bg-muted text-foreground transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-destructive hover:bg-destructive/90 text-white transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
