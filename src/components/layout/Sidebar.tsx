// ============================================================
// SIDEBAR — Second Brain
// Collapsible navigation with DSA, CP, Revision, Analytics sections
// ============================================================

import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  Plus,
  BookOpen,
  Code2,
  Trophy,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  RefreshCcw,
  Brain,
  Swords,
  Layers,
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  indent?: boolean;
}

function NavItem({ to, icon, label, collapsed, indent }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150
        ${indent && !collapsed ? "ml-4" : ""}
        ${
          isActive
            ? "bg-accent-subtle text-accent"
            : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
        }`
      }
    >
      <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}

interface NavSectionProps {
  title: string;
  icon: React.ReactNode;
  collapsed: boolean;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function NavSection({ title, icon, collapsed, children, defaultOpen = true }: NavSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const location = useLocation();

  // Auto-open section if a child route is active
  const isChildActive = location.pathname.startsWith(
    title.toLowerCase() === "dsa" ? "/dsa" : title.toLowerCase() === "competitive" ? "/cp" : "/__none__"
  );

  const isOpen = open || isChildActive;

  if (collapsed) {
    return <div className="space-y-1">{children}</div>;
  }

  return (
    <div className="space-y-0.5">
      <button
        onClick={() => setOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 w-full text-xs font-semibold uppercase tracking-wider text-text-muted hover:text-text-secondary transition-colors"
      >
        <span className="w-4 h-4 flex items-center justify-center">{icon}</span>
        <span className="flex-1 text-left">{title}</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-150 ${isOpen ? "" : "-rotate-90"}`}
        />
      </button>
      {isOpen && <div className="space-y-0.5">{children}</div>}
    </div>
  );
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={`sidebar-transition flex flex-col h-screen bg-surface-1 border-r border-border ${
        collapsed ? "w-[var(--sidebar-collapsed-width)]" : "w-[var(--sidebar-width)]"
      }`}
    >
      {/* ---- Logo / Header ---- */}
      <div className="flex items-center h-[var(--topbar-height)] px-4 border-b border-border-subtle">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
            <Brain size={18} className="text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-text-primary truncate">Second Brain</h1>
              <p className="text-[10px] text-text-muted truncate">DSA & CP Knowledge Base</p>
            </div>
          )}
        </div>
      </div>

      {/* ---- Navigation ---- */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {/* Home */}
        <div className="space-y-0.5">
          <NavItem to="/" icon={<Home size={18} />} label="Dashboard" collapsed={collapsed} />
          <NavItem
            to="/add-problem"
            icon={<Plus size={18} />}
            label="Add Problem"
            collapsed={collapsed}
          />
        </div>

        {/* DSA Section */}
        <NavSection title="DSA" icon={<BookOpen size={14} />} collapsed={collapsed}>
          <NavItem
            to="/dsa/all"
            icon={<Layers size={18} />}
            label="All Problems"
            collapsed={collapsed}
            indent
          />
          <NavItem
            to="/dsa/leetcode"
            icon={<Code2 size={18} />}
            label="LeetCode"
            collapsed={collapsed}
            indent
          />
          <NavItem
            to="/dsa/other"
            icon={<BookOpen size={18} />}
            label="Other"
            collapsed={collapsed}
            indent
          />
          <NavItem
            to="/dsa/patterns"
            icon={<Swords size={18} />}
            label="Patterns"
            collapsed={collapsed}
            indent
          />
        </NavSection>

        {/* CP Section */}
        <NavSection title="Competitive" icon={<Trophy size={14} />} collapsed={collapsed}>
          <NavItem
            to="/cp/all"
            icon={<Layers size={18} />}
            label="All Problems"
            collapsed={collapsed}
            indent
          />
          <NavItem
            to="/cp/codeforces"
            icon={<Code2 size={18} />}
            label="Codeforces"
            collapsed={collapsed}
            indent
          />
          <NavItem
            to="/cp/codechef"
            icon={<Code2 size={18} />}
            label="CodeChef"
            collapsed={collapsed}
            indent
          />
          <NavItem
            to="/cp/atcoder"
            icon={<Code2 size={18} />}
            label="AtCoder"
            collapsed={collapsed}
            indent
          />
          <NavItem
            to="/cp/other"
            icon={<BookOpen size={18} />}
            label="Other"
            collapsed={collapsed}
            indent
          />
          <NavItem
            to="/cp/contests"
            icon={<Trophy size={18} />}
            label="Contests"
            collapsed={collapsed}
            indent
          />
        </NavSection>

        {/* Revision */}
        <div className="space-y-0.5">
          <NavItem
            to="/revision"
            icon={<RefreshCcw size={18} />}
            label="Revision"
            collapsed={collapsed}
          />
        </div>

        {/* Analytics */}
        <div className="space-y-0.5">
          <NavItem
            to="/analytics"
            icon={<BarChart3 size={18} />}
            label="Analytics"
            collapsed={collapsed}
          />
        </div>
      </nav>

      {/* ---- Bottom ---- */}
      <div className="border-t border-border-subtle px-2 py-2 space-y-0.5">
        <NavItem
          to="/settings"
          icon={<Settings size={18} />}
          label="Settings"
          collapsed={collapsed}
        />

        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-text-muted hover:bg-surface-2 hover:text-text-secondary transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span className="w-5 h-5 flex items-center justify-center">
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </span>
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
