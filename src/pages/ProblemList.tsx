// ============================================================
// PROBLEM LIST PAGE — Second Brain
// Shared page for DSA/CP listings with filters, sorting, search
// Route path determines the default filter context
// ============================================================

import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Code2,
  Plus,
  Search,
  SlidersHorizontal,
  X,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { getProblems } from "../services/problemService";
import { getAllPlatforms } from "../services/platformService";
import { getAllPatterns } from "../services/patternService";
import { getAllTags } from "../services/tagService";
import type {
  ProblemWithRelations,
  Platform,
  Pattern,
  Tag,
  ProblemFilters,
  Category,
  Difficulty,
  ProblemStatus,
  SortField,
  SortOrder,
} from "../types";
import { DIFFICULTY_CONFIG, STATUS_CONFIG } from "../utils/constants";
import { formatRelativeDate } from "../utils/dates";
import EmptyState from "../components/common/EmptyState";

/** Map route paths to default filter state */
function getDefaultFilters(pathname: string): Partial<ProblemFilters> {
  const map: Record<string, Partial<ProblemFilters>> = {
    "/dsa/all": { category: "dsa" },
    "/dsa/leetcode": { category: "dsa" },
    "/dsa/other": { category: "dsa" },
    "/cp/all": { category: "cp" },
    "/cp/codeforces": { category: "cp" },
    "/cp/codechef": { category: "cp" },
    "/cp/atcoder": { category: "cp" },
    "/cp/other": { category: "cp" },
  };
  return map[pathname] || {};
}

function getPageTitle(pathname: string): string {
  const map: Record<string, string> = {
    "/dsa/all": "All DSA Problems",
    "/dsa/leetcode": "LeetCode Problems",
    "/dsa/other": "Other DSA Problems",
    "/cp/all": "All CP Problems",
    "/cp/codeforces": "Codeforces Problems",
    "/cp/codechef": "CodeChef Problems",
    "/cp/atcoder": "AtCoder Problems",
    "/cp/other": "Other CP Problems",
  };
  return map[pathname] || "Problems";
}

