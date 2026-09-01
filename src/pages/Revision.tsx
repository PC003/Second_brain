// ============================================================
// REVISION PAGE — Second Brain (Phase 1 placeholder)
// Due Today, Overdue, Upcoming sections — Phase 6
// ============================================================

import { RefreshCcw } from "lucide-react";
import EmptyState from "../components/common/EmptyState";

export default function Revision() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Revision</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Review problems and track your progress
        </p>
      </div>

      <EmptyState
        icon={<RefreshCcw size={24} />}
        title="No revisions scheduled"
        description="Mark problems for revision to see them here. The revision system will be fully implemented in Phase 6."
      />
    </div>
  );
}
