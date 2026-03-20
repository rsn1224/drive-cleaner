import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AppMode } from "../../types";
import { HudHeader } from "./HudHeader";

describe("HudHeader", () => {
  const mockOnBack = vi.fn();

  it("displays DRIVE_CLEANER title", () => {
    render(<HudHeader mode="browse" onBack={mockOnBack} />);
    
    expect(screen.getByText("DRIVE_CLEANER")).toBeInTheDocument();
  });

  it("hides back button in browse mode", () => {
    render(<HudHeader mode="browse" onBack={mockOnBack} />);
    
    const backButton = screen.queryByTestId("back-button");
    expect(backButton).not.toBeInTheDocument();
  });

  it("shows back button in non-browse modes", () => {
    render(<HudHeader mode="large_files" onBack={mockOnBack} />);
    
    const backButton = screen.getByTestId("back-button");
    expect(backButton).toBeInTheDocument();
  });

  it("calls onBack when back button is clicked", async () => {
    render(<HudHeader mode="large_files" onBack={mockOnBack} />);
    
    const backButton = screen.getByTestId("back-button");
    await backButton.click();
    
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it("displays correct mode labels", () => {
    const testCases: [AppMode, string][] = [
      ["browse", "FILE_BROWSER"],
      ["large_files", "LARGE_FILE_SCAN"],
      ["empty_folders", "EMPTY_FOLDER_SCAN"],
      ["old_files", "OLD_FILE_SCAN"],
      ["file_types", "FILE_TYPE_ANALYSIS"],
      ["disk_usage", "DISK_USAGE_ANALYSIS"],
      ["temp_cleaner", "TEMP_CLEANER"],
      ["duplicates", "DUPLICATE_SCAN"],
    ];

    testCases.forEach(([mode, expectedLabel]) => {
      const { unmount } = render(<HudHeader mode={mode} onBack={mockOnBack} />);
      
      expect(screen.getByText(expectedLabel)).toBeInTheDocument();
      unmount();
    });
  });

  it("displays terminal icon", () => {
    render(<HudHeader mode="browse" onBack={mockOnBack} />);
    
    const terminalIcon = document.querySelector(".material-symbols-outlined");
    expect(terminalIcon).toBeInTheDocument();
    expect(terminalIcon).toHaveTextContent("terminal");
  });

  it("displays window control buttons", () => {
    render(<HudHeader mode="browse" onBack={mockOnBack} />);
    
    const windowControls = document.querySelectorAll('[class*="rounded-full"]');
    expect(windowControls).toHaveLength(3);
  });
});
