// ============================================================
// ANALYTICS PAGE — Second Brain
// Detailed charts and statistics using Recharts
// ============================================================

import { useEffect, useState } from "react";
import { TrendingUp, Code2, LayoutGrid, AlertCircle, Globe } from "lucide-react";
import { toast } from "sonner";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import {
  getProblemsOverTime,
  getPlatformDistribution,
  getDifficultyDistribution,
  getDsaStats,
  getCpStats,
  getPatternOverview,
} from "../services/analyticsService";
import type {
  TimeSeriesPoint,
  PlatformDistribution,
  DifficultyDistribution,
  DsaStats,
  CpStats,
  PatternOverview,
  Platform,
} from "../types";
import { getAllPlatforms } from "../services/platformService";
import EmptyState from "../components/common/EmptyState";

// Standard colors
const COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6", "#64748b"];
const DIFF_COLORS = { easy: "#10b981", medium: "#f59e0b", hard: "#f43f5e" };

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  
  const [timeSeries, setTimeSeries] = useState<TimeSeriesPoint[]>([]);
  const [platforms, setPlatforms] = useState<PlatformDistribution[]>([]);
  const [difficulties, setDifficulties] = useState<DifficultyDistribution[]>([]);
  const [patterns, setPatterns] = useState<PatternOverview[]>([]);
  
  const [dsaStats, setDsaStats] = useState<DsaStats | null>(null);
  const [cpStats, setCpStats] = useState<CpStats | null>(null);
  const [allPlatforms, setAllPlatforms] = useState<Platform[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    setLoading(true);
    try {
      const [ts, plats, diffs, pats, dsa, cp, pList] = await Promise.all([
        getProblemsOverTime(),
        getPlatformDistribution(),
        getDifficultyDistribution(),
        getPatternOverview(7), // Top 7 patterns
        getDsaStats(),
        getCpStats(),
        getAllPlatforms(),
      ]);
      
      // Calculate cumulative for time series
      let runningTotal = 0;
      const cumulativeTs = ts.map(point => {
        runningTotal += point.count;
        return { ...point, cumulative: runningTotal };
      });
      
      setTimeSeries(cumulativeTs);
      setPlatforms(plats);
      setDifficulties(diffs);
      setPatterns(pats);
      setDsaStats(dsa);
      setCpStats(cp);
      setAllPlatforms(pList);
    } catch (err) {
      console.error("Failed to load analytics:", err);
      toast.error("Failed to load analytics data.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingSpinner label="Loading analytics..." />;
  }

  if (timeSeries.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Track your progress and problem-solving statistics
          </p>
        </div>
        <EmptyState
          icon={<AlertCircle size={24} />}
          title="Not enough data"
          description="Add some problems to your knowledge base to see analytics and charts."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Detailed insights into your problem-solving journey
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ---- Top Level Category Stats ---- */}
        <div className="bg-surface-1 border border-border rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-text-primary flex items-center gap-2 mb-4">
            <LayoutGrid size={16} className="text-accent" />
            DSA vs CP
          </h3>
          <div className="flex items-center justify-around mt-6">
            <div className="text-center">
              <p className="text-sm text-text-muted mb-1">DSA Problems</p>
              <p className="text-3xl font-bold text-text-primary">{dsaStats?.total || 0}</p>
            </div>
            <div className="w-px h-16 bg-border-subtle" />
            <div className="text-center">
              <p className="text-sm text-text-muted mb-1">CP Problems</p>
              <p className="text-3xl font-bold text-text-primary">{cpStats?.total || 0}</p>
            </div>
          </div>
        </div>

        {/* ---- Difficulty Distribution (Pie) ---- */}
        <div className="bg-surface-1 border border-border rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-text-primary mb-4">Difficulty Distribution</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={difficulties}
                  dataKey="count"
                  nameKey="difficulty"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                >
                  {difficulties.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DIFF_COLORS[entry.difficulty as keyof typeof DIFF_COLORS] || COLORS[0]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      {/* ---- Connected Profiles Stats ---- */}
      {allPlatforms.some(p => p.stats_json) && (
        <div className="lg:col-span-2 bg-surface-1 border border-border rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-text-primary flex items-center gap-2 mb-4">
            <Globe size={16} className="text-accent" />
            Connected Profiles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allPlatforms.filter(p => p.stats_json).map(p => {
              const stats = JSON.parse(p.stats_json!);
              return (
                <div key={p.id} className="bg-surface-2 rounded-lg p-4 border border-border-subtle">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-text-primary">{p.name}</span>
                    <span className="text-xs text-text-muted">@{p.profile_username}</span>
                  </div>
                  {p.name.toLowerCase().includes("leetcode") ? (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-text-secondary">Solved:</div>
                      <div className="text-text-primary font-medium text-right">{stats.totalSolved || 0}</div>
                      <div className="text-text-secondary">Rating:</div>
                      <div className="text-text-primary font-medium text-right">{stats.rating || 0}</div>
                      <div className="text-text-secondary">Easy/Med/Hard:</div>
                      <div className="text-text-primary font-medium text-right text-xs">
                        {stats.easySolved || 0} / {stats.mediumSolved || 0} / {stats.hardSolved || 0}
                      </div>
                    </div>
                  ) : p.name.toLowerCase().includes("codeforces") ? (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-text-secondary">Rating:</div>
                      <div className="text-text-primary font-medium text-right">{stats.rating || 0}</div>
                      <div className="text-text-secondary">Max Rating:</div>
                      <div className="text-text-primary font-medium text-right">{stats.maxRating || 0}</div>
                      <div className="text-text-secondary">Rank:</div>
                      <div className="text-text-primary font-medium text-right capitalize">{stats.rank || "Unrated"}</div>
                    </div>
                  ) : p.name.toLowerCase().includes("codechef") ? (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-text-secondary">Rating:</div>
                      <div className="text-text-primary font-medium text-right">{stats.rating || 0}</div>
                      <div className="text-text-secondary">Highest:</div>
                      <div className="text-text-primary font-medium text-right">{stats.maxRating || 0}</div>
                      <div className="text-text-secondary">Stars:</div>
                      <div className="text-amber-500 font-semibold text-right">
                        {stats.stars ? `${stats.stars}★` : "Unrated"}
                      </div>
                      {stats.totalSolved !== undefined && stats.totalSolved > 0 ? (
                        <>
                          <div className="text-text-secondary">Solved:</div>
                          <div className="text-text-primary font-medium text-right">{stats.totalSolved}</div>
                        </>
                      ) : null}
                      {stats.globalRank ? (
                        <>
                          <div className="text-text-secondary">Global Rank:</div>
                          <div className="text-text-primary font-medium text-right text-xs">#{stats.globalRank}</div>
                        </>
                      ) : null}
                    </div>
                  ) : p.name.toLowerCase().includes("atcoder") ? (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-text-secondary">Rating:</div>
                      <div className="text-text-primary font-medium text-right">{stats.rating || 0}</div>
                      <div className="text-text-secondary">Highest:</div>
                      <div className="text-text-primary font-medium text-right">{stats.maxRating || 0}</div>
                      <div className="text-text-secondary">Rank:</div>
                      <div className="text-text-primary font-medium text-right capitalize text-xs truncate" title={stats.rank}>
                        {stats.rank || "Unrated"}
                      </div>
                      {stats.ratedContests !== undefined ? (
                        <>
                          <div className="text-text-secondary">Contests:</div>
                          <div className="text-text-primary font-medium text-right">{stats.ratedContests}</div>
                        </>
                      ) : null}
                    </div>
                  ) : (
                    <div className="text-xs text-text-muted break-words">
                      {p.stats_json}
                    </div>
                  )}
                  <div className="mt-3 pt-3 border-t border-border-subtle text-[10px] text-text-muted text-right">
                    Last synced: {p.last_synced_at ? new Date(p.last_synced_at).toLocaleString() : "Never"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

        {/* ---- Progress Over Time (Line) ---- */}
        <div className="lg:col-span-2 bg-surface-1 border border-border rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-text-primary flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-accent" />
            Cumulative Problems Over Time
          </h3>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="var(--text-muted)" 
                  fontSize={12} 
                  tickFormatter={(val) => {
                    const d = new Date(val);
                    return `${d.getMonth()+1}/${d.getDate()}`;
                  }}
                />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                  labelStyle={{ color: 'var(--text-primary)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="cumulative" 
                  name="Total Solved"
                  stroke="var(--accent)" 
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ---- Platform Distribution (Bar) ---- */}
        <div className="bg-surface-1 border border-border rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-text-primary flex items-center gap-2 mb-4">
            <Code2 size={16} className="text-accent" />
            Problems by Platform
          </h3>
          <div className="h-56 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platforms} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" horizontal={false} />
                <XAxis type="number" stroke="var(--text-muted)" fontSize={12} />
                <YAxis type="category" dataKey="platform" stroke="var(--text-muted)" fontSize={12} />
                <Tooltip
                  cursor={{ fill: 'var(--surface-2)' }}
                  contentStyle={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                />
                <Bar dataKey="count" name="Problems" fill="var(--accent)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ---- Top Patterns (Bar) ---- */}
        <div className="bg-surface-1 border border-border rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-text-primary mb-4">Top DSA Patterns</h3>
          <div className="h-56 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={patterns} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tick={{ width: 60 }} interval={0} angle={-30} textAnchor="end" />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip
                  cursor={{ fill: 'var(--surface-2)' }}
                  contentStyle={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                />
                <Bar dataKey="count" name="Problems" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
