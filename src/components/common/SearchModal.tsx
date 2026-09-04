// ============================================================
// SEARCH MODAL — Second Brain
// Global search (Cmd+K) with FTS results grouped by category
// ============================================================

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Search, X, Loader2, BookOpen, Code2, FileText } from "lucide-react";
import { getProblems } from "../../services/problemService";
import type { ProblemWithRelations } from "../../types";
import { DIFFICULTY_CONFIG } from "../../utils/constants";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProblemWithRelations[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await getProblems({ search: query });
        setResults(res.slice(0, 20));
        setSelectedIndex(0);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  function handleSelect(id: number) {
    onClose();
    navigate(`/problem/${id}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      handleSelect(results[selectedIndex].id);
    } else if (e.key === "Escape") {
      onClose();
    }
  }

  if (!open) return null;

  // Group results by category
  const dsaResults = results.filter((r) => r.category === "dsa");
  const cpResults = results.filter((r) => r.category === "cp");

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-surface-1 border border-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 border-b border-border">
          <Search size={18} className="text-text-muted flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search problems, patterns, tags..."
            className="flex-1 h-12 bg-transparent text-text-primary text-sm placeholder:text-text-muted focus:outline-none"
          />
          {loading && <Loader2 size={16} className="animate-spin text-text-muted" />}
          <button onClick={onClose} className="text-text-muted hover:text-text-secondary">
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto">
          {query && !loading && results.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-text-muted">
              No results found for "{query}"
            </div>
          )}

          {!query && (
            <div className="px-4 py-6 text-center text-sm text-text-muted">
              Start typing to search...
            </div>
          )}

          {dsaResults.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider bg-surface-0 flex items-center gap-1.5">
                <BookOpen size={12} />
                DSA
              </div>
              {dsaResults.map((problem) => {
                const globalIndex = results.indexOf(problem);
                return (
                  <ResultItem
                    key={problem.id}
                    problem={problem}
                    selected={globalIndex === selectedIndex}
                    onClick={() => handleSelect(problem.id)}
                  />
                );
              })}
            </div>
          )}

          {cpResults.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider bg-surface-0 flex items-center gap-1.5">
                <Code2 size={12} />
                Competitive Programming
              </div>
              {cpResults.map((problem) => {
                const globalIndex = results.indexOf(problem);
                return (
                  <ResultItem
                    key={problem.id}
                    problem={problem}
                    selected={globalIndex === selectedIndex}
                    onClick={() => handleSelect(problem.id)}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-border-subtle text-[11px] text-text-muted">
          <span>↑↓ Navigate</span>
          <span>↵ Open</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>,
    document.body
  );
}

function ResultItem({
  problem,
  selected,
  onClick,
}: {
  problem: ProblemWithRelations;
  selected: boolean;
  onClick: () => void;
}) {
  const diffConfig = DIFFICULTY_CONFIG[problem.difficulty];

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
        selected ? "bg-accent-subtle" : "hover:bg-surface-2"
      }`}
    >
      <FileText size={15} className="text-text-muted flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-primary truncate">{problem.title}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[11px] text-text-muted">{problem.platform_name}</span>
          <span className={`text-[11px] ${diffConfig.color}`}>{diffConfig.label}</span>
        </div>
      </div>
    </button>
  );
}
