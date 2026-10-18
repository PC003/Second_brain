// ============================================================
// SETTINGS PAGE — Second Brain
// Theme, Platforms, Patterns, Data Management (Export/Import)
// ============================================================

import { useEffect, useState } from "react";
import {
  Sun,
  Moon,
  Monitor,
  Plus,
  Edit2,
  Trash2,
  FileSpreadsheet,
  Upload,
  AlertTriangle,
  Database,
  Loader2,
  Check,
  X,
  Globe,
  Swords,
  HardDrive,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "../context/ThemeContext";
import { save, open } from "@tauri-apps/plugin-dialog";
import { writeFile, readFile } from "@tauri-apps/plugin-fs";
import {
  getAllPlatforms,
  createPlatform,
  updatePlatform,
  deletePlatform,
  isPlatformInUse,
} from "../services/platformService";
import {
  getPatternsWithStats,
  createPattern,
  updatePattern,
  deletePattern,
  deletePatternGroup,
  getPatternUsageCount,
} from "../services/patternService";
import {
  exportAllDataToExcel,
  importAllDataFromExcel,
  importAllData,
  resetAllData,
  getDataStats,
} from "../services/dataService";
import ConfirmDialog from "../components/common/ConfirmDialog";
import type { Platform, PatternWithStats, SecondBrainExport } from "../types";

// ---- Inline Edit Row for Platforms ----

function PlatformRow({
  platform,
  onUpdate,
  onDelete,
}: {
  platform: Platform;
  onUpdate: () => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(platform.name);
  const [type, setType] = useState(platform.type);
  const [username, setUsername] = useState(platform.profile_username || "");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [inUse, setInUse] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;
    try {
      await updatePlatform(platform.id, name.trim(), type, username.trim());
      toast.success(`Platform "${name.trim()}" updated.`);
      setEditing(false);
      onUpdate();
    } catch (err) {
      toast.error("Failed to update platform.");
      console.error(err);
    }
  }

  async function handleDelete() {
    const used = await isPlatformInUse(platform.id);
    if (used) {
      setInUse(true);
      setConfirmDelete(false);
      toast.error("This platform is in use by problems. Remove them first.");
      return;
    }
    try {
      await deletePlatform(platform.id);
      toast.success(`Platform "${platform.name}" deleted.`);
      onDelete();
    } catch (err) {
      toast.error("Failed to delete platform.");
      console.error(err);
    }
    setConfirmDelete(false);
  }

  async function handleSync() {
    if (!platform.profile_username) return;
    setIsSyncing(true);
    try {
      // Lazy import integrationService to avoid cycle or early errors
      const { syncPlatformStats } = await import("../services/integrationService");
      await syncPlatformStats(platform.id, platform.name, platform.profile_username);
      toast.success(`Stats synced for ${platform.name}`);
      onUpdate();
    } catch (err: any) {
      toast.error(err.message || "Failed to sync stats");
    } finally {
      setIsSyncing(false);
    }
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-surface-2 animate-fade-in flex-wrap">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-32 h-8 px-2 rounded-md border border-border bg-surface-0 text-sm text-text-primary focus:outline-none focus:border-accent"
          autoFocus
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as Platform["type"])}
          className="h-8 px-2 rounded-md border border-border bg-surface-0 text-sm text-text-primary focus:outline-none focus:border-accent"
        >
          <option value="dsa">DSA</option>
          <option value="cp">CP</option>
          <option value="both">Both</option>
        </select>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="API Username (Optional)"
          className="flex-1 h-8 px-2 rounded-md border border-border bg-surface-0 text-sm text-text-primary focus:outline-none focus:border-accent min-w-[150px]"
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
        />
        <button onClick={handleSave} className="w-7 h-7 rounded-md flex items-center justify-center text-success hover:bg-success-subtle transition-colors">
          <Check size={15} />
        </button>
        <button onClick={() => { setEditing(false); setName(platform.name); setType(platform.type); setUsername(platform.profile_username || ""); }} className="w-7 h-7 rounded-md flex items-center justify-center text-text-muted hover:bg-surface-3 transition-colors">
          <X size={15} />
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-surface-2 transition-colors group">
        <div className="flex-1">
          <span className="text-sm font-medium text-text-primary mr-2">{platform.name}</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-surface-3 text-text-muted uppercase tracking-wide">
            {platform.type}
          </span>
          {platform.profile_username && (
            <span className="ml-2 text-xs text-text-muted">@{platform.profile_username}</span>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {platform.profile_username && (
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="px-2 h-7 rounded-md flex items-center justify-center text-xs font-medium text-text-muted hover:text-accent hover:bg-accent-subtle transition-colors disabled:opacity-50"
              title="Sync Stats"
            >
              {isSyncing ? "Syncing..." : "Sync"}
            </button>
          )}
          <button
            onClick={() => setEditing(true)}
            className="w-7 h-7 rounded-md flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-3 transition-colors"
            title="Edit"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-7 h-7 rounded-md flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger-subtle transition-colors"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {confirmDelete && (
        <ConfirmDialog
          open={true}
          title="Delete Platform"
          message={`Are you sure you want to delete "${platform.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}

      {inUse && (
        <p className="text-xs text-danger px-3 pb-1 animate-fade-in">
          Cannot delete — this platform is used by existing problems.
        </p>
      )}
    </>
  );
}

// ---- Inline Edit Row for Patterns ----

function PatternRow({
  pattern,
  existingGroups,
  onUpdate,
  onDelete,
}: {
  pattern: PatternWithStats;
  existingGroups: string[];
  onUpdate: () => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(pattern.name);
  const [group, setGroup] = useState(pattern.group_name);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleSave() {
    if (!name.trim() || !group.trim()) return;
    try {
      await updatePattern(pattern.id, name.trim(), group.trim());
      toast.success(`Pattern "${name.trim()}" updated.`);
      setEditing(false);
      onUpdate();
    } catch (err) {
      toast.error("Failed to update pattern.");
      console.error(err);
    }
  }

  async function handleDelete() {
    const count = await getPatternUsageCount(pattern.id);
    if (count > 0) {
      toast.error(`This pattern is used by ${count} problem${count !== 1 ? "s" : ""}. Remove them first.`);
      setConfirmDelete(false);
      return;
    }
    try {
      await deletePattern(pattern.id);
      toast.success(`Pattern "${pattern.name}" deleted.`);
      onDelete();
    } catch (err) {
      toast.error("Failed to delete pattern.");
      console.error(err);
    }
    setConfirmDelete(false);
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-surface-2 animate-fade-in">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Pattern name"
          className="flex-1 h-8 px-2 rounded-md border border-border bg-surface-0 text-sm text-text-primary focus:outline-none focus:border-accent"
          autoFocus
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
        />
        <input
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          placeholder="Group name"
          list="pattern-groups-edit"
          className="w-40 h-8 px-2 rounded-md border border-border bg-surface-0 text-sm text-text-primary focus:outline-none focus:border-accent"
        />
        <datalist id="pattern-groups-edit">
          {existingGroups.map((g) => (
            <option key={g} value={g} />
          ))}
        </datalist>
        <button onClick={handleSave} className="w-7 h-7 rounded-md flex items-center justify-center text-success hover:bg-success-subtle transition-colors">
          <Check size={15} />
        </button>
        <button onClick={() => { setEditing(false); setName(pattern.name); setGroup(pattern.group_name); }} className="w-7 h-7 rounded-md flex items-center justify-center text-text-muted hover:bg-surface-3 transition-colors">
          <X size={15} />
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-surface-2 transition-colors group">
        <span className="flex-1 text-sm font-medium text-text-primary">{pattern.name}</span>
        <span className="text-[11px] text-text-muted">{pattern.group_name}</span>
        <span className="text-[11px] text-text-muted tabular-nums">
          {pattern.problem_count || 0} problem{(pattern.problem_count || 0) !== 1 ? "s" : ""}
        </span>
        <div className="flex items-center gap-1 w-[60px] justify-end">
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setEditing(true)}
              className="w-7 h-7 rounded-md flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-3 transition-colors"
              title="Edit"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-7 h-7 rounded-md flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger-subtle transition-colors"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {confirmDelete && (
        <ConfirmDialog
          open={true}
          title="Delete Pattern"
          message={`Are you sure you want to delete "${pattern.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  );
}

// ---- Main Settings Page ----

export default function Settings() {
  const { theme, setTheme } = useTheme();

  // Platforms
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [showAddPlatform, setShowAddPlatform] = useState(false);
  const [newPlatformName, setNewPlatformName] = useState("");
  const [newPlatformUsername, setNewPlatformUsername] = useState("");
  const [newPlatformType, setNewPlatformType] = useState<Platform["type"]>("both");

  // Patterns
  const [patterns, setPatterns] = useState<PatternWithStats[]>([]);
  const [showAddPattern, setShowAddPattern] = useState(false);
  const [newPatternName, setNewPatternName] = useState("");
  const [newPatternGroup, setNewPatternGroup] = useState("");

  // Data management
  const [dataStats, setDataStats] = useState<{
    problems: number;
    patterns: number;
    platforms: number;
    contests: number;
    revisions: number;
  } | null>(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetText, setResetText] = useState("");

  useEffect(() => {
    loadPlatforms();
    loadPatterns();
    loadDataStats();
  }, []);

  async function loadPlatforms() {
    try {
      const data = await getAllPlatforms();
      setPlatforms(data);
    } catch (err) {
      toast.error("Failed to load platforms.");
      console.error(err);
    }
  }

  async function loadPatterns() {
    try {
      const data = await getPatternsWithStats();
      setPatterns(data);
    } catch (err) {
      toast.error("Failed to load patterns.");
      console.error(err);
    }
  }

  async function loadDataStats() {
    try {
      const stats = await getDataStats();
      setDataStats(stats);
    } catch (err) {
      console.error("Failed to load data stats:", err);
    }
  }

  // ---- Platform CRUD ----

  async function handleAddPlatform() {
    if (!newPlatformName.trim()) return;
    try {
      await createPlatform(newPlatformName.trim(), newPlatformType, newPlatformUsername.trim());
      toast.success(`Platform "${newPlatformName.trim()}" created.`);
      setNewPlatformName("");
      setNewPlatformUsername("");
      setNewPlatformType("both");
      setShowAddPlatform(false);
      loadPlatforms();
    } catch (err) {
      toast.error("Failed to create platform. It may already exist.");
      console.error(err);
    }
  }

  // ---- Pattern CRUD ----

  async function handleAddPattern() {
    if (!newPatternName.trim() || !newPatternGroup.trim()) return;
    try {
      await createPattern(newPatternName.trim(), newPatternGroup.trim());
      toast.success(`Pattern "${newPatternName.trim()}" created.`);
      setNewPatternName("");
      setNewPatternGroup("");
      setShowAddPattern(false);
      loadPatterns();
    } catch (err) {
      toast.error("Failed to create pattern. It may already exist in that group.");
      console.error(err);
    }
  }

  async function handleDeleteGroup(group: string, count: number) {
    if (
      !window.confirm(
        `Are you sure you want to delete the entire group "${group}" and all its ${count} pattern${count === 1 ? "" : "s"}?\n\nProblems will remain, but pattern associations will be unlinked.`
      )
    ) {
      return;
    }
    try {
      await deletePatternGroup(group);
      toast.success(`Group "${group}" and its patterns deleted.`);
      loadPatterns();
    } catch (err) {
      toast.error("Failed to delete group.");
      console.error(err);
    }
  }

  // ---- Data Management ----

  async function handleExport() {
    setExporting(true);
    try {
      const buffer = await exportAllDataToExcel();

      const filePath = await save({
        defaultPath: `second-brain-export-${new Date().toISOString().split("T")[0]}.xlsx`,
        filters: [
          { name: "Excel Spreadsheet", extensions: ["xlsx"] },
          { name: "All Files", extensions: ["*"] },
        ],
      });

      if (filePath) {
        await writeFile(filePath, buffer);
        const fileName = filePath.split(/[/\\]/).pop() || "export.xlsx";
        toast.success(`Data exported to ${fileName}`);
      }
    } catch (err) {
      toast.error("Export failed. Please try again.");
      console.error("Export error:", err);
    } finally {
      setExporting(false);
    }
  }

  async function handleImport() {
    setImporting(true);
    try {
      const filePath = await open({
        multiple: false,
        filters: [
          { name: "All Supported", extensions: ["xlsx", "xls", "json"] },
          { name: "Excel Spreadsheet", extensions: ["xlsx", "xls"] },
          { name: "JSON Backup", extensions: ["json"] },
          { name: "All Files", extensions: ["*"] },
        ],
      });

      if (!filePath) {
        setImporting(false);
        return;
      }

      const pathStr = filePath as string;
      const fileBytes = await readFile(pathStr);
      let result;

      if (pathStr.toLowerCase().endsWith(".json")) {
        const textDecoder = new TextDecoder();
        const jsonText = textDecoder.decode(fileBytes);
        const data: SecondBrainExport = JSON.parse(jsonText);
        result = await importAllData(data);
      } else {
        result = await importAllDataFromExcel(fileBytes);
      }

      toast.success(
        `Imported ${result.problems} problems, ${result.patterns} patterns, ${result.platforms} platforms.`
      );

      // Refresh all data
      loadPlatforms();
      loadPatterns();
      loadDataStats();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Import failed: ${msg}`);
      console.error("Import error:", err);
    } finally {
      setImporting(false);
    }
  }

  async function handleReset() {
    if (resetText !== "RESET") return;
    try {
      await resetAllData();
      toast.success("All data has been reset. Restart the app to restore defaults.");
      setConfirmReset(false);
      setResetText("");
      loadPlatforms();
      loadPatterns();
      loadDataStats();
    } catch (err) {
      toast.error("Reset failed. Please try again.");
      console.error("Reset error:", err);
    }
  }

  // Pattern groups for datalist
  const existingGroups = [...new Set(patterns.map((p) => p.group_name))];

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Manage your application preferences and data
        </p>
      </div>

      {/* ──────────────────────────────────────────────────
          SECTION 1: Appearance
          ────────────────────────────────────────────────── */}
      <section className="bg-surface-1 border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent-subtle flex items-center justify-center text-accent">
            <Sun size={16} />
          </div>
          <h2 className="text-lg font-semibold text-text-primary">Appearance</h2>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">Theme</label>
          <div className="flex gap-2">
            {(
              [
                { value: "dark", icon: <Moon size={16} />, label: "Dark" },
                { value: "light", icon: <Sun size={16} />, label: "Light" },
                { value: "system", icon: <Monitor size={16} />, label: "System" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
                  theme === opt.value
                    ? "bg-accent text-white border-accent"
                    : "bg-surface-2 text-text-secondary border-border hover:border-accent"
                }`}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────
          SECTION 2: Platforms
          ────────────────────────────────────────────────── */}
      <section className="bg-surface-1 border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-info-subtle flex items-center justify-center text-info">
              <Globe size={16} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Platforms</h2>
              <p className="text-xs text-text-muted">{platforms.length} platforms configured</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddPlatform(!showAddPlatform)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-accent hover:bg-accent-subtle transition-colors"
          >
            <Plus size={15} />
            Add
          </button>
        </div>

        {showAddPlatform && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-surface-2 border border-border-subtle animate-fade-in flex-wrap">
            <input
              value={newPlatformName}
              onChange={(e) => setNewPlatformName(e.target.value)}
              placeholder="Platform name..."
              className="w-32 h-8 px-2 rounded-md border border-border bg-surface-0 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleAddPlatform()}
            />
            <select
              value={newPlatformType}
              onChange={(e) => setNewPlatformType(e.target.value as Platform["type"])}
              className="h-8 px-2 rounded-md border border-border bg-surface-0 text-sm text-text-primary focus:outline-none focus:border-accent"
            >
              <option value="dsa">DSA</option>
              <option value="cp">CP</option>
              <option value="both">Both</option>
            </select>
            <input
              value={newPlatformUsername}
              onChange={(e) => setNewPlatformUsername(e.target.value)}
              placeholder="API Username (Optional)"
              className="flex-1 h-8 px-2 rounded-md border border-border bg-surface-0 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent min-w-[150px]"
              onKeyDown={(e) => e.key === "Enter" && handleAddPlatform()}
            />
            <button
              onClick={handleAddPlatform}
              disabled={!newPlatformName.trim()}
              className="h-8 px-3 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-hover disabled:opacity-40 transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => { setShowAddPlatform(false); setNewPlatformName(""); setNewPlatformUsername(""); }}
              className="w-8 h-8 rounded-md flex items-center justify-center text-text-muted hover:bg-surface-3 transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        )}

        <div className="divide-y divide-border-subtle">
          {platforms.map((p) => (
            <PlatformRow
              key={p.id}
              platform={p}
              onUpdate={loadPlatforms}
              onDelete={loadPlatforms}
            />
          ))}
        </div>

        {platforms.length === 0 && (
          <p className="text-sm text-text-muted text-center py-4">
            No platforms configured. Add one to get started.
          </p>
        )}
      </section>

      {/* ──────────────────────────────────────────────────
          SECTION 3: DSA Patterns
          ────────────────────────────────────────────────── */}
      <section className="bg-surface-1 border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent-subtle flex items-center justify-center text-accent">
              <Swords size={16} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">DSA Patterns</h2>
              <p className="text-xs text-text-muted">
                {patterns.length} patterns across {existingGroups.length} groups
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddPattern(!showAddPattern)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-accent hover:bg-accent-subtle transition-colors"
          >
            <Plus size={15} />
            Add
          </button>
        </div>

        {showAddPattern && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-surface-2 border border-border-subtle animate-fade-in">
            <input
              value={newPatternName}
              onChange={(e) => setNewPatternName(e.target.value)}
              placeholder="Pattern name..."
              className="flex-1 h-8 px-2 rounded-md border border-border bg-surface-0 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleAddPattern()}
            />
            <input
              value={newPatternGroup}
              onChange={(e) => setNewPatternGroup(e.target.value)}
              placeholder="Group name..."
              list="pattern-groups-add"
              className="w-44 h-8 px-2 rounded-md border border-border bg-surface-0 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
            />
            <datalist id="pattern-groups-add">
              {existingGroups.map((g) => (
                <option key={g} value={g} />
              ))}
            </datalist>
            <button
              onClick={handleAddPattern}
              disabled={!newPatternName.trim() || !newPatternGroup.trim()}
              className="h-8 px-3 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-hover disabled:opacity-40 transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => { setShowAddPattern(false); setNewPatternName(""); setNewPatternGroup(""); }}
              className="w-8 h-8 rounded-md flex items-center justify-center text-text-muted hover:bg-surface-3 transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Grouped display */}
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
          {existingGroups.map((group) => {
            const groupPatterns = patterns.filter((p) => p.group_name === group);
            return (
              <div key={group}>
                <div className="flex items-center justify-between px-3 mb-1 group/header">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                    {group}
                    <span className="ml-1.5 font-normal">({groupPatterns.length})</span>
                  </p>
                  <button
                    onClick={() => handleDeleteGroup(group, groupPatterns.length)}
                    className="opacity-0 group-hover/header:opacity-100 p-1 text-text-muted hover:text-danger hover:bg-danger-subtle rounded transition-all"
                    title={`Delete group "${group}" and all its patterns`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <div className="space-y-0.5">
                  {groupPatterns.map((p) => (
                    <PatternRow
                      key={p.id}
                      pattern={p}
                      existingGroups={existingGroups}
                      onUpdate={loadPatterns}
                      onDelete={loadPatterns}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {patterns.length === 0 && (
          <p className="text-sm text-text-muted text-center py-4">
            No patterns configured. Restart the app to restore defaults, or add your own.
          </p>
        )}
      </section>

      {/* ──────────────────────────────────────────────────
          SECTION 4: Data Management
          ────────────────────────────────────────────────── */}
      <section className="bg-surface-1 border border-border rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-success-subtle flex items-center justify-center text-success">
            <HardDrive size={16} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Data Management</h2>
            <p className="text-xs text-text-muted">Export, import, and manage your database</p>
          </div>
        </div>

        {/* Stats */}
        {dataStats && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: "Problems", value: dataStats.problems },
              { label: "Patterns", value: dataStats.patterns },
              { label: "Platforms", value: dataStats.platforms },
              { label: "Contests", value: dataStats.contests },
              { label: "Revisions", value: dataStats.revisions },
            ].map((stat) => (
              <div key={stat.label} className="bg-surface-2 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-text-primary tabular-nums">{stat.value}</p>
                <p className="text-[11px] text-text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Export / Import buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border border-border bg-surface-2 text-sm font-medium text-text-primary hover:border-accent hover:bg-accent-subtle transition-colors disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <FileSpreadsheet size={16} className="text-accent" />
            )}
            {exporting ? "Exporting..." : "Export to Excel"}
          </button>
          <button
            onClick={handleImport}
            disabled={importing}
            className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border border-border bg-surface-2 text-sm font-medium text-text-primary hover:border-accent hover:bg-accent-subtle transition-colors disabled:opacity-50"
          >
            {importing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Upload size={16} className="text-accent" />
            )}
            {importing ? "Importing..." : "Import from Excel"}
          </button>
        </div>

        <p className="text-xs text-text-muted">
          Export creates an Excel (.xlsx) workbook of your entire database. Import replaces all existing data with the spreadsheet contents.
        </p>

        {/* ---- Danger Zone ---- */}
        <div className="mt-2 border border-danger/20 rounded-xl p-5 space-y-3 bg-danger-subtle/30">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-danger" />
            <h3 className="text-sm font-semibold text-danger">Danger Zone</h3>
          </div>
          <p className="text-xs text-text-secondary">
            This will permanently delete all your problems, patterns, platforms, contests, and revision history.
            Default data will be restored on the next app restart.
          </p>
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-danger/40 text-sm font-medium text-danger hover:bg-danger hover:text-white hover:border-danger transition-colors"
            >
              <AlertTriangle size={15} />
              Reset All Data
            </button>
          ) : (
            <div className="space-y-2 animate-fade-in">
              <p className="text-xs text-text-secondary">
                Type <strong className="text-danger">RESET</strong> to confirm:
              </p>
              <div className="flex items-center gap-2">
                <input
                  value={resetText}
                  onChange={(e) => setResetText(e.target.value)}
                  placeholder="Type RESET"
                  className="w-32 h-8 px-2 rounded-md border border-danger/40 bg-surface-0 text-sm text-text-primary focus:outline-none focus:border-danger"
                  autoFocus
                />
                <button
                  onClick={handleReset}
                  disabled={resetText !== "RESET"}
                  className="h-8 px-4 rounded-md bg-danger text-white text-sm font-medium disabled:opacity-40 transition-colors hover:bg-danger/90"
                >
                  Confirm Reset
                </button>
                <button
                  onClick={() => { setConfirmReset(false); setResetText(""); }}
                  className="h-8 px-3 rounded-md text-sm text-text-muted hover:bg-surface-3 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────
          Footer: Version Info
          ────────────────────────────────────────────────── */}
      <div className="text-center py-4">
        <p className="text-xs text-text-muted">
          <Database size={12} className="inline-block mr-1 -mt-px" />
          Second Brain v0.1.0 · SQLite Database · Tauri 2
        </p>
      </div>
    </div>
  );
}
