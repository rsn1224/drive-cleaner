import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useScanActions } from "./useScanActions";

describe("useScanActions", () => {
  const mockHooks = {
    setMode: vi.fn(),
    handleScanDuplicates: vi.fn(),
    handleScanLargeFiles: vi.fn(),
    handleScanEmptyFolders: vi.fn(),
    handleScanOldFiles: vi.fn(),
    handleAnalyzeFileTypes: vi.fn(),
    handleAnalyzeDiskUsage: vi.fn(),
    handleScanTempFiles: vi.fn(),
  };

  it("returns 7 action functions", () => {
    const { result } = renderHook(() => useScanActions(mockHooks));
    
    expect(Object.keys(result.current)).toHaveLength(7);
    expect(typeof result.current.scanLargeFiles).toBe("function");
    expect(typeof result.current.scanEmptyFolders).toBe("function");
    expect(typeof result.current.scanOldFiles).toBe("function");
    expect(typeof result.current.scanFileTypes).toBe("function");
    expect(typeof result.current.scanDiskUsage).toBe("function");
    expect(typeof result.current.scanTempFiles).toBe("function");
    expect(typeof result.current.scanDuplicates).toBe("function");
  });

  it("scanLargeFiles calls setMode and handleScanLargeFiles", () => {
    const { result } = renderHook(() => useScanActions(mockHooks));
    
    result.current.scanLargeFiles();
    
    expect(mockHooks.setMode).toHaveBeenCalledWith("large_files");
    expect(mockHooks.handleScanLargeFiles).toHaveBeenCalledTimes(1);
  });

  it("scanEmptyFolders calls setMode and handleScanEmptyFolders", () => {
    const { result } = renderHook(() => useScanActions(mockHooks));
    
    result.current.scanEmptyFolders();
    
    expect(mockHooks.setMode).toHaveBeenCalledWith("empty_folders");
    expect(mockHooks.handleScanEmptyFolders).toHaveBeenCalledTimes(1);
  });

  it("scanOldFiles calls setMode and handleScanOldFiles", () => {
    const { result } = renderHook(() => useScanActions(mockHooks));
    
    result.current.scanOldFiles();
    
    expect(mockHooks.setMode).toHaveBeenCalledWith("old_files");
    expect(mockHooks.handleScanOldFiles).toHaveBeenCalledTimes(1);
  });

  it("scanFileTypes calls setMode and handleAnalyzeFileTypes", () => {
    const { result } = renderHook(() => useScanActions(mockHooks));
    
    result.current.scanFileTypes();
    
    expect(mockHooks.setMode).toHaveBeenCalledWith("file_types");
    expect(mockHooks.handleAnalyzeFileTypes).toHaveBeenCalledTimes(1);
  });

  it("scanDiskUsage calls setMode and handleAnalyzeDiskUsage", () => {
    const { result } = renderHook(() => useScanActions(mockHooks));
    
    result.current.scanDiskUsage();
    
    expect(mockHooks.setMode).toHaveBeenCalledWith("disk_usage");
    expect(mockHooks.handleAnalyzeDiskUsage).toHaveBeenCalledTimes(1);
  });

  it("scanTempFiles calls setMode and handleScanTempFiles", () => {
    const { result } = renderHook(() => useScanActions(mockHooks));
    
    result.current.scanTempFiles();
    
    expect(mockHooks.setMode).toHaveBeenCalledWith("temp_cleaner");
    expect(mockHooks.handleScanTempFiles).toHaveBeenCalledTimes(1);
  });

  it("scanDuplicates calls setMode and handleScanDuplicates", () => {
    const { result } = renderHook(() => useScanActions(mockHooks));
    
    result.current.scanDuplicates();
    
    expect(mockHooks.setMode).toHaveBeenCalledWith("duplicates");
    expect(mockHooks.handleScanDuplicates).toHaveBeenCalledTimes(1);
  });
});
