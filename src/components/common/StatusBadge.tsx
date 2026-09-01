// ============================================================
// STATUS BADGE — Second Brain
// Specialized badge for problem status display
// ============================================================

import type { ProblemStatus, Difficulty } from "../../types";
import Badge from "./Badge";

type BadgeVariant = "default" | "accent" | "success" | "warning" | "danger" | "info";

const STATUS_MAP: Record<ProblemStatus, { label: string; variant: BadgeVariant }> = {
  to_solve: { label: "To Solve", variant: "info" },
  solved: { label: "Solved", variant: "success" },
  need_revision: { label: "Need Revision", variant: "warning" },
  mastered: { label: "Mastered", variant: "accent" },
};

const DIFFICULTY_MAP: Record<Difficulty, { label: string; variant: BadgeVariant }> = {
  easy: { label: "Easy", variant: "success" },
  medium: { label: "Medium", variant: "warning" },
  hard: { label: "Hard", variant: "danger" },
};

export function StatusBadge({ status }: { status: ProblemStatus }) {
  const config = STATUS_MAP[status];
  return (
    <Badge variant={config.variant} dot>
      {config.label}
    </Badge>
  );
}

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const config = DIFFICULTY_MAP[difficulty];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