export default function ProblemList() {
  const location = useLocation();
  const navigate = useNavigate();
  const title = getPageTitle(location.pathname);
  const isDsa = location.pathname.startsWith("/dsa");

  const [problems, setProblems] = useState<ProblemWithRelations[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filters state
  const [difficulty, setDifficulty] = useState<Difficulty | "">("");
  const [status, setStatus] = useState<ProblemStatus | "">("");
  const [patternId, setPatternId] = useState<number | 0>(0);
  const [tagId, setTagId] = useState<number | 0>(0);
  const [sortBy, setSortBy] = useState<SortField>("updated_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  useEffect(() => {
    loadReferenceData();
  }, []);

  useEffect(() => {
    loadProblems();
  }, [location.pathname, difficulty, status, patternId, tagId, sortBy, sortOrder, searchQuery]);

  async function loadReferenceData() {
    try {
      const [pl, pa, ta] = await Promise.all([getAllPlatforms(), getAllPatterns(), getAllTags()]);
      setPlatforms(pl);
      setPatterns(pa);
      setTags(ta);
    } catch (err) {
      console.error("Failed to load reference data:", err);
    }
  }

  async function loadProblems() {
    setLoading(true);
    try {
      const defaults = getDefaultFilters(location.pathname);

      // Determine platform filter from route
      let platformId: number | null = null;
      const routePlatformMap: Record<string, string> = {
        "/dsa/leetcode": "LeetCode",
        "/cp/codeforces": "Codeforces",
        "/cp/codechef": "CodeChef",
        "/cp/atcoder": "AtCoder",
      };
      const platformName = routePlatformMap[location.pathname];
      if (platformName) {
        const plat = platforms.find((p) => p.name === platformName);
        if (plat) platformId = plat.id;
      }

      // "Other" routes: platform NOT in known platforms
      if (location.pathname === "/dsa/other" || location.pathname === "/cp/other") {
        const otherPlat = platforms.find((p) => p.name === "Other");
        if (otherPlat) platformId = otherPlat.id;
      }

      const filters: Partial<ProblemFilters> = {
        ...defaults,
        platform_id: platformId,
        difficulty: difficulty || null,
        status: status || null,
        pattern_id: patternId || null,
        tag_id: tagId || null,
        sort_by: sortBy,
        sort_order: sortOrder,
        search: searchQuery || undefined,
      };

      const result = await getProblems(filters);
      setProblems(result);
    } catch (err) {
      console.error("Failed to load problems:", err);
    } finally {
      setLoading(false);
    }
  }

  const hasActiveFilters = difficulty || status || patternId || tagId || searchQuery;

  function clearFilters() {
    setDifficulty("");
    setStatus("");
    setPatternId(0);
    setTagId(0);
    setSearchQuery("");
  }

  return (
    <div className="space-y-5">
      {/* ---- Header ---- */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {problems.length} problem{problems.length !== 1 ? "s" : ""}
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

      {/* ---- Search + Filter Bar ---- */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search problems..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-surface-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 h-9 px-3 rounded-lg border text-sm transition-colors ${
            showFilters || hasActiveFilters
              ? "border-accent text-accent bg-accent-subtle"
              : "border-border text-text-muted hover:border-border hover:text-text-secondary bg-surface-2"
          }`}
        >
          <SlidersHorizontal size={15} />
          Filters
          {hasActiveFilters && (
            <span className="w-4 h-4 rounded-full bg-accent text-white text-[10px] flex items-center justify-center font-bold">
              !
            </span>
          )}
        </button>
      </div>

      {/* ---- Filter Panel ---- */}
      {showFilters && (
        <div className="bg-surface-1 border border-border rounded-xl p-4 space-y-3 animate-fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-text-muted mb-1 block">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty | "")}
                className="w-full h-8 px-2 rounded-md border border-border bg-surface-2 text-sm text-text-primary focus:outline-none focus:border-accent"
              >
                <option value="">All</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted mb-1 block">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProblemStatus | "")}
                className="w-full h-8 px-2 rounded-md border border-border bg-surface-2 text-sm text-text-primary focus:outline-none focus:border-accent"
              >
                <option value="">All</option>
                <option value="to_solve">To Solve</option>
                <option value="solved">Solved</option>
                <option value="need_revision">Need Revision</option>
                <option value="mastered">Mastered</option>
              </select>
            </div>
            {isDsa && (
              <div>
                <label className="text-xs font-medium text-text-muted mb-1 block">Pattern</label>
                <select
                  value={patternId}
                  onChange={(e) => setPatternId(Number(e.target.value))}
                  className="w-full h-8 px-2 rounded-md border border-border bg-surface-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                >
                  <option value={0}>All Patterns</option>
                  {patterns.map((p) => (
                    <option key={p.id} value={p.id}>{p.group_name} → {p.name}</option>
                  ))}
                </select>
              </div>
            )}
            {!isDsa && (
              <div>
                <label className="text-xs font-medium text-text-muted mb-1 block">Tag</label>
                <select
                  value={tagId}
                  onChange={(e) => setTagId(Number(e.target.value))}
                  className="w-full h-8 px-2 rounded-md border border-border bg-surface-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                >
                  <option value={0}>All Tags</option>
                  {tags.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-text-muted mb-1 block">Sort By</label>
              <div className="flex gap-1">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortField)}
                  className="flex-1 h-8 px-2 rounded-md border border-border bg-surface-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                >
                  <option value="updated_at">Recently Updated</option>
                  <option value="created_at">Recently Added</option>
                  <option value="title">Name</option>
                  <option value="difficulty">Difficulty</option>
                  <option value="last_solved_at">Last Solved</option>
                  <option value="next_review_date">Next Review</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="h-8 w-8 flex items-center justify-center rounded-md border border-border bg-surface-2 text-text-muted hover:text-text-secondary"
                >
                  {sortOrder === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>
            </div>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-accent hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* ---- Problem List ---- */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-text-muted" />
        </div>
      ) : problems.length === 0 ? (
        <EmptyState
          icon={isDsa ? <BookOpen size={24} /> : <Code2 size={24} />}
          title={hasActiveFilters ? "No matching problems" : "No problems yet"}
          description={
            hasActiveFilters
              ? "Try adjusting your filters or search query."
              : `Start adding ${isDsa ? "DSA" : "competitive programming"} problems to build your knowledge base.`
          }
          action={
            hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={() => navigate("/add-problem")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
              >
                <Plus size={16} />
                Add Problem
              </button>
            )
          }
        />
      ) : (
        <div className="space-y-2">
          {problems.map((problem) => {
            const diffConfig = DIFFICULTY_CONFIG[problem.difficulty];
            const statConfig = STATUS_CONFIG[problem.status];

            return (
              <div
                key={problem.id}
                onClick={() => navigate(`/problem/${problem.id}`)}
                className="bg-surface-1 border border-border rounded-xl p-4 cursor-pointer card-hover"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-text-primary truncate">
                      {problem.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-surface-2 text-text-muted">
                        {problem.platform_name}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${diffConfig.bgColor} ${diffConfig.color}`}>
                        {diffConfig.label}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${statConfig.bgColor} ${statConfig.color}`}>
                        {statConfig.label}
                      </span>
                      {problem.patterns.slice(0, 3).map((p) => (
                        <span key={p.id} className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-accent-subtle text-accent">
                          {p.name}
                        </span>
                      ))}
                      {problem.patterns.length > 3 && (
                        <span className="text-[11px] text-text-muted">
                          +{problem.patterns.length - 3}
                        </span>
                      )}
                      {problem.tags.slice(0, 3).map((t) => (
                        <span key={t.id} className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-surface-3 text-text-muted">
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-[11px] text-text-muted whitespace-nowrap">
                    {formatRelativeDate(problem.updated_at)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
