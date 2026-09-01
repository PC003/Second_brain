// ============================================================
// ANALYTICS PAGE — Second Brain (Phase 1 placeholder)
// Charts and statistics — Phase 8
// ============================================================

import { BarChart3 } from "lucide-react";
import EmptyState from "../components/common/EmptyState";

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Track your progress and problem-solving statistics
        </p>
      </div>

      <EmptyState
        icon={<BarChart3 size={24} />}
        title="Analytics coming soon"
        description="Charts and statistics for your problem-solving progress will be available after adding problems."
      />
    </div>
  );
}
