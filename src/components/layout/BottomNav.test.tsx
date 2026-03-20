import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BottomNav } from "./BottomNav";

describe("BottomNav", () => {
  const mockOnTabChange = vi.fn();

  it("renders 4 tabs", () => {
    render(<BottomNav activeTab="dashboard" onTabChange={mockOnTabChange} hidden={false} />);
    
    const tabs = screen.getAllByRole("button");
    expect(tabs).toHaveLength(4);
  });

  it("highlights active tab", () => {
    render(<BottomNav activeTab="dashboard" onTabChange={mockOnTabChange} hidden={false} />);
    
    const dashboardTab = screen.getByText("DASHBOARD");
    expect(dashboardTab.parentElement).toHaveClass("text-primary");
    
    const filesTab = screen.getByText("FILES");
    expect(filesTab.parentElement).toHaveClass("text-white/40");
  });

  it("calls onTabChange when tab is clicked", async () => {
    render(<BottomNav activeTab="dashboard" onTabChange={mockOnTabChange} hidden={false} />);
    
    const filesTab = screen.getByText("FILES");
    await filesTab.click();
    
    expect(mockOnTabChange).toHaveBeenCalledWith("files");
  });

  it("renders nothing when hidden", () => {
    const { container } = render(<BottomNav activeTab="dashboard" onTabChange={mockOnTabChange} hidden={true} />);
    
    expect(container.firstChild).toBeNull();
  });

  it("displays tab icons", () => {
    render(<BottomNav activeTab="dashboard" onTabChange={mockOnTabChange} hidden={false} />);
    
    const icons = document.querySelectorAll(".material-symbols-outlined");
    expect(icons).toHaveLength(4);
  });

  it("displays correct tab labels", () => {
    render(<BottomNav activeTab="dashboard" onTabChange={mockOnTabChange} hidden={false} />);
    
    expect(screen.getByText("DASHBOARD")).toBeInTheDocument();
    expect(screen.getByText("FILES")).toBeInTheDocument();
    expect(screen.getByText("CONFIG")).toBeInTheDocument();
    expect(screen.getByText("LOGS")).toBeInTheDocument();
  });

  it("shows active tab underline", () => {
    render(<BottomNav activeTab="dashboard" onTabChange={mockOnTabChange} hidden={false} />);
    
    const activeUnderline = document.querySelector(".bg-primary");
    expect(activeUnderline).toBeInTheDocument();
  });

  it("switches active tab correctly", () => {
    const { rerender } = render(<BottomNav activeTab="dashboard" onTabChange={mockOnTabChange} hidden={false} />);
    
    expect(screen.getByText("DASHBOARD").parentElement).toHaveClass("text-primary");
    expect(screen.getByText("FILES").parentElement).toHaveClass("text-white/40");
    
    rerender(<BottomNav activeTab="files" onTabChange={mockOnTabChange} hidden={false} />);
    
    expect(screen.getByText("DASHBOARD").parentElement).toHaveClass("text-white/40");
    expect(screen.getByText("FILES").parentElement).toHaveClass("text-primary");
  });
});
