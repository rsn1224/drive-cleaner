// @AC AC-OldFilesView
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { OldFilesView } from "./OldFilesView";

const baseProps = {
  oldFiles: [],
  scanning: false,
  scanProgress: null,
  totalSize: 0,
  onPreview: vi.fn(),
  onDelete: vi.fn(),
};

describe("OldFilesView", () => {
  it("スキャン中にスピナーを表示する", () => {
    render(
      <OldFilesView
        {...baseProps}
        scanning={true}
        scanProgress={{ phase: "スキャン中...", scanned_files: 0 }}
      />,
    );
    expect(document.querySelector(".animate-spin")).toBeTruthy();
  });

  it("ファイルなしで空メッセージを表示する", () => {
    render(<OldFilesView {...baseProps} scanning={false} />);
    expect(screen.getByText(/ファイル|見つかり/)).toBeTruthy();
  });
});
