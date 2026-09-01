// ============================================================
// EDIT PROBLEM PAGE — Second Brain
// Loads existing problem data and wraps ProblemForm in edit mode
// ============================================================

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import ProblemForm from "../components/problems/ProblemForm";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import { getProblemById, updateProblem } from "../services/problemService";
import type { ProblemFormData, ProblemWithRelations } from "../types";

export default function EditProblem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const problemId = Number(id);

  const [problem, setProblem] = useState<ProblemWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!problemId || isNaN(problemId)) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    loadProblem();
  }, [problemId]);

  async function loadProblem() {
    try {
      const data = await getProblemById(problemId);
      if (!data) {
        setNotFound(true);
      } else {
        setProblem(data);
      }
    } catch (err) {
      console.error("Failed to load problem:", err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(data: ProblemFormData) {
    await updateProblem(problemId, data);
    toast.success("Problem updated successfully.");
    navigate(`/problem/${problemId}`);
  }

  if (loading) {
    return <LoadingSpinner label="Loading problem..." />;
  }

  if (notFound || !problem) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-text-muted hover:bg-surface-2 hover:text-text-secondary transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-2xl font-bold text-text-primary">Edit Problem</h1>
        </div>
        <EmptyState
          icon={<ArrowLeft size={24} />}
          title="Problem not found"
          description="The problem you're trying to edit doesn't exist."
        />
      </div>
    );
  }

  // Convert loaded problem into form data shape
  const initialData: Partial<ProblemFormData> = {
    title: problem.title,
    url: problem.url,
    platform_id: problem.platform_id,
    category: problem.category,
    difficulty: problem.difficulty,
    status: problem.status,
    approach: problem.approach,
    key_observation: problem.key_observation,
    algorithm: problem.algorithm,
    why_it_works: problem.why_it_works,
    time_complexity: problem.time_complexity,
    space_complexity: problem.space_complexity,
    mistake: problem.mistake,
    lessons: problem.lessons,
    notes: problem.notes,
    code: problem.code,
    code_language: problem.code_language,
    pattern_ids: problem.patterns.map((p) => p.id),
    tag_ids: problem.tags.map((t) => t.id),
    next_review_date: problem.next_review_date,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-text-muted hover:bg-surface-2 hover:text-text-secondary transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-text-primary truncate">
            Edit: {problem.title}
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Modify your notes, approach, and code
          </p>
        </div>
      </div>

      {/* Form */}
      <ProblemForm
        initialData={initialData}
        editingId={problemId}
        onSubmit={handleSubmit}
        submitLabel="Update Problem"
      />
    </div>
  );
}
