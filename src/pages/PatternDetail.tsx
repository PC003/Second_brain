// ============================================================
// PATTERN DETAIL PAGE — Second Brain (Phase 1 placeholder)
// ============================================================

import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Swords } from "lucide-react";
import EmptyState from "../components/common/EmptyState";

export default function PatternDetail() {
  const { id } = useParams();
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
        <h1 className="text-2xl font-bold text-text-primary">Pattern #{id}</h1>
      </div>

      <EmptyState
        icon={<Swords size={24} />}
        title="Pattern detail view"
        description="Pattern detail with problem list will be implemented in Phase 5."
      />
    </div>
  );
}
