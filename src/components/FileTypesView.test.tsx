// @AC AC-FileTypesView
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FileTypesView } from "./FileTypesView";

const baseProps = {
  analysis: null,
  scanning: false,
  scanProgress: null,
};

describe("FileTypesView", () => {
  it("スキャン中にスピナーを表示する", () => {
    render(
      <FileTypesView
        {...baseProps}
        scanning={true}
        scanProgress={{ phase: "スキャン中...", scanned_files: 0 }}
      />,
    );
    expect(document.querySelector(".animate-spin")).toBeTruthy();
  });

  it("データなしで空メッセージを表示する", () => {
    render(<FileTypesView {...baseProps} scanning={false} />);
    expect(screen.getByText(/ファイル|フォルダ|選択/)).toBeTruthy();
  });
});
