// ============================================================
// EMPTY STATE — Second Brain
// Reusable empty state component with icon, message, and CTA
// ============================================================

import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="w-14 h-14 rounded-2xl bg-surface-2 flex items-center justify-center text-text-muted mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-1">{title}</h3>
      <p className="text-sm text-text-muted max-w-sm mb-5">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
