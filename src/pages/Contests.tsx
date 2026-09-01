// ============================================================
// CONTESTS PAGE — Second Brain (Phase 1 placeholder)
// Contest management — Phase 7
// ============================================================

import { Trophy, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import EmptyState from "../components/common/EmptyState";

export default function Contests() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Contests</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Track your competitive programming contests
          </p>
        </div>
      </div>

      <EmptyState
        icon={<Trophy size={24} />}
        title="No contests yet"
        description="Contest management will be implemented in Phase 7. You'll be able to track ratings, problems, and performance."
      />
    </div>
  );
}
