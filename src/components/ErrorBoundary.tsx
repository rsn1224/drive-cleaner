// ==========================================
// Error Boundary Component
// ==========================================

import { AlertTriangle } from "lucide-react";
import { Component, type ReactNode } from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="h-screen bg-black flex items-center justify-center">
          <div className="text-center space-y-4">
            <AlertTriangle className="mx-auto text-error" size={48} />
            <h2 className="text-xl font-bold text-error hud-label tracking-widest">
              予期せぬエラーが発生しました
            </h2>
            <p className="text-sm text-white/40 font-mono max-w-md">
              {this.state.error?.message}
            </p>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/40 px-6 py-2 text-sm font-medium transition-colors"
            >
              アプリをリロード
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
