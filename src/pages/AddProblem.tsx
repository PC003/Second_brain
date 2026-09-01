// ============================================================
// ADD PROBLEM PAGE — Second Brain
// Full-featured form for creating a new DSA/CP problem entry
// Wraps ProblemForm in create mode
// ============================================================

import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ProblemForm from "../components/problems/ProblemForm";
import { createProblem } from "../services/problemService";
import type { ProblemFormData } from "../types";

export default function AddProblem() {
  const navigate = useNavigate();

  async function handleSubmit(data: ProblemFormData) {
    const id = await createProblem(data);
    toast.success("Problem saved successfully.");
    navigate(`/problem/${id}`);
  }

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
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Add Problem</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Store a new DSA or Competitive Programming problem
          </p>
        </div>
      </div>

      {/* Form */}
      <ProblemForm onSubmit={handleSubmit} submitLabel="Save Problem" />
    </div>
  );
}
