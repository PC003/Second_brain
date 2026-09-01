// ============================================================
// MARKDOWN SECTION — Second Brain
// Markdown editor (for editing) or rendered view (for detail page)
// Uses @uiw/react-md-editor for editing, react-markdown for viewing
// ============================================================

import { useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";

interface MarkdownEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

/** Markdown editor with preview toggle for use in forms */
export function MarkdownEditor({
  label,
  value,
  onChange,
  placeholder,
  minHeight = 200,
}: MarkdownEditorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-text-secondary">{label}</label>
      <div data-color-mode="dark">
        <MDEditor
          value={value}
          onChange={(val) => onChange(val || "")}
          preview="edit"
          height={minHeight}
          textareaProps={{ placeholder: placeholder || `Write your ${label.toLowerCase()} here...` }}
          style={{
            backgroundColor: "var(--surface-2)",
            borderRadius: "0.5rem",
            border: "1px solid var(--border-color)",
          }}
        />
      </div>
    </div>
  );
}

interface MarkdownViewerProps {
  label: string;
  content: string;
  collapsible?: boolean;
}

/** Rendered markdown viewer for detail pages */
export function MarkdownViewer({ label, content, collapsible = false }: MarkdownViewerProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (!content || !content.trim()) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
          {label}
        </h3>
        {collapsible && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-xs text-text-muted hover:text-text-secondary transition-colors"
          >
            {collapsed ? "Show" : "Hide"}
          </button>
        )}
      </div>
      {!collapsed && (
        <div className="markdown-content text-text-primary text-sm leading-relaxed">
          <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{content}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
