// ============================================================
// ERROR BOUNDARY — Second Brain
// Catches React rendering errors and shows a recovery UI
// ============================================================

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Props {
  children: ReactNode;
  /** Optional fallback component */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-danger-subtle flex items-center justify-center text-danger mb-5">
            <AlertTriangle size={28} />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-text-muted max-w-md mb-2">
            An unexpected error occurred while rendering this page.
          </p>
          {this.state.error && (
            <pre className="text-xs text-text-muted bg-surface-2 rounded-lg px-4 py-2 max-w-lg overflow-x-auto mb-5 border border-border">
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
          >
            <RefreshCcw size={16} />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
