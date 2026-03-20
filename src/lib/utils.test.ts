import { describe, expect, it } from "vitest";
import { formatSize, formatDate, getParentPath } from "./utils";

describe("formatSize", () => {
  it("formats bytes", () => {
    expect(formatSize(0)).toBe("0 B");
    expect(formatSize(512)).toBe("512 B");
  });

  it("formats kilobytes", () => {
    expect(formatSize(1024)).toBe("1.0 KB");
    expect(formatSize(1536)).toBe("1.5 KB");
  });

  it("formats megabytes", () => {
    expect(formatSize(1048576)).toBe("1.0 MB");
  });

  it("formats gigabytes", () => {
    expect(formatSize(1073741824)).toBe("1.0 GB");
  });
});

describe("formatDate", () => {
  it("formats ISO date string", () => {
    expect(formatDate("2024-01-15T10:30:00")).toBe("2024/01/15");
  });

  it("formats date with single digit month/day", () => {
    expect(formatDate("2024-03-05T00:00:00")).toBe("2024/03/05");
  });
});

describe("getParentPath", () => {
  it("returns parent of nested path", () => {
    expect(getParentPath("C:\\Users\\test")).toBe("C:\\Users");
  });

  it("returns parent for unix paths", () => {
    expect(getParentPath("/home/user/docs")).toBe("/home/user");
  });
});
