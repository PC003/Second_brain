// ============================================================
// ADD PROBLEM PAGE — Second Brain (Phase 1 placeholder)
// Full form will be implemented in Phase 3
// ============================================================

import { Plus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import EmptyState from "../components/common/EmptyState";

export default function AddProblem() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-text-muted hover:bg-surface-2 hover:text-text-secondary transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Add Problem</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Store a new DSA or Competitive Programming problem
          </p>
        </div>
      </div>

      <EmptyState
        icon={<Plus size={24} />}
        title="Problem form coming soon"
        description="The problem form will be implemented in Phase 3. Database setup is next."
      />
    </div>
  );
}
