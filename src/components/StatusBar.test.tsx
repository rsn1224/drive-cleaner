import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { AppMode } from "../types";
import { StatusBar } from "./StatusBar";

describe("StatusBar", () => {
  const defaultProps = {
    mode: "browse" as AppMode,
    folderCount: 10,
    fileCount: 100,
    totalSize: 1024 * 1024, // 1MB
    duplicatesGroupCount: 0,
    duplicatesFileCount: 0,
    totalSaveable: 0,
    largeFilesCount: 0,
    largeFilesTotalSize: 0,
    emptyFoldersCount: 0,
    oldFilesCount: 0,
    oldFilesTotalSize: 0,
    fileTypesTotal: 0,
    fileTypesCategoryCount: 0,
    diskUsageFileCount: 0,
    diskUsageTotalSize: 0,
    tempFilesCount: 0,
    tempFilesTotalSize: 0,
  };

  it("displays folder and file count in browse mode", () => {
    render(<StatusBar {...defaultProps} />);
    
    expect(screen.getByText("10 フォルダ, 100 ファイル")).toBeInTheDocument();
    expect(screen.getByText("合計: 1.0 MB")).toBeInTheDocument();
  });

  it("displays duplicate count and savings in duplicates mode", () => {
    const duplicateProps = {
      ...defaultProps,
      mode: "duplicates" as AppMode,
      folderCount: 0,
      fileCount: 0,
      totalSize: 0,
      duplicatesGroupCount: 25,
      duplicatesFileCount: 50,
      totalSaveable: 1024 * 1024 * 10, // 10MB
    };
    
    render(<StatusBar {...duplicateProps} />);
    
    expect(screen.getByText("25 グループ, 50 ファイル")).toBeInTheDocument();
    expect(screen.getByText("節約可能: 10.0 MB")).toBeInTheDocument();
  });

  it("displays large files count in large_files mode", () => {
    const largeFilesProps = {
      ...defaultProps,
      mode: "large_files" as AppMode,
      largeFilesCount: 15,
      largeFilesTotalSize: 1024 * 1024 * 5, // 5MB
    };
    
    render(<StatusBar {...largeFilesProps} />);
    
    expect(screen.getByText("15 ファイル")).toBeInTheDocument();
    expect(screen.getByText("合計: 5.0 MB")).toBeInTheDocument();
  });

  it("displays empty folders count in empty_folders mode", () => {
    const emptyFoldersProps = {
      ...defaultProps,
      mode: "empty_folders" as AppMode,
      emptyFoldersCount: 8,
    };
    
    render(<StatusBar {...emptyFoldersProps} />);
    
    expect(screen.getByText("8 空フォルダ")).toBeInTheDocument();
  });

  it("displays old files count in old_files mode", () => {
    const oldFilesProps = {
      ...defaultProps,
      mode: "old_files" as AppMode,
      oldFilesCount: 12,
      oldFilesTotalSize: 1024 * 1024 * 2, // 2MB
    };
    
    render(<StatusBar {...oldFilesProps} />);
    
    expect(screen.getByText("12 ファイル")).toBeInTheDocument();
    expect(screen.getByText("合計: 2.0 MB")).toBeInTheDocument();
  });

  it("displays file types summary in file_types mode", () => {
    const fileTypesProps = {
      ...defaultProps,
      mode: "file_types" as AppMode,
      fileTypesTotal: 200,
      fileTypesCategoryCount: 7,
    };
    
    render(<StatusBar {...fileTypesProps} />);
    
    expect(screen.getByText("200 ファイル, 7 カテゴリ")).toBeInTheDocument();
  });

  it("displays disk usage summary in disk_usage mode", () => {
    const diskUsageProps = {
      ...defaultProps,
      mode: "disk_usage" as AppMode,
      diskUsageFileCount: 300,
      diskUsageTotalSize: 1024 * 1024 * 100, // 100MB
    };
    
    render(<StatusBar {...diskUsageProps} />);
    
    expect(screen.getByText("300 ファイル")).toBeInTheDocument();
    expect(screen.getByText("合計: 100.0 MB")).toBeInTheDocument();
  });

  it("displays temp files summary in temp_cleaner mode", () => {
    const tempCleanerProps = {
      ...defaultProps,
      mode: "temp_cleaner" as AppMode,
      tempFilesCount: 25,
      tempFilesTotalSize: 1024 * 1024, // 1MB
    };
    
    render(<StatusBar {...tempCleanerProps} />);
    
    expect(screen.getByText("25 一時ファイル")).toBeInTheDocument();
    expect(screen.getByText("合計: 1.0 MB")).toBeInTheDocument();
  });

  it("formats large file sizes correctly", () => {
    const largeSizeProps = {
      ...defaultProps,
      totalSize: 1024 * 1024 * 1024, // 1GB
    };
    
    render(<StatusBar {...largeSizeProps} />);
    
    expect(screen.getByText("合計: 1.0 GB")).toBeInTheDocument();
  });

  it("displays primary color for total size in browse mode", () => {
    render(<StatusBar {...defaultProps} />);
    
    const totalSizeElement = screen.getByText("合計: 1.0 MB");
    expect(totalSizeElement).toHaveClass("text-primary");
  });

  it("displays primary color for savings in duplicates mode", () => {
    const duplicateProps = {
      ...defaultProps,
      mode: "duplicates" as AppMode,
      duplicatesGroupCount: 10,
      duplicatesFileCount: 20,
      totalSaveable: 1024 * 1024,
    };
    
    render(<StatusBar {...duplicateProps} />);
    
    const savingsElement = screen.getByText("節約可能: 1.0 MB");
    expect(savingsElement).toHaveClass("text-primary");
  });
});
