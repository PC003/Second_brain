// ============================================================
// PROBLEM LIST PAGE — Second Brain
// Shared page for DSA/CP problem listing with filters
// Reads the current route path to determine filter context
// ============================================================

import { useLocation, useNavigate } from "react-router-dom";
import { BookOpen, Code2, Plus } from "lucide-react";
import EmptyState from "../components/common/EmptyState";

/** Map route paths to display names */
const SECTION_TITLES: Record<string, string> = {
  "/dsa/all": "All DSA Problems",
  "/dsa/leetcode": "LeetCode Problems",
  "/dsa/other": "Other DSA Problems",
  "/cp/all": "All CP Problems",
  "/cp/codeforces": "Codeforces Problems",
  "/cp/codechef": "CodeChef Problems",
  "/cp/atcoder": "AtCoder Problems",
  "/cp/other": "Other CP Problems",
};

export default function ProblemList() {
  const location = useLocation();
  const navigate = useNavigate();
  const title = SECTION_TITLES[location.pathname] || "Problems";
  const isDsa = location.pathname.startsWith("/dsa");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {isDsa ? "Data Structures & Algorithms" : "Competitive Programming"} problems
          </p>
        </div>
        <button
          onClick={() => navigate("/add-problem")}
          className="flex items-center gap-2 h-9 px-3.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          <Plus size={16} />
          Add Problem
        </button>
      </div>

      <EmptyState
        icon={isDsa ? <BookOpen size={24} /> : <Code2 size={24} />}
        title="No problems yet"
        description={`Start adding ${isDsa ? "DSA" : "competitive programming"} problems to build your knowledge base.`}
        action={
          <button
            onClick={() => navigate("/add-problem")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
          >
            <Plus size={16} />
            Add Problem
          </button>
        }
      />
    </div>
  );
}
