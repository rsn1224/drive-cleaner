import { describe, expect, it, vi } from "vitest";
import { buildQuickActions } from "./quickActions";
import type { ScanActions } from "../hooks/useScanActions";

describe("buildQuickActions", () => {
  const mockScanActions: ScanActions = {
    scanLargeFiles: vi.fn(),
    scanEmptyFolders: vi.fn(),
    scanOldFiles: vi.fn(),
    scanFileTypes: vi.fn(),
    scanDiskUsage: vi.fn(),
    scanTempFiles: vi.fn(),
    scanDuplicates: vi.fn(),
  };

  it("returns 7 actions", () => {
    const actions = buildQuickActions(mockScanActions);
    expect(actions).toHaveLength(7);
  });

  it("each action has required properties", () => {
    const actions = buildQuickActions(mockScanActions);
    
    actions.forEach((action) => {
      expect(action).toHaveProperty("id");
      expect(action).toHaveProperty("icon");
      expect(action).toHaveProperty("label");
      expect(action).toHaveProperty("description");
      expect(action).toHaveProperty("color");
      expect(action).toHaveProperty("onClick");
      expect(typeof action.onClick).toBe("function");
    });
  });

  it("onClick calls corresponding scanAction", () => {
    const actions = buildQuickActions(mockScanActions);
    
    actions[0].onClick(); // large_files
    expect(mockScanActions.scanLargeFiles).toHaveBeenCalledTimes(1);
    
    actions[1].onClick(); // empty_folders
    expect(mockScanActions.scanEmptyFolders).toHaveBeenCalledTimes(1);
    
    actions[2].onClick(); // old_files
    expect(mockScanActions.scanOldFiles).toHaveBeenCalledTimes(1);
    
    actions[3].onClick(); // file_types
    expect(mockScanActions.scanFileTypes).toHaveBeenCalledTimes(1);
    
    actions[4].onClick(); // disk_usage
    expect(mockScanActions.scanDiskUsage).toHaveBeenCalledTimes(1);
    
    actions[5].onClick(); // temp_cleaner
    expect(mockScanActions.scanTempFiles).toHaveBeenCalledTimes(1);
    
    actions[6].onClick(); // duplicates
    expect(mockScanActions.scanDuplicates).toHaveBeenCalledTimes(1);
  });

  it("has correct action IDs", () => {
    const actions = buildQuickActions(mockScanActions);
    const ids = actions.map((action) => action.id);
    
    expect(ids).toEqual([
      "large_files",
      "empty_folders",
      "old_files",
      "file_types",
      "disk_usage",
      "temp_cleaner",
      "duplicates",
    ]);
  });
});
