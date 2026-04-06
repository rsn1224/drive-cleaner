// @AC AC-EmptyFoldersView
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EmptyFoldersView } from "./EmptyFoldersView";

const baseProps = {
  emptyFolders: [],
  scanning: false,
  scanProgress: null,
  onDelete: vi.fn(),
  onDeleteAll: vi.fn(),
};

describe("EmptyFoldersView", () => {
  it("スキャン中にスピナーを表示する", () => {
    render(
      <EmptyFoldersView
        {...baseProps}
        scanning={true}
        scanProgress={{ phase: "スキャン中...", scanned_files: 0 }}
      />,
    );
    expect(document.querySelector(".animate-spin")).toBeTruthy();
  });

  it("フォルダなしで空メッセージを表示する", () => {
    render(<EmptyFoldersView {...baseProps} scanning={false} />);
    expect(screen.getByText(/フォルダ|見つかり/)).toBeTruthy();
  });
});
