// ==========================================
// Error Boundary Component
// ==========================================

import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

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
        <div className="h-screen bg-[#0a0a0a] flex items-center justify-center">
          <div className="text-center space-y-4">
            <AlertTriangle className="mx-auto text-[#f87171]" size={48} />
            <h2 className="text-xl font-bold text-white">
              予期せぬエラーが発生しました
            </h2>
            <p className="text-sm text-[#6b7280] font-mono max-w-md">
              {this.state.error?.message}
            </p>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="bg-[#6366f1] hover:bg-indigo-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
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
