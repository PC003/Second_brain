// ============================================================
// LOADING SPINNER — Second Brain
// Centered loading indicator with pulse animation
// ============================================================

interface LoadingSpinnerProps {
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Optional label below the spinner */
  label?: string;
}

export default function LoadingSpinner({ size = "md", label }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-[2.5px]",
    lg: "w-12 h-12 border-3",
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 animate-fade-in">
      <div
        className={`${sizeClasses[size]} rounded-full border-surface-3 border-t-accent animate-spin`}
      />
      {label && (
        <p className="text-sm text-text-muted">{label}</p>
      )}
    </div>
  );
}
