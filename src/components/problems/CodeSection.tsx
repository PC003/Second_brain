// ============================================================
// CODE SECTION — Second Brain
// Syntax-highlighted code editor for forms, rendered view for detail
// ============================================================

import CodeEditor from "@uiw/react-textarea-code-editor";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import type { CodeLanguage } from "../../types";
import { CODE_LANGUAGE_CONFIG } from "../../utils/constants";

interface CodeEditorSectionProps {
  code: string;
  language: CodeLanguage;
  onCodeChange: (code: string) => void;
  onLanguageChange: (lang: CodeLanguage) => void;
}

/** Code editor with language selector for use in forms */
export function CodeEditorSection({
  code,
  language,
  onCodeChange,
  onLanguageChange,
}: CodeEditorSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-text-secondary">Code</label>
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value as CodeLanguage)}
          className="h-8 px-3 rounded-md border border-border bg-surface-2 text-sm text-text-primary focus:outline-none focus:border-accent"
        >
          {Object.entries(CODE_LANGUAGE_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>
              {config.label}
            </option>
          ))}
        </select>
      </div>
      <div className="rounded-lg overflow-hidden border border-border">
        <CodeEditor
          value={code}
          language={CODE_LANGUAGE_CONFIG[language]?.extension || "txt"}
          placeholder="Paste your solution code here..."
          onChange={(e) => onCodeChange(e.target.value)}
          padding={16}
          data-color-mode="dark"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            backgroundColor: "var(--surface-0)",
            minHeight: 200,
          }}
        />
      </div>
    </div>
  );
}

interface CodeViewerProps {
  code: string;
  language: CodeLanguage;
}

/** Syntax-highlighted code viewer with copy button for detail pages */
export function CodeViewer({ code, language }: CodeViewerProps) {
  const [copied, setCopied] = useState(false);

  if (!code || !code.trim()) return null;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
          Code
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted px-2 py-0.5 rounded bg-surface-2">
            {CODE_LANGUAGE_CONFIG[language]?.label || language}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-text-muted hover:text-text-secondary hover:bg-surface-2 transition-colors"
          >
            {copied ? (
              <>
                <Check size={13} className="text-success" />
                Copied
              </>
            ) : (
              <>
                <Copy size={13} />
                Copy
              </>
            )}
          </button>
        </div>
      </div>
      <div className="rounded-lg overflow-hidden border border-border">
        <CodeEditor
          value={code}
          language={CODE_LANGUAGE_CONFIG[language]?.extension || "txt"}
          readOnly
          padding={16}
          data-color-mode="dark"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            backgroundColor: "var(--surface-0)",
          }}
        />
      </div>
    </div>
  );
}
