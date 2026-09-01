// ============================================================
// PATTERN PROGRESS — Second Brain
// Visual progress bar for pattern completion metrics
// ============================================================

interface PatternProgressProps {
  total: number;
  solved: number;
  needsRevision: number;
}

export default function PatternProgress({ total, solved, needsRevision }: PatternProgressProps) {
  if (total === 0) {
    return (
      <div className="w-full h-1.5 bg-surface-2 rounded-full overflow-hidden" />
    );
  }

  // Cap at 100% just in case of data inconsistencies
  const solvedPct = Math.min((solved / total) * 100, 100);
  const revisionPct = Math.min((needsRevision / total) * 100, 100 - solvedPct);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between text-[10px] font-medium">
        <span className="text-text-muted">{total} total</span>
        <div className="flex items-center gap-2">
          {solved > 0 && <span className="text-success">{solved} solved</span>}
          {needsRevision > 0 && <span className="text-warning">{needsRevision} review</span>}
        </div>
      </div>
      
      <div className="w-full h-1.5 bg-surface-2 rounded-full overflow-hidden flex">
        {solvedPct > 0 && (
          <div 
            className="h-full bg-success transition-all duration-500"
            style={{ width: `${solvedPct}%` }}
          />
        )}
        {revisionPct > 0 && (
          <div 
            className="h-full bg-warning transition-all duration-500"
            style={{ width: `${revisionPct}%` }}
          />
        )}
      </div>
    </div>
  );
}
