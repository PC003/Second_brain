// ============================================================
// PATTERNS PAGE — Second Brain (Phase 1 placeholder)
// Pattern browser will be implemented in Phase 5
// ============================================================

import { Swords, Plus } from "lucide-react";
import EmptyState from "../components/common/EmptyState";

export default function Patterns() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">DSA Patterns</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Browse and manage Data Structures & Algorithms patterns
        </p>
      </div>

      <EmptyState
        icon={<Swords size={24} />}
        title="Pattern browser coming soon"
        description="The pattern browser with problem counts and grouping will be available after database setup."
      />
    </div>
  );
}
