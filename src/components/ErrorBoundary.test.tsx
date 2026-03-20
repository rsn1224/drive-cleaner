import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from "./ErrorBoundary";

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div>No error</div>;
};

describe("ErrorBoundary", () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  afterEach(() => {
    console.error = originalError;
  });

  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText("No error")).toBeInTheDocument();
  });

  it("displays error message when error occurs", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText("予期せぬエラーが発生しました")).toBeInTheDocument();
    expect(screen.getByText("Test error")).toBeInTheDocument();
  });

  it("displays error icon", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    const errorIcon = document.querySelector("svg");
    expect(errorIcon).toBeInTheDocument();
  });

  it("displays reload button", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    const reloadButton = screen.getByRole("button");
    expect(reloadButton).toBeInTheDocument();
    expect(screen.getByText("アプリをリロード")).toBeInTheDocument();
  });

  it("applies HUD styling to error message", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    const errorMessage = screen.getByText("予期せぬエラーが発生しました");
    expect(errorMessage).toHaveClass("text-error");
    expect(errorMessage).toHaveClass("hud-label");
  });

  it("applies HUD styling to reload button", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    const reloadButton = screen.getByRole("button");
    expect(reloadButton).toHaveClass("text-primary");
    expect(reloadButton).toHaveClass("border-primary/40");
  });

  it("displays error message in monospace font", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    const errorText = screen.getByText("Test error");
    expect(errorText).toHaveClass("font-mono");
  });
});
