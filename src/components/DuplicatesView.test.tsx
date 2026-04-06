// @AC AC-DuplicatesView
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DuplicatesView } from "./DuplicatesView";

const baseProps = {
  duplicates: [],
  scanning: false,
  scanProgress: null,
  totalSaveable: 0,
  onPreview: vi.fn(),
  onDelete: vi.fn(),
  onBulkDelete: vi.fn(),
  onBulkDeleteSelected: vi.fn(),
  onExportJson: vi.fn(),
  onExportCsv: vi.fn(),
};

describe("DuplicatesView", () => {
  it("スキャン中にスピナーを表示する", () => {
    render(
      <DuplicatesView
        {...baseProps}
        scanning={true}
        scanProgress={{ phase: "スキャン中...", scanned_files: 0 }}
      />,
    );
    expect(document.querySelector(".animate-spin")).toBeTruthy();
  });

  it("重複なしで空メッセージを表示する", () => {
    render(<DuplicatesView {...baseProps} scanning={false} />);
    expect(screen.getByText(/重複/)).toBeTruthy();
  });
});
